'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {collectAndChooseOwnerRoot}=
  require('../simulation/twinleaf/agent41-same-root-proposal-choice.cjs');

/** @param {string[]} hand */
function root(hand){
  return {decisionKind:'owner-root',globalTurn:3,ownHand:[...hand],
    ownTurnResources:{supporterPlayedTurn:0,supporterPlayLocked:false,
      energyPlayedTurn:0,itemPlayLocked:false,stadiumPlayedTurn:0},
    ownPublic:{active:{printing:'Iron Thorns ex TWM',
      energies:[],attacks:[],tools:[]},bench:[null],
      prizeCount:6,publicTurnRestrictions:{}},
    opponentPublic:{active:{printing:'Opposing Active',
      energies:['Psychic Energy MEE','Psychic Energy MEE']},
      bench:[{printing:'Opposing Bench',energies:[]}]}
  };
}
const select=(view,conserve)=>collectAndChooseOwnerRoot(view,{},
  {kind:'pass'},{sameRootChoiceApply:true,nativePlumeriaChoice:true,
    nativePlumeriaPaymentConservation:conserve});

test('guard OFF keeps existing canonical Plumeria selection',()=>{
  const v=root(['Plumeria BUS','Speed Lightning Energy RCL',
    'Speed Lightning Energy RCL','Guzma & Hala CEC','Capture Energy RCL']);
  assert.equal(select(v,false).intent.kind,'play-plumeria-payment-menu');
});

test('guard ON holds a two-Speed last-printing payment',()=>{
  const v=root(['Plumeria BUS','Speed Lightning Energy RCL',
    'Speed Lightning Energy RCL','Guzma & Hala CEC','Capture Energy RCL']);
  const selected=select(v,true);
  assert.equal(selected.intent.kind,'pass');
  const offered=selected.receipt.offers.find(o=>
    o.source==='grouped-plumeria-payments');
  assert.equal(offered.reason,'predicted-payment-erases-last-printing');
  assert.equal(offered.score,-11);
  assert.equal(selected.receipt.supportedAlternativeCount,1);
});

test('guard ON allows a payment retaining all printed resources',()=>{
  const v=root(['Plumeria BUS','Speed Lightning Energy RCL',
    'Speed Lightning Energy RCL','Capture Energy RCL','Capture Energy RCL']);
  const selected=select(v,true);
  assert.equal(selected.intent.kind,'play-plumeria-payment-menu');
  assert.equal(selected.receipt.reason,
    'experimental-native-plumeria-conserved-payment');
});

test('guard ON preserves the existing higher priority free Flare offer',()=>{
  const v=root(['Team Flare Grunt XY','Plumeria BUS',
    'Speed Lightning Energy RCL','Speed Lightning Energy RCL',
    'Guzma BUS','Capture Energy RCL']);
  const selected=collectAndChooseOwnerRoot(v,{},{kind:'pass'},{
    sameRootChoiceApply:true,nativePlumeriaChoice:true,
    nativePlumeriaPaymentConservation:true,
    nativeZeroCostDenialChoice:true,teamFlareGruntDenialRoot:true
  });
  assert.equal(selected.intent.kind,'play-team-flare-grunt-denial');
  assert.equal(selected.receipt.reason,
    'coheld-free-active-energy-denial-over-paid-Plumeria');
});

test('native payment forecast fails closed on oversized mandatory hand',()=>{
  const v=root(['Plumeria BUS',
    ...Array.from({length:19},(_,i)=>'Item '+i)]);
  const selected=select(v,true);
  assert.equal(selected.intent.kind,'pass');
  assert.equal(selected.receipt.offers.find(o=>
    o.source==='grouped-plumeria-payments').reason,
    'payment-prompt-outside-actor47-bounded-menu');
});
