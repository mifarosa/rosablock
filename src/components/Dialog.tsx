import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/colors';

/** A themed modal card over a dimmed backdrop; absolutely fills its parent. */
export function Dialog({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.overlay}>
      <View style={styles.dialog}>
        <Text style={styles.title}>{title}</Text>
        {children}
      </View>
    </View>
  );
}

export function DialogText({ children }: { children: React.ReactNode }) {
  return <Text style={styles.text}>{children}</Text>;
}

export function DialogButton({
  label,
  onPress,
  secondary = false,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.buttonSecondary,
        pressed && styles.buttonPressed,
      ]}
    >
      <Text style={[styles.buttonText, secondary && styles.buttonTextSecondary]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialog: {
    width: 280,
    backgroundColor: COLORS.boardBg,
    borderColor: COLORS.border,
    borderWidth: 2,
    borderRadius: 12,
    padding: 20,
    gap: 10,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  text: { color: COLORS.textSecondary, fontSize: 15, textAlign: 'center', marginBottom: 6 },
  button: {
    backgroundColor: COLORS.textSecondary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderColor: COLORS.border,
    borderWidth: 2,
  },
  buttonPressed: { opacity: 0.7 },
  buttonText: { color: COLORS.background, fontSize: 16, fontWeight: '700' },
  buttonTextSecondary: { color: COLORS.textPrimary },
});
