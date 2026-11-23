import { expect, test } from 'vitest';
import svLayout from '../games/sv/generated/layout.json';
import svLocations from '../games/sv/generated/locations.json';
import type { DexEntry } from './types';
import {
  areasFor,
  crowdedArea,
  hasPaldeaArea,
  inPaldea,
  MANY_MISSING,
  missingByArea,
  pokearthUrl,
  pokemapsAreaUrl,
  pokemapsEntryUrl,
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

test('PokéMaps slugs follow the rule and the Area Zero exception', () => {
  const l: Locations = {
    ...locs,
    areas: {
      southprovinceareatwo: 'South Province Area Two',
      glaseadomountain: 'Glaseado Mountain',
      areazero: 'Area Zero',
      greatcraterofpaldea: 'Great Crater of Paldea',
    },
  };
  const base = 'https://pokemaps.net/maps/sv/paldea/';
  expect(pokemapsAreaUrl(l, 'southprovinceareatwo')).toBe(`${base}south-province-area-two`);
  expect(pokemapsAreaUrl(l, 'glaseadomountain')).toBe(`${base}glaseado-mountain`);
  expect(pokemapsAreaUrl(l, 'areazero')).toBe(`${base}area-zero`);
  expect(pokemapsAreaUrl(l, 'greatcraterofpaldea')).toBe(`${base}area-zero`);
  expect(pokemapsEntryUrl('Lechonk')).toBe(`${base}lechonk`);
  expect(pokemapsEntryUrl('Great Tusk')).toBe(`${base}great-tusk`);
  expect(pokemapsEntryUrl('Flabébé')).toBe(`${base}flabebe`);
  expect(pokemapsEntryUrl('Wo-Chien')).toBe(`${base}wo-chien`);
});

test('inPaldea and hasPaldeaArea are true only for Paldea areas', () => {
  expect(inPaldea(locs, 'asadodesert')).toBe(true);
  expect(inPaldea(locs, 'applehills')).toBe(false);
  expect(hasPaldeaArea(locs, [a, b])).toBe(true);
  expect(hasPaldeaArea(locs, [a])).toBe(false);
  expect(hasPaldeaArea(locs, null)).toBe(false);
});

// The slug rule has no case for an apostrophe, a period or a gender sign (Farfetch'd, Mr. Mime,
// Nidoran). No Paldea area or species name has one. Only Kitakami areas have an apostrophe, and
// they get no PokéMaps link. This test fails when a new name needs a rule.
test('no Paldea area or species name needs more than the slug rule', () => {
  const sv = svLocations as Locations;
  const paldeaAreas = Object.keys(sv.regions).filter((s) => inPaldea(sv, s));
  const species = svLayout.groups
    .flatMap((g) => g.items)
    .filter((e) => hasPaldeaArea(sv, areasFor(sv, e.id, null)));
  const names = [...paldeaAreas.map((s) => sv.areas[s]!), ...species.map((e) => e.name)];
  expect(species.length).toBeGreaterThan(300);
  expect(names.filter((n) => /[^\p{L}\p{M} -]/u.test(n))).toEqual([]);
});

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
