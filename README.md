# Rosablock

A calm, nostalgic Tetris for iOS and Android, built with React Native (Expo). Soft, muted colors that are easy on the eyes, synthesized "sweet" sounds, and a game that works fully offline.

[Türkçe](README.tr.md)

## Features

- **Four modes**
  - **Marathon**: classic, 15 levels; speed rises as you clear lines; ends at 150 lines.
  - **Sprint**: clear 40 lines as fast as you can (timed).
  - **Calm**: no speed-ups, play at your own pace; it ends when the board fills up.
  - **Ultra**: score as much as you can in 2 minutes.
- **Two ways to play**
  - **Gestures** (full screen): tap to rotate, drag sideways to move, hold to drop fast (a fill rises through the piece while you hold), flick down to hard drop.
  - **Buttons**: a compact 2x2 pad next to a status box, built for one thumb; a small ⇄ button swaps the sides.
- **Real Tetris rules**: SRS rotation with wall kicks, 7-bag randomizer, ghost piece, hold piece (once per piece), level-based gravity.
- **Feel**: cleared rows flash before they collapse, the board shakes on a 3 or 4 line clear, haptics scale with the number of rows.
- **Autosave and resume**: every mode keeps its own saved game; picking a mode with a saved game asks "Continue / Start over", and a continued game starts with a 3-2-1 countdown.
- **Best scores** per mode (Sprint keeps the best time).
- **Languages**: English and Turkish (follows the device language, changeable in Settings).
- **Themes**: Rose, Lavender and Mint, the last two with soft vector backdrops (lavender sprigs, mint branches).
- **Sound**: soft marimba and bell-like effects and a calm music loop, all synthesized by a script (no samples). Effects and music have separate switches; the phone's silent switch is respected.
- **Ads**: a rewarded ad can continue a game once after game over (the top 10 rows are cleared); an interstitial may appear between games, paced so it is not annoying. Consent is asked where the law requires it.

## Tech

- Expo SDK 58, React Native 0.88, React 19, TypeScript (strict)
- `@react-native-async-storage/async-storage`: best scores, settings, saved games
- `expo-audio`, `expo-haptics`, `react-native-svg`, `react-native-safe-area-context`
- `react-native-google-mobile-ads`: AdMob (rewarded and interstitial) with UMP consent

Gameplay needs no network; only ads do.

## Getting started

```bash
npm install
npm run typecheck      # strict TypeScript check
npx expo start         # dev server
```

Parts of the app have native code (ads, audio, haptics, SVG). A development or TestFlight build is the reference; features whose native module is missing (ads, sound) are skipped instead of crashing.

Regenerate the sounds and the music (needs `ffmpeg` for the music):

```bash
node scripts/makeSounds.mjs
```

## Project structure

```
App.tsx                  entry point: providers and screen routing
src/
  ads/                   AdMob: rewarded, interstitial, pacing, consent
  app/AppContext.tsx     settings, theme and translations for the whole app
  components/            Board, Controls, GestureArea, ScoreBoard, Dialog, ThemeBackground ...
  constants/             tetrominoes (SRS shapes and kicks), modes, themes, vector backdrops
  hooks/useTetris.ts     the game engine (pure functions) and its React hook
  i18n/strings.ts        English and Turkish texts
  screens/               Home, Game, Settings
  settings/              settings model, defaults and storage
  utils/                 saves, storage, haptics, sound, gesture tracker, formatting
scripts/makeSounds.mjs   synthesizes the sounds and the music
```

The engine in `src/hooks/useTetris.ts` is plain functions on an immutable `GameState` (collision, rotation with kicks, line clearing, scoring, hold, revive), driven by a thin hook that owns the timers.

## Release

Builds run on GitHub (`.github/workflows/ios-build.yml`) with EAS. See [RELEASE.md](RELEASE.md) for setup, TestFlight and the ads checklist.

`ADS_LIVE` in `src/ads/adsConfig.ts` is `false` so test builds show Google's test ads; set it to `true` only for the App Store build.
