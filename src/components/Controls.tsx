import React, { memo, useCallback, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/colors';

interface ControlsProps {
  onLeft: () => void;
  onRight: () => void;
  onSoftDrop: () => void;
  onRotate: () => void;
}

const REPEAT_DELAY_MS = 170;
const REPEAT_INTERVAL_MS = 55;

interface PadButtonProps {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
  repeat?: boolean;
}

/** Retro pad button. With `repeat`, holding the button fires the action repeatedly (DAS-style). */
const PadButton = memo(function PadButton({
  label,
  accessibilityLabel,
  onPress,
  repeat = false,
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
      hitSlop={4}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
});

/** One row at the bottom: every button is reachable by one thumb. */
function Controls({ onLeft, onRight, onSoftDrop, onRotate }: ControlsProps) {
  return (
    <View style={styles.container}>
      <PadButton label="◀" accessibilityLabel="Sola" onPress={onLeft} repeat />
      <PadButton label="▼" accessibilityLabel="Aşağı" onPress={onSoftDrop} repeat />
      <PadButton label="▶" accessibilityLabel="Sağa" onPress={onRight} repeat />
      <PadButton label="↻" accessibilityLabel="Döndür" onPress={onRotate} />
    </View>
  );
}

export default memo(Controls);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 12,
  },
  button: {
    flex: 1,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.border,
    borderWidth: 2,
    borderColor: COLORS.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { backgroundColor: COLORS.boardBg, borderColor: COLORS.textPrimary },
  label: { color: COLORS.textPrimary, fontSize: 26, fontWeight: '700' },
});
