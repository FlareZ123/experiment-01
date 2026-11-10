'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {planAichi}=require('../../simulation/evaluation/aichi-pilot.cjs');
const {preflight,REG_BLOB,pairedNativeWinDifferenceBounds}=
  require('../../simulation/evaluation/2026-11/agent26-hood-late-active-funding-fresh32.cjs');
const {chooseActorRootIntent}=
  require('../../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

test('turn-25 proposed original four-rank source groups were committed prior to native play',()=>{
  const {registration,hood}=preflight();
  assert.equal(REG_BLOB,'12dd959f3d6891fe07fe08007efaf87e3cb3b887');
  assert.deepEqual(registration.sourceRanks,[1,7,11,13]);
  assert.equal(registration.trials.length,32);
  assert.equal(new Set(registration.trials.map(x=>x.seed)).size,32);
  assert.equal(hood.cards.reduce((n,c)=>n+c.count,0),60);
  for(const rank of registration.sourceRanks){
    assert.equal(registration.trials.filter(x=>x.rank===rank).length,8);
    assert.equal(planAichi(rank,{
      allowEquivalentBasicEnergies:true,
      allowBasicEnergyMirrorPrintings:true,
      allowJapanesePromoHooks:true
    }).candidate.cards.length,60);
  }
  assert.deepEqual(registration.controlOptions,{
    actorUnderworldActiveFundingPriority:true,
    actorUnderworldActiveFundingMinTurn:null,
    actorUnderworldActiveFundingMirrorVeto:false
  });
  assert.deepEqual(registration.treatmentOptions,{
    actorUnderworldActiveFundingPriority:true,
    actorUnderworldActiveFundingMinTurn:25,
    actorUnderworldActiveFundingMirrorVeto:false
  });
});

test('no experimental late-turn restriction reaches default-off ordinary root',()=>{
  const view={
    decisionKind:'owner-root',globalTurn:12,actorSeat:0,
    ownPublic:{active:null,bench:[],publicTurnRestrictions:{}},
    ownTurnResources:{},ownHand:[],
    opponentPublic:{active:null,bench:[]}
  };
  const catalog={basics:new Set(),abilityBasics:new Set(),
    specialConditions:{ASLEEP:1,PARALYZED:2},basicEnergies:new Set(),
    basicEnergyTypes:{},colorlessEnergyType:10};
  assert.deepEqual(chooseActorRootIntent(view,catalog,{}),
    chooseActorRootIntent(view,catalog,{
      underworldActiveFundingMinTurn:25
    }));
});

test('censored games never imply paper-qualified wins',()=>{
  const pairs=[
    {control:{nativeStatus:'censored'},
      treatment:{nativeStatus:'candidate-native-terminal'}},
    {control:{nativeStatus:'candidate-native-terminal'},
      treatment:{nativeStatus:'censored'}}
  ];
  assert.deepEqual(pairedNativeWinDifferenceBounds(pairs),[-1,1]);
});
