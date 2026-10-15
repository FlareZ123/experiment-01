'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const manifest = require('../results/aichi-2026/full-decklists.json');
const { deckSignature, auditCandidate } = require('../scripts/candidate-mirror-gate.cjs');

const baseline = manifest.decks.find(deck => deck.rank === 1);

test('published champion baseline is an exact symmetric-mirror ceiling case', () => {
  const result = auditCandidate(baseline, manifest);
  assert.equal(result.publishedFullListsAudited, 29);
  assert.deepEqual(result.unpublishedRanks, [23, 25, 28]);
  assert.deepEqual(result.exactSourceMirrorRanks, [1]);
  assert.equal(result.conditionalSymmetricMirrorCeiling, 0.984375);
  assert.equal(result.targetExcludedUnderSymmetricMirrorAssumptions, true);
  assert.equal(result.competitiveStrengthVerified, false);
});

test('separating a card row does not evade exact inventory detection', () => {
  const split = structuredClone(baseline);
  split.cards[0].count -= 1;
  split.cards.push({ ...structuredClone(split.cards[0]), count: 1 });
  assert.deepEqual(deckSignature(split), deckSignature(baseline));
  assert.deepEqual(auditCandidate(split, manifest).exactSourceMirrorRanks, [1]);
});

test('changed source printing removes only the exact-printing match', () => {
  const changed = structuredClone(baseline);
  changed.cards[0].printing.number = 'SYNTHETIC-NONMATCH';
  const result = auditCandidate(changed, manifest);
  assert.deepEqual(result.exactSourceMirrorRanks, []);
  assert.equal(result.conditionalSymmetricMirrorCeiling, null);
  assert.equal(result.competitiveStrengthVerified, false);
});

test('malformed candidates and duplicate field ranks are rejected', () => {
  const short = structuredClone(baseline);
  short.cards[0].count -= 1;
  assert.throws(() => auditCandidate(short, manifest), /60-card/);
  const zero = structuredClone(baseline);
  zero.cards[0].count = 0;
  assert.throws(() => auditCandidate(zero, manifest), /Invalid card/);
  const duplicates = { decks: [baseline, baseline] };
  assert.throws(() => auditCandidate(baseline, duplicates), /duplicated/);
});
