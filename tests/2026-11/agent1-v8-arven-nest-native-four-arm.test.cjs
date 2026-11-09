'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {VERSION,REGISTRATION,continuation} =
  require('../../simulation/evaluation/agent1-v8-arven-nest-native-four-arm.cjs');

test('same 4 original physical source deals in both seats',()=>{
  assert.equal(VERSION,'agent1-native-owner-arven-nest-bench-four-pair-v1');
  assert.equal(REGISTRATION.trials.length,4);
  assert.deepEqual(new Set(REGISTRATION.trials.map(x=>x.seed)),
    new Set([2404595552,948758444]));
  assert.deepEqual(new Set(REGISTRATION.trials.map(x=>x.sourceSeat)),
    new Set([0,1]));
});

test('paid Nest Ball continuation needs opponent real action and later source own turn',()=>{
  const item={ordinal:7,seat:0,turn:2,action:'PlayCardAction',
    ownerArvenSelectedNestAction:true};
  const opponent={ordinal:12,seat:1,turn:3,action:'PlayCardAction'};
  const source={ordinal:19,seat:0,turn:4,action:'AttackAction'};
  assert.equal(continuation(item,[item,opponent,source]).passed,true);
  assert.equal(continuation(item,[item,opponent,{...source,turn:3}]).passed,false);
  assert.equal(continuation(item,[item,
    {...opponent,action:'PassTurnAction'},source]).passed,false);
  assert.throws(()=>continuation(item,[]));
});
