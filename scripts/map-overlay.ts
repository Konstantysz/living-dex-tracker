/**
 * Writes a static HTML page for the human check of `src/games/sv/map-areas.svg` (#15).
 * It shows the source picture, our area paths, the slug on hover and the game coordinates.
 * Run: `npm run map:overlay`, then open `scripts/cache/serebii/map-overlay.html`.
 * The page is in the git-ignored cache because it shows the source picture (ADR 5).
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Locations } from '../src/core/locations';

const at = (p: string) => fileURLToPath(new URL(p, import.meta.url));
const CACHE = at('./cache/serebii/');
const SOURCE = 'map-source-4096.png';
if (!existsSync(CACHE + SOURCE))
  throw new Error(`no ${SOURCE}: run "uv run scripts/map-trace/stitch.py"`);

const locs = JSON.parse(
  readFileSync(at('../src/games/sv/generated/locations.json'), 'utf8'),
) as Locations;
const names = Object.fromEntries(
  Object.entries(locs.regions)
    .filter(([, r]) => r === 'paldea')
    .map(([slug]) => [slug, locs.areas[slug]!]),
);

const areasFile = at('../src/games/sv/map-areas.svg');
const svg = existsSync(areasFile)
  ? readFileSync(areasFile, 'utf8')
  : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5000 5000"></svg>';
const drawn = new Set([...svg.matchAll(/<path\b[^>]*\bid="([^"]+)"/g)].map((m) => m[1]!));
const missing = Object.keys(names).filter((s) => !drawn.has(s));

const html = `<!doctype html>
<meta charset="utf-8">
<title>map-areas overlay</title>
<style>
  body { margin: 0; font: 13px sans-serif; background: #222; color: #eee; overflow: hidden }
  #bar { position: fixed; top: 0; left: 0; right: 0; z-index: 2; padding: 6px 10px; background: #000c; display: flex; gap: 14px; align-items: center; flex-wrap: wrap }
  #stage { position: absolute; top: 0; left: 0; width: 5000px; height: 5000px; transform-origin: 0 0 }
  #stage img, #stage svg { position: absolute; top: 0; left: 0; width: 5000px; height: 5000px }
  #stage svg path { fill-opacity: .25; stroke-width: 4; vector-effect: non-scaling-stroke; pointer-events: all }
  #stage svg path[data-z="0"] { fill: #29f; stroke: #29f }
  #stage svg path[data-z="1"] { fill: #fa0; stroke: #fa0 }
  #stage svg path[data-z="2"] { fill: #f3a; stroke: #f3a }
  #stage svg path[data-z="3"] { fill: #f22; stroke: #f22 }
  #stage svg path:hover { fill-opacity: .6 }
  .off #pic, .off svg { display: none }
  #miss { max-width: 30em; color: #fc6 }
</style>
<div id="bar">
  <label><input type="checkbox" id="showPic" checked> picture</label>
  <label><input type="checkbox" id="showAreas" checked> areas</label>
  <label><input type="checkbox" id="fill" checked> fill</label>
  <span id="hover" style="min-width:18em">hover an area</span>
  <span id="pos">x, y</span>
  <span id="miss">${missing.length ? `no path (${missing.length}): ${missing.join(', ')}` : 'every slug has a path'}</span>
</div>
<div id="stage"><img id="pic" src="${SOURCE}">${svg}</div>
<script>
const names = ${JSON.stringify(names)};
const stage = document.getElementById('stage');
const svg = stage.querySelector('svg');
// higher data-z on top, so hover and taps reach nested and tiny areas
[...svg.querySelectorAll('path')]
  .sort((a, b) => a.dataset.z - b.dataset.z)
  .forEach((p) => svg.appendChild(p));
let k = Math.min(innerWidth, innerHeight) / 5000, tx = 0, ty = 0;
const apply = () => (stage.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + k + ')');
apply();
addEventListener('wheel', (e) => {
  e.preventDefault();
  const f = e.deltaY < 0 ? 1.2 : 1 / 1.2;
  tx = e.clientX - (e.clientX - tx) * f;
  ty = e.clientY - (e.clientY - ty) * f;
  k *= f;
  apply();
}, { passive: false });
let drag = null;
addEventListener('pointerdown', (e) => (drag = { x: e.clientX - tx, y: e.clientY - ty }));
addEventListener('pointerup', () => (drag = null));
addEventListener('pointermove', (e) => {
  if (drag) { tx = e.clientX - drag.x; ty = e.clientY - drag.y; apply(); }
  document.getElementById('pos').textContent =
    Math.round((e.clientX - tx) / k) + ', ' + Math.round((e.clientY - ty) / k);
  const p = e.target.closest && e.target.closest('path');
  document.getElementById('hover').textContent = p
    ? p.id + ' (' + (names[p.id] ?? 'NOT A PALDEA SLUG') + ', z' + p.dataset.z + ')'
    : 'hover an area';
});
document.getElementById('showPic').onchange = (e) => (document.getElementById('pic').style.display = e.target.checked ? '' : 'none');
document.getElementById('showAreas').onchange = (e) => (svg.style.display = e.target.checked ? '' : 'none');
document.getElementById('fill').onchange = (e) => svg.querySelectorAll('path').forEach((p) => (p.style.fillOpacity = e.target.checked ? '' : '0'));
</script>
`;

writeFileSync(CACHE + 'map-overlay.html', html);
console.log(`wrote ${CACHE}map-overlay.html | paths: ${drawn.size} | no path: ${missing.length}`);
