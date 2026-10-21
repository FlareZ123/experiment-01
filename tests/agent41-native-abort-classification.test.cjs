'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {classifyNativeAbort}=
  require('../simulation/evaluation/agent41-bilateral-v2-development.cjs');

test('missing quota audit remains an engine error',()=>{
  assert.equal(classifyNativeAbort(null),'engine-error');
  assert.equal(classifyNativeAbort(undefined),'engine-error');
});

test('unrelated GX attack abort with attached empty quota audit stays engine error',()=>{
  assert.equal(classifyNativeAbort({
    version:'agent41-bilateral-native-paper-supporter-discipline-v2-shared-owner-tactic',
    nativeSupporterQuotaQualified:false,
    rootDispatchVetoes:[],
    ownerProposalSuppressions:[],
    ownerProposalSuppressionCount:0
  }),'engine-error');
});

test('suppressed owner proposals alone do not mean native root rejection',()=>{
  assert.equal(classifyNativeAbort({
    rootDispatchVetoes:[],
    ownerProposalSuppressionCount:7
  }),'engine-error');
});

test('an actual Store-level same-turn Supporter veto remains explicit',()=>{
  assert.equal(classifyNativeAbort({
    rootDispatchVetoes:[{seat:1,globalTurn:7,reason:'second-supporter'}]
  }),'paper-supporter-quota-veto');
});
