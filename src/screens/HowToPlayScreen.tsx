import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../app/AppContext';
import ThemeBackground from '../components/ThemeBackground';
import type { ThemeColors } from '../constants/colors';
import type { StringKey } from '../i18n/strings';

interface HowToPlayScreenProps {
  onClose: () => void;
  /** First time: the closing button says "Got it". */
  first?: boolean;
}

/** The how-to-play page: shown by itself the first time, and from the home screen and the pause menu. */
export default function HowToPlayScreen({ onClose, first = false }: HowToPlayScreenProps) {
  const { theme, t, settings } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const insets = useSafeAreaInsets();

  const controls: StringKey[] =
    settings.controlMode === 'gestures'
      ? ['howto.gestures.tap', 'howto.gestures.swipe', 'howto.gestures.hold', 'howto.gestures.flick']
      : ['howto.buttons.moves', 'howto.buttons.rotate', 'howto.buttons.down', 'howto.buttons.swap'];

  const section = (title: StringKey, text: StringKey) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{t(title)}</Text>
      <Text style={styles.cardText}>{t(text)}</Text>
    </View>
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ThemeBackground />
      <View style={styles.header}>
        <View style={styles.headerSide} />
        <Text style={styles.title}>{t('howto.title')}</Text>
        <View style={styles.headerSide} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {section('howto.goal.title', 'howto.goal.text')}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('howto.controls.title')}</Text>
          {controls.map((key) => (
            <Text key={key} style={styles.line}>
              {t(key)}
            </Text>
          ))}
          <Text style={styles.note}>{t('howto.controls.change')}</Text>
        </View>

        {section('howto.hold.title', 'howto.hold.text')}
        {section('howto.score.title', 'howto.score.text')}
        {section('howto.lock.title', 'howto.lock.text')}
        {section('howto.ad.title', 'howto.ad.text')}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable
          accessibilityRole="button"
          onPress={onClose}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Text style={styles.buttonText}>{first ? t('howto.gotIt') : t('howto.close')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.background },
    header: { height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
    headerSide: { flex: 1 },
    title: { color: c.textPrimary, fontSize: 18, fontWeight: '700', letterSpacing: 2 },
    content: { padding: 20, paddingTop: 8, gap: 12 },
    card: {
      backgroundColor: c.boardBg,
      borderColor: c.border,
      borderWidth: 2,
      borderRadius: 10,
      padding: 16,
      gap: 6,
    },
    cardTitle: { color: c.textPrimary, fontSize: 16, fontWeight: '800', letterSpacing: 1 },
    cardText: { color: c.textSecondary, fontSize: 15, lineHeight: 21 },
    line: { color: c.textSecondary, fontSize: 15, lineHeight: 22 },
    note: { color: c.textSecondary, opacity: 0.7, fontSize: 13, marginTop: 4 },
    footer: { paddingHorizontal: 20, paddingTop: 10 },
    button: {
      backgroundColor: c.textSecondary,
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: 'center',
    },
    buttonPressed: { opacity: 0.7 },
    buttonText: { color: c.background, fontSize: 16, fontWeight: '800' },
  });
