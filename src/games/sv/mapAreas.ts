/**
 * Facts about `map-areas.svg` that the test (`map.test.ts`) and the draw mode of the overlay
 * (`scripts/map-overlay.ts`) share. The overlay writes `data-z` from `AREA_Z`.
 */

/** Paldea slugs that get no path: no source for their shape (#46). */
export const NO_PATH = ['greatcraterofpaldea'];

/**
 * Draw order of each Area: sea 0, land 1, nested in a province 2, tiny 3 (#48). A higher value is
 * drawn on top and wins a tap.
 * Unverified: the assignment is a proposal from the area names. Confirm each nested area on the
 * overlay and change it here.
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
  areazero: 2,
  pokemonleague: 2,
  alfornadacavern: 2,
  dalizapapassage: 2,
  socarrattrail: 2,
  tagtreethicket: 2,
  asadodesert: 2,
  casseroyalake: 2,
  glaseadomountain: 2,
  cortondo: 3,
  inletgrotto: 3,
};
