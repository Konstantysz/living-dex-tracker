import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { matchEntries, parseDexList, parseSpeciesPage } from './serebii';

// Locations tables cut from https://www.serebii.net/pokedex-sv/<species>/ (2026-11-22)
const fixture = (s: string) =>
  readFileSync(join(import.meta.dirname, 'fixtures', 'serebii', `${s}.html`), 'latin1');
const pikachu = fixture('pikachu');

const cell = (body: string) =>
  `<h2>Locations</h2><tr><td class="scarlet">Scarlet</td><td class="fooinfo">${body}</td></tr></table>`;
const hills = '<a href="/pokearth/kitakami/applehills.shtml">Apple Hills</a>';
const woods = '<a href="/pokearth/kitakami/timelesswoods.shtml">Timeless Woods</a>';

describe('parseSpeciesPage', () => {
  test('reads areas per version and section, without Fixed, Tera Raid and Z-A lines', () => {
    const lines = parseSpeciesPage(pikachu);
    expect(lines.map((l) => `${l.version}${l.section}:${l.label}:${l.areas.length}`)).toEqual([
      'S:null:4',
      'V:null:4',
      'SK:null:7',
      'VK:null:7',
    ]);
    expect(lines[0]!.areas[0]).toEqual({
      name: 'East Province Area One',
      slug: 'eastprovinceareaone',
    });
    expect(lines[2]!.areas[0]).toEqual({ name: 'Apple Hills', slug: 'applehills' });
  });

  test('reads the form label before the areas', () => {
    const lines = parseSpeciesPage(fixture('tauros'));
    expect(lines.map((l) => `${l.version}${l.section}:${l.label}`)).toEqual([
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
        section: '',
        label: 'Kantonian Form',
        note: null,
        areas: [{ name: 'Apple Hills', slug: 'applehills' }],
      },
      {
        version: 'S',
        section: '',
        label: 'Kantonian Form',
        note: 'White-Striped Form',
        areas: [{ name: 'Timeless Woods', slug: 'timelesswoods' }],
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

  test('a DLC-only form is not a candidate in other sections', () => {
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
    const lines = parseSpeciesPage(
      cell(`${hills} (Bloodmoon)<br />${woods} (May disguise as other Pok&eacute;mon)`),
    );
    expect(matchEntries(lines, [{ id: 'ditto', form: '' }]).areas['ditto']!.S).toHaveLength(2);
    const { areas, unmatched } = matchEntries(lines, [
      { id: 'ursaluna', form: '' },
      { id: 'ursaluna-bloodmoon', form: 'Bloodmoon' },
    ]);
    expect(areas).toEqual({});
    expect(unmatched).toEqual([
      'S: (no label) (Bloodmoon)',
      'S: (no label) (May disguise as other Pokémon)',
    ]);
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
