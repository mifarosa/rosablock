import React, { useEffect, useRef } from 'react';
import {
  PanResponder,
  StyleSheet,
  View,
  type HostInstance,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { HOLD_DELAY_MS, SwipeTracker, type SwipeActions } from '../utils/swipeTracker';

interface GestureAreaProps {
  cellSize: number;
  onLeft: () => void;
  onRight: () => void;
  onSoftDrop: () => void;
  /** A tap, with its position relative to this area's top-left corner. */
  onTap: (x: number, y: number) => void;
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
  onTap,
  style,
  children,
}: GestureAreaProps) {
  // Latest callbacks live in a ref: the PanResponder is created once and must never go stale.
  const handlers = useRef({ onLeft, onRight, onSoftDrop, onTap });
  handlers.current = { onLeft, onRight, onSoftDrop, onTap };

  const tracker = useRef<SwipeTracker | null>(null);
  if (tracker.current === null) {
    const actions: SwipeActions = {
      left: () => handlers.current.onLeft(),
      right: () => handlers.current.onRight(),
      down: () => handlers.current.onSoftDrop(),
    };
    tracker.current = new SwipeTracker(cellSize, actions);
  }
  tracker.current.cellSize = cellSize;

  const viewRef = useRef<HostInstance>(null);
  const origin = useRef<{ x: number; y: number } | null>(null);
  const touchStart = useRef({ pageX: 0, pageY: 0 });
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
      onPanResponderGrant: (evt) => {
        const t = tracker.current!;
        t.start(Date.now());
        touchStart.current = { pageX: evt.nativeEvent.pageX, pageY: evt.nativeEvent.pageY };
        // The area's position on screen, to turn the tap's page coordinates into local ones.
        viewRef.current?.measureInWindow((x, y) => {
          origin.current = { x, y };
        });
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
        const tap = tracker.current!.end(Date.now());
        clearTimers();
        const o = origin.current;
        if (tap && o) {
          handlers.current.onTap(touchStart.current.pageX - o.x, touchStart.current.pageY - o.y);
        }
      },
      onPanResponderTerminate: clearTimers,
    }),
  ).current;

  useEffect(() => clearTimers, [clearTimers]);

  return (
    <View ref={viewRef} collapsable={false} style={[styles.area, style]} {...panResponder.panHandlers}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  area: { flex: 1 },
});
