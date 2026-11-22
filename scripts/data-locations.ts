// Reads SV locations from Serebii species pages (ADR 0001) and writes
// src/games/sv/generated/locations.json. Raw HTML is cached in scripts/cache/serebii/ (git-ignored).
import { existsSync } from 'node:fs';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { DEFAULT_OPTIONS, keep } from '../src/core/layout';
import type { EntryLocation, Locations } from '../src/core/locations';
import type { DexEntry, GameLayout } from '../src/core/types';
import svLayout from '../src/games/sv/generated/layout.json';
import { matchEntries, parseDexList, parseSpeciesPage, type MatchEntry } from './serebii';

const SITE = 'https://www.serebii.net';
const SOURCE = `${SITE}/pokedex-sv/`;
const DEX_LISTS = ['paldeapokedex', 'kitakamipokedex', 'blueberrypokedex'];
const CACHE = join(import.meta.dirname, 'cache', 'serebii');
const OUT = join(import.meta.dirname, '..', 'src', 'games', 'sv', 'generated', 'locations.json');

let lastRequest = 0;
const mtimes: number[] = [];

/** Reads a page from the cache. On a miss it downloads it, at most 1 request per second. */
async function page(url: string, file: string): Promise<string> {
  const path = join(CACHE, file);
  if (!existsSync(path)) {
    await new Promise((r) => setTimeout(r, Math.max(0, lastRequest + 1000 - Date.now())));
    lastRequest = Date.now();
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; dex-data-script)' },
    });
    if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
    await mkdir(CACHE, { recursive: true });
    await writeFile(path, Buffer.from(await res.arrayBuffer()));
  }
  mtimes.push((await stat(path)).mtimeMs);
  // Serebii serves ISO-8859-1
  return new TextDecoder('latin1').decode(await readFile(path));
}

const layout = svLayout as GameLayout;
const all = { ...DEFAULT_OPTIONS, alc: true, go: true };
const entries: DexEntry[] = [...layout.groups.flatMap((g) => g.items), ...layout.dlc].filter((e) =>
  keep(e, all),
);

const slugs = new Map<number, string>();
for (const list of DEX_LISTS) {
  const html = await page(`${SITE}/scarletviolet/${list}.shtml`, `_${list}.html`);
  for (const [nat, slug] of parseDexList(html)) slugs.set(nat, slug);
}

const byNat = new Map<number, DexEntry[]>();
for (const e of entries) byNat.set(e.nat, [...(byNat.get(e.nat) ?? []), e]);
const out: Record<string, EntryLocation> = {};
const errors: string[] = [];
const notes: string[] = [];
let done = 0;
for (const [nat, species] of byNat) {
  const slug = slugs.get(nat);
  if (!slug) {
    errors.push(`#${nat} ${species[0]!.name}: not in the Serebii dex lists`);
    continue;
  }
  try {
    const lines = parseSpeciesPage(await page(`${SOURCE}${slug}/`, `${slug}.html`));
    const match: MatchEntry[] = species.map((e) => ({ id: e.id, form: e.form, dlc: e.d?.[0] }));
    const { areas, unmatched } = matchEntries(lines, match);
    for (const e of species)
      out[e.id] = areas[e.id] ? { page: slug, areas: areas[e.id] } : { page: slug };
    for (const u of unmatched) notes.push(`${slug}: no entry for line ${u}`);
  } catch (err) {
    errors.push(`${slug}: ${(err as Error).message}`);
  }
  if (++done % 50 === 0) console.log(`${done}/${byNat.size} species`);
}

if (errors.length) {
  console.error(`Parse errors, locations.json is not written:\n  ${errors.join('\n  ')}`);
  process.exit(1);
}
const withoutData = Object.entries(out).filter(([, v]) => !v.areas);
if (withoutData.length === Object.keys(out).length) throw new Error('no entry has locations');

const data: Locations = {
  source: SOURCE,
  scraped: new Date(Math.min(...mtimes)).toISOString().slice(0, 10),
  entries: out,
};
await writeFile(OUT, JSON.stringify(data, null, 1) + '\n');
for (const n of notes) console.log(`  ${n}`);
console.log(
  `Entries without data (${withoutData.length}): ${withoutData.map(([id]) => id).join(' ')}`,
);
console.log(
  `sv: ${Object.keys(out).length - withoutData.length}/${Object.keys(out).length} entries with locations`,
);
