import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { areasFor, type AreasByVersion, type Locations } from '../src/core/locations';
import {
  buildLocations,
  diffLocations,
  isLocations,
  formatLocations,
  matchEntries,
  parseDexList,
  parseSpeciesPage,
} from './serebii';

// Locations tables cut from https://www.serebii.net/pokedex-sv/<species>/ (2026-11-22)
const fixture = (s: string) =>
  readFileSync(join(import.meta.dirname, 'fixtures', 'serebii', `${s}.html`), 'latin1');
const pikachu = fixture('pikachu');

const cell = (body: string) =>
  `<h2>Locations</h2><tr><td class="scarlet">Scarlet</td><td class="fooinfo">${body}</td></tr></table>`;
const hills = '<a href="/pokearth/kitakami/applehills.shtml">Apple Hills</a>';
const woods = '<a href="/pokearth/kitakami/timelesswoods.shtml">Timeless Woods</a>';

describe('parseSpeciesPage', () => {
  test('reads areas per version and dex, without Fixed, Tera Raid and Z-A lines', () => {
    const lines = parseSpeciesPage(pikachu);
    expect(lines.map((l) => `${l.version}${l.dex}:${l.label}:${l.areas.length}`)).toEqual([
      'S:null:4',
      'V:null:4',
      'SK:null:7',
      'VK:null:7',
    ]);
    expect(lines[0]!.areas[0]).toEqual({
      name: 'East Province Area One',
      slug: 'eastprovinceareaone',
      region: 'paldea',
    });
    expect(lines[2]!.areas[0]).toEqual({
      name: 'Apple Hills',
      slug: 'applehills',
      region: 'kitakami',
    });
  });

  test('reads the form label before the areas', () => {
    const lines = parseSpeciesPage(fixture('tauros'));
    expect(lines.map((l) => `${l.version}${l.dex}:${l.label}`)).toEqual([
      'S:Combat Breed',
      'S:Blaze Breed',
      'V:Combat Breed',
      'V:Aqua Breed',
      'SB:null',
      'VB:null',
    ]);
  });

  test('gives no lines for an entry without areas', () => {
    expect(parseSpeciesPage(fixture('floragato'))).toEqual([]);
  });

  test('takes a bold heading as the label and keeps the note in brackets', () => {
    const lines = parseSpeciesPage(
      cell(
        `<b>Kantonian Form</b><br />${hills}<br />${woods} (White-Striped Form)<br />Titan: ${hills}`,
      ),
    );
    expect(lines).toEqual([
      {
        version: 'S',
        dex: '',
        label: 'Kantonian Form',
        note: null,
        areas: [{ name: 'Apple Hills', slug: 'applehills', region: 'kitakami' }],
      },
      {
        version: 'S',
        dex: '',
        label: 'Kantonian Form',
        note: 'White-Striped Form',
        areas: [{ name: 'Timeless Woods', slug: 'timelesswoods', region: 'kitakami' }],
      },
    ]);
  });

  test('fails loudly on unknown HTML', () => {
    expect(() => parseSpeciesPage('<html></html>')).toThrow('no "Locations" table');
    expect(() => parseSpeciesPage(pikachu.replace('class="scarlet"', 'class="crimson"'))).toThrow(
      'unknown row',
    );
    expect(() => parseSpeciesPage('<h2>Locations</h2></table>')).toThrow('no version rows');
    expect(() => parseSpeciesPage(pikachu.replace('Apple Hills', 'Apple&nbsp;Hills'))).toThrow(
      'unknown HTML entity',
    );
    expect(() => parseSpeciesPage(cell(hills.replace('<a ', '<a class="x" ')))).toThrow(
      'unknown area link',
    );
  });

  test('reads slugs with an apostrophe and drops an empty anchor without an end tag', () => {
    const road = `<a href="/pokearth/kitakami/reveler'sroad.shtml">Reveler's Road</a>`;
    const empty = '<a href="/pokearth/terarium/chargestonecavern.shtml"> ';
    expect(parseSpeciesPage(cell(`${empty}${road}`))[0]!.areas).toEqual([
      { name: "Reveler's Road", slug: "reveler'sroad", region: 'kitakami' },
    ]);
  });
});

