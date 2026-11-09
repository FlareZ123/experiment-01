'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,loadRegistration,paired}=
  require('../../simulation/evaluation/2026-11/agent38-fresh-mew-mail-marnie-hood-64.cjs');

test('all 32 unique registered fresh source openings, 16 per physical seat',()=>{
  const {r,hood,trials,registrationSha256}=loadRegistration();
  assert.equal(r.schema,VERSION);
  assert.equal(registrationSha256.length,64);
  assert.equal(r.anticipatedNativeStoreAttempts,64);
  assert.equal(hood.cards.reduce((s,c)=>s+c.count,0),60);
  assert.equal(new Set(trials.map(x=>x.seed)).size,32);
  assert.equal(trials.filter(x=>x.candidateSlot==='A').length,16);
  assert.equal(trials.filter(x=>x.candidateSlot==='B').length,16);
  assert.ok(trials.every(x=>x.id.endsWith('hood-shield-v1')));
});
test('classify physical Marnie payment and real source winner reversal conservatively',()=>{
  const trial={id:'5:3880:A:hood-shield-v1'};
  const a={trial,fullDeal:'full',sourceDeal:'source',firstTurn:0,
    finished:true,sourceWon:false,sourceAttackDeclarations:1};
  const b={...a,sourceWon:true,sourceAttackDeclarations:4,
    marnieFollowStoreAccepted:1,
    marnieFollowPhysicallyDiscarded:1,
    nativeOpponentReplyAfterMarnie:{action:'PlayCardAction',turn:3}};
  assert.equal(paired(a,b).sourceResultFlipped,true);
  assert.equal(paired(a,b).actualOpponentResponse,true);
  assert.equal(paired(a,{...b,marnieFollowPhysicallyDiscarded:0}).paidMarnie,false);
  assert.equal(paired(a,{...b,fullDeal:'different'}).sourceResultFlipped,false);
  assert.equal(paired(a,{...b,sourceDeal:'different'}).sourceResultFlipped,false);
  assert.equal(paired(a,{...b,firstTurn:1}).sourceResultFlipped,false);
  assert.equal(paired(a,{...b,finished:false}).sourceResultFlipped,false);
  assert.equal(paired(a,{...b,nativeOpponentReplyAfterMarnie:null}).actualOpponentResponse,false);
});
