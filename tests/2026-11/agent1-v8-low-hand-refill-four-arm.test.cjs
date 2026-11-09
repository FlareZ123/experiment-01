'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {REGISTRATION,VERSION,continuation}=
  require('../../simulation/evaluation/agent1-v8-low-hand-refill-four-arm.cjs');

test('frozen registered original rank3/1 paired seats and exact seeds',()=>{
  assert.equal(VERSION,'agent1-v8-low-hand-refill-native-four-arm-v2-deal-parity');
  assert.equal(REGISTRATION.trials.length,4);
  assert.deepEqual(new Set(REGISTRATION.trials.map(x=>x.seed)),
    new Set([2404595552,948758444]));
  assert.deepEqual(new Set(REGISTRATION.trials.map(x=>x.sourceSeat)),
    new Set([0,1]));
});

test('refill continuation must have opponent strategy then next source own turn',()=>{
  const root={ordinal:2,seat:1,turn:2,ownerHeldRefillAction:true,
    action:'PlayCardAction'};
  const opponent={ordinal:5,seat:0,turn:3,action:'PlayCardAction'};
  const source={ordinal:8,seat:1,turn:4,action:'AttackAction'};
  assert.equal(continuation(root,[root,opponent,source]).passed,true);
  assert.equal(continuation(root,[root,opponent,{...source,turn:3}]).passed,false);
  assert.equal(continuation(root,[root,
    {...opponent,action:'PassTurnAction'},source]).passed,false);
  assert.throws(()=>continuation(root,[]));
});
