// PROTOTYPE (throwaway). Engine B: PixiJS v8 (WebGL). Native hit-test via the event system.
import { Application, Container, Graphics, Sprite, Text, Texture } from 'pixi.js';
import { W, SAMPLES, labelVisible, type Factory } from './data';
import { View } from './view';

const hex = (css: string) => {
  const e = document.createElement('canvas').getContext('2d')!;
  e.fillStyle = css;
  return parseInt(e.fillStyle.slice(1), 16);
};

export const create: Factory = async (c) => {
  const app = new Application();
  await app.init({
    resizeTo: c.el,
    background: '#0b1e2d',
    antialias: true,
    autoDensity: true,
    resolution: Math.min(devicePixelRatio, 3),
  });
  c.el.appendChild(app.canvas);
  app.stage.eventMode = 'static';
  const view = new View(c.el, c.init);

  const world = new Container();
  app.stage.addChild(world);
  const tex = Texture.from(c.base);
  tex.source.autoGenerateMipmaps = true;
  tex.source.scaleMode = 'linear';
  const base = new Sprite(tex);
  base.width = base.height = W;
  world.addChild(base);

  const fills = new Map<string, Graphics>();
  const fillLayer = new Container();
  const lineLayer = new Container();
  lineLayer.eventMode = 'none';
  world.addChild(fillLayer, lineLayer);
  for (const a of c.areas) {
    const g = new Graphics().poly(a.pts).fill(0xffffff);
    g.tint = hex(a.color);
    g.alpha = 0.35;
    g.eventMode = 'static';
    g.label = a.id;
    fillLayer.addChild(g);
    fills.set(a.id, g);
    lineLayer.addChild(
      new Graphics().poly(a.pts, true).stroke({ width: 1, color: 0xffffff, pixelLine: true }),
    );
  }
  // markers and labels live in screen space (constant size), repositioned on each update
  const dot = app.renderer.generateTexture(new Graphics().circle(0, 0, 4).fill(0xffd54a));
  const markers = c.markers.map(() => {
    const s = new Sprite(dot);
    s.anchor.set(0.5);
    app.stage.addChild(s);
    return s;
  });
  const labels = c.areas.map((a) => {
    const t = new Text({
      text: a.id,
      style: { fontSize: 12, fill: 0xffffff, stroke: { color: 0x000000, width: 3 } },
      resolution: Math.min(devicePixelRatio, 3),
    });
    t.anchor.set(0.5);
    app.stage.addChild(t);
    return t;
  });

  const update = () => {
    world.position.set(view.w / 2 - view.x * view.scale, view.h / 2 - view.y * view.scale);
    world.scale.set(view.scale);
    c.markers.forEach(([x, y], i) => {
      const p = view.toScreen(x, y);
      markers[i].position.set(p.x, p.y);
    });
    c.areas.forEach((a, i) => {
      const t = labels[i];
      t.visible = labelVisible(a, view.scale);
      if (t.visible) {
        const p = view.toScreen(a.cx, a.cy);
        t.position.set(p.x, p.y);
      }
    });
  };
  view.onChange = update;
  update();

  const zOf = new Map(c.areas.map((a) => [a.id, a.z]));
  view.onTap = (sx, sy) => {
    const t = performance.now();
    let best: string | null = null;
    for (const [dx, dy] of SAMPLES) {
      const hit = app.renderer.events.rootBoundary.hitTest(sx + dx, sy + dy);
      const id = hit?.label;
      if (id && zOf.has(id) && (best === null || zOf.get(id)! > zOf.get(best)!)) best = id;
    }
    c.onPick(best, performance.now() - t);
  };

  return {
    setView: (v) => view.set(v),
    getView: () => ({ x: view.x, y: view.y, scale: view.scale }),
    setSelected: (id) =>
      fills.forEach((g, k) => {
        g.alpha = k === id ? 0.75 : 0.35;
      }),
    destroy: () => {
      view.destroy();
      app.destroy(true, { children: true, texture: true });
    },
  };
};
