import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import {
  BOARD_COLS,
  BOARD_ROWS,
  TETROMINO_TYPES,
  getKicks,
  getMatrix,
  type Rotation,
  type TetrominoType,
} from '../constants/tetrominos';
import {
  MARATHON_MAX_LEVEL,
  MARATHON_TARGET_LINES,
  SPRINT_TARGET_LINES,
  ULTRA_DURATION_MS,
  type GameMode,
} from '../constants/modes';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Cell = TetrominoType | null;
export type Grid = Cell[][];

export interface ActivePiece {
  type: TetrominoType;
  rotation: Rotation;
  row: number; // top-left of the piece matrix inside the grid
  col: number;
}

export type GameStatus = 'playing' | 'paused' | 'over' | 'finished';

export interface GameState {
  mode: GameMode;
  grid: Grid;
  piece: ActivePiece | null;
  next: TetrominoType;
  bag: TetrominoType[];
  score: number;
  lines: number;
  level: number;
  elapsedMs: number;
  status: GameStatus;
  /** Rows that are full and being animated away; empty when nothing is clearing. */
  clearingRows: number[];
  /** The piece set aside with "hold", if any. */
  held: TetrominoType | null;
  /** Hold may be used once per piece; this is true until the next piece arrives. */
  holdUsed: boolean;
  /** The one rewarded-ad "continue" of this game has been spent. */
  revived: boolean;
  /** How long (ms) the falling piece has been resting on something; it locks at LOCK_DELAY_MS. */
  restMs: number;
  /** How many times moving or rotating has restarted that timer for this piece. */
  lockResets: number;
  /** Consecutive pieces that cleared rows so far, minus one (-1 = the last piece cleared nothing). */
  combo: number;
  /** The last clear was a Tetris (4 rows), so another one earns the back-to-back bonus. */
  backToBack: boolean;
  /** Counts clears, so the screen can tell a new `lastClear` from the one it already showed. */
  clearSeq: number;
  /** The most recent line clear, for the pop-up text; null until there is one. */
  lastClear: ClearInfo | null;
  /** Counts piece landings, so the screen can tell a new `lastLock` from the one it showed. */
  lockSeq: number;
  /** The most recent landing, for the landing effects; null until there is one. */
  lastLock: LockInfo | null;
}

export interface LockInfo {
  id: number;
  type: TetrominoType;
  /** The landed blocks as [row, col] on the board. */
  cells: [number, number][];
  /** A hard drop leaves a trail from where the piece started. */
  hard: boolean;
  /** Top row of the piece before a hard drop (only meaningful when `hard`). */
  fromRow: number;
}

export interface ClearInfo {
  id: number;
  rows: number;
  /** All points of this clear: rows, combo, back-to-back and perfect clear. */
  points: number;
  /** Consecutive clears before this one (0 = no combo). */
  combo: number;
  backToBack: boolean;
  perfect: boolean;
}

// ---------------------------------------------------------------------------
// Pure game logic (no React, easy to reason about / test)
// ---------------------------------------------------------------------------

const LINE_SCORES = [0, 100, 300, 500, 800];
const PERFECT_CLEAR_SCORES = [0, 800, 1200, 1800, 2000];
const COMBO_BONUS = 50;
const BACK_TO_BACK_FACTOR = 1.5;

/** A piece may rest on the stack this long (ms) before it locks; moving or rotating restarts it. */
export const LOCK_DELAY_MS = 500;
/** ...but only this many times per piece, so a piece cannot be stalled forever. */
export const MAX_LOCK_RESETS = 15;

// Gravity interval (ms per row) for levels 1..15.
const GRAVITY_TABLE = [800, 720, 630, 550, 470, 380, 300, 220, 140, 100, 80, 70, 60, 50, 40];
const ZEN_GRAVITY_MS = 1000;

export function gravityFor(mode: GameMode, level: number): number {
  if (mode === 'zen') return ZEN_GRAVITY_MS;
  const idx = Math.min(Math.max(level, 1), GRAVITY_TABLE.length) - 1;
  return GRAVITY_TABLE[idx]!;
}

export function levelFor(mode: GameMode, lines: number): number {
  if (mode === 'zen') return 1;
  return Math.min(MARATHON_MAX_LEVEL, Math.floor(lines / 10) + 1);
}

