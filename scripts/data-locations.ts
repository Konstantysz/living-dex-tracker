// Reads SV locations from Serebii species pages (ADR 0001) and writes
// src/games/sv/generated/locations.json. Raw HTML is cached in scripts/cache/serebii/ (git-ignored).
import { existsSync } from 'node:fs';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { inPc } from '../src/core/layout';
import type { AreasByVersion } from '../src/core/locations';
import type { DexEntry, GameLayout } from '../src/core/types';
import svLayout from '../src/games/sv/generated/layout.json';
import {
  buildLocations,
  formatLocations,
  matchEntries,
  parseDexList,
  parseSpeciesPage,
  type MatchEntry,
} from './serebii';

const SITE = 'https://www.serebii.net';
const SOURCE = `${SITE}/pokedex-sv/`;
const DEX_LISTS = ['paldeapokedex', 'kitakamipokedex', 'blueberrypokedex'];
const CACHE = join(import.meta.dirname, 'cache', 'serebii');
const OUT = join(import.meta.dirname, '..', 'src', 'games', 'sv', 'generated', 'locations.json');

let lastRequest = 0;
/** Download times of the pages read, for the scrape date. */
const mtimes: number[] = [];

/** Reads a page from the cache. On a miss it downloads it, at most 1 request per second. */
async function readPage(url: string, file: string): Promise<string> {
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
const entries: DexEntry[] = [...layout.groups.flatMap((g) => g.items), ...layout.dlc].filter(inPc);

const slugs = new Map<number, string>();
for (const list of DEX_LISTS) {
  const html = await readPage(`${SITE}/scarletviolet/${list}.shtml`, `_${list}.html`);
  for (const [nat, slug] of parseDexList(html)) slugs.set(nat, slug);
}

const byNat = new Map<number, DexEntry[]>();
for (const e of entries) byNat.set(e.nat, [...(byNat.get(e.nat) ?? []), e]);
const out: { id: string; page: string; areas?: AreasByVersion }[] = [];
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
    const lines = parseSpeciesPage(await readPage(`${SOURCE}${slug}/`, `${slug}.html`));
    const match: MatchEntry[] = species.map((e) => ({ id: e.id, form: e.form, dlc: e.d?.[0] }));
    const { areas, unmatched } = matchEntries(lines, match);
    for (const e of species) out.push({ id: e.id, page: slug, areas: areas[e.id] });
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
// Layout order, not species order
const order = new Map(entries.map((e, i) => [e.id, i]));
out.sort((a, b) => order.get(a.id)! - order.get(b.id)!);
const data = buildLocations(out, SOURCE, new Date(Math.min(...mtimes)).toISOString().slice(0, 10));
const withoutData = Object.entries(data.entries).filter(([, v]) => !v.areas);
if (withoutData.length === out.length) throw new Error('no entry has locations');
const missing = Object.values(data.entries)
  .flatMap((e) => (Array.isArray(e.areas) ? e.areas : Object.values(e.areas ?? {}).flat()))
  .filter((s) => s && !(s in data.areas));
if (missing.length) throw new Error(`area slugs not in the Area table: ${missing.join(' ')}`);
await writeFile(OUT, formatLocations(data));
for (const n of notes) console.log(`  ${n}`);
console.log(
  `Entries without data (${withoutData.length}): ${withoutData.map(([id]) => id).join(' ')}`,
);
console.log(`sv: ${out.length - withoutData.length}/${out.length} entries with locations`);
