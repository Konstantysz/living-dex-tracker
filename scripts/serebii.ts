import type { Area, AreasByVersion, EntryLocation, Locations } from '../src/core/locations';

/** One line of a Locations cell on a Serebii species page. */
export interface LocationLine {
  /** Game version: a key of `GameConfig.exclusives` ("S", "V"). */
  version: string;
  /** Dex prefix of the row: '' for the Paldea rows, 'K' The Teal Mask, 'B' The Indigo Disk. */
  dex: string;
  /** Form label that Serebii puts before the areas (e.g. "Paldean Form"), null when there is none. */
  label: string | null;
  /** Text in brackets after the areas, e.g. "White-Striped Form" or "May disguise as other Pokémon". */
  note: string | null;
  areas: Area[];
}

const VERSIONS: Record<string, string> = { scarlet: 'S', violet: 'V' };
const DLC_ROWS: Record<string, string> = { ttm: 'K', tid: 'B' };
/** Rows of the table that are not SV locations: header, spawn biomes, Legends Z-A. */
const IGNORED_ROWS = new Set(['fooevo', 'fooblack', 'fooza', 'foozamd']);
/** Line prefixes of a later slice (fixed encounters, Titans, Tera Raid stars). */
const IGNORED_LABELS = new Set(['Fixed', 'Titan', 'Tera Raid Battles']);
// slugs can hold an apostrophe: "reveler'sroad", "oni'smaw"
const AREA_LINK = /<a href="\/pokearth\/[a-z0-9]+\/([a-z0-9']+)\.shtml">([^<]+)<\/a>/g;

const ENTITIES: Record<string, string> = { amp: '&', quot: '"', apos: "'", eacute: 'é' };

function decode(s: string): string {
  return s.replace(/&(#\d+|[a-z]+);/g, (m, e: string) => {
    if (e.startsWith('#')) return String.fromCharCode(Number(e.slice(1)));
    const c = ENTITIES[e];
    if (c === undefined) throw new Error(`unknown HTML entity ${m}`);
    return c;
  });
}

const text = (html: string) => decode(html.replace(/<[^>]*>/g, '')).trim();

/**
 * Reads the "Locations" table of a Serebii SV species page (`/pokedex-sv/<species>/`).
 * Throws on any table structure it does not know, so a changed page never gives empty data.
 */
export function parseSpeciesPage(html: string): LocationLine[] {
  const start = html.indexOf('<h2>Locations</h2>');
  if (start < 0) throw new Error('no "Locations" table');
  const table = html.slice(start, html.indexOf('</table>', start));
  const lines: LocationLine[] = [];
  let dex = '';
  let dexRows = 0;
  let rows = 0;
  for (const row of table.split(/<tr[^>]*>/).slice(1)) {
    const cells = [...row.matchAll(/<td([^>]*)>([\s\S]*?)<\/td>/g)].map(([, attrs, body]) => ({
      cls: attrs!.match(/class="([^"]+)"/)?.[1] ?? '',
      rowspan: Number(attrs!.match(/rowspan="(\d+)"/)?.[1] ?? 1),
      body: body!,
    }));
    if (!cells.length || IGNORED_ROWS.has(cells[0]!.cls)) continue;
    let i = 0;
    if (cells[0]!.cls in DLC_ROWS) {
      dex = DLC_ROWS[cells[0]!.cls]!;
      dexRows = cells[0]!.rowspan;
      i = 1;
    } else if (dexRows <= 0) dex = '';
    dexRows--;
    const version = VERSIONS[cells[i]?.cls ?? ''];
    const info = cells[i + 1];
    if (!version || info?.cls !== 'fooinfo') {
      throw new Error(`unknown row: ${cells.map((c) => c.cls).join(',')}`);
    }
    rows++;
    let heading: string | null = null;
    // An anchor with no text and no end tag (Serebii typo on the Scyther page) has no area name.
    // Drop it, so the link check below still fails on every other link format.
    const body = info.body.replace(/<a href="\/pokearth\/[^"]*">\s*(?=<a )/g, '');
    for (const part of body.split(/<br\s*\/?>/)) {
      const t = text(part);
      if (!t) continue;
      // "<b>Kantonian Form</b>" on its own line labels the lines after it
      if (/^\s*<b>[^<]*<\/b>\s*$/.test(part)) {
        heading = t;
        continue;
      }
      const prefix = t.match(/^([^:]+):/)?.[1]?.trim() ?? null;
      if (prefix && IGNORED_LABELS.has(prefix)) continue;
      const areas = [...part.matchAll(AREA_LINK)].map(([, slug, name]) => ({
        name: decode(name!).trim(),
        slug: slug!,
      }));
      // every Pokéarth link must match, else a changed link format drops areas without a word
      if (areas.length !== part.split('/pokearth/').length - 1) {
        throw new Error(`unknown area link: ${part.trim()}`);
      }
      if (!areas.length) continue;
      const note = t.match(/\(([^)]*)\)/)?.[1]?.trim() ?? null;
      lines.push({ version, dex, label: prefix ?? heading, note, areas });
    }
  }
  if (!rows) throw new Error('"Locations" table has no version rows');
  return lines;
}

