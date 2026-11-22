import { memo, useRef, useState } from 'react';
import { entryLabel } from '../core/entry';
import type { DexEntry } from '../core/types';
import s from './Cell.module.css';

const spriteUrl = (path: string) => import.meta.env.BASE_URL + path;

interface Props {
  entry: DexEntry | null;
  caught: boolean;
  hit: boolean;
  /** A plain click or tap. In details mode it opens the details dialog instead of a toggle. */
  onToggle: (id: string) => void;
  onDetails: (id: string) => void;
}

const LONG_PRESS_MS = 500;
/** A finger that moves more than this (px) scrolls, so it cancels the long press. */
const MOVE_PX = 10;

export const Cell = memo(function Cell({ entry: it, caught, hit, onToggle, onDetails }: Props) {
  const [broken, setBroken] = useState(false);
  const press = useRef<{ t: number; x: number; y: number } | null>(null);
  // Set when a long press opened the details: the click that follows must not toggle.
  const pressed = useRef(false);
  if (!it) return <div className={`${s.cell} ${s.empty}`} aria-hidden="true" />;
  const cls = [s.cell, s[`k_${it.k}`], caught && s.caught, hit && s.hit].filter(Boolean).join(' ');
  const cancel = () => {
    if (press.current) clearTimeout(press.current.t);
    press.current = null;
  };
  return (
    <button
      type="button"
      className={cls}
      data-id={it.id}
      aria-pressed={caught}
      aria-label={`${entryLabel(it)}, ${it.n ?? 'nat ' + it.nat}`}
      aria-keyshortcuts="i Shift+Enter"
      onClick={(e) => {
        if (pressed.current) pressed.current = false;
        else if ((e.target as HTMLElement).closest(`.${s.info}`)) onDetails(it.id);
        else onToggle(it.id);
      }}
      onContextMenu={(e) => {
        // Desktop right click, and the long press on Android.
        e.preventDefault();
        // A touch release after this menu must not toggle.
        if (press.current) pressed.current = true;
        cancel();
        onDetails(it.id);
      }}
      onKeyDown={(e) => {
        if (e.key.toLowerCase() === 'i' || (e.key === 'Enter' && e.shiftKey)) {
          e.preventDefault();
          onDetails(it.id);
        }
      }}
      onPointerDown={(e) => {
        pressed.current = false;
        if (e.pointerType !== 'touch') return;
        const t = window.setTimeout(() => {
          press.current = null;
          pressed.current = true;
          onDetails(it.id);
        }, LONG_PRESS_MS);
        press.current = { t, x: e.clientX, y: e.clientY };
      }}
      onPointerMove={(e) => {
        const p = press.current;
        if (p && Math.hypot(e.clientX - p.x, e.clientY - p.y) > MOVE_PX) cancel();
      }}
      onPointerUp={cancel}
      onPointerCancel={cancel}
    >
      <span className={s.info} aria-hidden="true">
        i
      </span>
      {broken ? (
        <span className={s.fallback}>{it.name}</span>
      ) : (
        <img src={spriteUrl(it.s)} alt="" draggable={false} onError={() => setBroken(true)} />
      )}
      <span className={s.no}>{it.n ?? it.nat}</span>
      {it.v && (
        <span className={s.ver} style={{ background: `var(--ver-${it.v})` }} aria-hidden="true">
          {it.v}
        </span>
      )}
      {it.g && <span className={`${s.g} ${it.g === '♀' ? s.f : s.m}`}>{it.g}</span>}
    </button>
  );
});
