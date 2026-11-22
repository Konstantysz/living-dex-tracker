/** A named place on the game map. `slug` is the key from the Serebii Pokéarth URL. */
export interface Area {
  name: string;
  slug: string;
}

/** Version key, as in `GameConfig.exclusives` ("S", "V"). */
export type Version = string;

/** Location of one entry: its Serebii species page and the areas per version (none: no data). */
export interface EntryLocation {
  page: string;
  areas?: Partial<Record<Version, Area[]>>;
}

/** Content of `src/games/<id>/generated/locations.json`, written by `npm run data:locations`. */
export interface Locations {
  /** Base URL of the species pages: `source + page + "/"`. */
  source: string;
  /** Date (YYYY-MM-DD) of the oldest page in the scrape. */
  scraped: string;
  entries: Record<string, EntryLocation>;
}

/**
 * Areas of an entry in one version, or in all versions when `version` is null.
 * Returns null when there is no data, so the UI can show "Brak danych" instead of an empty list.
 */
export function areasFor(locs: Locations, id: string, version: Version | null): Area[] | null {
  const areas = locs.entries[id]?.areas ?? {};
  const lists = version === null ? Object.values(areas) : [areas[version] ?? []];
  const seen = new Set<string>();
  const out = lists.flat().filter((a): a is Area => !!a && !seen.has(a.slug) && !!seen.add(a.slug));
  return out.length ? out : null;
}
