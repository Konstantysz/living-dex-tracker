import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from 'vitest';
import { svConfig } from '../src/games/sv/config';
import { buildLayout } from './buildLayout';
import { loadTables } from './pokeapi';

const read = (p: string) => JSON.parse(readFileSync(join(import.meta.dirname, '..', p), 'utf8'));
const { groups, extra, dlc } = buildLayout(svConfig, await loadTables());
const built = { groups, extra, dlc };

test('generator output equals reference golden', () => {
  expect(built).toEqual(read('reference/sv-layout-golden.json'));
});

test('committed layout.json equals reference golden', () => {
  expect(read('src/games/sv/generated/layout.json')).toEqual(
    read('reference/sv-layout-golden.json'),
  );
});
