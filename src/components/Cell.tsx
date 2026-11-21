import { memo, useState } from 'react';
import { entryLabel } from '../core/entry';
import type { DexEntry } from '../core/types';
import s from './Cell.module.css';

const spriteUrl = (path: string) => import.meta.env.BASE_URL + path;

interface Props {
  entry: DexEntry | null;
  caught: boolean;
  hit: boolean;
  onToggle: (id: string) => void;
}

export const Cell = memo(function Cell({ entry: it, caught, hit, onToggle }: Props) {
  const [broken, setBroken] = useState(false);
  if (!it) return <div className={`${s.cell} ${s.empty}`} aria-hidden="true" />;
  const cls = [s.cell, s[`k_${it.k}`], caught && s.caught, hit && s.hit].filter(Boolean).join(' ');
  return (
    <button
      type="button"
      className={cls}
      data-id={it.id}
      aria-pressed={caught}
      aria-label={`${entryLabel(it)}, ${it.n ?? 'nat ' + it.nat}`}
      onClick={() => onToggle(it.id)}
    >
      {broken ? (
        <span className={s.fallback}>{it.name}</span>
      ) : (
        <img src={spriteUrl(it.s)} alt="" onError={() => setBroken(true)} />
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
