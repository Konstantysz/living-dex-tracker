import { beforeEach, describe, expect, test } from 'vitest';
import { findGame } from '../games';
import {
  exportCode,
  gameVersion,
  importCode,
  loadCaught,
  loadOptions,
  saveCaught,
  saveOptions,
} from './storage';

beforeEach(() => localStorage.clear());

describe('backup code', () => {
  test('imports a code produced by the prototype', () => {
    // btoa(unescape(encodeURIComponent(JSON.stringify(['sprigatito','wooper-female']))))
    const code = btoa(JSON.stringify(['sprigatito', 'wooper-female']));
    expect(importCode(code)).toEqual(new Set(['sprigatito', 'wooper-female']));
  });

  test('round-trips, including non-ASCII ids', () => {
    const s = new Set(['a', 'flabebe-orange', 'pokémon']);
    expect(importCode(exportCode(s))).toEqual(s);
  });

  test('rejects invalid codes', () => {
    for (const bad of ['', '%%%', btoa('not json'), btoa('{"a":1}'), btoa('[1,2]')])
      expect(importCode(bad), bad).toBeNull();
  });
});

describe('per-game persistence', () => {
  test('caught and options are kept per game', () => {
    saveCaught('sv', new Set(['x']));
    saveCaught('other', new Set(['y']));
    expect(loadCaught('sv')).toEqual(new Set(['x']));
    expect(loadCaught('other')).toEqual(new Set(['y']));
    saveOptions('sv', { ...loadOptions('sv'), dim: true });
    expect(loadOptions('sv').dim).toBe(true);
    expect(loadOptions('other').dim).toBe(false);
  });

  test('game version defaults to both and rejects unknown keys and wrong types', () => {
    const sv = findGame('sv').config.exclusives;
    expect(gameVersion(sv, loadOptions('sv'))).toBeNull();
    saveOptions('sv', { ...loadOptions('sv'), version: 'V' });
    expect(gameVersion(sv, loadOptions('sv'))).toBe('V');
    expect(gameVersion(findGame('za').config.exclusives, loadOptions('sv'))).toBeNull();
    localStorage.setItem('ldt:sv:opts', JSON.stringify({ version: true, dim: 'x' }));
    expect(loadOptions('sv')).toMatchObject({ version: '', dim: false });
  });

  test('migrates prototype keys for sv only', () => {
    localStorage.setItem('paldea-living-dex-v1', JSON.stringify(['a']));
    localStorage.setItem(
      'sv-living-dex-opt-v2',
      JSON.stringify({ optBat: true, optNoSplit: true }),
    );
    expect(loadCaught('sv')).toEqual(new Set(['a']));
    expect(loadCaught('other').size).toBe(0);
    expect(loadOptions('sv')).toMatchObject({ noSplit: true, alc: true });
  });

  test('works when localStorage throws', () => {
    const orig = Storage.prototype.getItem;
    Storage.prototype.getItem = () => {
      throw new Error('blocked');
    };
    try {
      expect(loadCaught('sv').size).toBe(0);
      expect(loadOptions('sv').alc).toBe(true);
    } finally {
      Storage.prototype.getItem = orig;
    }
  });
});
