import { ADS_LIVE, REWARDED_UNIT_ID } from './adsConfig';
import { getSdk, type AdsSdk } from './adsSdk';

/** How long a player waits for an ad that is still loading before it counts as not there. */
export const LOAD_WAIT_MS = 8000;

type AdState = 'loading' | 'loaded' | 'failed';

interface RewardedAdLike {
  addAdEventListener: (type: string, listener: () => void) => () => void;
  removeAllListeners: () => void;
  load: () => void;
  show: () => Promise<void>;
}

let current: { ad: RewardedAdLike | null; state: AdState } | null = null;
let waiting: (() => void)[] = [];

function wake(): void {
  const list = waiting;
  waiting = [];
  for (const resolve of list) resolve();
}

/** Asks for the next ad, unless one is on its way or ready. */
function load(): void {
  if (current && current.state !== 'failed') return;
  const entry: NonNullable<typeof current> = { ad: null, state: 'loading' };
  current = entry;
  try {
    const ads = getSdk();
    if (!ads) throw new Error('no ads in this build');
    if (ADS_LIVE && !REWARDED_UNIT_ID) throw new Error('no ad unit id');
    // Without a consent form there is no personalized advertising: the ads are the plain kind.
    const ad = ads.RewardedAd.createForAdRequest(
      ADS_LIVE ? REWARDED_UNIT_ID : ads.TestIds.REWARDED,
      { requestNonPersonalizedAdsOnly: true },
    ) as unknown as RewardedAdLike;
    entry.ad = ad;
    ad.addAdEventListener(ads.RewardedAdEventType.LOADED, () => {
      entry.state = 'loaded';
      wake();
    });
    ad.addAdEventListener(ads.AdEventType.ERROR, () => {
      if (entry.state === 'loading') entry.state = 'failed';
      wake();
    });
    ad.load();
  } catch {
    entry.state = 'failed';
    wake();
  }
}

/**
 * Asks for consent where the law requires it (Google's UMP form, shown to users in the EEA, UK
 * and Switzerland when it is configured in AdMob), then says whether ads may be requested.
 */
async function mayRequestAds(ads: AdsSdk): Promise<boolean> {
  try {
    await ads.AdsConsent.gatherConsent();
  } catch {
    // No network or no form configured: what was stored before decides below.
  }
  try {
    return (await ads.AdsConsent.getConsentInfo()).canRequestAds !== false;
  } catch {
    return true;
  }
}

/** Starts the ads SDK and has the first ad ready; call it once when the app opens. */
export function startAds(): void {
  try {
    const ads = getSdk();
    if (!ads) return;
    mayRequestAds(ads)
      .then((allowed) => {
        if (!allowed) return undefined;
        return ads
          .default()
          .setRequestConfiguration({
            maxAdContentRating: ads.MaxAdContentRating.PG,
            tagForChildDirectedTreatment: false,
            tagForUnderAgeOfConsent: false,
          })
          .then(() => ads.default().initialize())
          .then(load);
      })
      .catch(() => {});
  } catch {
    // An app without ads is still a game.
  }
}

/** Whether the settings should offer the "ad privacy options" form (required in some regions). */
export async function privacyOptionsRequired(): Promise<boolean> {
  try {
    const ads = getSdk();
    if (!ads) return false;
    const info = await ads.AdsConsent.getConsentInfo();
    return info.privacyOptionsRequirementStatus === ads.AdsConsentPrivacyOptionsRequirementStatus.REQUIRED;
  } catch {
    return false;
  }
}

export async function showPrivacyOptions(): Promise<void> {
  try {
    await getSdk()?.AdsConsent.showPrivacyOptionsForm();
  } catch {
    // Nothing to show.
  }
}

/** Resolves when the ad that is loading is ready or has failed, or after a while. */
function waitForLoad(): Promise<void> {
  return new Promise((resolve) => {
    waiting.push(resolve);
    setTimeout(resolve, LOAD_WAIT_MS);
  });
}

export type AdResult = 'rewarded' | 'closed' | 'unavailable';

/**
 * Shows a rewarded ad. Resolves to 'rewarded' when it was watched to the end, 'closed' when the
 * player left before that, and 'unavailable' when there was no ad to show.
 */
export async function watchRewardedAd(): Promise<AdResult> {
  try {
    const ads = getSdk();
    if (!ads) return 'unavailable';
    if (!current || current.state === 'failed') load();
    if (current?.state === 'loading') await waitForLoad();
    const entry = current;
    if (!entry || entry.state !== 'loaded' || !entry.ad) return 'unavailable';
    const ad = entry.ad;

    return await new Promise<AdResult>((resolve) => {
      let earned = false;
      let finished = false;
      const finish = (result: AdResult) => {
        if (finished) return;
        finished = true;
        ad.removeAllListeners();
        // The next ad is asked for as soon as this one is gone.
        current = null;
        load();
        resolve(result);
      };
      ad.addAdEventListener(ads.RewardedAdEventType.EARNED_REWARD, () => {
        earned = true;
      });
      ad.addAdEventListener(ads.AdEventType.CLOSED, () => finish(earned ? 'rewarded' : 'closed'));
      ad.addAdEventListener(ads.AdEventType.ERROR, () => finish('unavailable'));
      ad.show().catch(() => finish('unavailable'));
    });
  } catch {
    return 'unavailable';
  }
}
