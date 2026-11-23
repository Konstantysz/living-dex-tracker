import { inPaldea, type AreaProgress, type Locations } from './locations';

export type Ring = [number, number][];

/** A path is a list of rings: one ring for each `M ... Z` part of `d` (only M, L and Z). */
export const parseRings = (d: string): Ring[] =>
  d
    .split('M')
    .map((part) => part.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [])
    .filter((nums) => nums.length >= 6)
    .map((nums) =>
      Array.from({ length: nums.length >> 1 }, (_, i): [number, number] => [
        nums[2 * i]!,
        nums[2 * i + 1]!,
      ]),
    );

/** One Area of `map-areas.svg`: its rings in game units (0 to 5000) and its draw order. */
export interface AreaShape {
  slug: string;
  /** `data-z`: sea 0, land 1, nested 2, tiny 3. The highest wins a tap. */
  z: number;
  rings: Ring[];
}

/** Base art by detail: file, texture px per game unit, and the screen scale where it appears. */
export interface BaseLod {
  url: string;
  res: number;
  minScale: number;
}

/** A fine tile `map-base-1-<row>-<col>.svg`. Its square is `tileRect`. */
export interface FineTile {
  url: string;
  row: number;
  col: number;
}

/** Map files of a game: `map-areas.svg` as text, the base art by detail and the fine tiles. */
export interface GameMap {
  areas: string;
  /** Slugs of Areas that get no shape. They show as text under the map. */
  noPath: string[];
  base: BaseLod[];
  tiles: FineTile[];
}

/** Start of each tile row or column in game units. Tiles overlap a little. Pinned by a test. */
const TILE_STARTS = [0, 1653.333333, 3320];
export const TILE_SIZE = 1680;

/** Square of a fine tile in game units. The art of the tile lies only inside it. */
export const tileRect = ({ row, col }: Pick<FineTile, 'row' | 'col'>) => ({
  x: TILE_STARTS[col]!,
  y: TILE_STARTS[row]!,
  size: TILE_SIZE,
});

/** The tiles that touch a view, given in game units. */
export const tilesInView = (
  tiles: FineTile[],
  view: { x0: number; y0: number; x1: number; y1: number },
) =>
  tiles.filter((t) => {
    const r = tileRect(t);
    return r.x < view.x1 && r.x + r.size > view.x0 && r.y < view.y1 && r.y + r.size > view.y0;
  });

/** Reads the `<path id data-z d>` tags of `map-areas.svg`. */
export function parseAreaShapes(svg: string): AreaShape[] {
  const attr = (tag: string, name: string) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
  return [...svg.matchAll(/<path\b[^>]*>/g)].flatMap(([tag]) => {
    const slug = attr(tag, 'id');
    const d = attr(tag, 'd');
    return slug && d ? [{ slug, z: Number(attr(tag, 'data-z') ?? 1), rings: parseRings(d) }] : [];
  });
}

/** Bounding box of the outline of an Area, in game units. */
export function bounds(rings: Ring[]) {
  const pts = rings[0]!;
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
}

/** Paldea Areas with no shape, for the text list under the map (Kitakami and Blueberry wait for #17). */
export const unmappedAreas = (progress: AreaProgress[], shapes: AreaShape[], locs: Locations) =>
  progress.filter(
    (p) => inPaldea(locs, p.area.slug) && !shapes.some((sh) => sh.slug === p.area.slug),
  );

/** True when every slug has a shape or is listed as unmapped (`NO_PATH`). */
export const coversAll = (shapes: AreaShape[], slugs: string[], noPath: string[]) =>
  slugs.every((s) => noPath.includes(s) || shapes.some((sh) => sh.slug === s));

/** Signed area of a ring. A hole of an enclave has the opposite sign of its parent's outline. */
export const ringArea = (r: Ring) =>
  r.reduce((sum, [x, y], i) => {
    const [nx, ny] = r[(i + 1) % r.length]!;
    return sum + (x * ny - nx * y) / 2;
  }, 0);

/** Net area of an Area: its outline minus its holes (their windings are opposite). */
export const shapeArea = (rings: Ring[]) =>
  Math.abs(rings.reduce((sum, r) => sum + ringArea(r), 0));

/** Even-odd test over all rings, so a hole (enclave) is not part of its parent. */
export function containsPoint(rings: Ring[], px: number, py: number): boolean {
  let inside = false;
  for (const r of rings) {
    for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
      const [xi, yi] = r[i]!;
      const [xj, yj] = r[j]!;
      if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
    }
  }
  return inside;
}

/** Tolerance of a finger around the tap point, in screen px. */
const TAP_TOLERANCE = 12;

/**
 * The Area under a tap: samples the point and 4 points `TAP_TOLERANCE` screen px around it (so a
 * finger hits a tiny Area) and takes the highest `z`. On a tie it takes the smaller Area, so an enclave wins over its parent
 * (both have `data-z` 1). `scale` is screen px per game unit.
 */
export function hitTest(
  shapes: AreaShape[],
  x: number,
  y: number,
  scale: number,
): string | undefined {
  const d = TAP_TOLERANCE / scale;
  const samples = [
    [x, y],
    [x + d, y],
    [x - d, y],
    [x, y + d],
    [x, y - d],
  ] as const;
  let best: AreaShape | undefined;
  for (const s of shapes) {
    if (best && (s.z < best.z || (s.z === best.z && shapeArea(s.rings) >= shapeArea(best.rings))))
      continue;
    if (samples.some(([sx, sy]) => containsPoint(s.rings, sx, sy))) best = s;
  }
  return best?.slug;
}
