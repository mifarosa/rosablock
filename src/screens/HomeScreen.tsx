import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../app/AppContext';
import GearIcon from '../components/GearIcon';
import ThemeBackground from '../components/ThemeBackground';
import type { ThemeColors } from '../constants/colors';
import { MODES, type GameMode } from '../constants/modes';
import type { StringKey } from '../i18n/strings';
import type { SavedGames } from '../utils/saves';
import type { HighScores } from '../utils/storage';
import { formatTime } from '../utils/format';

interface HomeScreenProps {
  highScores: HighScores;
  savedGames: SavedGames;
  onSelectMode: (mode: GameMode) => void;
  onOpenSettings: () => void;
}

function scoreLabel(mode: GameMode, scores: HighScores): string {
  if (mode === 'sprint') return scores.sprint === null ? '—' : formatTime(scores.sprint);
  const value = scores[mode];
  return value > 0 ? String(value) : '—';
}

export default function HomeScreen({
  highScores,
  savedGames,
  onSelectMode,
  onOpenSettings,
}: HomeScreenProps) {
  const { theme, t } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const modeKey = (id: GameMode, part: 'title' | 'subtitle' | 'description') =>
    t(`mode.${id}.${part}` as StringKey);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ThemeBackground />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('home.settings')}
        onPress={onOpenSettings}
        hitSlop={8}
        style={({ pressed }) => [
          styles.gear,
          { top: insets.top + 10 },
          pressed && styles.gearPressed,
        ]}
      >
        {({ pressed }) => (
          <GearIcon color={pressed ? theme.textPrimary : theme.textSecondary} />
        )}
      </Pressable>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>ROSABLOCK</Text>
        <Text style={styles.tagline}>{t('home.tagline')}</Text>

        <Text style={styles.section}>{t('home.pickMode')}</Text>
        {MODES.map(({ id }) => {
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

        <Text style={styles.section}>{t('home.best')}</Text>
        <View style={styles.scoreTable}>
          {MODES.map(({ id }, i) => (
            <View
              key={id}
              style={[styles.scoreRow, i < MODES.length - 1 && styles.scoreRowBorder]}
            >
              <Text style={styles.scoreMode}>{modeKey(id, 'title')}</Text>
              <Text style={styles.scoreValue}>{scoreLabel(id, highScores)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.background },
    gear: {
      position: 'absolute',
      right: 16,
      zIndex: 2,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: c.boardBg,
      borderWidth: 2,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    gearPressed: { backgroundColor: c.border, borderColor: c.textSecondary },
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
