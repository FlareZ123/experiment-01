'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {censusSourceTrainerRoots, SCHEMA} =
  require('../scripts/agent21-source-trainer-play-census.cjs');

/** @returns {object} Small exact source roster with 60 physical cards. */
function roster() {
  return {decks: [{rank: 5, cards: [
    {category: 'Pokémon', name: 'Mew VMAX', count: 12},
    {category: 'Trainer', name: 'Quick Ball', count: 42},
    {category: 'Energy', name: 'Double Colorless Energy', count: 6}
  ]}]};
}

/**
 * @param {'A'|'B'} candidateSlot
 * @param {object[]} roots
 * @returns {object}
 */
function attempt(candidateSlot, roots) {
  const id = '5:0:' + candidateSlot + ':champion-reference';
  return {trial: {rank: 5, repeat: 0, candidateSlot, id},
    sourceSeat: candidateSlot === 'A' ? 1 : 0,
    status: 'CENSORED_OR_UNFINISHED', rawNativeRow: {
      rootActionCount: roots.length, rootActionLedger: roots
    }};
}

/** @param {number} seat @param {string} action @param {string|null} card */
function root(seat, action, card = null) {
  return {playerSlot: seat, action, card};
}

test('two genuine physical source seats count Trainers by authenticated roster category', () => {
  const x = censusSourceTrainerRoots({schema: 'native', attempts: [
    attempt('A', [root(1, 'PlayCardAction', 'Mew VMAX'),
      root(1, 'PlayCardAction', 'Double Colorless Energy'),
      root(1, 'PassTurnAction'), root(0, 'PlayCardAction', 'Quick Ball')]),
    attempt('B', [root(0, 'PlayCardAction', 'Quick Ball'),
      root(0, 'AttackAction'), root(1, 'PlayCardAction', 'Quick Ball')])
  ]}, roster());
  assert.equal(x.schema, SCHEMA);
  assert.equal(x.totalAttempts, 2);
  assert.equal(x.totals.nativeRoots, 7);
  assert.equal(x.totals.sourcePlayRoots, 3);
  assert.equal(x.totals.sourceTrainerPlays, 1);
  assert.equal(x.totals.sourcePokemonPlays, 1);
  assert.equal(x.totals.sourceEnergyPlays, 1);
  assert.equal(x.totals.sourceAttackRoots, 1);
  assert.equal(x.totals.sourcePassRoots, 1);
  assert.equal(x.totals.rosterTrainerSlots, 42);
  assert.equal(x.allNativeSourcePlayRootsCategorized, true);
  assert.equal(x.competitiveGames, 0);
});

test('all-Pokemon/Energy source cards never falsely prove available Trainer roots', () => {
  const x = censusSourceTrainerRoots({schema: 'native', attempts: [
    attempt('A', [root(1, 'PlayCardAction', 'Mew VMAX'),
      root(1, 'PlayCardAction', 'Double Colorless Energy'),
      root(1, 'PassTurnAction')])
  ]}, roster());
  assert.equal(x.sourceTrainerPlayObserved, false);
  assert.equal(x.totals.sourceTrainerPlays, 0);
  assert.equal(x.sourceTrainerOpportunityInHandVerified, false);
  assert.equal(x.paperLegalPaymentVerified, false);
});

test('unknown native source card remains explicitly unclassified', () => {
  const x = censusSourceTrainerRoots({schema: 'native', attempts: [
    attempt('B', [root(0, 'PlayCardAction', 'Mystery Token')])
  ]}, roster());
  assert.equal(x.totals.unknownSourcePlayRoots, 1);
  assert.equal(x.allNativeSourcePlayRootsCategorized, false);
  assert.equal(x.attempts[0].sourceUnclassifiedPrintedNames[0].card,
    'Mystery Token');
});

test('partial or mismatched native root ledgers fail before a negative play claim', () => {
  const a = attempt('A', [root(1, 'PlayCardAction', 'Mew VMAX')]);
  a.rawNativeRow.rootActionCount = 2;
  assert.throws(() => censusSourceTrainerRoots({
    attempts: [a]}, roster()), /truncated/);
  a.rawNativeRow.rootActionCount = 1;
  a.sourceSeat = 0;
  assert.throws(() => censusSourceTrainerRoots({
    attempts: [a]}, roster()), /source playing seat/);
});

test('source missing from authenticated original roster cannot be guessed', () => {
  const a = attempt('A', []);
  a.trial.rank = 23;
  assert.throws(() => censusSourceTrainerRoots({
    attempts: [a]}, roster()), /Missing authenticated exact original source roster/);
});

test('one native name having two card categories is an explicit refusal', () => {
  const r = roster();
  r.decks[0].cards[1].name = 'Mew VMAX';
  assert.throws(() => censusSourceTrainerRoots({
    attempts: [attempt('A', [])]}, r), /different original categories/);
});
