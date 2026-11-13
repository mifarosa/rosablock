// Muted, eye-friendly palettes. No neon colors anywhere in the UI.
import type { TetrominoType } from './tetrominos';

export type ThemeId = 'rose' | 'lavender' | 'mint';

export interface ThemeColors {
  id: ThemeId;
  background: string;
  boardBg: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  overlay: string;
  ghost: string;
  pieces: Record<TetrominoType, string>;
}

const rose: ThemeColors = {
  id: 'rose',
  background: '#1A1416', // deep dried rose / matte dark grey
  boardBg: '#261C20',
  border: '#3D2A30',
  textPrimary: '#F7E8EC', // soft powder pink
  textSecondary: '#C59EA9',
  overlay: 'rgba(26, 20, 22, 0.88)',
  ghost: 'rgba(247, 232, 236, 0.12)',
  pieces: {
    I: '#E8A5B8', // dusty pink
    J: '#D8839F', // deep powder
    L: '#F0B6A6', // peach pink
    O: '#E4A0A0', // antique rose
    S: '#C97A9E', // rose lilac
    T: '#B66685', // dried rose
    Z: '#9E4B6C', // burgundy rose
  },
};

const lavender: ThemeColors = {
  id: 'lavender',
  background: '#16141C',
  boardBg: '#201C29',
  border: '#37314B',
  textPrimary: '#EEE9F8',
  textSecondary: '#A9A0CB',
  overlay: 'rgba(22, 20, 28, 0.88)',
  ghost: 'rgba(238, 233, 248, 0.12)',
  pieces: {
    I: '#C4B3F0',
    J: '#9488DA',
    L: '#DABDF0',
    O: '#C9A6E0',
    S: '#A98EE2',
    T: '#8B74BF',
    Z: '#6E5BA0',
  },
};

const mint: ThemeColors = {
  id: 'mint',
  background: '#121916',
  boardBg: '#18231F',
  border: '#2A413A',
  textPrimary: '#E5F5EE',
  textSecondary: '#8FBFAF',
  overlay: 'rgba(18, 25, 22, 0.88)',
  ghost: 'rgba(229, 245, 238, 0.12)',
  pieces: {
    I: '#A9E1CA',
    J: '#7DC7A8',
    L: '#CBE7B9',
    O: '#9ED8B3',
    S: '#6DB499',
    T: '#58998A',
    Z: '#3D7B6C',
  },
};

export const THEMES: Record<ThemeId, ThemeColors> = { rose, lavender, mint };
export const THEME_IDS: readonly ThemeId[] = ['rose', 'lavender', 'mint'];
export const DEFAULT_THEME: ThemeId = 'rose';
