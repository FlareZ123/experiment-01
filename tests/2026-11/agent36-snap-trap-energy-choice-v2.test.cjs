'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  chooseSnapTrapEnergy
} = require('../../simulation/twinleaf/agent36/snap-trap-energy-choice-v1.cjs');
const {
  VERSION,
  buildPublicEnergyMap,
  chooseSnapTrapEnergyV2,
  loadTypes
} = require('../../simulation/twinleaf/agent36/snap-trap-energy-choice-v2.cjs');

const types = loadTypes();
const {
  CardTag,
  CardType,
  EnergyType,
  GameMessage,
  StateUtils,
  SuperType
} = types;

let nextId = 1;

class PokemonCardList {
  constructor(pokemon, energies = []) {
    this.cards = [pokemon, ...energies];
    this.energies = {cards: [...energies]};
    this.pokemon = pokemon;
  }

  getPokemonCard() {
    return this.pokemon;
  }
}

class ChooseCardsPrompt {
  constructor(active, id = 173) {
    this.id = id;
    this.result = undefined;
    this.message = GameMessage.CHOOSE_CARD_TO_DISCARD;
    this.cards = active;
    this.filter = {superType: SuperType.ENERGY};
    this.options = {
      min: 1,
      max: 1,
      allowCancel: false,
      isSecret: false,
      blocked: []
    };
  }

  validate(selected) {
    return Array.isArray(selected) &&
      selected.length === 1 &&
      this.cards.cards.includes(selected[0]) &&
      this.cards.energies.cards.includes(selected[0]) &&
      selected[0].superType === SuperType.ENERGY &&
      !this.options.blocked.includes(this.cards.cards.indexOf(selected[0]));
  }
}

/**
 * @param {string} fullName
 * @param {number[]} provides
 * @param {{special?:boolean,prismStar?:boolean,set?:string,setNumber?:string}} [options]
 * @returns {object}
 */
function energy(fullName, provides, options = {}) {
  return {
    id: nextId++,
    fullName,
    superType: SuperType.ENERGY,
    energyType: options.special ? EnergyType.SPECIAL : EnergyType.BASIC,
    tags: options.prismStar ? [CardTag.PRISM_STAR] : [],
    set: options.set,
    setNumber: options.setNumber,
    provides: [...provides]
  };
}

/**
 * @param {string} fullName
 * @param {object[]} attacks
 * @param {boolean} [ultraBeast]
 * @returns {object}
 */
function pokemon(fullName, attacks, ultraBeast = false) {
  return {
    id: nextId++,
    fullName,
    attacks,
    hasTag(tag) {
      return ultraBeast && tag === CardTag.ULTRA_BEAST;
    }
  };
}

/**
 * @param {object[]} energies
 * @param {object[]} attacks
 * @param {{ultraBeast?:boolean,fullName?:string}} [options]
 * @returns {{active:object,prompt:object,pokemon:object}}
 */
function fixture(energies, attacks, options = {}) {
  nextId = 1;
  const attackerPokemon = pokemon(
    options.fullName ?? 'Test Pokemon',
    attacks,
    options.ultraBeast ?? false
  );
  const active = new PokemonCardList(attackerPokemon, energies);
  return {
    active,
    prompt: new ChooseCardsPrompt(active),
    pokemon: attackerPokemon
  };
}

