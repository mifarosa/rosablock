/**
 * Whether the app shows real ads. While it is false (testing, TestFlight) it shows Google's test
 * ads, which are labelled as such and cost the account nothing; never tap real ads yourself.
 * Set it to true, with the real ids below, for the build that goes to the App Store.
 */
export const ADS_LIVE = false;

/**
 * The rewarded ad unit of Rosablock in AdMob (not a secret: it is in every copy of the app).
 * The AdMob app id (`ca-app-pub-1672861293331033~9869195588`) is in app.json, under the
 * react-native-google-mobile-ads plugin.
 */
export const REWARDED_UNIT_ID = 'ca-app-pub-1672861293331033/6375518180';
