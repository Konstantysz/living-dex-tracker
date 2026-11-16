import type { DexConfig } from '../core/types';
import s from './Legend.module.css';

export function Legend({ dexes }: { dexes: DexConfig[] }) {
  const dot = (c: string) => <b style={{ background: `var(--${c})` }} />;
  return (
    <div className={s.legend}>
      <span>{dot('fem')}samica</span>
      <span>{dot('form')}forma</span>
      <span>{dot('reg')}regionalna</span>
      <span>{dot('bat')}bitewna</span>
      <span>
        nr:{' '}
        {dexes.map((d) => (d.prefix ? `${d.prefix} = ${d.name}` : `123 = ${d.name}`)).join(', ')}
      </span>
      <span>klik = złapany / odznacz</span>
    </div>
  );
}