/** The pieces coming up, the next one first (the preview shows three). */
export function upcoming(state: Pick<GameState, 'next' | 'bag'>, count = 3): TetrominoType[] {
  return [state.next, ...state.bag].slice(0, count);
}

export function createEmptyGrid(): Grid {
  return Array.from({ length: BOARD_ROWS }, () => new Array<Cell>(BOARD_COLS).fill(null));
}

function shuffled<T>(items: readonly T[], rng: () => number): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = a[i]!;
    a[i] = a[j]!;
    a[j] = tmp;
  }
  return a;
}

/**
 * 7-bag randomizer: every piece appears once per bag of seven. A fresh bag is added before the
 * old one runs out, so the next three pieces are always known and can be shown.
 */
function drawFromBag(bag: TetrominoType[]): { type: TetrominoType; bag: TetrominoType[] } {
  const source = bag.length >= 3 ? bag : [...bag, ...shuffled(TETROMINO_TYPES, Math.random)];
  const [type, ...rest] = source;
  return { type: type!, bag: rest };
}

/** Returns true if the piece at (row, col, rotation) overlaps walls, floor or locked cells. */
export function collides(
  grid: Grid,
  type: TetrominoType,
  rotation: Rotation,
  row: number,
  col: number,
): boolean {
  const matrix = getMatrix(type, rotation);
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r]!.length; c++) {
      if (!matrix[r]![c]) continue;
      const gr = row + r;
      const gc = col + c;
      if (gc < 0 || gc >= BOARD_COLS || gr < 0 || gr >= BOARD_ROWS) return true;
      if (grid[gr]![gc] !== null) return true;
    }
  }
  return false;
}

function spawnPiece(type: TetrominoType): ActivePiece {
  const size = getMatrix(type, 0).length;
  return { type, rotation: 0, row: 0, col: Math.floor((BOARD_COLS - size) / 2) };
}

/** Row where the piece would land if hard-dropped. */
export function getGhostRow(grid: Grid, piece: ActivePiece): number {
  let row = piece.row;
  while (!collides(grid, piece.type, piece.rotation, row + 1, piece.col)) row++;
  return row;
}

/** Removes full rows and pads the top with empty rows. */
export function clearLines(grid: Grid): { grid: Grid; cleared: number } {
  const remaining = grid.filter((row) => row.some((cell) => cell === null));
  const cleared = grid.length - remaining.length;
  const padding = Array.from({ length: cleared }, () => new Array<Cell>(BOARD_COLS).fill(null));
  return { grid: [...padding, ...remaining], cleared };
}

export function createGame(mode: GameMode): GameState {
  const first = drawFromBag([]);
  const second = drawFromBag(first.bag);
  return {
    mode,
    grid: createEmptyGrid(),
    piece: spawnPiece(first.type),
    next: second.type,
    bag: second.bag,
    score: 0,
    lines: 0,
    level: 1,
    elapsedMs: 0,
    status: 'playing',
    clearingRows: [],
    held: null,
    holdUsed: false,
    revived: false,
    restMs: 0,
    lockResets: 0,
    combo: -1,
    backToBack: false,
    clearSeq: 0,
    lastClear: null,
    lockSeq: 0,
    lastLock: null,
  };
}

/** Brings the next piece into play; a blocked spawn ends the game. */
function spawnNext(state: GameState): GameState {
  const piece = spawnPiece(state.next);
  const draw = drawFromBag(state.bag);
  const base: GameState = { ...state, next: draw.type, bag: draw.bag };

  if (!collides(base.grid, piece.type, piece.rotation, piece.row, piece.col)) {
    return { ...base, piece, holdUsed: false, restMs: 0, lockResets: 0 };
  }
  return { ...base, piece: null, status: 'over' };
}

/** How long full rows are shown flashing before they collapse. */
export const CLEAR_ANIM_MS = 300;

/**
 * Locks a piece into the grid. If rows became full they are only marked (`clearingRows`) so the
 * screen can flash them; `finishClear` then removes them and brings the next piece.
 */
