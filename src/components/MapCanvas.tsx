import { Application, Assets, Container, Graphics, Sprite, Text, Texture } from 'pixi.js';
import { useEffect, useRef } from 'react';
import s from './MapCanvas.module.css';
import {
  bounds,
  hitTest,
  ringArea,
  tileRect,
  tilesInView,
  type AreaShape,
  type BaseLod,
  type FineTile,
} from '../core/areaMap';

const SIZE = 5000;
/** At most this many fine tiles stay in memory. A view over more tiles shows the base only. */
const MAX_FINE = 4;
/** Texture px per game unit of a fine tile. One tile is about 11 MB of GPU memory. */
const FINE_RES = 1;
/** Highest zoom, in screen px per game unit. */
const ZOOM_MAX = 1.5;
/** The map may zoom out to this part of the fit scale. */
const ZOOM_OUT_SLACK = 0.9;
/** Zoom step of the buttons, and zoom per wheel delta. */
const BUTTON_STEP = 1.5;
const WHEEL_SPEED = 0.0015;
/** A pointer that moves less than this many px between down and up is a tap. */
const TAP_SLOP = 6;
/** Hide a label when the larger side of its Area is this many screen px or fewer. */
const LABEL_MIN_PX = 50;

/**
 * Draws one fine tile to a texture. The file has a 5000-unit viewBox but paints only inside its
 * own square, so the viewBox is cut to that square. A full-size texture would be 100 MB.
 */
async function rasterTile(tile: FineTile): Promise<Texture> {
  const { x, y, size } = tileRect(tile);
  const px = Math.round(size * FINE_RES);
  const text = await (await fetch(tile.url)).text();
  const svg = text.replace(
    'viewBox="0 0 5000 5000"',
    `viewBox="${x} ${y} ${size} ${size}" width="${px}" height="${px}"`,
  );
  if (svg === text) throw new Error(`tile ${tile.url} has no 5000-unit viewBox`);
  const href = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  try {
    const img = new Image();
    img.src = href;
    await img.decode();
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = px;
    canvas.getContext('2d')!.drawImage(img, 0, 0, px, px);
    return Texture.from(canvas);
  } finally {
    URL.revokeObjectURL(href);
  }
}

export interface MapPin {
  id: string;
  x: number;
  y: number;
  color: string;
  label: string;
  collected: boolean;
}

export interface MapCanvasProps {
  shapes: AreaShape[];
  names: Record<string, string>;
  base: BaseLod[];
  tiles: FineTile[];
  /** Slugs that light up. */
  highlighted: Set<string>;
  selected?: string;
  /** Tap on an Area, or on nothing (undefined). */
  onSelect: (slug: string | undefined) => void;
  pins?: MapPin[];
  selectedPin?: string;
  onSelectPin?: (id: string | undefined) => void;
  focusPin?: { id: string; seq: number };
}

interface Handle {
  zoomBy: (f: number) => void;
  focusAt: (x: number, y: number) => void;
  redraw: () => void;
}

/**
 * PixiJS map (ADR 0004). One `world` container is the camera: x, y, scale. Labels live outside it
 * in screen space. Pan, wheel and pinch are written here. A tap goes to `hitTest`.
 * Base LODs 8, 4 and 2 show by zoom. Fine tiles lie above them and load only when the view
 * touches at most `MAX_FINE` tiles.
 */
