import React, { memo, useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useApp } from '../app/AppContext';
import type { ThemeColors } from '../constants/colors';
import { BOARD_COLS, BOARD_ROWS, getMatrix, type TetrominoType } from '../constants/tetrominos';
import { CLEAR_ANIM_MS, type ActivePiece, type Grid } from '../hooks/useTetris';

interface BoardProps {
  grid: Grid;
  piece: ActivePiece | null;
  ghostRow: number | null;
  cellSize: number;
  /** Full rows that are flashing before they collapse. */
  clearingRows: number[];
  /** 0 to 1: the hold-to-drop charge, drawn filling the falling piece from the bottom up. */
  charge: Animated.Value;
}

interface CellProps {
  type: TetrominoType | null;
  ghost: boolean;
  size: number;
}

const BoardCell = memo(function BoardCell({ type, ghost, size }: CellProps) {
  const { theme } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  if (type === null) {
    return <View style={[styles.cell, styles.empty, { width: size, height: size }]} />;
  }
  const color = theme.pieces[type];
  if (ghost) {
    return (
      <View
        style={[
          styles.cell,
          { width: size, height: size, backgroundColor: theme.ghost, borderColor: color },
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

/** White flash over the cleared rows: bright, a quick dip, bright again, then fade out. */
function ClearFlash({ rows, cellSize }: { rows: number[]; cellSize: number }) {
  const { theme } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const rest = Math.max(60, CLEAR_ANIM_MS - 170);
    Animated.sequence([
      Animated.timing(opacity, { toValue: 0.95, duration: 50, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0.3, duration: 60, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: rest, useNativeDriver: true }),
    ]).start();
  }, [opacity]);

  return (
    <>
      {rows.map((row) => (
        <Animated.View
          key={row}
          pointerEvents="none"
          style={[
            styles.flash,
            { top: row * cellSize, height: cellSize, width: cellSize * BOARD_COLS, opacity },
          ]}
        />
      ))}
    </>
  );
}

/**
 * A light fill that rises through the falling piece, bottom row first, as the hold charges.
 * Each block fills by its own share of the piece's height, so it reads as one filling shape.
 */
function ChargeFill({
  piece,
  cellSize,
  charge,
}: {
  piece: ActivePiece;
  cellSize: number;
  charge: Animated.Value;
}) {
  const { theme } = useApp();
  const matrix = getMatrix(piece.type, piece.rotation);
  const used = matrix.map((row, r) => (row.some((v) => v === 1) ? r : -1)).filter((r) => r >= 0);
  const top = Math.min(...used);
  const bottom = Math.max(...used);
  const height = bottom - top + 1;

  const cells: React.ReactNode[] = [];
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r]!.length; c++) {
      if (!matrix[r]![c]) continue;
      const fromBottom = bottom - r;
      const scaleY = charge.interpolate({
        inputRange: [fromBottom / height, (fromBottom + 1) / height],
        outputRange: [0, 1],
        extrapolate: 'clamp',
      });
      cells.push(
        <Animated.View
          key={`${r}-${c}`}
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: (piece.col + c) * cellSize,
            top: (piece.row + r) * cellSize,
            width: cellSize,
            height: cellSize,
            borderRadius: 2,
            backgroundColor: theme.textPrimary,
            opacity: 0.8,
            transformOrigin: 'bottom',
            transform: [{ scaleY }],
          }}
        />,
      );
    }
  }
  return <>{cells}</>;
}

function Board({ grid, piece, ghostRow, cellSize, clearingRows, charge }: BoardProps) {
  const { theme } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const display = useMemo(() => buildDisplay(grid, piece, ghostRow), [grid, piece, ghostRow]);

  // Three or more rows at once make the whole board shake; a tetris shakes harder.
  const shake = useRef(new Animated.Value(0)).current;
  const clearCount = clearingRows.length;
  useEffect(() => {
    if (clearCount < 3) return;
    const a = clearCount >= 4 ? 9 : 5;
    Animated.sequence([
      Animated.timing(shake, { toValue: -a, duration: 40, useNativeDriver: true }),
      Animated.timing(shake, { toValue: a, duration: 55, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -a * 0.6, duration: 55, useNativeDriver: true }),
      Animated.timing(shake, { toValue: a * 0.4, duration: 50, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [clearCount, shake]);

  return (
    <Animated.View
      style={[
        styles.board,
        {
          width: cellSize * BOARD_COLS + 4,
          height: cellSize * BOARD_ROWS + 4,
          transform: [{ translateX: shake }],
        },
      ]}
    >
      {display.map((row, r) => (
        <View key={r} style={styles.row}>
          {row.map((cell, c) => (
            <BoardCell key={c} type={cell.type} ghost={cell.ghost} size={cellSize} />
          ))}
        </View>
      ))}
      {piece && <ChargeFill piece={piece} cellSize={cellSize} charge={charge} />}
      {clearCount > 0 && (
        <ClearFlash key={clearingRows.join(',')} rows={clearingRows} cellSize={cellSize} />
      )}
    </Animated.View>
  );
}

export default memo(Board);

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
  board: {
    backgroundColor: c.boardBg,
    borderColor: c.border,
    borderWidth: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row' },
  flash: { position: 'absolute', left: 0, backgroundColor: c.textPrimary },
  cell: { borderWidth: StyleSheet.hairlineWidth, borderColor: c.border },
  empty: { backgroundColor: c.boardBg },
  filled: { borderWidth: 1, borderColor: 'rgba(247, 232, 236, 0.22)', borderRadius: 2 },
});
