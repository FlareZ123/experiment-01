'use strict';
const assert = require('node:assert/strict');
const { loadAichiPublished, toCoverageManifest } = require('../simulation/twinleaf/aichi-source.cjs');

const source = loadAichiPublished();
const coverage = toCoverageManifest(source);
assert.equal(source.published_count, 29);
assert.equal(coverage.decks.length, 29);
assert.deepEqual(source.unpublished_ranks, [23, 25, 28]);
for (const deck of coverage.decks) {
  assert.equal(deck.cards.reduce((sum, x) => sum + x.count, 0), 60);
  assert.ok(deck.cards.every(x => x.printing === null));
}
assert.ok(coverage.decks.find(x => x.rank === 6).cards.some(x => x.name === 'Palace Book'));
console.log('PASS: verified 29-deck source, SHA-256 integrity and card-coverage conversion');
