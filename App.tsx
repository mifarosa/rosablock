import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { COLORS } from './src/constants/colors';
import type { GameMode } from './src/constants/modes';
import GameScreen from './src/screens/GameScreen';
import HomeScreen from './src/screens/HomeScreen';
import {
  DEFAULT_CONTROL_MODE,
  EMPTY_HIGH_SCORES,
  loadControlMode,
  loadHighScores,
  saveControlMode,
  type ControlMode,
  type HighScores,
} from './src/utils/storage';

export default function App() {
  const [mode, setMode] = useState<GameMode | null>(null); // null = home screen
  const [highScores, setHighScores] = useState<HighScores>(EMPTY_HIGH_SCORES);
  const [controlMode, setControlMode] = useState<ControlMode>(DEFAULT_CONTROL_MODE);

  useEffect(() => {
    let alive = true;
    void loadHighScores().then((scores) => {
      if (alive) setHighScores(scores);
    });
    void loadControlMode().then((value) => {
      if (alive) setControlMode(value);
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

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <StatusBar style="light" />
        {mode === null ? (
          <HomeScreen
            highScores={highScores}
            controlMode={controlMode}
            onSelectMode={setMode}
            onChangeControlMode={handleChangeControlMode}
          />
        ) : (
          <GameScreen
            key={mode}
            mode={mode}
            controlMode={controlMode}
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
