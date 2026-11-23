import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  bounds,
  coversAll,
  hitTest,
  parseAreaShapes,
  ringArea,
  tileRect,
  tilesInView,
} from './areaMap';

const square = (x: number, y: number, s: number) =>
  `M${x} ${y}L${x + s} ${y}L${x + s} ${y + s}L${x} ${y + s}Z`;
const svg = (...p: [string, number, string][]) =>
  p.map(([id, z, d]) => `<path id="${id}" data-z="${z}" d="${d}"/>`).join('');

describe('hitTest', () => {
  const shapes = parseAreaShapes(
    svg(
      ['sea', 0, square(0, 0, 1000)],
      // a land Area with an enclave cut out (opposite winding)
      ['land', 1, square(100, 100, 400) + 'M200 200L200 300L300 300L300 200Z'],
      ['enclave', 1, square(200, 200, 100)],
      ['tiny', 3, square(700, 700, 20)],
    ),
  );

  it('parses every path', () => {
    expect(shapes.map((s) => s.slug)).toEqual(['sea', 'land', 'enclave', 'tiny']);
  });

  it('takes the Area under the tap', () => {
    expect(hitTest(shapes, 400, 400, 1)).toBe('land');
    expect(hitTest(shapes, 900, 100, 1)).toBe('sea');
    expect(hitTest(shapes, 5000, 5000, 1)).toBeUndefined();
  });

  it('does not hit the parent inside its hole', () => {
    expect(hitTest(shapes, 250, 250, 1)).toBe('enclave');
  });

  it('finds a tiny Area with a finger-sized tolerance, and the highest z wins', () => {
    expect(hitTest(shapes, 725, 710, 1)).toBe('tiny');
    expect(hitTest(shapes, 760, 710, 1)).toBe('sea');
  });
});

describe('ringArea, bounds, coversAll', () => {
  const [sq] = parseAreaShapes(svg(['a', 1, square(10, 20, 30)]));
  it('signs the winding and measures the box', () => {
    expect(Math.abs(ringArea(sq!.rings[0]!))).toBe(900);
    expect(ringArea([...sq!.rings[0]!].reverse())).toBe(-ringArea(sq!.rings[0]!));
    expect(bounds(sq!.rings)).toEqual({ x0: 10, x1: 40, y0: 20, y1: 50 });
  });
  it('needs a shape or a NO_PATH entry for every slug', () => {
    expect(coversAll([sq!], ['a', 'b'], ['b'])).toBe(true);
    expect(coversAll([sq!], ['a', 'b'], [])).toBe(false);
  });
});

describe('fine tiles', () => {
  const tiles = [0, 1, 2].flatMap((row) =>
    [0, 1, 2].map((col) => ({ url: `t${row}${col}`, row, col })),
  );

  it('place the 3 by 3 tiles so that they cover the map', () => {
    expect(tileRect({ row: 0, col: 0 })).toEqual({ x: 0, y: 0, size: 1680 });
    expect(tileRect({ row: 2, col: 2 })).toEqual({ x: 3320, y: 3320, size: 1680 });
  });

  it('pick the tiles that touch the view', () => {
    const urls = (v: Parameters<typeof tilesInView>[1]) => tilesInView(tiles, v).map((t) => t.url);
    expect(urls({ x0: 100, y0: 100, x1: 900, y1: 900 })).toEqual(['t00']);
    // a view on the corner of 4 tiles
    expect(urls({ x0: 1600, y0: 1600, x1: 1700, y1: 1700 })).toEqual(['t00', 't01', 't10', 't11']);
    expect(tilesInView(tiles, { x0: 0, y0: 0, x1: 5000, y1: 5000 })).toHaveLength(9);
  });
});

describe('hitTest on the real map-areas.svg', () => {
  const dir = dirname(fileURLToPath(import.meta.url));
  const real = parseAreaShapes(readFileSync(join(dir, '../games/sv/map-areas.svg'), 'utf8'));
  const box = (slug: string) => bounds(real.find((s) => s.slug === slug)!.rings);

  it.each(['cortondo', 'socarrattrail'])(
    'picks the enclave %s, not its parent, near its hole',
    (slug) => {
      // 5 screen px left of its leftmost corner at fit zoom: the parent has a hole there
      const [vx, vy] = real
        .find((s) => s.slug === slug)!
        .rings[0]!.reduce((a, p) => (p[0] < a[0] ? p : a));
      expect(hitTest(real, vx - 50, vy, 0.1)).toBe(slug);
    },
  );

  it('still gives the parent a tap clearly outside the hole', () => {
    const { x0, y0, y1 } = box('cortondo');
    expect(hitTest(real, x0 - 400, (y0 + y1) / 2, 0.1)).not.toBe('cortondo');
  });

  it('finds inletgrotto 10 screen px outside its box', () => {
    const { x1, y0, y1 } = box('inletgrotto');
    expect(hitTest(real, x1 + 100, (y0 + y1) / 2, 0.1)).toBe('inletgrotto');
  });
});
