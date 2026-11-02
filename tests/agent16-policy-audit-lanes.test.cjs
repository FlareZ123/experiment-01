'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {evaluatePolicyAuditGate}=require(
  '../simulation/evaluation/agent16-policy-audit-lanes.cjs');

/** @param {string} outcome @param {boolean} exact @param {boolean} strict */
const assess=(outcome,exact,strict)=>evaluatePolicyAuditGate({
  inventoryOutcome:outcome,rootPinsExact:exact,strictHistoricalPins:strict
});

test('moving main accepts historic source drift only when all policy tests pass',()=>{
  const x=assess('success',false,false);
  assert.equal(x.passes,true);
  assert.equal(x.warnHistoricalDrift,true);
  assert.equal(x.lane,'moving-development');
  assert.deepEqual(x.failures,[]);
});

test('strict historical lane rejects mismatch even with green policy tests',()=>{
  const x=assess('success',false,true);
  assert.equal(x.passes,false);
  assert.deepEqual(x.failures,['STRICT_HISTORICAL_SOURCE_PIN_DRIFT']);
  assert.equal(x.warnHistoricalDrift,false);
});

test('real inventory failure is never excused by moving-main pin drift',()=>{
  for(const strict of [false,true]){
    for(const exact of [false,true]){
      const x=assess('failure',exact,strict);
      assert.equal(x.passes,false);
      assert.ok(x.failures.includes('POLICY_INVENTORY_TEST_FAILURE'));
      if(strict&&!exact){
        assert.ok(x.failures.includes('STRICT_HISTORICAL_SOURCE_PIN_DRIFT'));
      }
    }
  }
});

test('skipped and cancelled inventory steps veto both execution lanes',()=>{
  for(const state of ['skipped','cancelled']){
    for(const strict of [false,true]){
      const x=assess(state,true,strict);
      assert.equal(x.passes,false);
      assert.deepEqual(x.failures,['POLICY_INVENTORY_TEST_FAILURE']);
    }
  }
});

test('exact roots and successful tests qualify gate only, not game outcomes',()=>{
  for(const strict of [false,true]){
    const x=assess('success',true,strict);
    assert.equal(x.passes,true);
    assert.equal(x.warnHistoricalDrift,false);
    assert.deepEqual(x.failures,[]);
    assert.equal(Object.hasOwn(x,'competitiveGameQualified'),false);
  }
});

test('unrecognized step outcome and types fail closed',()=>{
  assert.throws(()=>assess('unknown',true,false),/Unrecognized/);
  assert.throws(()=>evaluatePolicyAuditGate({
    inventoryOutcome:'success',rootPinsExact:'false',
    strictHistoricalPins:false
  }),/boolean/);
});