test('best-remaining-attack v2 beats summed-disabled-damage v1 on mutually exclusive attacks', () => {
  const grassA = energy('Grass Energy A', [CardType.GRASS]);
  const grassB = energy('Grass Energy B', [CardType.GRASS]);
  const grassC = energy('Grass Energy C', [CardType.GRASS]);
  const fireA = energy('Fire Energy A', [CardType.FIRE]);
  const fireB = energy('Fire Energy B', [CardType.FIRE]);
  const state = fixture([grassA, grassB, grassC, fireA, fireB], [
    {name: 'Fire Finisher', cost: [CardType.FIRE, CardType.FIRE], damage: 150},
    {name: 'Grass Combo A', cost: [
      CardType.GRASS,
      CardType.GRASS,
      CardType.GRASS
    ], damage: 90},
    {name: 'Grass Combo B', cost: [
      CardType.GRASS,
      CardType.GRASS,
      CardType.GRASS
    ], damage: 90}
  ]);
  const publicMap = buildPublicEnergyMap(state.active, types).energyMap;

  const v1 = chooseSnapTrapEnergy(state.prompt, state.active, types, {
    energyMap: publicMap
  });
  const v2 = chooseSnapTrapEnergyV2(state.prompt, state.active, types, {
    energyMap: publicMap
  });

  assert.equal(v1.card, grassA);
  assert.equal(v1.denialScore, 180);
  assert.equal(v1.energyMapModel, 'caller-supplied-public-energy-map');
  assert.equal(v2.card, fireA);
  assert.equal(v2.bestBeforeAttackDamage, 150);
  assert.equal(v2.bestRemainingAttackDamage, 90);
  assert.equal(v2.bestAttackDenial, 60);
  assert.deepEqual(v2.deniedAttacks, ['Fire Finisher']);
  assert.equal(v2.sumDeniedBaseDamage, 150);
  assert.equal(v2.policy, VERSION);
});

test('public EnergyMap applies Beast Energy FLI as one ANY unit only on an Ultra Beast', () => {
  const beast = energy('Beast Energy FLI', [CardType.COLORLESS], {
    special: true,
    prismStar: true,
    set: 'FLI',
    setNumber: '117'
  });
  const fighting = energy('Fighting Energy', [CardType.FIGHTING]);
  const ultra = fixture([beast], [
    {name: 'Sledgehammer', cost: [CardType.FIGHTING], damage: 30}
  ], {ultraBeast: true, fullName: 'Buzzwole FLI'});
  const ordinary = fixture([beast], [
    {name: 'Sledgehammer', cost: [CardType.FIGHTING], damage: 30}
  ], {ultraBeast: false, fullName: 'Marshadow UNB'});

  const ultraMap = buildPublicEnergyMap(ultra.active, types);
  const ordinaryMap = buildPublicEnergyMap(ordinary.active, types);
  const ultraBeastEntry = ultraMap.energyMap.find(entry => entry.card === beast);
  const ordinaryBeastEntry = ordinaryMap.energyMap.find(entry => entry.card === beast);

  assert.deepEqual(ultraBeastEntry.provides, [CardType.ANY]);
  assert.deepEqual(ordinaryBeastEntry.provides, [CardType.COLORLESS]);
  assert.equal(StateUtils.checkEnoughEnergy(ultraMap.energyMap, [CardType.FIGHTING]), true);
  assert.equal(StateUtils.checkEnoughEnergy(ordinaryMap.energyMap, [CardType.FIGHTING]), false);
  assert.equal(ultraMap.ultraBeast, true);
  assert.equal(ultraMap.beastEnergyAttached, true);
  assert.deepEqual(ultraMap.dynamicOverrides, ['Beast Energy FLI: ANY']);
  assert.equal(ordinaryMap.dynamicOverrides.length, 0);
  assert.ok(fighting);
});

test('the former Grass/Fire/Beast-ANY fixture leaves both attacks payable after one Grass is removed', () => {
  const grassA = energy('Grass Energy A', [CardType.GRASS]);
  const grassB = energy('Grass Energy B', [CardType.GRASS]);
  const fire = energy('Fire Energy', [CardType.FIRE]);
  const beast = energy('Beast Energy FLI', [CardType.COLORLESS], {
    special: true,
    prismStar: true,
    set: 'FLI',
    setNumber: '117'
  });
  const state = fixture([grassA, grassB, fire, beast], [
    {name: 'Grass Attack', cost: [CardType.GRASS, CardType.GRASS], damage: 130},
    {name: 'Fire Attack', cost: [CardType.FIRE, CardType.FIRE], damage: 120}
  ], {ultraBeast: true});
  const energyMap = buildPublicEnergyMap(state.active, types).energyMap;
  const grassRemoved = energyMap.filter(entry => entry.card !== grassA);
  const beastRemoved = energyMap.filter(entry => entry.card !== beast);

  assert.equal(StateUtils.checkEnoughEnergy(energyMap, [
    CardType.GRASS,
    CardType.GRASS
  ]), true);
  assert.equal(StateUtils.checkEnoughEnergy(energyMap, [
    CardType.FIRE,
    CardType.FIRE
  ]), true);
  assert.equal(StateUtils.checkEnoughEnergy(grassRemoved, [
    CardType.GRASS,
    CardType.GRASS
  ]), true);
  assert.equal(StateUtils.checkEnoughEnergy(grassRemoved, [
    CardType.FIRE,
    CardType.FIRE
  ]), true);
  assert.equal(StateUtils.checkEnoughEnergy(beastRemoved, [
    CardType.GRASS,
    CardType.GRASS
  ]), true);
  assert.equal(StateUtils.checkEnoughEnergy(beastRemoved, [
    CardType.FIRE,
    CardType.FIRE
  ]), false);
});

