'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const registration = require('../../results/aichi-2026/registrations/agent12-thorns-vs-champion-eight-rank-screen-20261109.json');
const {pairedContribution, compare} =
  require('../../simulation/evaluation/2026-11/agent12-thorns-fixed60-eight-rank-native.cjs');

test('censored binary outcomes use sharp partial-identification bounds', () => {
  assert.deepEqual(pairedContribution(1, 0), {low:-1, high:-1});
  assert.deepEqual(pairedContribution(0, 1), {low:1, high:1});
  assert.deepEqual(pairedContribution(1, null), {low:-1, high:0});
  assert.deepEqual(pairedContribution(0, null), {low:0, high:1});
  assert.deepEqual(pairedContribution(null, 1), {low:0, high:1});
  assert.deepEqual(pairedContribution(null, 0), {low:-1, high:0});
  assert.deepEqual(pairedContribution(null, null), {low:-1, high:1});
});

function batch(index) {
  return {rows:registration.batches[index].registeredTrials.map(trial => ({
    trial, finished:true,
    winner:index === 0 ? (trial.candidateSlot === 'A' ? 0 : 1) :
      (trial.candidateSlot === 'A' ? 1 : 0),
    actualStarterSeat:trial.candidateSlot === 'A' ? 0 : 1,
    sourceDealFingerprint:'source'+trial.rank+trial.candidateSlot,
    fullPhysicalDealFingerprint:'full'+index+trial.rank+trial.candidateSlot,
    rootActionLedger:[], turns:12, finalPrizes:[6,0]
  }))};
}

test('all sixteen fully paired champion wins certify negative native difference', () => {
  const output = compare(batch(0), batch(1));
  assert.equal(output.summary.registeredGroups,16);
  assert.equal(output.summary.nativeAttempts,32);
  assert.equal(output.summary.sourceMatched,16);
  assert.equal(output.summary.bothTerminalMatched,16);
  assert.deepEqual(output.summary.sharpThornsMinusChampionNativeWinCount,
    {low:-16, high:-16});
  assert.equal(output.field[0].nativeWins,16);
  assert.equal(output.field[1].nativeWins,0);
  assert.equal(output.summary.competitivelyQualifiedGames,0);
});

test('censor and physically mismatched deal are not scored as automatic losses', () => {
  const a=batch(0), b=batch(1);
  b.rows[1].finished=false;
  b.rows[1].winner=null;
  b.rows[2].sourceDealFingerprint='a-different-deal';
  const output=compare(a,b);
  assert.equal(output.summary.sourceMatched,15);
  assert.equal(output.summary.bothTerminalMatched,14);
  assert.equal(output.summary.unmatched,1);
  assert.deepEqual(output.summary.sharpThornsMinusChampionNativeWinCount,
    {low:-15,high:-14});
  assert.equal(output.rows[1].thorns.candidateWins,null);
  assert.equal(output.rows[1].thorns.nativeDisposition,'right-censored');
  assert.equal(output.rows[2].bounds,null);
  assert.equal(output.field[1].censored,1);
});
