import { useEffect, useState, type RefObject } from 'react';
import { entryLabel, numberText } from '../core/entry';
import type { DexConfig, DexEntry } from '../core/types';
import s from './Tooltip.module.css';

interface Props {
  container: RefObject<HTMLElement | null>;
  entries: Map<string, DexEntry>;
  dexes: DexConfig[];
}

/** Floating tooltip driven by mouse events on `container` cells (data-id). */
export function Tooltip({ container, entries, dexes }: Props) {
  const [tip, setTip] = useState<{ it: DexEntry; x: number; y: number } | null>(null);
  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const move = (e: MouseEvent) => {
      const id = (e.target as HTMLElement).closest<HTMLElement>('[data-id]')?.dataset.id;
      const it = id ? entries.get(id) : undefined;
      setTip(it ? { it, x: Math.min(e.clientX + 14, innerWidth - 220), y: e.clientY + 14 } : null);
    };
    const leave = () => setTip(null);
    el.addEventListener('mousemove', move);
    el.addEventListener('mouseleave', leave);
    return () => {
      el.removeEventListener('mousemove', move);
      el.removeEventListener('mouseleave', leave);
    };
  }, [container, entries]);
  if (!tip) return null;
  const { it } = tip;
  return (
    <div className={s.tip} style={{ left: tip.x, top: tip.y }} role="tooltip">
      {entryLabel(it)}
      <br />
      <small>
        {numberText(it, dexes)}
        {it.n ? ` · nat. #${it.nat}` : ''}
      </small>
    </div>
  );
}
