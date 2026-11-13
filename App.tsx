import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { startAds } from './src/ads/rewarded';
import { AppProvider, useApp } from './src/app/AppContext';
import { Dialog, DialogButton, DialogText } from './src/components/Dialog';
import type { GameMode } from './src/constants/modes';
import type { GameState } from './src/hooks/useTetris';
import type { StringKey } from './src/i18n/strings';
import GameScreen from './src/screens/GameScreen';
import HomeScreen from './src/screens/HomeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { clearGame, loadSavedGames, type SavedGames } from './src/utils/saves';
import { EMPTY_HIGH_SCORES, loadHighScores, type HighScores } from './src/utils/storage';

type Screen =
  | { name: 'home' }
  | { name: 'settings' }
  // `initial` is a saved game to continue, or null for a fresh one.
  | { name: 'game'; mode: GameMode; initial: GameState | null };

function Root() {
  const { theme, t } = useApp();
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [highScores, setHighScores] = useState<HighScores>(EMPTY_HIGH_SCORES);
  const [savedGames, setSavedGames] = useState<SavedGames>({});
  // A mode with a saved game asks (in the app's own dialog) whether to continue or start over.
  const [pendingMode, setPendingMode] = useState<GameMode | null>(null);

  useEffect(() => {
    startAds(); // have the first rewarded ad ready by the time a game can end
    let alive = true;
    void loadSavedGames().then((games) => {
      if (alive) setSavedGames(games);
    });
    void loadHighScores().then((scores) => {
      if (alive) setHighScores(scores);
    });
    return () => {
      alive = false;
    };
  }, []);

  const handleExit = useCallback(async () => {
    // The game screen has saved before leaving; the menu shows what is there now.
    setSavedGames(await loadSavedGames());
    setScreen({ name: 'home' });
  }, []);

  const handleSelectMode = useCallback(
    (mode: GameMode) => {
      if (savedGames[mode]) setPendingMode(mode);
      else setScreen({ name: 'game', mode, initial: null });
    },
    [savedGames],
  );

  const pendingSaved = pendingMode ? savedGames[pendingMode] : undefined;

  const continueSaved = () => {
    if (pendingMode && pendingSaved) {
      setScreen({ name: 'game', mode: pendingMode, initial: pendingSaved });
    }
    setPendingMode(null);
  };
  const startOver = () => {
    if (pendingMode) {
      void clearGame(pendingMode);
      setSavedGames((prev) => ({ ...prev, [pendingMode]: undefined }));
      setScreen({ name: 'game', mode: pendingMode, initial: null });
    }
    setPendingMode(null);
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar style="light" />
      {screen.name === 'home' && (
        <HomeScreen
          highScores={highScores}
          savedGames={savedGames}
          onSelectMode={handleSelectMode}
          onOpenSettings={() => setScreen({ name: 'settings' })}
        />
      )}
      {screen.name === 'settings' && <SettingsScreen onBack={() => setScreen({ name: 'home' })} />}
      {screen.name === 'game' && (
        <GameScreen
          key={screen.mode}
          mode={screen.mode}
          initialState={screen.initial}
          onExit={handleExit}
          onScoresChanged={setHighScores}
        />
      )}
      {screen.name === 'home' && pendingMode !== null && pendingSaved && (
        <Dialog title={t(`mode.${pendingMode}.title` as StringKey)}>
          <DialogText>
            {t('home.resumeText', { score: pendingSaved.score, lines: pendingSaved.lines })}
          </DialogText>
          <DialogButton label={t('common.continue')} onPress={continueSaved} />
          <DialogButton label={t('common.startOver')} onPress={startOver} secondary />
          <DialogButton label={t('common.cancel')} onPress={() => setPendingMode(null)} secondary />
        </Dialog>
      )}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <Root />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
