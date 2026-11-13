/**
 * The audio package of Expo and the sound files, or null when this build of the app does not
 * have the native part of the package (a build made before it was added). They are loaded here,
 * while the app starts, and not later: an error in a module that is loaded while the app runs is
 * reported as fatal, one at the start can be caught, which is what makes "no sound in this build"
 * possible.
 */
import type * as AudioModule from 'expo-audio';

export type SoundName =
  | 'move'
  | 'rotate'
  | 'land'
  | 'drop'
  | 'hold'
  | 'clear1'
  | 'clear2'
  | 'clear3'
  | 'clear4'
  | 'levelUp'
  | 'gameOver'
  | 'finished'
  | 'tick'
  | 'go';

export interface SoundSdk {
  audio: typeof AudioModule;
  files: Record<SoundName | 'music', number>;
}

let loaded: SoundSdk | null = null;
try {
  /* eslint-disable @typescript-eslint/no-require-imports */
  loaded = {
    audio: require('expo-audio') as typeof AudioModule,
    files: {
      move: require('../../assets/sounds/move.wav'),
      rotate: require('../../assets/sounds/rotate.wav'),
      land: require('../../assets/sounds/land.wav'),
      drop: require('../../assets/sounds/drop.wav'),
      hold: require('../../assets/sounds/hold.wav'),
      clear1: require('../../assets/sounds/clear1.wav'),
      clear2: require('../../assets/sounds/clear2.wav'),
      clear3: require('../../assets/sounds/clear3.wav'),
      clear4: require('../../assets/sounds/clear4.wav'),
      levelUp: require('../../assets/sounds/levelUp.wav'),
      gameOver: require('../../assets/sounds/gameOver.wav'),
      finished: require('../../assets/sounds/finished.wav'),
      tick: require('../../assets/sounds/tick.wav'),
      go: require('../../assets/sounds/go.wav'),
      music: require('../../assets/sounds/music.m4a'),
    },
  };
  /* eslint-enable @typescript-eslint/no-require-imports */
} catch {
  loaded = null;
}

export const loadSoundSdk = (): SoundSdk | null => loaded;
