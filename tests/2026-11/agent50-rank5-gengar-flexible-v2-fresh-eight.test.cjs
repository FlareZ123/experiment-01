'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');
const {
  registered,analyzePairs,REG_PATH
}=require('../../simulation/evaluation/2026-11/agent50-rank5-gengar-flexible-v2-fresh-eight.cjs');
const reg=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../..',REG_PATH),'utf8'));
test('fresh v2 registration has independent eight seeds and four candidate seats each',()=>{
 const trials=registered(reg);
 assert.equal(trials.length,8);
 assert.equal(new Set(trials.map(x=>x.seed)).size,8);
 assert.deepEqual(trials.filter(x=>x.candidateSlot==='A').length,4);
 assert.deepEqual(trials.filter(x=>x.candidateSlot==='B').length,4);
 assert.ok(!trials.some(x=>x.seed===3861605836));
 const previous=new Set([2025901336,261622229,3638127115,4084046070,
   3090340982,4234343889,1594960417,2885955032]);
 assert.ok(trials.every(x=>!previous.has(x.seed)));
});
test('v2 candidate winner envelope preserves unknown native censored games',()=>{
 const pairs=[{sameInitialPhysicalDeal:true,
   control:{candidateWon:false},treatment:{candidateWon:true}},
   {sameInitialPhysicalDeal:true,
   control:{candidateWon:null},treatment:{candidateWon:null}}];
 assert.deepEqual(analyzePairs(pairs)
   .sharpCandidateWinDifferenceEnvelopeOnMatchedPairs,[0,2]);
});
