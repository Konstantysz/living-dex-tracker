/** A named place on the game map. `slug` is the key from the Serebii Pokéarth URL. */
export interface Area {
  name: string;
  slug: string;
}

/** Areas per game version (a key of `GameConfig.exclusives`). */
export type AreasByVersion = Partial<Record<string, Area[]>>;

/** Location of one entry: its Serebii species page and its areas (none: no data). */
export interface EntryLocation {
  /** Slug of the Serebii species page. */
  page: string;
  /** One list = the same areas in all versions; an object = area slugs per version key. */
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
  entries: Record<string, EntryLocation>;
}

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
