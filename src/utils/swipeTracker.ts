// Pure gesture logic for the buttonless mode (no React, easy to test).
//   quick tap        -> rotate (the caller does it when `end` says it was a tap)
//   horizontal drag  -> move one column per `cellSize * STEP_X_FACTOR` travelled
//   press and hold   -> after HOLD_DELAY_MS the piece drops, speeding up, until the finger leaves
//                       (the component drives the timers)
//   fast flick down  -> hard drop (see `isFlickDown`)
// Slow downward drift never does anything, so a lazy tap cannot push the piece down.

export interface SwipeActions {
  left: () => void;
  right: () => void;
}

/** Finger travel (px) before a touch stops being a tap. */
export const MOVE_SLOP_PX = 14;
/** A touch shorter than this, without movement or hold, is a tap. */
export const TAP_MAX_MS = 350;
/** How long a still finger must stay down before the drop starts. */
export const HOLD_DELAY_MS = 350;
const STEP_X_FACTOR = 0.8;

/** A flick is far enough, fast enough (px per ms) and mostly vertical. */
export const FLICK_MIN_DY_PX = 70;
export const FLICK_MIN_VY = 0.9;
export function isFlickDown(dx: number, dy: number, vy: number): boolean {
  return dy >= FLICK_MIN_DY_PX && vy >= FLICK_MIN_VY && Math.abs(dx) <= dy * 0.5;
}

/**
 * While a held-down drop is running, the first sideways step needs this many times the normal
 * travel, so the small wobble of a pressed finger does not move the piece off its column.
 */
export const HOLD_FIRST_STEP_FACTOR = 1.6;

export class SwipeTracker {
  cellSize: number;
  private readonly actions: SwipeActions;
  private startTime = 0;
  private anchorX = 0;
  private moved = false;
  private holding = false;
  /** Which way the touch went first: a mostly vertical touch never moves the piece sideways. */
  private axis: 'horizontal' | 'vertical' | null = null;
  /** Sideways steps made so far in this touch (right = +1, left = -1), so a flick can undo them. */
  private net = 0;
  /** A sideways step has been made since the hold began. */
  private stepped = false;

  constructor(cellSize: number, actions: SwipeActions) {
    this.cellSize = cellSize;
    this.actions = actions;
  }

  start(now: number): void {
    this.startTime = now;
    this.anchorX = 0;
    this.moved = false;
    this.holding = false;
    this.axis = null;
    this.net = 0;
    this.stepped = false;
  }

  /** Net sideways steps of this touch: the caller undoes them when the touch turns out to be a flick. */
  netSteps(): number {
    return this.net;
  }

  hasMoved(): boolean {
    return this.moved;
  }

  isHolding(): boolean {
    return this.holding;
  }

  /** Called when the hold delay is over. Returns true if the hold really begins (finger is still). */
  beginHold(): boolean {
    if (this.moved) return false;
    this.holding = true;
    return true;
  }

  /**
   * dx/dy: finger travel since the touch started. Only horizontal travel moves the piece, and
   * only when the touch started out mostly horizontal (or a hold is under way): a flick or a
   * downward drag that drifts sideways leaves the piece in its column.
   */
  move(dx: number, dy: number): void {
    if (!this.moved && (Math.abs(dx) > MOVE_SLOP_PX || Math.abs(dy) > MOVE_SLOP_PX)) {
      this.moved = true;
      this.axis = Math.abs(dy) > Math.abs(dx) ? 'vertical' : 'horizontal';
    }
    if (!this.moved) return;
    if (this.axis === 'vertical' && !this.holding) return;

    const stepX = this.cellSize * STEP_X_FACTOR;
    // A pressed finger wobbles: the first step during a hold needs a clearer movement.
    const first = this.holding && !this.stepped ? stepX * HOLD_FIRST_STEP_FACTOR : stepX;
    while (dx - this.anchorX >= (this.stepped ? stepX : first)) {
      this.actions.right();
      this.anchorX += this.stepped ? stepX : first;
      this.net += 1;
      this.stepped = true;
    }
    while (dx - this.anchorX <= -(this.stepped ? stepX : first)) {
      this.actions.left();
      this.anchorX -= this.stepped ? stepX : first;
      this.net -= 1;
      this.stepped = true;
    }
  }

  /** Called on release. Returns true when the touch was a tap (short, still, not a hold). */
  end(now: number): boolean {
    return !this.moved && !this.holding && now - this.startTime < TAP_MAX_MS;
  }
}
