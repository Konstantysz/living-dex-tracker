import { expect, test } from 'vitest';
import { registry } from '../games';
import { collectibleId, entryCount, isEntryId } from './entry';

test('collectible ids are never entry ids (ADR 0002)', () => {
  const id = collectibleId('stake', 'ting-lu', 1);
  expect(id).toBe('stake:ting-lu-1');
  expect(isEntryId(id)).toBe(false);
  expect(entryCount(new Set(['sprigatito', id]))).toBe(1);
  // The rule holds only while no entry id contains ":".
  for (const { layout } of registry) {
    const all = [...layout.groups.flatMap((g) => g.items), ...layout.extra, ...layout.dlc];
    const ids = all.map((it) => it.id);
    expect(ids.length).toBeGreaterThan(0);
    expect(ids.filter((it) => !isEntryId(it))).toEqual([]);
  }
});
