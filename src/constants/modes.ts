export type GameMode = 'marathon' | 'sprint' | 'zen' | 'ultra';

export interface ModeInfo {
  id: GameMode;
  title: string;
  subtitle: string;
  description: string;
}

export const MODES: readonly ModeInfo[] = [
  {
    id: 'marathon',
    title: 'Maraton',
    subtitle: 'Klasik · 15 seviye',
    description: 'Satır temizledikçe hız artar. 150 satıra ulaş.',
  },
  {
    id: 'sprint',
    title: 'Sprint',
    subtitle: '40 satır',
    description: '40 satırı en kısa sürede temizle.',
  },
  {
    id: 'zen',
    title: 'Zen',
    subtitle: 'Rahatlatıcı',
    description: 'Hızlanma yok, oyun bitmez. Sadece keyfine bak.',
  },
  {
    id: 'ultra',
    title: 'Ultra',
    subtitle: '2 dakika',
    description: '2 dakikada olabildiğince çok puan topla.',
  },
];

export const SPRINT_TARGET_LINES = 40;
export const MARATHON_TARGET_LINES = 150;
export const MARATHON_MAX_LEVEL = 15;
export const ULTRA_DURATION_MS = 120_000;
