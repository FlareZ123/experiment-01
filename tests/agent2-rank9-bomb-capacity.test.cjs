'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  RANK9_ORIGINAL_ENERGY_COUNT,
  ELECTRODE_BOMB_REQUIRED_DISCARD,
  rank9BombCapacity,
  countPublicAttachedEnergyCards
} = require('../simulation/twinleaf/agent2-rank9-bomb-capacity.cjs');

test('original printed rank-9 seven-card inventory yields a five-card bound', () => {
  const roster = require('../results/aichi-2026/full-decklists.json');
  const source = roster.decks.find(row => row.rank === 9);
  assert.ok(source);
  assert.equal(source.cards.filter(c => c.category === 'Energy')
    .reduce((sum,c) => sum + c.count,0), RANK9_ORIGINAL_ENERGY_COUNT);
  assert.equal(ELECTRODE_BOMB_REQUIRED_DISCARD, 5);
  for (let attached = 0; attached <= 7; attached++) {
    const state = rank9BombCapacity(attached);
    assert.equal(state.maximumDiscardCards, 7 - attached);
    assert.equal(state.maximumBombTransferCards, Math.min(5,7-attached));
    assert.equal(state.fiveEnergyDiscardPossible, attached <= 2);
    assert.equal(state.minimumAttachedCardsToRelease, Math.max(0, attached - 2));
    console.log('physical-card bound', {attached, ...state});
  }
});

test('third attachment closes FULL-five payload, while partial activation remains possible', () => {
  const before = rank9BombCapacity(2);
  const after = rank9BombCapacity(2, 1);
  assert.equal(before.fiveEnergyDiscardPossible, true);
  assert.equal(after.fiveEnergyDiscardPossible, false);
  assert.equal(after.wouldCloseFiveEnergyWindow, true);
  assert.equal(after.maximumDiscardCards, 4);
  assert.equal(after.maximumBombTransferCards, 4);
  assert.equal(after.minimumAttachedCardsToRelease, 1);
});

test('archived source rank-9 board energy counts cross the full-five threshold', () => {
  // Public physical snapshots from the 2026-11-02 rank9 four-arm native trace.
  // At turn 4, Voltorb holds Prism; at turn 14 its evolved Electrode holds it.
  const turn4 = {active: {energies: ['Prism Energy ASC']}, bench: [
    {energies: ['Telepath [P] Energy M3']}
  ]};
  const turn14 = {active: {energies: ['Prism Energy ASC']}, bench: [
    {energies: ['Telepath [P] Energy M3', 'Prism Energy ASC']}
  ]};
  assert.equal(countPublicAttachedEnergyCards(turn4), 2);
  assert.equal(countPublicAttachedEnergyCards(turn14), 3);
  assert.equal(rank9BombCapacity(countPublicAttachedEnergyCards(turn4)).fiveEnergyDiscardPossible, true);
  assert.equal(rank9BombCapacity(countPublicAttachedEnergyCards(turn14)).fiveEnergyDiscardPossible, false);
});

test('a multi-unit Special Energy remains one physical attached card', () => {
  const owner = {active: {energies: ['Prism Energy ASC']}, bench: [
    {energies: ['Telepath [P] Energy M3', 'Prism Energy ASC']}, null,
    {energies: []}
  ]};
  assert.equal(countPublicAttachedEnergyCards(owner), 3);
  assert.equal(rank9BombCapacity(3).maximumBombTransferCards, 4);
});

test('impossible and invalid physical energy counts reject cleanly', () => {
  assert.throws(() => rank9BombCapacity(-1), /assert/);
  assert.throws(() => rank9BombCapacity(7, 1), /assert/);
  assert.throws(() => countPublicAttachedEnergyCards({bench: [{}]}), /assert/);
});
