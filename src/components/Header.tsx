import { useState } from 'react';
import type { DexConfig } from '../core/types';
import { registry } from '../games';
import { Legend } from './Legend';
import s from './Header.module.css';

interface Props {
  gameId: string;
  dexes: DexConfig[];
  query: string;
  onQuery: (q: string) => void;
  got: number;
  total: number;
  stats: { boxes: number; slots: number; empty: number };
  onGame: (id: string) => void;
  onShowSettings: () => void;
  onShowText: () => void;
  onShowBackup: () => void;
}

export function Header(p: Props) {
  const pct = p.total ? (100 * p.got) / p.total : 0;
  const name = registry.find((g) => g.config.id === p.gameId)?.config.name;
  // Phone only (CSS): everything with s.fold hides until "Więcej" is open.
  const [open, setOpen] = useState(false);
  return (
    <header className={`${s.header} ${open ? s.open : ''}`}>
      <div className={s.top}>
        <h1>
          {name} <span>Living Dex</span>
        </h1>
        <button
          type="button"
          className={s.more}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? 'Mniej' : 'Więcej'}
          <svg viewBox="0 0 12 12" aria-hidden="true">
            <path d="M2 4.5 6 8.5 10 4.5" />
          </svg>
        </button>
        <select
          className={s.fold}
          aria-label="Gra"
          value={p.gameId}
          onChange={(e) => p.onGame(e.target.value)}
        >
          {registry.map((g) => (
            <option key={g.config.id} value={g.config.id}>
              {g.config.name}
            </option>
          ))}
        </select>
        <div className={s.prog}>
          <div className={s.bar}>
            <i style={{ width: `${pct}%` }} />
          </div>
          <span>
            {p.got} / {p.total} ({pct.toFixed(1)}%)
          </span>
        </div>
        <span className={`${s.fold} mono-mute`}>
          {p.stats.boxes} boxów · {p.stats.slots} slotów · {p.stats.empty} pustych
        </span>
      </div>
      <div className={s.ctrls}>
        <button className={s.fold} onClick={p.onShowSettings}>
          Ustawienia
        </button>
        <input
          type="search"
          placeholder="szukaj nazwy lub #nr"
          aria-label="Szukaj"
          value={p.query}
          onChange={(e) => p.onQuery(e.target.value)}
        />
        <button className={s.fold} onClick={p.onShowText}>
          Układ jako tekst
        </button>
        <button className={s.fold} onClick={p.onShowBackup}>
          Kopia postępu
        </button>
      </div>
      <div className={s.fold}>
        <Legend dexes={p.dexes} />
      </div>
    </header>
  );
}
