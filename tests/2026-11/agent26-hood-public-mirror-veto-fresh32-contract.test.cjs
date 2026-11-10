'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {planAichi}=require('../../simulation/evaluation/aichi-pilot.cjs');
const {preflight,REG_BLOB,firstRootDivergence,
  pairedNativeWinDifferenceBounds}=
  require('../../simulation/evaluation/2026-11/agent26-hood-public-mirror-veto-fresh32.cjs');
const {vetoManualActiveFunding}=
  require('../../simulation/twinleaf/2026-11/agent26-shadow-rider-mirror-funding-veto.cjs');

test('fresh 32 real printed source and candidate sixties are uniquely registered',()=>{
  const {registration,hood}=preflight();
  assert.equal(REG_BLOB,'a55b7a41d879db07a6657bed01709a60c58d403b');
  assert.equal(hood.cards.reduce((n,c)=>n+c.count,0),60);
  assert.deepEqual(registration.sourceRanks,[1,7,11,13]);
  assert.equal(registration.trials.length,32);
  assert.equal(new Set(registration.trials.map(t=>t.seed)).size,32);
  for(const rank of registration.sourceRanks){
    assert.equal(planAichi(rank,{
      allowEquivalentBasicEnergies:true,
      allowBasicEnergyMirrorPrintings:true,
      allowJapanesePromoHooks:true
    }).candidate.cards.length,60);
    const rows=registration.trials.filter(t=>t.rank===rank);
    assert.equal(rows.length,8);
    assert.equal(rows.filter(t=>t.candidateSlot==='A').length,4);
    assert.equal(rows.filter(t=>t.candidateSlot==='B').length,4);
  }
  assert.deepEqual(registration.controlOptions,{
    actorUnderworldActiveFundingPriority:true,
    actorUnderworldActiveFundingMirrorVeto:false
  });
  assert.deepEqual(registration.treatmentOptions,{
    actorUnderworldActiveFundingPriority:true,
    actorUnderworldActiveFundingMirrorVeto:true
  });
});

test('mirror veto selects only opponent public CRE Shadow Rider printings',()=>{
  const view=(p)=>({decisionKind:'owner-root',
    opponentPublic:{active:{printing:'Lillie\'s Clefairy ex JTG'},
      bench:[p]}});
  assert.equal(vetoManualActiveFunding(view({
    printing:'Shadow Rider Calyrex VMAX CRE'})),true);
  assert.equal(vetoManualActiveFunding(view({
    printing:'Shadow Rider Calyrex V CRE'})),true);
  assert.equal(vetoManualActiveFunding(view({
    printing:'Regidrago VSTAR SIT'})),false);
  assert.equal(vetoManualActiveFunding(view({
    printing:'Wobbuffet PHF'})),false);
  assert.equal(vetoManualActiveFunding(view(null)),false);
});

test('every native cap stays an unresolved interval',()=>{
  const rows=[
    {control:{nativeStatus:'candidate-native-terminal'},
      treatment:{nativeStatus:'original-native-terminal'}},
    {control:{nativeStatus:'censored'},
      treatment:{nativeStatus:'censored'}},
    {control:{nativeStatus:'original-native-terminal'},
      treatment:{nativeStatus:'censored'}}
  ];
  assert.deepEqual(pairedNativeWinDifferenceBounds(rows),[-2,1]);
  assert.equal(firstRootDivergence({rootActionLedger:[]},{
    rootActionLedger:[]}),null);
});