/** An entry of one species as the matcher sees it. */
export interface MatchEntry {
  id: string;
  /** Form label of the entry ("" for the base form). */
  form: string;
  /** Dex prefix when the entry is obtainable only in that DLC (`DexEntry.d`). */
  dlc?: string;
}

/**
 * Gives each entry of one species the areas of the lines that name it. A line with a label goes
 * to the one entry whose form label starts the line's label ("Paldean Form" -> "Paldea"). A line
 * without a label goes to the entries only when all entries obtainable in that dex share one
 * form label. A line whose note names a form ("(Bloodmoon)", "(White-Striped Form)") goes to no
 * entry. Otherwise the line is ambiguous and no entry gets it (no data is invented).
 */
export function matchEntries(
  lines: LocationLine[],
  entries: MatchEntry[],
): { areas: Record<string, AreasByVersion>; unmatched: string[] } {
  const areas: Record<string, AreasByVersion> = {};
  const unmatched: string[] = [];
  for (const line of lines) {
    const candidates = entries.filter((e) => !e.dlc || e.dlc === line.dex);
    const note = line.note?.toLowerCase();
    let hits: MatchEntry[];
    if (
      note &&
      (note.includes('form') ||
        candidates.some((e) => e.form && note.includes(e.form.toLowerCase())))
    ) {
      hits = [];
    } else if (line.label === null) {
      hits = new Set(candidates.map((e) => e.form)).size === 1 ? candidates : [];
    } else {
      const label = line.label.toLowerCase();
      const forms = new Set(
        candidates
          .filter((e) => e.form && label.startsWith(e.form.toLowerCase()))
          .map((e) => e.form),
      );
      hits = forms.size === 1 ? candidates.filter((e) => forms.has(e.form)) : [];
    }
    if (!hits.length) {
      const note = line.note ? ` (${line.note})` : '';
      unmatched.push(`${line.version}${line.dex}: ${line.label ?? '(no label)'}${note}`);
    }
    for (const e of hits) {
      const list = ((areas[e.id] ??= {})[line.version] ??= []);
      for (const a of line.areas) if (!list.some((b) => b.slug === a.slug)) list.push(a);
    }
  }
  return { areas, unmatched };
}

/** Species page slug per national dex number, from Serebii's SV dex list pages. */
export function parseDexList(html: string): Map<number, string> {
  const out = new Map<number, string>();
  const re =
    /href="\/pokedex-sv\/([^"/]+)\/"><img src="\/scarletviolet\/pokemon\/(?:new\/)?small\/(\d+)/g;
  for (const [, slug, nat] of html.matchAll(re)) out.set(Number(nat), slug!);
  if (!out.size) throw new Error('dex list has no species links');
  return out;
}

/**
 * Builds the `Locations` file content from matched areas (`matchEntries` output) and the page
 * slug of each entry, in layout order. An entry gets one shared list when it has areas in every
 * version that occurs in the input with the same slugs, else an object with its versions only.
 * Throws when one slug has two names.
 */
