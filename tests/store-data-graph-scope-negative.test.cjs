'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {storeDataGraphFingerprint}=
  require('../simulation/twinleaf/store-data-graph-fingerprint.cjs');

function makeStore() {
  return {
    state:{turn:12,phase:2,players:[],logs:[]},
    handler:{onStateChange(){}},
    extras:new Map([[1,{count:2}]])
  };
}

/**
 * These are deliberate counterexamples to the CURRENT v2 contract.
 * Equality demonstrates what it cannot independently certify, not proof
 * of a live source mismatch. A future version should turn these red.
 */
test('v2 omits non-enumerable own Store properties',()=>{
  const left=makeStore(),right=makeStore();
  Object.defineProperty(left,'nonEnumerableTurnLock',{
    value:false,enumerable:false,writable:true,configurable:true
  });
  Object.defineProperty(right,'nonEnumerableTurnLock',{
    value:true,enumerable:false,writable:true,configurable:true
  });
  assert.notEqual(left.nonEnumerableTurnLock,right.nonEnumerableTurnLock);
  assert.equal(storeDataGraphFingerprint(left).digest,
    storeDataGraphFingerprint(right).digest);
});

test('v2 sees Map entries but omits own named fields on Map',()=>{
  const left=makeStore(),right=makeStore();
  left.extras.deferredEffect={requiredEnergy:2};
  right.extras.deferredEffect={requiredEnergy:3};
  assert.notDeepEqual(left.extras.deferredEffect,right.extras.deferredEffect);
  assert.equal(storeDataGraphFingerprint(left).digest,
    storeDataGraphFingerprint(right).digest);
});

test('v2 omits own named fields on Set and Date instances',()=>{
  const left=makeStore(),right=makeStore();
  left.state.extraSet=new Set([1,2]);
  right.state.extraSet=new Set([1,2]);
  left.state.extraSet.activationCount=2;
  right.state.extraSet.activationCount=3;
  left.state.date=new Date('2026-10-17T00:00:00Z');
  right.state.date=new Date('2026-10-17T00:00:00Z');
  left.state.date.pending=true;
  right.state.date.pending=false;
  assert.equal(storeDataGraphFingerprint(left).digest,
    storeDataGraphFingerprint(right).digest);
});
