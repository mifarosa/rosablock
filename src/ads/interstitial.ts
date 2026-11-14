import { ADS_LIVE, INTERSTITIAL_UNIT_ID } from './adsConfig';
import { interstitialDue, noteAdShown, noteGameStart, sessionPacing } from './adPacing';
import { getSdk } from './adsSdk';

interface InterstitialLike {
  addAdEventListener: (type: string, listener: () => void) => () => void;
  removeAllListeners: () => void;
  load: () => void;
  show: () => Promise<void>;
}

let ad: InterstitialLike | null = null;
let state: 'idle' | 'loading' | 'loaded' = 'idle';

/** Asks for the next interstitial, unless one is on its way or ready. Called once ads may start. */
export function loadInterstitial(): void {
  if (state !== 'idle') return;
  try {
    const ads = getSdk();
    if (!ads) return;
    if (ADS_LIVE && !INTERSTITIAL_UNIT_ID) return; // not created in AdMob yet
    state = 'loading';
    const next = ads.InterstitialAd.createForAdRequest(
      ADS_LIVE ? INTERSTITIAL_UNIT_ID : ads.TestIds.INTERSTITIAL,
      { requestNonPersonalizedAdsOnly: true },
    ) as unknown as InterstitialLike;
    ad = next;
    next.addAdEventListener(ads.AdEventType.LOADED, () => {
      state = 'loaded';
    });
    next.addAdEventListener(ads.AdEventType.ERROR, () => {
      if (state === 'loading') {
        state = 'idle';
        ad = null;
      }
    });
    next.load();
  } catch {
    state = 'idle';
    ad = null;
  }
}

/**
 * Call when a NEW game is about to start (not when a saved game continues). Shows an interstitial
 * if the pacing says it is due and one is ready; otherwise returns at once, so the player never
 * waits for an ad. Resolves when the ad is closed (or straight away when there is none).
 */
export async function maybeShowInterstitial(): Promise<void> {
  noteGameStart(sessionPacing);
  try {
    const ads = getSdk();
    const ready = ad;
    if (!ads || !ready || state !== 'loaded') {
      loadInterstitial();
      return;
    }
    if (!interstitialDue(sessionPacing, Date.now())) return;

    await new Promise<void>((resolve) => {
      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        ready.removeAllListeners();
        ad = null;
        state = 'idle';
        loadInterstitial(); // the next one is asked for as soon as this one is gone
        resolve();
      };
      ready.addAdEventListener(ads.AdEventType.CLOSED, finish);
      ready.addAdEventListener(ads.AdEventType.ERROR, finish);
      noteAdShown(sessionPacing, Date.now());
      ready.show().catch(finish);
    });
  } catch {
    // A game that starts without the ad is still a game.
  }
}
