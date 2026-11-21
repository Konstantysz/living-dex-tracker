import type { GameConfig } from '../../core/types';

// Forms read from the owner's screenshots of the in-game PC boxes (r/LegendsZA, 2026-11-21).
// Check: every box holds 30 slots and the dex range printed on it (see scripts/za-boxes.test.ts).
// Not in the data: Mega Evolutions (not stored in boxes) and the "+1" slot after #232.

const colours = ['yellow', 'orange', 'blue', 'white'];
const flabebeLine = Object.fromEntries(
  ['flabebe', 'floette', 'florges'].map((s) => [s, colours.map((c) => `${s}-${c}`)]),
);
const furfrou = 'heart star diamond debutante matron dandy la-reine kabuki pharaoh'.split(' ');

export const zaConfig: GameConfig = {
  id: 'za',
  name: 'Legends: Z-A',
  dexes: [
    { pokeapiId: 34, prefix: '', name: 'Lumiose' },
    { pokeapiId: 35, prefix: 'H', name: 'Hyperspace' },
  ],
  baseFormOverrides: { vivillon: 'vivillon-fancy' },
  forms: {
    vivillon: ['vivillon-garden', 'vivillon-tundra'],
    ...flabebeLine,
    floette: [...flabebeLine.floette!, 'floette-eternal'],
    raichu: ['raichu-alola'],
    stunfisk: ['stunfisk-galar'],
    furfrou: furfrou.map((x) => `furfrou-${x}`),
    sliggoo: ['sliggoo-hisui'],
    goodra: ['goodra-hisui'],
    avalugg: ['avalugg-hisui'],
    pumpkaboo: ['pumpkaboo-small', 'pumpkaboo-large', 'pumpkaboo-super'],
    gourgeist: ['gourgeist-small', 'gourgeist-large', 'gourgeist-super'],
    slowpoke: ['slowpoke-galar'],
    slowbro: ['slowbro-galar'],
    slowking: ['slowking-galar'],
    meowth: ['meowth-alola', 'meowth-galar'],
    persian: ['persian-alola'],
    farfetchd: ['farfetchd-galar'],
    marowak: ['marowak-alola'],
    rotom: ['rotom-heat', 'rotom-wash', 'rotom-frost', 'rotom-fan', 'rotom-mow'],
    tatsugiri: ['tatsugiri-droopy', 'tatsugiri-stretchy'],
    qwilfish: ['qwilfish-hisui'],
    yamask: ['yamask-galar'],
    squawkabilly: [
      'squawkabilly-blue-plumage',
      'squawkabilly-yellow-plumage',
      'squawkabilly-white-plumage',
    ],
    toxtricity: ['toxtricity-low-key'],
    'mr-mime': ['mr-mime-galar'],
  },
  nativeRegional: [],
  genderDifferences:
    `meganium roselia roserade magikarp gyarados pyroar pikachu raichu kadabra alakazam meditite medicham
    houndoom eevee numel camerupt hippopotas hippowdon gible gabite garchomp snover abomasnow scyther
    scizor heracross steelix venusaur milotic starly staravia staraptor gulpin swalot zubat golbat
    torchic combusken blaziken`.split(/\s+/),
  femaleForms: {
    meowstic: 'meowstic-female',
    indeedee: 'indeedee-female',
  },
  homeRegional: {},
  battleForms: {},
  extras: [],
  mergedLines: [
    ['scatterbug', 'spewpa', 'vivillon'],
    ['flabebe', 'floette', 'florges'],
  ],
  labelOverrides: {},
  formNames: {},
  toggleableForms: [],
  goForms: [],
  dlcForms: {},
  exclusives: {},
};
