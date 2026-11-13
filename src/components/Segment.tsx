import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../app/AppContext';
import type { ThemeColors } from '../constants/colors';

interface SegmentProps<T extends string | boolean> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

/** A row of mutually exclusive choices. */
export default function Segment<T extends string | boolean>({
  options,
  value,
  onChange,
}: SegmentProps<T>) {
  const { theme } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={styles.segment}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={String(opt.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(opt.value)}
            style={[styles.item, active && styles.itemActive]}
          >
            <Text style={[styles.text, active && styles.textActive]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    segment: {
      flexDirection: 'row',
      backgroundColor: c.boardBg,
      borderColor: c.border,
      borderWidth: 2,
      borderRadius: 10,
      padding: 4,
      gap: 4,
    },
    item: { flex: 1, paddingVertical: 10, borderRadius: 7, alignItems: 'center' },
    itemActive: { backgroundColor: c.textSecondary },
    text: { color: c.textSecondary, fontSize: 15, fontWeight: '700' },
    textActive: { color: c.background },
  });
