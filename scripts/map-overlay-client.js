// Browser code of the map overlay. `scripts/map-overlay.ts` inlines it into the page.
// It shows the source picture and the Area paths, and it has a draw mode for `map-areas.svg` (#15).
// A path is a list of rings, a ring is a list of [x, y] corners. Sea and land Areas (z 0 and 1)
// are welded: a corner that two paths share is one corner. The draft lives in localStorage
// (key `map-areas-draft-2`) until you download the file.
const MAP = window.MAP; // { names, z, noPath, initial } from map-overlay.ts
const KEY = 'map-areas-draft-2';
const NS = 'http://www.w3.org/2000/svg';
const $ = (id) => document.getElementById(id);
const slugs = Object.keys(MAP.z);
const weldable = (s) => MAP.z[s] <= 1;
const ptKey = (p) => p[0] + ',' + p[1];

let paths = loadDraft();
let selected = firstMissing(-1) ?? slugs[0];
let drawing = null; // corners of the ring that is being drawn
const history = [];
let k = 1;
let tx = 0;
let ty = 50;
let pan = null;
let drag = null; // { refs: [{ s, r, i }] }: the corners that move together

function validDraft(d) {
  const ok = (p) => Array.isArray(p) && p.length === 2 && p.every(Number.isFinite);
  return (
    d &&
    typeof d === 'object' &&
    Object.values(d).every(
      (rings) => Array.isArray(rings) && rings.every((r) => Array.isArray(r) && r.every(ok)),
    )
  );
}
function loadDraft() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) {
      const d = JSON.parse(saved);
      if (validDraft(d)) return d;
    }
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
const toD = (rings) =>
  rings.map((r) => 'M' + r.map((p) => p[0] + ' ' + p[1]).join('L') + 'Z').join('');
const el = (name, attrs, parent) => {
  const e = document.createElementNS(NS, name);
  for (const [a, v] of Object.entries(attrs)) e.setAttribute(a, v);
  parent.appendChild(e);
  return e;
};
const weldOn = () => $('weld').checked;

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

