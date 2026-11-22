import { expect, test } from 'vitest';
import { svConfig } from '../games/sv/config';
import { findGame } from '../games';
import { badgeProgress, badgeToast, gameBadges, newlyEarned, type Badge } from './badges';
import { DEFAULT_OPTIONS, layoutBoxes } from './layout';
import type { DexEntry, GameConfig, GameLayout } from './types';

const e = (id: string, n: string, nat: number, more: Partial<DexEntry> = {}): DexEntry => ({
  id,
  n,
  nat,
  name: id,
  form: '',
  g: '',
  k: 'base',
  s: '',
  ...more,
});

// Main dex: a (with a female), b (Scarlet only). DLC dex K: k. a-k is a form of a moved to K.
const config: GameConfig = {
  ...svConfig,
  dexes: [
    { pokeapiId: 0, prefix: '', name: 'Main' },
    { pokeapiId: 0, prefix: 'K', name: 'Kdex' },
  ],
  exclusives: { S: { name: 'Scarlet', species: ['b'] } },
  collectibles: [],
};
const layout: GameLayout = {
  groups: [
    { sp: 'a', items: [e('a', '1', 1), e('a-female', '1', 1, { g: '♀', k: 'fem' })] },
    { sp: 'b', items: [e('b', '2', 2, { v: 'S' })] },
    { sp: 'k', items: [e('k', 'K1', 3), e('k-home', 'K1', 3, { k: 'reg' })] },
  ],
  extra: [],
  dlc: [e('a-k', '1', 1, { k: 'form', d: 'K' })],
};
const badges = gameBadges(config, layout, layoutBoxes(layout, DEFAULT_OPTIONS));
const find = (id: string) => badges.find((b) => b.id === id)!;
const all = new Set(['a', 'a-female', 'b', 'k', 'a-k']);

test('progress counts visible members and earns when all are caught', () => {
  const dex = find('dex:');
  expect(dex.members).toEqual(['a', 'b']);
  expect(badgeProgress(dex, new Set(['a']), all)).toMatchObject({ got: 1, need: 2, earned: false });
  expect(badgeProgress(dex, new Set(['a', 'b']), all)).toMatchObject({ earned: true });
  // A hidden member does not count. With no visible member, the badge is off, not earned.
  expect(badgeProgress(dex, new Set(['a']), new Set(['a']))).toMatchObject({
    need: 1,
    earned: true,
  });
  expect(badgeProgress(dex, new Set(['a', 'b']), new Set())).toMatchObject({
    earned: false,
    off: true,
  });
});

test('a list with main-dex and DLC members gives a base badge and a DLC badge', () => {
  // `a-k` has number 1 but is moved to the DLC dex (field `d`), so it is a DLC member.
  expect(find('all')).toMatchObject({ dlc: false, members: ['a', 'a-female', 'b'] });
  expect(find('all@dlc')).toMatchObject({ dlc: true, members: ['a', 'a-female', 'b', 'k', 'a-k'] });
  // Only DLC members: only a DLC badge. Only main-dex members: only a base badge.
  expect(find('dex:K@dlc')).toMatchObject({ dlc: true });
  expect(badges.some((b) => b.id === 'dex:K')).toBe(false);
  expect(find('female').dlc).toBe(false);
  // HOME-only forms are not in the PC, so no badge has them.
  expect(badges.some((b) => b.members.includes('k-home'))).toBe(false);
});

test('a badge with no member in the PC does not show', () => {
  // No species here has a regional form, so there is no regional badge.
  expect(badges.some((b) => b.id.startsWith('regional'))).toBe(false);
});

test('a badge with a version exclusive says so', () => {
  expect(find('exclusives')).toMatchObject({ members: ['b'], trade: true });
  expect(find('dex:K@dlc').trade).toBe(false);
});

test('a count badge is base game when main-dex entries are enough', () => {
  const sv = findGame('sv');
  const svBadges = gameBadges(sv.config, sv.layout, layoutBoxes(sv.layout, DEFAULT_OPTIONS));
  expect(svBadges.find((b) => b.id === 'count:100')).toMatchObject({ need: 100, dlc: false });
  // Each box is one badge of the "Pełny box" collection. DLC dexes start a new box.
  const boxes = svBadges.filter((b) => b.title === 'Pełny box');
  expect(boxes[0]).toMatchObject({ item: 'Box 1', dlc: false });
  expect(boxes.at(-1)).toMatchObject({ dlc: true });
  expect(svBadges.find((b) => b.id === 'set:stake')).toMatchObject({
    title: 'Strażnik ruin',
    dlc: false,
  });
  expect(
    svBadges.filter((b) => b.id.startsWith('set:stake:')).map((b) => b.members.length),
  ).toEqual([8, 8, 8, 8]);
});

test('hidden badges are flagged', () => {
  expect(find('female').isHidden).toBe(true);
  expect(find('dex:').isHidden).toBeUndefined();
});

test('the toast names badges on the change from not earned to earned only', () => {
  const dex = find('dex:');
  expect(newlyEarned(badges, new Set(['a']), new Set(['a', 'b']), all)).toContain(dex);
  // Already earned before: no line.
  expect(newlyEarned(badges, new Set(['a', 'b']), new Set(['a', 'b', 'k']), all)).not.toContain(
    dex,
  );
  const b = (title: string, item?: string) => ({ title, item }) as Badge;
  expect(badgeToast([])).toBe('');
  expect(badgeToast([b('Pełny box', 'Box 3')])).toBe('🏅 Pełny box: Box 3');
  expect(badgeToast([b('Living Dex')])).toBe('🏅 Living Dex');
  expect(badgeToast([b('x'), b('y'), b('z')])).toBe('🏅 +3 odznaki');
  expect(badgeToast(Array.from({ length: 5 }, () => b('x')))).toBe('🏅 +5 odznak');
  expect(badgeToast(Array.from({ length: 12 }, () => b('x')))).toBe('🏅 +12 odznak');
  expect(badgeToast(Array.from({ length: 22 }, () => b('x')))).toBe('🏅 +22 odznaki');
});
