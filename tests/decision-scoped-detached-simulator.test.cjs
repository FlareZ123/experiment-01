'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withDecisionScopedDetachedSimulator}=
  require('../simulation/twinleaf/decision-scoped-detached-simulator.cjs');

test('scope restores its previous Simulator after an accepted action',()=>{
  const calls=[];
  const result=withDecisionScopedDetachedSimulator(()=>{
    calls.push('decide');
    return 'AttackAction';
  },()=>{calls.push('install');return ()=>calls.push('restore');});
  assert.equal(result,'AttackAction');
  assert.deepEqual(calls,['install','decide','restore']);
});

test('scope restores when deciding throws',()=>{
  const calls=[];
  assert.throws(()=>withDecisionScopedDetachedSimulator(()=>{
    calls.push('decide');
    throw new Error('source action invalid');
  },()=>{calls.push('install');return ()=>calls.push('restore');}),/invalid/);
  assert.deepEqual(calls,['install','decide','restore']);
});

test('bad scope contract throws rather than reporting clean isolation',()=>{
  assert.throws(()=>withDecisionScopedDetachedSimulator(null),/callbacks/);
  assert.throws(()=>withDecisionScopedDetachedSimulator(()=>undefined,
    ()=>undefined),/restore/);
});
