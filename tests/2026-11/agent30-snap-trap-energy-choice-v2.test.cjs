'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  VERSION,
  beastEnergyAwareAttackDamageValue,
  chooseSnapTrapEnergyV2
} = require('../../simulation/twinleaf/agent36/snap-trap-energy-choice-v2.cjs');

const {
  TEMPLE,
  getSnapTrapPublicTempleEnergyOptions
} = require('../../simulation/twinleaf/agent30/snap-trap-public-temple-energy-options-v1.cjs');

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
 * Small test-only Energy matcher. Each item in provides represents one unit;
 * ANY matches one requirement, and every Energy can pay Colorless.
 * @param {object[]} energyMap
 * @param {string[]} cost
 * @returns {boolean}
 */
function checkEnoughEnergy(energyMap, cost) {
  const units = energyMap.flatMap(entry => entry.provides ?? []);
  const used = new Set();
  const visit = index => {
    if (index === cost.length) return true;
    for (let energyIndex = 0; energyIndex < units.length; energyIndex++) {
      if (used.has(energyIndex)) continue;
      const provides = units[energyIndex];
      const requirement = cost[index];
      if (requirement !== CardType.COLORLESS
        && provides !== CardType.ANY
        && provides !== requirement) {
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


test('Beast Energy fails closed when Special Energy suppression is blocked or unknown', () => {
  const doubleColorless = makeEnergy(
    'Double Colorless Energy SUM',
    [CardType.COLORLESS, CardType.COLORLESS],
    EnergyType.SPECIAL
  );
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
      {name: 'Colorless barrage', cost: [
        CardType.COLORLESS,
        CardType.COLORLESS,
        CardType.COLORLESS
      ], damage: 130},
      {name: 'Fire attack', cost: [CardType.FIRE, CardType.FIRE], damage: 120}
    ],
    hasTag(tag) {
      return tag === CardTag.ULTRA_BEAST;
    }
  };
  const {active, prompt} = makeScenario(pokemon, [doubleColorless, fire, beast]);
  const types = makeTypes();

  const blocked = chooseSnapTrapEnergyV2(prompt, active, types, {
    specialEnergyBlocked: true,
    attackDamageValue: beastEnergyAwareAttackDamageValue
  });
  const unknown = chooseSnapTrapEnergyV2(prompt, active, types, {
    attackDamageValue: beastEnergyAwareAttackDamageValue
  });

  assert.equal(blocked.specialEnergyBlockStatus, 'blocked');
  assert.equal(unknown.specialEnergyBlockStatus, 'unknown-fail-closed');
  assert.deepEqual(blocked.dynamicEnergyOverrides, []);
  assert.deepEqual(unknown.dynamicEnergyOverrides, []);
  assert.equal(blocked.bestBeforeAttackDamage, 130);
  assert.equal(unknown.bestBeforeAttackDamage, 130);
});

test('Ultra Beast counterexample: verified public Beast Energy damage modifier changes the best removal', () => {
  const doubleColorless = makeEnergy(
    'Double Colorless Energy SUM',
    [CardType.COLORLESS, CardType.COLORLESS],
    EnergyType.SPECIAL
  );
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
      {
        name: 'Colorless barrage',
        cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
        damage: 130
      },
      {name: 'Fire attack', cost: [CardType.FIRE, CardType.FIRE], damage: 120}
    ],
    hasTag(tag) {
      return tag === CardTag.ULTRA_BEAST;
    }
  };
  const {active, prompt} = makeScenario(pokemon, [doubleColorless, fire, beast]);
  const types = makeTypes();

  const baseOnly = chooseSnapTrapEnergyV2(prompt, active, types, {
    specialEnergyBlocked: false
  });
  assert.strictEqual(baseOnly.card, doubleColorless);
  assert.equal(baseOnly.bestRemainingAttackDamage, 120);
  assert.equal(baseOnly.damageModel, 'printed-base-only');

  const withBeastModifier = chooseSnapTrapEnergyV2(prompt, active, types, {
    specialEnergyBlocked: false,
    attackDamageValue: beastEnergyAwareAttackDamageValue
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

test('live public Temple changes Double Colorless from two units to one and changes Snap Trap choice', () => {
  const dce = makeEnergy('Double Colorless Energy SUM',
    [CardType.COLORLESS, CardType.COLORLESS], EnergyType.SPECIAL);
  const psychic = makeEnergy('Psychic Energy MEE', [CardType.PSYCHIC]);
  const attacker = {
    fullName: 'Synthetic attack-payability fixture',
    attacks: [
      {name: 'Two Colorless', cost: [CardType.COLORLESS, CardType.COLORLESS], damage: 200},
      {name: 'One Psychic', cost: [CardType.PSYCHIC], damage: 100}
    ],
    hasTag() { return false; }
  };
  const {active, prompt} = makeScenario(attacker, [dce, psychic]);
  const hidden = new Proxy({}, {
    get() { throw new Error('hidden zone inspected'); }
  });
  const sourceOwner = {stadium: {cards: [{fullName: TEMPLE}]},
    hand: hidden, deck: hidden, prizes: hidden};
  const attackingOwner = {stadium: {cards: []},
    hand: hidden, deck: hidden, prizes: hidden};
  prompt.player = sourceOwner;
  const state = {players: [sourceOwner, attackingOwner]};
  const types = makeTypes();
  const original = chooseSnapTrapEnergyV2(prompt, active, types);
  const options = getSnapTrapPublicTempleEnergyOptions(state, prompt, active, types);
  const corrected = chooseSnapTrapEnergyV2(prompt, active, types, options);

  assert.strictEqual(original.card, dce);
  assert.equal(original.bestBeforeAttackDamage, 200);
  assert.equal(options.specialEnergyBlocked, true);
  assert.deepEqual(options.energyMap.find(row => row.card === dce).provides,
    [CardType.COLORLESS]);
  assert.deepEqual(options.energyMap.find(row => row.card === psychic).provides,
    [CardType.PSYCHIC]);
  assert.strictEqual(corrected.card, psychic);
  assert.equal(corrected.bestBeforeAttackDamage, 100);
  assert.equal(corrected.bestRemainingAttackDamage, 0);
  assert.deepEqual(corrected.deniedAttacks, ['One Psychic']);

  // Opposite physical seat produces precisely the same card decision.
  state.players.reverse();
  const reversed = chooseSnapTrapEnergyV2(prompt, active, types,
    getSnapTrapPublicTempleEnergyOptions(state, prompt, active, types));
  assert.strictEqual(reversed.card, psychic);
});

test('unknown or contradictory public Stadium state abstains without reading hidden zones', () => {
  const dce = makeEnergy('Double Colorless Energy SUM',
    [CardType.COLORLESS, CardType.COLORLESS], EnergyType.SPECIAL);
  const pokemon = {attacks: [], hasTag() { return false; }};
  const {active, prompt} = makeScenario(pokemon, [dce]);
  const hidden = new Proxy({}, {
    get() { throw new Error('hidden cards may not be inspected'); }
  });
  const owner = {stadium: {cards: []}, hand: hidden, deck: hidden, prizes: hidden};
  const opponent = {stadium: {cards: []}, hand: hidden, deck: hidden, prizes: hidden};
  prompt.player = owner;
  const state = {players: [owner, opponent]};
  const types = makeTypes();
  assert.deepEqual(getSnapTrapPublicTempleEnergyOptions(state, prompt, active, types),
    {specialEnergyBlocked: null});
  owner.stadium.cards.push({fullName: 'Tropical Beach BWP'});
  assert.deepEqual(getSnapTrapPublicTempleEnergyOptions(state, prompt, active, types),
    {specialEnergyBlocked: null});
  owner.stadium.cards[0].fullName = TEMPLE;
  opponent.stadium.cards.push({fullName: 'Chaotic Swell CEC'});
  assert.deepEqual(getSnapTrapPublicTempleEnergyOptions(state, prompt, active, types),
    {specialEnergyBlocked: null});
  assert.deepEqual(dce.provides, [CardType.COLORLESS, CardType.COLORLESS],
    'public override must not mutate the physical printed Energy');
});
