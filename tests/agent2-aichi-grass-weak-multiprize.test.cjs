'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const {main} = require('../scripts/agent2-aichi-grass-weak-multiprize.cjs');
test('exact source printing Grass-weak multi-Prize census', () => {
  const r = main();
  assert.equal(r.publishedDecks, 29);
  assert.equal(r.distinctPrintedPokemon, 102);
  assert.deepEqual(r.relevantRanks, [8,9,11,16,19,22]);
  assert.equal(r.multiPrize.length, 4);
  assert.equal(r.sourceSlots, 13);
  assert.equal(r.qualifiedForCompetitiveInference, false);
});
