// Muted, eye-friendly "rose" palette. No neon colors anywhere in the UI.
import type { TetrominoType } from './tetrominos';

export const COLORS = {
  background: '#1A1416',
  boardBg: '#261C20',
  border: '#3D2A30',
  textPrimary: '#F7E8EC',
  textSecondary: '#C59EA9',
  overlay: 'rgba(26, 20, 22, 0.88)',
  ghost: 'rgba(247, 232, 236, 0.12)',
} as const;

export const PIECE_COLORS: Record<TetrominoType, string> = {
  I: '#E8A5B8', // dusty pink
  J: '#D8839F', // deep powder
  L: '#F0B6A6', // peach pink
  O: '#E4A0A0', // antique rose
  S: '#C97A9E', // rose lilac
  T: '#B66685', // dried rose
  Z: '#9E4B6C', // burgundy rose
};
