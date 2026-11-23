/**
 * Facts about `map-areas.svg` that the test (`map.test.ts`) and the draw mode of the overlay
 * (`scripts/map-overlay.ts`) share. The overlay writes `data-z` from `AREA_Z`.
 */

export { parseRings, type Ring } from '../../core/areaMap';

/** Paldea slugs that get no path: no source for their shape (#46). */
export const NO_PATH = ['greatcraterofpaldea'];

/**
 * Enclaves: Areas on the same level as their parent, inside it. The parent has a hole (a second
 * ring with the opposite winding, the same corners as the enclave), so the two share a border like
 * any two neighbours. The enclave has `data-z` 1. Child slug: parent slug.
 */
export const ENCLAVES: Record<string, string> = {
  socarrattrail: 'casseroyalake',
  cortondo: 'southprovinceareatwo',
};

/**
 * Draw order of each Area: sea 0, land 1 (also an enclave), above a land Area 2, tiny 3 (#48). A
 * higher value is drawn on top and wins a tap. Land Areas (1) share borders with their neighbours.
 * Measured on the first draft: Alfornada Cavern lies 96 to 100 percent inside one province, and
 * Dalizapa Passage lies 79 percent inside Glaseado Mountain, so they are layers on top (2).
 * Inlet Grotto is a tiny Area on top (3). The other Areas overlap a neighbour by 19 percent or
 * less, so they are land that fills the gaps between provinces.
 */
export const AREA_Z: Record<string, 0 | 1 | 2 | 3> = {
  eastpaldeansea: 0,
  northpaldeansea: 0,
  southpaldeansea: 0,
  westpaldeansea: 0,
  eastprovinceareaone: 1,
  eastprovinceareatwo: 1,
  eastprovinceareathree: 1,
  northprovinceareaone: 1,
  northprovinceareatwo: 1,
  northprovinceareathree: 1,
  southprovinceareaone: 1,
  southprovinceareatwo: 1,
  southprovinceareathree: 1,
  southprovinceareafour: 1,
  southprovinceareafive: 1,
  southprovinceareasix: 1,
  westprovinceareaone: 1,
  westprovinceareatwo: 1,
  westprovinceareathree: 1,
  areazero: 1,
  pokemonleague: 1,
  alfornadacavern: 2,
  dalizapapassage: 2,
  socarrattrail: 1,
  tagtreethicket: 1,
  asadodesert: 1,
  casseroyalake: 1,
  glaseadomountain: 1,
  cortondo: 1,
  inletgrotto: 3,
};