// --- welding: corners with equal coordinates in sea and land paths are one corner
// refsAt: every corner of a weldable path at the point `pt`
function refsAt(pt) {
  const out = [];
  for (const s of slugs) {
    if (!weldable(s) || !paths[s]) continue;
    paths[s].forEach((ring, r) =>
      ring.forEach((q, i) => {
        if (q[0] === pt[0] && q[1] === pt[1]) out.push({ s, r, i });
      }),
    );
  }
  return out;
}
// the corners that move together with the corner (s, r, i)
function groupOf(s, r, i) {
  const pt = paths[s][r][i];
  if (!weldOn() || !weldable(s)) return [{ s, r, i }];
  const refs = refsAt(pt);
  return refs.length ? refs : [{ s, r, i }];
}
// sharing: how many weldable paths use each corner, and each edge
function sharing() {
  const corners = new Map();
  const edges = new Map();
  for (const s of slugs) {
    if (!weldable(s) || !paths[s]) continue;
    for (const ring of paths[s]) {
      ring.forEach((p, i) => {
        const q = ring[(i + 1) % ring.length];
        for (const [m, key] of [
          [corners, ptKey(p)],
          [edges, [ptKey(p), ptKey(q)].sort().join('|')],
        ]) {
          if (!m.has(key)) m.set(key, new Set());
          m.get(key).add(s);
        }
      });
    }
  }
  return { corners, edges };
}

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
  const { edges } = sharing();
  const shared = [...edges]
    .filter(([, set]) => set.size > 1)
    .map(([key]) => key.split('|').map((c) => c.split(',')));
  if (shared.length) {
    el(
      'path',
      {
        d: shared.map(([a, b]) => 'M' + a.join(' ') + 'L' + b.join(' ')).join(''),
        class: 'shared',
      },
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
  $('count').textContent =
    'drawn ' +
    slugs.filter((s) => paths[s]).length +
    '/' +
    slugs.length +
    ', shared edges ' +
    shared.length;
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
  const rings = paths[selected];
  if (!rings) return;
  const { corners } = sharing();
  rings.forEach((pts, ri) => {
    pts.forEach((p, i) => {
      const q = pts[(i + 1) % pts.length];
      const m = el(
        'circle',
        { cx: (p[0] + q[0]) / 2, cy: (p[1] + q[1]) / 2, r: r * 0.65, class: 'mid' },
        editLayer,
      );
      m.dataset.m = i;
      m.dataset.r = ri;
    });
  });
  rings.forEach((pts, ri) => {
    pts.forEach((p, i) => {
      const welded = weldable(selected) && corners.get(ptKey(p))?.size > 1;
      const h = el(
        'circle',
        { cx: p[0], cy: p[1], r, class: welded ? 'handle weld' : 'handle' },
        editLayer,
      );
      h.dataset.v = i;
      h.dataset.r = ri;
    });
  });
}
const render = () => {
  renderAreas();
  renderEdit();
};

// --- snapping: a click near a corner of any path reuses it, so shared borders have no gap
// `skip` is a Set of "slug:ring:index" that the point must not snap to (the corners that move)
function snapPoint(p, skip) {
  let best = null;
  let bestD = 10 / k;
  if ($('snap').checked) {
    for (const [s, rings] of Object.entries(paths)) {
      rings.forEach((pts, r) =>
        pts.forEach((q, i) => {
          if (skip?.has(s + ':' + r + ':' + i)) return;
          const d = Math.hypot(q[0] - p[0], q[1] - p[1]);
          if (d < bestD) {
            bestD = d;
            best = q;
          }
        }),
      );
    }
    for (const q of drawing ?? []) {
      const d = Math.hypot(q[0] - p[0], q[1] - p[1]);
      if (d < bestD) {
        bestD = d;
        best = q;
      }
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
  paths[selected] = [drawing];
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

// --- pointer: a drag pans, a click adds a corner or selects an Area, a corner drag moves the corner
// (and every welded corner with it). Alt detaches one corner from its neighbours for that drag.
addEventListener('pointerdown', (e) => {
  if (e.target.closest('#bar') || e.button !== 0) return;
  const v = e.target.dataset?.v;
  const m = e.target.dataset?.m;
  if (!drawing && v !== undefined) {
    remember();
    const r = Number(e.target.dataset.r);
    const refs = e.altKey ? [{ s: selected, r, i: Number(v) }] : groupOf(selected, r, Number(v));
    drag = { refs };
    return;
  }
  if (!drawing && m !== undefined) {
    remember();
    const r = Number(e.target.dataset.r);
    const i = Number(m);
    const ring = paths[selected][r];
    const a = ring[i];
    const b = ring[(i + 1) % ring.length];
    const refs = [{ s: selected, r, i: i + 1 }];
    // an edge that a neighbour shares gets the new corner in the neighbour as well
    if (!e.altKey && weldOn() && weldable(selected)) {
      for (const s of slugs) {
        if (s === selected || !weldable(s) || !paths[s]) continue;
        paths[s].forEach((pts, r2) => {
          for (let j = 0; j < pts.length; j++) {
            const c = pts[j];
            const d = pts[(j + 1) % pts.length];
            if (
              (ptKey(c) === ptKey(a) && ptKey(d) === ptKey(b)) ||
              (ptKey(c) === ptKey(b) && ptKey(d) === ptKey(a))
            ) {
              refs.push({ s, r: r2, i: j + 1 });
              return;
            }
          }
        });
      }
    }
    const np = snapPoint(toGame(e));
    for (const ref of refs) paths[ref.s][ref.r].splice(ref.i, 0, np.slice());
    drag = { refs };
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
  if (drag) {
    const skip = new Set(drag.refs.map((q) => q.s + ':' + q.r + ':' + q.i));
    const np = snapPoint([x, y], skip);
    for (const q of drag.refs) paths[q.s][q.r][q.i] = np.slice();
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
  if (drag) {
    drag = null;
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
// a right click on a corner deletes it, and the welded corners with it (a ring keeps 3 corners)
addEventListener('contextmenu', (e) => {
  const v = e.target.dataset?.v;
  if (v === undefined) return;
  e.preventDefault();
  const refs = e.altKey
    ? [{ s: selected, r: Number(e.target.dataset.r), i: Number(v) }]
    : groupOf(selected, Number(e.target.dataset.r), Number(v));
  const removed = new Map();
  for (const q of refs) removed.set(q.s + ':' + q.r, (removed.get(q.s + ':' + q.r) ?? 0) + 1);
  if (refs.some((q) => paths[q.s][q.r].length - removed.get(q.s + ':' + q.r) < 3)) return;
  remember();
  for (const q of [...refs].sort((a, b) => b.i - a.i)) paths[q.s][q.r].splice(q.i, 1);
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
$('weld').onchange = render;
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
