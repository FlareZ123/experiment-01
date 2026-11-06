'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
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

test('shared runner selects the scoped root and records the bilateral opt-in',()=>{
  const source=fs.readFileSync(require.resolve(
    '../simulation/evaluation/agent41-bilateral-v2-development.cjs'
  ),'utf8');
  assert.match(source,/bilateralJetBenchSwitchRoot=false/);
  assert.match(source,/!bilateralJetBenchSwitchRoot&&/);
  assert.match(source,/bilateralJetBenchRootOptions\\(bilateralJetBenchSwitchRoot\\)/);
  assert.match(source,/bilateralJetBenchSwitchRootOptIn:bilateralJetBenchSwitchRoot/);
  assert.match(source,/AGENT41_BILATERAL_JET_BENCH_DEV/);
});
