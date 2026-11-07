'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  jointAccessByDraws,
  accessWithOpponentMulligans,
  main
} = require('../scripts/new-moon-lockbreak-joint-access.cjs');

test('joint dual-counter access is exact after the first mandatory draw', () => {
  const result = jointAccessByDraws(1);
  assert.equal(String(result.direct.n), '58575077');
  assert.equal(String(result.direct.d), '1103593454');
  assert.equal(String(result.withSecretBox.n), '11937071285');
  assert.equal(String(result.withSecretBox.d), '121947076667');
  assert.ok(result.withSecretBox.n * result.direct.d >=
    result.direct.n * result.withSecretBox.d);
});

test('all opponent-mulligan bonus cards give only a modest joint-access increase', () => {
  const result = accessWithOpponentMulligans();
  assert.ok(Math.abs(result.directBoth.probability - 0.07711850825434904) < 1e-12);
  assert.ok(Math.abs(result.withSecretBoxUpperBound.probability - 0.1376658266262376) < 1e-12);
  assert.ok(Math.abs(result.chanceAtLeastOneBonus.probability - 0.5794279437440825) < 1e-12);
  assert.ok(Math.abs(result.chanceAtLeastThreeBonuses.probability - 0.20894212181283583) < 1e-12);
  assert.equal(result.distributionTotal.probability, 1);
});

test('Secret Box upper bound is below fourteen percent even after all optional bonuses', () => {
  const result = accessWithOpponentMulligans();
  assert.ok(result.withSecretBoxUpperBound.probability >= result.directBoth.probability);
  assert.ok(result.withSecretBoxUpperBound.probability < 0.14);
});

test('main validates the fixed 60 and all three four-Basic Iron Thorns opponents', () => {
  const report = main();
  assert.equal(report.candidate.totalCards, 60);
  assert.equal(report.candidate.basics, 17);
  assert.equal(report.candidate.fieldBlowerCopies, 2);
  assert.equal(report.candidate.cologneCopies, 2);
  assert.equal(report.candidate.secretBoxCopies, 1);
  assert.deepEqual(report.opponent.ironThornsRanks, [6, 24, 29]);
  assert.equal(report.opponent.basicCount, 4);
});
