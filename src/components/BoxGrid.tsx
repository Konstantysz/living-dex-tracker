import { useRef } from 'react';
import type { Box as BoxData } from '../core/layout';
import type { DexConfig, DexEntry } from '../core/types';
import { Box } from './Box';
import { Tooltip } from './Tooltip';
import s from './BoxGrid.module.css';

interface Props {
  boxes: BoxData[];
  caught: Set<string>;
  hits: Set<string>;
  entries: Map<string, DexEntry>;
  dexes: DexConfig[];
  onlyMissing: boolean;
  onToggle: (id: string) => void;
}

export function BoxGrid({ boxes, caught, hits, entries, dexes, onlyMissing, onToggle }: Props) {
  const ref = useRef<HTMLElement>(null);
  return (
    <>
      <main className={s.grid} ref={ref}>
        {boxes.map((box, i) => (
          <Box
            key={i}
            index={i}
            box={box}
            caught={caught}
            hits={hits}
            onlyMissing={onlyMissing}
            onToggle={onToggle}
          />
        ))}
      </main>
      <Tooltip container={ref} entries={entries} dexes={dexes} />
    </>
  );
}
