'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  registered, policyOptions, comparePair, run
} = require('../../simulation/evaluation/2026-11/agent2-rank11-source-quickball-attack-priority.cjs');

/**
 * @param {number} candidateSeat
 * @param {Array<object>} roots
 * @param {object} [overrides]
 * @returns {object}
 */
function row(candidateSeat, roots, overrides = {}) {
  const candidateSlot = candidateSeat === 0 ? 'A' : 'B';
  return {
    id: '11:320' + (candidateSeat === 0 ? '2' : '3') +
      ':' + candidateSlot + ':new-moon-lockbreaker-v1',
    rank: 11,
    candidateSeat,
    seed: candidateSeat === 0 ? 849373371 : 3592222510,
    status: 'native-terminal',
    winner: 1 - candidateSeat,
    rootActions: roots.length,
    rootActionLedger: roots,
    fullPhysicalDealFingerprint: {deal: candidateSlot},
    sourceDealFingerprint: {source: candidateSlot},
    remainingPrizes: [1, 3],
    ...overrides
  };
}

/** @param {number} candidateSeat @returns {Array<object>} */
function baselineRoots(candidateSeat) {
  return [
    {actionOrdinal: 1, playerSlot: candidateSeat,
      action: 'PlayCardAction', card: 'Battle VIP Pass'},
    {actionOrdinal: 2, playerSlot: 1 - candidateSeat,
      action: 'PlayCardAction', card: 'Quick Ball'}
  ];
}

/** @param {number} candidateSeat @returns {Array<object>} */
function attackRoots(candidateSeat) {
  return [
    {...baselineRoots(candidateSeat)[0]},
    {actionOrdinal: 2, playerSlot: 1 - candidateSeat,
      action: 'AttackAction', attack: 'Psychic'}
  ];
}

test('historical rank11 registration contains two independent opposite seats', () => {
  const rows = registered();
  assert.equal(rows.length, 2);
  assert.deepEqual(rows.map(x => x.candidateSlot).sort(), ['A', 'B']);
  assert.deepEqual(rows.map(x => x.seed).sort((a, b) => a - b),
    [849373371, 3592222510]);
});

test('the policy toggles just the owner source attack-priority override', () => {
  const control = policyOptions(false);
  const guarded = policyOptions(true);
  assert.equal(control.sourceScopedQuickBallRoot, true);
  assert.equal(guarded.sourceScopedQuickBallRoot, true);
  assert.equal(control.sourceQuickBallPreservePayableAttack, false);
  assert.equal(guarded.sourceQuickBallPreservePayableAttack, true);
  delete control.sourceQuickBallPreservePayableAttack;
  delete guarded.sourceQuickBallPreservePayableAttack;
  assert.deepEqual(control, guarded);
});

for (const candidateSeat of [0, 1]) {
  test('candidate seat ' + candidateSeat +
    ': accepts first source-owned Attack over Quick Ball', () => {
    const base = row(candidateSeat, baselineRoots(candidateSeat));
    const guarded = row(candidateSeat, attackRoots(candidateSeat));
    const result = comparePair(base, guarded);
    assert.equal(result.physicallyMatched, true);
    assert.equal(result.sameSourceOwnerAtFirstChange, true);
    assert.equal(result.status, 'SOURCE_ATTACK_REPLACES_QUICK_BALL');
    assert.equal(result.sourceAttackReplacesQuickBall, true);
    assert.equal(result.nativeWinnerChanged, false);
    assert.equal(result.paperCompetitiveGames, 0);
  });
}

test('rejects a candidate-owned first divergence as a source treatment', () => {
  const source = row(1, baselineRoots(1));
  const treated = row(1, [
    {actionOrdinal: 1, playerSlot: 1,
      action: 'PlayCardAction', card: 'Forest Seal Stone'},
    ...baselineRoots(1).slice(1)
  ]);
  const result = comparePair(source, treated);
  assert.equal(result.status, 'FIRST_CHANGE_NOT_SOURCE_OWNED');
  assert.equal(result.sameSourceOwnerAtFirstChange, false);
});

test('unchanged accepted Store roots mean inactive treatment', () => {
  const source = row(1, baselineRoots(1));
  const result = comparePair(source, {...source});
  assert.equal(result.status, 'INACTIVE_PRIORITY');
  assert.equal(result.firstDifference.ordinal, null);
});

test('missing source fingerprint invalidates an apparently positive attack', () => {
  const source = row(1, baselineRoots(1));
  const treated = row(1, attackRoots(1), {sourceDealFingerprint: null});
  const result = comparePair(source, treated);
  assert.equal(result.status, 'INVALID_DEAL_OR_MISSING_LEDGER');
  assert.equal(result.physicallyMatched, false);
  assert.equal(result.sourceAttackReplacesQuickBall, true);
});

test('native root cap cannot generate a winner-change assertion', () => {
  const source = row(1, baselineRoots(1), {status: 'root-cap', winner: null});
  const treated = row(1, attackRoots(1), {winner: 1});
  const result = comparePair(source, treated);
  assert.equal(result.terminalComparable, false);
  assert.equal(result.nativeWinnerChanged, false);
  assert.equal(result.baseline.candidateWin, null);
});

test('full replay returns all registered attempts and retains invalid source isolation', () => {
  const groups = registered();
  const build = guarded => groups.map(group => {
    const candidateSeat = group.candidateSlot === 'A' ? 0 : 1;
    const roots = guarded && candidateSeat === 1
      ? [{...baselineRoots(candidateSeat)[0], card: 'different candidate choice'},
        ...baselineRoots(candidateSeat).slice(1)]
      : baselineRoots(candidateSeat);
    return {
      trial: group,
      rootActionLedger: roots,
      finished: true,
      winner: 1 - candidateSeat,
      finalPrizes: [2, 0],
      fullPhysicalDealFingerprint: {deal: group.id},
      sourceDealFingerprint: {source: group.id}
    };
  });
  const result = run({
    runArm: guarded => ({selected: {rawDevelopment: {rows: build(guarded)}}})
  });
  assert.equal(result.nativeAttempts, 4);
  assert.equal(result.pairs.length, 2);
  assert.equal(result.matchedBothPhysicalDeals, true);
  assert.equal(result.sourceIsolation, false);
  assert.ok(result.pairs.some(pair =>
    pair.status === 'FIRST_CHANGE_NOT_SOURCE_OWNED'));
  assert.equal(result.paperCompetitiveGames, 0);
  assert.equal(result.estimatedWinRate, null);
});
