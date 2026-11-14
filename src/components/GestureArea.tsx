import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  PanResponder,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  CHARGE_MS,
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
   * One tick of the held-down drop. Returns true when the piece landed: the drop then waits until
   * the finger is lifted and pressed again, so it does not carry on into the next piece.
   */
  onHoldDrop: () => boolean;
  /** A quick tap. */
  onTap: () => void;
  /** A fast flick downwards. */
  onFlick: () => void;
  /** The hold charge just became full and the fast drop starts. */
  onHoldStart: () => void;
  /** 0 to 1 while the hold charges; the board draws it inside the falling piece. */
  charge: Animated.Value;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

const HOLD_REPEAT_MS = 40;

/** Full-area touch surface for the buttonless control mode. */
export default function GestureArea({
  cellSize,
  onLeft,
  onRight,
  onHoldDrop,
  onTap,
  onFlick,
  onHoldStart,
  charge,
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
  const chargeAnim = useRef<Animated.CompositeAnimation | null>(null);

  /** Stops the charge and the fast drop and empties the indicator. */
  const reset = useRef(() => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    if (holdInterval.current) clearInterval(holdInterval.current);
    holdTimer.current = null;
    holdInterval.current = null;
    chargeAnim.current?.stop();
    chargeAnim.current = null;
    charge.setValue(0);
  }).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        const t = tracker.current!;
        t.start(Date.now());
        reset();
        // A still finger that stays down starts to charge the indicator, then drops fast.
        holdTimer.current = setTimeout(() => {
          if (t.hasMoved()) return;
          const anim = Animated.timing(charge, {
            toValue: 1,
            duration: CHARGE_MS,
            easing: Easing.linear,
            useNativeDriver: true,
          });
          chargeAnim.current = anim;
          anim.start(({ finished }) => {
            if (!finished || !t.beginHold()) return;
            handlers.current.onHoldStart();
            holdInterval.current = setInterval(() => {
              if (!handlers.current.onHoldDrop()) return;
              // Landed: stop dropping and empty the indicator until the next press.
              if (holdInterval.current) clearInterval(holdInterval.current);
              holdInterval.current = null;
              charge.setValue(0);
            }, HOLD_REPEAT_MS);
          });
        }, HOLD_DELAY_MS);
      },
      onPanResponderMove: (_evt, g) => {
        const t = tracker.current!;
        t.move(g.dx, g.dy);
        // Sliding sideways while the charge is still filling cancels it; once the fast drop has
        // begun, sliding keeps working along with it.
        if (t.hasMoved() && !t.isHolding() && chargeAnim.current) reset();
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
