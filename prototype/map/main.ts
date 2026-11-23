// PROTOTYPE (throwaway). Page for ticket #47. ?engine=maplibre|pixi|canvas&stress=1
import './style.css';
import {
  buildSvg,
  makeBase,
  makeMarkers,
  parseSvg,
  W,
  type Engine,
  type Factory,
  type ViewState,
} from './data';

const ENGINES = ['maplibre', 'pixi', 'canvas'] as const;
const q = new URLSearchParams(location.search);
const name = (ENGINES as readonly string[]).includes(q.get('engine') ?? '')
  ? q.get('engine')!
  : 'maplibre';
const stress = q.get('stress') === '1';
const $ = (id: string) => document.getElementById(id)!;

const go = (engine: string, st: boolean) => {
  location.search = `?engine=${engine}${st ? '&stress=1' : ''}`;
};
const step = (d: number) =>
  go(ENGINES[(ENGINES.indexOf(name as never) + d + ENGINES.length) % ENGINES.length], stress);
$('prev').onclick = () => step(-1);
$('next').onclick = () => step(1);
$('label').textContent = name;
$('stress').textContent = stress ? 'stress: 5000 pts/area' : 'normal: 48 pts/area';
$('stress').onclick = () => go(name, !stress);
addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') step(-1);
  if (e.key === 'ArrowRight') step(1);
});

const svg = buildSvg(stress ? 5000 : 48);
const areas = parseSvg(svg);
const markers = makeMarkers();
const base = makeBase(areas);
const info: Record<string, string> = {
  engine: name,
  svg: `${(svg.length / 1024).toFixed(0)} KB, ${areas.length} paths, ${areas.reduce((n, a) => n + a.pts.length / 2, 0)} pts`,
  init: '…',
  pick: '-',
  fps: '-',
  bench: '-',
  log: '',
};
const render = () => {
  $('hud').textContent = Object.entries(info)
    .map(([k, v]) => `${k.padEnd(7)}${v}`)
    .join('\n');
};
render();

const KEY = 'proto-map-view';
let init: ViewState | null = null;
try {
  init = JSON.parse(sessionStorage.getItem(KEY) ?? 'null');
} catch {
  /* ignore */
}

const t0 = performance.now();
const factories: Record<string, () => Promise<{ create: Factory }>> = {
  maplibre: () => import('./maplibre'),
  pixi: () => import('./pixi'),
  canvas: () => import('./canvas'),
};
const engine: Engine = await (
  await factories[name]()
).create({
  el: $('stage'),
  areas,
  markers,
  base,
  init,
  onPick: (id, ms) => {
    info.pick = `${id ?? 'none'} (${ms.toFixed(2)} ms)`;
    engine.setSelected(id);
    render();
  },
  log: (s) => {
    info.log = s;
    render();
  },
});
info.init = `${(performance.now() - t0).toFixed(0)} ms`;
render();
addEventListener('pagehide', () => {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(engine.getView()));
  } catch {
    /* ignore */
  }
});

// live fps + benchmark
let benchT = -1;
const dts: number[] = [];
let last = performance.now(),
  ema = 16;
const frame = (now: number) => {
  const dt = now - last;
  last = now;
  ema = ema * 0.95 + dt * 0.05;
  if (benchT >= 0) {
    const u = (now - benchT) / 8000;
    if (u >= 1) {
      benchT = -1;
      const s = [...dts].sort((a, b) => a - b);
      const avg = dts.reduce((a, b) => a + b, 0) / dts.length;
      info.bench = `avg ${avg.toFixed(1)} ms (${(1000 / avg).toFixed(0)} fps), p95 ${s[Math.floor(s.length * 0.95)].toFixed(1)}, max ${s[s.length - 1].toFixed(0)}, >33ms: ${dts.filter((d) => d > 33).length}/${dts.length}`;
      ($('bench') as HTMLButtonElement).disabled = false;
    } else {
      dts.push(dt);
      const zp = (1 - Math.cos(4 * Math.PI * u)) / 2;
      engine.setView({
        x: W / 2 + 1300 * Math.cos(2 * Math.PI * u),
        y: W / 2 + 1300 * Math.sin(2 * Math.PI * u),
        scale: Math.exp(Math.log(0.08) + (Math.log(0.6) - Math.log(0.08)) * zp),
      });
    }
  }
  info.fps = `${(1000 / ema).toFixed(0)}`;
  requestAnimationFrame(frame);
};
requestAnimationFrame(frame);
setInterval(render, 500);
$('bench').onclick = () => {
  dts.length = 0;
  info.bench = 'running 8 s…';
  ($('bench') as HTMLButtonElement).disabled = true;
  benchT = performance.now();
};
