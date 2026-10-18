'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {chooseApexBenchTarget} =
  require('../simulation/twinleaf/dde-v4-first-seat-apex-bench-fork.cjs');

function sourceState() {
  const slot = (name, energy = []) => ({
    getPokemonCard() { return {fullName: name}; },
    energies: {cards: energy.map(fullName => ({fullName}))}
  });
  return {
    turn: 27,
    prompts: [],
    players: [{
      id: 202,
      hand: {cards: [
        {fullName: 'Other Item TST'},
        {fullName: 'Double Dragon Energy ROS'}
      ]},
      active: slot('Koraidon ex TEF'),
      bench: [
        slot('Other Basic TST'), slot('Other Basic TST'),
        slot('Other Basic TST'), slot('Other Basic TST'),
        slot('Other Basic TST'),
        slot('Regidrago VSTAR SIT', ['Grass Energy MEE', 'Grass Energy MEE']),
        slot('Regidrago V SIT')
      ]
    }]
  };
}

test('source root 133 retargets physical DDE from active to prepared bench VSTAR', () => {
  const state = sourceState();
  assert.deepEqual(chooseApexBenchTarget(state, 202, 133),
    {handIndex: 1, benchIndex: 5});
});

test('source fork is fail-closed on different root, turn and actor', () => {
  const state = sourceState();
  assert.equal(chooseApexBenchTarget(state, 202, 132), null);
  assert.equal(chooseApexBenchTarget(state, 101, 133), null);
  state.turn = 29;
  assert.equal(chooseApexBenchTarget(state, 202, 133), null);
});

test('source fork refuses incomplete physical and timing preconditions', () => {
  const state = sourceState();
  const self = state.players[0];
  state.prompts.push({result: undefined});
  assert.equal(chooseApexBenchTarget(state, 202, 133), null);
  state.prompts = [];
  self.bench[5].energies.cards.pop();
  assert.equal(chooseApexBenchTarget(state, 202, 133), null);
  self.bench[5].energies.cards.push({fullName:'Fire Energy MEE'});
  assert.equal(chooseApexBenchTarget(state, 202, 133), null);
  self.bench[5].energies.cards[1] = {fullName:'Grass Energy MEE'};
  self.hand.cards.pop();
  assert.equal(chooseApexBenchTarget(state, 202, 133), null);
});

test('source fork refuses different Active or Bench card', () => {
  const state = sourceState();
  state.players[0].active.getPokemonCard = () => ({fullName:'Kyurem SFA'});
  assert.equal(chooseApexBenchTarget(state, 202, 133), null);
  state.players[0].active.getPokemonCard = () => ({fullName:'Koraidon ex TEF'});
  state.players[0].bench[5].getPokemonCard = () => ({fullName:'Regidrago V SIT'});
  assert.equal(chooseApexBenchTarget(state, 202, 133), null);
});
