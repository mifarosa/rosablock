import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, PIECE_COLORS } from '../constants/colors';
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
  /** 'bar': one row of tiles. 'box': a two-column block that fits beside the buttons. */
  layout: 'bar' | 'box';
  height: number;
}

const PREVIEW_CELL = 12;
const PREVIEW_ROWS = 2; // every piece fits in 2 rows once trimmed (I is 1 row)
const TILE_GAP = 6;

/** Next piece preview: the shape's bounding box is trimmed so it is always centered. */
function NextPiece({ type }: { type: TetrominoType }) {
  const matrix = getMatrix(type, 0).filter((row) => row.some((v) => v === 1));
  const usedCols = matrix[0]!.map((_, c) => c).filter((c) => matrix.some((row) => row[c] === 1));
  const minCol = Math.min(...usedCols);
  const maxCol = Math.max(...usedCols);

  return (
    <View style={styles.previewBox}>
      {matrix.map((row, r) => (
        <View key={r} style={styles.previewRow}>
          {row.slice(minCol, maxCol + 1).map((v, c) => (
            <View
              key={c}
              style={{
                width: PREVIEW_CELL,
                height: PREVIEW_CELL,
                backgroundColor: v ? PIECE_COLORS[type] : 'transparent',
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
  next?: TetrominoType;
}

function ScoreBoard({ mode, score, lines, level, elapsedMs, next, layout, height }: ScoreBoardProps) {
  let timeLabel = 'SÜRE';
  let timeValue = formatTime(elapsedMs);
  if (mode === 'ultra') {
    timeLabel = 'KALAN';
    timeValue = formatTime(ULTRA_DURATION_MS - elapsedMs);
  }

  let linesValue = String(lines);
  if (mode === 'sprint') linesValue = `${lines}/${SPRINT_TARGET_LINES}`;
  if (mode === 'marathon') linesValue = `${lines}/${MARATHON_TARGET_LINES}`;

  const tiles: Tile[] = [
    { key: 'next', label: 'SIRADAKİ', next },
    { key: 'score', label: 'PUAN', value: String(score) },
    { key: 'lines', label: 'SATIR', value: linesValue },
  ];
  if (mode !== 'zen') tiles.push({ key: 'level', label: 'SEVİYE', value: String(level) });
  tiles.push({ key: 'time', label: timeLabel, value: timeValue });

  const isBox = layout === 'box';
  const rows = Math.ceil(tiles.length / 2);
  const tileHeight = isBox ? (height - TILE_GAP * (rows - 1)) / rows : height;

  return (
    <View style={[isBox ? styles.box : styles.bar, { height }]}>
      {tiles.map((tile, i) => {
        // In the box, an odd last tile spans the full width.
        const spansRow = isBox && tiles.length % 2 === 1 && i === tiles.length - 1;
        return (
          <View
            key={tile.key}
            style={[
              styles.tile,
              { height: tileHeight },
              isBox ? { width: spansRow ? '100%' : '48.5%' } : styles.barTile,
            ]}
          >
            <Text style={styles.label} numberOfLines={1}>
              {tile.label}
            </Text>
            {tile.next ? (
              <NextPiece type={tile.next} />
            ) : (
              <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
                {tile.value}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

export default memo(ScoreBoard);

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', gap: TILE_GAP, paddingHorizontal: 12 },
  box: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: TILE_GAP,
  },
  barTile: { flex: 1 },
  tile: {
    backgroundColor: COLORS.boardBg,
    borderColor: COLORS.border,
    borderWidth: 2,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 6,
    justifyContent: 'space-between',
  },
  label: { color: COLORS.textSecondary, fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  value: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  previewBox: { height: PREVIEW_ROWS * PREVIEW_CELL, justifyContent: 'center' },
  previewRow: { flexDirection: 'row' },
});
