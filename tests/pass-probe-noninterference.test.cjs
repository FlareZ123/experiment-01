'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  counterfactualFingerprint
} = require('../simulation/twinleaf/pass-probe-noninterference.cjs');

/** Minimal representative pinned run result for hash semantics. */
function game() {
  return {
    seed: 20367149, engine: 'a pinned revision',
    rules: {format: 'EXPANDED'},
    deckHashes: ['A', 'B'],
    finished: true, endReason: 'engine-game-end', winner: 0,
    turns: 21, actions: 220, firstTurnSlot: 1,
    verifiedByDrawLog: true, prizesRemaining: [3, 0],
    actionCounts: {PassTurnAction: 12, AttackAction: 9},
    actionsBySeat: [{AttackAction: 6}, {AttackAction: 3}],
    cardsPlayedBySeat: [{'Technical Machine: Evolution': 1}, {}],
    attackTrace: [{turn: 15, seat: 0, attack: 'Evolution'}],
    abilityTrace: [{turn: 2, seat: 1, name: 'Underworld Door'}],
    decisionTrace: [
      {actionOrdinal: 15, action: 'PassTurnAction', playerSlot: 0,
        turnBefore: 5, turnAfter: 6, prizesAfter: [6, 6], decksAfter: [29, 33]},
      {actionOrdinal: 160, action: 'AttackAction', playerSlot: 1,
        turnBefore: 17, turnAfter: 18, attack: 'Max Geist'}
    ],
    terminalTransition: {winner: 0},
    finalState: [{activePokemon: 'Bunnelby'}, {activePokemon: 'Shadow Rider'}]
  };
}

test('post-choice observation metadata is the only removed field', () => {
  const baseline = game();
  const observed = game();
  observed.decisionTrace[0].attackPassProbe = {
    evidenceType: 'post-choice-cloned-attack-announcements-v1',
    tested: [{name: 'Evolution', engineAcceptedAnnouncement: true}]
  };
  observed.attackPassProbeCount = 1;
  observed.attackPassProbeBuckets = {printed: 0, tool: 1};
  assert.equal(counterfactualFingerprint(baseline).hash,
    counterfactualFingerprint(observed).hash);
});

test('changing actual attacks, game outcomes, or board results changes fingerprint', () => {
  const base = counterfactualFingerprint(game()).hash;
  const cases = [
    g => {g.decisionTrace[1].attack = 'Shadow Mist';},
    g => {g.winner = 1;},
    g => {g.finalState[0].activePokemon = 'Gloom';},
    g => {g.attackTrace[0].attack = 'Burrow';},
    g => {g.actions = 221;}
  ];
  for (const change of cases) {
    const variant = game();
    change(variant);
    assert.notEqual(counterfactualFingerprint(variant).hash, base);
  }
});

test('fingerprinting is pure and preserves source trace', () => {
  const original = game();
  const json = JSON.stringify(original);
  counterfactualFingerprint(original);
  assert.equal(JSON.stringify(original), json);
});
