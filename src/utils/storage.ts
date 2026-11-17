import AsyncStorage from '@react-native-async-storage/async-storage';
import { DIG_DIFFICULTIES, type DigDifficulty, type GameMode } from '../constants/modes';

const STORAGE_KEY = 'rosablock:highscores:v1';

export interface HighScores {
  marathon: number;
  zen: number;
  ultra: number;
  party: number;
  /** Best sprint time in ms, or null if no sprint has been completed yet. */
  sprint: number | null;
  /** Best Dig time in ms for each difficulty, or null if none has been completed yet. */
  dig: Record<DigDifficulty, number | null>;
}

export const EMPTY_HIGH_SCORES: HighScores = {
  marathon: 0,
  zen: 0,
  ultra: 0,
  party: 0,
  sprint: null,
  dig: { easy: null, normal: null, hard: null },
};

export interface GameResult {
  mode: GameMode;
  score: number;
  lines: number;
  timeMs: number;
  /** Sprint and Dig only count when the goal was actually reached. */
  completed: boolean;
  /** Dig only: which difficulty was played. */
  difficulty?: DigDifficulty | null;
}

function sanitize(raw: unknown): HighScores {
  const out: HighScores = { ...EMPTY_HIGH_SCORES, dig: { ...EMPTY_HIGH_SCORES.dig } };
  if (typeof raw !== 'object' || raw === null) return out;
  const r = raw as Record<string, unknown>;
  for (const key of ['marathon', 'zen', 'ultra', 'party'] as const) {
    const v = r[key];
    if (typeof v === 'number' && Number.isFinite(v) && v >= 0) out[key] = v;
  }
  if (typeof r.sprint === 'number' && Number.isFinite(r.sprint) && r.sprint > 0) {
    out.sprint = r.sprint;
  }
  if (typeof r.dig === 'object' && r.dig !== null) {
    const dig = r.dig as Record<string, unknown>;
    for (const level of DIG_DIFFICULTIES) {
      const v = dig[level];
      if (typeof v === 'number' && Number.isFinite(v) && v > 0) out.dig[level] = v;
    }
  }
  return out;
}

export async function loadHighScores(): Promise<HighScores> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json ? sanitize(JSON.parse(json)) : { ...EMPTY_HIGH_SCORES };
  } catch {
    return { ...EMPTY_HIGH_SCORES };
  }
}

/** Pure helper: merges a result into the high scores. */
export function applyResult(
  scores: HighScores,
  result: GameResult,
): { scores: HighScores; isNewBest: boolean } {
  const next: HighScores = { ...scores, dig: { ...scores.dig } };
  let isNewBest = false;
  if (result.mode === 'sprint') {
    if (result.completed && (scores.sprint === null || result.timeMs < scores.sprint)) {
      next.sprint = result.timeMs;
      isNewBest = true;
    }
  } else if (result.mode === 'dig') {
    const level = result.difficulty;
    const best = level ? scores.dig[level] : null;
    if (level && result.completed && (best === null || result.timeMs < best)) {
      next.dig[level] = result.timeMs;
      isNewBest = true;
    }
  } else if (result.score > scores[result.mode]) {
    next[result.mode] = result.score;
    isNewBest = true;
  }
  return { scores: next, isNewBest };
}

export async function saveResult(
  result: GameResult,
): Promise<{ scores: HighScores; isNewBest: boolean }> {
  const current = await loadHighScores();
  const merged = applyResult(current, result);
  if (merged.isNewBest) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged.scores));
    } catch {
      // Storage failure must never crash the game; the score is just not persisted.
    }
  }
  return merged;
}
