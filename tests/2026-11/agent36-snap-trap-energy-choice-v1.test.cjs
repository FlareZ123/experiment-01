'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  VERSION,
  chooseSnapTrapEnergy,
  loadTypes
} = require('../../simulation/twinleaf/agent36/snap-trap-energy-choice-v1.cjs');

const types = loadTypes();
const {
  CardTag,
  CardType,
  EnergyType,
  GameMessage,
  SuperType,
  StateUtils
} = types;

let nextId = 1;

/**
 * @param {string} fullName
 * @param {number[]} provides
 * @param {{energyType?:number,tags?:number[]}} [options]
 * @returns {object}
 */
function energy(fullName, provides, options = {}) {
  return {
    id: nextId++,
    fullName,
    superType: SuperType.ENERGY,
    energyType: options.energyType ?? EnergyType.BASIC,
    tags: options.tags ?? [],
    provides: [...provides]
  };
}

/**
 * @param {object[]} energyCards
 * @param {object[]} attacks
 * @returns {object}
 */
function activeList(energyCards, attacks) {
  const pokemon = {
    id: nextId++,
    fullName: 'Marshadow UNB',
    attacks
  };
  return {
    cards: [pokemon, ...energyCards],
    energies: {cards: [...energyCards]},
    getPokemonCard() {
      return pokemon;
    }
  };
}

/**
 * @param {object} active
 * @param {number[]} [blocked]
 * @returns {object}
 */
function promptFor(active, blocked = []) {
  return {
    id: nextId++,
    playerId: 100,
    result: undefined,
    message: GameMessage.CHOOSE_CARD_TO_DISCARD,
    cards: active,
    filter: {superType: SuperType.ENERGY},
    options: {
      min: 1,
      max: 1,
      allowCancel: false,
      isSecret: false,
      blocked: [...blocked]
    },
    validate(selected) {
      return Array.isArray(selected) &&
        selected.length === 1 &&
        active.cards.includes(selected[0]) &&
        active.energies.cards.includes(selected[0]) &&
        selected[0].superType === SuperType.ENERGY &&
        !blocked.includes(active.cards.indexOf(selected[0]));
    }
  };
}

test('chooses the Energy that denies the greatest total printed attack damage', () => {
  nextId = 1;
  const psychic = energy('Psychic Energy', [CardType.PSYCHIC]);
  const doubleColorless = energy('Double Colorless Energy', [
    CardType.COLORLESS,
    CardType.COLORLESS
  ], {energyType: EnergyType.SPECIAL});
  const active = activeList([psychic, doubleColorless], [
    {name: 'Red Knuckles', cost: [CardType.PSYCHIC], damage: 10},
    {name: 'Colorless Barrage', cost: [
      CardType.COLORLESS,
      CardType.COLORLESS
    ], damage: 100},
    {name: 'Psychic Nova', cost: [
      CardType.PSYCHIC,
      CardType.COLORLESS,
      CardType.COLORLESS
    ], damage: 50}
  ]);
  const prompt = promptFor(active);

  const choice = chooseSnapTrapEnergy(prompt, active, types);

  assert.equal(choice.card, doubleColorless);
  assert.equal(choice.denialScore, 150);
  assert.deepEqual(choice.deniedAttacks, [
    'Colorless Barrage',
    'Psychic Nova'
  ]);
  assert.equal(choice.payableAttackCount, 3);
  assert.equal(choice.eligibleCount, 2);
  assert.equal(choice.policy, VERSION);
});

test('uses Prism Star Lost Zone removal as a tie-break when attacks remain payable', () => {
  nextId = 1;
  const psychicA = energy('Psychic Energy A', [CardType.PSYCHIC]);
  const psychicB = energy('Psychic Energy B', [CardType.PSYCHIC]);
  const beast = energy('Beast Energy FLI', [CardType.COLORLESS], {
    energyType: EnergyType.SPECIAL,
    tags: [CardTag.PRISM_STAR]
  });
  const active = activeList([psychicA, psychicB, beast], [
    {name: 'Red Knuckles', cost: [CardType.PSYCHIC], damage: 10}
  ]);
  const prompt = promptFor(active);

  const choice = chooseSnapTrapEnergy(prompt, active, types);

  assert.equal(choice.card, beast);
  assert.equal(choice.denialScore, 0);
  assert.equal(choice.prismStar, true);
  assert.equal(StateUtils.checkEnoughEnergy(
    active.energies.cards.map(card => ({card, provides: card.provides})),
    [CardType.PSYCHIC]
  ), true);
});

