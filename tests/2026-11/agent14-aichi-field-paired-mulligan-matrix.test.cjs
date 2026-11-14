'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {buildFieldMatrix, loadInputs} =
  require('../../scripts/agent14-aichi-field-paired-mulligan-matrix.cjs');

function close(actual, expected, epsilon = 1e-12) {
  assert.ok(Math.abs(actual - expected) <= epsilon,
    'expected ' + expected + ', received ' + actual);
}

test('field matrix preserves 29 published sixties and three missing ranks', () => {
  const matrix = buildFieldMatrix(loadInputs());
  assert.equal(matrix.candidate.basicCount, 14);
  assert.equal(matrix.publishedDeckCount, 29);
  assert.equal(matrix.totalPlacements, 32);
  assert.deepEqual(matrix.missingFullLists.map(x => x.rank).sort((a,b)=>a-b),
    [23,25,28]);
  assert.equal(matrix.rows.length, 29);
  assert.deepEqual(matrix.strictExpandedIncompatibleRanks, [3,6,7,24,29]);
});

test('four-Basic Iron Thorns rows reproduce Agent12 paired-protocol values', () => {
  const matrix = buildFieldMatrix(loadInputs());
  for (const rank of [6,24,29]) {
    const row = matrix.rows.find(x => x.rank === rank);
    assert.equal(row.basicCount, 4);
    close(row.candidateBonusProbability, 0.5642343175423022);
    close(row.candidateExpectedBonus, 1.4123525560019534);
    close(row.candidateAtLeast5, 0.07336900454006669);
    close(row.opponentBonusProbability, 0.060393062632150364);
    close(row.opponentExpectedBonus, 0.07010959980469617);
    close(row.opponentAtLeast5, 0.000022280409441368315);
  }
});

test('the 14-Basic mirror row is symmetric', () => {
  const row = buildFieldMatrix(loadInputs()).rows.find(x => x.rank === 1);
  assert.equal(row.basicCount, 14);
  close(row.candidateBonusProbability, row.opponentBonusProbability);
  close(row.candidateExpectedBonus, row.opponentExpectedBonus);
});

test('paired bonus-event probabilities normalize and are mutually exclusive', () => {
  for (const row of buildFieldMatrix(loadInputs()).rows) {
    close(row.candidateBonusProbability + row.opponentBonusProbability +
      row.neitherBonusProbability, 1);
    assert.ok(row.candidateBonusProbability >= 0 &&
      row.opponentBonusProbability >= 0 && row.neitherBonusProbability >= 0);
  }
});

test('all-29 and strict-24 sensitivity summaries are reproducible', () => {
  const summaries = buildFieldMatrix(loadInputs()).summaries;
  const all = summaries.all29OriginalAichi;
  const strict = summaries.expandedCompatible24Sensitivity;
  const incompatible = summaries.incompatible5Sensitivity;
  assert.equal(all.n, 29);
  assert.equal(strict.n, 24);
  assert.equal(incompatible.n, 5);
  close(all.meanCandidateExpectedBonus, 0.30401790240400334);
  close(all.meanOpponentExpectedBonus, 0.13066137894345153);
  close(all.meanNetCandidateMinusOpponent, 0.1733565234605518);
  close(strict.meanCandidateExpectedBonus, 0.17153370008556315);
  close(strict.meanOpponentExpectedBonus, 0.13816747652801217);
  close(strict.meanNetCandidateMinusOpponent, 0.03336622355755098);
  close(incompatible.meanNetCandidateMinusOpponent, 0.8453099629949561);
});
