# Putting Rosablock on TestFlight

The iOS build runs on GitHub's macOS machine (`.github/workflows/ios-build.yml`). The signing
certificates and provisioning profile live in EAS, so no `.p12` or `.mobileprovision` is needed.

## One-time setup (on your own computer)

1. **Apple Developer account** (99 USD/year) at developer.apple.com.
2. **App Store Connect:** My Apps -> + -> New App. Platform iOS, name **Rosablock**, bundle ID
   `com.mifarosa.rosablock`, SKU `rosablock`. Note the numeric **Apple ID** (App Information).
3. **Link the project to Expo** (writes `owner` and `extra.eas.projectId` into `app.json`; commit it):
   ```bash
   npm install
   npx eas-cli login
   npx eas-cli init
   ```
4. **Create the iOS credentials once.** This needs your Apple login, so it cannot run in CI:
   ```bash
   npx eas-cli credentials -p ios      # or: npx eas-cli build -p ios --profile production
   ```
   For automatic TestFlight upload, also add an App Store Connect API key there, and put the
   Apple ID from step 2 is already set in `eas.json` -> `submit.production.ios.ascAppId`.
5. **GitHub secret:** expo.dev -> Access tokens -> Create token. Then repo -> Settings -> Secrets
   and variables -> Actions -> New repository secret, name `EXPO_TOKEN`. Never commit the token.

## Build

GitHub -> Actions -> **iOS build** -> Run workflow (tick *submit* to upload to TestFlight afterwards).
A build takes 30-60 minutes. The `.ipa` stays downloadable for one day; to upload it by hand:
`npx eas-cli submit -p ios --path rosablock.ipa`.

## Before the first App Store submission

The app icon is `assets/icon.png` (1024x1024, no alpha channel: Apple rejects icons with one).
Bump `expo.version` for each release; the build number is automatic.

## Ads (AdMob)

- AdMob app id (iOS): in `app.json` under the `react-native-google-mobile-ads` plugin. The Android
  id there is still Google's test id (there is no Android app in AdMob yet).
- Rewarded ad unit: `REWARDED_UNIT_ID` in `src/ads/adsConfig.ts`.
- **`ADS_LIVE` is `false`**: builds show Google's labelled test ads, which is what TestFlight and
  testers should see (tapping or farming real ads can get the AdMob account limited). Set it to
  `true` only for the build that goes to the App Store.
- Interstitial (between games): `INTERSTITIAL_UNIT_ID` in `src/ads/adsConfig.ts` (create an
  Interstitial unit in AdMob). Shown when a NEW game starts ("Play again", a fresh mode from the
  menu), never for a continued game, a pause-restart or leaving. Pacing is in `src/ads/adPacing.ts`:
  the first game of a session has none, then every 2nd new game, at least 2.5 minutes after any ad.
- The rewarded ad is offered once per game, only after game over, and only when the player taps
  "Watch an ad to continue" (never automatically). It is not offered in Sprint.
- Consent: `startAds` shows Google's UMP form where required and only requests ads when allowed.
  Create the message in AdMob -> Privacy & messaging (GDPR) and, for iOS, turn on the IDFA
  explainer only if you want personalized ads (requests are non-personalized today). Players in
  regions that require it get an "Ad privacy options" button in Settings.
- Before the App Store review: put `google.com, pub-1672861293331033, DIRECT, f08c47fec0942fa0` in
  `app-ads.txt` on the developer website, link the app to its App Store page in AdMob, and fill
  in App Store Connect -> App Privacy (advertising data, device ID, usage data).
