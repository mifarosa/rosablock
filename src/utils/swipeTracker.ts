// Pure gesture logic for the buttonless mode (no React, easy to test).
//   quick tap        -> rotate (the caller does it when `end` says it was a tap)
//   horizontal drag  -> move one column per `cellSize * STEP_X_FACTOR` travelled
//   press and hold   -> after HOLD_DELAY_MS a charge fills for CHARGE_MS, then the piece
//                       soft-drops until the finger leaves (the component drives the timers)
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
/** How long a still finger must stay down before the charge starts. */
export const HOLD_DELAY_MS = 350;
/** How long the charge takes to fill; when it is full the soft drop starts. */
export const CHARGE_MS = 400;
const STEP_X_FACTOR = 0.8;

/** A flick is far enough, fast enough (px per ms) and mostly vertical. */
export const FLICK_MIN_DY_PX = 70;
export const FLICK_MIN_VY = 0.9;
export function isFlickDown(dx: number, dy: number, vy: number): boolean {
  return dy >= FLICK_MIN_DY_PX && vy >= FLICK_MIN_VY && Math.abs(dx) <= dy * 0.5;
}

export class SwipeTracker {
  cellSize: number;
  private readonly actions: SwipeActions;
  private startTime = 0;
  private anchorX = 0;
  private moved = false;
  private holding = false;

  constructor(cellSize: number, actions: SwipeActions) {
    this.cellSize = cellSize;
    this.actions = actions;
  }

  start(now: number): void {
    this.startTime = now;
    this.anchorX = 0;
    this.moved = false;
    this.holding = false;
  }

  hasMoved(): boolean {
    return this.moved;
  }

  isHolding(): boolean {
    return this.holding;
  }

  /** Called when the charge is full. Returns true if the hold really begins (finger is still). */
  beginHold(): boolean {
    if (this.moved) return false;
    this.holding = true;
    return true;
  }

  /** dx/dy: finger travel since the touch started. Only horizontal travel moves the piece. */
  move(dx: number, dy: number): void {
    if (!this.moved && (Math.abs(dx) > MOVE_SLOP_PX || Math.abs(dy) > MOVE_SLOP_PX)) {
      this.moved = true;
    }
    if (!this.moved) return;

    const stepX = this.cellSize * STEP_X_FACTOR;
    while (dx - this.anchorX >= stepX) {
      this.actions.right();
      this.anchorX += stepX;
    }
    while (dx - this.anchorX <= -stepX) {
      this.actions.left();
      this.anchorX -= stepX;
    }
  }

  /** Called on release. Returns true when the touch was a tap (short, still, not a hold). */
  end(now: number): boolean {
    return !this.moved && !this.holding && now - this.startTime < TAP_MAX_MS;
  }
}
