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
}

const PREVIEW_CELL = 12;
const PREVIEW_ROWS = 2; // every piece fits in 2 rows once trimmed (I is 1 row)

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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

/** Compact one-row HUD that sits above the board. */
function ScoreBoard({ mode, score, lines, level, elapsedMs, next }: ScoreBoardProps) {
  let timeLabel = 'SÜRE';
  let timeValue = formatTime(elapsedMs);
  if (mode === 'ultra') {
    timeLabel = 'KALAN';
    timeValue = formatTime(ULTRA_DURATION_MS - elapsedMs);
  }

  let linesValue = String(lines);
  if (mode === 'sprint') linesValue = `${lines}/${SPRINT_TARGET_LINES}`;
  if (mode === 'marathon') linesValue = `${lines}/${MARATHON_TARGET_LINES}`;

  return (
    <View style={styles.container}>
      <View style={[styles.stat, styles.nextStat]}>
        <Text style={styles.statLabel}>SIRADAKİ</Text>
        <NextPiece type={next} />
      </View>
      <Stat label="PUAN" value={String(score)} />
      <Stat label="SATIR" value={linesValue} />
      {mode !== 'zen' && <Stat label="SEVİYE" value={String(level)} />}
      <Stat label={timeLabel} value={timeValue} />
    </View>
  );
}

export default memo(ScoreBoard);

export const SCOREBOARD_HEIGHT = 58;

const styles = StyleSheet.create({
  container: {
    height: SCOREBOARD_HEIGHT,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
  },
  stat: {
    flex: 1,
    backgroundColor: COLORS.boardBg,
    borderColor: COLORS.border,
    borderWidth: 2,
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 6,
    justifyContent: 'space-between',
  },
  nextStat: { flex: 1.1, alignItems: 'flex-start' },
  statLabel: { color: COLORS.textSecondary, fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  statValue: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  previewBox: { height: PREVIEW_ROWS * PREVIEW_CELL, justifyContent: 'center' },
  previewRow: { flexDirection: 'row' },
});
