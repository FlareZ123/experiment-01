'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {
  RECEIPTS,parseReceipts,firstCandidateIndices,reconstruct
}=require('../simulation/evaluation/agent3-native-first-mulligan-reconstruction.cjs');

test('all 48 archived real source setup contexts and 96 first-shuffle decisions replay',()=>{
  const result=reconstruct();
  assert.equal(result.contexts,48);
  assert.equal(result.reconstructedNativeFirstShuffleDecisions,96);
  assert.equal(result.fullFirstShuffleParityWithNativeCounters,true);
  assert.equal(result.observedFirstMulliganDisagreementCount,6);
  assert.equal(result.observedSourceBonusDifferenceCount,5);
  assert.equal(result.observedPhysicalSourceMismatchCount,5);
  assert.deepEqual(result.observedChampionVsMoonFirstMulliganDisagreements,[
    '5:2:A','5:5:A','5:8:B','5:9:A','6:10:B','6:11:B'
  ]);
  assert.equal(result.caveat.includes('No native game'),true);
});

test('identical input cards reordered change which registered source seeds share first mulligan',()=>{
  const {reorderingCounterfactuals:counterfactuals}=reconstruct();
  assert.equal(counterfactuals.maximalBasicOverlap.disagreementCount,4);
  assert.deepEqual(counterfactuals.maximalBasicOverlap.ids,[
    '5:2:A','5:5:A','5:8:B','6:10:B'
  ]);
  assert.equal(counterfactuals.minimalBasicOverlap.disagreementCount,12);
  assert.ok(counterfactuals.minimalBasicOverlap.ids.includes('6:11:B'));
});

test('registered native receipt seed, seat, shape and number identity fail closed',()=>{
  const source=fs.readFileSync(RECEIPTS,'utf8');
  const arr=source.split('\n');
  const first=arr[1];
  const rows=parseReceipts(source);
  assert.equal(rows[0].seed,3464885216);
  assert.deepEqual(firstCandidateIndices(rows[0].seed,1-rows[0].sourceSeat).length,7);
  assert.throws(()=>parseReceipts(source.replace(first,
    first.replace('3464885216','3464885217'))),TypeError);
  assert.throws(()=>parseReceipts(source.replace(first,arr[2])),TypeError);
  assert.throws(()=>parseReceipts(source.replace('5,0,A,1,','5,0,A,0,')),TypeError);
  assert.throws(()=>parseReceipts(source.replace('5,0,A,1,','5,0,C,1,')),TypeError);
});
