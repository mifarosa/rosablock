import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Board from '../components/Board';
import Controls from '../components/Controls';
import GestureArea from '../components/GestureArea';
import ScoreBoard from '../components/ScoreBoard';
import { COLORS } from '../constants/colors';
import { MODES, type GameMode } from '../constants/modes';
import { BOARD_COLS, BOARD_ROWS } from '../constants/tetrominos';
import { useTetris, type GameState } from '../hooks/useTetris';
import { formatTime } from '../utils/format';
import { hitsGhost } from '../utils/ghostHit';
import { clearGame, isPristine, saveGame } from '../utils/saves';
import { dropHaptic, finishHaptic, gameOverHaptic, lineClearHaptic } from '../utils/haptics';
import {
  saveResult,
  type ControlMode,
  type ControlSide,
  type HighScores,
} from '../utils/storage';

interface GameScreenProps {
  mode: GameMode;
  /** A saved game to continue (it opens paused), or null for a fresh game. */
  initialState: GameState | null;
  controlMode: ControlMode;
  controlSide: ControlSide;
  onChangeControlSide: (side: ControlSide) => void;
  onExit: () => void;
  onScoresChanged: (scores: HighScores) => void;
}

const SCREEN_PADDING = 12;
const HEADER_HEIGHT = 48;
const SECTION_GAP = 8;
const PANEL_HEIGHT = 140; // buttons mode: status box + button cluster, side by side
const BAR_HEIGHT = 50; // gestures mode: one-row status bar under the board
const HINT_HEIGHT = 30; // gestures mode: hint line under the bar
const BOARD_BORDER = 2;

