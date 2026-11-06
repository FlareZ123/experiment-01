/** Pure SFT for the archived rank-3 Active trap receipt audit. */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  payableUsingOnlyBasicPsychic, inspectRank3Attempt, analyze
} = require('../simulation/evaluation/agent35-v8-rank3-active-trap.cjs');

function fixture(id, candidateName, energyCount, cost) {
  const roots = Array.from({length: 128}, (_, i) => ({
    actionOrdinal: i, turnBefore: Math.floor(i / 4),
    playerSlot: i % 2, action: 'PassTurnAction'
  }));
  return {
    id, originalSourceSeat: 1, candidateSeat: 0,
    nativeOutcome: 'action-cap', nativeRootActionCount: 128,
    publicRootActions: roots, finalPrizes: [6, 6],
    actualSourceAttackSettlement: {declarations: 0},
    candidateAttackSettlement: {declarations: 0},
    finalBoard: [
      {active: {printing: candidateName, printedAttacks: [
        {name: candidateName === 'Radiant Eternatus CRZ' ? 'Power Beam' : 'Moon Press', cost}
      ], energyCards: Array(energyCount).fill('Psychic Energy')}},
      {active: {printing: 'Snorlax PGO', energyCards: []}}
    ]
  };
}

test('Basic Psychic payment: correct count and colored-symbol requirements', () => {
  assert.equal(payableUsingOnlyBasicPsychic([5, 9, 9], ['Psychic Energy', 'Psychic Energy']), false);
  assert.equal(payableUsingOnlyBasicPsychic([5, 9, 9], Array(3).fill('Psychic Energy')), true);
  assert.equal(payableUsingOnlyBasicPsychic([2, 7, 9], Array(5).fill('Psychic Energy')), false);
  assert.throws(() => payableUsingOnlyBasicPsychic([5], ['Double Colorless Energy']));
});

test('both observed 128-root contexts are classified as no-payable-attack stalls', () => {
  const a = fixture('3:213:A:champion-reference', 'Radiant Eternatus CRZ', 5, [2, 7, 9]);
  const b = fixture('3:213:A:new-moon-lockbreaker-v1', 'Lunatone OBF', 2, [5, 9, 9]);
  const report = analyze({attempts: [a, b, ...Array.from({length: 6}, (_, i) => ({id: 'other-' + i}))]});
  assert.equal(report.contextCount, 2);
  assert.ok(report.rows.every(row => row.candidateActiveHasPayablePrintedAttack === false));
  assert.ok(report.rows.every(row => row.sourceActiveAbilityFromPrintedCard === 'Block'));
});

test('do not silently classify a source attack or an untrusted source printing', () => {
  const a = fixture('3:213:A:champion-reference', 'Radiant Eternatus CRZ', 5, [2, 7, 9]);
  a.publicRootActions[4].action = 'AttackAction';
  assert.throws(() => inspectRank3Attempt(a));
  a.publicRootActions[4].action = 'PassTurnAction';
  a.finalBoard[1].active.printing = 'Snorlax SVI';
  assert.throws(() => inspectRank3Attempt(a));
});
