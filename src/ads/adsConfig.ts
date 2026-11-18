/**
 * Whether the app shows real ads. Only the `store` EAS build profile (the one meant for the App
 * Store) turns it on, through EXPO_PUBLIC_ADS_LIVE; every other build (development, preview, the
 * TestFlight `production` profile) shows Google's labelled test ads, which cost the account
 * nothing. Never tap real ads yourself.
 */
export const ADS_LIVE = process.env.EXPO_PUBLIC_ADS_LIVE === 'true';

/**
 * The rewarded ad unit of Rosablock in AdMob (not a secret: it is in every copy of the app).
 * The AdMob app id (`ca-app-pub-1672861293331033~9869195588`) is in app.json, under the
 * react-native-google-mobile-ads plugin.
 */
export const REWARDED_UNIT_ID = 'ca-app-pub-1672861293331033/6375518180';

/**
 * The interstitial ad unit (shown between games) in AdMob. With ADS_LIVE on and no id, no
 * interstitial is shown at all.
 */
export const INTERSTITIAL_UNIT_ID = 'ca-app-pub-1672861293331033/2105100681';
