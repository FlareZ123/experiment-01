'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,REGISTRATION,continuation}=
  require('../../simulation/evaluation/agent1-v8-original-held-arven-four-arm.cjs');

test('two original seeds and both physical source seat orientations',()=>{
  assert.equal(VERSION,'agent1-v8-original-held-arven-search-four-arm-v1');
  assert.equal(REGISTRATION.trials.length,4);
  assert.deepEqual(new Set(REGISTRATION.trials.map(r=>r.seed)),
    new Set([2404595552,948758444]));
  assert.deepEqual(new Set(REGISTRATION.trials.map(r=>r.sourceSeat)),
    new Set([0,1]));
});

test('continuation requires real opponent action and source own later turn',()=>{
  const paid={ordinal:5,seat:0,turn:2,
    action:'PlayCardAction',ownerHeldArvenAction:true};
  const opponent={ordinal:8,seat:1,turn:3,action:'PlayCardAction'};
  const source={ordinal:15,seat:0,turn:4,action:'AttackAction'};
  assert.equal(continuation(paid,[paid,opponent,source]).passed,true);
  assert.equal(continuation(paid,[paid,opponent,{...source,turn:3}]).passed,false);
  assert.equal(continuation(paid,[paid,
    {...opponent,action:'ResolvePromptAction'},source]).passed,false);
  assert.throws(()=>continuation(paid,[]));
});
