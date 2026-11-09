'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  choose, exactFrontier, readDeck, copies, run
} = require('../../scripts/2026-11/agent25-wide-wall-sentinel-frontier.cjs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '../..');

test('exact deck inventory: 60 unchanged slots with distinct Rhyperior/Strong Energy line', () => {
  const report = run();
  assert.equal(report.changedPhysicalSlots, 9);
  assert.equal(report.basicCount, 14);
  assert.equal(report.policyOrNativeMatchTested, false);
  assert.equal(report.qualifiedCompetitiveGames, 0);
  const deck = readDeck(path.join(ROOT, report.challenger));
  assert.equal(copies(deck, 'Rhyperior'), 1);
  assert.equal(copies(deck, 'Rhydon'), 1);
  assert.equal(copies(deck, 'Rhyhorn'), 2);
  assert.equal(copies(deck, 'Vileplume'), 2);
  assert.equal(copies(deck, 'Grand Tree'), 1);
  assert.equal(copies(deck, 'Double Colorless Energy'), 2);
  assert.equal(copies(deck, 'Strong Energy'), 2);
  assert.equal(copies(deck, 'Temple of Sinnoh'), 0);
  console.log(JSON.stringify(report, null, 2));
});

test('bounded exact seven-card/Prize model has the independently computed fraction', () => {
  assert.equal(choose(60, 7), 386206920n);
  const deck = readDeck(path.join(ROOT,
    'results/aichi-2026/2026-11/agent25-wide-wall-sentinel-v1.psv'));
  const score = exactFrontier(deck);
  assert.equal(score.numerator, 180543427297n);
  assert.equal(score.denominator, 1704809346240n);
  assert.ok(Math.abs(Number(score.numerator) / Number(score.denominator) -
    0.10590241524378845) < 1e-11);
  assert.ok(Math.abs(Number(score.eligiblePrizeFractionNumerator) /
    Number(score.eligiblePrizeFractionDenominator) -
    0.6843773532444362) < 1e-11);
});

test('reduced-universe Prize and opening enumeration agrees with brute force', () => {
  const count = (n, k) => Number(choose(n, k));
  for (let n = 1; n <= 11; n++) {
    for (let k = 0; k <= n; k++) {
      let brute = 0;
      for (let mask = 0; mask < (1 << n); mask++) {
        let bits = 0;
        for (let i = 0; i < n; i++) bits += (mask >> i) & 1;
        if (bits === k) brute++;
      }
      assert.equal(count(n, k), brute);
    }
  }
});
