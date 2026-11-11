import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { COLORS } from './src/constants/colors';
import type { GameMode } from './src/constants/modes';
import GameScreen from './src/screens/GameScreen';
import HomeScreen from './src/screens/HomeScreen';
import { EMPTY_HIGH_SCORES, loadHighScores, type HighScores } from './src/utils/storage';

export default function App() {
  const [mode, setMode] = useState<GameMode | null>(null); // null = home screen
  const [highScores, setHighScores] = useState<HighScores>(EMPTY_HIGH_SCORES);

  useEffect(() => {
    let alive = true;
    void loadHighScores().then((scores) => {
      if (alive) setHighScores(scores);
    });
    return () => {
      alive = false;
    };
  }, []);

  const handleExit = useCallback(() => setMode(null), []);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      {mode === null ? (
        <HomeScreen highScores={highScores} onSelectMode={setMode} />
      ) : (
        <GameScreen
          key={mode}
          mode={mode}
          onExit={handleExit}
          onScoresChanged={setHighScores}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
});
