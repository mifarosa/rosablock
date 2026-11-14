// The settings icon: a gear drawn as one SVG path on a 24 x 24 canvas.

const f = (n: number) => n.toFixed(2);

/**
 * A gear with `teeth` teeth and a round hole (use fill-rule evenodd). Each tooth is a trapezoid
 * that is wider at its base than at its tip.
 */
export function gearPath(
  cx = 12,
  cy = 12,
  outer = 10.6,
  inner = 8.1,
  teeth = 8,
  hole = 3.5,
): string {
  const step = (2 * Math.PI) / teeth;
  const baseHalf = step * 0.27;
  const tipHalf = step * 0.16;
  const at = (angle: number, radius: number) =>
    `${f(cx + Math.cos(angle) * radius)} ${f(cy + Math.sin(angle) * radius)}`;

  let d = '';
  for (let i = 0; i < teeth; i++) {
    const a = i * step - Math.PI / 2;
    d += `${i === 0 ? 'M' : 'L'}${at(a - baseHalf, inner)} L${at(a - tipHalf, outer)} `;
    d += `L${at(a + tipHalf, outer)} L${at(a + baseHalf, inner)} `;
    // The valley between this tooth and the next, along the body of the gear.
    d += `A${f(inner)} ${f(inner)} 0 0 1 ${at(a + step - baseHalf, inner)} `;
  }
  d += 'Z ';
  // The hole, as a circle made of two arcs.
  d += `M${f(cx - hole)} ${f(cy)} A${f(hole)} ${f(hole)} 0 1 0 ${f(cx + hole)} ${f(cy)} `;
  d += `A${f(hole)} ${f(hole)} 0 1 0 ${f(cx - hole)} ${f(cy)} Z`;
  return d;
}
