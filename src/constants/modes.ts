// The game modes. Their names and descriptions live in the translations (`mode.<id>.title` ...).
export type GameMode = 'marathon' | 'sprint' | 'zen' | 'ultra';

export const MODES: readonly { id: GameMode }[] = [
  { id: 'marathon' },
  { id: 'sprint' },
  { id: 'zen' },
  { id: 'ultra' },
];

export const SPRINT_TARGET_LINES = 40;
export const MARATHON_TARGET_LINES = 150;
export const MARATHON_MAX_LEVEL = 15;
export const ULTRA_DURATION_MS = 120_000;
