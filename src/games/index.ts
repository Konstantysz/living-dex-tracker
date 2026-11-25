import { coversAll, parseAreaShapes, type GameMap } from '../core/areaMap';
import type { Locations } from '../core/locations';
import type { GameConfig, GameLayout } from '../core/types';
import { games as configs } from './configs';
import svLayout from './sv/generated/layout.json';
import svLocations from './sv/generated/locations.json';
import svAreas from './sv/map-areas.svg?raw';
import base2 from './sv/map-base-2.svg?url';
import base4 from './sv/map-base-4.svg?url';
import base8 from './sv/map-base-8.svg?url';
import { NO_PATH } from './sv/mapAreas';
import './sv/theme.css';
import zaLayout from './za/generated/layout.json';
import './za/theme.css';

export interface Game {
  config: GameConfig;
  layout: GameLayout;
  /** Made by `npm run data:locations`. Games without it show no locations. */
  locations?: Locations;
  /** Area map files. Set only when every area has a shape or is listed as unmapped. */
  map?: GameMap;
}

// ponytail: texture res is 1 over the LOD. minScale is the screen px per game unit where the LOD
// takes over.
const svMap: GameMap = {
  areas: svAreas,
  noPath: NO_PATH,
  base: [
    { url: base8, res: 0.125, minScale: 0 },
    { url: base4, res: 0.25, minScale: 0.06 },
    { url: base2, res: 0.5, minScale: 0.12 },
  ],
  tiles: Object.entries(
    import.meta.glob<string>('./sv/map-base-1-*.svg', {
      query: '?url',
      import: 'default',
      eager: true,
    }),
  ).map(([path, url]) => {
    const [, row, col] = path.match(/map-base-1-(\d)-(\d)\.svg$/)!;
    return { url, row: Number(row), col: Number(col) };
  }),
};
const maps: Record<string, GameMap> = { sv: svMap };
/** A game gets its map only when every Paldea Area has a shape or is listed in `noPath`. */
const mapOf = (id: string, locs?: Locations) => {
  const map = maps[id];
  const slugs = Object.keys(locs?.regions ?? {}).filter((s) => locs?.regions[s] === 'paldea');
  return map && locs && coversAll(parseAreaShapes(map.areas), slugs, map.noPath) ? map : undefined;
};

const layouts: Record<string, GameLayout> = {
  sv: svLayout as GameLayout,
  za: zaLayout as GameLayout,
};
const locations: Record<string, Locations> = { sv: svLocations as Locations };

/** Registry: add a game by adding its config to configs.ts and its layout here. */
export const registry: Game[] = configs.map((config) => ({
  config,
  layout: layouts[config.id] as GameLayout,
  locations: locations[config.id],
  map: mapOf(config.id, locations[config.id]),
}));

export const findGame = (id: string): Game =>
  registry.find((g) => g.config.id === id) ?? registry[0]!;
