import React, { memo, useCallback, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/colors';

interface ControlsProps {
  onLeft: () => void;
  onRight: () => void;
  onSoftDrop: () => void;
  onHardDrop: () => void;
  onRotateCW: () => void;
  onRotateCCW: () => void;
}

const REPEAT_DELAY_MS = 170;
const REPEAT_INTERVAL_MS = 55;

interface PadButtonProps {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
  repeat?: boolean;
  wide?: boolean;
}

/** Retro pad button. With `repeat`, holding the button fires the action repeatedly (DAS-style). */
const PadButton = memo(function PadButton({
  label,
  accessibilityLabel,
  onPress,
  repeat = false,
  wide = false,
}: PadButtonProps) {
  const delayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (delayRef.current) clearTimeout(delayRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    delayRef.current = null;
    intervalRef.current = null;
  }, []);

  const start = useCallback(() => {
    onPress();
    if (!repeat) return;
    stop();
    delayRef.current = setTimeout(() => {
      intervalRef.current = setInterval(onPress, REPEAT_INTERVAL_MS);
    }, REPEAT_DELAY_MS);
  }, [onPress, repeat, stop]);

  useEffect(() => stop, [stop]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPressIn={start}
      onPressOut={stop}
      hitSlop={6}
      style={({ pressed }) => [styles.button, wide && styles.wide, pressed && styles.pressed]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
});

function Controls({
  onLeft,
  onRight,
  onSoftDrop,
  onHardDrop,
  onRotateCW,
  onRotateCCW,
}: ControlsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.dpad}>
        <PadButton label="◀" accessibilityLabel="Sola" onPress={onLeft} repeat />
        <PadButton label="▼" accessibilityLabel="Yavaş düşür" onPress={onSoftDrop} repeat />
        <PadButton label="▶" accessibilityLabel="Sağa" onPress={onRight} repeat />
      </View>
      <View style={styles.actions}>
        <View style={styles.rotateRow}>
          <PadButton label="↺" accessibilityLabel="Sola döndür" onPress={onRotateCCW} />
          <PadButton label="↻" accessibilityLabel="Sağa döndür" onPress={onRotateCW} />
        </View>
        <PadButton label="DÜŞÜR" accessibilityLabel="Hızlı düşür" onPress={onHardDrop} wide />
      </View>
    </View>
  );
}

export default memo(Controls);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 12,
  },
  dpad: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  actions: { gap: 8, alignItems: 'flex-end' },
  rotateRow: { flexDirection: 'row', gap: 8 },
  button: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: COLORS.border,
    borderWidth: 2,
    borderColor: COLORS.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wide: { width: 132, height: 52, borderRadius: 26 },
  pressed: { backgroundColor: COLORS.boardBg, borderColor: COLORS.textPrimary },
  label: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '700', letterSpacing: 1 },
});
