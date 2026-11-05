'use strict';

const assert = require('node:assert/strict');
const {test} = require('node:test');
const {
  E_THRESHOLD, FIELD_RANKS, FIELD_TARGET, NECESSARY_RANK_WIN_RATE,
  rankLogEValue, assessEarlyFieldRejection
} = require('../simulation/evaluation/agent7-aichi-995-early-rejection.cjs');

const candidateId = 'synthetic-frozen-60-for-mathematics-only';
const record = (id, originalRank, outcome, sourceSeat = 0) => ({
  id, candidateId, originalRank, outcome, sourceSeat,
  // These SFT rows are synthetic; the analyzer cannot verify this label.
  seatAssignment: 'INDEPENDENT_FAIR_COIN',
  qualification: 'QUALIFIED'
});

test('SFT exact necessary per-rank target and rank familywise rejection threshold', () => {
  assert.equal(FIELD_RANKS, 32);
  assert.equal(FIELD_TARGET, 0.995);
  assert.ok(Math.abs((31 + NECESSARY_RANK_WIN_RATE) / 32 - 0.995) < 1e-12);
  assert.equal(E_THRESHOLD, 640);
  assert.ok(Math.abs(rankLogEValue(0, 0)) < 1e-12);
});

test('SFT three synthetic nonwins do not reject; fourth triggers anytime gate', () => {
  const attempts = [1, 2, 3, 4].map(i => record(`synthetic-${i}`, 6, 'loss'));
  const first = assessEarlyFieldRejection(attempts.slice(0, 3), candidateId);
  const second = assessEarlyFieldRejection(attempts, candidateId);
  assert.equal(first.rejectionFlag, false);
  assert.equal(second.rejectionFlag, true);
  assert.equal(second.firstCrossing.ordinal, 4);
  assert.equal(second.firstCrossing.originalRank, 6);
  assert.ok(Math.exp(second.firstCrossing.rankLogEValue) >= E_THRESHOLD);
  assert.equal(second.opponentRanksObserved, 1);
  assert.equal(second.qualificationVerifiedExternally, false);
  console.log('EARLY_REJECTION_SYNTHETIC', JSON.stringify({
    threeNonwinsE: Math.exp(first.ranks[5].logEValue),
    fourNonwinsE: Math.exp(second.ranks[5].logEValue),
    threshold: E_THRESHOLD, conditionalOnly: true
  }));
});

test('SFT interleaved rank scheduling preserves each own-rank evidence path', () => {
  const games = [
    record('rank6-a', 6, 'tie'), record('rank11-a', 11, 'win'),
    record('rank6-b', 6, 'loss'), record('rank11-b', 11, 'win'),
    record('rank6-c', 6, 'loss'), record('rank6-d', 6, 'loss')
  ];
  const result = assessEarlyFieldRejection(games, candidateId);
  assert.equal(result.firstCrossing.ordinal, 6);
  assert.equal(result.firstCrossing.originalRank, 6);
  assert.equal(result.ranks[10].wins, 2);
  assert.equal(result.ranks[5].nonwins, 4);
});

test('SFT all 32 rank single-win observations cannot certify or reject target', () => {
  const games = Array.from({length: 32}, (_, i) =>
    record(`synthetic-rank-${i+1}`, i+1, 'win'));
  const result = assessEarlyFieldRejection(games, candidateId);
  assert.equal(result.rejectionFlag, false);
  assert.equal(result.opponentRanksObserved, 32);
  assert.ok(result.ranks.every(row => row.wins === 1 && row.nonwins === 0));
  assert.match(result.interpretation, /not evidence of the 99.5-percent/);
});

test('SFT duplicate trial, unqualified engine root, deck swap and rank outside field fail closed', () => {
  const old = record('same-id', 5, 'win');
  assert.throws(() => assessEarlyFieldRejection([old, {...old}], candidateId), /unique ID/);
  assert.throws(() => assessEarlyFieldRejection([{...old, qualification:'ENGINE_ONLY'}], candidateId), /QUALIFIED/);
  assert.throws(() => assessEarlyFieldRejection([{...old, candidateId:'different-60'}], candidateId), /cannot mix/);
  assert.throws(() => assessEarlyFieldRejection([{...old, originalRank:33}], candidateId));
  assert.throws(() => assessEarlyFieldRejection([{...old, outcome:'censored'}], candidateId));
  assert.throws(() => assessEarlyFieldRejection([{...old, sourceSeat:2}], candidateId), /source physical seat/);
  assert.throws(() => assessEarlyFieldRejection([{
    ...old, seatAssignment:'DETERMINISTIC_ALTERNATION'
  }], candidateId), /independent fair seat/);
});

test('SFT log scale remains finite after many nonwins instead of overflowing evidence', () => {
  const logE = rankLogEValue(0, 10000);
  assert.ok(Number.isFinite(logE));
  assert.ok(logE > Math.log(E_THRESHOLD));
});

test('SFT exact 10-game null-boundary sequential crossing probability respects familywise allocation', () => {
  const horizon = 10;
  const boundaryWinRate = NECESSARY_RANK_WIN_RATE;
  let falseRejectionProbability = 0;
  for (let mask = 0; mask < (1 << horizon); mask++) {
    let wins = 0;
    let nonwins = 0;
    let crossed = false;
    for (let index = 0; index < horizon; index++) {
      if ((mask & (1 << index)) !== 0) wins++;
      else nonwins++;
      if (rankLogEValue(wins, nonwins) >= Math.log(E_THRESHOLD))
        crossed = true;
    }
    if (crossed) {
      falseRejectionProbability +=
        boundaryWinRate ** wins * (1 - boundaryWinRate) ** nonwins;
    }
  }
  assert.ok(Math.abs(falseRejectionProbability - 0.000745824896155648) < 1e-12);
  assert.ok(falseRejectionProbability <= 0.05 / FIELD_RANKS);
});
