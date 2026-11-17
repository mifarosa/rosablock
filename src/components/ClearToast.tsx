import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../app/AppContext';
import type { ThemeColors } from '../constants/colors';
import type { ClearInfo } from '../hooks/useTetris';

/**
 * The pop-up after a line clear: what was cleared (Double, Triple, Tetris), the points, and the
 * extras (combo, back-to-back, perfect clear). It pops, floats up a little and fades.
 */
export default function ClearToast({ info }: { info: ClearInfo }) {
  const { theme, t } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 1200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [progress]);

  const opacity = progress.interpolate({ inputRange: [0, 0.1, 0.7, 1], outputRange: [0, 1, 1, 0] });
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [12, -36] });
  const scale = progress.interpolate({
    inputRange: [0, 0.1, 0.25],
    outputRange: [0.7, 1.12, 1],
    extrapolate: 'clamp',
  });

  const title =
    info.rows >= 4
      ? t('toast.tetris')
      : info.rows === 3
        ? t('toast.triple')
        : info.rows === 2
          ? t('toast.double')
          : null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.box, { opacity, transform: [{ translateY }, { scale }] }]}
    >
      {title !== null && <Text style={styles.title}>{title}</Text>}
      <Text style={[styles.points, title === null && styles.pointsAlone]}>+{info.points}</Text>
      <View style={styles.extras}>
        {info.backToBack && <Text style={styles.extra}>{t('toast.backToBack')}</Text>}
        {info.combo >= 1 && <Text style={styles.extra}>{t('toast.combo', { n: info.combo })}</Text>}
        {info.perfect && <Text style={styles.extra}>{t('toast.perfect')}</Text>}
      </View>
    </Animated.View>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    box: { alignItems: 'center', gap: 2 },
    title: {
      color: c.textPrimary,
      fontSize: 30,
      fontWeight: '900',
      letterSpacing: 3,
      textShadowColor: c.background,
      textShadowRadius: 8,
    },
    points: {
      color: c.textPrimary,
      fontSize: 20,
      fontWeight: '800',
      textShadowColor: c.background,
      textShadowRadius: 6,
    },
    pointsAlone: { fontSize: 26 },
    level: {
      color: c.textPrimary,
      fontSize: 22,
      fontWeight: '900',
      letterSpacing: 4,
      textShadowColor: c.background,
      textShadowRadius: 8,
    },
    extras: { alignItems: 'center', gap: 1, marginTop: 2 },
    extra: {
      color: c.textSecondary,
      fontSize: 13,
      fontWeight: '800',
      letterSpacing: 2,
      textShadowColor: c.background,
      textShadowRadius: 6,
    },
  });

/** "LEVEL 5": a quiet banner that fades in, floats up a little and fades out. */
export function LevelToast({ level }: { level: number }) {
  const { theme, t } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 1500,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [progress]);

  const opacity = progress.interpolate({ inputRange: [0, 0.15, 0.75, 1], outputRange: [0, 1, 1, 0] });
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [10, -24] });
  const scale = progress.interpolate({
    inputRange: [0, 0.15, 0.3],
    outputRange: [0.85, 1.08, 1],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.box, { opacity, transform: [{ translateY }, { scale }] }]}
    >
      <Text style={styles.level}>{t('toast.level', { n: level })}</Text>
    </Animated.View>
  );
}
