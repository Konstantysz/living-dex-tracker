import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from 'vitest';
import { areasFor, type Locations } from '../src/core/locations';
import type { GameLayout } from '../src/core/types';
import { games } from '../src/games/configs';
import { svConfig } from '../src/games/sv/config';
import { buildLayout } from './buildLayout';
import { loadTables } from './pokeapi';

const path = (p: string) => join(import.meta.dirname, '..', p);
const read = (p: string) => JSON.parse(readFileSync(path(p), 'utf8'));
const tables = await loadTables();
const { groups, extra, dlc } = buildLayout(svConfig, tables);
const built = { groups, extra, dlc };

test('an exclusives item that marks no entry fails the build', () => {
  const exclusives = { S: { name: 'Scarlet', species: ['vulpix-alola', 'vulpix-alolan'] } };
  expect(() => buildLayout({ ...svConfig, exclusives }, tables)).toThrow(
    'Exclusives that mark no entry: vulpix-alolan',
  );
  // a species name skips DLC forms, so it marks nothing when all its entries are DLC forms
  const dlcForms = { ...svConfig.dlcForms, vulpix: 'K' };
  const species = { S: { name: 'Scarlet', species: ['vulpix'] } };
  expect(() => buildLayout({ ...svConfig, dlcForms, exclusives: species }, tables)).toThrow(
    'Exclusives that mark no entry: vulpix',
  );
});

// A version exclusive has no areas in the other version. A species name in `exclusives` marks the
// wrong form when only one form is exclusive.
test.each(games.filter((g) => existsSync(path(`src/games/${g.id}/generated/locations.json`))))(
  '$id: version exclusives have no areas in the other version',
  (config) => {
    const layout: GameLayout = read(`src/games/${config.id}/generated/layout.json`);
    const locations: Locations = read(`src/games/${config.id}/generated/locations.json`);
    const wrong = [...layout.groups.flatMap((g) => g.items), ...layout.extra, ...layout.dlc]
      .filter((e) => e.v)
      .flatMap((e) =>
        Object.keys(config.exclusives)
          .filter((other) => other !== e.v && areasFor(locations, e.id, other))
          .map((other) => `${e.id} (${e.v}) has ${other} areas`),
      );
    expect(wrong).toEqual([]);
  },
);

test.each(games.filter((g) => existsSync(path(`src/games/${g.id}/generated/locations.json`))))(
  '$id: every area slug of an entry is in the Area table',
  (config) => {
    const locations: Locations = read(`src/games/${config.id}/generated/locations.json`);
    const missing = Object.entries(locations.entries).flatMap(([id, e]) =>
      (Array.isArray(e.areas) ? e.areas : Object.values(e.areas ?? {}).flat())
        .filter((s) => s && !(s in locations.areas))
        .map((s) => `${id}: ${s}`),
    );
    expect(missing).toEqual([]);
  },
);

test('generator output equals reference golden', () => {
  expect(built).toEqual(read('reference/sv-layout-golden.json'));
});

test('committed layout.json equals reference golden', () => {
  expect(read('src/games/sv/generated/layout.json')).toEqual(
    read('reference/sv-layout-golden.json'),
  );
});
