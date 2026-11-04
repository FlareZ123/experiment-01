'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {openingCardinality,fromRepository}=
  require('../scripts/agent30-owner-setup-bench-cardinality.cjs');

test('exact conditional hand counts certify two physically different initial boards',()=>{
  const four=openingCardinality(4);
  assert.equal(four.eligibleValidOpeningHands,'154289520');
  assert.equal(four.differentPhysicalStartingBoardsNumerator,'24415776');
  assert.equal(four.expectedAdditionalGreedyBenchNumerator,'25940376');
  assert.ok(Math.abs(four.differentPhysicalStartingBoardsProbability-
    0.15824649658641754)<1e-12);
  assert.ok(Math.abs(four.expectedAdditionalGreedyBench-
    0.16812791951131872)<1e-12);

  const sixteen=openingCardinality(16);
  assert.equal(sixteen.eligibleValidOpeningHands,'347886352');
  assert.equal(sixteen.differentPhysicalStartingBoardsNumerator,'234941520');
  assert.equal(sixteen.expectedAdditionalGreedyBenchNumerator,'373021792');
  assert.ok(Math.abs(sixteen.differentPhysicalStartingBoardsProbability-
    0.6753398592653039)<1e-12);
  assert.ok(Math.abs(sixteen.expectedAdditionalGreedyBench-
    1.0722518714962408)<1e-12);
});

test('one Basic changes no initial Board; all-Basic seven obeys five Bench limit',()=>{
  const only=openingCardinality(1);
  assert.equal(only.differentPhysicalStartingBoardsProbability,0);
  assert.equal(only.expectedAdditionalGreedyBench,0);
  const full=openingCardinality(60);
  assert.equal(full.differentPhysicalStartingBoardsProbability,1);
  assert.equal(full.expectedAdditionalGreedyBench,5);
  assert.deepEqual(full.byBasicCopies.filter(row=>
    BigInt(row.validOpeningHands)>0n).map(row=>row.selectedByGreedy),[6]);
});

test('every authenticated original sixty gets a direct stage-authenticated Basic count',()=>{
  const result=fromRepository();
  const byRank=[
    [1,14],[2,14],[3,11],[4,13],[5,11],[6,4],[7,12],[8,10],
    [9,11],[10,15],[11,11],[12,15],[13,11],[14,14],[15,14],
    [16,11],[17,13],[18,16],[19,16],[20,14],[21,14],[22,12],
    [24,4],[26,12],[27,15],[29,4],[30,16],[31,15],[32,13]
  ];
  assert.equal(result.sourceRosterSha256.length,64);
  assert.deepEqual(result.rows.map(row=>[row.rank,row.totalBasicCopies]),byRank);
  assert.deepEqual(result.missingOriginalRanks,[23,25,28]);
  assert.equal(result.originalSourceDecks,29);
  assert.ok(Math.abs(result.equalOriginalMeanPhysicalBoardDifferenceProbability-
    0.5298270254543347)<1e-12);
  assert.ok(Math.abs(result.equalOriginalMeanAdditionalGreedyBench-
    0.7631133185040354)<1e-12);
  assert.equal(result.interpretation.qualifiedCompetitiveGames,0);
});
