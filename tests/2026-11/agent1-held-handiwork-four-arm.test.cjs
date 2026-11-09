'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {REGISTRATION,VERSION,continuation,physicalDealsMatch}=
  require('../../simulation/evaluation/agent1-v8-held-handiwork-four-arm.cjs');

test('comparison holds fixed 60s, two seeds and both source seats',()=>{
  assert.equal(VERSION,'agent1-held-handiwork-v8-native-registered-four-arm-v2-deal-parity');
  assert.equal(REGISTRATION.trials.length,4);
  assert.deepEqual(new Set(REGISTRATION.trials.map(row=>row.seed)),
    new Set([2404595552,948758444]));
  assert.deepEqual(new Set(REGISTRATION.trials.map(row=>row.sourceSeat)),
    new Set([0,1]));
});

test('requires opponent strategy and owner own-turn source continuation',()=>{
  const held={ordinal:5,seat:0,turn:2,
    action:'PlayCardAction',ownerHeldHandiworkAction:true};
  const opponent={ordinal:10,seat:1,turn:3,action:'PlayCardAction'};
  const source={ordinal:18,seat:0,turn:4,action:'AttackAction'};
  assert.equal(continuation(held,[held,opponent,source]).passed,true);
  assert.equal(continuation(held,[held,opponent,
    {...source,turn:3,action:'ResolvePromptAction'}]).passed,false);
  assert.equal(continuation(held,[held,
    {...opponent,action:'PassTurnAction'},source]).passed,false);
  assert.throws(()=>continuation(held,[]));
});

test('physical parity requires both 64-hex original-source and full-deal receipts',()=>{
  const a={sourceDealFingerprint:'a'.repeat(64),
    fullPhysicalDealFingerprint:'b'.repeat(64)};
  const same={...a};
  assert.equal(physicalDealsMatch(a,same),true);
  assert.equal(physicalDealsMatch(a,{...same,sourceDealFingerprint:'c'.repeat(64)}),false);
  assert.equal(physicalDealsMatch(a,{...same,fullPhysicalDealFingerprint:'d'.repeat(64)}),false);
  assert.equal(physicalDealsMatch(a,{...same,fullPhysicalDealFingerprint:null}),false);
  assert.equal(physicalDealsMatch(a,{...same,sourceDealFingerprint:undefined}),false);
  assert.equal(physicalDealsMatch(a,{...same,fullPhysicalDealFingerprint:'bad'}),false);
  assert.equal(physicalDealsMatch(null,same),false);
});
