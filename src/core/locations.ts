import type { DexEntry } from './types';

/** A named place on the game map. `slug` is the key from the Serebii Pokéarth URL. */
export interface Area {
  name: string;
  slug: string;
  /** Serebii Pokéarth region of the page: "paldea", "kitakami", "terarium". Scraper output only. */
  region?: string;
}

/** Areas per game version (a key of `GameConfig.exclusives`). */
export type AreasByVersion = Partial<Record<string, Area[]>>;

/** Location of one entry: its Serebii species page and its areas (none: no data). */
export interface EntryLocation {
  /** Slug of the Serebii species page. */
  page: string;
  /** One list: the same areas in all versions. An object: area slugs per version key. */
  areas?: string[] | Partial<Record<string, string[]>>;
}

/** Content of `src/games/<id>/generated/locations.json`, written by `npm run data:locations`. */
export interface Locations {
  /** Base URL of the species pages: `source + page + "/"`. */
  source: string;
  /** Date (YYYY-MM-DD) when the oldest cached page was downloaded. */
  scraped: string;
  /** Area slug -> Area name, sorted by slug. */
  areas: Record<string, string>;
  /** Area slug -> Pokéarth region, for the link `pokearthUrl`. */
  regions: Record<string, string>;
  entries: Record<string, EntryLocation>;
}

/** Serebii Pokéarth page of an area. */
export const pokearthUrl = (locs: Locations, slug: string) =>
  `https://www.serebii.net/pokearth/${locs.regions[slug]}/${slug}.shtml`;

const POKEMAPS = 'https://pokemaps.net/maps/sv/paldea/';
/** "Great Tusk" -> "great-tusk", "Flabébé" -> "flabebe". The slug rule of PokéMaps. */
const pokemapsSlug = (name: string) =>
  name.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/\s+/g, '-');

/** PokéMaps page of a Paldea area. `greatcraterofpaldea` has no page of its own: Area Zero. */
export const pokemapsAreaUrl = (locs: Locations, slug: string) =>
  POKEMAPS + (slug === 'greatcraterofpaldea' ? 'area-zero' : pokemapsSlug(locs.areas[slug]!));

/** PokéMaps page of a species in Paldea. The page of a species that is not there is empty. */
export const pokemapsEntryUrl = (speciesName: string) => POKEMAPS + pokemapsSlug(speciesName);

/** True when the area is on the Paldea map (not Kitakami or Blueberry). */
export const inPaldea = (locs: Locations, slug: string) => locs.regions[slug] === 'paldea';

/**
 * Areas of an entry in one game version, or in all versions when `version` is null (see
 * `gameVersion`). Returns null when there is no data, so the UI never shows an empty list.
 */
export function areasFor(locs: Locations, id: string, version: string | null): Area[] | null {
  const areas = locs.entries[id]?.areas ?? {};
  const lists = Array.isArray(areas)
    ? [areas]
    : Object.entries(areas)
        .filter(([v]) => version === null || v === version)
        .map(([, list]) => list ?? []);
  const slugs = [...new Set(lists.flat())];
  return slugs.length ? slugs.map((slug) => ({ slug, name: locs.areas[slug]! })) : null;
}

/** An area with the entries the player still misses there. */
export interface AreaProgress {
  area: Area;
  missing: DexEntry[];
}

/**
 * Areas of `entries` in one game version (null: all), most missing entries first. An area where
 * nothing is missing stays in the list with an empty `missing`.
 */
export function missingByArea(
  locs: Locations,
  entries: Iterable<DexEntry>,
  caught: Set<string>,
  version: string | null,
): AreaProgress[] {
  const by = new Map<string, AreaProgress>();
  for (const it of entries) {
    for (const area of areasFor(locs, it.id, version) ?? []) {
      const p = by.get(area.slug) ?? { area, missing: [] };
      by.set(area.slug, p);
      if (!caught.has(it.id)) p.missing.push(it);
    }
  }
  return [...by.values()].sort(
    (a, b) => b.missing.length - a.missing.length || a.area.name.localeCompare(b.area.name),
  );
}

/** An area counts as "many missing" from this many entries. */
export const MANY_MISSING = 10;

/** The area of `id` with the most missing entries, when it has at least `MANY_MISSING`. */
export function crowdedArea(progress: AreaProgress[], id: string): AreaProgress | undefined {
  // `progress` is sorted, so the first hit has the most
  return progress.find(
    (x) => x.missing.length >= MANY_MISSING && x.missing.some((it) => it.id === id),
  );
}
