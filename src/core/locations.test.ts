import { expect, test } from 'vitest';
import { areasFor, type Locations } from './locations';

const a = { name: 'Apple Hills', slug: 'applehills' };
const b = { name: 'Asado Desert', slug: 'asadodesert' };
const locs: Locations = {
  source: 'https://www.serebii.net/pokedex-sv/',
  scraped: '2026-11-22',
  areas: { applehills: a.name, asadodesert: b.name },
  entries: {
    pikachu: { page: 'pikachu', areas: { S: ['applehills', 'asadodesert'], V: ['applehills'] } },
    sprigatito: { page: 'sprigatito' },
  },
};

test('areasFor returns the areas of one version', () => {
  expect(areasFor(locs, 'pikachu', 'V')).toEqual([a]);
  expect(areasFor(locs, 'pikachu', 'S')).toEqual([a, b]);
});

test('areasFor with no version joins all versions without duplicates', () => {
  expect(areasFor(locs, 'pikachu', null)).toEqual([a, b]);
});

test('areasFor returns null, not an empty list, when there is no data', () => {
  expect(areasFor(locs, 'sprigatito', 'S')).toBeNull();
  expect(areasFor(locs, 'missing', null)).toBeNull();
  expect(
    areasFor({ ...locs, entries: { x: { page: 'x', areas: { S: ['applehills'] } } } }, 'x', 'V'),
  ).toBeNull();
});

test('areasFor reads a shared list for every version', () => {
  const shared = { ...locs, entries: { x: { page: 'x', areas: ['applehills'] } } };
  expect(areasFor(shared, 'x', 'S')).toEqual([a]);
  expect(areasFor(shared, 'x', null)).toEqual([a]);
});
