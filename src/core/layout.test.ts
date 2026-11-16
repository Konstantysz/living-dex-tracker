import { describe, expect, test } from 'vitest';
import layoutJson from '../games/sv/generated/layout.json';
import { DEFAULT_OPTIONS, layoutBoxes, packBoxes } from './layout';
import type { DexEntry, GameLayout } from './types';

const sv = layoutJson as GameLayout;
const stats = (boxes: ReturnType<typeof layoutBoxes>) => {
  const slots = boxes.flat().filter(Boolean).length;
  return { boxes: boxes.length, slots, empty: boxes.length * 30 - slots };
};
const lastId = (box: (DexEntry | null)[]) => box.filter(Boolean).at(-1)!.id;

describe('packBoxes on SV data', () => {
  test('defaults: 31 boxes, 917 slots, 13 empty, box 7 ends at flabebe-orange', () => {
    const boxes = layoutBoxes(sv, DEFAULT_OPTIONS);
    expect(stats(boxes)).toEqual({ boxes: 31, slots: 917, empty: 13 });
    expect(lastId(boxes[6]!)).toBe('flabebe-orange');
  });

  test('groups of 2..6 are never split across boxes', () => {
    const boxes = layoutBoxes(sv, DEFAULT_OPTIONS);
    const boxOf = new Map<string, number>();
    boxes.forEach((b, i) => b.forEach((it) => it && boxOf.set(it.id, i)));
    for (const g of sv.groups) {
      const items = g.items.filter((it) => boxOf.has(it.id));
      if (items.length < 2 || items.length > 6) continue;
      expect(new Set(items.map((it) => boxOf.get(it.id))).size, g.sp).toBe(1);
    }
  });

  test('Paldea-only dex: 18 boxes, box 7 ends at floette-red', () => {
    const dlcForms = new Set([
      'wooper',
      'wooper-female',
      'tauros',
      'diglett-alola',
      'dugtrio-alola',
      'slowpoke-galar',
      'slowbro-galar',
      'slowking-galar',
    ]);
    const paldea: GameLayout = {
      extra: [],
      groups: sv.groups
        .filter((g) => !/^[KB]/.test(g.items[0]!.n!))
        .map((g) => ({ ...g, items: g.items.filter((it) => !dlcForms.has(it.id)) })),
    };
    const boxes = layoutBoxes(paldea, DEFAULT_OPTIONS);
    expect(boxes).toHaveLength(18);
    expect(lastId(boxes[6]!)).toBe('floette-red');
  });

  test('extra box always starts a new box and shows nat numbers', () => {
    const boxes = layoutBoxes(sv, { ...DEFAULT_OPTIONS, extra: true });
    const last = boxes.at(-1)!;
    expect(last[0]!.n).toBeNull();
    expect(boxes.at(-2)!.every((it) => it?.n !== null || it === null)).toBe(true);
  });

  test('toggles change the layout', () => {
    const count = (o: Partial<typeof DEFAULT_OPTIONS>) =>
      stats(layoutBoxes(sv, { ...DEFAULT_OPTIONS, ...o })).slots;
    expect(count({ alc: false })).toBe(917 - 62);
    expect(count({ reg: false })).toBeLessThan(917);
    expect(count({ bat: true })).toBeGreaterThan(917);
  });
});

describe('packBoxes unit', () => {
  const e = (id: string): DexEntry => ({
    id,
    n: '1',
    nat: 1,
    name: id,
    form: '',
    g: '',
    k: 'base',
    s: '',
  });
  const grp = (p: string, n: number) => Array.from({ length: n }, (_, i) => e(`${p}${i}`));

  test('small group moves to a new box only with noSplit', () => {
    const groups = [grp('a', 28), grp('b', 4)];
    expect(packBoxes(groups, { noSplit: true })[0]!.filter(Boolean)).toHaveLength(28);
    expect(packBoxes(groups, { noSplit: false })[0]!.filter(Boolean)).toHaveLength(30);
  });

  test('large group flows across the boundary', () => {
    const boxes = packBoxes([grp('a', 28), grp('b', 7)], { noSplit: true });
    expect(boxes[0]!.filter(Boolean)).toHaveLength(30);
  });
});
