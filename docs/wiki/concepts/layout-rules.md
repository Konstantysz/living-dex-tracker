---
title: Layout rules
type: concept
sources: [reference/build_sv_layout_reference.py, src/games/sv/config.ts, conversation:2026-11-16]
updated: 2026-11-22
---

# Layout rules

Rules that decide which entries exist and in which order. They must stay 1:1 with the reference.
(source: [SV layout script](../sources/sv-layout-script.md))

- **One slot per species.** A species appears once, in the first dex that has it
  (Paldea → Kitakami → Blueberry).
- **Forms follow their species.** Forms, females and regional forms stand directly after their
  species, also when they come from DLC. Examples: Johto Wooper ♂/♀ after Paldean Wooper (#53),
  Kanto Tauros after the three Paldean Tauros breeds, Alolan Diglett next to Diglett.
- **Order inside a group:** base (♂) → female → native forms → HOME regional forms → battle forms.
- **Merged lines:** Scatterbug + Spewpa + 20 Vivillon is one group. Flabébé, Floette and Florges
  (5 colours each, species by species) is one group.
- **Number label:** Paldea has no prefix (`145`), Kitakami `K12`, Blueberry `B43`. Entries outside
  every dex show the national number.
- **Extra box:** forms outside every dex (Galarian Articuno/Zapdos/Moltres, Pirouette Meloetta,
  Crowned Zacian/Zamazenta) are in their own box. It always starts a new box.
- **Exclusions:** Pikachu in caps, Arceus and similar are not listed in the config, so they do not
  appear.

## Entry kinds

| Kind   | Meaning                                  | Stripe colour   |
| ------ | ---------------------------------------- | --------------- |
| `base` | base form                                | none            |
| `fem`  | female with a different look             | `--fem`         |
| `form` | cosmetic or native form                  | `--form`        |
| `nreg` | regional form native to SV (DLC)         | `--reg`         |
| `reg`  | regional form only through HOME          | `--reg`         |
| `bat`  | battle form                              | `--bat`         |
| `alc`  | Alcremie forms (always shown)            | `--form`        |
| `xreg` | extra box, regional                      | `--reg`         |
| `xbat` | extra box, battle                        | `--bat`         |

Alcremie has 63 entries: 9 creams × 7 sweets. One is the base. The other 62 are kind `alc`.

## Related

- Packing into boxes: [Packing algorithm](packing-algorithm.md).
- Where the rules live as data: [SV game config](../entities/sv-game-config.md).
