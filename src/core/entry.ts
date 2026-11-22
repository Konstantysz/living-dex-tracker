import type { CollectibleSet, DexConfig, DexEntry } from './types';

// Collectible ids share the caught set with entry ids (ADR 0002). Entry ids never contain ":".
export const collectibleId = (set: string, section: string, n: number) => `${set}:${section}-${n}`;
/** Ids of all collectibles in one section of a set, from 1 to `count`. */
export const sectionIds = (set: string, sec: { id: string; count: number }) =>
  Array.from({ length: sec.count }, (_, i) => collectibleId(set, sec.id, i + 1));
/** Ids of all collectibles in a set. */
export const setIds = (set: CollectibleSet) =>
  set.sections.flatMap((sec) => sectionIds(set.id, sec));
export const isEntryId = (id: string) => !id.includes(':');
/** Caught entries only, without collectibles. */
export const entryCount = (caught: Set<string>) => [...caught].filter(isEntryId).length;

export const entryLabel = (it: DexEntry) =>
  it.name + (it.form ? ` (${it.form})` : '') + (it.g ? ` ${it.g}` : '');

/** "Kitakami #12", "Paldea #145" or "nat. #7" for entries outside every dex. */
export function numberText(it: DexEntry, dexes: DexConfig[]): string {
  if (!it.n) return `nat. #${it.nat}`;
  const dex =
    dexes.find((d) => d.prefix && it.n!.startsWith(d.prefix)) ?? dexes.find((d) => !d.prefix);
  const num = dex?.prefix ? it.n.slice(dex.prefix.length) : it.n;
  return `${dex?.name ?? ''} #${num}`;
}

/** Search by name (with form) or exact number: "145", "#145", "K12", "b43". */
export function matches(it: DexEntry, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return false;
  return (
    entryLabel(it).toLowerCase().includes(q) || String(it.n).toLowerCase() === q.replace('#', '')
  );
}

/** Text export: box by box, 5 rows of 6 entries. */
export function layoutAsText(boxes: (DexEntry | null)[][]): string {
  const lines: string[] = [];
  boxes.forEach((b, i) => {
    lines.push(`=== Box ${i + 1} ===`);
    for (let r = 0; r < 5; r++)
      lines.push(
        b
          .slice(r * 6, r * 6 + 6)
          .map((it) => (it ? `${it.n ?? 'nat' + it.nat} ${entryLabel(it)}` : '—'))
          .join(' | '),
      );
    lines.push('');
  });
  return lines.join('\n');
}