test('attack denial outranks the Prism Star tie-break', () => {
  nextId = 1;
  const psychic = energy('Psychic Energy', [CardType.PSYCHIC]);
  const beast = energy('Beast Energy FLI', [CardType.COLORLESS], {
    energyType: EnergyType.SPECIAL,
    tags: [CardTag.PRISM_STAR]
  });
  const active = activeList([psychic, beast], [
    {name: 'Red Knuckles', cost: [CardType.PSYCHIC], damage: 10}
  ]);
  const prompt = promptFor(active);

  const choice = chooseSnapTrapEnergy(prompt, active, types);

  assert.equal(choice.card, psychic);
  assert.equal(choice.denialScore, 10);
  assert.equal(choice.prismStar, false);
});

test('blocked indices are interpreted against the parent PokemonCardList', () => {
  nextId = 1;
  const psychic = energy('Psychic Energy', [CardType.PSYCHIC]);
  const doubleColorless = energy('Double Colorless Energy', [
    CardType.COLORLESS,
    CardType.COLORLESS
  ], {energyType: EnergyType.SPECIAL});
  const active = activeList([psychic, doubleColorless], [
    {name: 'Colorless Barrage', cost: [
      CardType.COLORLESS,
      CardType.COLORLESS
    ], damage: 100}
  ]);
  const doubleColorlessParentIndex = active.cards.indexOf(doubleColorless);
  const prompt = promptFor(active, [doubleColorlessParentIndex]);

  const choice = chooseSnapTrapEnergy(prompt, active, types);

  assert.equal(choice.card, psychic);
  assert.equal(choice.eligibleCount, 1);
});

test('returns null for a cancelable or broader-than-Energy prompt', () => {
  nextId = 1;
  const psychic = energy('Psychic Energy', [CardType.PSYCHIC]);
  const active = activeList([psychic], [
    {name: 'Red Knuckles', cost: [CardType.PSYCHIC], damage: 10}
  ]);
  const cancelable = promptFor(active);
  cancelable.options.allowCancel = true;
  assert.equal(chooseSnapTrapEnergy(cancelable, active, types), null);

  const broadFilter = promptFor(active);
  broadFilter.filter.energyType = EnergyType.BASIC;
  assert.equal(chooseSnapTrapEnergy(broadFilter, active, types), null);
});

test('returns null when all attached Energy choices are blocked', () => {
  nextId = 1;
  const psychic = energy('Psychic Energy', [CardType.PSYCHIC]);
  const active = activeList([psychic], [
    {name: 'Red Knuckles', cost: [CardType.PSYCHIC], damage: 10}
  ]);
  const prompt = promptFor(active, [active.cards.indexOf(psychic)]);

  assert.equal(chooseSnapTrapEnergy(prompt, active, types), null);
});

test('uses stable public parent-list order for otherwise equal Energy choices', () => {
  nextId = 1;
  const first = energy('Psychic Energy A', [CardType.PSYCHIC]);
  const second = energy('Psychic Energy B', [CardType.PSYCHIC]);
  const active = activeList([first, second], [
    {name: 'Red Knuckles', cost: [CardType.PSYCHIC], damage: 10}
  ]);
  const prompt = promptFor(active);

  const choice = chooseSnapTrapEnergy(prompt, active, types);

  assert.equal(choice.card, first);
  assert.equal(choice.parentIndex, active.cards.indexOf(first));
});

test('does not mutate the prompt, Active arrays, printed attacks or Energy provides', () => {
  nextId = 1;
  const psychic = energy('Psychic Energy', [CardType.PSYCHIC]);
  const beast = energy('Beast Energy FLI', [CardType.COLORLESS], {
    energyType: EnergyType.SPECIAL,
    tags: [CardTag.PRISM_STAR]
  });
  const attacks = Object.freeze([
    Object.freeze({
      name: 'Red Knuckles',
      cost: Object.freeze([CardType.PSYCHIC]),
      damage: 10
    })
  ]);
  const active = activeList([psychic, beast], attacks);
  Object.freeze(psychic.provides);
  Object.freeze(beast.provides);
  Object.freeze(active.energies.cards);
  Object.freeze(active.cards);
  Object.freeze(active.energies);
  Object.freeze(active);
  const prompt = promptFor(active);
  Object.freeze(prompt.options.blocked);
  Object.freeze(prompt.options);
  Object.freeze(prompt.filter);
  Object.freeze(prompt);

  const choice = chooseSnapTrapEnergy(prompt, active, types);

  assert.equal(choice.card, beast);
  assert.deepEqual(active.energies.cards, [psychic, beast]);
  assert.deepEqual(active.cards.slice(1), [psychic, beast]);
  assert.deepEqual(psychic.provides, [CardType.PSYCHIC]);
  assert.deepEqual(beast.provides, [CardType.COLORLESS]);
});
