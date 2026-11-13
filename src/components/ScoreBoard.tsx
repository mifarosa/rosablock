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
  next: TetrominoType;
  held: TetrominoType | null;
  /** Hold was already used for this piece. */
  holdUsed: boolean;
  onHold: () => void;
  /** 'bar': one row of tiles. 'box': a two-column block that fits beside the buttons. */
  layout: 'bar' | 'box';
  height: number;
}

const PREVIEW_CELL = 12;
const PREVIEW_ROWS = 2; // every piece fits in 2 rows once trimmed (I is 1 row)
const TILE_GAP = 6;

/** A small piece preview: the shape's bounding box is trimmed so it is always centered. */
function PiecePreview({ type, dim = false }: { type: TetrominoType | null; dim?: boolean }) {
  const { theme } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  if (type === null) return <View style={styles.previewBox} />;

  const matrix = getMatrix(type, 0).filter((row) => row.some((v) => v === 1));
  const usedCols = matrix[0]!.map((_, c) => c).filter((c) => matrix.some((row) => row[c] === 1));
  const minCol = Math.min(...usedCols);
  const maxCol = Math.max(...usedCols);

  return (
    <View style={[styles.previewBox, dim && styles.dim]}>
      {matrix.map((row, r) => (
        <View key={r} style={styles.previewRow}>
          {row.slice(minCol, maxCol + 1).map((v, c) => (
            <View
              key={c}
              style={{
                width: PREVIEW_CELL,
                height: PREVIEW_CELL,
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
}

interface Tile {
  key: string;
  label: string;
  value?: string;
  piece?: TetrominoType | null;
  dim?: boolean;
  onPress?: () => void;
  grow: number; // relative width in the one-row bar
}

function ScoreBoard({
  mode,
  score,
  lines,
  level,
  elapsedMs,
  next,
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

  const tiles: Tile[] = [
    { key: 'next', label: t('stat.next'), piece: next, grow: 1.1 },
    { key: 'hold', label: t('stat.hold'), piece: held, dim: holdUsed, onPress: onHold, grow: 1 },
    { key: 'score', label: t('stat.score'), value: String(score), grow: 1.3 },
    { key: 'lines', label: t('stat.lines'), value: linesValue, grow: 1.2 },
  ];
  if (mode !== 'zen') tiles.push({ key: 'level', label: t('stat.level'), value: String(level), grow: 0.9 });
  tiles.push({ key: 'time', label: timeLabel, value: timeValue, grow: 1.6 });

  const isBox = layout === 'box';
  const rows = Math.ceil(tiles.length / 2);
  const tileHeight = isBox ? (height - TILE_GAP * (rows - 1)) / rows : height;

  return (
    <View style={[isBox ? styles.box : styles.bar, { height }]}>
      {tiles.map((tile, i) => {
        // In the box, an odd last tile spans the full width.
        const spansRow = isBox && tiles.length % 2 === 1 && i === tiles.length - 1;
        const content = (
          <>
            <Text style={styles.label} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
              {tile.label}
            </Text>
            {tile.piece !== undefined ? (
              <PiecePreview type={tile.piece} dim={tile.dim} />
            ) : (
              <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
                {tile.value}
              </Text>
            )}
          </>
        );
        const tileStyle = [
          styles.tile,
          { height: tileHeight },
          isBox ? { width: spansRow ? ('100%' as const) : ('48.5%' as const) } : { flex: tile.grow },
        ];
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
          <View key={tile.key} style={tileStyle}>
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
    bar: { flexDirection: 'row', gap: TILE_GAP, paddingHorizontal: 12 },
    box: {
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
      paddingVertical: 4,
      paddingHorizontal: 6,
      justifyContent: 'space-between',
    },
    tilePressed: { borderColor: c.textSecondary },
    label: { color: c.textSecondary, fontSize: 9, fontWeight: '700', letterSpacing: 1 },
    value: {
      color: c.textPrimary,
      fontSize: 16,
      fontWeight: '700',
      fontVariant: ['tabular-nums'],
    },
    previewBox: { height: PREVIEW_ROWS * PREVIEW_CELL, justifyContent: 'center' },
    previewRow: { flexDirection: 'row' },
    dim: { opacity: 0.35 },
  });
