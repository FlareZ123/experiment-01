'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const registration =
  require('../../results/aichi-2026/registrations/agent22-hood-shield-vs-champion-20261109.json');
const { inspect, outcome, compare } =
  require('../../simulation/evaluation/2026-11/agent22-hood-vs-champion-native.cjs');

const PASSED = 'SETTLED_PHYSICAL_INTEGRITY_PASSED';

/** @param {object} trial @param {boolean} winner @param {boolean} cap */
function row(trial, winner = true, cap = false) {
  const candidateSeat = trial.candidateSlot === 'A' ? 0 : 1;
  return {
    trial,
    status: cap ? 'action-cap' : 'engine-terminal',
    finished: !cap,
    endReason: cap ? 'action-limit' : 'engine-game-end',
    winner: cap ? null : (winner ? candidateSeat : 1 - candidateSeat),
    sourceDealFingerprint: 'rank-' + trial.rank + ':' + trial.seed,
    actualStarterSeat: candidateSeat,
    physicalZoneQualification: { status: PASSED },
    rootActionLedger: [{ action: 'PassTurnAction' }],
    error: null
  };
}

test('preregistration names two different unchanged fixed 60s across four original ranks', () => {
  const info = inspect();
  assert.equal(info.sourceGroups, 16);
  assert.equal(info.twoArmNativeAttempts, 32);
  assert.equal(info.competitiveQualifiedGames, 0);
  assert.equal(new Set(registration.sourceGroups.map(group => group.seed)).size, 16);
});

test('a native engine terminal is distinct from an unreported, capped or error game', () => {
  const trial = registration.registeredTrials[0];
  assert.equal(outcome(row(trial, true)).result, 'W');
  assert.equal(outcome(row(trial, false)).result, 'L');
  assert.equal(outcome(row(trial, false, true)).result, 'C');
  assert.equal(outcome({ ...row(trial), error: 'synthetic failure' }).result, 'C');
});

test('matched source openings admit pairs while missing physical matches remain counted', () => {
  const champ = registration.registeredTrials
    .filter(trial => trial.candidateId === 'champion-reference')
    .map(trial => row(trial));
  const hood = registration.registeredTrials
    .filter(trial => trial.candidateId === 'hood-shield-v1')
    .map(trial => row(trial));
  hood[0].sourceDealFingerprint = 'unmatched genuine source opening';
  const result = compare(champ, hood);
  assert.equal(result.registered.groups, 16);
  assert.equal(result.physicallyMatched.groups, 15);
  assert.equal(result.pairingExcluded.length, 1);
  assert.equal(result.registered.referenceWins, 16);
  assert.equal(result.registered.hoodWins, 16);
  assert.deepEqual(
    [result.registered.hoodMinusReferenceNativeWinsLower,
      result.registered.hoodMinusReferenceNativeWinsUpper], [0, 0]);
  assert.equal(result.paperGamesQualified, 0);
});

test('censored games widen candidate differences without fabricating wins', () => {
  const champ = registration.registeredTrials
    .filter(trial => trial.candidateId === 'champion-reference')
    .map(trial => row(trial, false));
  const hood = registration.registeredTrials
    .filter(trial => trial.candidateId === 'hood-shield-v1')
    .map(trial => row(trial, false));
  champ[0] = row(champ[0].trial, false, true);
  hood[0] = row(hood[0].trial, true);
  champ[1] = row(champ[1].trial, false);
  hood[1] = row(hood[1].trial, false, true);
  const result = compare(champ, hood);
  assert.deepEqual(result.groups[0].nativeWinDifferenceBounds, [0, 1]);
  assert.deepEqual(result.groups[1].nativeWinDifferenceBounds, [0, 1]);
  assert.equal(result.registered.referenceWins, 0);
  assert.equal(result.registered.hoodWins, 1);
  assert.deepEqual([
    result.registered.hoodMinusReferenceNativeWinsLower,
    result.registered.hoodMinusReferenceNativeWinsUpper
  ], [0, 2]);
});
