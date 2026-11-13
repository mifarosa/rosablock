// Makes the sound effects and the music of Rosablock (assets/sounds) with no samples: every
// sound is a few sine waves with a soft attack and a long, gentle fall, like a marimba or a small
// bell. All notes come from one pentatonic scale, so any order of them sounds friendly.
//
//   node scripts/makeSounds.mjs
//
// The music is turned into AAC with ffmpeg to keep the app small; the effects stay WAV (tiny).
// The output is committed, so ffmpeg is only needed to make the files again.
import { Buffer } from 'node:buffer';
import { execFileSync } from 'node:child_process';
import { mkdirSync, unlinkSync, writeFileSync } from 'node:fs';

const OUT = new URL('../assets/sounds/', import.meta.url).pathname;
const RATE = 32000;
const TAU = Math.PI * 2;

const buffer = (seconds) => new Float32Array(Math.ceil(seconds * RATE));

/** A small seeded random generator, so the music is the same every time it is made. */
function createRandom(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// C major pentatonic, in a few octaves.
const N = {
  C4: 261.63, E4: 329.63, G4: 392.0, A4: 440.0,
  C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.0,
  C6: 1046.5, D6: 1174.66, E6: 1318.51, G6: 1567.98, C7: 2093.0
};

/** A soft, plucked note: a sine with a gentle attack and a woody overtone that dies quickly. */
function pluck(out, start, frequency, duration, volume) {
  const first = Math.floor(start * RATE);
  const count = Math.floor(duration * RATE);
  let p1 = 0;
  let p2 = 0;
  let p3 = 0;
  for (let i = 0; i < count && first + i < out.length; i++) {
    const t = i / RATE;
    p1 += (TAU * frequency) / RATE;
    p2 += (TAU * frequency * 3.9) / RATE; // marimba-like overtone
    p3 += (TAU * frequency * 2.01) / RATE; // slight detuned octave for sweetness
    const attack = Math.min(1, t / 0.006);
    const body = Math.exp(-t * (5.5 / duration)) * attack;
    const wood = Math.exp(-t * (28 / duration)) * attack;
    out[first + i] += (Math.sin(p1) * body + Math.sin(p2) * wood * 0.22 + Math.sin(p3) * body * 0.1) * volume;
  }
}

/** A sine that glides between two pitches and fades out (used for soft thuds). */
function glide(out, start, from, to, duration, volume) {
  const first = Math.floor(start * RATE);
  const count = Math.floor(duration * RATE);
  let phase = 0;
  for (let i = 0; i < count && first + i < out.length; i++) {
    const t = i / RATE;
    const frequency = from * Math.pow(to / from, t / duration);
    phase += (TAU * frequency) / RATE;
    const env = Math.min(1, t / 0.005) * Math.pow(1 - t / duration, 2);
    out[first + i] += Math.sin(phase) * env * volume;
  }
}

function toWav(samples, peak = 0.85) {
  let max = 0;
  for (const sample of samples) max = Math.max(max, Math.abs(sample));
  const gain = max > 0 ? peak / max : 1;
  const data = Buffer.alloc(44 + samples.length * 2);
  data.write('RIFF', 0);
  data.writeUInt32LE(36 + samples.length * 2, 4);
  data.write('WAVEfmt ', 8);
  data.writeUInt32LE(16, 16);
  data.writeUInt16LE(1, 20);
  data.writeUInt16LE(1, 22);
  data.writeUInt32LE(RATE, 24);
  data.writeUInt32LE(RATE * 2, 28);
  data.writeUInt16LE(2, 32);
  data.writeUInt16LE(16, 34);
  data.write('data', 36);
  data.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((sample, i) =>
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, sample * gain)) * 32767), 44 + i * 2),
  );
  return data;
}

/** Notes played one after another: [[note, delay]...]. */
function run(out, notes, gap, duration, volume) {
  notes.forEach((note, i) => pluck(out, i * gap, note, duration, volume));
}