export default function GameScreen({
  mode,
  initialState,
  controlMode,
  controlSide,
  onChangeControlSide,
  onExit,
  onScoresChanged,
}: GameScreenProps) {
  const game = useTetris(mode, initialState);
  const { state } = game;
  const { width, height } = useWindowDimensions();
  const [isNewBest, setIsNewBest] = useState(false);
  const savedRef = useRef(false);

  const insets = useSafeAreaInsets();
  const gestures = controlMode === 'gestures';

  // The board sits at the top; it is as big as the width or the remaining height allows.
  const bottomPad = Math.max(insets.bottom, 12);
  const belowBoard = gestures
    ? SECTION_GAP + BAR_HEIGHT + HINT_HEIGHT
    : SECTION_GAP + PANEL_HEIGHT;
  const reservedHeight =
    insets.top + HEADER_HEIGHT + SECTION_GAP + BOARD_BORDER * 2 + belowBoard + bottomPad;
  const availableWidth = width - SCREEN_PADDING * 2 - BOARD_BORDER * 2;
  const availableHeight = height - reservedHeight;
  const cellSize = Math.max(
    12,
    Math.floor(Math.min(availableWidth / BOARD_COLS, availableHeight / BOARD_ROWS, 44)),
  );
  const boardWidth = cellSize * BOARD_COLS + BOARD_BORDER * 2;

  const ended = state.status === 'over' || state.status === 'finished';

  // Autosave: whenever a piece lands or lines clear, and when the game pauses (that includes
  // going to the background). A finished or still-untouched game leaves no save behind.
  const latest = useRef(state);
  latest.current = state;
  const persist = useCallback(async () => {
    const s = latest.current;
    if (s.status === 'over' || s.status === 'finished' || isPristine(s)) {
      await clearGame(s.mode);
    } else {
      await saveGame(s);
    }
  }, []);
  useEffect(() => {
    void persist();
  }, [state.grid, state.status, persist]);

  const exitToMenu = async () => {
    await persist();
    onExit();
  };

  // Haptics: rows cleared (scaled by how many) and the end of the game.
  const clearingRows = state.clearingRows;
  useEffect(() => {
    if (clearingRows.length > 0) lineClearHaptic(clearingRows.length);
  }, [clearingRows]);
  useEffect(() => {
    if (state.status === 'over') gameOverHaptic();
    else if (state.status === 'finished') finishHaptic();
  }, [state.status]);

  // A hard drop of at least a couple of rows gets a solid thud.
  const { hardDrop: engineHardDrop, ghostRow } = game;
  const hardDrop = () => {
    if (state.piece && ghostRow !== null && ghostRow - state.piece.row >= 2) dropHaptic();
    engineHardDrop();
  };

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

  // Gestures mode: a tap on the landing shadow drops the piece, a tap anywhere else rotates it.
  // The touch area spans the full width and the board is centered in it, SECTION_GAP from the top.
  const handleTap = (x: number, y: number) => {
    const boardLeft = (width - boardWidth) / 2;
    if (hitsGhost(x, y, state.piece, game.ghostRow, cellSize, boardLeft, SECTION_GAP)) {
      hardDrop();
    } else {
      game.rotateCW();
    }
  };

  const board = (
    <Board
      grid={state.grid}
      piece={state.piece}
      ghostRow={game.ghostRow}
      cellSize={cellSize}
      clearingRows={clearingRows}
    />
  );

  const status = (layout: 'bar' | 'box', boxHeight: number) => (
    <ScoreBoard
      mode={mode}
      score={state.score}
      lines={state.lines}
      level={state.level}
      elapsedMs={state.elapsedMs}
      next={state.next}
      layout={layout}
      height={boxHeight}
    />
  );

  const buttonsOnRight = controlSide === 'right';
  const controls = (
    <View style={styles.panelHalf}>
      <Controls
        onLeft={game.moveLeft}
        onRight={game.moveRight}
        onSoftDrop={game.softDrop}
        onRotate={game.rotateCW}
        height={PANEL_HEIGHT}
      />
    </View>
  );
  const statusBox = <View style={styles.panelHalf}>{status('box', PANEL_HEIGHT)}</View>;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={[styles.headerSide, styles.headerLeft]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Menüye dön"
            onPress={() => void exitToMenu()}
            style={styles.headerButton}
          >
            <Text style={styles.headerButtonText}>‹ Menü</Text>
          </Pressable>
        </View>
        <Text style={styles.headerTitle}>{modeTitle}</Text>
        <View style={[styles.headerSide, styles.headerRight]}>
          {!gestures && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Tuşları diğer yana al"
              onPress={() => onChangeControlSide(buttonsOnRight ? 'left' : 'right')}
              hitSlop={8}
              style={styles.swapButton}
            >
              <Text style={styles.swapText}>⇄</Text>
            </Pressable>
          )}
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
      </View>

      {gestures ? (
        // Buttonless: everything below the header is the touch surface.
        <GestureArea
          cellSize={cellSize}
          onLeft={game.moveLeft}
          onRight={game.moveRight}
          onSoftDrop={game.softDrop}
          onTap={handleTap}
          style={styles.playfield}
        >
          {board}
          <View style={styles.barWrap}>{status('bar', BAR_HEIGHT)}</View>
          <Text style={styles.hint}>
            dokun: döndür · gölgeye dokun: çat diye indir · kaydır: yana · basılı tut: aşağı
          </Text>
        </GestureArea>
      ) : (
        <>
          <View style={styles.playfield}>{board}</View>
          <View style={[styles.panel, { paddingBottom: bottomPad }]}>
            {buttonsOnRight ? (
              <>
                {statusBox}
                {controls}
              </>
            ) : (
              <>
                {controls}
                {statusBox}
              </>
            )}
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
            <DialogButton label="Ana Menü" onPress={() => void exitToMenu()} secondary />
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
    paddingHorizontal: SCREEN_PADDING,
  },
  headerSide: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  headerLeft: { justifyContent: 'flex-start' },
  headerRight: { justifyContent: 'flex-end', gap: 4 },
  headerTitle: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700', letterSpacing: 2 },
  headerButton: { paddingVertical: 8, paddingHorizontal: 6 },
  headerButtonText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600' },
  swapButton: {
    width: 34,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swapText: { color: COLORS.textSecondary, fontSize: 15, fontWeight: '700' },
  playfield: {
    flex: 1,
    alignItems: 'center',
    paddingTop: SECTION_GAP,
  },
  barWrap: { alignSelf: 'stretch', marginTop: SECTION_GAP },
  hint: {
    color: COLORS.textSecondary,
    opacity: 0.55,
    fontSize: 11,
    marginTop: 8,
    paddingHorizontal: SCREEN_PADDING,
    textAlign: 'center',
  },
  panel: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: SECTION_GAP,
    paddingHorizontal: SCREEN_PADDING,
  },
  panelHalf: { flex: 1 },
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
