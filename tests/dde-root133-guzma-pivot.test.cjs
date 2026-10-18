'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {inspectGuzmaWindow} = require('../simulation/twinleaf/dde-root133-guzma-pivot.cjs');
const card = fullName => ({fullName});
function pokemon(name, energy = []) {
  return {getPokemonCard: () => name ? card(name) : null,
    energies: {cards: energy.map(card)}};
}
function fixture() {
  const owner = {
    id: 202, active: pokemon('Koraidon ex TEF'),
    bench: [pokemon('Dialga-GX UPR'), pokemon('Marshadow UNB'),
      pokemon('Dedenne-GX UNB'), pokemon('Kyurem SFA'), pokemon('Budew ASC'),
      pokemon('Regidrago VSTAR SIT', [
        'Grass Energy MEE', 'Grass Energy MEE', 'Double Dragon Energy ROS'])],
    hand: {cards: [card('Dragapult ex TWM'), card('Guzma BUS'),
      card('Battle VIP Pass FST')]}, supporterTurn: 0
  };
  const opponent = {id: 101,
    bench: [pokemon('Shadow Rider Calyrex V CRE')]};
  return {turn: 27, prompts: [], players: [opponent, owner]};
}
test('own printed Energy and hand expose the Guzma pivot', () => {
  const found = inspectGuzmaWindow(fixture(), 202);
  assert.equal(found.readyToAttempt, true);
  assert.equal(found.handIndex, 1);
  assert.equal(found.supporterChannelOpen, true);
  assert.equal(found.opponentBenchCount, 1);
  assert.equal(found.ownBenchCount, 6);
  assert.deepEqual(found.stadiumsInPlay, []);
  assert.equal(found.targetBenchIndex, 5);
  assert.equal(found.ownBenchPrintings[5], 'Regidrago VSTAR SIT');
  assert.deepEqual(found.ownHandPrintings,
    ['Dragapult ex TWM', 'Guzma BUS', 'Battle VIP Pass FST']);
});
test('the public Stadium is observed without inspecting hidden opponent zones', () => {
  const state = fixture();
  state.players[0].stadium = {cards: [card('Sky Field ROS')]};
  assert.deepEqual(inspectGuzmaWindow(state, 202).stadiumsInPlay,
    ['Sky Field ROS']);
});
test('Supporter contention, empty opposing Bench, absent Guzma veto pivot', () => {
  const state = fixture();
  state.players[1].supporterTurn = 1;
  assert.equal(inspectGuzmaWindow(state, 202).readyToAttempt, false);
  state.players[1].supporterTurn = 0;
  state.players[0].bench = [];
  assert.equal(inspectGuzmaWindow(state, 202).readyToAttempt, false);
  state.players[0].bench = [pokemon('Shadow Rider Calyrex V CRE')];
  state.players[1].hand.cards = [];
  assert.equal(inspectGuzmaWindow(state, 202).readyToAttempt, false);
});
test('unpowered, mistimed and unresolved decisions are excluded', () => {
  const state = fixture();
  state.players[1].bench[5].energies.cards.pop();
  assert.equal(inspectGuzmaWindow(state, 202), null);
  state.players[1].bench[5].energies.cards.push(card('Double Dragon Energy ROS'));
  state.turn = 25;
  assert.equal(inspectGuzmaWindow(state, 202), null);
  state.turn = 27;
  state.prompts.push({result: undefined});
  assert.equal(inspectGuzmaWindow(state, 202), null);
  state.prompts = [];
  assert.equal(inspectGuzmaWindow(state, 101), null);
});
