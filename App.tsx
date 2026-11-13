import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { COLORS } from './src/constants/colors';
import { MODES, type GameMode } from './src/constants/modes';
import type { GameState } from './src/hooks/useTetris';
import { setHapticsEnabled } from './src/utils/haptics';
import { clearGame, loadSavedGames, type SavedGames } from './src/utils/saves';
import GameScreen from './src/screens/GameScreen';
import HomeScreen from './src/screens/HomeScreen';
import {
  DEFAULT_CONTROL_MODE,
  DEFAULT_CONTROL_SIDE,
  EMPTY_HIGH_SCORES,
  loadControlMode,
  loadControlSide,
  loadHapticsEnabled,
  loadHighScores,
  saveControlMode,
  saveControlSide,
  saveHapticsEnabled,
  type ControlMode,
  type ControlSide,
  type HighScores,
} from './src/utils/storage';

export default function App() {
  // null = home screen. `initial` is a saved game to continue, or null for a fresh one.
  const [session, setSession] = useState<{ mode: GameMode; initial: GameState | null } | null>(
    null,
  );
  const [savedGames, setSavedGames] = useState<SavedGames>({});
  const [highScores, setHighScores] = useState<HighScores>(EMPTY_HIGH_SCORES);
  const [controlMode, setControlMode] = useState<ControlMode>(DEFAULT_CONTROL_MODE);
  const [controlSide, setControlSide] = useState<ControlSide>(DEFAULT_CONTROL_SIDE);
  const [hapticsEnabled, setHapticsState] = useState(true);

  useEffect(() => {
    let alive = true;
    void loadSavedGames().then((games) => {
      if (alive) setSavedGames(games);
    });
    void loadHighScores().then((scores) => {
      if (alive) setHighScores(scores);
    });
    void loadControlMode().then((value) => {
      if (alive) setControlMode(value);
    });
    void loadControlSide().then((value) => {
      if (alive) setControlSide(value);
    });
    void loadHapticsEnabled().then((value) => {
      if (!alive) return;
      setHapticsState(value);
      setHapticsEnabled(value);
    });
    return () => {
      alive = false;
    };
  }, []);

  const handleExit = useCallback(async () => {
    // The game screen has saved before leaving; the menu shows what is there now.
    setSavedGames(await loadSavedGames());
    setSession(null);
  }, []);

  // A mode with a saved game asks whether to continue it or start over.
  const handleSelectMode = useCallback(
    (mode: GameMode) => {
      const saved = savedGames[mode];
      if (!saved) {
        setSession({ mode, initial: null });
        return;
      }
      const title = MODES.find((m) => m.id === mode)?.title ?? '';
      Alert.alert(title, `Kaldığın yerden devam edebilirsin (${saved.score} puan, ${saved.lines} satır).`, [
        { text: 'Devam Et', onPress: () => setSession({ mode, initial: saved }) },
        {
          text: 'Yeni Başla',
          style: 'destructive',
          onPress: () => {
            void clearGame(mode);
            setSavedGames((prev) => ({ ...prev, [mode]: undefined }));
            setSession({ mode, initial: null });
          },
        },
        { text: 'İptal', style: 'cancel' },
      ]);
    },
    [savedGames],
  );
  const handleChangeControlMode = useCallback((value: ControlMode) => {
    setControlMode(value);
    void saveControlMode(value);
  }, []);

  const handleChangeControlSide = useCallback((value: ControlSide) => {
    setControlSide(value);
    void saveControlSide(value);
  }, []);

  const handleChangeHaptics = useCallback((value: boolean) => {
    setHapticsState(value);
    setHapticsEnabled(value);
    void saveHapticsEnabled(value);
  }, []);

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <StatusBar style="light" />
        {session === null ? (
          <HomeScreen
            highScores={highScores}
            savedGames={savedGames}
            controlMode={controlMode}
            hapticsEnabled={hapticsEnabled}
            onSelectMode={handleSelectMode}
            onChangeControlMode={handleChangeControlMode}
            onChangeHaptics={handleChangeHaptics}
          />
        ) : (
          <GameScreen
            key={session.mode}
            mode={session.mode}
            initialState={session.initial}
            controlMode={controlMode}
            controlSide={controlSide}
            onChangeControlSide={handleChangeControlSide}
            onExit={handleExit}
            onScoresChanged={setHighScores}
          />
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
});
