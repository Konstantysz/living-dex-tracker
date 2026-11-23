// PROTOTYPE (throwaway). Pan/zoom/pinch/tap controller. MapLibre brings this for free; Pixi and Canvas need it.
import { W, type ViewState } from './data';

export class View implements ViewState {
  x = W / 2;
  y = W / 2;
  scale = 0.1;
  w = 1;
  h = 1;
  maxScale = 1.2;
  onChange: () => void = () => {};
  onTap: (sx: number, sy: number) => void = () => {};
  private ro: ResizeObserver;
  private off: () => void;

  constructor(
    private el: HTMLElement,
    init: ViewState | null,
  ) {
    this.measure();
    if (init) Object.assign(this, init);
    else {
      this.scale = (this.minScale() / 0.9) * 0.95;
    }
    this.ro = new ResizeObserver(() => {
      this.measure();
      this.onChange();
    });
    this.ro.observe(el);
    this.off = this.bind();
  }

  minScale() {
    return (Math.min(this.w, this.h) / W) * 0.9;
  }
  private measure() {
    this.w = this.el.clientWidth || 1;
    this.h = this.el.clientHeight || 1;
  }
  toWorld(sx: number, sy: number) {
    return {
      x: this.x + (sx - this.w / 2) / this.scale,
      y: this.y + (sy - this.h / 2) / this.scale,
    };
  }
  toScreen(x: number, y: number) {
    return { x: this.w / 2 + (x - this.x) * this.scale, y: this.h / 2 + (y - this.y) * this.scale };
  }
  set(v: ViewState) {
    this.x = v.x;
    this.y = v.y;
    this.scale = v.scale;
    this.onChange();
  }

  zoomAt(sx: number, sy: number, ns: number) {
    const wp = this.toWorld(sx, sy);
    this.scale = Math.min(this.maxScale, Math.max(this.minScale(), ns));
    this.x = wp.x - (sx - this.w / 2) / this.scale;
    this.y = wp.y - (sy - this.h / 2) / this.scale;
    this.onChange();
  }

  destroy() {
    this.off();
    this.ro.disconnect();
  }

  private bind() {
    const el = this.el;
    const ptrs = new Map<number, { x: number; y: number }>();
    let travel = 0,
      t0 = 0;
    const pos = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const down = (e: PointerEvent) => {
      el.setPointerCapture(e.pointerId);
      ptrs.set(e.pointerId, pos(e));
      if (ptrs.size === 1) {
        travel = 0;
        t0 = e.timeStamp;
      } else travel = 99;
    };
    const move = (e: PointerEvent) => {
      const p = ptrs.get(e.pointerId);
      if (!p) return;
      const n = pos(e);
      if (ptrs.size === 1) {
        travel += Math.abs(n.x - p.x) + Math.abs(n.y - p.y);
        this.x -= (n.x - p.x) / this.scale;
        this.y -= (n.y - p.y) / this.scale;
        this.onChange();
      } else if (ptrs.size === 2) {
        const [a, b] = [...ptrs.entries()];
        const o = a[0] === e.pointerId ? b[1] : a[1]; // the other finger
        const d0 = Math.hypot(p.x - o.x, p.y - o.y) || 1;
        const d1 = Math.hypot(n.x - o.x, n.y - o.y) || 1;
        const m0 = { x: (p.x + o.x) / 2, y: (p.y + o.y) / 2 };
        const m1 = { x: (n.x + o.x) / 2, y: (n.y + o.y) / 2 };
        this.x -= (m1.x - m0.x) / this.scale;
        this.y -= (m1.y - m0.y) / this.scale;
        this.zoomAt(m1.x, m1.y, this.scale * (d1 / d0));
      }
      ptrs.set(e.pointerId, n);
    };
    const up = (e: PointerEvent) => {
      const was = ptrs.size;
      const p = pos(e);
      ptrs.delete(e.pointerId);
      if (was === 1 && travel < 8 && e.timeStamp - t0 < 500) this.onTap(p.x, p.y);
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      this.zoomAt(e.clientX - r.left, e.clientY - r.top, this.scale * Math.exp(-e.deltaY * 0.0015));
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('wheel', wheel, { passive: false });
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      el.removeEventListener('wheel', wheel);
    };
  }
}
