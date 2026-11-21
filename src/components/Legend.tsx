import type { DexConfig, GameConfig } from '../core/types';
import s from './Legend.module.css';

interface Props {
  dexes: DexConfig[];
  exclusives: GameConfig['exclusives'];
}

export function Legend({ dexes, exclusives }: Props) {
  const dot = (c: string) => <b style={{ background: `var(--${c})` }} />;
  return (
    <details className={s.legend} open={!window.matchMedia?.('(max-width: 40rem)').matches}>
      <summary>Legenda</summary>
      <div className={s.items}>
        <span>{dot('fem')}samica</span>
        <span>{dot('form')}forma</span>
        <span>{dot('reg')}regionalna</span>
        <span>{dot('bat')}bitewna</span>
        {Object.entries(exclusives).map(([k, v]) => (
          <span key={k}>
            {dot(`ver-${k}`)}
            {k} = tylko {v.name}
          </span>
        ))}
        <span>
          nr:{' '}
          {dexes.map((d) => (d.prefix ? `${d.prefix} = ${d.name}` : `123 = ${d.name}`)).join(', ')}
        </span>
        <span>klik = złapany / odznacz</span>
      </div>
    </details>
  );
}
