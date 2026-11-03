'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {preflight,narrowEvidence,BLOB}=
  require('../simulation/evaluation/agent42-selected-v3-rank1-independent-heldout.cjs');
test('fresh eight source RNG seed groups, two candidates and both seats are frozen',()=>{
 const {r}=preflight();
 assert.equal(BLOB,'7bdaa9c551ae1ce5d4bb818e71c21c8675a355f8');
 assert.equal(r.independentSeedGroups,8);
 assert.equal(r.trials.length,16);
 assert.equal(r.nativeAttempts,48);
 assert.equal(r.actionCap,240);
 assert.equal(r.originalAichiSourceRank,1);
 assert.equal(r.trials.filter(x=>x.candidateSlot==='A').length,8);
 assert.equal(r.trials.filter(x=>x.candidateSlot==='B').length,8);
 assert.equal(new Set([...r.seeds.A,...r.seeds.B]).size,8);
 assert.ok(![...r.seeds.A,...r.seeds.B].includes(1122744069));
});
test('future opponent prompt alone cannot create a paid rescue or response',()=>{
 const r=narrowEvidence({trial:{id:'1:430:A:champion-reference',
   rank:1,candidateSlot:'A'},rootActionLedger:[
   {actionOrdinal:1,playerSlot:1,action:'PlayCardAction',card:'Float Stone',turnBefore:1},
   {actionOrdinal:2,playerSlot:1,action:'RetreatAction',turnBefore:1},
   {actionOrdinal:3,playerSlot:1,action:'AttackAction',attack:'Max Geist',turnBefore:1},
   {actionOrdinal:4,playerSlot:0,action:'ResolvePromptAction',pendingPrompt:'ChoosePokemonPrompt',turnBefore:1}
  ],sourceAttackSettlement:{attacks:[]}});
 assert.equal(r.settledSourceFloatStoneRescues,0);
 assert.equal(r.settledSourceRescuesWithOpponentNonprompt,0);
 assert.equal(r.paperQualifiedGames,0);
});
test('source seat B is original physical seat zero, independent of candidate policy',()=>{
 const r=narrowEvidence({trial:{id:'1:430:B:new-moon-lockbreaker-v1',
   rank:1,candidateSlot:'B'},rootActionLedger:[]});
 assert.equal(r.sourceSeat,0);
 assert.equal(r.paperQualifiedGames,0);
});
