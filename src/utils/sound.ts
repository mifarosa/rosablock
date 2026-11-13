import { loadSoundSdk, type SoundName } from './soundSdk';

export type { SoundName };

/** How loud each effect is next to the others (0 to 1); the files are all at the same level. */
const VOLUMES: Record<SoundName, number> = {
  move: 0.22,
  rotate: 0.5,
  land: 0.45,
  drop: 0.6,
  hold: 0.5,
  clear1: 0.6,
  clear2: 0.65,
  clear3: 0.7,
  clear4: 0.8,
  levelUp: 0.6,
  gameOver: 0.6,
  finished: 0.7,
  tick: 0.5,
  go: 0.6,
};
const MUSIC_VOLUME = 0.22;
/** Players per effect, taken in turn: one that is still playing (or rewinding) is not reused. */
const POOL = 2;
/** The movement tick is held back so holding a button does not sound like a machine gun. */
const MIN_GAP_MS: Partial<Record<SoundName, number>> = { move: 70 };

type Player = {
  volume: number;
  loop: boolean;
  play: () => void;
  pause: () => void;
  seekTo: (seconds: number) => Promise<void>;
};

let effectsOn = true;
let started: 'no' | 'yes' | 'unavailable' = 'no';
const pools = new Map<SoundName, { players: Player[]; next: number }>();
const lastPlayed = new Map<SoundName, number>();
let music: Player | null = null;

export function setSoundEnabled(value: boolean): void {
  effectsOn = value;
}

/** Sets the audio mode once; a phone or a build that cannot play audio simply stays silent. */
function start(): boolean {
  if (started !== 'no') return started === 'yes';
  started = 'unavailable';
  try {
    const sdk = loadSoundSdk();
    if (!sdk) return false;
    // Plays alongside the player's own music, and not when the phone is on silent.
    void sdk.audio
      .setAudioModeAsync({
        playsInSilentMode: false,
        interruptionMode: 'mixWithOthers',
        shouldPlayInBackground: false,
      })
      .catch(() => {});
    started = 'yes';
  } catch {
    started = 'unavailable';
  }
  return started === 'yes';
}

function poolOf(name: SoundName) {
  let pool = pools.get(name);
  if (!pool) {
    const sdk = loadSoundSdk()!;
    const players = Array.from({ length: POOL }, () => {
      const player = sdk.audio.createAudioPlayer(sdk.files[name]) as unknown as Player;
      player.volume = VOLUMES[name];
      return player;
    });
    pool = { players, next: 0 };
    pools.set(name, pool);
  }
  return pool;
}

/** Plays an effect from its start. */
export function playSound(name: SoundName): void {
  if (!effectsOn || !start()) return;
  try {
    const gap = MIN_GAP_MS[name];
    const now = Date.now();
    if (gap && now - (lastPlayed.get(name) ?? 0) < gap) return;
    lastPlayed.set(name, now);

    const pool = poolOf(name);
    const player = pool.players[pool.next]!;
    pool.next = (pool.next + 1) % pool.players.length;
    // Play once the rewind is done: a play that comes first starts at the end, in silence.
    void Promise.resolve(player.seekTo(0))
      .catch(() => {})
      .then(() => {
        try {
          player.play();
        } catch {
          // Silent is fine.
        }
      });
  } catch {
    // Silent is fine.
  }
}

export function startMusic(): void {
  if (!start()) return;
  try {
    if (!music) {
      const sdk = loadSoundSdk()!;
      const player = sdk.audio.createAudioPlayer(sdk.files.music) as unknown as Player;
      player.loop = true;
      player.volume = MUSIC_VOLUME;
      music = player;
    }
    music.play();
  } catch {
    // Silent is fine.
  }
}

export function pauseMusic(): void {
  try {
    music?.pause();
  } catch {
    // Nothing to do.
  }
}
