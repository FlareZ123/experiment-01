'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {planAichi}=require('../../simulation/evaluation/aichi-pilot.cjs');
const {
  REG_BLOB,preflight,firstRootDivergence,
  candidateNativeWinBounds,pairedNativeWinDifferenceBounds
}=require('../../simulation/evaluation/2026-11/agent26-hood-three-source-fresh24.cjs');

test('separately committed and frozen prospective groups span authentic 60s',()=>{
  const {registration,hood}=preflight();
  assert.equal(REG_BLOB,'b83b75e151ea80d29cc6c2caa5363fbad1edbbea');
  assert.equal(registration.trials.length,24);
  assert.equal(hood.cards.reduce((n,x)=>n+x.count,0),60);
  assert.deepEqual(registration.sourceRanks,[1,11,13]);
  assert.equal(new Set(registration.trials.map(x=>x.seed)).size,24);
  for(const rank of [1,11,13]){
    const actual=planAichi(rank,{
      allowEquivalentBasicEnergies:true,
      allowBasicEnergyMirrorPrintings:true,
      allowJapanesePromoHooks:true
    }).candidate.cards;
    assert.equal(actual.length,60,
      'Full printed original source rank '+rank+' must have exactly 60 cards');
    const group=registration.trials.filter(x=>x.rank===rank);
    assert.equal(group.length,8);
    assert.equal(group.filter(x=>x.candidateSlot==='A').length,4);
    assert.equal(group.filter(x=>x.candidateSlot==='B').length,4);
  }
});

test('first native divergence is the root change rather than an inferred game outcome',()=>{
  const original=[
    {actionOrdinal:0,turnBefore:1,playerSlot:0,action:'PlayCardAction',card:'Girafarig'},
    {actionOrdinal:1,turnBefore:3,playerSlot:0,action:'UseAbilityAction'}
  ];
  const modified=[
    original[0],
    {actionOrdinal:1,turnBefore:3,playerSlot:0,action:'PlayCardAction',card:'Psychic Energy'}
  ];
  assert.equal(firstRootDivergence({rootActionLedger:original},{
    rootActionLedger:original}),null);
  assert.deepEqual(firstRootDivergence({rootActionLedger:original},{
    rootActionLedger:modified}),{
    index:1,
    control:{actionOrdinal:1,globalTurn:3,playerSlot:0,
      action:'UseAbilityAction',card:null,attack:null},
    treatment:{actionOrdinal:1,globalTurn:3,playerSlot:0,
      action:'PlayCardAction',card:'Psychic Energy',attack:null}
  });
  assert.equal(firstRootDivergence({rootActionLedger:original},{
    rootActionLedger:original.slice(0,1)}).index,1);
});

test('sharp native candidate winner bounds preserve unresolved opponent futures',()=>{
  assert.deepEqual(candidateNativeWinBounds('candidate-native-terminal'),[1,1]);
  assert.deepEqual(candidateNativeWinBounds('original-native-terminal'),[0,0]);
  assert.deepEqual(candidateNativeWinBounds('censored'),[0,1]);
  assert.deepEqual(candidateNativeWinBounds('engine-error'),[0,1]);
  const pairs=[
    {control:{nativeStatus:'original-native-terminal'},
      treatment:{nativeStatus:'candidate-native-terminal'}},
    {control:{nativeStatus:'censored'},
      treatment:{nativeStatus:'censored'}},
    {control:{nativeStatus:'original-native-terminal'},
      treatment:{nativeStatus:'censored'}}
  ];
  assert.deepEqual(pairedNativeWinDifferenceBounds(pairs),[0,3]);
});
