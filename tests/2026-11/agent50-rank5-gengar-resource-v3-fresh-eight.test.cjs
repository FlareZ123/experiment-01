'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');
const {registered,analyzePairs,REG_PATH}=
 require('../../simulation/evaluation/2026-11/agent50-rank5-gengar-resource-v3-fresh-eight.cjs');
const reg=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../..',REG_PATH),'utf8'));
test('v3 preregistration uses eight distinct and genuinely new both-seat openings',()=>{
 const trials=registered(reg);
 assert.equal(trials.length,8);
 assert.equal(new Set(trials.map(x=>x.seed)).size,8);
 assert.equal(trials.filter(x=>x.candidateSlot==='A').length,4);
 assert.equal(trials.filter(x=>x.candidateSlot==='B').length,4);
 const previous=new Set([3861605836,2025901336,261622229,3638127115,
  4084046070,3090340982,4234343889,1594960417,2885955032,
  1761343135,1092933510,1569489968,1356861919,895772782,
  1114148076,833482661,679423193]);
 assert.ok(trials.every(x=>!previous.has(x.seed)));
});
test('resource-preservation report retains loss and cap in exact paired result',()=>{
 const p=[{sameInitialPhysicalDeal:true,
  control:{candidateWon:true},treatment:{candidateWon:false}},
 {sameInitialPhysicalDeal:true,
  control:{candidateWon:null},treatment:{candidateWon:true}}];
 assert.deepEqual(analyzePairs(p)
  .sharpCandidateWinDifferenceEnvelopeOnMatchedPairs,[-1,0]);
});
