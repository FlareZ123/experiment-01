'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {evaluate} =
  require('../simulation/evaluation/agent1-rank17-compressor-postprompt-native.cjs');

const setup={registered:{schema:'mock-native',
  sourcePhysicalSeeds:[2208314832,4010383176],
  priorObservedNativeRun:41591371975},source:{}};
function fake(_source,seed,bridgeOn){
  return {error:null,seed,bridgeOn,
    deckAHash:'candidate',deckBHash:'source',
    actualInitialFullDealHash:'physical-'+seed,
    actualFirstPlayer:1,
    custody:bridgeOn?{verifiedPhysicalSelections:1,completeNonemptyMoves:1}:
      {verifiedPhysicalSelections:0,completeNonemptyMoves:0}};
}
test('exact two retrospective source cohorts remain separate matched pairs',()=>{
  const result=evaluate(fake,setup);
  assert.equal(result.attemptedNativeArms,4);
  assert.equal(result.completePairs,2);
  assert.equal(result.matchedPairs,2);
  assert.equal(result.verifiedSelections,2);
  assert.equal(result.allReceiptPairs,2);
  assert.equal(result.certifiedWinRate,null);
  assert.equal(result.competitiveQualifiedGames,0);
});
test('source physical mismatch remains explicit and excluded from matched count',()=>{
  const result=evaluate((source,seed,on)=>{
    const out=fake(source,seed,on);
    if(seed===2208314832&&on)out.actualInitialFullDealHash='unexpected';
    return out;
  },setup);
  assert.equal(result.completePairs,2);
  assert.equal(result.matchedPairs,1);
});
test('real Store failure is retained without inventing a paid witness',()=>{
  const result=evaluate((source,seed,on)=>{
    const out=fake(source,seed,on);
    if(seed===4010383176&&on){out.error='UNKNOWN_POWER';out.custody=null;}
    return out;
  },setup);
  assert.equal(result.completePairs,1);
  assert.equal(result.matchedPairs,1);
  assert.equal(result.verifiedSelections,1);
  assert.ok(result.pairs.some(p=>p.treatment.error==='UNKNOWN_POWER'));
});
