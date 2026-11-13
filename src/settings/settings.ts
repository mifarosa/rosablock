import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_THEME, THEME_IDS, type ThemeId } from '../constants/colors';
import { LANGUAGES, detectLanguage, type Language } from '../i18n/strings';

export type ControlMode = 'gestures' | 'buttons';
/** Which side of the screen the buttons are on (the status box takes the other side). */
export type ControlSide = 'left' | 'right';

export interface Settings {
  language: Language;
  theme: ThemeId;
  controlMode: ControlMode;
  controlSide: ControlSide;
  haptics: boolean;
  sound: boolean;
  music: boolean;
}

export function defaultSettings(): Settings {
  return {
    language: detectLanguage(),
    theme: DEFAULT_THEME,
    controlMode: 'gestures',
    controlSide: 'right',
    haptics: true,
    sound: true,
    music: true,
  };
}

const STORAGE_KEY = 'rosablock:settings:v2';

/** Anything unknown or damaged falls back to the default for that field. */
export function sanitizeSettings(raw: unknown): Settings {
  const out = defaultSettings();
  if (typeof raw !== 'object' || raw === null) return out;
  const r = raw as Record<string, unknown>;
  if (typeof r.language === 'string' && (LANGUAGES as readonly string[]).includes(r.language)) {
    out.language = r.language as Language;
  }
  if (typeof r.theme === 'string' && (THEME_IDS as readonly string[]).includes(r.theme)) {
    out.theme = r.theme as ThemeId;
  }
  if (r.controlMode === 'gestures' || r.controlMode === 'buttons') out.controlMode = r.controlMode;
  if (r.controlSide === 'left' || r.controlSide === 'right') out.controlSide = r.controlSide;
  if (typeof r.haptics === 'boolean') out.haptics = r.haptics;
  if (typeof r.sound === 'boolean') out.sound = r.sound;
  if (typeof r.music === 'boolean') out.music = r.music;
  return out;
}

export async function loadSettings(): Promise<Settings> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return sanitizeSettings(json ? JSON.parse(json) : null);
  } catch {
    return defaultSettings();
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Not persisting a preference is harmless.
  }
}
