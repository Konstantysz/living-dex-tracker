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
  test('defaults: 30 boxes, 875 slots, 25 empty', () => {
    expect(stats(layoutBoxes(sv, DEFAULT_OPTIONS))).toEqual({ boxes: 30, slots: 875, empty: 25 });
  });

  test('DLC dexes start on a fresh box', () => {
    const boxes = layoutBoxes(sv, DEFAULT_OPTIONS);
    for (const p of ['K', 'B']) {
      const i = boxes.findIndex((b) => b[0]?.n?.startsWith(p));
      expect(i).toBeGreaterThan(0);
      expect(boxes[i - 1]!.some((it) => it?.n?.startsWith(p))).toBe(false);
    }
  });

  test('DLC-only forms follow their species number in the DLC dex', () => {
    const flat = layoutBoxes(sv, DEFAULT_OPTIONS).flat().filter(Boolean);
    const ids = flat.map((it) => it!.id);
    // every entry of that DLC dex before the form has a lower number, every one after a higher one
    const at = (id: string, p: string, num: number) => {
      const i = ids.indexOf(id);
      const moved = new Set(sv.dlc.map((x) => x.id));
      const dex = flat.filter((it) => it!.n?.startsWith(p) && !moved.has(it!.id));
      for (const it of dex) {
        const n = Number(it!.n!.slice(1));
        expect(ids.indexOf(it!.id) < i ? n < num : n > num, `${id} vs ${it!.id}`).toBe(true);
      }
    };
    at('wooper', 'K', 5);
    at('wooper-female', 'K', 5);
    at('basculin-white-striped', 'K', 194);
    at('tauros', 'B', 22);
    at('diglett-alola', 'B', 66);
    at('vulpix-alola', 'B', 157);
    at('growlithe-hisui', 'K', 78);
    at('arcanine-hisui', 'K', 79);
    expect(ids.indexOf('wooper-female')).toBe(ids.indexOf('wooper') + 1);
    expect(flat.find((it) => it!.id === 'wooper-paldea')!.form).toBe('Paldea');
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

  test('all 63 Alcremie are always shown', () => {
    const ids = layoutBoxes(sv, DEFAULT_OPTIONS)
      .flat()
      .filter((it) => it?.id.startsWith('alcremie'));
    expect(ids).toHaveLength(63);
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

  test('a species flows across the box boundary', () => {
    const boxes = packBoxes([grp('a', 28), grp('b', 4)]);
    expect(boxes[0]!.filter(Boolean)).toHaveLength(30);
    expect(boxes[1]!.filter(Boolean)).toHaveLength(2);
  });
});
