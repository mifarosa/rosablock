import React, { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../app/AppContext';
import type { ThemeColors } from '../constants/colors';

interface ControlsProps {
  onLeft: () => void;
  onRight: () => void;
  /** Returns true when the piece landed, which also stops the repeat. */
  onSoftDrop: () => boolean;
  onRotate: () => void;
  height: number;
}

const REPEAT_DELAY_MS = 170;
const REPEAT_INTERVAL_MS = 55;
const DOWN_REPEAT_INTERVAL_MS = 35;
const GAP = 8;

interface PadButtonProps {
  label: string;
  accessibilityLabel: string;
  /** Returning true stops the repeat (the press has to be released and made again). */
  onPress: () => boolean | void;
  repeat?: boolean;
  repeatMs?: number;
}

/** Retro pad button. With `repeat`, holding the button fires the action repeatedly (DAS-style). */
const PadButton = memo(function PadButton({
  label,
  accessibilityLabel,
  onPress,
  repeat = false,
  repeatMs = REPEAT_INTERVAL_MS,
}: PadButtonProps) {
  const { theme } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const delayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (delayRef.current) clearTimeout(delayRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    delayRef.current = null;
    intervalRef.current = null;
  }, []);

  const start = useCallback(() => {
    stop();
    if (onPress() === true || !repeat) return;
    delayRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        if (onPress() === true) stop();
      }, repeatMs);
    }, REPEAT_DELAY_MS);
  }, [onPress, repeat, repeatMs, stop]);

  useEffect(() => stop, [stop]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPressIn={start}
      onPressOut={stop}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
});

/**
 * A compact 2x2 cluster meant for one thumb:
 *   ◀  ▶
 *   ↻  ▼
 */
function Controls({ onLeft, onRight, onSoftDrop, onRotate, height }: ControlsProps) {
  const { theme, t } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={[styles.cluster, { height }]}>
      <View style={styles.row}>
        <PadButton label="◀" accessibilityLabel={t('a11y.left')} onPress={onLeft} repeat />
        <PadButton label="▶" accessibilityLabel={t('a11y.right')} onPress={onRight} repeat />
      </View>
      <View style={styles.row}>
        <PadButton label="↻" accessibilityLabel={t('a11y.rotate')} onPress={onRotate} />
        <PadButton
          label="▼"
          accessibilityLabel={t('a11y.down')}
          onPress={onSoftDrop}
          repeat
          repeatMs={DOWN_REPEAT_INTERVAL_MS}
        />
      </View>
    </View>
  );
}

export default memo(Controls);

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
  cluster: { gap: GAP },
  row: { flex: 1, flexDirection: 'row', gap: GAP },
  button: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: c.border,
    borderWidth: 2,
    borderColor: c.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { backgroundColor: c.boardBg, borderColor: c.textPrimary },
  label: { color: c.textPrimary, fontSize: 26, fontWeight: '700' },
});