describe('matchEntries', () => {
  test('gives lines without a label to all entries when they share one form label', () => {
    const { areas } = matchEntries(parseSpeciesPage(pikachu), [
      { id: 'pikachu', form: '' },
      { id: 'pikachu-female', form: '' },
    ]);
    expect(areas['pikachu']!.S).toHaveLength(11);
    expect(areas['pikachu-female']).toEqual(areas['pikachu']);
  });

  test('a DLC-only form is not a candidate in other dexes', () => {
    const { areas, unmatched } = matchEntries(parseSpeciesPage(pikachu), [
      { id: 'base', form: '' },
      { id: 'dlc', form: 'Alola', dlc: 'B' },
    ]);
    expect(areas['base']!.V).toHaveLength(11);
    expect(areas['dlc']).toBeUndefined();
    expect(unmatched).toEqual([]);
  });

  test('matches labels to form labels and gives ambiguous lines to no entry', () => {
    const { areas, unmatched } = matchEntries(parseSpeciesPage(fixture('tauros')), [
      { id: 'tauros-paldea-combat-breed', form: 'Combat' },
      { id: 'tauros-paldea-blaze-breed', form: 'Blaze' },
      { id: 'tauros-paldea-aqua-breed', form: 'Aqua' },
      { id: 'tauros', form: 'Kanto', dlc: 'B' },
    ]);
    expect(Object.keys(areas['tauros-paldea-combat-breed']!)).toEqual(['S', 'V']);
    expect(Object.keys(areas['tauros-paldea-blaze-breed']!)).toEqual(['S']);
    expect(Object.keys(areas['tauros-paldea-aqua-breed']!)).toEqual(['V']);
    expect(areas['tauros']).toBeUndefined();
    expect(unmatched).toEqual(['SB: (no label)', 'VB: (no label)']);
  });

  test('a note that names a form gives the line to no entry, another note does not', () => {
    // one entry per test, so without the note rule each line would go to it
    const other = parseSpeciesPage(cell(`${woods} (May disguise as other Pok&eacute;mon)`));
    expect(matchEntries(other, [{ id: 'ditto', form: '' }]).areas['ditto']!.S).toHaveLength(1);
    const named = parseSpeciesPage(cell(`${hills} (Bloodmoon)`));
    expect(matchEntries(named, [{ id: 'ursaluna-bloodmoon', form: 'Bloodmoon' }])).toEqual({
      areas: {},
      unmatched: ['S: (no label) (Bloodmoon)'],
    });
    const form = parseSpeciesPage(cell(`${woods} (White-Striped Form)`));
    expect(matchEntries(form, [{ id: 'basculin', form: '' }]).areas).toEqual({});
  });
});

test('parseDexList maps national numbers to page slugs', () => {
  const html = `<a href="/pokedex-sv/mr.mime/"><img src="/scarletviolet/pokemon/new/small/122.png" /></a>
    <a href="/pokedex-sv/ursaluna/"><img src="/scarletviolet/pokemon/small/901-b.png" /></a>`;
  expect([...parseDexList(html)]).toEqual([
    [122, 'mr.mime'],
    [901, 'ursaluna'],
  ]);
  expect(() => parseDexList('')).toThrow();
});

