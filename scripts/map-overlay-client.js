// Browser code of the map overlay. `scripts/map-overlay.ts` inlines it into the page.
// It shows the source picture and the Area paths, and it has a draw mode for `map-areas.svg` (#15).
// The paths live in localStorage (key `map-areas-draft`) until you download the file.
const MAP = window.MAP; // { names, z, noPath, initial } from map-overlay.ts
const KEY = 'map-areas-draft';
const NS = 'http://www.w3.org/2000/svg';
const $ = (id) => document.getElementById(id);
const slugs = Object.keys(MAP.z);

let paths = loadDraft();
let selected = firstMissing(-1) ?? slugs[0];
let drawing = null; // points of the polygon that is being drawn
const history = [];
let k = 1;
let tx = 0;
let ty = 50;
let pan = null;
let dragVertex = null;

function loadDraft() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // no storage: start from the file
  }
  return structuredClone(MAP.initial);
}
function saveDraft() {
  try {
    localStorage.setItem(KEY, JSON.stringify(paths));
  } catch {
    // no storage: the download still works
  }
}
function firstMissing(after) {
  const i = slugs.findIndex((s, n) => n > after && !paths[s]);
  return i >= 0 ? slugs[i] : slugs.find((s) => !paths[s]);
}
const remember = () => history.push(JSON.stringify(paths));
const toD = (pts) => 'M' + pts.map((p) => p[0] + ' ' + p[1]).join('L') + 'Z';
const el = (name, attrs, parent) => {
  const e = document.createElementNS(NS, name);
  for (const [a, v] of Object.entries(attrs)) e.setAttribute(a, v);
  parent.appendChild(e);
  return e;
};

// --- view
const stage = $('stage');
const svg = $('map');
const areasLayer = el('g', {}, svg);
const editLayer = el('g', {}, svg);
function apply() {
  stage.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + k + ')';
  renderEdit();
}
k = Math.min(innerWidth, innerHeight - 50) / 5000;
addEventListener(
  'wheel',
  (e) => {
    e.preventDefault();
    const f = e.deltaY < 0 ? 1.2 : 1 / 1.2;
    tx = e.clientX - (e.clientX - tx) * f;
    ty = e.clientY - (e.clientY - ty) * f;
    k *= f;
    apply();
  },
  { passive: false },
);
const toGame = (e) => [(e.clientX - tx) / k, (e.clientY - ty) / k];

// --- render
function renderAreas() {
  areasLayer.replaceChildren();
  for (const s of [...slugs].sort((a, b) => MAP.z[a] - MAP.z[b])) {
    if (!paths[s]) continue;
    el(
      'path',
      { id: s, 'data-z': MAP.z[s], d: toD(paths[s]), class: s === selected ? 'sel' : '' },
      areasLayer,
    );
  }
  const select = $('slug');
  select.replaceChildren();
  for (const s of slugs) {
    const o = document.createElement('option');
    o.value = s;
    o.textContent = (paths[s] ? '✓ ' : '· ') + s + ' — ' + MAP.names[s] + ' (z' + MAP.z[s] + ')';
    select.appendChild(o);
  }
  select.value = selected;
  $('count').textContent = 'drawn ' + slugs.filter((s) => paths[s]).length + '/' + slugs.length;
  $('status').textContent = drawing
    ? 'drawing ' +
      selected +
      ': ' +
      drawing.length +
      ' points. Click the first point or press Enter to close.'
    : '';
}
function renderEdit() {
  editLayer.replaceChildren();
  const r = 6 / k;
  if (drawing) {
    if (drawing.length) {
      el(
        'polyline',
        { points: drawing.map((p) => p.join(',')).join(' '), class: 'draft' },
        editLayer,
      );
    }
    drawing.forEach((p, i) =>
      el('circle', { cx: p[0], cy: p[1], r: i ? r : r * 1.6, class: 'handle' }, editLayer),
    );
    return;
  }
  const pts = paths[selected];
  if (!pts) return;
  pts.forEach((p, i) => {
    const q = pts[(i + 1) % pts.length];
    const m = el(
      'circle',
      { cx: (p[0] + q[0]) / 2, cy: (p[1] + q[1]) / 2, r: r * 0.65, class: 'mid' },
      editLayer,
    );
    m.dataset.m = i;
  });
  pts.forEach((p, i) => {
    const h = el('circle', { cx: p[0], cy: p[1], r, class: 'handle' }, editLayer);
    h.dataset.v = i;
  });
}
const render = () => {
  renderAreas();
  renderEdit();
};

// --- snapping: a click near a vertex of any path reuses it, so shared borders have no gap
function snapPoint(p, skip) {
  let best = null;
  let bestD = 10 / k;
  if ($('snap').checked) {
    const all = [...Object.entries(paths), ['__draft', drawing ?? []]];
    for (const [s, pts] of all) {
      pts.forEach((q, i) => {
        if (skip && skip.s === s && skip.i === i) return;
        const d = Math.hypot(q[0] - p[0], q[1] - p[1]);
        if (d < bestD) {
          bestD = d;
          best = q;
        }
      });
    }
  }
  const clamp = (v) => Math.max(0, Math.min(5000, Math.round(v)));
  return best ? [best[0], best[1]] : [clamp(p[0]), clamp(p[1])];
}

