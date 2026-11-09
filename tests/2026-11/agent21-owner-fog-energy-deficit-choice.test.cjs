'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseEnergyDeficitFogPrinting,VERSION}=
  require('../../simulation/twinleaf/agent21-owner-fog-energy-deficit-choice.cjs');

const offered=[
  {printing:'Duskull VIV',permitted:true,basicPsychic:true,psychicEnergy:false},
  {printing:'Psychic Energy MEE',permitted:true,basicPsychic:false,psychicEnergy:true}
];

/** @param {object} [overrides] */ 
function ownerView(overrides={}){
  const view={
    decisionKind:'owner-prompt',
    pendingOwnerDeckSearch:true,
    actorSeat:0,globalTurn:2,
    ownHand:['Fog Crystal CRE','Battle VIP Pass FST'],
    ownTurnResources:{energyPlayedTurn:0,energyPlayLocked:false,
      specialEnergyPlayLocked:false},
    ownPublic:{
      active:{printing:'Tapu Lele-GX GRI',energies:[],
        attacks:[{name:'Energy Drive',cost:['COLORLESS','COLORLESS']}]},
      bench:[null,null,null,null,null]
    }
  };
  return {...view,...overrides,
    ownTurnResources:{...view.ownTurnResources,
      ...(overrides.ownTurnResources??{})},
    ownPublic:{...view.ownPublic,...(overrides.ownPublic??{})}};
}
test('v1 exposes specific deterministic symmetric owner-only policy',()=>{
  assert.equal(VERSION,'agent21-owner-fog-basic-psychic-energy-deficit-v1');
  for(const seat of [0,1]){
    assert.equal(chooseEnergyDeficitFogPrinting(ownerView({actorSeat:seat}),offered),
      'Psychic Energy MEE');
  }
});
test('prioritizes a payable Basic Psychic with a real Benched backup',()=>{
  assert.equal(chooseEnergyDeficitFogPrinting(ownerView({
    globalTurn:8,ownHand:['Fog Crystal CRE'],
    ownPublic:{bench:[{printing:'Shadow Rider Calyrex V CRE'},null,null,null,null]}
  }),offered),'Psychic Energy MEE');
});
test('no physical backup, no playable first-turn VIP preserves Basic search',()=>{
  assert.equal(chooseEnergyDeficitFogPrinting(ownerView({
    globalTurn:8,ownHand:['Fog Crystal CRE']
  }),offered),'Duskull VIV');
});
test('already held Energy preserves the existing Basic preference',()=>{
  assert.equal(chooseEnergyDeficitFogPrinting(ownerView({
    ownHand:['Fog Crystal CRE','Battle VIP Pass FST','Psychic Energy MEE']
  }),offered),'Duskull VIV');
});
test('already attached or already spent manual attachment preserves Basic choice',()=>{
  assert.equal(chooseEnergyDeficitFogPrinting(ownerView({
    ownPublic:{active:{printing:'Tapu Lele-GX GRI',energies:['Psychic Energy MEE'],
      attacks:[{name:'Energy Drive',cost:['COLORLESS','COLORLESS']}]}}
  }),offered),'Duskull VIV');
  assert.equal(chooseEnergyDeficitFogPrinting(ownerView({
    ownTurnResources:{energyPlayedTurn:2}
  }),offered),'Duskull VIV');
});
test('does not select a prohibited Energy target',()=>{
  assert.equal(chooseEnergyDeficitFogPrinting(ownerView(),[
    offered[0],{...offered[1],permitted:false}
  ]),'Duskull VIV');
});
test('rejects a non-prompt observation instead of accessing its hidden deck',()=>{
  assert.throws(()=>chooseEnergyDeficitFogPrinting(ownerView({
    decisionKind:'owner-root',pendingOwnerDeckSearch:false
  }),offered),/owner-prompt/);
});
