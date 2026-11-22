import type { DexEntry, GameLayout } from './types';

export const BOX_SIZE = 30;
export const BOX_COLS = 6;

export type Box = (DexEntry | null)[];

export interface LayoutOptions {
  /** Show Vivillon patterns that need Pokémon GO. */
  go: boolean;
}

export const DEFAULT_OPTIONS: LayoutOptions = { go: false };

/**
 * Is the entry visible under the given toggles? HOME-only regional and battle forms cannot be
 * stored in the game's PC, so they are never shown (the data stays in layout.json).
 */
export function keep(it: DexEntry, o: LayoutOptions): boolean {
  switch (it.k) {
    case 'go':
      return o.go;
    default:
      return inPc(it);
  }
}

/** Can the game's PC store the entry? HOME-only regional and battle forms cannot. */
export const inPc = (it: DexEntry) => !['reg', 'bat', 'xreg', 'xbat'].includes(it.k);

/** Dex prefix of an entry: "" for the main dex, "K", "B" for DLC dexes. */
export const dexOf = (it: DexEntry) => (it.d ?? it.n)?.match(/^[A-Z]/)?.[0] ?? '';
/** Number inside the dex ("K5" -> 5); Infinity when there is none. */
const numOf = (it: DexEntry) => Number((it.d ?? it.n)?.match(/\d+/)?.[0] ?? Infinity);

/**
 * Pure packing: slots run continuously, and a species can flow across a box boundary. A species
 * from another dex (prefix K, B) always starts a fresh box.
 */
export function packBoxes(groups: DexEntry[][]): Box[] {
  const boxes: Box[] = [];
  let cur: Box = [];
  const flush = () => {
    if (!cur.length) return;
    while (cur.length < BOX_SIZE) cur.push(null);
    boxes.push(cur);
    cur = [];
  };
  let dex = '';
  const place = (g: DexEntry[]) => {
    if (!g.length) return;
    const p = dexOf(g[0]!);
    if (p !== dex) flush();
    dex = p;
    for (const it of g) {
      cur.push(it);
      if (cur.length === BOX_SIZE) {
        boxes.push(cur);
        cur = [];
      }
    }
  };
  groups.forEach(place);
  flush();
  return boxes;
}

/**
 * Filters a game layout by the toggles and packs it into boxes. DLC-only forms (`layout.dlc`) go
 * right after the last group of their DLC dex.
 */
export function layoutBoxes(layout: GameLayout, o: LayoutOptions): Box[] {
  const groups = layout.groups.map((g) => g.items.filter((it) => keep(it, o)));
  for (const d of new Set(layout.dlc.map((it) => it.d))) {
    const forms = layout.dlc.filter((it) => it.d === d && keep(it, o));
    const [first] = forms;
    if (!first) continue;
    // before the first group of that dex with a higher number, else at the end of the dex
    const inDex = (g: DexEntry[]) => g[0] && dexOf(g[0]) === dexOf(first);
    const next = groups.findIndex((g) => inDex(g) && numOf(g[0]!) > numOf(first));
    const at = next >= 0 ? next : groups.map(inDex).lastIndexOf(true) + 1;
    groups.splice(at, 0, forms);
  }
  return packBoxes(groups);
}
