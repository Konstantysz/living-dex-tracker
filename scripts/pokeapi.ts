import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

/** PokeAPI data is pinned to this commit so generated layouts stay reproducible. */
export const POKEAPI_SHA = 'e4f981e5cb03c1fe33d436b1ee8e1197fbb0af84';
export const SPRITES_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/';
const CSV_BASE = `https://raw.githubusercontent.com/PokeAPI/pokeapi/${POKEAPI_SHA}/data/v2/csv/`;
export const CACHE_DIR = join(import.meta.dirname, 'cache', POKEAPI_SHA);

export const CSV_FILES = [
  'pokemon_dex_numbers',
  'pokedexes',
  'pokemon_species',
  'pokemon',
  'pokemon_forms',
  'pokemon_species_names',
] as const;

export type Row = Record<string, string>;
export type Tables = Record<(typeof CSV_FILES)[number], Row[]>;

/** Minimal RFC 4180 parser: quoted fields, escaped quotes, CRLF. */
export function parseCsv(text: string): Row[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      field = '';
      rows.push(row);
      row = [];
    } else field += c;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  const [head = [], ...body] = rows.filter((r) => r.length > 1 || r[0] !== '');
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ''])));
}

/** Reads CSVs from the committed cache, downloading missing files first. */
export async function loadTables(): Promise<Tables> {
  const out = {} as Tables;
  for (const name of CSV_FILES) {
    const file = join(CACHE_DIR, `${name}.csv`);
    if (!existsSync(file)) {
      const res = await fetch(`${CSV_BASE}${name}.csv`);
      if (!res.ok) throw new Error(`${name}.csv: HTTP ${res.status}`);
      await mkdir(CACHE_DIR, { recursive: true });
      await writeFile(file, await res.text());
    }
    out[name] = parseCsv(await readFile(file, 'utf8'));
  }
  return out;
}

/** Downloads sprites that are not on disk yet. Returns the paths that do not exist upstream. */
export async function downloadSprites(paths: string[], publicDir: string): Promise<string[]> {
  const missing: string[] = [];
  const queue = [...paths];
  const worker = async () => {
    for (let p = queue.pop(); p; p = queue.pop()) {
      const dest = join(publicDir, p);
      if (existsSync(dest)) continue;
      const res = await fetch(SPRITES_BASE + p);
      if (!res.ok) {
        missing.push(p);
        continue;
      }
      await mkdir(dirname(dest), { recursive: true });
      await writeFile(dest, Buffer.from(await res.arrayBuffer()));
    }
  };
  await Promise.all(Array.from({ length: 8 }, worker));
  return missing.sort();
}
