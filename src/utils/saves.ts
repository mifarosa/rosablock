import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GameMode } from '../constants/modes';
import { MODES } from '../constants/modes';
import {
  BOARD_COLS,
  BOARD_ROWS,
  TETROMINO_TYPES,
  type Rotation,
  type TetrominoType,
} from '../constants/tetrominos';
import {
  collides,
  finishClear,
  type ActivePiece,
  type Cell,
  type GameState,
  type Grid,
} from '../hooks/useTetris';

// One saved game per mode, so every mode can be resumed independently.
const saveKey = (mode: GameMode) => `rosablock:save:${mode}:v1`;

export type SavedGames = Partial<Record<GameMode, GameState>>;

const isFiniteNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isType = (v: unknown): v is TetrominoType =>
  typeof v === 'string' && (TETROMINO_TYPES as readonly string[]).includes(v);

function parseGrid(raw: unknown): Grid | null {
  if (!Array.isArray(raw) || raw.length !== BOARD_ROWS) return null;
  const grid: Grid = [];
  for (const row of raw) {
    if (!Array.isArray(row) || row.length !== BOARD_COLS) return null;
    const cells: Cell[] = [];
    for (const cell of row) {
      if (cell !== null && !isType(cell)) return null;
      cells.push(cell);
    }
    grid.push(cells);
  }
  return grid;
}

function parsePiece(raw: unknown, grid: Grid): ActivePiece | null | undefined {
  if (raw === null) return null;
  if (typeof raw !== 'object' || raw === undefined) return undefined;
  const p = raw as Record<string, unknown>;
  if (!isType(p.type)) return undefined;
  if (p.rotation !== 0 && p.rotation !== 1 && p.rotation !== 2 && p.rotation !== 3) return undefined;
  if (!Number.isInteger(p.row) || !Number.isInteger(p.col)) return undefined;
  const piece: ActivePiece = {
    type: p.type,
    rotation: p.rotation as Rotation,
    row: p.row as number,
    col: p.col as number,
  };
  // A piece that overlaps the stack means the save is damaged.
  return collides(grid, piece.type, piece.rotation, piece.row, piece.col) ? undefined : piece;
}

/**
 * Turns stored JSON back into a game, or null if it is damaged or from another mode.
 * A restored game always comes back paused, so the player gets a moment to get ready.
 */
export function parseSavedGame(raw: unknown, mode: GameMode): GameState | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const s = raw as Record<string, unknown>;
  if (s.mode !== mode) return null;

  const grid = parseGrid(s.grid);
  if (!grid) return null;
  const piece = parsePiece(s.piece, grid);
  if (piece === undefined) return null;
  if (!isType(s.next)) return null;
  if (!Array.isArray(s.bag) || s.bag.length > 6 || !s.bag.every(isType)) return null;
  if (!isFiniteNumber(s.score) || s.score < 0) return null;
  if (!isFiniteNumber(s.lines) || s.lines < 0) return null;
  if (!isFiniteNumber(s.level) || s.level < 1) return null;
  if (!isFiniteNumber(s.elapsedMs) || s.elapsedMs < 0) return null;
  if (s.status !== 'playing' && s.status !== 'paused') return null;
  if (
    !Array.isArray(s.clearingRows) ||
    !s.clearingRows.every((r) => Number.isInteger(r) && r >= 0 && r < BOARD_ROWS)
  ) {
    return null;
  }

  // Fields added later: older saves simply do not have them.
  if (s.held !== undefined && s.held !== null && !isType(s.held)) return null;

  let game: GameState = {
    mode,
    grid,
    piece,
    next: s.next,
    bag: s.bag as TetrominoType[],
    score: s.score,
    lines: s.lines,
    level: s.level,
    elapsedMs: s.elapsedMs,
    status: 'playing',
    clearingRows: s.clearingRows as number[],
    held: isType(s.held) ? s.held : null,
    holdUsed: s.holdUsed === true,
    revived: s.revived === true,
  };
  // Saved in the middle of a line-clear flash: finish it now.
  if (game.clearingRows.length > 0) game = finishClear(game);
  if (game.status === 'over' || game.status === 'finished') return null;
  return { ...game, status: 'paused' };
}

/** A game that has not really started has nothing worth saving. */
export function isPristine(state: GameState): boolean {
  return (
    state.score === 0 &&
    state.lines === 0 &&
    state.elapsedMs < 1000 &&
    state.grid.every((row) => row.every((cell) => cell === null))
  );
}

export async function saveGame(state: GameState): Promise<void> {
  try {
    await AsyncStorage.setItem(saveKey(state.mode), JSON.stringify(state));
  } catch {
    // A save that fails must never interrupt the game.
  }
}

export async function clearGame(mode: GameMode): Promise<void> {
  try {
    await AsyncStorage.removeItem(saveKey(mode));
  } catch {
    // Nothing to do.
  }
}

export async function loadSavedGames(): Promise<SavedGames> {
  const out: SavedGames = {};
  await Promise.all(
    MODES.map(async ({ id }) => {
      try {
        const json = await AsyncStorage.getItem(saveKey(id));
        if (!json) return;
        const game = parseSavedGame(JSON.parse(json), id);
        if (game) out[id] = game;
      } catch {
        // A damaged save is the same as no save.
      }
    }),
  );
  return out;
}