test('caller-supplied public damage modifier models Beast Energy plus 30 while it remains attached', () => {
  const beast = energy('Beast Energy FLI', [CardType.COLORLESS], {
    special: true,
    prismStar: true,
    set: 'FLI',
    setNumber: '117'
  });
  const fighting = energy('Fighting Energy', [CardType.FIGHTING]);
  const state = fixture([beast, fighting], [
    {name: 'Sledgehammer', cost: [CardType.FIGHTING], damage: 30}
  ], {ultraBeast: true, fullName: 'Buzzwole FLI'});
  const energyMap = buildPublicEnergyMap(state.active, types).energyMap;
  const attackDamageValue = (attack, context) =>
    attack.damage + (context.ultraBeast && context.beastEnergyAttached ? 30 : 0);

  const choice = chooseSnapTrapEnergyV2(state.prompt, state.active, types, {
    energyMap,
    attackDamageValue
  });

  assert.equal(choice.bestBeforeAttackDamage, 60);
  assert.equal(choice.bestRemainingAttackDamage, 30);
  assert.equal(choice.damageModel, 'caller-supplied-public-modifiers');
  assert.equal(choice.energyMapModel, 'caller-supplied-public-energy-map');
  assert.equal(choice.card, beast);
});

test('Prism Star is a tie-break only after best remaining attack damage', () => {
  const psychic = energy('Psychic Energy', [CardType.PSYCHIC]);
  const beast = energy('Beast Energy FLI', [CardType.COLORLESS], {
    special: true,
    prismStar: true,
    set: 'FLI',
    setNumber: '117'
  });
  const state = fixture([psychic, beast], [
    {name: 'Red Knuckles', cost: [CardType.PSYCHIC], damage: 10}
  ]);

  const choice = chooseSnapTrapEnergyV2(state.prompt, state.active, types);

  assert.equal(choice.card, psychic);
  assert.equal(choice.bestRemainingAttackDamage, 0);
  assert.equal(choice.denialScore, undefined);
  assert.equal(choice.prismStar, false);
});

test('v2 respects parent-list blocked indices and does not mutate public lists', () => {
  const psychic = energy('Psychic Energy', [CardType.PSYCHIC]);
  const beast = energy('Beast Energy FLI', [CardType.COLORLESS], {
    special: true,
    prismStar: true,
    set: 'FLI',
    setNumber: '117'
  });
  const state = fixture([psychic, beast], [
    {name: 'Red Knuckles', cost: [CardType.PSYCHIC], damage: 10}
  ]);
  const beforeCards = [...state.active.cards];
  const beforeEnergies = [...state.active.energies.cards];
  state.prompt.options.blocked = [state.active.cards.indexOf(beast)];

  const choice = chooseSnapTrapEnergyV2(state.prompt, state.active, types);

  assert.equal(choice.card, psychic);
  assert.deepEqual(state.active.cards, beforeCards);
  assert.deepEqual(state.active.energies.cards, beforeEnergies);
  assert.deepEqual(psychic.provides, [CardType.PSYCHIC]);
  assert.deepEqual(beast.provides, [CardType.COLORLESS]);
});