const effects = {
  move() {
    const out = buffer(0.07);
    glide(out, 0, 900, 780, 0.05, 0.5);
    return out;
  },
  rotate() {
    const out = buffer(0.25);
    pluck(out, 0, N.C6, 0.22, 0.6);
    return out;
  },
  land() {
    const out = buffer(0.25);
    glide(out, 0, 260, 120, 0.12, 0.55);
    pluck(out, 0, N.G4, 0.2, 0.3);
    return out;
  },
  drop() {
    const out = buffer(0.35);
    glide(out, 0, 520, 90, 0.2, 0.7);
    pluck(out, 0.02, N.C4, 0.3, 0.4);
    return out;
  },
  hold() {
    const out = buffer(0.35);
    run(out, [N.E5, N.A5], 0.07, 0.25, 0.5);
    return out;
  },
  clear1() {
    const out = buffer(0.7);
    run(out, [N.G5, N.C6], 0.08, 0.55, 0.55);
    return out;
  },
  clear2() {
    const out = buffer(0.85);
    run(out, [N.G5, N.C6, N.E6], 0.08, 0.6, 0.55);
    return out;
  },
  clear3() {
    const out = buffer(1.0);
    run(out, [N.E5, N.G5, N.C6, N.E6], 0.075, 0.7, 0.55);
    return out;
  },
  clear4() {
    // A tetris: a rising run that ends in a small shimmer.
    const out = buffer(1.6);
    run(out, [N.C5, N.E5, N.G5, N.C6, N.E6, N.G6], 0.07, 0.8, 0.5);
    pluck(out, 0.42, N.C7, 1.1, 0.22);
    pluck(out, 0.5, N.G6, 1.0, 0.16);
    return out;
  },
  levelUp() {
    const out = buffer(0.9);
    run(out, [N.C6, N.E6, N.G6, N.C7], 0.07, 0.6, 0.45);
    return out;
  },
  gameOver() {
    // Three notes sinking down, soft and a little sad.
    const out = buffer(1.6);
    run(out, [N.E5, N.C5, N.A4], 0.28, 1.0, 0.5);
    return out;
  },
  finished() {
    const out = buffer(1.8);
    run(out, [N.C5, N.E5, N.G5, N.C6], 0.11, 0.9, 0.5);
    pluck(out, 0.44, N.E6, 1.2, 0.3);
    pluck(out, 0.5, N.G6, 1.1, 0.2);
    return out;
  },
  tick() {
    const out = buffer(0.2);
    pluck(out, 0, N.A5, 0.16, 0.6);
    return out;
  },
  go() {
    const out = buffer(0.5);
    run(out, [N.E6, N.A5 * 2], 0.06, 0.4, 0.5);
    return out;
  },
};

// --- The music: four soft chords of eight seconds, with bells over them, folded into a loop. ---

function music() {
  const seconds = 8;
  const chords = [
    [130.81, 164.81, 196.0, 246.94], // Cmaj7
    [110.0, 130.81, 164.81, 196.0], // Am7
    [87.31, 110.0, 130.81, 164.81], // Fmaj7
    [98.0, 123.47, 146.83, 164.81], // G6
  ];
  const bass = [65.41, 55.0, 43.65, 49.0];
  const scale = [N.C5, N.D5, N.E5, N.G5, N.A5, N.C6, N.D6, N.E6];
  const loop = chords.length * seconds;
  const out = buffer(loop + 6); // The tails run past the end and are folded back to the start.
  const rand = createRandom(1111);

  chords.forEach((notes, index) => {
    const start = index * seconds;
    // Pad: each note is two slightly detuned sines that swell in and out.
    for (const frequency of notes.concat(notes.map((note) => note * 2))) {
      for (const detune of [-0.7, 0.7]) {
        const first = Math.floor(start * RATE);
        const count = Math.floor((seconds + 3) * RATE);
        let phase = rand() * TAU;
        for (let i = 0; i < count && first + i < out.length; i++) {
          const t = i / RATE;
          phase += (TAU * (frequency + detune)) / RATE;
          const swell = Math.sin(Math.PI * Math.min(1, t / (seconds + 3))) ** 1.5;
          out[first + i] += Math.sin(phase) * swell * 0.045;
        }
      }
    }
    // Bass: one long, low, quiet note.
    glide(out, start, bass[index], bass[index], seconds + 1.5, 0.14);
    // Bells: a few notes of the scale, never on a steady beat.
    let at = start + 0.8;
    while (at < start + seconds - 0.6) {
      const frequency = scale[Math.floor(rand() * scale.length)];
      pluck(out, at, frequency, 2.8, 0.07 + rand() * 0.04);
      at += 1.1 + rand() * 1.8;
    }
  });

  // A soft echo, so the bells sound like they are in a room.
  for (const [delay, level] of [[0.31, 0.3], [0.52, 0.22], [0.77, 0.15]]) {
    const shift = Math.floor(delay * RATE);
    for (let i = out.length - 1; i >= shift; i--) out[i] += out[i - shift] * level;
  }

  // Fold what runs past the end onto the start, so the loop has no seam.
  const length = loop * RATE;
  const looped = new Float32Array(length);
  for (let i = 0; i < out.length; i++) looped[i % length] += out[i];
  return looped;
}

mkdirSync(OUT, { recursive: true });
for (const [name, make] of Object.entries(effects)) {
  writeFileSync(`${OUT}${name}.wav`, toWav(make()));
}
writeFileSync(`${OUT}music.tmp.wav`, toWav(music(), 0.6));
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', `${OUT}music.tmp.wav`, '-c:a', 'aac', '-b:a', '64k', `${OUT}music.m4a`]);
unlinkSync(`${OUT}music.tmp.wav`);
console.log('Sounds written to assets/sounds');
