import React, { useEffect, useRef } from 'react';
import { PanResponder, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { HOLD_DELAY_MS, SwipeTracker, type SwipeActions } from '../utils/swipeTracker';

interface GestureAreaProps {
  cellSize: number;
  onLeft: () => void;
  onRight: () => void;
  onSoftDrop: () => void;
  onRotate: () => void;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

const HOLD_REPEAT_MS = 45;

/** Full-area touch surface for the buttonless control mode. */
export default function GestureArea({
  cellSize,
  onLeft,
  onRight,
  onSoftDrop,
  onRotate,
  style,
  children,
}: GestureAreaProps) {
  // Latest callbacks live in a ref: the PanResponder is created once and must never go stale.
  const handlers = useRef({ onLeft, onRight, onSoftDrop, onRotate });
  handlers.current = { onLeft, onRight, onSoftDrop, onRotate };

  const tracker = useRef<SwipeTracker | null>(null);
  if (tracker.current === null) {
    const actions: SwipeActions = {
      left: () => handlers.current.onLeft(),
      right: () => handlers.current.onRight(),
      down: () => handlers.current.onSoftDrop(),
      rotate: () => handlers.current.onRotate(),
    };
    tracker.current = new SwipeTracker(cellSize, actions);
  }
  tracker.current.cellSize = cellSize;

  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = useRef(() => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    if (holdInterval.current) clearInterval(holdInterval.current);
    holdTimer.current = null;
    holdInterval.current = null;
  }).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        const t = tracker.current!;
        t.start(Date.now());
        clearTimers();
        holdTimer.current = setTimeout(() => {
          if (t.beginHold()) {
            holdInterval.current = setInterval(
              () => handlers.current.onSoftDrop(),
              HOLD_REPEAT_MS,
            );
          }
        }, HOLD_DELAY_MS);
      },
      onPanResponderMove: (_evt, g) => tracker.current!.move(g.dx, g.dy),
      onPanResponderRelease: () => {
        tracker.current!.end(Date.now());
        clearTimers();
      },
      onPanResponderTerminate: clearTimers,
    }),
  ).current;

  useEffect(() => clearTimers, [clearTimers]);

  return (
    <View style={[styles.area, style]} {...panResponder.panHandlers}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  area: { flex: 1 },
});
