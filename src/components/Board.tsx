import React, { memo, useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useApp } from '../app/AppContext';
import type { ThemeColors } from '../constants/colors';
import { BOARD_COLS, BOARD_ROWS, getMatrix, type TetrominoType } from '../constants/tetrominos';
import { CLEAR_ANIM_MS, type ActivePiece, type Grid, type LockInfo } from '../hooks/useTetris';

interface BoardProps {
  grid: Grid;
  piece: ActivePiece | null;
  ghostRow: number | null;
  cellSize: number;
  /** Full rows that are flashing before they collapse. */
  clearingRows: number[];
  /** The game just ended: a haze rises through the board from the bottom. */
  gameOver: boolean;
  /** The latest landing: a little dust under the piece, and a trail after a hard drop. */
  lock: LockInfo | null;
  /** Goes up by one at every level-up: a wave of light runs up the board. */
  levelWave: number;
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
 * What happens where a piece lands: two puffs of dust spread out from under the lowest blocks, and
 * after a hard drop a faint trail in the piece's color shows the way it fell.
 */
function LockEffect({ info, cellSize }: { info: LockInfo; cellSize: number }) {
  const { theme } = useApp();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: info.hard ? 460 : 380,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [progress, info.hard]);

  const taken = new Set(info.cells.map(([r, c]) => `${r},${c}`));
  const bottoms = info.cells.filter(([r, c]) => !taken.has(`${r + 1},${c}`));
  const puff = cellSize * 0.3;
  const spread = progress.interpolate({ inputRange: [0, 1], outputRange: [0, cellSize * 0.6] });
  const rise = progress.interpolate({ inputRange: [0, 1], outputRange: [0, -cellSize * 0.3] });
  const dust = progress.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] });
  const trail = progress.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0] });
  const color = theme.pieces[info.type];

  const nodes: React.ReactNode[] = [];
  bottoms.forEach(([r, c]) => {
    for (const side of [-1, 1]) {
      nodes.push(
        <Animated.View
          key={`d-${r}-${c}-${side}`}
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: c * cellSize + (cellSize - puff) / 2,
            top: (r + 1) * cellSize - puff,
            width: puff,
            height: puff,
            borderRadius: puff / 2,
            backgroundColor: theme.textPrimary,
            opacity: dust,
            transform: [{ translateX: Animated.multiply(spread, side) }, { translateY: rise }],
          }}
        />,
      );
    }
  });

  if (info.hard) {
    // One strip per column: from where the piece started down to the top block of that column.
    const topOfColumn = new Map<number, number>();
    info.cells.forEach(([r, c]) => topOfColumn.set(c, Math.min(topOfColumn.get(c) ?? r, r)));
    topOfColumn.forEach((top, c) => {
      const length = top - info.fromRow;
      if (length < 1) return;
      nodes.push(
        <Animated.View
          key={`t-${c}`}
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: c * cellSize + cellSize * 0.2,
            top: info.fromRow * cellSize,
            width: cellSize * 0.6,
            height: length * cellSize,
            borderRadius: cellSize * 0.2,
            backgroundColor: color,
            opacity: trail,
          }}
        />,
      );
    });
  }
  return <>{nodes}</>;
}

/** A soft band of light that runs from the bottom of the board to the top at a level-up. */
function LevelWave({ cellSize }: { cellSize: number }) {
  const { theme } = useApp();
  const progress = useRef(new Animated.Value(0)).current;
  const boardHeight = cellSize * BOARD_ROWS;
  const band = cellSize * 6;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 900,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [progress]);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [boardHeight, -band] });
  // Three stacked layers make the band brightest in the middle without a gradient.
  const layers: [number, number][] = [
    [1, 0.08],
    [0.62, 0.1],
    [0.28, 0.14],
  ];
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: cellSize * BOARD_COLS,
        height: band,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ translateY }],
      }}
    >
      {layers.map(([size, alpha]) => (
        <View
          key={size}
          style={{
            position: 'absolute',
            width: '100%',
            height: band * size,
            backgroundColor: theme.textPrimary,
            opacity: alpha * 2,
          }}
        />
      ))}
    </Animated.View>
  );
}

/** The end-of-game haze: rows fill from the bottom to the top, one after another. */
function GameOverHaze({ cellSize }: { cellSize: number }) {
  const { theme } = useApp();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 850,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  }, [progress]);

  const rows: React.ReactNode[] = [];
  for (let fromBottom = 0; fromBottom < BOARD_ROWS; fromBottom++) {
    const start = (fromBottom / BOARD_ROWS) * 0.8;
    const opacity = progress.interpolate({
      inputRange: [start, start + 0.2],
      outputRange: [0, 0.55],
      extrapolate: 'clamp',
    });
    rows.push(
      <Animated.View
        key={fromBottom}
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 0,
          width: cellSize * BOARD_COLS,
          top: (BOARD_ROWS - 1 - fromBottom) * cellSize,
          height: cellSize,
          backgroundColor: theme.textSecondary,
          opacity,
        }}
      />,
    );
  }
  return <>{rows}</>;
}

function Board({
  grid,
  piece,
  ghostRow,
  cellSize,
  clearingRows,
  gameOver,
  lock,
  levelWave,
}: BoardProps) {
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
      {lock && <LockEffect key={lock.id} info={lock} cellSize={cellSize} />}
      {levelWave > 0 && <LevelWave key={levelWave} cellSize={cellSize} />}
      {gameOver && <GameOverHaze cellSize={cellSize} />}
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