// --- draw
function startDraw() {
  if (MAP.noPath.includes(selected)) return;
  if (paths[selected] && !confirm('Replace the path of ' + selected + '?')) return;
  drawing = [];
  render();
}
function finishDraw() {
  if (!drawing || drawing.length < 3) return;
  remember();
  paths[selected] = drawing;
  drawing = null;
  saveDraft();
  selected = firstMissing(slugs.indexOf(selected)) ?? selected;
  render();
}
function cancelDraw() {
  drawing = null;
  render();
}
function undo() {
  if (drawing?.length) drawing.pop();
  else if (history.length) paths = JSON.parse(history.pop());
  else return;
  saveDraft();
  render();
}
function deletePath() {
  if (!paths[selected]) return;
  remember();
  delete paths[selected];
  saveDraft();
  render();
}

// --- pointer: a drag pans, a click adds a vertex or selects an Area, a handle drag moves a vertex
addEventListener('pointerdown', (e) => {
  if (e.target.closest('#bar') || e.button !== 0) return;
  const v = e.target.dataset?.v;
  const m = e.target.dataset?.m;
  if (v !== undefined && !drawing) {
    remember();
    dragVertex = Number(v);
    return;
  }
  if (m !== undefined && !drawing) {
    remember();
    dragVertex = Number(m) + 1;
    paths[selected].splice(dragVertex, 0, snapPoint(toGame(e)));
    render();
    return;
  }
  pan = { x: e.clientX - tx, y: e.clientY - ty, sx: e.clientX, sy: e.clientY, moved: false };
});
addEventListener('pointermove', (e) => {
  const [x, y] = toGame(e);
  $('pos').textContent = Math.round(x) + ', ' + Math.round(y);
  const p = e.target.closest?.('path[id]');
  $('hover').textContent = p ? p.id + ' (' + MAP.names[p.id] + ', z' + p.dataset.z + ')' : '';
  if (dragVertex !== null) {
    paths[selected][dragVertex] = snapPoint([x, y], { s: selected, i: dragVertex });
    renderAreas();
    renderEdit();
  } else if (pan) {
    if (Math.hypot(e.clientX - pan.sx, e.clientY - pan.sy) > 4) pan.moved = true;
    if (pan.moved) {
      tx = e.clientX - pan.x;
      ty = e.clientY - pan.y;
      apply();
    }
  }
});
addEventListener('pointerup', (e) => {
  if (dragVertex !== null) {
    dragVertex = null;
    saveDraft();
    render();
  } else if (pan && !pan.moved) {
    click(e);
  }
  pan = null;
});
function click(e) {
  if (drawing) {
    const pt = snapPoint(toGame(e));
    const first = drawing[0];
    if (first && drawing.length >= 3 && Math.hypot(first[0] - pt[0], first[1] - pt[1]) < 10 / k) {
      finishDraw();
      return;
    }
    drawing.push(pt);
    render();
    return;
  }
  const p = e.target.closest?.('path[id]');
  if (p) {
    selected = p.id;
    render();
  }
}
// a right click on a vertex deletes it (a path keeps at least 3)
addEventListener('contextmenu', (e) => {
  const v = e.target.dataset?.v;
  if (v === undefined) return;
  e.preventDefault();
  if (paths[selected].length <= 3) return;
  remember();
  paths[selected].splice(Number(v), 1);
  saveDraft();
  render();
});

// --- bar
$('slug').onchange = (e) => {
  selected = e.target.value;
  drawing = null;
  render();
  e.target.blur();
};
$('draw').onclick = startDraw;
$('close').onclick = finishDraw;
$('cancel').onclick = cancelDraw;
$('del').onclick = deletePath;
$('undo').onclick = undo;
$('showPic').onchange = (e) => ($('pic').style.display = e.target.checked ? '' : 'none');
$('showAreas').onchange = (e) => (svg.style.display = e.target.checked ? '' : 'none');
$('fill').onchange = (e) => svg.classList.toggle('nofill', !e.target.checked);
$('reset').onclick = () => {
  if (!confirm('Throw away the draft and load the paths of the file?')) return;
  paths = structuredClone(MAP.initial);
  history.length = 0;
  drawing = null;
  saveDraft();
  render();
};
$('save').onclick = () => {
  const order = slugs
    .filter((s) => paths[s])
    .sort((a, b) => MAP.z[a] - MAP.z[b] || (a < b ? -1 : 1));
  const text =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5000 5000">\n' +
    order
      .map((s) => '  <path id="' + s + '" data-z="' + MAP.z[s] + '" d="' + toD(paths[s]) + '"/>')
      .join('\n') +
    '\n</svg>\n';
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'image/svg+xml' }));
  a.download = 'map-areas.svg';
  a.click();
};
addEventListener('keydown', (e) => {
  if (['INPUT', 'SELECT'].includes(e.target.tagName)) return;
  if (e.key === 'Enter') finishDraw();
  else if (e.key === 'Escape') cancelDraw();
  else if ((e.key === 'Backspace' && drawing) || (e.key === 'z' && (e.ctrlKey || e.metaKey)))
    undo();
  else if (e.key === 'Delete') deletePath();
  else if (e.key === 'd') startDraw();
  else return;
  e.preventDefault();
});

apply();
render();
