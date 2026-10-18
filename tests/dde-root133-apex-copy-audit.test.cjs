'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {withSourceApexCopyTrace} =
  require('../simulation/twinleaf/dde-root133-apex-copy-audit.cjs');

/** @param {string} fullName */
function pokemon(fullName) {
  return {
    getPokemonCard: () => ({fullName}),
    damage: 0, energies: {cards: []}, tools: []
  };
}

/** @returns {object} Mock of the public and acting-player-visible engine state. */
function stateFixture() {
  const player = (id, printing) => ({
    id, active: pokemon(printing), bench: [],
    discard: {cards: []}, prizes: Array.from({length: 6},
      () => ({cards: [{}]}))
  });
  return {
    turn: 27, prompts: [],
    players: [player(101, 'Marshadow UNB'),
      player(202, 'Regidrago VSTAR SIT')]
  };
}

test('source observer keys AttackAction to clientId and resolves matching prompt', () => {
  class AddPlayerAction {}
  class AttackAction {
    constructor(clientId, name) {this.clientId = clientId; this.name = name;}
  }
  class ResolvePromptAction {
    constructor(id, result) {this.id = id; this.result = result;}
  }
  class ChooseAttackPrompt {
    constructor(id, attack) {
      this.id = id; this.playerId = 202;
      this.message = 'Choose attack'; this.result = undefined;
      this.cards = [{
        fullName: 'Regidrago V SIT',
        attacks: [attack]
      }];
      this.options = {blocked: []};
    }
  }
  class FakeStore {
    constructor(state) {this.state = state;}
    dispatch(action) {
      if (action instanceof ResolvePromptAction)
        this.state.prompts[0].result = action.result;
      return this.state;
    }
  }
  const source = new FakeStore(stateFixture());
  const simulator = new FakeStore(stateFixture());
  const printedAttack = {name: 'Dragon Laser', damage: 130,
    cost: [1, 1, 2]};
  const observed = withSourceApexCopyTrace(FakeStore, () => {
    source.dispatch(new AddPlayerAction());
    simulator.dispatch(new AttackAction(202, 'Apex Dragon'));
    source.dispatch(new AttackAction(202, 'Apex Dragon'));
    source.state.prompts.push(new ChooseAttackPrompt(4, printedAttack));
    source.dispatch(new ResolvePromptAction(4, printedAttack));
    return 'match completed';
  });
  assert.equal(observed.result, 'match completed');
  assert.equal(observed.attacks.length, 1,
    'Simulator actions must be excluded from the live Store trace');
  assert.equal(observed.attacks[0].rootStep, 1);
  assert.equal(observed.attacks[0].copySelections.length, 1);
  assert.equal(observed.attacks[0].copySelections[0].selectedName,
    'Dragon Laser');
  assert.equal(observed.attacks[0].copySelections[0].selectedPrinting,
    'Regidrago V SIT');
  assert.deepEqual(observed.attacks[0].before.prizesRemaining, [6, 6]);
  assert.equal(FakeStore.prototype.dispatch.name, 'dispatch',
    'The observer must restore the original Store dispatcher');
});
