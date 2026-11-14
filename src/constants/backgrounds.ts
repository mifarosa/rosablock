// Vector backdrops for the themes, as plain data: every shape is a single SVG path with absolute
// coordinates (no transforms), drawn on a 400 x 800 canvas that is scaled to fill the screen.
import { THEMES, type ThemeId } from './colors';

export const BACKGROUND_WIDTH = 400;
export const BACKGROUND_HEIGHT = 800;

export interface BackgroundShape {
  d: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity: number;
}

type Point = readonly [number, number];

/** Maps local coordinates (origin at the base, y pointing up the plant) onto the canvas. */
function placer(x: number, y: number, angleDeg: number) {
  const a = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  return ([px, py]: Point): Point => [x + px * cos - py * sin, y + px * sin + py * cos];
}

const f = (n: number) => n.toFixed(1);
const pt = ([x, y]: Point) => `${f(x)} ${f(y)}`;

/** A rotated ellipse as two SVG arcs. */
function ellipse(place: ReturnType<typeof placer>, cx: number, cy: number, rx: number, ry: number, rotDeg: number): string {
  const r = (rotDeg * Math.PI) / 180;
  const dx = rx * Math.cos(r);
  const dy = rx * Math.sin(r);
  const a = place([cx - dx, cy - dy]);
  const b = place([cx + dx, cy + dy]);
  // The arc's own rotation is relative to the canvas, so add the placement angle through the points.
  const angle = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
  return `M${pt(a)} A${f(rx)} ${f(ry)} ${f(angle)} 1 0 ${pt(b)} A${f(rx)} ${f(ry)} ${f(angle)} 1 0 ${pt(a)}Z`;
}

/** A sprig of lavender: a thin curved stem with paired buds along its upper part. */
function lavenderSprig(
  x: number,
  y: number,
  angle: number,
  length: number,
  colors: readonly [string, string, string],
  opacity: number,
): BackgroundShape[] {
  const place = placer(x, y, angle);
  const shapes: BackgroundShape[] = [];
  const stem = `M${pt(place([0, 0]))} C${pt(place([5, -length * 0.3]))} ${pt(place([-5, -length * 0.65]))} ${pt(place([1, -length]))}`;
  shapes.push({ d: stem, stroke: colors[2], strokeWidth: 2.2, opacity: opacity * 1.2 });

  const budCount = Math.max(5, Math.round(length / 26));
  for (let i = 0; i < budCount; i++) {
    const t = 0.38 + (0.6 * i) / (budCount - 1);
    const cy = -length * t;
    const size = 1 - t * 0.35; // buds shrink toward the tip
    const color = colors[i % 2]!;
    shapes.push({ d: ellipse(place, -6.5 * size, cy, 3.4 * size, 8 * size, 28), fill: color, opacity });
    shapes.push({ d: ellipse(place, 6.5 * size, cy + 4, 3.4 * size, 8 * size, -28), fill: color, opacity });
  }
  shapes.push({ d: ellipse(place, 0.5, -length - 6, 3 , 8, 0), fill: colors[0], opacity });

  // Two long, narrow leaves at the base.
  for (const side of [-1, 1]) {
    const tip = place([side * 22, -length * 0.22]);
    const mid = place([side * 14, -length * 0.06]);
    shapes.push({
      d: `M${pt(place([0, 0]))} Q${pt(mid)} ${pt(tip)} Q${pt(place([side * 9, -length * 0.1]))} ${pt(place([0, 0]))}Z`,
      fill: colors[2],
      opacity: opacity * 0.9,
    });
  }
  return shapes;
}

/** One leaf, base at the origin, pointing up; with a thin midrib. */
function leaf(
  place: ReturnType<typeof placer>,
  length: number,
  width: number,
  color: string,
  ribColor: string,
  opacity: number,
): BackgroundShape[] {
  const p0 = place([0, 0]);
  const d =
    `M${pt(p0)} C${pt(place([width, -length * 0.3]))} ${pt(place([width * 0.6, -length * 0.8]))} ${pt(place([0, -length]))}` +
    ` C${pt(place([-width * 0.6, -length * 0.8]))} ${pt(place([-width, -length * 0.3]))} ${pt(p0)}Z`;
  return [
    { d, fill: color, opacity },
    { d: `M${pt(p0)} L${pt(place([0, -length * 0.88]))}`, stroke: ribColor, strokeWidth: 1.2, opacity: opacity * 1.3 },
  ];
}

