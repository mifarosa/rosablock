// Tetromino shapes, SRS rotation states and SRS wall-kick tables.

export type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';
export type Matrix = number[][];
export type Rotation = 0 | 1 | 2 | 3;

export const TETROMINO_TYPES: readonly TetrominoType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

export const BOARD_COLS = 10;
export const BOARD_ROWS = 20;

// Spawn orientation (state 0) of each piece, in a square bounding box.
const BASE_SHAPES: Record<TetrominoType, Matrix> = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
};

/** Rotates a square matrix 90 degrees clockwise: result[c][n-1-r] = m[r][c]. */
export function rotateMatrixCW(m: Matrix): Matrix {
  const n = m.length;
  const out: Matrix = Array.from({ length: n }, () => new Array<number>(n).fill(0));
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      out[c]![n - 1 - r] = m[r]![c]!;
    }
  }
  return out;
}

function buildRotations(base: Matrix): Matrix[] {
  const states: Matrix[] = [base];
  for (let i = 1; i < 4; i++) {
    states.push(rotateMatrixCW(states[i - 1]!));
  }
  return states;
}

/** SHAPES[type][rotation] -> matrix. Rotation 0 = spawn, 1 = CW, 2 = 180, 3 = CCW. */
export const SHAPES: Record<TetrominoType, Matrix[]> = {
  I: buildRotations(BASE_SHAPES.I),
  J: buildRotations(BASE_SHAPES.J),
  L: buildRotations(BASE_SHAPES.L),
  O: buildRotations(BASE_SHAPES.O),
  S: buildRotations(BASE_SHAPES.S),
  T: buildRotations(BASE_SHAPES.T),
  Z: buildRotations(BASE_SHAPES.Z),
};

export function getMatrix(type: TetrominoType, rotation: Rotation): Matrix {
  return SHAPES[type][rotation]!;
}

type Kick = readonly [number, number]; // [dx, dy], SRS convention: +x right, +y UP

// Wall-kick offsets, keyed by `${from}${to}` rotation states.
const KICKS_JLSTZ: Record<string, readonly Kick[]> = {
  '01': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '10': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '12': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '21': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '23': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  '32': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '30': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '03': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
};

const KICKS_I: Record<string, readonly Kick[]> = {
  '01': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  '10': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  '12': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
  '21': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  '23': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  '32': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  '30': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  '03': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
};

/** Returns kick offsets as [dCol, dRow] (row axis points DOWN, as in the grid). */
export function getKicks(type: TetrominoType, from: Rotation, to: Rotation): [number, number][] {
  if (type === 'O') return [[0, 0]];
  const table = type === 'I' ? KICKS_I : KICKS_JLSTZ;
  const list = table[`${from}${to}`] ?? [[0, 0]];
  return list.map(([dx, dy]) => [dx, -dy] as [number, number]);
}
