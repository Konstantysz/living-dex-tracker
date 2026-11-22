import { DEFAULT_OPTIONS, type LayoutOptions } from './layout';
import type { GameConfig } from './types';

export interface AppOptions extends LayoutOptions {
  /** Dim caught sprites. */
  dim: boolean;
  /** Game version of the player: a key of `GameConfig.exclusives`, '' for both. Read it with `gameVersion`. */
  version: string;
}

export const DEFAULT_APP_OPTIONS: AppOptions = { ...DEFAULT_OPTIONS, dim: false, version: '' };

/** The game version of the player (a key of `exclusives`), or null for both versions. */
export const gameVersion = (exclusives: GameConfig['exclusives'], o: AppOptions): string | null =>
  Object.hasOwn(exclusives, o.version) ? o.version : null;

// Keys written by the single-file prototype. Read-only fallback, SV only.
const LEGACY: Record<string, { caught: string; opts: string }> = {
  sv: { caught: 'paldea-living-dex-v1', opts: 'sv-living-dex-opt-v2' },
};
const LEGACY_OPT_NAMES: Record<string, keyof AppOptions> = { optDim: 'dim' };

const caughtKey = (gameId: string) => `ldt:${gameId}:caught`;
const optsKey = (gameId: string) => `ldt:${gameId}:opts`;

function read(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? undefined : JSON.parse(raw);
  } catch {
    return undefined;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: the app keeps working in memory */
  }
}

const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === 'string');

export function loadCaught(gameId: string): Set<string> {
  const v = read(caughtKey(gameId)) ?? (LEGACY[gameId] && read(LEGACY[gameId].caught));
  return new Set(isStringArray(v) ? v : []);
}

export const saveCaught = (gameId: string, caught: Set<string>) =>
  write(caughtKey(gameId), [...caught]);

export function loadOptions(gameId: string): AppOptions {
  const out = { ...DEFAULT_APP_OPTIONS };
  const apply = (src: unknown, names: (k: string) => keyof AppOptions | undefined) => {
    if (!src || typeof src !== 'object') return;
    for (const [k, v] of Object.entries(src)) {
      const name = names(k);
      if (name && typeof v === typeof out[name]) Object.assign(out, { [name]: v });
    }
  };
  const current = read(optsKey(gameId));
  if (current !== undefined)
    apply(current, (k) => (k in out ? (k as keyof AppOptions) : undefined));
  else if (LEGACY[gameId]) apply(read(LEGACY[gameId].opts), (k) => LEGACY_OPT_NAMES[k]);
  return out;
}

export const saveOptions = (gameId: string, o: AppOptions) => write(optsKey(gameId), o);

/**
 * Do the saved options still hide Alcremie? The `alc` option was removed (issue #20). The
 * caller shows a notice once, then calls `saveOptions`, which drops the old key.
 */
export function hidAlcremie(gameId: string): boolean {
  const current = read(optsKey(gameId));
  const [src, key] =
    current !== undefined
      ? [current, 'alc']
      : [LEGACY[gameId] && read(LEGACY[gameId].opts), 'optAlc'];
  return !!src && typeof src === 'object' && (src as Record<string, unknown>)[key] === false;
}

/** Backup code: base64 of the UTF-8 JSON array of ids (same as the prototype). */
export function exportCode(caught: Set<string>): string {
  const bytes = new TextEncoder().encode(JSON.stringify([...caught]));
  return btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(''));
}

/** Returns the caught set, or null when the code is invalid. */
export function importCode(code: string): Set<string> | null {
  try {
    const bin = atob(code.trim());
    const json = new TextDecoder('utf-8', { fatal: true }).decode(
      Uint8Array.from(bin, (c) => c.charCodeAt(0)),
    );
    const v: unknown = JSON.parse(json);
    return isStringArray(v) ? new Set(v) : null;
  } catch {
    return null;
  }
}
