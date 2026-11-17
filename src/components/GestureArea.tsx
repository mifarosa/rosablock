import React, { useEffect, useRef } from 'react';
import {
  PanResponder,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { DropRamp } from '../utils/dropRamp';
import {
  HOLD_DELAY_MS,
  SwipeTracker,
  isFlickDown,
  type SwipeActions,
} from '../utils/swipeTracker';

interface GestureAreaProps {
  cellSize: number;
  onLeft: () => void;
  onRight: () => void;
  /**
   * One tick of the held-down drop: drop this many rows. Returns true when the piece landed: the
   * drop then waits until the finger is lifted and pressed again, so it does not carry on into
   * the next piece.
   */
  onHoldDrop: (rows: number) => boolean;
  /** A quick tap. */
  onTap: () => void;
  /** A fast flick downwards. */
  onFlick: () => void;
  /** The hold has begun and the piece starts to drop (speeding up). */
  onHoldStart: () => void;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

const HOLD_REPEAT_MS = 30;

/** Full-area touch surface for the buttonless control mode. */
export default function GestureArea({
  cellSize,
  onLeft,
  onRight,
  onHoldDrop,
  onTap,
  onFlick,
  onHoldStart,
  style,
  children,
}: GestureAreaProps) {
  // Latest callbacks live in a ref: the PanResponder is created once and must never go stale.
  const handlers = useRef({ onLeft, onRight, onHoldDrop, onTap, onFlick, onHoldStart });
  handlers.current = { onLeft, onRight, onHoldDrop, onTap, onFlick, onHoldStart };

  const tracker = useRef<SwipeTracker | null>(null);
  if (tracker.current === null) {
    const actions: SwipeActions = {
      left: () => handlers.current.onLeft(),
      right: () => handlers.current.onRight(),
    };
    tracker.current = new SwipeTracker(cellSize, actions);
  }
  tracker.current.cellSize = cellSize;

  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const ramp = useRef(new DropRamp()).current;

  /** Stops the drop. */
  const reset = useRef(() => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    if (holdInterval.current) clearInterval(holdInterval.current);
    holdTimer.current = null;
    holdInterval.current = null;
    ramp.reset();
  }).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        const t = tracker.current!;
        t.start(Date.now());
        reset();
        // A still finger that stays down starts the drop, which speeds up the longer it is held.
        holdTimer.current = setTimeout(() => {
          if (t.hasMoved() || !t.beginHold()) return;
          handlers.current.onHoldStart();
          holdInterval.current = setInterval(() => {
            const rows = ramp.step(Date.now());
            if (rows < 1 || !handlers.current.onHoldDrop(rows)) return;
            // Landed: stop dropping until the finger is lifted and pressed again.
            if (holdInterval.current) clearInterval(holdInterval.current);
            holdInterval.current = null;
          }, HOLD_REPEAT_MS);
        }, HOLD_DELAY_MS);
      },
      onPanResponderMove: (_evt, g) => {
        const t = tracker.current!;
        // Sliding sideways moves the piece, also while it is dropping.
        t.move(g.dx, g.dy);
      },
      onPanResponderRelease: (_evt, g) => {
        const t = tracker.current!;
        const tap = t.end(Date.now());
        const flick = !tap && !t.isHolding() && isFlickDown(g.dx, g.dy, g.vy);
        reset();
        if (tap) handlers.current.onTap();
        else if (flick) handlers.current.onFlick();
      },
      onPanResponderTerminate: () => reset(),
    }),
  ).current;

  useEffect(() => reset, [reset]);

  return (
    <View style={[styles.area, style]} {...panResponder.panHandlers}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  area: { flex: 1 },
});
