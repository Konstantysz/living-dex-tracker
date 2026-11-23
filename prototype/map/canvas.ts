// PROTOTYPE (throwaway). Engine C: plain Canvas 2D, own draw loop, own hit-test (isPointInPath).
import { W, SAMPLES, labelVisible, type Factory } from './data';
import { View } from './view';

export const create: Factory = async (c) => {
  const cv = document.createElement('canvas');
  cv.style.cssText = 'width:100%;height:100%;display:block';
  c.el.appendChild(cv);
  const ctx = cv.getContext('2d')!;
  const dpr = Math.min(devicePixelRatio, 3);
  const view = new View(c.el, c.init);
  const paths = new Map(
    c.areas.map((a) => {
      const p = new Path2D();
      for (let j = 0; j < a.pts.length; j += 2) {
        if (j) p.lineTo(a.pts[j], a.pts[j + 1]);
        else p.moveTo(a.pts[j], a.pts[j + 1]);
      }
      p.closePath();
      return [a.id, p] as const;
    }),
  );
  let sel: string | null = null;
  let dirty = true;
  let raf = 0;

  const world = () => {
    const k = dpr * view.scale;
    ctx.setTransform(
      k,
      0,
      0,
      k,
      dpr * (view.w / 2 - view.x * view.scale),
      dpr * (view.h / 2 - view.y * view.scale),
    );
  };
  const draw = () => {
    const pw = Math.round(view.w * dpr),
      ph = Math.round(view.h * dpr);
    if (cv.width !== pw || cv.height !== ph) {
      cv.width = pw;
      cv.height = ph;
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#0b1e2d';
    ctx.fillRect(0, 0, pw, ph);
    world();
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(c.base, 0, 0, W, W);
    for (const a of c.areas) {
      ctx.globalAlpha = a.id === sel ? 0.75 : 0.35;
      ctx.fillStyle = a.color;
      ctx.fill(paths.get(a.id)!);
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#fff';
    for (const a of c.areas) {
      ctx.lineWidth = (a.id === sel ? 3 : 1.2) / view.scale;
      ctx.stroke(paths.get(a.id)!);
    }
    const r = 4 / view.scale;
    ctx.fillStyle = '#ffd54a';
    ctx.beginPath();
    for (const [x, y] of c.markers) {
      ctx.moveTo(x + r, y);
      ctx.arc(x, y, r, 0, 6.2832);
    }
    ctx.fill();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(0,0,0,.7)';
    ctx.fillStyle = '#fff';
    for (const a of c.areas) {
      if (!labelVisible(a, view.scale)) continue;
      const p = view.toScreen(a.cx, a.cy);
      ctx.strokeText(a.id, p.x, p.y);
      ctx.fillText(a.id, p.x, p.y);
    }
  };
  const loop = () => {
    if (dirty) {
      dirty = false;
      draw();
    }
    raf = requestAnimationFrame(loop);
  };
  loop();
  view.onChange = () => {
    dirty = true;
  };
  view.onTap = (sx, sy) => {
    const t = performance.now();
    world();
    let best: { id: string; z: number } | null = null;
    for (const [dx, dy] of SAMPLES)
      for (let i = c.areas.length - 1; i >= 0; i--) {
        const a = c.areas[i];
        if (ctx.isPointInPath(paths.get(a.id)!, (sx + dx) * dpr, (sy + dy) * dpr)) {
          if (!best || a.z > best.z) best = a;
          break;
        }
      }
    c.onPick(best?.id ?? null, performance.now() - t);
  };

  return {
    setView: (v) => view.set(v),
    getView: () => ({ x: view.x, y: view.y, scale: view.scale }),
    setSelected: (id) => {
      sel = id;
      dirty = true;
    },
    destroy: () => {
      cancelAnimationFrame(raf);
      view.destroy();
      cv.remove();
    },
  };
};
