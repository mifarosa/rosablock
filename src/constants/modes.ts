// The game modes. Their names and descriptions live in the translations (`mode.<id>.title` ...).
export type GameMode = 'marathon' | 'sprint' | 'zen' | 'ultra' | 'party' | 'dig';

export type ModeKind = 'classic' | 'fun';

export const MODES: readonly { id: GameMode; kind: ModeKind }[] = [
  { id: 'marathon', kind: 'classic' },
  { id: 'sprint', kind: 'classic' },
  { id: 'zen', kind: 'classic' },
  { id: 'ultra', kind: 'classic' },
  { id: 'party', kind: 'fun' },
  { id: 'dig', kind: 'fun' },
];

export const SPRINT_TARGET_LINES = 40;
export const MARATHON_TARGET_LINES = 150;
export const MARATHON_MAX_LEVEL = 15;
export const ULTRA_DURATION_MS = 120_000;

/** Dig: how many junk rows the board starts with, and how fast the pieces fall, per difficulty. */
export type DigDifficulty = 'easy' | 'normal' | 'hard';
export const DIG_DIFFICULTIES: readonly DigDifficulty[] = ['easy', 'normal', 'hard'];
export const DIG_ROWS: Record<DigDifficulty, number> = { easy: 6, normal: 10, hard: 14 };
export const DIG_LEVEL: Record<DigDifficulty, number> = { easy: 1, normal: 3, hard: 5 };

/** Party: a power-up comes with every third piece in a row that clears lines. */
export const PARTY_COMBO_FOR_BOMB = 3;
/** Party: the slow-down after a four-row clear lasts this long. */
export const PARTY_SLOW_MS = 10_000;
