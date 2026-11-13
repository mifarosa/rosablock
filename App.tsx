import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { COLORS } from './src/constants/colors';
import type { GameMode } from './src/constants/modes';
import { setHapticsEnabled } from './src/utils/haptics';
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
  const [mode, setMode] = useState<GameMode | null>(null); // null = home screen
  const [highScores, setHighScores] = useState<HighScores>(EMPTY_HIGH_SCORES);
  const [controlMode, setControlMode] = useState<ControlMode>(DEFAULT_CONTROL_MODE);
  const [controlSide, setControlSide] = useState<ControlSide>(DEFAULT_CONTROL_SIDE);
  const [hapticsEnabled, setHapticsState] = useState(true);

  useEffect(() => {
    let alive = true;
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

  const handleExit = useCallback(() => setMode(null), []);
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
        {mode === null ? (
          <HomeScreen
            highScores={highScores}
            controlMode={controlMode}
            hapticsEnabled={hapticsEnabled}
            onSelectMode={setMode}
            onChangeControlMode={handleChangeControlMode}
            onChangeHaptics={handleChangeHaptics}
          />
        ) : (
          <GameScreen
            key={mode}
            mode={mode}
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
