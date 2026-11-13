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
