'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,witness}=require('../simulation/evaluation/agent9-rank5-quickball-payment-pair.cjs');
const {chooseActorHandDiscard}=
  require('../simulation/twinleaf/agent47-actor-hand-discard.cjs');
test('actor hand-payment default chooses a duplicate over singleton ACE SPEC',()=>{
  assert.equal(VERSION,'agent9-rank5-source-qb-payment-pair-v1');
  const input={actor:{decisionKind:'owner-prompt',
    ownHand:['Quick Ball FST','Secret Box TWM','Switch SVI','Switch SVI']},
    prompt:{menu:[['Secret Box TWM'],['Switch SVI']]}};
  assert.deepEqual(chooseActorHandDiscard(input),{printings:['Switch SVI']});
});
test('payment runner preserves missing native rows as explicit missing evidence',()=>{
  assert.deepEqual(witness({rawNativeRow:null,trial:{candidateSlot:'A'}}),{
    nativeStatus:'NATIVE_MISSING',sourceSeat:1,
    sourceQuickBall:null,sourceAttacks:null,sourceDceAttachments:null,
    handDiscardAudit:null});
});