describe('buildLocations', () => {
  const A = { name: 'Apple Hills', slug: 'applehills', region: 'kitakami' };
  const B = { name: 'Asado Desert', slug: 'asadodesert', region: 'paldea' };
  const input: { id: string; page: string; areas?: AreasByVersion }[] = [
    { id: 'shared', page: 'shared', areas: { S: [A], V: [A] } },
    { id: 'differs', page: 'differs', areas: { S: [A, B], V: [B] } },
    { id: 'only-s', page: 'only-s', areas: { S: [B] } },
    { id: 'none', page: 'none' },
  ];
  const locs = buildLocations(input, 'src/', '2026-11-22');

  test('writes a shared list, a per-version object, or no areas key', () => {
    expect(locs.entries['shared']).toEqual({ page: 'shared', areas: ['applehills'] });
    expect(locs.entries['differs']!.areas).toEqual({
      S: ['applehills', 'asadodesert'],
      V: ['asadodesert'],
    });
    expect(locs.entries['only-s']!.areas).toEqual({ S: ['asadodesert'] });
    expect(locs.entries['none']).toEqual({ page: 'none' });
    expect(Object.keys(locs.areas)).toEqual(['applehills', 'asadodesert']);
  });

  test('areasFor gives back the input for each entry, version and null', () => {
    for (const e of input)
      for (const v of ['S', 'V', null]) {
        const lists = Object.entries(e.areas ?? {})
          .filter(([k]) => v === null || k === v)
          .flatMap(([, l]) => l ?? []);
        const want = [
          ...new Map(lists.map((a) => [a.slug, { slug: a.slug, name: a.name }])).values(),
        ];
        expect(areasFor(locs, e.id, v) ?? []).toEqual(want);
      }
  });

  test('round-trips the fixture species', () => {
    const species = {
      pikachu: [{ id: 'pikachu', form: '' }],
      floragato: [{ id: 'floragato', form: '' }],
      tauros: [
        { id: 'tauros-paldea-combat-breed', form: 'Combat' },
        { id: 'tauros-paldea-blaze-breed', form: 'Blaze' },
        { id: 'tauros-paldea-aqua-breed', form: 'Aqua' },
      ],
    };
    const matched = Object.entries(species).flatMap(([page, entries]) => {
      const { areas } = matchEntries(parseSpeciesPage(fixture(page)), entries);
      return entries.map((e) => ({ id: e.id, page, areas: areas[e.id] }));
    });
    const built = buildLocations(matched, 's', 'd');
    for (const e of matched)
      for (const v of ['S', 'V', null]) {
        const want = [
          ...new Map(
            Object.entries(e.areas ?? {})
              .filter(([k]) => v === null || k === v)
              .flatMap(([, l]) => l ?? [])
              .map((a) => [a.slug, { slug: a.slug, name: a.name }]),
          ).values(),
        ];
        expect(areasFor(built, e.id, v) ?? []).toEqual(want);
      }
  });

  test('formatLocations writes one entry per line', () => {
    const lines = formatLocations(locs).split('\n');
    expect(lines.filter((l) => l.startsWith('  "differs":'))).toHaveLength(1);
    expect(lines.at(-1)).toBe('');
    expect(lines.at(-2)).toBe('}');
  });

  test('throws on one slug with two names and gives the same output twice', () => {
    expect(() =>
      buildLocations(
        [{ id: 'x', page: 'x', areas: { S: [A, { ...A, name: 'Other' }] } }],
        's',
        'd',
      ),
    ).toThrow(/two names/);
    expect(() =>
      buildLocations(
        [{ id: 'x', page: 'x', areas: { S: [A, { ...A, region: 'paldea' }] } }],
        's',
        'd',
      ),
    ).toThrow(/region/);
    expect(() =>
      buildLocations(
        [{ id: 'x', page: 'x', areas: { S: [{ ...A, region: undefined }] } }],
        's',
        'd',
      ),
    ).toThrow(/region/);
    expect(buildLocations(input, 's', 'd').regions).toEqual({
      applehills: 'kitakami',
      asadodesert: 'paldea',
    });
    expect(formatLocations(buildLocations(input, 'src/', 'd'))).toBe(
      formatLocations(buildLocations(input, 'src/', 'd')),
    );
    expect(JSON.parse(formatLocations(locs))).toEqual(locs);
  });
});

describe('diffLocations', () => {
  const base = (): Locations => ({
    source: 's',
    scraped: 'd',
    areas: { a: 'A', b: 'B' },
    regions: {},
    entries: {
      x: { page: 'x' },
      y: { page: 'y', areas: ['a'] },
      z: { page: 'z', areas: { S: ['a'], V: ['b'] } },
    },
  });

  test('equal values give no changes', () => {
    expect(diffLocations(base(), base())).toBe('No changes.');
  });

  test('lists got data, lost data and changed areas under their headings', () => {
    const after = base();
    after.entries.x = { page: 'x', areas: ['a'] };
    after.entries.y = { page: 'y' };
    after.entries.z = { page: 'z', areas: { S: ['a'], V: ['a'] } };
    expect(diffLocations(base(), after).split('\n')).toEqual([
      'Got data: (1) x',
      'Lost data: (1) y',
      'Areas changed: (1) z (V)',
    ]);
  });

  test('a shared list equals the same slugs in every version', () => {
    const before = base();
    const after = base();
    before.entries.y = { page: 'y', areas: ['a'] };
    after.entries.y = { page: 'y', areas: { S: ['a'], V: ['a'] } };
    expect(diffLocations(before, after)).toBe('No changes.');
  });

  test('lists renamed, added and removed areas', () => {
    const after = base();
    after.areas = { a: 'A2', c: 'C' };
    expect(diffLocations(base(), after).split('\n')).toEqual([
      'Areas added: (1) c',
      'Areas removed: (1) b',
      'Areas renamed: (1) a: "A" -> "A2"',
    ]);
  });

  test('isLocations rejects the old format', () => {
    expect(isLocations(base())).toBe(true);
    expect(isLocations({ areas: {}, entries: { x: ['a'] } })).toBe(false);
  });
});
