import { describe, expect, test } from 'vitest';
import layoutJson from '../games/sv/generated/layout.json';
import { DEFAULT_OPTIONS, layoutBoxes, packBoxes } from './layout';
import type { DexEntry, GameLayout } from './types';

const sv = layoutJson as GameLayout;
const stats = (boxes: ReturnType<typeof layoutBoxes>) => {
  const slots = boxes.flat().filter(Boolean).length;
  return { boxes: boxes.length, slots, empty: boxes.length * 30 - slots };
};

describe('packBoxes on SV data', () => {
  test('defaults: 31 boxes, 874 slots, 56 empty', () => {
    expect(stats(layoutBoxes(sv, DEFAULT_OPTIONS))).toEqual({ boxes: 31, slots: 874, empty: 56 });
  });

  test('DLC dexes start on a fresh box', () => {
    const boxes = layoutBoxes(sv, DEFAULT_OPTIONS);
    for (const p of ['K', 'B']) {
      const i = boxes.findIndex((b) => b[0]?.n?.startsWith(p));
      expect(i).toBeGreaterThan(0);
      expect(boxes[i - 1]!.some((it) => it?.n?.startsWith(p))).toBe(false);
    }
  });

  test('DLC-only forms sit at the end of the Kitakami boxes, not in Paldea', () => {
    const boxes = layoutBoxes(sv, DEFAULT_OPTIONS);
    const flat = boxes.flat().filter(Boolean);
    const at = (id: string) => flat.findIndex((it) => it!.id === id);
    const lastK = flat.map((it) => it!.n?.startsWith('K') && !it!.d).lastIndexOf(true);
    for (const id of ['wooper', 'wooper-female', 'tauros', 'basculin-white-striped']) {
      expect(at(id), id).toBe(
        lastK + 1 + ['wooper', 'wooper-female', 'basculin-white-striped', 'tauros'].indexOf(id),
      );
    }
    expect(flat.find((it) => it!.id === 'wooper-paldea')!.form).toBe('Paldea');
  });

  test('groups of 2..6 are never split across boxes with noSplit', () => {
    const boxes = layoutBoxes(sv, { ...DEFAULT_OPTIONS, noSplit: true });
    const boxOf = new Map<string, number>();
    boxes.forEach((b, i) => b.forEach((it) => it && boxOf.set(it.id, i)));
    for (const g of sv.groups) {
      const items = g.items.filter((it) => boxOf.has(it.id));
      if (items.length < 2 || items.length > 6) continue;
      expect(new Set(items.map((it) => boxOf.get(it.id))).size, g.sp).toBe(1);
    }
  });

  test('HOME-only, battle and out-of-dex forms are never shown', () => {
    const kinds = new Set(
      layoutBoxes(sv, DEFAULT_OPTIONS)
        .flat()
        .map((it) => it?.k),
    );
    for (const k of ['reg', 'bat', 'xreg', 'xbat'] as const) expect(kinds.has(k)).toBe(false);
  });

  test('go toggle adds the Vivillon patterns except Fancy and Poké Ball', () => {
    const count = (go: boolean) => stats(layoutBoxes(sv, { ...DEFAULT_OPTIONS, go })).slots;
    expect(count(true) - count(false)).toBe(18);
    const ids = layoutBoxes(sv, DEFAULT_OPTIONS)
      .flat()
      .map((it) => it?.id);
    expect(ids).toContain('vivillon-fancy');
    expect(ids).not.toContain('vivillon-poke-ball');
  });

  test('alc toggle hides the 62 extra Alcremie forms', () => {
    const count = (alc: boolean) => stats(layoutBoxes(sv, { ...DEFAULT_OPTIONS, alc })).slots;
    expect(count(true) - count(false)).toBe(62);
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
