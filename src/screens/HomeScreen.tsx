import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { MODES, type GameMode } from '../constants/modes';
import type { ControlMode, HighScores } from '../utils/storage';
import { formatTime } from '../utils/format';

interface HomeScreenProps {
  highScores: HighScores;
  controlMode: ControlMode;
  hapticsEnabled: boolean;
  onSelectMode: (mode: GameMode) => void;
  onChangeControlMode: (mode: ControlMode) => void;
  onChangeHaptics: (enabled: boolean) => void;
}

const CONTROL_OPTIONS: { id: ControlMode; title: string; hint: string }[] = [
  { id: 'gestures', title: 'Tuşsuz', hint: 'Dokun: döndür · gölgeye dokun: çat diye indir · kaydır: yana · basılı tut: aşağı' },
  { id: 'buttons', title: 'Tuşlar', hint: 'Tuşlar bir yanda, durum kutusu diğer yanda. Oyunda ⇄ ile yer değiştirir' },
];

function scoreLabel(mode: GameMode, scores: HighScores): string {
  if (mode === 'sprint') return scores.sprint === null ? '—' : formatTime(scores.sprint);
  const value = scores[mode];
  return value > 0 ? String(value) : '—';
}

export default function HomeScreen({
  highScores,
  controlMode,
  hapticsEnabled,
  onSelectMode,
  onChangeControlMode,
  onChangeHaptics,
}: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>ROSABLOCK</Text>
        <Text style={styles.tagline}>sakin · çevrimdışı · reklamsız</Text>

        <Text style={styles.section}>MOD SEÇ</Text>
        {MODES.map((mode) => (
          <Pressable
            key={mode.id}
            accessibilityRole="button"
            accessibilityLabel={`${mode.title} modunu başlat`}
            onPress={() => onSelectMode(mode.id)}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{mode.title}</Text>
              <Text style={styles.cardSubtitle}>{mode.subtitle}</Text>
            </View>
            <Text style={styles.cardDescription}>{mode.description}</Text>
          </Pressable>
        ))}

        <Text style={styles.section}>KONTROL</Text>
        <View style={styles.segment}>
          {CONTROL_OPTIONS.map((opt) => {
            const active = opt.id === controlMode;
            return (
              <Pressable
                key={opt.id}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => onChangeControlMode(opt.id)}
                style={[styles.segmentItem, active && styles.segmentItemActive]}
              >
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                  {opt.title}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={[styles.segmentHint, { marginBottom: 12 }]}>
          {CONTROL_OPTIONS.find((o) => o.id === controlMode)?.hint}
        </Text>

        <View style={styles.segment}>
          {[
            { value: true, title: 'Titreşim açık' },
            { value: false, title: 'Titreşim kapalı' },
          ].map((opt) => {
            const active = opt.value === hapticsEnabled;
            return (
              <Pressable
                key={opt.title}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => onChangeHaptics(opt.value)}
                style={[styles.segmentItem, active && styles.segmentItemActive]}
              >
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                  {opt.title}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.section}>EN İYİLER</Text>
        <View style={styles.scoreTable}>
          {MODES.map((mode, i) => (
            <View
              key={mode.id}
              style={[styles.scoreRow, i < MODES.length - 1 && styles.scoreRowBorder]}
            >
              <Text style={styles.scoreMode}>{mode.title}</Text>
              <Text style={styles.scoreValue}>{scoreLabel(mode.id, highScores)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: { padding: 20, paddingBottom: 40 },
  title: {
    color: COLORS.textPrimary,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 6,
    textAlign: 'center',
    marginTop: 12,
  },
  tagline: { color: COLORS.textSecondary, textAlign: 'center', marginTop: 6, letterSpacing: 1 },
  section: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 28,
    marginBottom: 10,
  },
  card: {
    backgroundColor: COLORS.boardBg,
    borderColor: COLORS.border,
    borderWidth: 2,
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
  },
  cardPressed: { borderColor: COLORS.textSecondary, backgroundColor: COLORS.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  cardTitle: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '700' },
  cardSubtitle: { color: COLORS.textSecondary, fontSize: 12 },
  cardDescription: { color: COLORS.textSecondary, marginTop: 6, fontSize: 14 },
  segment: {
    flexDirection: 'row',
    backgroundColor: COLORS.boardBg,
    borderColor: COLORS.border,
    borderWidth: 2,
    borderRadius: 10,
    padding: 4,
    gap: 4,
  },
  segmentItem: { flex: 1, paddingVertical: 10, borderRadius: 7, alignItems: 'center' },
  segmentItemActive: { backgroundColor: COLORS.textSecondary },
  segmentText: { color: COLORS.textSecondary, fontSize: 15, fontWeight: '700' },
  segmentTextActive: { color: COLORS.background },
  segmentHint: { color: COLORS.textSecondary, opacity: 0.8, fontSize: 13, marginTop: 8 },
  scoreTable: {
    backgroundColor: COLORS.boardBg,
    borderColor: COLORS.border,
    borderWidth: 2,
    borderRadius: 10,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  scoreRowBorder: { borderBottomColor: COLORS.border, borderBottomWidth: 1 },
  scoreMode: { color: COLORS.textSecondary, fontSize: 15 },
  scoreValue: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
