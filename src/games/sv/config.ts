import type { GameConfig } from '../../core/types';

// Pikachu in caps, Arceus and similar are excluded simply by not being listed below.

const creams =
  'vanilla-cream ruby-cream matcha-cream mint-cream lemon-cream salted-cream ruby-swirl caramel-swirl rainbow-swirl'.split(
    ' ',
  );
const sweets = 'berry clover flower love ribbon star strawberry'.split(' ');
const vivillon =
  'icy-snow polar tundra continental garden elegant modern marine archipelago high-plains sandstorm river monsoon savanna sun ocean jungle fancy poke-ball'.split(
    ' ',
  );
const colours = ['yellow', 'orange', 'blue', 'white'];
const flabebeLine = Object.fromEntries(
  ['flabebe', 'floette', 'florges'].map((s) => [s, colours.map((c) => `${s}-${c}`)]),
);

export const svConfig: GameConfig = {
  id: 'sv',
  name: 'Scarlet/Violet',
  dexes: [
    { pokeapiId: 31, prefix: '', name: 'Paldea' },
    { pokeapiId: 32, prefix: 'K', name: 'Kitakami' },
    { pokeapiId: 33, prefix: 'B', name: 'Blueberry' },
  ],
  baseFormOverrides: {
    wooper: 'wooper-paldea',
    tauros: 'tauros-paldea-combat-breed',
    minior: 'minior-red',
    alcremie: 'alcremie-vanilla-cream-berry-sweet',
  },
  forms: {
    maushold: ['maushold-family-of-three'],
    lycanroc: ['lycanroc-midnight', 'lycanroc-dusk'],
    oricorio: ['oricorio-pom-pom', 'oricorio-pau', 'oricorio-sensu'],
    squawkabilly: [
      'squawkabilly-blue-plumage',
      'squawkabilly-yellow-plumage',
      'squawkabilly-white-plumage',
    ],
    basculin: ['basculin-blue-striped', 'basculin-white-striped'],
    dudunsparce: ['dudunsparce-three-segment'],
    deerling: ['deerling-summer', 'deerling-autumn', 'deerling-winter'],
    sawsbuck: ['sawsbuck-summer', 'sawsbuck-autumn', 'sawsbuck-winter'],
    toxtricity: ['toxtricity-low-key'],
    tauros: ['tauros-paldea-blaze-breed', 'tauros-paldea-aqua-breed', 'tauros'],
    wooper: ['wooper', 'wooper-female'],
    sinistea: ['sinistea-antique'],
    polteageist: ['polteageist-antique'],
    shellos: ['shellos-east'],
    gastrodon: ['gastrodon-east'],
    tatsugiri: ['tatsugiri-droopy', 'tatsugiri-stretchy'],
    vivillon: vivillon.filter((x) => x !== 'poke-ball').map((x) => `vivillon-${x}`),
    rotom: ['rotom-heat', 'rotom-wash', 'rotom-frost', 'rotom-fan', 'rotom-mow'],
    ...flabebeLine,
    ursaluna: ['ursaluna-bloodmoon'],
    poltchageist: ['poltchageist-artisan'],
    sinistcha: ['sinistcha-masterpiece'],
    minior: 'orange yellow green blue indigo violet'.split(' ').map((c) => `minior-${c}`),
    // the first combination (vanilla-cream-berry) is the base form
    alcremie: creams.flatMap((c) => sweets.map((s) => `alcremie-${c}-${s}-sweet`)).slice(1),
    // regional forms native to SV (Kitakami / Blueberry)
    diglett: ['diglett-alola'],
    dugtrio: ['dugtrio-alola'],
    grimer: ['grimer-alola'],
    muk: ['muk-alola'],
    slowpoke: ['slowpoke-galar'],
    slowbro: ['slowbro-galar'],
    slowking: ['slowking-galar'],
    geodude: ['geodude-alola'],
    graveler: ['graveler-alola'],
    golem: ['golem-alola'],
    sandshrew: ['sandshrew-alola'],
    sandslash: ['sandslash-alola'],
    vulpix: ['vulpix-alola'],
    ninetales: ['ninetales-alola'],
    // Hisuian Growlithe is a gift in Kitakami (Perrin); Arcanine evolves from it (Fire Stone)
    growlithe: ['growlithe-hisui'],
    arcanine: ['arcanine-hisui'],
    // native in Blueberry (Serebii blueberrypokedex)
    exeggutor: ['exeggutor-alola'],
    qwilfish: ['qwilfish-hisui'],
  },
  nativeRegional: [
    'wooper',
    'tauros',
    'diglett-alola',
    'dugtrio-alola',
    'grimer-alola',
    'muk-alola',
    'slowpoke-galar',
    'slowbro-galar',
    'slowking-galar',
    'geodude-alola',
    'graveler-alola',
    'golem-alola',
    'sandshrew-alola',
    'sandslash-alola',
    'vulpix-alola',
    'ninetales-alola',
    'exeggutor-alola',
    'qwilfish-hisui',
    'growlithe-hisui',
    'arcanine-hisui',
    'wooper-female',
  ],
  genderDifferences:
    `houndoom kricketot kricketune combee buizel floatzel hypno pikachu raichu sudowoodo shinx luxio luxray starly staravia staraptor donphan gible gabite garchomp magikarp gyarados gulpin swalot numel camerupt meditite medicham croagunk toxicroak eevee girafarig pachirisu ursaring pyroar sneasel weavile murkrow cacturne scyther scizor heracross hippopotas hippowdon finneon lumineon snover abomasnow
    quagsire politoed aipom ambipom piloswine mamoswine nuzleaf shiftry ludicolo gligar milotic
    doduo dodrio rhyhorn rhydon rhyperior gloom vileplume venusaur meganium torchic combusken blaziken`.split(
      /\s+/,
    ),
  femaleForms: {
    oinkologne: 'oinkologne-female',
    indeedee: 'indeedee-female',
    meowstic: 'meowstic-female',
    basculegion: 'basculegion-female',
  },
  homeRegional: {
    raichu: ['raichu-alola'],
    lilligant: ['lilligant-hisui'],
    sliggoo: ['sliggoo-hisui'],
    goodra: ['goodra-hisui'],
    voltorb: ['voltorb-hisui'],
    electrode: ['electrode-hisui'],
    zorua: ['zorua-hisui'],
    zoroark: ['zoroark-hisui'],
    sneasel: ['sneasel-hisui', 'sneasel-hisui-female'],
    avalugg: ['avalugg-hisui'],
    braviary: ['braviary-hisui'],
    weezing: ['weezing-galar'],
    typhlosion: ['typhlosion-hisui'],
    samurott: ['samurott-hisui'],
    decidueye: ['decidueye-hisui'],
  },
  battleForms: {
    mimikyu: ['mimikyu-busted'],
    palafin: ['palafin-hero'],
    eiscue: ['eiscue-noice'],
    morpeko: ['morpeko-hangry'],
    cramorant: ['cramorant-gulping', 'cramorant-gorging'],
    minior: ['minior-red-meteor'],
    terapagos: ['terapagos-terastal', 'terapagos-stellar'],
  },
  extras: [
    ['articuno-galar', 'xreg'],
    ['zapdos-galar', 'xreg'],
    ['moltres-galar', 'xreg'],
    ['meloetta-pirouette', 'xbat'],
    ['zacian-crowned', 'xbat'],
    ['zamazenta-crowned', 'xbat'],
  ],
  mergedLines: [
    ['scatterbug', 'spewpa', 'vivillon'],
    ['flabebe', 'floette', 'florges'],
  ],
  labelOverrides: {
    'Paldea Combat Breed': 'Combat',
    'Paldea Blaze Breed': 'Blaze',
    'Paldea Aqua Breed': 'Aqua',
    'Poke Ball': 'Poké Ball',
    'Pom Pom': 'Pom-Pom',
    'Family Of Three': 'Family of Three',
    'Family Of Four': 'Family of Four',
    'Three Segment': 'Three-Segment',
    'Two Segment': 'Two-Segment',
    'Blue Striped': 'Blue-Striped',
    'White Striped': 'White-Striped',
    'Red Striped': 'Red-Striped',
    'Wellspring Mask': 'Wellspring',
    'Hearthflame Mask': 'Hearthflame',
    'Cornerstone Mask': 'Cornerstone',
    'Red Meteor': 'Meteor',
    'Full Belly': 'Full Belly',
  },
  formNames: { wooper: 'Johto', 'wooper-female': 'Johto', tauros: 'Kanto' },
  toggleableForms: ['alcremie'],
  // Forms obtainable only in one DLC (Serebii, owner): shown at the species' number in that dex.
  // Kitakami: Johto Wooper, white-striped Basculin, Hisuian Growlithe and Arcanine. Blueberry: Kanto Tauros and every Alolan,
  // Galarian and Hisuian form (Terarium), also when the species itself is in Paldea or Kitakami.
  dlcForms: {
    wooper: 'K',
    'wooper-female': 'K',
    'basculin-white-striped': 'K',
    'growlithe-hisui': 'K',
    'arcanine-hisui': 'K',
    ...Object.fromEntries(
      [
        'tauros',
        ...'diglett dugtrio grimer muk geodude graveler golem sandshrew sandslash vulpix ninetales exeggutor'
          .split(' ')
          .map((s) => `${s}-alola`),
        ...'slowpoke slowbro slowking'.split(' ').map((s) => `${s}-galar`),
        'qwilfish-hisui',
      ].map((id) => [id, 'B']),
    ),
  },
  // Vivillon is locked to Fancy in SV; other patterns need a Pokémon GO postcard (Serebii). No Poké Ball.
  goForms: [
    'vivillon-meadow',
    ...vivillon.filter((x) => x !== 'fancy' && x !== 'poke-ball').map((x) => `vivillon-${x}`),
  ],
  // Version exclusives: https://www.serebii.net/scarletviolet/exclusives.shtml (2026-11-21).
  // Tauros is on both lists (different breeds per game), so it is not marked. Serebii lists only
  // the Alolan forms of Vulpix, Ninetales, Sandshrew and Sandslash (icons 037-a etc.), so these are
  // entry ids: the Kanto forms are in both games (Kitakami).
  exclusives: {
    S: {
      name: 'Scarlet',
      species:
        `vulpix-alola ninetales-alola gligar gliscor larvitar pupitar tyranitar cranidos rampardos drifloon drifblim
        stunky skuntank deino zweilous hydreigon skrelp dragalge oranguru cramorant stonjourner armarouge
        great-tusk scream-tail brute-bonnet flutter-mane slither-wing sandy-shocks roaring-moon koraidon
        walking-wake gouging-fire raging-bolt`.split(/\s+/),
    },
    V: {
      name: 'Violet',
      species:
        `sandshrew-alola sandslash-alola aipom ambipom misdreavus mismagius gulpin swalot bagon shelgon salamence
        shieldon bastiodon clauncher clawitzer passimian morpeko dreepy drakloak dragapult eiscue ceruledge
        iron-treads iron-bundle iron-hands iron-jugulis iron-moth iron-thorns iron-valiant miraidon
        iron-leaves iron-boulder iron-crown`.split(/\s+/),
    },
  },
  // Checked with greattusk, sprigatito, mr.mime (2026-11-22).
  serebii: 'https://www.serebii.net/pokedex-sv/{name}/',
  // Section ids are the Serebii image names (stakes/<id><n>.jpg). Areas and order:
  // https://www.serebii.net/scarletviolet/stakes.shtml (2026-11-22). Serebii gives no per-stake text.
  collectibles: [
    {
      id: 'stake',
      name: 'Słupki ruin',
      badgeTitle: 'Strażnik ruin',
      unitLabel: 'Słupek',
      intro: '8 słupków jednej świątyni otwiera drogę do jej legendarnego Pokémona.',
      source: { name: 'Serebii', url: 'https://www.serebii.net/scarletviolet/stakes.shtml' },
      links: [
        { label: 'zdjęcie', url: 'https://www.serebii.net/scarletviolet/stakes/{section}{n}.jpg' },
        {
          label: 'mapka',
          url: 'https://www.serebii.net/scarletviolet/stakes/map/{section}{n}.jpg',
        },
      ],
      sections: [
        { id: 'ting-lu', name: 'Ting-Lu', area: 'Casseroya Lake & Surrounding Area', count: 8 },
        {
          id: 'chien-pao',
          name: 'Chien-Pao',
          area: 'West Province Area One, Two & Three & Surrounding Area',
          count: 8,
        },
        {
          id: 'wo-chien',
          name: 'Wo-Chien',
          area: 'South Province Area 1, 3, 5 & Surrounding Area',
          count: 8,
        },
        {
          id: 'chi-yu',
          name: 'Chi-Yu',
          area: 'North Province Area 1, 2 & Surrounding Area',
          count: 8,
        },
      ],
    },
  ],
};
