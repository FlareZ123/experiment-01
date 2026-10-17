'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {audit} = require('../scripts/aichi-telepath-source-inventory.cjs');

test('exact published field Telepath source printing census', () => {
  const result = audit();
  assert.equal(result.schema, 'aichi-telepath-source-inventory-v1');
  assert.equal(result.publishedExactDecks, 29);
  assert.equal(result.benchmarkPlacements, 32);
  assert.deepEqual(result.unpublishedPlacements, [23, 25, 28]);
  assert.equal(result.observedTelepathRanks, 3);
  assert.equal(result.observedTelepathCopies, 6);
  assert.deepEqual(result.ranks.map(row => [row.rank, row.telepathCopies]), [
    [9, 1], [30, 2], [31, 3]
  ]);
  for (const row of result.ranks) {
    assert.deepEqual(row.telepathPrintings, [
      {set: 'POR', number: '88', count: row.telepathCopies}
    ]);
  }
  const rank30 = result.ranks.find(row => row.rank === 30);
  assert.deepEqual([rank30.miniorCopies, rank30.wondrousPatchCopies, rank30.raihanCopies],
    [1, 4, 1]);
});