function lockPiece(
  state: GameState,
  piece: ActivePiece,
  bonus: number,
  hardFromRow?: number,
): GameState {
  const grid: Grid = state.grid.map((row) => [...row]);
  const matrix = getMatrix(piece.type, piece.rotation);
  const cells: [number, number][] = [];
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r]!.length; c++) {
      if (!matrix[r]![c]) continue;
      grid[piece.row + r]![piece.col + c] = piece.type;
      cells.push([piece.row + r, piece.col + c]);
    }
  }
  const lockInfo: LockInfo = {
    id: state.lockSeq + 1,
    type: piece.type,
    cells,
    hard: hardFromRow !== undefined,
    fromRow: hardFromRow ?? piece.row,
  };

  const fullRows: number[] = [];
  grid.forEach((row, index) => {
    if (row.every((cell) => cell !== null)) fullRows.push(index);
  });

  const locked: GameState = {
    ...state,
    grid,
    piece: null,
    score: state.score + bonus,
    lockSeq: lockInfo.id,
    lastLock: lockInfo,
  };
  if (fullRows.length === 0) return spawnNext({ ...locked, combo: -1 });
  return { ...locked, clearingRows: fullRows };
}

/** Second half of a line clear: removes the flashing rows, scores them and spawns the next piece. */
export function finishClear(state: GameState): GameState {
  if (state.clearingRows.length === 0) return state;

  const result = clearLines(state.grid);
  const cleared = result.cleared;
  const lines = state.lines + cleared;
  const level = levelFor(state.mode, lines);

  // Points: the rows (x level), +50 x level per combo step, x1.5 for a back-to-back Tetris, and a
  // bonus when the board ends up completely empty.
  const backToBack = cleared === 4 && state.backToBack;
  const base = LINE_SCORES[cleared]! * state.level;
  const rowPoints = backToBack ? Math.round(base * BACK_TO_BACK_FACTOR) : base;
  const combo = state.combo + 1;
  const comboPoints = combo > 0 ? COMBO_BONUS * combo * state.level : 0;
  const perfect = result.grid.every((row) => row.every((cell) => cell === null));
  const perfectPoints = perfect ? PERFECT_CLEAR_SCORES[cleared]! * state.level : 0;
  const points = rowPoints + comboPoints + perfectPoints;

  const updated: GameState = {
    ...state,
    grid: result.grid,
    lines,
    score: state.score + points,
    level,
    clearingRows: [],
    combo,
    backToBack: cleared === 4,
    clearSeq: state.clearSeq + 1,
    lastClear: { id: state.clearSeq + 1, rows: cleared, points, combo, backToBack, perfect },
  };

  const sprintDone = state.mode === 'sprint' && lines >= SPRINT_TARGET_LINES;
  const marathonDone = state.mode === 'marathon' && lines >= MARATHON_TARGET_LINES;
  if (sprintDone || marathonDone) return { ...updated, status: 'finished' };

  return spawnNext(updated);
}

/** Whether the falling piece is resting on the floor or the stack. */
function isResting(state: GameState): boolean {
  const p = state.piece;
  return p !== null && collides(state.grid, p.type, p.rotation, p.row + 1, p.col);
}

/**
 * A move or rotation of a resting piece restarts its lock timer (a limited number of times), so
 * there is time to slide it under an overhang or turn it at the last moment.
 */
function afterAdjust(prev: GameState, next: GameState): GameState {
  if (!isResting(prev) || prev.lockResets >= MAX_LOCK_RESETS) return next;
  return { ...next, restMs: 0, lockResets: prev.lockResets + 1 };
}

/**
 * Lock delay: while the piece rests on something, time adds up; when it reaches LOCK_DELAY_MS the
 * piece locks. Called with the time passed since the last update.
 */
export function advanceRest(state: GameState, deltaMs: number): GameState {
  if (state.status !== 'playing' || !state.piece || deltaMs <= 0) return state;
  if (!isResting(state)) return state.restMs === 0 ? state : { ...state, restMs: 0 };
  const restMs = state.restMs + deltaMs;
  if (restMs >= LOCK_DELAY_MS) return lockPiece(state, state.piece, 0);
  return { ...state, restMs };
}

export function movePiece(state: GameState, dCol: number): GameState {
  const p = state.piece;
  if (state.status !== 'playing' || !p) return state;
  if (collides(state.grid, p.type, p.rotation, p.row, p.col + dCol)) return state;
  return afterAdjust(state, { ...state, piece: { ...p, col: p.col + dCol } });
}

