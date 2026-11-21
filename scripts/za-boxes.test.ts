import { expect, test } from 'vitest';
import layout from '../src/games/za/generated/layout.json';

// Slot counts read from the owner's screenshots of the in-game boxes (30 slots per box).
// A species number n -> number of slots used up to and including every entry of species n.
const slots = (prefix: string) =>
  layout.groups
    .flatMap((g) => g.items)
    .filter((i) => (i.n ?? '').startsWith(prefix) && (prefix || /^\d/.test(i.n!)));
const upTo = (prefix: string, n: number) =>
  slots(prefix).filter((i) => Number(i.n!.replace(/\D/g, '')) <= n).length;

test('Lumiose boxes end where the game boxes end', () => {
  // [last species of a box, slots up to it]; 63 -> 89 + the first Alakazam slot (box 3 ends on it)
  for (const [n, c] of [
    [27, 30],
    [40, 60],
    [63, 89],
    [91, 120],
    [117, 150],
    [139, 180],
    [158, 210],
    [180, 240],
    [232, 299],
  ] as const)
    expect(upTo('', n), `species ${n}`).toBe(c);
});

test('Hyperspace boxes end where the game boxes end', () => {
  // Species 1 (Mankey) is not on the screenshots, so every count is one more.
  for (const [n, c] of [
    [45, 61],
    [72, 91],
    [120, 151],
    [132, 163],
  ] as const)
    expect(upTo('H', n), `species H${n}`).toBe(c);
});
