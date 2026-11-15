// A held-down drop that speeds up: it starts slowly, so the piece can be stopped where you want
// it, and gets faster the longer you hold. Pure logic; the caller feeds it the clock.

/** Rows per second when the hold begins, how fast it speeds up (rows/s per second), and the top speed. */
export const DROP_START_RPS = 7;
export const DROP_ACCEL_RPS2 = 30;
export const DROP_MAX_RPS = 30;
/** After a long stall (a slow frame) at most this many rows are dropped in one step. */
const MAX_ROWS_PER_STEP = 4;

export class DropRamp {
  private startedAt: number | null = null;
  private lastAt = 0;
  private carry = 0;

  /** Call when a new press begins. */
  reset(): void {
    this.startedAt = null;
    this.carry = 0;
  }

  /**
   * How many whole rows to drop now. The first step of a press drops one row at once; after that
   * the rows follow the speed curve, with the fractions carried over to the next step.
   */
  step(now: number): number {
    if (this.startedAt === null) {
      this.startedAt = now;
      this.lastAt = now;
      return 1;
    }
    const heldSeconds = (now - this.startedAt) / 1000;
    const speed = Math.min(DROP_MAX_RPS, DROP_START_RPS + DROP_ACCEL_RPS2 * heldSeconds);
    this.carry += (speed * (now - this.lastAt)) / 1000;
    this.lastAt = now;
    const rows = Math.min(MAX_ROWS_PER_STEP, Math.floor(this.carry));
    this.carry -= Math.floor(this.carry);
    return rows;
  }
}
