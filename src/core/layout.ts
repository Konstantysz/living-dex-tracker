import type { DexEntry, GameLayout } from './types';

export const BOX_SIZE = 30;
export const BOX_COLS = 6;

export type Box = (DexEntry | null)[];

export interface LayoutOptions {
  /** Show all Alcremie-style toggleable forms. */
  alc: boolean;
  /** Show regional forms that exist only through HOME. */
  reg: boolean;
  /** Show battle forms. */
  bat: boolean;
  /** Add the box of forms outside every dex. */
  extra: boolean;
  /** Start a new box instead of splitting a group of 2..6 entries. */
  noSplit: boolean;
}

export const DEFAULT_OPTIONS: LayoutOptions = {
  alc: true,
  reg: true,
  bat: false,
  extra: false,
  noSplit: true,
};

/** Is the entry visible under the given toggles? */
export function keep(it: DexEntry, o: LayoutOptions): boolean {
  switch (it.k) {
    case 'alc':
      return o.alc;
    case 'reg':
      return o.reg;
    case 'bat':
      return o.bat;
    case 'xreg':
      return o.extra;
    case 'xbat':
      return o.extra && o.bat;
    default:
      return true;
  }
}

/**
 * Pure packing: slots run continuously; with `noSplit`, a group of 2..6 that does not fit in the
 * current box starts a new one. `extra` entries always start a fresh box.
 */
export function packBoxes(
  groups: DexEntry[][],
  { noSplit, extra = [] }: { noSplit: boolean; extra?: DexEntry[] },
): Box[] {
  const boxes: Box[] = [];
  let cur: Box = [];
  const flush = () => {
    if (!cur.length) return;
    while (cur.length < BOX_SIZE) cur.push(null);
    boxes.push(cur);
    cur = [];
  };
  const place = (g: DexEntry[]) => {
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
  if (extra.length) {
    flush();
    extra.forEach((e) => place([e]));
  }
  flush();
  return boxes;
}

/** Filters a game layout by the toggles and packs it into boxes. */
export function layoutBoxes(layout: GameLayout, o: LayoutOptions): Box[] {
  return packBoxes(
    layout.groups.map((g) => g.items.filter((it) => keep(it, o))),
    { noSplit: o.noSplit, extra: o.extra ? layout.extra.filter((it) => keep(it, o)) : [] },
  );
}
