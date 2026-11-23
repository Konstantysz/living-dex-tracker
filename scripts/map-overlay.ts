/**
 * Writes a static HTML page to draw and check `src/games/sv/map-areas.svg` (#15).
 * It shows the source picture and the Area paths. A draw mode adds, moves and deletes paths and
 * downloads the file. The browser code is in `map-overlay-client.js`.
 * Run: `npm run map:overlay`, then open `scripts/cache/serebii/map-overlay.html`.
 * The page is in the git-ignored cache because it shows the source picture (ADR 5).
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Locations } from '../src/core/locations';
import { AREA_Z, NO_PATH, parseRings, type Ring } from '../src/games/sv/mapAreas';

const at = (p: string) => fileURLToPath(new URL(p, import.meta.url));
const CACHE = at('./cache/serebii/');
const SOURCE = 'map-source-4096.png';
if (!existsSync(CACHE + SOURCE))
  throw new Error(`no ${SOURCE}: run "uv run scripts/map-trace/stitch.py"`);

const locs = JSON.parse(
  readFileSync(at('../src/games/sv/generated/locations.json'), 'utf8'),
) as Locations;
const paldea = Object.keys(locs.regions).filter((s) => locs.regions[s] === 'paldea');
const names = Object.fromEntries(paldea.map((s) => [s, locs.areas[s]!]));
const unlisted = paldea.filter((s) => !(s in AREA_Z) && !NO_PATH.includes(s));
if (unlisted.length)
  throw new Error(`no data-z in src/games/sv/mapAreas.ts for: ${unlisted.join(', ')}`);

// The paths of the file are the start of the draft (the contract allows only M, L and Z).
const areasFile = at('../src/games/sv/map-areas.svg');
// A path is a list of rings: one ring for each `M ... Z` part of `d`.
const initial: Record<string, Ring[]> = {};
if (existsSync(areasFile)) {
  for (const [tag] of readFileSync(areasFile, 'utf8').matchAll(/<path\b[^>]*>/g)) {
    const id = tag.match(/\sid="([^"]+)"/)?.[1];
    if (!id) continue;
    initial[id] = parseRings(tag.match(/\sd="([^"]*)"/)?.[1] ?? '');
  }
}

const data = JSON.stringify({ names, z: AREA_Z, noPath: NO_PATH, initial }).replace(
  /</g,
  '\\u003c',
);
const client = readFileSync(at('./map-overlay-client.js'), 'utf8');

const html = `<!doctype html>
<meta charset="utf-8">
<title>map-areas overlay</title>
<style>
  body { margin: 0; font: 13px sans-serif; background: #222; color: #eee; overflow: hidden }
  #bar { position: fixed; top: 0; left: 0; right: 0; z-index: 2; padding: 6px 10px; background: #000c; display: flex; gap: 10px; align-items: center; flex-wrap: wrap }
  #stage { position: absolute; top: 0; left: 0; width: 5000px; height: 5000px; transform-origin: 0 0 }
  #stage img, #stage svg { position: absolute; top: 0; left: 0; width: 5000px; height: 5000px }
  #map path { fill-opacity: .25; stroke-width: 3; vector-effect: non-scaling-stroke; pointer-events: all }
  #map.nofill path { fill-opacity: 0 }
  #map path.sel { fill-opacity: .5; stroke-width: 5 }
  #map path[data-z="0"] { fill: #29f; stroke: #29f }
  #map path[data-z="1"] { fill: #fa0; stroke: #fa0 }
  #map path[data-z="2"] { fill: #f3a; stroke: #f3a }
  #map path[data-z="3"] { fill: #f22; stroke: #f22 }
  #map .draft { fill: none; stroke: #0f0; stroke-width: 2; vector-effect: non-scaling-stroke }
  #map .shared { fill: none; stroke: #fff; stroke-width: 4; stroke-opacity: .85; vector-effect: non-scaling-stroke; pointer-events: none }
  #map .handle.weld { fill: #fc0 }
  #map .handle { fill: #fff; stroke: #000; stroke-width: 1.5; vector-effect: non-scaling-stroke; cursor: move }
  #map .mid { fill: #fff8; stroke: #000; stroke-width: 1; vector-effect: non-scaling-stroke; cursor: copy }
  #status { color: #8f8 }
  #count { font-weight: bold }
</style>
<div id="bar">
  <select id="slug"></select>
  <button id="draw" title="D">Draw</button>
  <button id="close" title="Enter">Close</button>
  <button id="cancel" title="Esc">Cancel</button>
  <button id="del" title="Delete">Delete path</button>
  <button id="undo" title="Ctrl+Z">Undo</button>
  <label><input type="checkbox" id="snap" checked> snap</label>
  <label title="A corner that two paths share moves for both. Alt detaches one corner."><input type="checkbox" id="weld" checked> weld</label>
  <label><input type="checkbox" id="showPic" checked> picture</label>
  <label><input type="checkbox" id="showAreas" checked> areas</label>
  <label><input type="checkbox" id="fill" checked> fill</label>
  <button id="save">Download map-areas.svg</button>
  <button id="reset">Reset to file</button>
  <span id="count"></span>
  <span id="status"></span>
  <span id="hover" style="min-width:16em"></span>
  <span id="pos"></span>
  <span>no path: ${NO_PATH.join(', ')}</span>
</div>
<div id="stage"><img id="pic" src="${SOURCE}"><svg id="map" viewBox="0 0 5000 5000"></svg></div>
<script>window.MAP = ${data};</script>
<script>
${client}
</script>
`;

writeFileSync(CACHE + 'map-overlay.html', html);
console.log(`wrote ${CACHE}map-overlay.html | paths in the file: ${Object.keys(initial).length}`);
