'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {bilateralJetBenchRootOptions}=require(
  '../simulation/evaluation/agent41-bilateral-v2-development.cjs'
);

test('shared bilateral Jet Bench option is default-off',()=>{
  assert.deepEqual(bilateralJetBenchRootOptions(false),{});
});

test('shared bilateral Jet Bench opt-in passes only the dedicated root flag',()=>{
  assert.deepEqual(bilateralJetBenchRootOptions(true),
    {jetBenchSwitchRoot:true});
});
