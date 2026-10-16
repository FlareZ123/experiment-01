'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { forestSealCensus, runCensus } =
  require('../scripts/aichi-forest-seal-census.cjs');

test('Aichi 2026 published source printing inventory is stable', () => {
  const actual = runCensus();
  assert.equal(actual.publishedDecks, 29);
  assert.equal(actual.affectedDecks, 12);
  assert.equal(actual.copies, 13);
  assert.deepEqual(actual.ranks, [1, 3, 4, 5, 8, 9, 11, 16, 19, 22, 26, 30]);
  assert.equal(actual.cardsByRank.find(row => row.rank === 11).copies, 2);
});

test('census is printing-specific and not a generic Stone name match', () => {
  const result = forestSealCensus({ decks: [
    {rank:1,cards:[{name:'Forest Seal Stone',count:2,printing:{set:'SIT',number:'156'}}]},
    {rank:2,cards:[{name:'Forest Seal Stone',count:4,printing:{set:'FAKE',number:'1'}}]},
    {rank:3,cards:[{name:'Stone Something',count:3,printing:{set:'SIT',number:'156'}}]}
  ]});
  assert.equal(result.publishedDecks, 3);
  assert.equal(result.affectedDecks, 1);
  assert.equal(result.copies, 2);
  assert.deepEqual(result.ranks, [1]);
});
