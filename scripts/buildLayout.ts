import type {
  DexEntry,
  GameConfig,
  GameLayout,
  Gender,
  Kind,
  SpeciesGroup,
} from '../src/core/types';
import type { Row, Tables } from './pokeapi';

/** Python str.title(): capitalise every letter that follows a non-letter. */
const title = (s: string) =>
  s.toLowerCase().replace(/(^|[^a-z])([a-z])/g, (_, a, b) => a + b.toUpperCase());
const dashTitle = (s: string) => title(s.replaceAll('-', ' '));

/**
 * Pure port of reference/build_sv_layout_reference.py, driven by a GameConfig.
 * Returns the layout plus every sprite path it references.
 */
export function buildLayout(cfg: GameConfig, t: Tables): GameLayout & { sprites: string[] } {
  const byKey = (rows: Row[], key: string) => new Map(rows.map((r) => [r[key] as string, r]));
  const forms = byKey(t.pokemon_forms, 'identifier');
  const pk = byKey(t.pokemon, 'id');
  const sp = byKey(t.pokemon_species, 'id');
  const spName = new Map(
    t.pokemon_species_names
      .filter((r) => r.local_language_id === '9')
      .map((r) => [r.pokemon_species_id as string, r.name as string]),
  );
  const get = <V>(m: Map<string, V>, k: string, what: string): V => {
    const v = m.get(k);
    if (v === undefined) throw new Error(`Unknown ${what}: ${k}`);
    return v;
  };

  // Species order: each species once, in the first dex that has it.
  const known = new Set(t.pokedexes.map((r) => r.id));
  const order: { prefix: string; num: number; sid: string }[] = [];
  const seen = new Set<string>();
  for (const dex of cfg.dexes) {
    if (!known.has(String(dex.pokeapiId))) throw new Error(`Unknown pokedex ${dex.pokeapiId}`);
    const rows = t.pokemon_dex_numbers
      .filter((r) => r.pokedex_id === String(dex.pokeapiId))
      .map((r) => ({ num: Number(r.pokedex_number), sid: r.species_id as string }))
      .sort((a, b) => a.num - b.num || (a.sid < b.sid ? -1 : a.sid > b.sid ? 1 : 0));
    for (const { num, sid } of rows) {
      if (seen.has(sid)) continue;
      seen.add(sid);
      order.push({ prefix: dex.prefix, num, sid });
    }
  }

  const defaultSlugCache = new Map<string, string>();
  const defaultSlug = (sid: string): string => {
    const hit = defaultSlugCache.get(sid);
    if (hit) return hit;
    const ident = get(sp, sid, 'species').identifier as string;
    let slug = cfg.baseFormOverrides[ident];
    if (!slug) {
      const p = t.pokemon.find((x) => x.species_id === sid && x.is_default === '1');
      const f = p && t.pokemon_forms.find((x) => x.pokemon_id === p.id && x.is_default === '1');
      if (!f) throw new Error(`No default form for ${ident}`);
      slug = f.identifier as string;
    }
    defaultSlugCache.set(sid, slug);
    return slug;
  };

  const sprites = new Set<string>();
  /** `exclusives` items that marked at least one entry. Any other item is a typo or marks nothing. */
  const marked = new Set<string>();
  type Work = DexEntry & { fs: string };
  const entry = (slug: string, num: string | null, kind: Kind): Work => {
    const fem = slug.endsWith('-female') && !forms.has(slug);
    const fslug = fem ? slug.slice(0, -7) : slug;
    const f = get(forms, fslug, 'form');
    const pid = Number(f.pokemon_id);
    const fi = f.form_identifier as string;
    let path =
      pid < 10000 && fi && f.is_default === '0'
        ? `sprites/pokemon/${pid}-${fi}.png`
        : `sprites/pokemon/${pid}.png`;
    if (fem) path = path.replace('sprites/pokemon/', 'sprites/pokemon/female/');
    const sid = get(pk, String(pid), 'pokemon').species_id as string;
    let label =
      fi && fi !== 'male' && fi !== 'female' && slug !== defaultSlug(sid) ? dashTitle(fi) : '';
    if (cfg.toggleableForms.some((s) => fslug.startsWith(s)))
      label = fi.replace('-sweet', '').split('-').map(title).join(' ');
    sprites.add(path);
    const g: Gender = fem || fi === 'female' ? '♀' : fi === 'male' ? '♂' : '';
    const ident = get(sp, sid, 'species').identifier as string;
    // a species name ("vulpix") is also the id of the base entry: the species rule wins
    const marks = (s: string) => (s === ident ? cfg.dlcForms[slug] === undefined : s === slug);
    const v = Object.keys(cfg.exclusives).find((k) => cfg.exclusives[k]!.species.some(marks));
    for (const s of v ? cfg.exclusives[v]!.species.filter(marks) : []) marked.add(s);
    return {
      ...(v ? { v } : {}),
      id: slug,
      fs: fslug,
      n: num,
      nat: Number(sid),
      name: get(spName, sid, 'species name'),
      form: cfg.labelOverrides[label] ?? label,
      g,
      k: kind,
      s: path,
    };
  };

  const native = new Set(cfg.nativeRegional);
  const female = new Set(cfg.genderDifferences);
  let groups: (Omit<SpeciesGroup, 'items'> & { items: Work[] })[] = [];
  const moved: Work[] = [];
  for (const { prefix, num, sid } of order) {
    const ident = get(sp, sid, 'species').identifier as string;
    const tag = prefix + String(num);
    const base = defaultSlug(sid);
    const g = [entry(base, tag, 'base')];
    if (female.has(ident)) g.push(entry(`${base}-female`, tag, 'fem'));
    const ff = cfg.femaleForms[ident];
    if (ff) g.push(entry(ff, tag, 'fem'));
    for (const a of cfg.forms[ident] ?? [])
      g.push(entry(a, tag, native.has(a) ? 'nreg' : a.endsWith('-female') ? 'fem' : 'form'));
    for (const a of cfg.homeRegional[ident] ?? []) g.push(entry(a, tag, 'reg'));
    for (const a of cfg.battleForms[ident] ?? []) g.push(entry(a, tag, 'bat'));
    // mark the male counterpart of every female
    for (const it of g) {
      if (it.g !== '♀') continue;
      for (const o of g) {
        if (o.fs === it.fs && o !== it && !o.g) o.g = '♂';
        if (it.fs.endsWith('-female') && o.fs === it.fs.slice(0, -7).replace('-female', '') && !o.g)
          o.g = '♂';
      }
    }
    if (ff) g[0]!.g = '♂';
    if (g.some((i) => i.k === 'form' || i.k === 'nreg') && !g[0]!.form) {
      const fi = get(forms, g[0]!.id, 'form').form_identifier as string;
      g[0]!.form = fi ? (cfg.labelOverrides[dashTitle(fi)] ?? dashTitle(fi)) : '';
    }
    // a form already sits in its own dex when the species' group is there
    const away = (i: Work) => cfg.dlcForms[i.id] !== undefined && cfg.dlcForms[i.id] !== prefix;
    const keepIn = g.filter((i) => !away(i));
    for (const i of g.filter(away)) {
      const p = cfg.dlcForms[i.id]!;
      const dex = cfg.dexes.find((d) => d.prefix === p);
      const row = t.pokemon_dex_numbers.find(
        (r) => r.pokedex_id === String(dex?.pokeapiId) && r.species_id === sid,
      );
      moved.push(Object.assign(i, { d: p + (row ? String(row.pokedex_number) : '') }));
    }
    groups.push({ sp: ident, items: keepIn });
  }

  for (const line of cfg.mergedLines) {
    const idx = groups.flatMap((gr, i) => (line.includes(gr.sp) ? [i] : []));
    const first = idx[0];
    if (first === undefined || idx.some((v, i) => v !== first + i))
      throw new Error(`Merged line is not adjacent: ${line.join(',')}`);
    const merged = { sp: line.join('+'), items: idx.flatMap((i) => groups[i]!.items) };
    groups = [...groups.slice(0, first), merged, ...groups.slice(first + idx.length)];
  }

  for (const i of moved) if (cfg.formNames[i.id]) i.form = cfg.formNames[i.id]!;
  for (const g of groups)
    for (const i of g.items) {
      if (cfg.formNames[i.id]) i.form = cfg.formNames[i.id]!;
      if (cfg.toggleableForms.some((s) => i.id.startsWith(s))) i.k = i.k === 'base' ? i.k : 'alc';
      if (cfg.goForms.includes(i.id)) i.k = 'go';
    }

  const strip = (w: Work): DexEntry => {
    const { fs, ...rest } = w;
    void fs;
    return rest;
  };
  const extra = cfg.extras.map(([s, k]) => entry(s, null, k));
  const unknown = Object.values(cfg.exclusives)
    .flatMap((e) => e.species)
    .filter((s) => !marked.has(s));
  if (unknown.length) throw new Error(`Exclusives that mark no entry: ${unknown.join(', ')}`);
  return {
    groups: groups.map((g) => ({ sp: g.sp, items: g.items.map(strip) })),
    extra: extra.map(strip),
    dlc: moved.map(strip),
    sprites: [...sprites].sort(),
  };
}
