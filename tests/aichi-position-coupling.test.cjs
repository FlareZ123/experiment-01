'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  expandPrintings, samplingProbability, auditAlignment, alignToReference
} = require('../scripts/aichi-position-coupling.cjs');

const dir = path.resolve(__dirname, '../results/aichi-2026');
const full = JSON.parse(fs.readFileSync(path.join(dir, 'full-decklists.json'), 'utf8'));
const champion = expandPrintings(full.decks.find(d => d.rank === 1).cards);
const hood = expandPrintings(JSON.parse(fs.readFileSync(
  path.join(dir, 'candidate-hood-shadow-rider.json'), 'utf8')).cards);
const temple = expandPrintings(JSON.parse(fs.readFileSync(
  path.join(dir, 'candidate-temple-shadow-rider.json'), 'utf8')).cards);

/** @param {number} a @param {number} b */
function near(a, b) {
  assert.ok(Math.abs(a - b) < 1e-12, String(a) + ' differs from ' + String(b));
}

test('exact-print source row order exhibits weak baseline candidate coupling', () => {
  const pairs = [
    [champion, hood, 28, 55, 0.003065817671003927],
    [champion, temple, 19, 55, 0.00013046892065010125],
    [hood, temple, 38, 56, 0.03267744658744074]
  ];
  for (const [a, b, observed, shared, p] of pairs) {
    const result = auditAlignment(a, b);
    assert.equal(result.matchingPositions, observed);
    assert.equal(result.sharedCopies, shared);
    near(result.observedSeven, p);
    assert.ok(result.attainableSeven > result.observedSeven);
  }
});

test('reference alignment achieves theoretical positional overlap without changing printings', () => {
  for (const variant of [hood, temple]) {
    const saved = [...variant];
    const aligned = alignToReference(champion, variant);
    assert.equal(auditAlignment(champion, aligned).matchingPositions, 55);
    assert.deepEqual(aligned.slice().sort(), variant.slice().sort());
    assert.deepEqual(variant, saved);
    near(auditAlignment(champion, aligned).observedSeven, 0.5254378274734176);
  }
});

test('probability is hypergeometric and handles all-overlap and no-overlap', () => {
  near(samplingProbability(55, 13), 0.2808634312256386);
  near(samplingProbability(56, 7), 0.6005003742553344);
  assert.equal(samplingProbability(0, 7), 0);
  assert.equal(samplingProbability(60, 7), 1);
  assert.deepEqual(alignToReference(champion, champion), champion);
  assert.throws(() => samplingProbability(-1, 7), /Invalid sampling dimensions/);
  assert.throws(() => samplingProbability(55, 61), /Invalid sampling dimensions/);
  assert.throws(() => auditAlignment(champion.slice(1), hood), /60-card/);
  assert.throws(() => expandPrintings([{name:'Test',count:1,
    printing:{set:'X',number:'1'}}]), /60 card copies/);
});
