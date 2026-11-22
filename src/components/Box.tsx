import { memo } from 'react';
import type { Box as BoxData } from '../core/layout';
import { Cell } from './Cell';
import s from './Box.module.css';

interface Props {
  index: number;
  box: BoxData;
  caught: Set<string>;
  hits: Set<string>;
  onToggle: (id: string) => void;
  onDetails: (id: string) => void;
}

export const Box = memo(function Box({ index, box, caught, hits, onToggle, onDetails }: Props) {
  const items = box.filter((x) => x !== null);
  const nums = items.flatMap((x) => (x.n ? [x.n] : []));
  const range = nums.length ? `${nums[0]} – ${nums[nums.length - 1]}` : 'dodatki';
  const got = items.filter((x) => caught.has(x.id)).length;
  return (
    <section className={`${s.box} ${items.length && got === items.length ? s.done : ''}`}>
      <h2>
        <span>
          Box {index + 1} <span className={s.r}>{range}</span>
        </span>
        <span className={s.c}>
          {got}/{items.length}
        </span>
      </h2>
      <div className={s.grid}>
        {box.map((it, i) => (
          <Cell
            key={it ? it.id : `empty-${i}`}
            entry={it}
            caught={!!it && caught.has(it.id)}
            hit={!!it && hits.has(it.id)}
            onToggle={onToggle}
            onDetails={onDetails}
          />
        ))}
      </div>
    </section>
  );
});