/** A mint branch: a curved stem with leaf pairs that get smaller toward the tip. */
function mintBranch(
  x: number,
  y: number,
  angle: number,
  length: number,
  colors: readonly [string, string, string],
  opacity: number,
): BackgroundShape[] {
  const place = placer(x, y, angle);
  const shapes: BackgroundShape[] = [];
  shapes.push({
    d: `M${pt(place([0, 0]))} C${pt(place([-8, -length * 0.35]))} ${pt(place([8, -length * 0.7]))} ${pt(place([0, -length]))}`,
    stroke: colors[2],
    strokeWidth: 2.4,
    opacity: opacity * 1.2,
  });
  const pairs = Math.max(3, Math.round(length / 55));
  for (let i = 0; i < pairs; i++) {
    const t = 0.18 + (0.7 * i) / (pairs - 1);
    const base = -length * t;
    const size = 1 - t * 0.5;
    for (const side of [-1, 1]) {
      const leafPlace = (q: Point): Point => place([q[0] + 0, q[1] + base]);
      const rotated = placer(0, 0, side * 52);
      // A leaf grown from the stem at `base`, tilted to either side.
      const local = (q: Point): Point => leafPlace(rotated(q));
      shapes.push(...leaf(local, 52 * size, 17 * size, colors[i % 2]!, colors[2], opacity));
    }
  }
  shapes.push(...leaf((q) => place([q[0], q[1] - length]), 44, 14, colors[0], colors[2], opacity));
  return shapes;
}

