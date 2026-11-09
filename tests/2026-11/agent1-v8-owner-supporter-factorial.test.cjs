'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,MODES,REGISTRATION,continuation}=
  require('../../simulation/evaluation/agent1-v8-owner-supporter-factorial-four-arm.cjs');

test('preregistered 2x2 modes preserve owner policy control baseline',()=>{
  assert.equal(VERSION,'agent1-v8-owner-supporter-contention-four-arm-factorial-v2-parity');
  assert.deepEqual(Object.keys(MODES),['B','H','R','HR']);
  assert.deepEqual(MODES.B,{});
  assert.deepEqual(MODES.H,{followHeldHandiwork:true});
  assert.deepEqual(MODES.R,{followHeldRefillSupporter:true});
  assert.deepEqual(MODES.HR,{followHeldHandiwork:true,
    followHeldRefillSupporter:true});
  assert.equal(REGISTRATION.trials.length,4);
  assert.deepEqual(new Set(REGISTRATION.trials.map(x=>x.seed)),
    new Set([2404595552,948758444]));
  assert.deepEqual(new Set(REGISTRATION.trials.map(x=>x.sourceSeat)),
    new Set([0,1]));
});

test('contest requires meaningful opponent response and strictly later source own turn',()=>{
  const paid={ordinal:3,seat:0,turn:2,action:'PlayCardAction'};
  const opponent={ordinal:5,seat:1,turn:3,action:'PlayCardAction'};
  const source={ordinal:9,seat:0,turn:4,action:'AttackAction'};
  assert.equal(continuation(paid,[paid,opponent,source]).passed,true);
  assert.equal(continuation(paid,[paid,opponent,{...source,turn:3}]).passed,false);
  assert.equal(continuation(paid,[paid,
    {...opponent,action:'ResolvePromptAction'},source]).passed,false);
  assert.throws(()=>continuation(paid,[]));
});
