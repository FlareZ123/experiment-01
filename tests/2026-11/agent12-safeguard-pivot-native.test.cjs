'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const reg=require('../../results/aichi-2026/registrations/agent12-thorns-safeguard-contrast-20261109.json');
const variant=require('../../results/aichi-2026/candidate-iron-thorns-safeguard-pivot-v1.json');
const {compare,verify}=
  require('../../simulation/evaluation/2026-11/agent12-safeguard-pivot-original-field-native.cjs');

function arm(index){
  return {rows:reg.batches[index].registeredTrials.map(trial=>({
    trial,finished:true,winner:index===0?(trial.candidateSlot==='A'?0:1):
      (trial.candidateSlot==='A'?1:0),
    actualStarterSeat:trial.candidateSlot==='A'?0:1,
    sourceDealFingerprint:'source:'+trial.seed,
    fullPhysicalDealFingerprint:'physical:'+index+':'+trial.seed,
    rootActionLedger:[],
    candidateAttackSettlement:{attacks:index===0?[]:
      [{attackName:'Ghost Eye',settledPromptChain:{}}]},
    sourceAttackSettlement:{attacks:[]}
  }))};
}

test('Safeguard fixed 60 is a card-for-card mutation of original 4-Thorns 60',()=>{
  assert.equal(verify(),true);
  assert.equal(variant.cards.reduce((n,x)=>n+x.count,0),60);
  assert.equal(variant.cards.find(x=>x.name==='Iron Thorns ex').count,4);
  assert.equal(variant.cards.find(x=>x.name==='Mimikyu').count,1);
});

test('all completed matched groups correctly penalize Safeguard native losses',()=>{
  const result=compare(arm(0),arm(1));
  assert.equal(result.summary.physicallyMatchedSourceDeals,24);
  assert.equal(result.summary.bothTerminalAndMatched,24);
  assert.deepEqual(result.summary.sharpMatchedPivotMinusBase,
    {low:-24,high:-24});
  assert.deepEqual(result.summary.allTrialWorstCasePivotMinusBase,
    {low:-24,high:-24});
  assert.equal(result.field[1].declaredGhostEye,24);
  assert.equal(result.field[1].acceptedSettledGhostEye,24);
});

test('different source deal and unfinished games remain explicit, no false pair',()=>{
  const a=arm(0),b=arm(1);
  b.rows[1].finished=false;
  b.rows[1].winner=null;
  b.rows[2].sourceDealFingerprint='other-source';
  const result=compare(a,b);
  assert.equal(result.summary.physicallyMatchedSourceDeals,23);
  assert.equal(result.summary.bothTerminalAndMatched,22);
  assert.deepEqual(result.summary.sharpMatchedPivotMinusBase,
    {low:-23,high:-22});
  assert.deepEqual(result.summary.allTrialWorstCasePivotMinusBase,
    {low:-24,high:-23});
  assert.equal(result.field[1].censored,1);
  assert.equal(result.rows[2].bounds,null);
});