/** Rotates with SRS wall kicks. dir: +1 = clockwise, -1 = counter-clockwise. */
export function rotatePiece(state: GameState, dir: 1 | -1): GameState {
  const p = state.piece;
  if (state.status !== 'playing' || !p || p.type === 'O') return state;
  const to = ((p.rotation + dir + 4) % 4) as Rotation;
  for (const [dx, dy] of getKicks(p.type, p.rotation, to)) {
    const row = p.row + dy;
    const col = p.col + dx;
    if (!collides(state.grid, p.type, to, row, col)) {
      return afterAdjust(state, { ...state, piece: { ...p, rotation: to, row, col } });
    }
  }
  return state;
}

/** Gravity tick: move down one row. A resting piece stays: it locks through the lock delay. */
export function stepDown(state: GameState): GameState {
  const p = state.piece;
  if (state.status !== 'playing' || !p) return state;
  if (collides(state.grid, p.type, p.rotation, p.row + 1, p.col)) return state;
  return { ...state, piece: { ...p, row: p.row + 1 }, restMs: 0, lockResets: 0 };
}

/**
 * One step of a held-down drop: moves the piece down a row (+1 point), or, when it is resting on
 * something, locks it. `locked` tells the caller so a held finger does not carry on into the
 * next piece.
 */
export function fastDropStep(state: GameState): { state: GameState; locked: boolean } {
  const p = state.piece;
  if (state.status !== 'playing' || !p) return { state, locked: false };
  if (collides(state.grid, p.type, p.rotation, p.row + 1, p.col)) {
    return { state: lockPiece(state, p, 0), locked: true };
  }
  return {
    state: {
      ...state,
      score: state.score + 1,
      piece: { ...p, row: p.row + 1 },
      restMs: 0,
      lockResets: 0,
    },
    locked: false,
  };
}

/** Instantly drops and locks the piece: +2 points per row travelled. */
export function hardDrop(state: GameState): GameState {
  const p = state.piece;
  if (state.status !== 'playing' || !p) return state;
  const landing = getGhostRow(state.grid, p);
  return lockPiece(state, { ...p, row: landing }, (landing - p.row) * 2, p.row);
}

/** Sets the falling piece aside (or swaps it with the held one). Once per piece. */
export function holdPiece(state: GameState): GameState {
  const p = state.piece;
  if (state.status !== 'playing' || !p || state.holdUsed) return state;

  if (state.held === null) {
    const stashed: GameState = { ...state, held: p.type, piece: null };
    return { ...spawnNext(stashed), holdUsed: true };
  }
  const swapped = spawnPiece(state.held);
  if (collides(state.grid, swapped.type, swapped.rotation, swapped.row, swapped.col)) return state;
  return { ...state, piece: swapped, held: p.type, holdUsed: true, restMs: 0, lockResets: 0 };
}

/** How many rows, counted from the top, the rewarded-ad continue wipes. */
export const REVIVE_CLEAR_ROWS = 10;

export function canRevive(state: GameState): boolean {
  return state.status === 'over' && !state.revived && state.mode !== 'sprint';
}

/**
 * The rewarded-ad continue: clears the top half of the board and brings the next piece.
 * The game comes back paused so the screen can run its 3-2-1 before it starts moving.
 */
export function revive(state: GameState): GameState {
  if (!canRevive(state)) return state;
  const grid: Grid = state.grid.map((row, i) =>
    i < REVIVE_CLEAR_ROWS ? new Array<Cell>(BOARD_COLS).fill(null) : [...row],
  );
  const piece = spawnPiece(state.next);
  const draw = drawFromBag(state.bag);
  return {
    ...state,
    grid,
    piece,
    next: draw.type,
    bag: draw.bag,
    status: 'paused',
    revived: true,
    holdUsed: false,
    clearingRows: [],
    restMs: 0,
    lockResets: 0,
    combo: -1,
  };
}

export function addTime(state: GameState, deltaMs: number): GameState {
  if (state.status !== 'playing' || deltaMs <= 0) return state;
  const elapsedMs = state.elapsedMs + deltaMs;
  if (state.mode === 'ultra' && elapsedMs >= ULTRA_DURATION_MS) {
    // Rows that were still flashing when time ran out still count.
    const settled = finishClear({ ...state, elapsedMs });
    return { ...settled, elapsedMs: ULTRA_DURATION_MS, status: 'finished' };
  }
  return { ...state, elapsedMs };
}

export function togglePause(state: GameState): GameState {
  if (state.status === 'playing') return { ...state, status: 'paused' };
  if (state.status === 'paused') return { ...state, status: 'playing' };
  return state;
}

