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
  return (
    <header className={s.header}>
      <div className={s.top}>
        <h1>
          {name} <span>Living Dex</span>
        </h1>
        <select aria-label="Gra" value={p.gameId} onChange={(e) => p.onGame(e.target.value)}>
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
        <span className="mono-mute">
          {p.stats.boxes} boxów · {p.stats.slots} slotów · {p.stats.empty} pustych
        </span>
      </div>
      <div className={s.ctrls}>
        <button onClick={p.onShowSettings}>Ustawienia</button>
        <input
          type="search"
          placeholder="szukaj nazwy lub #nr"
          aria-label="Szukaj"
          value={p.query}
          onChange={(e) => p.onQuery(e.target.value)}
        />
        <button onClick={p.onShowText}>Układ jako tekst</button>
        <button onClick={p.onShowBackup}>Kopia postępu</button>
      </div>
      <Legend dexes={p.dexes} />
    </header>
  );
}