/** Mixes `color` into `base`: amount 0 = base, 1 = color. Both are `#rrggbb`. */
function mix(color: string, base: string, amount: number): string {
  const channel = (hex: string, i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
  const out = [0, 1, 2].map((i) => {
    const v = Math.round(channel(base, i) + (channel(color, i) - channel(base, i)) * amount);
    return v.toString(16).padStart(2, '0');
  });
  return `#${out.join('')}`;
}

/**
 * A rose seen from above: rings of petals that get smaller toward the middle, ending in a small
 * spiral. Petals are solid colors (already blended into the backdrop, so the rose stays soft) and
 * cover each other like real petals, with a thin lighter edge.
 */
function roseBloom(
  cx: number,
  cy: number,
  radius: number,
  turn: number,
  strength: number,
): BackgroundShape[] {
  const back = THEMES.rose.background;
  const place = placer(cx, cy, 0);
  const shapes: BackgroundShape[] = [];
  const edge = mix('#F7E8EC', back, 0.2 * strength);
  const rings: { petals: number; dist: number; rx: number; ry: number; color: string }[] = [
    { petals: 5, dist: 0.6, rx: 0.5, ry: 0.58, color: '#D8839F' },
    { petals: 5, dist: 0.43, rx: 0.4, ry: 0.48, color: '#E8A5B8' },
    { petals: 4, dist: 0.27, rx: 0.32, ry: 0.4, color: '#C97A9E' },
    { petals: 3, dist: 0.13, rx: 0.24, ry: 0.3, color: '#B66685' },
  ];
  rings.forEach((ring, ringIndex) => {
    const fill = mix(ring.color, back, 0.34 * strength);
    for (let i = 0; i < ring.petals; i++) {
      const angle = turn + ringIndex * 0.6 + (i * 2 * Math.PI) / ring.petals;
      const px = Math.cos(angle) * ring.dist * radius;
      const py = Math.sin(angle) * ring.dist * radius;
      const rot = (angle * 180) / Math.PI + 90; // the petal's long side points away from the center
      shapes.push({
        d: ellipse(place, px, py, ring.rx * radius, ring.ry * radius, rot),
        fill,
        stroke: edge,
        strokeWidth: 1.2,
        opacity: 1,
      });
    }
  });
  // The heart of the rose: a small spiral.
  let spiral = '';
  for (let step = 0; step <= 32; step++) {
    const t = step / 32;
    const a = turn + t * 4.4 * Math.PI;
    const r = radius * 0.17 * t;
    spiral += `${step === 0 ? 'M' : 'L'}${pt(place([Math.cos(a) * r, Math.sin(a) * r]))} `;
  }
  shapes.push({ d: spiral.trim(), stroke: mix('#F7E8EC', back, 0.28 * strength), strokeWidth: 1.6, opacity: 1 });
  return shapes;
}

/** A thin thorny stem with a few leaves, base at (x, y), reaching up at `angle`. */
function roseStem(
  x: number,
  y: number,
  angle: number,
  length: number,
  color: string,
  opacity: number,
): BackgroundShape[] {
  const place = placer(x, y, angle);
  const shapes: BackgroundShape[] = [
    {
      d: `M${pt(place([0, 0]))} C${pt(place([-10, -length * 0.35]))} ${pt(place([10, -length * 0.7]))} ${pt(place([0, -length]))}`,
      stroke: color,
      strokeWidth: 2.6,
      opacity: opacity * 1.3,
    },
  ];
  [0.28, 0.55, 0.8].forEach((t, i) => {
    const side = i % 2 === 0 ? -1 : 1;
    const base = placer(0, 0, side * 58);
    const leafPlace = (q: Point): Point => place(((b): Point => [b[0], b[1] - length * t])(base(q)));
    shapes.push(...leaf(leafPlace, 48 - i * 8, 15 - i * 2, color, color, opacity));
  });
  return shapes;
}

const ROSE_LEAF = '#9E4B6C';

function buildRose(): BackgroundShape[] {
  return [
    ...roseStem(70, 840, -6, 330, ROSE_LEAF, 0.15),
    ...roseStem(300, 850, 8, 280, ROSE_LEAF, 0.13),
    ...roseStem(385, -20, 186, 200, ROSE_LEAF, 0.12),
    ...roseBloom(58, 520, 66, 0.2, 1),
    ...roseBloom(318, 600, 50, 1.1, 0.9),
    ...roseBloom(366, 170, 60, 0.6, 1),
    ...roseBloom(24, 790, 44, 2.0, 0.85),
    ...roseBloom(176, 772, 36, 0.9, 0.8),
  ];
}

const LAVENDER_COLORS = ['#C4B3F0', '#A98EE2', '#8B74BF'] as const;
const MINT_COLORS = ['#A9E1CA', '#6DB499', '#58998A'] as const;

function buildLavender(): BackgroundShape[] {
  return [
    ...lavenderSprig(52, 830, -6, 360, LAVENDER_COLORS, 0.16),
    ...lavenderSprig(118, 840, 9, 280, LAVENDER_COLORS, 0.12),
    ...lavenderSprig(352, 835, 5, 320, LAVENDER_COLORS, 0.14),
    ...lavenderSprig(300, 850, -10, 210, LAVENDER_COLORS, 0.1),
    ...lavenderSprig(372, -30, 186, 250, LAVENDER_COLORS, 0.13),
    ...lavenderSprig(318, -40, 172, 170, LAVENDER_COLORS, 0.1),
    ...lavenderSprig(-6, 330, 78, 150, LAVENDER_COLORS, 0.09),
  ];
}

function buildMint(): BackgroundShape[] {
  return [
    ...mintBranch(46, 835, -8, 330, MINT_COLORS, 0.16),
    ...mintBranch(330, 840, 10, 300, MINT_COLORS, 0.14),
    ...mintBranch(392, -26, 190, 250, MINT_COLORS, 0.13),
    ...mintBranch(286, -40, 168, 160, MINT_COLORS, 0.1),
    ...mintBranch(-10, 380, 82, 140, MINT_COLORS, 0.09),
  ];
}

const cache: Partial<Record<ThemeId, BackgroundShape[]>> = {};

/** The shapes of a theme's backdrop. */
export function backgroundShapes(theme: ThemeId): BackgroundShape[] {
  const cached = cache[theme];
  if (cached) return cached;
  const built =
    theme === 'rose' ? buildRose() : theme === 'lavender' ? buildLavender() : buildMint();
  cache[theme] = built;
  return built;
}