// ---------------------------------------------------------------------------
// React hook
// ---------------------------------------------------------------------------

const CLOCK_INTERVAL_MS = 50;

export interface TetrisApi {
  state: GameState;
  ghostRow: number | null;
  gravityMs: number;
  moveLeft: () => void;
  moveRight: () => void;
  rotateCW: () => void;
  rotateCCW: () => void;
  hold: () => void;
  revive: () => void;
  /** Drops `rows` rows (default 1); returns true if the piece landed during it. */
  fastDrop: (rows?: number) => boolean;
  hardDrop: () => void;
  togglePause: () => void;
  restart: () => void;
}

export function useTetris(mode: GameMode, initial: GameState | null = null): TetrisApi {
  const [state, setState] = useState<GameState>(() => initial ?? createGame(mode));
  // The ref is the source of truth so timers and rapid touch events never see stale state.
  const stateRef = useRef<GameState>(state);
  const lastTsRef = useRef<number>(Date.now());

  /** Syncs the game clock, then applies a pure transition. */
  const commit = useCallback((transition: (s: GameState) => GameState) => {
    const now = Date.now();
    const current = stateRef.current;
    const delta = now - lastTsRef.current;
    const timed = advanceRest(addTime(current, delta), delta);
    lastTsRef.current = now;
    const next = transition(timed);
    if (next !== current) {
      stateRef.current = next;
      setState(next);
    }
  }, []);

  const status = state.status;
  const gravityMs = gravityFor(state.mode, state.level);

  // Gravity.
  useEffect(() => {
    if (status !== 'playing') return undefined;
    const id = setInterval(() => commit(stepDown), gravityMs);
    return () => clearInterval(id);
  }, [status, gravityMs, commit]);

  // Line clear: after the flash, collapse the rows and continue.
  const clearing = state.clearingRows.length > 0;
  useEffect(() => {
    if (!clearing || status !== 'playing') return undefined;
    const id = setTimeout(() => commit(finishClear), CLEAR_ANIM_MS);
    return () => clearTimeout(id);
  }, [clearing, status, commit]);

  // Clock: drives the timer display and ends Ultra when time is up.
  useEffect(() => {
    if (status !== 'playing') return undefined;
    const id = setInterval(() => commit((s) => s), CLOCK_INTERVAL_MS);
    return () => clearInterval(id);
  }, [status, commit]);

  // Auto-pause when the app goes to the background.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (appState) => {
      if (appState !== 'active' && stateRef.current.status === 'playing') {
        commit(togglePause);
      }
    });
    return () => sub.remove();
  }, [commit]);

  const ghostRow = useMemo(
    () => (state.piece ? getGhostRow(state.grid, state.piece) : null),
    [state.grid, state.piece],
  );

  const moveLeft = useCallback(() => commit((s) => movePiece(s, -1)), [commit]);
  const moveRight = useCallback(() => commit((s) => movePiece(s, 1)), [commit]);
  const rotateCW = useCallback(() => commit((s) => rotatePiece(s, 1)), [commit]);
  const rotateCCW = useCallback(() => commit((s) => rotatePiece(s, -1)), [commit]);
  const holdAction = useCallback(() => commit(holdPiece), [commit]);
  const reviveAction = useCallback(() => commit(revive), [commit]);
  const fastDropAction = useCallback(
    (rows = 1): boolean => {
      let landed = false;
      commit((s) => {
        let current = s;
        for (let i = 0; i < rows && !landed; i++) {
          const step = fastDropStep(current);
          current = step.state;
          landed = step.locked;
        }
        return current;
      });
      return landed;
    },
    [commit],
  );
  const hardDropAction = useCallback(() => commit(hardDrop), [commit]);
  const togglePauseAction = useCallback(() => commit(togglePause), [commit]);

  const restart = useCallback(() => {
    const fresh = createGame(mode);
    lastTsRef.current = Date.now();
    stateRef.current = fresh;
    setState(fresh);
  }, [mode]);

  return {
    state,
    ghostRow,
    gravityMs,
    moveLeft,
    moveRight,
    rotateCW,
    rotateCCW,
    hold: holdAction,
    revive: reviveAction,
    fastDrop: fastDropAction,
    hardDrop: hardDropAction,
    togglePause: togglePauseAction,
    restart,
  };
}
