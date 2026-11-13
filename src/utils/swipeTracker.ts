// Pure gesture logic for the buttonless mode (no React, easy to test).
//   tap                -> reported to the caller (rotate, or hard drop when it hits the ghost)
//   horizontal drag    -> move one column per `cellSize * STEP_X_FACTOR` travelled
//   downward drag      -> soft drop one row per `cellSize` travelled
//   press and hold     -> keeps soft dropping (the component drives it via `beginHold`)

export interface SwipeActions {
  left: () => void;
  right: () => void;
  down: () => void;
}

/** Finger travel (px) before a touch stops being a tap. */
export const MOVE_SLOP_PX = 12;
/** A touch shorter than this, without movement or hold, is a tap. */
export const TAP_MAX_MS = 260;
/** How long a still finger must stay down before the hold (soft drop) starts. */
export const HOLD_DELAY_MS = 280;
const STEP_X_FACTOR = 0.8;

export class SwipeTracker {
  cellSize: number;
  private readonly actions: SwipeActions;
  private startTime = 0;
  private anchorX = 0;
  private anchorY = 0;
  private moved = false;
  private holding = false;

  constructor(cellSize: number, actions: SwipeActions) {
    this.cellSize = cellSize;
    this.actions = actions;
  }

  start(now: number): void {
    this.startTime = now;
    this.anchorX = 0;
    this.anchorY = 0;
    this.moved = false;
    this.holding = false;
  }

  /** Called when the hold timer fires. Returns true if the hold really begins (finger is still). */
  beginHold(): boolean {
    if (this.moved) return false;
    this.holding = true;
    return true;
  }

  /** dx/dy: finger travel since the touch started. */
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

    const stepY = this.cellSize;
    while (dy - this.anchorY >= stepY) {
      this.actions.down();
      this.anchorY += stepY;
    }
    // Dragging back up must not build a "debt" the finger has to travel before dropping again.
    if (dy < this.anchorY) this.anchorY = dy;
  }

  /** Called on release. Returns true when the touch was a tap (short, still, not a hold). */
  end(now: number): boolean {
    return !this.moved && !this.holding && now - this.startTime < TAP_MAX_MS;
  }
}
