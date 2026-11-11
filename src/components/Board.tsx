import React, { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { COLORS, PIECE_COLORS } from '../constants/colors';
import { BOARD_COLS, BOARD_ROWS, getMatrix, type TetrominoType } from '../constants/tetrominos';
import type { ActivePiece, Grid } from '../hooks/useTetris';

interface BoardProps {
  grid: Grid;
  piece: ActivePiece | null;
  ghostRow: number | null;
  cellSize: number;
}

interface CellProps {
  type: TetrominoType | null;
  ghost: boolean;
  size: number;
}

const BoardCell = memo(function BoardCell({ type, ghost, size }: CellProps) {
  if (type === null) {
    return <View style={[styles.cell, styles.empty, { width: size, height: size }]} />;
  }
  const color = PIECE_COLORS[type];
  if (ghost) {
    return (
      <View
        style={[
          styles.cell,
          { width: size, height: size, backgroundColor: COLORS.ghost, borderColor: color },
        ]}
      />
    );
  }
  return (
    <View
      style={[
        styles.cell,
        styles.filled,
        { width: size, height: size, backgroundColor: color },
      ]}
    />
  );
});

interface DisplayCell {
  type: TetrominoType | null;
  ghost: boolean;
}

/** Merges the locked grid, ghost piece and active piece into one drawable matrix. */
function buildDisplay(grid: Grid, piece: ActivePiece | null, ghostRow: number | null): DisplayCell[][] {
  const display: DisplayCell[][] = grid.map((row) =>
    row.map((type) => ({ type, ghost: false })),
  );
  if (!piece) return display;

  const matrix = getMatrix(piece.type, piece.rotation);
  const stamp = (rowOffset: number, ghost: boolean) => {
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r]!.length; c++) {
        if (!matrix[r]![c]) continue;
        const gr = rowOffset + r;
        const gc = piece.col + c;
        if (gr < 0 || gr >= BOARD_ROWS || gc < 0 || gc >= BOARD_COLS) continue;
        display[gr]![gc] = { type: piece.type, ghost };
      }
    }
  };
  if (ghostRow !== null && ghostRow !== piece.row) stamp(ghostRow, true);
  stamp(piece.row, false);
  return display;
}

function Board({ grid, piece, ghostRow, cellSize }: BoardProps) {
  const display = useMemo(() => buildDisplay(grid, piece, ghostRow), [grid, piece, ghostRow]);

  return (
    <View
      style={[
        styles.board,
        { width: cellSize * BOARD_COLS + 4, height: cellSize * BOARD_ROWS + 4 },
      ]}
    >
      {display.map((row, r) => (
        <View key={r} style={styles.row}>
          {row.map((cell, c) => (
            <BoardCell key={c} type={cell.type} ghost={cell.ghost} size={cellSize} />
          ))}
        </View>
      ))}
    </View>
  );
}

export default memo(Board);

const styles = StyleSheet.create({
  board: {
    backgroundColor: COLORS.boardBg,
    borderColor: COLORS.border,
    borderWidth: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row' },
  cell: { borderWidth: StyleSheet.hairlineWidth, borderColor: COLORS.border },
  empty: { backgroundColor: COLORS.boardBg },
  filled: { borderWidth: 1, borderColor: 'rgba(247, 232, 236, 0.22)', borderRadius: 2 },
});
