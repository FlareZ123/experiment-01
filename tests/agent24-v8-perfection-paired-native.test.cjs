'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {firstRootDivergence}=require(
  '../simulation/evaluation/agent24-v8-perfection-paired-native.cjs');

test('causal action comparison preserves unchanged native prefix exactly',()=>{
  const common=[{actionOrdinal:0,action:'PlayCardAction',playerSlot:0},
    {actionOrdinal:1,action:'ResolvePromptAction',playerSlot:0}];
  const original=[...common,
    {actionOrdinal:2,action:'PassTurnAction',playerSlot:0}];
  const treatment=[...structuredClone(common),
    {actionOrdinal:2,action:'UseAbilityAction',playerSlot:0}];
  assert.deepEqual(firstRootDivergence(original,treatment),{
    ordinal:2,baseline:original[2],treatment:treatment[2]});
});

test('only a new appended action counts as a difference after identical prefix',()=>{
  const base=[{actionOrdinal:0,action:'UseAbilityAction'}];
  const treat=[...base,{actionOrdinal:1,action:'ResolvePromptAction'}];
  assert.deepEqual(firstRootDivergence(base,treat),{
    ordinal:1,baseline:null,treatment:treat[1]});
  assert.deepEqual(firstRootDivergence(base,structuredClone(base)),{
    ordinal:null,baseline:null,treatment:null});
});
