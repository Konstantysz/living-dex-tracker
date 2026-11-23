// PROTOTYPE (throwaway). Stand-in for map-areas.svg: 30 paths in game coordinates 0..5000.
export const W = 5000;
export const HIT_R = 12; // finger tolerance in screen px
export const SAMPLES: [number, number][] = [
  [0, 0],
  [HIT_R, 0],
  [-HIT_R, 0],
  [0, HIT_R],
  [0, -HIT_R],
];

export interface Area {
  id: string;
  z: number;
  pts: number[]; // x0,y0,x1,y1...
  cx: number;
  cy: number;
  w: number;
  h: number;
  color: string;
}
export interface ViewState {
  x: number;
  y: number;
  scale: number;
}
export interface Ctx {
  el: HTMLElement;
  areas: Area[];
  markers: [number, number][];
  base: HTMLCanvasElement;
  init: ViewState | null;
  onPick: (id: string | null, ms: number) => void;
  log: (s: string) => void;
}
export interface Engine {
  setView(v: ViewState): void;
  getView(): ViewState;
  setSelected(id: string | null): void;
  destroy(): void;
}
export type Factory = (c: Ctx) => Promise<Engine>;

export const labelVisible = (a: Area, scale: number) => Math.max(a.w, a.h) * scale > 50;

function rng(seed: number) {
  let s = seed >>> 0;
  return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 2 ** 32;
}

interface Spec {
  id: string;
  z: number;
  cx: number;
  cy: number;
  a: number;
  b: number;
}
function specs(): Spec[] {
  const out: Spec[] = [];
  for (const [n, cx, cy] of [
    ['nw', 1250, 1250],
    ['ne', 3750, 1250],
    ['sw', 1250, 3750],
    ['se', 3750, 3750],
  ] as const)
    out.push({ id: `sea-${n}`, z: 0, cx, cy, a: 1240, b: 1240 });
  const cell = (r: number, c: number) => [1140 + 680 * c, 1225 + 850 * r] as const;
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 5; c++)
      out.push({
        id: `land-r${r}c${c}`,
        z: 1,
        cx: cell(r, c)[0],
        cy: cell(r, c)[1],
        a: 315,
        b: 400,
      });
  [
    [0, 1],
    [1, 3],
    [2, 0],
    [3, 2],
  ].forEach(([r, c], k) =>
    out.push({
      id: `nested-${k + 1}`,
      z: 2,
      cx: cell(r, c)[0] + 60,
      cy: cell(r, c)[1] - 50,
      a: 110,
      b: 140,
    }),
  );
  [
    [1, 1],
    [2, 4],
  ].forEach(([r, c], k) =>
    out.push({
      id: `tiny-${k + 1}`,
      z: 3,
      cx: cell(r, c)[0] + 120,
      cy: cell(r, c)[1] - 100,
      a: 38,
      b: 38,
    }),
  );
  return out;
}

const FREQ = [3, 7, 19, 53, 151, 401];
const AMP = [20, 10, 5, 2.5, 1.2, 0.6];

/** Rounded-rectangle ring with fractal edge noise, sampled at n points. */
function ring(s: Spec, n: number, seed: number): number[] {
  const r = rng(seed);
  const ph = FREQ.map(() => r() * 6.28);
  const k = Math.min(s.a, s.b) / 400;
  const pts: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = (2 * Math.PI * i) / n;
    const cs = Math.cos(t),
      sn = Math.sin(t);
    let d = 0;
    for (let j = 0; j < FREQ.length; j++) d += AMP[j] * k * Math.sin(FREQ[j] * t + ph[j]);
    const x = s.cx + s.a * Math.sign(cs) * Math.sqrt(Math.abs(cs)) + cs * d;
    const y = s.cy + s.b * Math.sign(sn) * Math.sqrt(Math.abs(sn)) + sn * d;
    pts.push(+x.toFixed(1), +y.toFixed(1));
  }
  return pts;
}

export function buildSvg(pointsPerArea: number): string {
  const paths = specs().map((s, i) => {
    const p = ring(s, pointsPerArea, i + 1);
    let d = `M${p[0]} ${p[1]}`;
    for (let j = 2; j < p.length; j += 2) d += `L${p[j]} ${p[j + 1]}`;
    return `<path id="${s.id}" data-z="${s.z}" d="${d}Z"/>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${W}"><g>${paths.join('')}</g></svg>`;
}

/** The conversion step: SVG text -> plain polygons. Only M/L/Z is supported (curves = TODO in ADR 0004). */
export function parseSvg(svg: string): Area[] {
  const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
  const areas = [...doc.querySelectorAll('path')].map((p, i) => {
    const pts = (p.getAttribute('d')!.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
    let x0 = Infinity,
      y0 = Infinity,
      x1 = -Infinity,
      y1 = -Infinity;
    for (let j = 0; j < pts.length; j += 2) {
      x0 = Math.min(x0, pts[j]);
      x1 = Math.max(x1, pts[j]);
      y0 = Math.min(y0, pts[j + 1]);
      y1 = Math.max(y1, pts[j + 1]);
    }
    return {
      id: p.id,
      z: Number(p.dataset.z),
      pts,
      cx: (x0 + x1) / 2,
      cy: (y0 + y1) / 2,
      w: x1 - x0,
      h: y1 - y0,
      color: `hsl(${(i * 47) % 360} 70% 55%)`,
    };
  });
  return areas.sort((a, b) => a.z - b.z);
}

export function makeMarkers(): [number, number][] {
  const r = rng(99);
  return Array.from(
    { length: 300 },
    () => [600 + r() * 3800, 600 + r() * 3800] as [number, number],
  );
}

/** Raster base, 4096 px for 5000 units (like Serebii). Grid + labels show how sharp it is. */
export function makeBase(areas: Area[]): HTMLCanvasElement {
  const S = 4096,
    k = S / W;
  const cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const g = cv.getContext('2d')!;
  g.fillStyle = '#12384f';
  g.fillRect(0, 0, S, S);
  g.globalAlpha = 0.25;
  for (const a of areas) {
    g.fillStyle = a.color;
    g.beginPath();
    for (let j = 0; j < a.pts.length; j += 2)
      g[j ? 'lineTo' : 'moveTo'](a.pts[j] * k, a.pts[j + 1] * k);
    g.fill();
  }
  g.globalAlpha = 1;
  g.strokeStyle = 'rgba(255,255,255,.18)';
  g.fillStyle = 'rgba(255,255,255,.5)';
  g.font = '18px monospace';
  for (let u = 0; u <= W; u += 250) {
    g.beginPath();
    g.moveTo(u * k, 0);
    g.lineTo(u * k, S);
    g.moveTo(0, u * k);
    g.lineTo(S, u * k);
    g.stroke();
    for (let v = 0; v < W; v += 250) g.fillText(`${u},${v}`, u * k + 3, v * k + 16);
  }
  return cv;
}
