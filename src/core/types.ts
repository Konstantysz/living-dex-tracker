/** Entry kind: drives the colour stripe and the toggle filters. */
export type Kind =
  'base' | 'fem' | 'form' | 'nreg' | 'reg' | 'bat' | 'alc' | 'go' | 'xreg' | 'xbat';

export type Gender = '' | '♂' | '♀';

/** One slot in a box. Shape is fixed by reference/sv-layout-golden.json. */
export interface DexEntry {
  /** Stable id (PokeAPI form identifier). Used as the "caught" key. */
  id: string;
  /** Dex number label: "145", "K12", "B43". null for entries outside every dex. */
  n: string | null;
  /** National dex number. */
  nat: number;
  name: string;
  /** Form label, "" when none. */
  form: string;
  g: Gender;
  k: Kind;
  /** Sprite path relative to the site root, e.g. "sprites/pokemon/906.png". */
  s: string;
  /** Dex prefix ("K", "B") of the DLC box this form is moved to. Only set on `GameLayout.dlc`. */
  d?: string;
}

/** A species (or merged evolution line) with all its entries in target order. */
export interface SpeciesGroup {
  sp: string;
  items: DexEntry[];
}

/** Output of the data generator for one game. */
export interface GameLayout {
  groups: SpeciesGroup[];
  extra: DexEntry[];
  /** Forms obtainable only in a DLC, taken out of their species group (see `dlcForms`). */
  dlc: DexEntry[];
}

export interface DexConfig {
  /** PokeAPI pokedex id. */
  pokeapiId: number;
  /** Number prefix: '' for the main dex, 'K', 'B' for DLC dexes. */
  prefix: string;
  name: string;
}

export interface GameConfig {
  id: string;
  name: string;
  /** Dexes in priority order. A species appears once, in the first dex that has it. */
  dexes: DexConfig[];
  /** species identifier -> pokemon_forms identifier used as its base form. */
  baseFormOverrides: Record<string, string>;
  /** species -> native forms shown right after base (+ female). Order matters. */
  forms: Record<string, string[]>;
  /** Form ids from `forms` that are regional forms native to the game (kind "nreg"). */
  nativeRegional: string[];
  /** Species with a visible gender difference: gets a "<base>-female" slot. */
  genderDifferences: string[];
  /** Species whose female is a separate form: species -> female form id. */
  femaleForms: Record<string, string>;
  /** species -> regional forms that exist only through HOME (kind "reg"). */
  homeRegional: Record<string, string[]>;
  /** species -> battle-only forms (kind "bat"). */
  battleForms: Record<string, string[]>;
  /** Extra box outside every dex: [form id, kind]. */
  extras: [string, 'xreg' | 'xbat'][];
  /** Evolution lines merged into one group (species identifiers, adjacent in dex order). */
  mergedLines: string[][];
  /** Raw title-cased form label -> display label. */
  labelOverrides: Record<string, string>;
  /** Form label forced per entry id (e.g. Johto Wooper, Kanto Tauros). */
  formNames: Record<string, string>;
  /** Species whose non-base forms are toggleable as a set (kind "alc"); label drops "-sweet". */
  toggleableForms: string[];
  /** Entry ids obtainable only through a link with another app (Vivillon + Pokémon GO): kind "go". */
  goForms: string[];
  /** Form id -> dex prefix: forms obtainable only in that DLC; shown at the end of its boxes. */
  dlcForms: Record<string, string>;
}
