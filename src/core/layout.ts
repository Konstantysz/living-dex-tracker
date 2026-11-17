import type { DexEntry, GameLayout } from './types';

export const BOX_SIZE = 30;
export const BOX_COLS = 6;

export type Box = (DexEntry | null)[];

export interface LayoutOptions {
  /** Show all Alcremie-style toggleable forms. */
  alc: boolean;
  /** Show Vivillon patterns that need Pokémon GO. */
  go: boolean;
  /** Start a new box instead of splitting a group of 2..6 entries. */
  noSplit: boolean;
}

export const DEFAULT_OPTIONS: LayoutOptions = {
  alc: true,
  go: false,
  noSplit: false,
};

/**
 * Is the entry visible under the given toggles? HOME-only regional and battle forms cannot be
 * stored in the game's PC, so they are never shown (the data stays in layout.json).
 */
export function keep(it: DexEntry, o: LayoutOptions): boolean {
  switch (it.k) {
    case 'alc':
      return o.alc;
    case 'go':
      return o.go;
    case 'reg':
    case 'bat':
    case 'xreg':
    case 'xbat':
      return false;
    default:
      return true;
  }
}

/** Dex prefix of an entry: "" for the main dex, "K", "B" for DLC dexes. */
const dexOf = (it: DexEntry) => it.d ?? it.n?.match(/^[A-Z]/)?.[0] ?? '';

/**
 * Pure packing: slots run continuously; with `noSplit`, a group of 2..6 that does not fit in the
 * current box starts a new one. A group from another dex (prefix K, B) always starts a fresh box.
 */
export function packBoxes(groups: DexEntry[][], { noSplit }: { noSplit: boolean }): Box[] {
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
    if (noSplit && g.length > 1 && g.length <= 6 && cur.length + g.length > BOX_SIZE) flush();
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
  for (const p of new Set(layout.dlc.map((it) => it.d))) {
    const forms = layout.dlc.filter((it) => it.d === p && keep(it, o));
    const last = groups.map((g) => g[0] && dexOf(g[0]) === p).lastIndexOf(true);
    groups.splice(last + 1, 0, forms);
  }
  return packBoxes(groups, { noSplit: o.noSplit });
}
