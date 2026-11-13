// Sound effects. The real player is added in the sound step; this keeps the on/off switch.
let enabled = true;

export function setSoundEnabled(value: boolean): void {
  enabled = value;
}

export function isSoundEnabled(): boolean {
  return enabled;
}
