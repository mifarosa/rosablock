import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../app/AppContext';
import GearIcon from '../components/GearIcon';
import ThemeBackground from '../components/ThemeBackground';
import type { ThemeColors } from '../constants/colors';
import { DIG_DIFFICULTIES, MODES, type GameMode, type ModeKind } from '../constants/modes';
import type { StringKey } from '../i18n/strings';
import type { SavedGames } from '../utils/saves';
import type { HighScores } from '../utils/storage';
import { formatTime } from '../utils/format';

interface HomeScreenProps {
  highScores: HighScores;
  savedGames: SavedGames;
  onSelectMode: (mode: GameMode) => void;
  onOpenSettings: () => void;
  onOpenHowTo: () => void;
}

/** The best result of a mode as text; Dig has one best time per difficulty (see the table). */
function scoreLabel(mode: Exclude<GameMode, 'dig'>, scores: HighScores): string {
  if (mode === 'sprint') return scores.sprint === null ? '—' : formatTime(scores.sprint);
  const value = scores[mode];
  return value > 0 ? String(value) : '—';
}

export default function HomeScreen({
  highScores,
  savedGames,
  onSelectMode,
  onOpenSettings,
  onOpenHowTo,
}: HomeScreenProps) {
  const { theme, t } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const modeKey = (id: GameMode, part: 'title' | 'subtitle' | 'description') =>
    t(`mode.${id}.${part}` as StringKey);

  // One row per mode; Dig gets a row for each difficulty.
  const bestRows = MODES.flatMap(({ id }) =>
    id === 'dig'
      ? DIG_DIFFICULTIES.map((level) => ({
          key: `dig-${level}`,
          label: t('dig.best', { level: t(`dig.${level}` as StringKey) }),
          value: highScores.dig[level] === null ? '—' : formatTime(highScores.dig[level]!),
        }))
      : [{ key: id, label: modeKey(id, 'title'), value: scoreLabel(id, highScores) }],
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ThemeBackground />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>ROSABLOCK</Text>
        <Text style={styles.tagline}>{t('home.tagline')}</Text>

        {(['classic', 'fun'] as ModeKind[]).map((kind) => (
          <View key={kind}>
            <Text style={styles.section}>{t(kind === 'classic' ? 'home.classic' : 'home.fun')}</Text>
            {MODES.filter((m) => m.kind === kind).map(({ id }) => {
              const saved = savedGames[id];
              return (
                <Pressable
                  key={id}
                  accessibilityRole="button"
                  accessibilityLabel={modeKey(id, 'title')}
                  onPress={() => onSelectMode(id)}
                  style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{modeKey(id, 'title')}</Text>
                    <Text style={styles.cardSubtitle}>{modeKey(id, 'subtitle')}</Text>
                  </View>
                  <Text style={styles.cardDescription}>{modeKey(id, 'description')}</Text>
                  {saved && (
                    <Text style={styles.cardSaved}>
                      {t('home.resume', { score: saved.score, lines: saved.lines })}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}

        <Text style={styles.section}>{t('home.best')}</Text>
        <View style={styles.scoreTable}>
          {bestRows.map((row, i) => (
            <View
              key={row.key}
              style={[styles.scoreRow, i < bestRows.length - 1 && styles.scoreRowBorder]}
            >
              <Text style={styles.scoreMode}>{row.label}</Text>
              <Text style={styles.scoreValue}>{row.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footerRow}>
          <Pressable
            accessibilityRole="button"
            onPress={onOpenSettings}
            style={({ pressed }) => [styles.footerButton, pressed && styles.footerPressed]}
          >
            {({ pressed }) => (
              <>
                <GearIcon size={22} color={pressed ? theme.textPrimary : theme.textSecondary} />
                <Text style={styles.footerText}>{t('home.settings')}</Text>
              </>
            )}
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={onOpenHowTo}
            style={({ pressed }) => [styles.footerButton, pressed && styles.footerPressed]}
          >
            <Text style={styles.infoGlyph}>i</Text>
            <Text style={styles.footerText}>{t('home.howTo')}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.background },
    footerRow: { flexDirection: 'row', gap: 10, marginTop: 24 },
    footerButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      backgroundColor: c.boardBg,
      borderColor: c.border,
      borderWidth: 2,
      borderRadius: 10,
      paddingVertical: 14,
    },
    footerPressed: { backgroundColor: c.border, borderColor: c.textSecondary },
    footerText: { color: c.textPrimary, fontSize: 14, fontWeight: '700' },
    infoGlyph: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: c.textSecondary,
      color: c.textSecondary,
      textAlign: 'center',
      fontSize: 13,
      fontWeight: '800',
      lineHeight: 18,
    },
    content: { padding: 20, paddingBottom: 40 },
    title: {
      color: c.textPrimary,
      fontSize: 36,
      fontWeight: '800',
      letterSpacing: 6,
      textAlign: 'center',
      marginTop: 12,
    },
    tagline: { color: c.textSecondary, textAlign: 'center', marginTop: 6, letterSpacing: 1 },
    section: {
      color: c.textSecondary,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 2,
      marginTop: 28,
      marginBottom: 10,
    },
    card: {
      backgroundColor: c.boardBg,
      borderColor: c.border,
      borderWidth: 2,
      borderRadius: 10,
      padding: 16,
      marginBottom: 10,
    },
    cardPressed: { borderColor: c.textSecondary, backgroundColor: c.border },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
    cardTitle: { color: c.textPrimary, fontSize: 20, fontWeight: '700' },
    cardSubtitle: { color: c.textSecondary, fontSize: 12 },
    cardDescription: { color: c.textSecondary, marginTop: 6, fontSize: 14 },
    cardSaved: { color: c.textPrimary, marginTop: 8, fontSize: 13, fontWeight: '700' },
    scoreTable: {
      backgroundColor: c.boardBg,
      borderColor: c.border,
      borderWidth: 2,
      borderRadius: 10,
    },
    scoreRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    scoreRowBorder: { borderBottomColor: c.border, borderBottomWidth: 1 },
    scoreMode: { color: c.textSecondary, fontSize: 15 },
    scoreValue: {
      color: c.textPrimary,
      fontSize: 15,
      fontWeight: '700',
      fontVariant: ['tabular-nums'],
    },
  });
