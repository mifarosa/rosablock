import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GameMode } from '../constants/modes';

const STORAGE_KEY = 'rosablock:highscores:v1';

export interface HighScores {
  marathon: number;
  zen: number;
  ultra: number;
  /** Best sprint time in ms, or null if no sprint has been completed yet. */
  sprint: number | null;
}

export const EMPTY_HIGH_SCORES: HighScores = {
  marathon: 0,
  zen: 0,
  ultra: 0,
  sprint: null,
};

export interface GameResult {
  mode: GameMode;
  score: number;
  lines: number;
  timeMs: number;
  /** Sprint only counts when the 40 lines were actually cleared. */
  completed: boolean;
}

function sanitize(raw: unknown): HighScores {
  const out: HighScores = { ...EMPTY_HIGH_SCORES };
  if (typeof raw !== 'object' || raw === null) return out;
  const r = raw as Record<string, unknown>;
  for (const key of ['marathon', 'zen', 'ultra'] as const) {
    const v = r[key];
    if (typeof v === 'number' && Number.isFinite(v) && v >= 0) out[key] = v;
  }
  if (typeof r.sprint === 'number' && Number.isFinite(r.sprint) && r.sprint > 0) {
    out.sprint = r.sprint;
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
  const next: HighScores = { ...scores };
  let isNewBest = false;
  if (result.mode === 'sprint') {
    if (result.completed && (scores.sprint === null || result.timeMs < scores.sprint)) {
      next.sprint = result.timeMs;
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

// ---------------------------------------------------------------------------
// Control mode setting
// ---------------------------------------------------------------------------

export type ControlMode = 'gestures' | 'buttons';

export const DEFAULT_CONTROL_MODE: ControlMode = 'gestures';
const CONTROL_KEY = 'rosablock:controls:v1';

export async function loadControlMode(): Promise<ControlMode> {
  try {
    const value = await AsyncStorage.getItem(CONTROL_KEY);
    return value === 'buttons' || value === 'gestures' ? value : DEFAULT_CONTROL_MODE;
  } catch {
    return DEFAULT_CONTROL_MODE;
  }
}

export async function saveControlMode(mode: ControlMode): Promise<void> {
  try {
    await AsyncStorage.setItem(CONTROL_KEY, mode);
  } catch {
    // Not persisting the preference is harmless.
  }
}

/** Which side of the screen the buttons are on (the status box takes the other side). */
export type ControlSide = 'left' | 'right';

export const DEFAULT_CONTROL_SIDE: ControlSide = 'right';
const SIDE_KEY = 'rosablock:side:v1';

export async function loadControlSide(): Promise<ControlSide> {
  try {
    const value = await AsyncStorage.getItem(SIDE_KEY);
    return value === 'left' || value === 'right' ? value : DEFAULT_CONTROL_SIDE;
  } catch {
    return DEFAULT_CONTROL_SIDE;
  }
}

export async function saveControlSide(side: ControlSide): Promise<void> {
  try {
    await AsyncStorage.setItem(SIDE_KEY, side);
  } catch {
    // Not persisting the preference is harmless.
  }
}

// ---------------------------------------------------------------------------
// Haptics setting
// ---------------------------------------------------------------------------

const HAPTICS_KEY = 'rosablock:haptics:v1';

export async function loadHapticsEnabled(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(HAPTICS_KEY)) !== 'off';
  } catch {
    return true;
  }
}

export async function saveHapticsEnabled(value: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(HAPTICS_KEY, value ? 'on' : 'off');
  } catch {
    // Not persisting the preference is harmless.
  }
}
