import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../app/AppContext';
import Board from '../components/Board';
import Controls from '../components/Controls';
import { Dialog, DialogButton } from '../components/Dialog';
import GestureArea from '../components/GestureArea';
import ScoreBoard from '../components/ScoreBoard';
import ThemeBackground from '../components/ThemeBackground';
import type { ThemeColors } from '../constants/colors';
import type { GameMode } from '../constants/modes';
import type { StringKey } from '../i18n/strings';
import { BOARD_COLS, BOARD_ROWS } from '../constants/tetrominos';
import { useTetris, type GameState } from '../hooks/useTetris';
import { formatTime } from '../utils/format';
import { hitsGhost } from '../utils/ghostHit';
import { clearGame, isPristine, saveGame } from '../utils/saves';
import { dropHaptic, finishHaptic, gameOverHaptic, lineClearHaptic } from '../utils/haptics';
import { saveResult, type HighScores } from '../utils/storage';

interface GameScreenProps {
  mode: GameMode;
  /** A saved game to continue (it opens paused), or null for a fresh game. */
  initialState: GameState | null;
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
  onExit,
  onScoresChanged,
}: GameScreenProps) {
  const { theme, t, settings, update } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { controlMode, controlSide } = settings;
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

  // A continued game opens paused; a short countdown replaces a second "continue?" prompt.
  const [countdown, setCountdown] = useState<number | null>(initialState ? 3 : null);
  const { togglePause } = game;
  useEffect(() => {
    if (countdown === null) return undefined;
    const id = setTimeout(() => {
      if (countdown > 1) {
        setCountdown(countdown - 1);
        return;
      }
      setCountdown(null);
      // Do not start the game behind the player's back if the app went to the background.
      if (AppState.currentState === 'active' && latest.current.status === 'paused') togglePause();
    }, 700);
    return () => clearTimeout(id);
  }, [countdown, togglePause]);

  // Leaving a game that is still going counts what was scored so far toward the best score
  // (Sprint only counts a finished run).
  const exitToMenu = async () => {
    const s = latest.current;
    const unfinished = s.status !== 'over' && s.status !== 'finished';
    if (unfinished && mode !== 'sprint' && s.score > 0) {
      const { scores, isNewBest: best } = await saveResult({
        mode,
        score: s.score,
        lines: s.lines,
        timeMs: s.elapsedMs,
        completed: false,
      });
      if (best) onScoresChanged(scores);
    }
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

  const modeTitle = t(`mode.${mode}.title` as StringKey);
  const paused = state.status === 'paused';
  const showPauseDialog = paused && countdown === null;

  let endTitle = t('game.over');
  if (state.status === 'finished') {
    endTitle = mode === 'ultra' ? t('game.timeUp') : t('game.finished');
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
      held={state.held}
      holdUsed={state.holdUsed}
      onHold={game.hold}
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
      <ThemeBackground />
      <View style={styles.header}>
        <View style={[styles.headerSide, styles.headerLeft]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('game.menu')}
            onPress={() => void exitToMenu()}
            style={styles.headerButton}
          >
            <Text style={styles.headerButtonText}>{t('game.menu')}</Text>
          </Pressable>
        </View>
        <Text style={styles.headerTitle}>{modeTitle}</Text>
        <View style={[styles.headerSide, styles.headerRight]}>
          {!gestures && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('game.swapSide')}
              onPress={() => update({ controlSide: buttonsOnRight ? 'left' : 'right' })}
              hitSlop={8}
              style={styles.swapButton}
            >
              <Text style={styles.swapText}>⇄</Text>
            </Pressable>
          )}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={paused ? t('game.resume') : t('game.pause')}
            onPress={game.togglePause}
            disabled={ended || countdown !== null}
            style={styles.headerButton}
          >
            <Text style={styles.headerButtonText}>{paused ? t('game.resume') : t('game.pause')}</Text>
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
          <Text style={styles.hint}>{t('game.hintGestures')}</Text>
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

      {countdown !== null && (
        <View style={styles.countdownOverlay} pointerEvents="none">
          <Text style={styles.countdownText}>{countdown}</Text>
        </View>
      )}

      {(showPauseDialog || ended) && (
        <Dialog title={showPauseDialog ? t('game.paused') : endTitle}>
          {ended && (
            <View style={styles.summary}>
              <Text style={styles.summaryLine}>{t('game.score', { value: state.score })}</Text>
              <Text style={styles.summaryLine}>{t('game.lines', { value: state.lines })}</Text>
              <Text style={styles.summaryLine}>{t('game.time', { value: formatTime(state.elapsedMs) })}</Text>
              {isNewBest && <Text style={styles.newBest}>{t('game.newBest')}</Text>}
            </View>
          )}
          {showPauseDialog ? (
            <DialogButton label={t('common.continue')} onPress={game.togglePause} />
          ) : (
            <DialogButton label={t('game.playAgain')} onPress={restart} />
          )}
          {showPauseDialog && <DialogButton label={t('game.restart')} onPress={restart} secondary />}
          <DialogButton label={t('game.mainMenu')} onPress={() => void exitToMenu()} secondary />
        </Dialog>
      )}
    </View>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
  root: { flex: 1, backgroundColor: c.background },
  header: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SCREEN_PADDING,
  },
  headerSide: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  headerLeft: { justifyContent: 'flex-start' },
  headerRight: { justifyContent: 'flex-end', gap: 4 },
  headerTitle: { color: c.textPrimary, fontSize: 16, fontWeight: '700', letterSpacing: 2 },
  headerButton: { paddingVertical: 8, paddingHorizontal: 6 },
  headerButtonText: { color: c.textSecondary, fontSize: 14, fontWeight: '600' },
  swapButton: {
    width: 34,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: c.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swapText: { color: c.textSecondary, fontSize: 15, fontWeight: '700' },
  playfield: {
    flex: 1,
    alignItems: 'center',
    paddingTop: SECTION_GAP,
  },
  barWrap: { alignSelf: 'stretch', marginTop: SECTION_GAP },
  hint: {
    color: c.textSecondary,
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
  countdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(26, 20, 22, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: { color: c.textPrimary, fontSize: 96, fontWeight: '800' },
  summary: { alignItems: 'center', gap: 4, marginBottom: 8 },
  summaryLine: { color: c.textSecondary, fontSize: 16 },
  newBest: { color: c.textPrimary, fontSize: 16, fontWeight: '700', marginTop: 4 },
});
