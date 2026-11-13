import { getMatrix } from '../constants/tetrominos';
import type { ActivePiece } from '../hooks/useTetris';

/** The ghost must be at least this many rows below the piece for a tap on it to hard drop. */
export const MIN_DROP_ROWS = 2;
const BOARD_BORDER = 2;
/** How far (in cells) outside the ghost's blocks a tap still counts, so a small target is easy to hit. */
const SLOP_CELLS = 0.6;

/**
 * Whether a tap at (x, y) lands on the ghost (the landing shadow). Coordinates are relative to
 * the same origin as boardLeft / boardTop (the top-left corner of the board's outer frame).
 */
export function hitsGhost(
  x: number,
  y: number,
  piece: ActivePiece | null,
  ghostRow: number | null,
  cellSize: number,
  boardLeft: number,
  boardTop: number,
): boolean {
  if (!piece || ghostRow === null || ghostRow - piece.row < MIN_DROP_ROWS) return false;
  const matrix = getMatrix(piece.type, piece.rotation);
  const slop = cellSize * SLOP_CELLS;
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r]!.length; c++) {
      if (!matrix[r]![c]) continue;
      const left = boardLeft + BOARD_BORDER + (piece.col + c) * cellSize;
      const top = boardTop + BOARD_BORDER + (ghostRow + r) * cellSize;
      if (
        x >= left - slop &&
        x <= left + cellSize + slop &&
        y >= top - slop &&
        y <= top + cellSize + slop
      ) {
        return true;
      }
    }
  }
  return false;
}
