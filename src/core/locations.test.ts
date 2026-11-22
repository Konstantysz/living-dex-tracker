import { expect, test } from 'vitest';
import type { DexEntry } from './types';
import {
  areasFor,
  crowdedArea,
  MANY_MISSING,
  missingByArea,
  pokearthUrl,
  type Locations,
} from './locations';

const a = { name: 'Apple Hills', slug: 'applehills' };
const b = { name: 'Asado Desert', slug: 'asadodesert' };
const locs: Locations = {
  source: 'https://www.serebii.net/pokedex-sv/',
  scraped: '2026-11-22',
  areas: { applehills: a.name, asadodesert: b.name },
  regions: { applehills: 'kitakami', asadodesert: 'paldea' },
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

const entry = (id: string) => ({ id }) as DexEntry;
const many = {
  ...locs,
  entries: {
    pikachu: locs.entries.pikachu!,
    x: { page: 'x', areas: { S: ['asadodesert'], V: ['asadodesert'] } },
  },
};

test('missingByArea sorts by missing entries and keeps finished areas', () => {
  const list = [entry('pikachu'), entry('x')];
  const p = missingByArea(many, list, new Set(['pikachu']), 'S');
  expect(p.map((x) => [x.area.slug, x.missing.length])).toEqual([
    ['asadodesert', 1],
    ['applehills', 0],
  ]);
  expect(pokearthUrl(many, 'applehills')).toBe(
    'https://www.serebii.net/pokearth/kitakami/applehills.shtml',
  );
});

test('crowdedArea needs many missing entries in an area of the entry', () => {
  const ids = Array.from({ length: MANY_MISSING }, (_, i) => `e${i}`);
  const l = {
    ...locs,
    entries: Object.fromEntries(ids.map((id) => [id, { page: id, areas: ['applehills'] }])),
  };
  const p = missingByArea(l, ids.map(entry), new Set(), null);
  expect(crowdedArea(p, 'e0')?.area.slug).toBe('applehills');
  expect(crowdedArea(p, 'other')).toBeUndefined();
  expect(
    crowdedArea(missingByArea(l, ids.map(entry), new Set(['e0']), null), 'e1'),
  ).toBeUndefined();
});
