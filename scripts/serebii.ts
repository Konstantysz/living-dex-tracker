import type { Area, Version } from '../src/core/locations';

/** One line of a Locations cell on a Serebii species page. */
export interface LocationLine {
  version: Version;
  /** Dex prefix of the section: '' for the base game, 'K' Teal Mask, 'B' Indigo Disk. */
  section: string;
  /** Form label that Serebii puts before the areas (e.g. "Paldean Form"), null when there is none. */
  label: string | null;
  /** Text in brackets after the areas, e.g. "White-Striped Form" or "May disguise as other Pokémon". */
  note: string | null;
  areas: Area[];
}

const VERSIONS: Record<string, Version> = { scarlet: 'S', violet: 'V' };
const SECTIONS: Record<string, string> = { ttm: 'K', tid: 'B' };
/** Rows of the table that are not SV locations: header, spawn biomes, Legends Z-A. */
const IGNORED_ROWS = new Set(['fooevo', 'fooblack', 'fooza', 'foozamd']);
/** Line prefixes of a later slice (fixed encounters, Titans, Tera Raid stars). */
const IGNORED_LABELS = new Set(['Fixed', 'Titan', 'Tera Raid Battles']);

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
  let section = '';
  let sectionRows = 0;
  let rows = 0;
  for (const row of table.split(/<tr[^>]*>/).slice(1)) {
    const cells = [...row.matchAll(/<td([^>]*)>([\s\S]*?)<\/td>/g)].map(([, attrs, body]) => ({
      cls: attrs!.match(/class="([^"]+)"/)?.[1] ?? '',
      rowspan: Number(attrs!.match(/rowspan="(\d+)"/)?.[1] ?? 1),
      body: body!,
    }));
    if (!cells.length || IGNORED_ROWS.has(cells[0]!.cls)) continue;
    let i = 0;
    if (cells[0]!.cls in SECTIONS) {
      section = SECTIONS[cells[0]!.cls]!;
      sectionRows = cells[0]!.rowspan;
      i = 1;
    } else if (sectionRows <= 0) section = '';
    sectionRows--;
    const version = VERSIONS[cells[i]?.cls ?? ''];
    const info = cells[i + 1];
    if (!version || info?.cls !== 'fooinfo') {
      throw new Error(`unknown row: ${cells.map((c) => c.cls).join(',')}`);
    }
    rows++;
    let heading: string | null = null;
    for (const part of info.body.split(/<br\s*\/?>/)) {
      const t = text(part);
      if (!t) continue;
      // "<b>Kantonian Form</b>" on its own line labels the lines after it
      if (/^\s*<b>[^<]*<\/b>\s*$/.test(part)) {
        heading = t;
        continue;
      }
      const prefix = t.match(/^([^:]+):/)?.[1]?.trim() ?? null;
      if (prefix && IGNORED_LABELS.has(prefix)) continue;
      const areas = [
        ...part.matchAll(/<a href="\/pokearth\/[a-z0-9]+\/([a-z0-9]+)\.shtml">([^<]+)<\/a>/g),
      ].map(([, slug, name]) => ({ name: decode(name!).trim(), slug: slug! }));
      if (!areas.length) continue;
      const note = t.match(/\(([^)]*)\)/)?.[1]?.trim() ?? null;
      lines.push({ version, section, label: prefix ?? heading, note, areas });
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
 * without a label goes to the entries only when all entries obtainable in that section share one
 * form label. A line whose note names a form ("(Bloodmoon)", "(White-Striped Form)") goes to no
 * entry. Otherwise the line is ambiguous and no entry gets it (no data is invented).
 */
export function matchEntries(
  lines: LocationLine[],
  entries: MatchEntry[],
): { areas: Record<string, Partial<Record<Version, Area[]>>>; unmatched: string[] } {
  const areas: Record<string, Partial<Record<Version, Area[]>>> = {};
  const unmatched: string[] = [];
  for (const line of lines) {
    const candidates = entries.filter((e) => !e.dlc || e.dlc === line.section);
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
    if (!hits.length)
      unmatched.push(
        `${line.version}${line.section}: ${line.label ?? '(no label)'}${line.note ? ` (${line.note})` : ''}`,
      );
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
