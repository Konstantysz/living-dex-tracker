import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Locations } from '../../core/locations';
import locations from './generated/locations.json';

const dir = dirname(fileURLToPath(import.meta.url));
const read = (name: string) => readFileSync(join(dir, name), 'utf8');

/** Paldea slugs that get no path: no source for their shape (#46). */
const NO_PATH = ['greatcraterofpaldea'];

const locs = locations as Locations;
const paldea = Object.keys(locs.regions).filter((s) => locs.regions[s] === 'paldea');

const attr = (tag: string, name: string) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
const paths = existsSync(join(dir, 'map-areas.svg'))
  ? [...read('map-areas.svg').matchAll(/<path\b[^>]*>/g)].map(([tag]) => ({
      id: attr(tag, 'id'),
      z: attr(tag, 'data-z'),
      d: attr(tag, 'd'),
    }))
  : [];
const ids = paths.map((p) => p.id);

describe('map-areas.svg', () => {
  // TODO(#15): remove both .skip when map-areas.svg is drawn (step 3). They fail until it exists.
  it.skip('exists, with the game-unit viewBox and no raster', () => {
    const svg = read('map-areas.svg');
    expect(svg).toContain('viewBox="0 0 5000 5000"');
    expect(svg).not.toMatch(/<image|data:/);
  });

  it.skip('has a path for every Paldea slug except the listed ones', () => {
    expect(paldea.filter((s) => !NO_PATH.includes(s) && !ids.includes(s))).toEqual([]);
  });

  it('has no path for a listed slug, and listed slugs are Paldea slugs', () => {
    expect(NO_PATH.filter((s) => !paldea.includes(s))).toEqual([]);
    expect(ids.filter((id) => NO_PATH.includes(id!))).toEqual([]);
  });

  it('has no other id and no id twice', () => {
    expect(ids.filter((id) => !paldea.includes(id!))).toEqual([]);
    expect(ids.length).toBe(new Set(ids).size);
  });

  it('has data-z 0 to 3 on every path', () => {
    expect(paths.filter((p) => !/^[0-3]$/.test(p.z ?? '')).map((p) => p.id)).toEqual([]);
  });

  it('uses only absolute M, L and Z, with coordinates in 0 to 5000', () => {
    const bad = paths.filter((p) => {
      const d = p.d ?? '';
      const nums = d.match(/-?\d+(\.\d+)?/g) ?? [];
      return !/^M[MLZ\d.,\s-]*Z\s*$/.test(d) || nums.some((n) => Number(n) < 0 || Number(n) > 5000);
    });
    expect(bad.map((p) => p.id)).toEqual([]);
  });
});

describe('map-base files', () => {
  const files = readdirSync(dir).filter((f) => f.startsWith('map-base'));

  // One test, not it.each: before the base art exists, `files` is empty and it.each fails.
  it('have a known name, the viewBox and no raster', () => {
    for (const f of files) {
      expect(f).toMatch(/^map-base-(2|4|8|1-[0-2]-[0-2])\.svg$/);
      const svg = read(f);
      expect(svg).toContain('viewBox="0 0 5000 5000"');
      expect(svg).not.toMatch(/<image|data:/);
    }
  });
});
