'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  VERSION,
  chooseSnapTrapEnergyV2
} = require('../../simulation/twinleaf/agent36/snap-trap-energy-choice-v2.cjs');

const CardType = {
  ANY: 'ANY',
  COLORLESS: 'COLORLESS',
  PSYCHIC: 'PSYCHIC',
  GRASS: 'GRASS',
  FIRE: 'FIRE'
};
const SuperType = {ENERGY: 'ENERGY', POKEMON: 'POKEMON'};
const EnergyType = {BASIC: 'BASIC', SPECIAL: 'SPECIAL'};
const CardTag = {ULTRA_BEAST: 'ULTRA_BEAST', PRISM_STAR: 'PRISM_STAR'};
const GameMessage = {CHOOSE_CARD_TO_DISCARD: 'CHOOSE_CARD_TO_DISCARD'};

/**
 * Small test-only Energy matcher. Each map entry represents one Energy unit;
 * ANY matches one requirement, and every Energy can pay Colorless.
 * @param {object[]} energyMap
 * @param {string[]} cost
 * @returns {boolean}
 */
function checkEnoughEnergy(energyMap, cost) {
  const used = new Set();
  const visit = index => {
    if (index === cost.length) return true;
    for (let energyIndex = 0; energyIndex < energyMap.length; energyIndex++) {
      if (used.has(energyIndex)) continue;
      const provides = energyMap[energyIndex].provides ?? [];
      const requirement = cost[index];
      if (requirement !== CardType.COLORLESS
        && !provides.includes(CardType.ANY)
        && !provides.includes(requirement)) {
        continue;
      }
      used.add(energyIndex);
      if (visit(index + 1)) return true;
      used.delete(energyIndex);
    }
    return false;
  };
  return visit(0);
}

/** @returns {object} */
function makeTypes() {
  return {
    CardType,
    SuperType,
    EnergyType,
    CardTag,
    GameMessage,
    StateUtils: {
      checkEnoughEnergy,
      getProvidesUnitCount(provides) {
        return provides.includes(CardType.ANY) ? 1 : provides.length;
      }
    }
  };
}

/**
 * @param {string} fullName
 * @param {string[]} provides
 * @param {string} [energyType]
 * @param {string[]} [tags]
 * @returns {object}
 */
function makeEnergy(fullName, provides, energyType = EnergyType.BASIC, tags = []) {
  return {
    fullName,
    superType: SuperType.ENERGY,
    provides,
    energyType,
    tags
  };
}

/**
 * @param {object} pokemon
 * @param {object[]} energies
 * @returns {{active:object,prompt:object}}
 */
function makeScenario(pokemon, energies) {
  const active = {
    cards: [pokemon, ...energies],
    energies: {cards: energies},
    getPokemonCard() {
      return pokemon;
    }
  };
  class ChooseCardsPrompt {
    constructor() {
      this.id = 173;
      this.playerId = 101;
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

    /**
     * @param {object[]} selected
     * @returns {boolean}
     */
    validate(selected) {
      return Array.isArray(selected)
        && selected.length === 1
        && active.cards.includes(selected[0])
        && active.energies.cards.includes(selected[0])
        && !this.options.blocked.includes(active.cards.indexOf(selected[0]));
    }
  }
  return {active, prompt: new ChooseCardsPrompt()};
}

test('version identifies the public best-remaining-attack selector v2', () => {
  assert.equal(VERSION, 'agent36-snap-trap-public-best-remaining-attack-v2');
});

test('Aichi rank-1 Marshadow field witness: eight Psychic Energy removals leave Red Knuckles payable', () => {
  const energies = Array.from({length: 8}, (_, index) =>
    makeEnergy('Psychic Energy MEE ' + index, [CardType.PSYCHIC])
  );
  const pokemon = {
    fullName: 'Marshadow UNB',
    attacks: [{name: 'Red Knuckles', cost: [CardType.COLORLESS], damage: 10}],
    hasTag() {
      return false;
    }
  };
  const {active, prompt} = makeScenario(pokemon, energies);
  const choice = chooseSnapTrapEnergyV2(prompt, active, makeTypes());

  assert.strictEqual(choice.card, energies[0]);
  assert.equal(choice.parentIndex, 1);
  assert.equal(choice.bestBeforeAttackDamage, 10);
  assert.equal(choice.bestRemainingAttackDamage, 10);
  assert.equal(choice.bestAttackDenial, 0);
  assert.deepEqual(choice.deniedAttacks, []);
  assert.equal(choice.deniedBaseDamage, 0);
  assert.equal(choice.sumDeniedBaseDamage, 0);
  assert.equal(choice.damageModel, 'printed-base-only');
  assert.deepEqual(choice.dynamicEnergyOverrides, []);
});

test('Ultra Beast counterexample: verified public Beast Energy damage modifier changes the best removal', () => {
  const grass1 = makeEnergy('Grass Energy 1', [CardType.GRASS]);
  const grass2 = makeEnergy('Grass Energy 2', [CardType.GRASS]);
  const fire = makeEnergy('Fire Energy', [CardType.FIRE]);
  const beast = makeEnergy(
    'Beast Energy FLI',
    [CardType.COLORLESS],
    EnergyType.SPECIAL,
    [CardTag.PRISM_STAR]
  );
  beast.set = 'FLI';
  beast.setNumber = '117';

  const pokemon = {
    fullName: 'Synthetic Ultra Beast fixture',
    attacks: [
      {name: 'Grass attack', cost: [CardType.GRASS, CardType.GRASS], damage: 130},
      {name: 'Fire attack', cost: [CardType.FIRE, CardType.FIRE], damage: 120}
    ],
    hasTag(tag) {
      return tag === CardTag.ULTRA_BEAST;
    }
  };
  const {active, prompt} = makeScenario(pokemon, [grass1, grass2, fire, beast]);
  const types = makeTypes();

  const baseOnly = chooseSnapTrapEnergyV2(prompt, active, types);
  assert.strictEqual(baseOnly.card, grass1);
  assert.equal(baseOnly.bestRemainingAttackDamage, 120);
  assert.equal(baseOnly.damageModel, 'printed-base-only');

  const withBeastModifier = chooseSnapTrapEnergyV2(prompt, active, types, {
    attackDamageValue(attack, context) {
      return attack.damage
        + (context.ultraBeast && context.beastEnergyAttached ? 30 : 0);
    }
  });

  assert.strictEqual(withBeastModifier.card, beast);
  assert.equal(withBeastModifier.bestBeforeAttackDamage, 160);
  assert.equal(withBeastModifier.bestRemainingAttackDamage, 130);
  assert.equal(withBeastModifier.bestAttackDenial, 30);
  assert.deepEqual(withBeastModifier.deniedAttacks, ['Fire attack']);
  assert.equal(withBeastModifier.deniedBaseDamage, 120);
  assert.equal(withBeastModifier.damageModel, 'caller-supplied-public-modifiers');
  assert.deepEqual(withBeastModifier.dynamicEnergyOverrides, ['Beast Energy FLI: ANY']);
});
