import { setIds, sectionIds } from './entry';
import { dexOf, inPc, type Box } from './layout';
import type { DexEntry, GameConfig, GameLayout } from './types';

/**
 * An award computed from the caught set. It is never stored. Badges with the same `title` and an
 * `item` form a collection (e.g. "Pełny box" with one badge per box).
 */
export interface Badge {
  /** React key and toast diff key. Not stored. */
  id: string;
  title: string;
  /** Names one badge of a collection, e.g. "Box 3". */
  item?: string;
  info: string;
  /** Emoji placeholder until the badge images exist. */
  image: string;
  /** Shows as "???" with no info until earned. */
  isHidden?: boolean;
  /** Entry ids and collectible ids. */
  members: string[];
  /** Caught members to earn it. Default: all visible members. */
  need?: number;
  /** In the "DLC" section: it needs at least one entry outside the main dex. */
  dlc: boolean;
  /** Some members are version exclusives (Union Circle or a trade). */
  trade: boolean;
}

export interface BadgeProgress {
  got: number;
  need: number;
  earned: boolean;
  /** Options hide too many members, so the badge cannot be earned now. */
  off: boolean;
  /** Members that an option hides. They do not count. */
  hidden: number;
}

type Draft = Omit<Badge, 'dlc' | 'trade'>;

// Badge texts are drafts. The owner decides the final texts in review (issue #12).
/** All badges of a game. `boxes` is the current layout, for "Pełny box". */
export function gameBadges(config: GameConfig, layout: GameLayout, boxes: Box[]): Badge[] {
  // Every entry that the game's PC can store, whatever the options.
  const pc = [...layout.groups.flatMap((g) => g.items), ...layout.dlc].filter(inPc);
  const byId = new Map(pc.map((it) => [it.id, it]));
  // Collectibles have no dex. They are base game.
  const isBase = (id: string) => {
    const it = byId.get(id);
    return !it || dexOf(it) === '';
  };
  const ids = (list: DexEntry[]) => list.map((it) => it.id);
  const make = (d: Draft, dlc: boolean): Badge => ({
    ...d,
    id: dlc ? `${d.id}@dlc` : d.id,
    dlc,
    // A count badge does not need every member, so it does not need a trade.
    trade: !d.need && d.members.some((id) => byId.get(id)?.v),
  });
  // Base/DLC split: a list with members in both gives a base badge (main-dex members) and a DLC
  // badge (all). A count badge is DLC only when the main-dex members are not enough.
  const split = (d: Draft): Badge[] => {
    const base = d.members.filter(isBase);
    if (!d.members.length) return [];
    if (d.need) return [make(d, base.length < d.need)];
    if (base.length === d.members.length) return [make(d, false)];
    return [...(base.length ? [make({ ...d, members: base }, false)] : []), make(d, true)];
  };
  const bySpecies = new Map<number, DexEntry[]>();
  for (const it of pc) bySpecies.set(it.nat, [...(bySpecies.get(it.nat) ?? []), it]);
  const species = [...bySpecies.values()];
  const exclusives = Object.values(config.exclusives).map((e) => e.name);

  const drafts: Draft[] = [
    ...config.dexes.map((dex) => ({
      id: `dex:${dex.prefix}`,
      title: `Pokédex ${dex.name}`,
      info: 'Forma podstawowa każdego gatunku z tego Pokédexu.',
      image: '📕',
      members: ids(pc.filter((it) => it.k === 'base' && dexOf(it) === dex.prefix)),
    })),
    ...(
      [
        [100, '🥉'],
        [250, '🥈'],
        [500, '🥇'],
      ] as const
    )
      .filter(([n]) => n < pc.length)
      .map(([n, image]) => ({
        id: `count:${n}`,
        title: `${n} wpisów`,
        info: `${n} złapanych wpisów w PC.`,
        image,
        members: ids(pc),
        need: n,
      })),
    {
      id: 'all',
      title: 'Living Dex',
      info: 'Każdy wpis w PC.',
      image: '🏆',
      members: ids(pc),
    },
    ...boxes.map((box, i) => ({
      id: `box:${i + 1}`,
      title: 'Pełny box',
      item: `Box ${i + 1}`,
      info: 'Każdy slot boxu złapany.',
      image: '📦',
      members: box.flatMap((it) => (it ? [it.id] : [])),
    })),
    {
      id: 'female',
      title: 'Panie przodem',
      info: 'Każda samica, która wygląda inaczej niż samiec.',
      image: '♀️',
      isHidden: true,
      members: ids(pc.filter((it) => it.g === '♀')),
    },
    // A female entry is not a form of its own.
    ...species
      .map((list) => list.filter((it) => it.g !== '♀'))
      .filter((list) => list.length >= 4)
      .map((list) => ({
        id: `forms:${list[0]!.nat}`,
        title: 'Mistrz form',
        item: list[0]!.name,
        info: 'Każda forma gatunku z 4 lub więcej formami.',
        image: '🎭',
        members: ids(list),
      })),
    {
      id: 'regional',
      title: 'Obieżyświat',
      info: 'Forma podstawowa i regionalna każdego gatunku z formą regionalną.',
      image: '🧭',
      members: ids(
        species
          .filter((list) => list.some((it) => it.k === 'nreg'))
          .flat()
          .filter((it) => it.k === 'base' || it.k === 'nreg'),
      ),
    },
    {
      id: 'exclusives',
      title: 'Obie wersje',
      info: `Ekskluzywy ${exclusives.join(' i ')} w jednym PC.`,
      image: '🔀',
      members: ids(pc.filter((it) => it.v)),
    },
    ...(config.collectibles ?? []).flatMap((set) => [
      {
        id: `set:${set.id}`,
        title: set.badgeTitle ?? set.name,
        info: `Wszystkie: ${set.name}.`,
        image: '🗝️',
        members: setIds(set),
      },
      ...set.sections.map((sec) => ({
        id: `set:${set.id}:${sec.id}`,
        title: set.badgeTitle ?? set.name,
        item: sec.name,
        info: `Wszystkie: ${set.name}, jedna sekcja.`,
        image: '🗝️',
        members: sectionIds(set.id, sec),
      })),
    ]),
  ];
  return drafts.flatMap(split);
}

/** Progress of a badge. Only visible members count. */
export function badgeProgress(b: Badge, caught: Set<string>, visible: Set<string>): BadgeProgress {
  const shown = b.members.filter((id) => visible.has(id));
  const need = b.need ?? shown.length;
  const got = shown.filter((id) => caught.has(id)).length;
  return {
    got: Math.min(got, need),
    need,
    earned: !!shown.length && got >= need,
    off: !shown.length || shown.length < need,
    hidden: b.members.length - shown.length,
  };
}

/** Badges that are earned in `after` and not in `before`. */
export const newlyEarned = (
  badges: Badge[],
  before: Set<string>,
  after: Set<string>,
  visible: Set<string>,
) =>
  badges.filter(
    (b) => badgeProgress(b, after, visible).earned && !badgeProgress(b, before, visible).earned,
  );

/** Toast line: "🏅 Pełny box: Box 3", or "🏅 +3 odznaki" for more than one. "" for none. */
export function badgeToast(earned: Badge[]): string {
  const [first] = earned;
  if (!first) return '';
  if (earned.length === 1) return `🏅 ${first.title}${first.item ? `: ${first.item}` : ''}`;
  const n = earned.length;
  const few = n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14);
  return `🏅 +${n} ${few ? 'odznaki' : 'odznak'}`;
}
