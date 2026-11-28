'use strict';

// Original Aichi rank11 has Temple of Sinnoh ASR155 x2 and Mega Absol ex
// MEG86 x3. Rank29 has Megaton Blower SSP182 x1, Speed Lightning x4,
// Double Colorless x1. Temple makes all Special Energy provide [C] only;
// Megaton Blower discards Temple, restoring [L]+[C][C] and Volt Cyclone.
// Native Wondrous Labyrinth Prism Star TEU158 explicitly prevents Item
// effects on itself, so its mere presence must not trigger this line.
// Scope: exact actor-visible decisions, NOT a native Store continuation.
const test=require('node:test');
const assert=require('node:assert/strict');
const {POLICY_VERSION,createPolicy,scoreAction}=
  require('../../simulation/evaluation/2026-11/agent4-rank29-iron-thorns-opponent-policy.cjs');

function request(seat,{stadium='Temple of Sinnoh ASR 155',
    energies=['Speed Lightning Energy RCL 173','Double Colorless Energy SUM 136'],
    prizeCount=3,damage=160,locked=false,
    opponentTool=false,opponentEnergy=false}={}){
  const o={
    actorSeat:seat,globalTurn:12,ownHand:['Megaton Blower SSP 182'],
    ownPublic:{
      active:{
        printing:'Iron Thorns ex TWM 77',hp:230,damage:0,energies,tools:[],
        publicRestrictions:locked?{cannotAttackNextTurn:true}:{}
      },
      bench:[{printing:'Iron Thorns ex TWM 77',hp:230,damage:0,
        energies:[],tools:[]}],
      stadium:[],prizeCount,publicTurnRestrictions:{}
    },
    opponentPublic:{
      active:{
        printing:'Mega Absol ex MEG 86',hp:280,damage,
        energies:opponentEnergy?['Darkness Energy SWSH 170']:[],
        tools:opponentTool?['Stealthy Hood UNB 186']:[],
        printed:{stage:'BASIC',subtypes:[],
          weakness:[{type:'Grass',value:2}],resistance:[]}
      },
      bench:[{printing:'Trubbish FST 168',hp:70,damage:0,
        energies:[],tools:[]}],
      stadium:stadium?[stadium]:[],prizeCount:2
    },
    ownTurnResources:{supporterPlayedTurn:0}
  };
  return {role:'opponent',seat,prompt:null,observation:o,
    actionFrontier:{items:[
      {kind:'play-card',token:'megaton',actorPrinting:'Megaton Blower SSP 182'},
      {kind:'pass',token:'pass'}
    ]}};
}

for(const seat of [0,1]){
  const policy=createPolicy({role:'opponent',seat,policyVersion:POLICY_VERSION,config:{}});
  test('seat '+seat+': original rank11 Temple-only terminal Mega Absol makes ACE SPEC actionable',()=>{
    const before=request(seat);
    assert.equal(scoreAction(before.actionFrontier.items[0],before),900);
    assert.deepEqual(policy.decide(before),{kind:'select-action',token:'megaton'});
    // Model the next actor root after successfully removing Temple; no fake
    // claim that Store actually completed these actions here.
    before.observation.opponentPublic.stadium=[];
    before.actionFrontier.items=[
      {kind:'attack',token:'volt',attackName:'Volt Cyclone',
        publicMetadata:{attackCostPayable:true}},
      {kind:'pass',token:'pass'}
    ];
    assert.equal(scoreAction(before.actionFrontier.items[0],before),1000);
    assert.deepEqual(policy.decide(before),{kind:'select-action',token:'volt'});
  });
  test('seat '+seat+': Temple unlock remains useful without immediate KO',()=>{
    const r=request(seat,{damage:0});
    assert.equal(scoreAction(r.actionFrontier.items[0],r),225);
    assert.deepEqual(policy.decide(r),{kind:'select-action',token:'megaton'});
  });
  test('seat '+seat+': native-offered Temple replacement dominates consuming ACE SPEC',()=>{
    // These three source-rank29 Stadiums can all replace Temple without
    // recreating Wondrous Labyrinth's self-imposed extra attack cost.
    for(const stadium of [
      'Thunder Mountain Prism Star LOT 191',
      'Tropical Beach BWP 50',
      "Player's Ceremony SP 127"
    ]){
      const r=request(seat);
      r.observation.ownHand.push(stadium);
      r.actionFrontier.items.splice(1,0,{kind:'play-card',token:'stadium',
        actorPrinting:stadium,publicMetadata:{cardType:'stadium'}});
      assert.equal(scoreAction(r.actionFrontier.items[0],r),900);
      assert.equal(scoreAction(r.actionFrontier.items[1],r),925);
      assert.deepEqual(policy.decide(r),{kind:'select-action',token:'stadium'});
    }
    // Wondrous still replaces Temple but itself adds [C] to the attack,
    // so the exact two-card Speed + DCE stack remains underfunded.
    const immune=request(seat);
    immune.observation.ownHand.push('Wondrous Labyrinth Prism Star TEU 158');
    immune.actionFrontier.items.splice(1,0,{kind:'play-card',token:'wondrous',
      actorPrinting:'Wondrous Labyrinth Prism Star TEU 158',
      publicMetadata:{cardType:'stadium'}});
    assert.equal(scoreAction(immune.actionFrontier.items[1],immune),0);
    assert.deepEqual(policy.decide(immune),{kind:'select-action',token:'megaton'});
  });
  test('seat '+seat+': Wondrous Labyrinth Item immunity does not masquerade as Temple removal',()=>{
    const r=request(seat,{stadium:'Wondrous Labyrinth Prism Star TEU 158'});
    assert.equal(scoreAction(r.actionFrontier.items[0],r),0);
    assert.deepEqual(policy.decide(r),{kind:'select-action',token:'pass'});
  });
  test('seat '+seat+': missing Type or Colorless units defeats claimed Temple-ready line',()=>{
    for(const energies of [
      ['Speed Lightning Energy RCL 173'],
      ['Double Colorless Energy SUM 136'],
      ['Capture Energy RCL 171','Double Colorless Energy SUM 136']
    ]){
      const r=request(seat,{energies});
      assert.equal(scoreAction(r.actionFrontier.items[0],r),0);
      assert.deepEqual(policy.decide(r),{kind:'select-action',token:'pass'});
    }
  });
  test('seat '+seat+': current explicit attack lock defeats line, but other printed Megaton targets remain',()=>{
    const bad=request(seat,{locked:true});
    assert.equal(scoreAction(bad.actionFrontier.items[0],bad),0);
    const good=request(seat,{locked:true,opponentTool:true});
    assert.equal(scoreAction(good.actionFrontier.items[0],good),185);
    assert.deepEqual(policy.decide(good),{kind:'select-action',token:'megaton'});
  });
}
