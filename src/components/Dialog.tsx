import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useApp } from '../app/AppContext';
import type { ThemeColors } from '../constants/colors';

/**
 * A themed modal card over a dimmed backdrop; absolutely fills its parent. With `onDismiss`, a tap
 * on the backdrop (anywhere outside the card) closes it, like its cancel button would.
 */
export function Dialog({
  title,
  children,
  onDismiss,
}: {
  title: string;
  children: React.ReactNode;
  onDismiss?: () => void;
}) {
  const styles = useStyles();
  return (
    <Pressable
      style={styles.overlay}
      onPress={onDismiss}
      disabled={!onDismiss}
      accessible={false}
    >
      {/* The card swallows taps, so touching it does not count as touching the backdrop. */}
      <Pressable style={styles.dialog} onPress={() => {}} accessible={false}>
        <Text style={styles.title}>{title}</Text>
        {children}
      </Pressable>
    </Pressable>
  );
}

export function DialogText({ children }: { children: React.ReactNode }) {
  const styles = useStyles();
  return <Text style={styles.text}>{children}</Text>;
}

/** A labelled on/off switch for quick settings inside a dialog. */
export function DialogSwitch({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  const { theme } = useApp();
  const styles = useStyles();
  return (
    <View style={styles.switchRow}>
      <Text style={styles.switchLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: theme.border, true: theme.textSecondary }}
        thumbColor={theme.textPrimary}
        ios_backgroundColor={theme.border}
      />
    </View>
  );
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
  const styles = useStyles();
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

function useStyles() {
  const { theme } = useApp();
  return useMemo(() => makeStyles(theme), [theme]);
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: c.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialog: {
    width: 280,
    backgroundColor: c.boardBg,
    borderColor: c.border,
    borderWidth: 2,
    borderRadius: 12,
    padding: 20,
    gap: 10,
  },
  title: {
    color: c.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  text: { color: c.textSecondary, fontSize: 15, textAlign: 'center', marginBottom: 6 },
  button: {
    backgroundColor: c.textSecondary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderColor: c.border,
    borderWidth: 2,
  },
  buttonPressed: { opacity: 0.7 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  switchLabel: { color: c.textPrimary, fontSize: 15, fontWeight: '600' },
  buttonText: { color: c.background, fontSize: 16, fontWeight: '700' },
  buttonTextSecondary: { color: c.textPrimary },
});
