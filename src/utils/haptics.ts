import * as Haptics from 'expo-haptics';

let enabled = true;

export function setHapticsEnabled(value: boolean): void {
  enabled = value;
}

function run(fn: () => Promise<void>): void {
  if (!enabled) return;
  try {
    fn().catch(() => {});
  } catch {
    // Haptics are a nicety; a device or build without them must never break the game.
  }
}

const impact = (style: Haptics.ImpactFeedbackStyle) => run(() => Haptics.impactAsync(style));
const notify = (type: Haptics.NotificationFeedbackType) =>
  run(() => Haptics.notificationAsync(type));

/** Feel grows with the number of rows: 1 firm tap, 2 heavier, 3 double thud, 4 (tetris) a burst. */
export function lineClearHaptic(rows: number): void {
  impact(rows === 1 ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Heavy);
  if (rows >= 3) {
    setTimeout(() => impact(Haptics.ImpactFeedbackStyle.Heavy), 90);
  }
  if (rows >= 4) {
    setTimeout(() => notify(Haptics.NotificationFeedbackType.Success), 180);
  }
}

/** A short, solid thud when a piece is dropped to the bottom. */
export function dropHaptic(): void {
  impact(Haptics.ImpactFeedbackStyle.Rigid);
}

export function gameOverHaptic(): void {
  notify(Haptics.NotificationFeedbackType.Error);
}

export function finishHaptic(): void {
  notify(Haptics.NotificationFeedbackType.Success);
}

/** A light tick when the hold charge is full and the piece starts to soft drop. */
export function chargeHaptic(): void {
  impact(Haptics.ImpactFeedbackStyle.Light);
}
