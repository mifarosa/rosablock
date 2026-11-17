import React, { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../app/AppContext';
import type { ThemeColors } from '../constants/colors';
import {
  ULTRA_DURATION_MS,
  SPRINT_TARGET_LINES,
  MARATHON_TARGET_LINES,
  type GameMode,
} from '../constants/modes';
import { getMatrix, type TetrominoType } from '../constants/tetrominos';
import { formatTime } from '../utils/format';

interface ScoreBoardProps {
  mode: GameMode;
  score: number;
  lines: number;
  level: number;
  elapsedMs: number;
  /** The pieces coming up, the next one first (three are shown). */
  upcoming: TetrominoType[];
  held: TetrominoType | null;
  /** Hold was already used for this piece. */
  holdUsed: boolean;
  onHold: () => void;
  /** 'box': two columns, beside the buttons. 'wide': three columns in two rows, under the board. */
  layout: 'box' | 'wide';
  height: number;
}

const TILE_GAP = 6;
const GAP_PERCENT = 1.5;

/** Piece previews: the shape's bounding box is trimmed so it is always centered. */
function Pieces({
  types,
  cell,
  dimmed = false,
}: {
  types: (TetrominoType | null)[];
  cell: number;
  dimmed?: boolean;
}) {
  const { theme } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={[styles.pieces, { height: cell * 2 }, dimmed && styles.dim]}>
      {types.map((type, index) => {
        if (type === null) return <View key={index} />;
        const matrix = getMatrix(type, 0).filter((row) => row.some((v) => v === 1));
        const usedCols = matrix[0]!.map((_, c) => c).filter((c) => matrix.some((row) => row[c] === 1));
        const minCol = Math.min(...usedCols);
        const maxCol = Math.max(...usedCols);
        // The first piece is the one that comes next; the later ones are a little fainter.
        return (
          <View key={index} style={{ opacity: index === 0 ? 1 : 1 - index * 0.28 }}>
            {matrix.map((row, r) => (
              <View key={r} style={styles.previewRow}>
                {row.slice(minCol, maxCol + 1).map((v, c) => (
                  <View
                    key={c}
                    style={{
                      width: cell,
                      height: cell,
                      backgroundColor: v ? theme.pieces[type] : 'transparent',
                      borderRadius: 2,
                      borderWidth: v ? 1 : 0,
                      borderColor: 'rgba(247, 232, 236, 0.22)',
                    }}
                  />
                ))}
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );
}

interface Tile {
  key: string;
  label: string;
  span: number;
  value?: string;
  pieces?: (TetrominoType | null)[];
  dim?: boolean;
  onPress?: () => void;
}

function ScoreBoard({
  mode,
  score,
  lines,
  level,
  elapsedMs,
  upcoming,
  held,
  holdUsed,
  onHold,
  layout,
  height,
}: ScoreBoardProps) {
  const { theme, t } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  let timeLabel = t('stat.time');
  let timeValue = formatTime(elapsedMs);
  if (mode === 'ultra') {
    timeLabel = t('stat.left');
    timeValue = formatTime(ULTRA_DURATION_MS - elapsedMs);
  }

  let linesValue = String(lines);
  if (mode === 'sprint') linesValue = `${lines}/${SPRINT_TARGET_LINES}`;
  if (mode === 'marathon') linesValue = `${lines}/${MARATHON_TARGET_LINES}`;

  const wide = layout === 'wide';
  const columns = wide ? 3 : 2;

  // Tiles in reading order; a tile's `span` is how many columns it takes.
  const tiles: Tile[] = wide
    ? [
        { key: 'next', label: t('stat.next'), span: 1, pieces: upcoming },
        { key: 'hold', label: t('stat.hold'), span: 1, pieces: [held], dim: holdUsed, onPress: onHold },
        { key: 'time', label: timeLabel, span: 1, value: timeValue },
        { key: 'score', label: t('stat.score'), span: 1, value: String(score) },
        { key: 'lines', label: t('stat.lines'), span: mode === 'zen' ? 2 : 1, value: linesValue },
        ...(mode === 'zen' ? [] : [{ key: 'level', label: t('stat.level'), span: 1, value: String(level) }]),
      ]
    : [
        { key: 'next', label: t('stat.next'), span: 2, pieces: upcoming },
        { key: 'hold', label: t('stat.hold'), span: 1, pieces: [held], dim: holdUsed, onPress: onHold },
        { key: 'score', label: t('stat.score'), span: 1, value: String(score) },
        { key: 'lines', label: t('stat.lines'), span: 1, value: linesValue },
        ...(mode === 'zen' ? [] : [{ key: 'level', label: t('stat.level'), span: 1, value: String(level) }]),
        { key: 'time', label: timeLabel, span: 1, value: timeValue },
      ];

  // Pack the tiles into rows; a lone tile at the end of the box fills its row.
  const rows: Tile[][] = [[]];
  let used = 0;
  for (const tile of tiles) {
    if (used + tile.span > columns) {
      rows.push([]);
      used = 0;
    }
    rows[rows.length - 1]!.push(tile);
    used += tile.span;
  }
  const lastRow = rows[rows.length - 1]!;
  if (!wide && lastRow.length === 1) lastRow[0] = { ...lastRow[0]!, span: 2 };

  const tileHeight = (height - TILE_GAP * (rows.length - 1)) / rows.length;
  const cell = wide ? 7 : 9;
  const widthFor = (span: number) =>
    `${(span * (100 - (columns - 1) * GAP_PERCENT)) / columns + (span - 1) * GAP_PERCENT}%` as const;

  return (
    <View style={[styles.grid, { height }]}>
      {rows.flat().map((tile) => {
        const content = (
          <>
            <Text style={styles.label} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
              {tile.label}
            </Text>
            {tile.pieces ? (
              <Pieces types={tile.pieces} cell={cell} dimmed={tile.dim} />
            ) : (
              <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
                {tile.value}
              </Text>
            )}
          </>
        );
        const tileStyle = [styles.tile, { height: tileHeight, width: widthFor(tile.span) }];
        return tile.onPress ? (
          <Pressable
            key={tile.key}
            accessibilityRole="button"
            accessibilityLabel={t('a11y.hold')}
            onPress={tile.onPress}
            style={({ pressed }) => [tileStyle, pressed && styles.tilePressed]}
          >
            {content}
          </Pressable>
        ) : (
          <View key={tile.key} style={tileStyle} accessibilityLabel={tile.key === 'next' ? t('game.nextLabel') : undefined}>
            {content}
          </View>
        );
      })}
    </View>
  );
}

export default memo(ScoreBoard);

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      rowGap: TILE_GAP,
    },
    tile: {
      backgroundColor: c.boardBg,
      borderColor: c.border,
      borderWidth: 2,
      borderRadius: 6,
      paddingVertical: 3,
      paddingHorizontal: 6,
      justifyContent: 'space-between',
    },
    tilePressed: { borderColor: c.textSecondary },
    label: { color: c.textSecondary, fontSize: 9, fontWeight: '700', letterSpacing: 1 },
    value: {
      color: c.textPrimary,
      fontSize: 15,
      fontWeight: '700',
      fontVariant: ['tabular-nums'],
    },
    pieces: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    previewRow: { flexDirection: 'row' },
    dim: { opacity: 0.35 },
  });
