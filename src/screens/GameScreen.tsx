import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Board from '../components/Board';
import Controls from '../components/Controls';
import GestureArea from '../components/GestureArea';
import ScoreBoard, { SCOREBOARD_HEIGHT } from '../components/ScoreBoard';
import { COLORS } from '../constants/colors';
import { MODES, type GameMode } from '../constants/modes';
import { BOARD_COLS, BOARD_ROWS } from '../constants/tetrominos';
import { useTetris } from '../hooks/useTetris';
import { formatTime } from '../utils/format';
import { saveResult, type ControlMode, type HighScores } from '../utils/storage';

interface GameScreenProps {
  mode: GameMode;
  controlMode: ControlMode;
  onExit: () => void;
  onScoresChanged: (scores: HighScores) => void;
}

const SCREEN_PADDING = 12;
const HEADER_HEIGHT = 48;
const SECTION_GAP = 8;
const CONTROLS_HEIGHT = 68; // button row (buttons mode only)
const HINT_HEIGHT = 28; // gesture hint under the board (gestures mode only)

export default function GameScreen({ mode, controlMode, onExit, onScoresChanged }: GameScreenProps) {
  const game = useTetris(mode);
  const { state } = game;
  const { width, height } = useWindowDimensions();
  const [isNewBest, setIsNewBest] = useState(false);
  const savedRef = useRef(false);

  const insets = useSafeAreaInsets();
  const gestures = controlMode === 'gestures';

  // Board size: full width when possible, otherwise as tall as the screen allows.
  const bottomPad = Math.max(insets.bottom, 12);
  const reservedHeight =
    insets.top +
    HEADER_HEIGHT +
    SCOREBOARD_HEIGHT +
    SECTION_GAP * 2 +
    bottomPad +
    (gestures ? HINT_HEIGHT : CONTROLS_HEIGHT + SECTION_GAP) +
    4; // board border
  const availableWidth = width - SCREEN_PADDING * 2 - 4;
  const availableHeight = height - reservedHeight;
  const cellSize = Math.max(
    12,
    Math.floor(Math.min(availableWidth / BOARD_COLS, availableHeight / BOARD_ROWS, 44)),
  );

  const ended = state.status === 'over' || state.status === 'finished';

  // Persist the result exactly once per game.
  useEffect(() => {
    if (!ended) {
      savedRef.current = false;
      return;
    }
    if (savedRef.current) return;
    savedRef.current = true;
    void saveResult({
      mode,
      score: state.score,
      lines: state.lines,
      timeMs: state.elapsedMs,
      completed: state.status === 'finished',
    }).then(({ scores, isNewBest: best }) => {
      setIsNewBest(best);
      onScoresChanged(scores);
    });
  }, [ended, mode, state.score, state.lines, state.elapsedMs, state.status, onScoresChanged]);

  const modeTitle = MODES.find((m) => m.id === mode)?.title ?? '';
  const paused = state.status === 'paused';

  let endTitle = 'Oyun Bitti';
  if (state.status === 'finished') {
    endTitle = mode === 'ultra' ? 'Süre Doldu' : 'Tamamlandı!';
  }

  const restart = () => {
    setIsNewBest(false);
    game.restart();
  };

  const board = (
    <Board grid={state.grid} piece={state.piece} ghostRow={game.ghostRow} cellSize={cellSize} />
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Menüye dön"
          onPress={onExit}
          style={styles.headerButton}
        >
          <Text style={styles.headerButtonText}>‹ Menü</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{modeTitle}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={paused ? 'Devam et' : 'Duraklat'}
          onPress={game.togglePause}
          disabled={ended}
          style={styles.headerButton}
        >
          <Text style={styles.headerButtonText}>{paused ? 'Devam' : 'Duraklat'}</Text>
        </Pressable>
      </View>

      <ScoreBoard
        mode={mode}
        score={state.score}
        lines={state.lines}
        level={state.level}
        elapsedMs={state.elapsedMs}
        next={state.next}
      />

      {gestures ? (
        // Buttonless: the whole area below the HUD is the touch surface.
        <GestureArea
          cellSize={cellSize}
          onLeft={game.moveLeft}
          onRight={game.moveRight}
          onSoftDrop={game.softDrop}
          onRotate={game.rotateCW}
          style={styles.playfield}
        >
          {board}
          <Text style={styles.hint}>dokun: döndür · kaydır: yana · basılı tut: aşağı</Text>
        </GestureArea>
      ) : (
        <>
          <View style={styles.playfield}>{board}</View>
          <View style={[styles.controls, { paddingBottom: bottomPad }]}>
            <Controls
              onLeft={game.moveLeft}
              onRight={game.moveRight}
              onSoftDrop={game.softDrop}
              onRotate={game.rotateCW}
            />
          </View>
        </>
      )}

      {(paused || ended) && (
        <View style={styles.overlay}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>{paused ? 'Duraklatıldı' : endTitle}</Text>
            {ended && (
              <View style={styles.summary}>
                <Text style={styles.summaryLine}>Puan: {state.score}</Text>
                <Text style={styles.summaryLine}>Satır: {state.lines}</Text>
                <Text style={styles.summaryLine}>Süre: {formatTime(state.elapsedMs)}</Text>
                {isNewBest && <Text style={styles.newBest}>Yeni rekor!</Text>}
              </View>
            )}
            {paused ? (
              <DialogButton label="Devam Et" onPress={game.togglePause} />
            ) : (
              <DialogButton label="Tekrar Oyna" onPress={restart} />
            )}
            {paused && <DialogButton label="Yeniden Başla" onPress={restart} secondary />}
            <DialogButton label="Ana Menü" onPress={onExit} secondary />
          </View>
        </View>
      )}
    </View>
  );
}

function DialogButton({
  label,
  onPress,
  secondary = false,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.dialogButton,
        secondary && styles.dialogButtonSecondary,
        pressed && styles.dialogButtonPressed,
      ]}
    >
      <Text style={[styles.dialogButtonText, secondary && styles.dialogButtonTextSecondary]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  header: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_PADDING,
  },
  headerTitle: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700', letterSpacing: 2 },
  headerButton: { paddingVertical: 8, paddingHorizontal: 6, minWidth: 72 },
  headerButtonText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600' },
  playfield: {
    flex: 1,
    alignItems: 'center',
    paddingTop: SECTION_GAP,
  },
  hint: {
    color: COLORS.textSecondary,
    opacity: 0.55,
    fontSize: 12,
    marginTop: 10,
    letterSpacing: 0.5,
  },
  controls: { paddingTop: SECTION_GAP },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialog: {
    width: 280,
    backgroundColor: COLORS.boardBg,
    borderColor: COLORS.border,
    borderWidth: 2,
    borderRadius: 12,
    padding: 20,
    gap: 10,
  },
  dialogTitle: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  summary: { alignItems: 'center', gap: 4, marginBottom: 8 },
  summaryLine: { color: COLORS.textSecondary, fontSize: 16 },
  newBest: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700', marginTop: 4 },
  dialogButton: {
    backgroundColor: COLORS.textSecondary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dialogButtonSecondary: {
    backgroundColor: 'transparent',
    borderColor: COLORS.border,
    borderWidth: 2,
  },
  dialogButtonPressed: { opacity: 0.7 },
  dialogButtonText: { color: COLORS.background, fontSize: 16, fontWeight: '700' },
  dialogButtonTextSecondary: { color: COLORS.textPrimary },
});