export function MapCanvas(props: MapCanvasProps) {
  const host = useRef<HTMLDivElement>(null);
  const latest = useRef(props);
  const handle = useRef<Handle>(null);
  // Pointer handlers read the newest props through this ref.
  useEffect(() => {
    latest.current = props;
  });

  useEffect(() => {
    const el = host.current!;
    const app = new Application();
    let dead = false;
    let cleanup = () => {};
    void app
      .init({
        resizeTo: el,
        background: '#9fc5e8',
        antialias: true,
        autoDensity: true,
        resolution: window.devicePixelRatio || 1,
      })
      .then(() => {
        if (dead) return app.destroy(true);
        el.appendChild(app.canvas);
        app.canvas.style.touchAction = 'none';
        const world = new Container();
        const baseLayer = new Container();
        const fineLayer = new Container();
        const areaLayer = new Container();
        const selectedLayer = new Graphics();
        const labelLayer = new Container();
        const pinLayer = new Container();
        world.addChild(baseLayer, fineLayer, areaLayer, selectedLayer);
        app.stage.addChild(world, labelLayer, pinLayer);

        const fitScale = () => Math.min(app.screen.width, app.screen.height) / SIZE;
        const cam = { x: 0, y: 0, s: fitScale() };
        cam.x = (app.screen.width - SIZE * cam.s) / 2;
        cam.y = (app.screen.height - SIZE * cam.s) / 2;

        // Base art: each LOD loads when first needed and shows from its `minScale`.
        const sprites = new Map<string, Sprite>();
        const loading = new Set<string>();
        const syncBase = () => {
          // A finer LOD that is loaded and in range hides the coarser ones under it.
          const lods = [...latest.current.base].sort((a, b) => b.minScale - a.minScale);
          const top = lods.find((l) => cam.s >= l.minScale && sprites.has(l.url));
          for (const lod of lods) {
            const sp = sprites.get(lod.url);
            if (sp) sp.visible = lod === top;
            else if (cam.s >= lod.minScale && !loading.has(lod.url)) {
              loading.add(lod.url);
              void Assets.load({ src: lod.url, data: { resolution: lod.res } })
                .then((tex) => {
                  if (dead) return;
                  const sprite = new Sprite(tex);
                  sprite.width = sprite.height = SIZE;
                  sprites.set(lod.url, sprite);
                  baseLayer.addChild(sprite);
                  syncBase();
                })
                .catch(() => loading.delete(lod.url));
            }
          }
        };

        // Fine tiles: load the tiles in view, drop the oldest one that is out of view past the cap.
        // A tile that failed to load stays in `started`, so it does not retry on every pan.
        const fine = new Map<string, Sprite>();
        const started = new Set<string>();
        const syncFine = () => {
          const view = {
            x0: -cam.x / cam.s,
            y0: -cam.y / cam.s,
            x1: (app.screen.width - cam.x) / cam.s,
            y1: (app.screen.height - cam.y) / cam.s,
          };
          const near = tilesInView(latest.current.tiles, view);
          const show = near.length <= MAX_FINE ? near : [];
          const showing = new Set(show.map((t) => t.url));
          for (const [url, sp] of fine) sp.visible = showing.has(url);
          for (const tile of show) {
            if (started.has(tile.url)) continue;
            started.add(tile.url);
            rasterTile(tile)
              .then((tex) => {
                if (dead) return tex.destroy(true);
                const r = tileRect(tile);
                const sp = new Sprite(tex);
                sp.position.set(r.x, r.y);
                sp.width = sp.height = r.size;
                fine.set(tile.url, sp);
                fineLayer.addChild(sp);
                for (const [url, old] of fine) {
                  if (fine.size <= MAX_FINE) break;
                  if (showing.has(url)) continue;
                  old.destroy({ texture: true, textureSource: true });
                  fine.delete(url);
                  started.delete(url);
                }
                syncFine();
              })
              .catch(() => {});
          }
        };

        const labels = new Map<string, { t: Text; cx: number; cy: number; size: number }>();
        const draw = () => {
          const { shapes, highlighted, names } = latest.current;
          areaLayer.removeChildren().forEach((c) => c.destroy());
          for (const sh of [...shapes].sort((a, b) => a.z - b.z)) {
            const g = new Graphics();
            const outer = Math.sign(ringArea(sh.rings[0]!));
            sh.rings.forEach((r) => {
              const pts = r.flat();
              if (Math.sign(ringArea(r)) === outer)
                g.poly(pts).fill({
                  color: highlighted.has(sh.slug) ? 0xffd400 : 0xffffff,
                  alpha: highlighted.has(sh.slug) ? 0.55 : 0.08,
                });
              else g.poly(pts).cut();
            });
            // pixelLine: a 1 px line at every zoom, so no redraw on zoom.
            const line = { pixelLine: true, color: 0x37474f, alpha: 0.5 };
            sh.rings.forEach((r) => g.poly(r.flat()).stroke(line));
            areaLayer.addChild(g);
          }
          // Labels: one `Text` per Area, in screen space.
          labelLayer.removeChildren().forEach((c) => c.destroy());
          labels.clear();
          for (const sh of shapes) {
            const { x0, x1, y0, y1 } = bounds(sh.rings);
            const t = new Text({
              text: names[sh.slug] ?? sh.slug,
              style: { fontSize: 11, fill: 0x102027, stroke: { color: 0xffffff, width: 3 } },
            });
            t.anchor.set(0.5);
            labelLayer.addChild(t);
            labels.set(sh.slug, {
              t,
              cx: (x0 + x1) / 2,
              cy: (y0 + y1) / 2,
              size: Math.max(x1 - x0, y1 - y0),
            });
          }
        };

        const apply = () => {
          world.position.set(cam.x, cam.y);
          world.scale.set(cam.s);
          // The selected outline is one Area: redrawing it keeps its width at 3 screen px.
          selectedLayer.clear();
          const sel = latest.current.shapes.find((x) => x.slug === latest.current.selected);
          sel?.rings.forEach((r) =>
            selectedLayer.poly(r.flat()).stroke({ width: 3 / cam.s, color: 0xc62828 }),
          );
          for (const { t, cx, cy, size } of labels.values()) {
            t.visible = size * cam.s > LABEL_MIN_PX;
            t.position.set(cam.x + cx * cam.s, cam.y + cy * cam.s);
          }
          pinLayer.removeChildren().forEach((c) => c.destroy({ children: true }));
          for (const pin of latest.current.pins ?? []) {
            const c = new Container();
            c.position.set(cam.x + pin.x * cam.s, cam.y + pin.y * cam.s);
            c.alpha = pin.collected ? 0.45 : 1;
            const isSel = pin.id === latest.current.selectedPin;
            const g = new Graphics();
            const color = Number.parseInt(pin.color.replace('#', ''), 16);
            g.circle(0, 0, isSel ? 11 : 9)
              .fill({ color })
              .stroke({ width: isSel ? 3 : 2, color: isSel ? 0xfacc15 : 0xffffff });
            const t = new Text({
              text: pin.label,
              style: { fontSize: 10, fontWeight: 'bold', fill: 0xffffff },
            });
            t.anchor.set(0.5);
            c.addChild(g, t);
            pinLayer.addChild(c);
          }
          syncBase();
          syncFine();
        };

        const zoomAt = (f: number, sx: number, sy: number) => {
          const next = Math.min(Math.max(cam.s * f, fitScale() * ZOOM_OUT_SLACK), ZOOM_MAX);
          const k = next / cam.s;
          cam.x = sx - (sx - cam.x) * k;
          cam.y = sy - (sy - cam.y) * k;
          cam.s = next;
          apply();
        };

        // Pointers: one finger pans, two pinch. A short move is a tap.
        const pointers = new Map<number, { x: number; y: number }>();
        let moved = 0;
        let pinch = 0;
        const canvas = app.canvas;
        const point = (e: MouseEvent) => {
          const r = canvas.getBoundingClientRect();
          return { x: e.clientX - r.left, y: e.clientY - r.top };
        };
        canvas.addEventListener('pointerdown', (e) => {
          canvas.setPointerCapture(e.pointerId);
          pointers.set(e.pointerId, point(e));
          if (pointers.size === 1) moved = 0;
          pinch = 0;
        });
        canvas.addEventListener('pointermove', (e) => {
          const prev = pointers.get(e.pointerId);
          if (!prev) return;
          const p = point(e);
          pointers.set(e.pointerId, p);
          const pts = [...pointers.values()];
          if (pts.length === 1) {
            moved += Math.abs(p.x - prev.x) + Math.abs(p.y - prev.y);
            cam.x += p.x - prev.x;
            cam.y += p.y - prev.y;
            apply();
          } else if (pts.length === 2) {
            moved = Infinity;
            const dist = Math.hypot(pts[0]!.x - pts[1]!.x, pts[0]!.y - pts[1]!.y);
            if (pinch)
              zoomAt(dist / pinch, (pts[0]!.x + pts[1]!.x) / 2, (pts[0]!.y + pts[1]!.y) / 2);
            pinch = dist;
          }
        });
        const onPointerUp = (e: PointerEvent) => {
          const had = pointers.delete(e.pointerId);
          pinch = 0;
          if (had && e.type === 'pointerup' && moved < TAP_SLOP && pointers.size === 0) {
            const p = point(e);
            if (import.meta.env.DEV && e.altKey) {
              const wx = Math.round((p.x - cam.x) / cam.s);
              const wy = Math.round((p.y - cam.y) / cam.s);
              const coord = `[${wx}, ${wy}]`;
              console.log('Map coord:', coord);
              void navigator.clipboard?.writeText(coord);
              return;
            }
            const hitPin = (latest.current.pins ?? []).find(
              (pin) => Math.hypot(cam.x + pin.x * cam.s - p.x, cam.y + pin.y * cam.s - p.y) <= 14,
            );
            if (hitPin) {
              latest.current.onSelectPin?.(hitPin.id);
              return;
            }
            latest.current.onSelectPin?.(undefined);
            const slug = hitTest(
              latest.current.shapes,
              (p.x - cam.x) / cam.s,
              (p.y - cam.y) / cam.s,
              cam.s,
            );
            latest.current.onSelect(slug);
          }
        };
        canvas.addEventListener('pointerup', onPointerUp);
        canvas.addEventListener('pointercancel', onPointerUp);
        canvas.addEventListener(
          'wheel',
          (e) => {
            e.preventDefault();
            const p = point(e);
            zoomAt(Math.exp(-e.deltaY * WHEEL_SPEED), p.x, p.y);
          },
          { passive: false },
        );

        handle.current = {
          zoomBy: (f) => zoomAt(f, app.screen.width / 2, app.screen.height / 2),
          focusAt: (x, y) => {
            cam.s = Math.max(cam.s, fitScale() * 2.5);
            cam.x = app.screen.width / 2 - x * cam.s;
            cam.y = app.screen.height / 2 - y * cam.s;
            apply();
            syncBase();
            syncFine();
          },
          redraw: () => {
            draw();
            apply();
          },
        };
        app.renderer.on('resize', () => apply());
        draw();
        apply();
        cleanup = () => {
          handle.current = null;
        };
      });
    return () => {
      dead = true;
      cleanup();
      if (app.renderer) app.destroy(true, { children: true });
    };
  }, []);

  // Redraw the Areas when the highlight, selection, or pins change.
  useEffect(() => {
    handle.current?.redraw();
  }, [props.highlighted, props.selected, props.shapes, props.names, props.pins, props.selectedPin]);

  useEffect(() => {
    if (!props.focusPin) return;
    const pin = props.pins?.find((p) => p.id === props.focusPin?.id);
    if (pin) handle.current?.focusAt(pin.x, pin.y);
  }, [props.focusPin]);

  return (
    <div className={s.wrap}>
      <div ref={host} className={s.canvas} />
      <div className={s.zoom}>
        <button aria-label="Przybliż" onClick={() => handle.current?.zoomBy(BUTTON_STEP)}>
          +
        </button>
        <button aria-label="Oddal" onClick={() => handle.current?.zoomBy(1 / BUTTON_STEP)}>
          −
        </button>
      </div>
    </div>
  );
}
