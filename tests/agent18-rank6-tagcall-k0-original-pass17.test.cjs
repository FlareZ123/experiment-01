'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  conditionalK0DeckTargetProbability:chance,
  rank6OriginalRoot17TagCallK0:source
}=require('../simulation/evaluation/agent18-rank6-tagcall-k0-original-pass17.cjs');
test('exact observed rank6 K0 chance is 1311 of 1326 combinations',()=>{
  const row=source();
  assert.equal(row.probability,1311/1326);
  assert.equal(row.prizedOutProbability,15/1326);
  assert.equal(row.guaranteedInDeck,0);
  assert.equal(row.originalSourceNativeStoreSearchExecuted,false);
  assert.equal(row.actualPrizeIdentityKnownToSource,false);
  assert.equal(row.competitivelyQualifiedGames,0);
});
test('more unseen copies than face-down prizes guarantees one in deck',()=>{
  const row=chance({deckCount:40,prizeCount:6,eligibleUnseenCopies:7});
  assert.equal(row.probability,1);
  assert.equal(row.guaranteedInDeck,1);
});
test('no unseen eligible copies implies a dead search for target',()=>{
  assert.equal(chance({deckCount:40,prizeCount:6,
    eligibleUnseenCopies:0}).probability,0);
});
test('zero Prize cards imply any unseen copy must be in deck',()=>{
  const row=chance({deckCount:20,prizeCount:0,
    eligibleUnseenCopies:2});
  assert.equal(row.probability,1);
  assert.equal(row.guaranteedInDeck,2);
});
test('single remaining copy follows deck fraction',()=>{
  const row=chance({deckCount:46,prizeCount:6,
    eligibleUnseenCopies:1});
  assert.equal(row.probability,46/52);
});
test('unknown copies cannot exceed total hidden zone',()=>{
  assert.throws(()=>chance({deckCount:4,prizeCount:6,
    eligibleUnseenCopies:11}),{name:'AssertionError'});
});
test('negative and fractional counts cannot contaminate result',()=>{
  for(const bad of [-1,0.5,NaN,Infinity]){
    assert.throws(()=>chance({deckCount:46,prizeCount:6,
      eligibleUnseenCopies:bad}),{name:'AssertionError'});
  }
});
