// How often a full-screen (interstitial) ad may appear. Pure logic, so it is easy to test.

export interface AdPacing {
  /** New games started since the last ad of any kind was shown. */
  gamesSinceAd: number;
  /** When an ad (rewarded or interstitial) was last shown; 0 = none yet this session. */
  lastAdAt: number;
}

/** An interstitial is due on every Nth new game... */
export const INTERSTITIAL_EVERY_N_GAMES = 2;
/** ...but never sooner than this after any ad. */
export const INTERSTITIAL_MIN_GAP_MS = 150_000;

export function createPacing(): AdPacing {
  return { gamesSinceAd: 0, lastAdAt: 0 };
}

export function noteGameStart(pacing: AdPacing): void {
  pacing.gamesSinceAd += 1;
}

export function interstitialDue(
  pacing: AdPacing,
  now: number,
  every: number = INTERSTITIAL_EVERY_N_GAMES,
  minGapMs: number = INTERSTITIAL_MIN_GAP_MS,
): boolean {
  return pacing.gamesSinceAd >= every && now - pacing.lastAdAt >= minGapMs;
}

export function noteAdShown(pacing: AdPacing, now: number): void {
  pacing.gamesSinceAd = 0;
  pacing.lastAdAt = now;
}

/** The pacing of this app session. */
export const sessionPacing: AdPacing = createPacing();