export function buildLocations(
  entries: { id: string; page: string; areas?: AreasByVersion }[],
  source: string,
  scraped: string,
): Locations {
  const names = new Map<string, string>();
  const versions = new Set(entries.flatMap((e) => Object.keys(e.areas ?? {})));
  const out: Locations['entries'] = {};
  for (const e of entries) {
    const per: Record<string, string[]> = {};
    for (const [v, list] of Object.entries(e.areas ?? {})) {
      if (!list?.length) continue;
      per[v] = list.map((a) => {
        const seen = names.get(a.slug);
        if (seen !== undefined && seen !== a.name)
          throw new Error(`area "${a.slug}" has two names: "${seen}" and "${a.name}"`);
        names.set(a.slug, a.name);
        return a.slug;
      });
    }
    const keys = Object.keys(per);
    const first = per[keys[0]!];
    out[e.id] = !first
      ? { page: e.page }
      : keys.length === versions.size && keys.every((k) => per[k]!.join() === first.join())
        ? { page: e.page, areas: first }
        : { page: e.page, areas: per };
  }
  return {
    source,
    scraped,
    areas: Object.fromEntries([...names].sort(([a], [b]) => (a < b ? -1 : 1))),
    entries: out,
  };
}

/** Serializes `Locations` with one top-level key and one entry per line, and a final newline. */
export function formatLocations(l: Locations): string {
  const block = (o: Record<string, unknown>) =>
    '{\n' +
    Object.entries(o)
      .map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)}`)
      .join(',\n') +
    '\n }';
  return (
    `{\n "source": ${JSON.stringify(l.source)},\n "scraped": ${JSON.stringify(l.scraped)},\n` +
    ` "areas": ${block(l.areas)},\n "entries": ${block(l.entries)}\n}\n`
  );
}

/** Areas of an entry as slugs per version. A shared list has the key `*`. */
function perVersion(e: EntryLocation | undefined): Record<string, string[]> {
  const a = e?.areas;
  return !a ? {} : Array.isArray(a) ? { '*': a } : (a as Record<string, string[]>);
}

/**
 * Plain-text summary of what changed between two `Locations`, for a PR body. Lists only entry ids
 * and area slugs that changed. A shared list and a per-version object with the same slugs in
 * every version are equal.
 */
export function diffLocations(before: Locations, after: Locations): string {
  const has = (l: Locations) => Object.values(l.entries).filter((e) => e.areas).length;
  const got: string[] = [];
  const lost: string[] = [];
  const changed: string[] = [];
  for (const [id, e] of Object.entries(after.entries)) {
    const b = perVersion(before.entries[id]);
    const a = perVersion(e);
    const bv = Object.keys(b);
    const av = Object.keys(a);
    if (!bv.length && av.length) got.push(id);
    else if (bv.length && !av.length) lost.push(id);
    else {
      // expand a shared list to the versions of the other side
      const keys = [...new Set([...bv, ...av])].filter((k) => k !== '*');
      const get = (m: Record<string, string[]>, k: string) => (m[k] ?? m['*'] ?? []).join();
      const diff = (keys.length ? keys : ['*']).filter((k) => get(a, k) !== get(b, k));
      if (diff.length) changed.push(`${id} (${diff.join(', ')})`);
    }
  }
  const added = Object.keys(after.areas).filter((s) => !(s in before.areas));
  const removed = Object.keys(before.areas).filter((s) => !(s in after.areas));
  const renamed = Object.keys(after.areas)
    .filter((s) => s in before.areas && before.areas[s] !== after.areas[s])
    .map((s) => `${s}: "${before.areas[s]}" -> "${after.areas[s]}"`);
  const lines = [
    [`Entries with data`, has(before) !== has(after) ? `${has(before)} -> ${has(after)}` : ''],
    ...(
      [
        ['Got data', got],
        ['Lost data', lost],
        ['Areas changed', changed],
        ['Areas added', added],
        ['Areas removed', removed],
        ['Areas renamed', renamed],
      ] as const
    ).map(([h, l]) => [
      h,
      l.length ? `(${l.length}) ${l.join(h === 'Areas renamed' ? '; ' : ' ')}` : '',
    ]),
  ]
    .filter(([, v]) => v)
    .map(([h, v]) => `${h}: ${v}`);
  return lines.join('\n') || 'No changes.';
}

/** True when `x` has the shape of the `Locations` file. */
export function isLocations(x: unknown): x is Locations {
  const l = x as Locations | null;
  return (
    typeof l?.areas === 'object' &&
    typeof l?.entries === 'object' &&
    Object.values(l.entries ?? {}).every((e) => typeof e?.page === 'string')
  );
}
