import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../app/AppContext';
import Segment from '../components/Segment';
import ThemeBackground from '../components/ThemeBackground';
import { THEMES, THEME_IDS, type ThemeColors } from '../constants/colors';
import { LANGUAGES, type StringKey } from '../i18n/strings';

interface SettingsScreenProps {
  onBack: () => void;
}

const LANGUAGE_NAMES = { tr: 'Türkçe', en: 'English' } as const;
const SWATCH_PIECES = ['I', 'T', 'S', 'Z'] as const;

export default function SettingsScreen({ onBack }: SettingsScreenProps) {
  const { theme, t, settings, update } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const insets = useSafeAreaInsets();

  const onOff = [
    { value: true, label: t('settings.on') },
    { value: false, label: t('settings.off') },
  ];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ThemeBackground />
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          onPress={onBack}
          hitSlop={10}
          style={styles.headerSide}
        >
          <Text style={styles.back}>{t('common.back')}</Text>
        </Pressable>
        <Text style={styles.title}>{t('settings.title')}</Text>
        <View style={styles.headerSide} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}>
        <Text style={styles.section}>{t('settings.language')}</Text>
        <Segment
          options={LANGUAGES.map((id) => ({ value: id, label: LANGUAGE_NAMES[id] }))}
          value={settings.language}
          onChange={(language) => update({ language })}
        />

        <Text style={styles.section}>{t('settings.theme')}</Text>
        <View style={styles.themes}>
          {THEME_IDS.map((id) => {
            const colors = THEMES[id];
            const active = id === settings.theme;
            return (
              <Pressable
                key={id}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => update({ theme: id })}
                style={[
                  styles.themeCard,
                  { backgroundColor: colors.background },
                  active && styles.themeCardActive,
                ]}
              >
                <View style={styles.swatchRow}>
                  {SWATCH_PIECES.map((piece) => (
                    <View
                      key={piece}
                      style={[styles.swatch, { backgroundColor: colors.pieces[piece] }]}
                    />
                  ))}
                </View>
                <Text style={[styles.themeName, { color: colors.textPrimary }]}>
                  {t(`theme.${id}` as StringKey)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.section}>{t('settings.controls')}</Text>
        <Segment
          options={[
            { value: 'gestures' as const, label: t('settings.controls.gestures') },
            { value: 'buttons' as const, label: t('settings.controls.buttons') },
          ]}
          value={settings.controlMode}
          onChange={(controlMode) => update({ controlMode })}
        />
        <Text style={styles.hint}>
          {settings.controlMode === 'gestures'
            ? t('settings.controls.gesturesHint')
            : t('settings.controls.buttonsHint')}
        </Text>

        <Text style={styles.section}>{t('settings.haptics')}</Text>
        <Segment options={onOff} value={settings.haptics} onChange={(haptics) => update({ haptics })} />

        <Text style={styles.section}>{t('settings.sound')}</Text>
        <Segment options={onOff} value={settings.sound} onChange={(sound) => update({ sound })} />

        <Text style={styles.section}>{t('settings.music')}</Text>
        <Segment options={onOff} value={settings.music} onChange={(music) => update({ music })} />
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.background },
    header: { height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
    headerSide: { flex: 1 },
    back: { color: c.textSecondary, fontSize: 15, fontWeight: '600' },
    title: { color: c.textPrimary, fontSize: 18, fontWeight: '700', letterSpacing: 2 },
    content: { paddingHorizontal: 20, paddingTop: 4 },
    section: {
      color: c.textSecondary,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 2,
      marginTop: 24,
      marginBottom: 10,
    },
    hint: { color: c.textSecondary, opacity: 0.8, fontSize: 13, marginTop: 8 },
    themes: { flexDirection: 'row', gap: 10 },
    themeCard: {
      flex: 1,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: c.border,
      paddingVertical: 14,
      paddingHorizontal: 8,
      alignItems: 'center',
      gap: 10,
    },
    themeCardActive: { borderColor: c.textPrimary },
    swatchRow: { flexDirection: 'row', gap: 3 },
    swatch: { width: 14, height: 14, borderRadius: 3 },
    themeName: { fontSize: 14, fontWeight: '700' },
  });
