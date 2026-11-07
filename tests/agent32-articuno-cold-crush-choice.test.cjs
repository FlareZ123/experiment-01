'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  VERSION,
  MIN_OPPONENT_ACTIVE_ENERGY,
  decideOneWaterColdCrush,
  chooseOneArticunoWaterTransfer
} = require('../simulation/twinleaf/agent32-articuno-cold-crush-choice.cjs');

const types = {
  CardType: {WATER: 'WATER'},
  SuperType: {ENERGY: 'ENERGY'},
  PlayerType: {BOTTOM_PLAYER: 2},
  SlotType: {ACTIVE: 1, BENCH: 2},
  GameMessage: {MOVE_ENERGY_TO_ACTIVE: 'MOVE_ENERGY_CARDS_TO_ACTIVE'}
};

/** @param {number} id */
function water(id) {
  return {
    id,
    name: 'Water Energy',
    fullName: 'Water Energy MEE',
    superType: 'ENERGY',
    provides: ['WATER']
  };
}

/** @param {string} name @param {number} id */
function pokemon(name, id) {
  return {id, name, fullName: name, superType: 'POKEMON'};
}

/** @param {object[]} pokemonCards @param {object[]} energies */
function slot(pokemonCards = [], energies = []) {
  return {cards: [...pokemonCards, ...energies], energies: {cards: [...energies]}};
}

/** @param {object[]} benchWater */
function scene(benchWater = [water(1)], opponentEnergyCount = 3) {
  const articuno = pokemon('Articuno-GX', 10);
  const owner = {
    id: 101,
    usedGX: false,
    active: slot([pokemon('Snorlax', 11)]),
    bench: [slot([articuno], benchWater), slot(), slot(), slot(), slot()]
  };
  const opponent = {
    active: slot([pokemon('Shadow Rider Calyrex VMAX', 20)],
      Array.from({length: opponentEnergyCount}, (_, i) => ({
        id: 30 + i, name: 'Psychic Energy', superType: 'ENERGY',
        provides: ['PSYCHIC']
      })))
  };
  return {owner, opponent, articuno};
}

test('Cold Crush proposal accepts one owner Water against a three-Energy public Active', () => {
  const s = scene();
  const result = decideOneWaterColdCrush({
    card: s.articuno, owner: s.owner, opponent: s.opponent, types
  });
  assert.equal(MIN_OPPONENT_ACTIVE_ENERGY, 3);
  assert.equal(result.decision, true);
  assert.equal(result.reason, 'public-three-energy-active-one-water-cold-crush-proposal');
  assert.equal(result.details.otherBasicWaterCount, 1);
  assert.equal(result.details.opponentActiveEnergyCount, 3);
  assert.equal(result.details.readsOpponentHidden, false);
  assert.equal(result.details.readsUnopenedDeck, false);
});

test('Cold Crush proposal declines when GX is spent, Water is absent, or public Active energy is below threshold', () => {
  const noWater = scene([], 3);
  assert.equal(decideOneWaterColdCrush({
    card: noWater.articuno, owner: noWater.owner,
    opponent: noWater.opponent, types
  }).reason, 'no-owner-basic-water-for-cold-crush');

  const twoEnergy = scene([water(2)], 2);
  assert.equal(decideOneWaterColdCrush({
    card: twoEnergy.articuno, owner: twoEnergy.owner,
    opponent: twoEnergy.opponent, types
  }).reason, 'opponent-active-below-energy-threshold');

  const spent = scene();
  spent.owner.usedGX = true;
  assert.equal(decideOneWaterColdCrush({
    card: spent.articuno, owner: spent.owner,
    opponent: spent.opponent, types
  }).reason, 'gx-attack-already-used');
});

test('Cold Crush proposal reads only owner board and opponent public Active energy', () => {
  const s = scene();
  const owner = new Proxy(s.owner, {
    get(target, property, receiver) {
      if (property === 'hand' || property === 'deck') {
        throw new Error('hidden owner zone read: ' + String(property));
      }
      return Reflect.get(target, property, receiver);
    }
  });
  const opponent = new Proxy(s.opponent, {
    get(target, property, receiver) {
      if (property === 'hand' || property === 'deck' || property === 'prizes') {
        throw new Error('hidden opponent zone read: ' + String(property));
      }
      return Reflect.get(target, property, receiver);
    }
  });
  assert.equal(decideOneWaterColdCrush({
    card: s.articuno, owner, opponent, types
  }).decision, true);
});

test('Cold Crush transfer selects exactly one legal Water and preserves the second', () => {
  const first = water(1);
  const second = water(2);
  const s = scene([first, second], 3);
  const articuno = s.articuno;
  s.owner.active = slot([articuno]);
  s.owner.bench = [
    slot([pokemon('Snorlax', 11)], [first]),
    slot([pokemon('Galarian Stunfisk', 12)], [second]),
    slot(), slot(), slot()
  ];

  class MoveEnergyPrompt {
    constructor() {
      this.playerId = s.owner.id;
      this.message = types.GameMessage.MOVE_ENERGY_TO_ACTIVE;
      this.playerType = types.PlayerType.BOTTOM_PLAYER;
      this.slots = [types.SlotType.ACTIVE, types.SlotType.BENCH];
      this.filter = {superType: types.SuperType.ENERGY, name: 'Water Energy'};
      this.options = {
        min: 1, max: 2, allowCancel: false,
        blockedFrom: [], blockedTo: [],
        blockedMap: [{
          source: {player: 2, slot: 2, index: 0},
          blocked: [1]
        }]
      };
    }
  }

  const selected = chooseOneArticunoWaterTransfer({
    prompt: new MoveEnergyPrompt(),
    owner: s.owner,
    played: {card: articuno},
    types
  });
  assert.equal(selected.length, 1);
  assert.strictEqual(selected[0].card, second);
  assert.equal(s.owner.bench[0].energies.cards.includes(first), true);
  assert.equal(s.owner.bench[1].energies.cards.includes(second), true);
});

test('Cold Crush transfer fails closed on wrong prompt geometry or no legal Water', () => {
  const s = scene();
  s.owner.active = slot([s.articuno]);
  const base = {
    playerId: s.owner.id,
    message: types.GameMessage.MOVE_ENERGY_TO_ACTIVE,
    playerType: types.PlayerType.BOTTOM_PLAYER,
    slots: [types.SlotType.ACTIVE, types.SlotType.BENCH],
    filter: {superType: types.SuperType.ENERGY, name: 'Water Energy'},
    options: {
      min: 1, max: 1, allowCancel: false,
      blockedFrom: [], blockedTo: [], blockedMap: []
    }
  };
  class MoveEnergyPrompt {
    constructor(overrides = {}) { Object.assign(this, base, overrides); }
  }
  assert.throws(() => chooseOneArticunoWaterTransfer({
    prompt: new MoveEnergyPrompt({message: 'OTHER'}),
    owner: s.owner, played: {card: s.articuno}, types
  }), /does not match the pinned geometry/);

  const blocked = new MoveEnergyPrompt({
    options: {
      ...base.options,
      blockedMap: [{
        source: {player: 2, slot: 2, index: 0},
        blocked: [1]
      }]
    }
  });
  assert.throws(() => chooseOneArticunoWaterTransfer({
    prompt: blocked, owner: s.owner, played: {card: s.articuno}, types
  }), /no legal owner Basic Water transfer/);
});

test('Cold Crush transfer module remains an isolated proposal', () => {
  assert.equal(VERSION, 'agent32-articuno-one-water-cold-crush-choice-v1');
});
