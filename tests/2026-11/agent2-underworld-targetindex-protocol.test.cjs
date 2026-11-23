'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {validatePromptMetadata}=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');

const publicBenchChoice=Object.freeze({
  sourceZone:'hand',ownerSeat:'actor',isOwnerVisible:true,
  energyType:'BASIC',zone:'bench',targetIndex:2,
  choiceIndex:0,selectedCount:1
});

test('exact Underworld Door actor-visible Basic Energy Bench target index is admitted',()=>{
  const choice={...publicBenchChoice};
  assert.strictEqual(validatePromptMetadata(choice),choice);
  assert.strictEqual(validatePromptMetadata({...choice,targetIndex:0}).targetIndex,0);
});

test('targetIndex stays integer-bounded, actor-owned, hand-sourced, visible, and bench-only',()=>{
  const bad=[
    {targetIndex:-1},{targetIndex:1.5},{targetIndex:Number.MAX_SAFE_INTEGER},
    {targetIndex:null},{targetIndex:'2'},{ownerSeat:'opponent'},
    {ownerSeat:'mixed'},{isOwnerVisible:false},
    {energyType:'SPECIAL'},{zone:'hand'},{sourceZone:'deck'},
    {sourceZone:'discard'}
  ];
  for(const change of bad){
    assert.throws(()=>validatePromptMetadata({...publicBenchChoice,...change}),
      {code:'BAD_PROMPT_METADATA'},JSON.stringify(change));
  }
});

test('new index key does not weaken closed prompt metadata against unexpected private fields',()=>{
  assert.throws(()=>validatePromptMetadata({
    ...publicBenchChoice,opponentHandIndex:3
  }),{code:'UNKNOWN_FIELD'});
});
