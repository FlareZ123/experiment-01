'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,choosePerfectionTransition}=
  require('../simulation/twinleaf/agent35-perfection-transition-frontier.cjs');

const P=5,C=9;
const BASIC='Psychic Energy SVE';
const catalog={
  basicEnergies:new Set([BASIC]),
  specialEnergies:new Set(['Telepath [P] Energy M3']),
  basicEnergyTypes:{Psychic:P},
  colorlessEnergyType:C,
  specialConditions:{ASLEEP:3,PARALYZED:4},
  perfectionDonors:new Map([
    ['Gengar & Mimikyu-GX TEU',[
      {name:'Poltergeist',cost:[P,P],gxAttack:false},
      {name:'Horror House-GX',cost:[P],gxAttack:true}
    ]],
    ['Trevenant & Dusknoir-GX SMP',[
      {name:'Night Watch',cost:[P,P,P],gxAttack:false},
      {name:'Pale Moon-GX',cost:[P,C],gxAttack:true}
    ]]
  ])
};

/** @returns {object} */
function state(){
  return {decisionKind:'owner-root',globalTurn:3,
    ownHand:[BASIC],
    ownTurnResources:{energyPlayLocked:false,energyPlayedTurn:0,
      retreatedTurn:0},
    ownPublic:{
      active:{printing:'Duskull VIV',name:'Duskull',
        energies:[],attacks:[{name:'Future Sight',cost:[C],damage:0}],
        abilities:[],printed:{retreatCost:[C]},
        publicRestrictions:{},specialConditions:[]},
      bench:[{printing:'Mewtwo & Mew-GX UNM',name:'Mewtwo & Mew-GX',
        abilities:['Perfection'],energies:[],
        attacks:[{name:'Miraculous Duo-GX',cost:[P,P,C],gxAttack:true}],
        publicRestrictions:{},specialConditions:[]},
        null,null,null,null],
      discard:['Gengar & Mimikyu-GX TEU',
        'Trevenant & Dusknoir-GX SMP'],
      stadium:[],publicTurnRestrictions:{gxUsed:false}
    },
    opponentPublic:{active:{printing:'Mega Absol ex M3',
      abilities:[]},bench:[],stadium:[]},
    opponentHidden:{hand:['Private'],prizes:['Private']}
  };
}

test('Gengar publicly discarded and Benched Mewtwo unpowered: fund Bench, not Duskull',()=>{
  const v=state();
  const x=choosePerfectionTransition(v,catalog);
  assert.deepEqual(x,{kind:'attach-basic-energy',slot:'bench',index:0,
    handIndex:0,printing:BASIC,attackName:'Poltergeist',plan:VERSION});
  assert.deepEqual(v.ownPublic.bench[0].energies,[],
    'Planning may not mutate native/public observation');
});

test('funded donor with empty Active retreat payment: attach to Active for pivot',()=>{
  const v=state();
  v.ownPublic.bench[0].energies=[BASIC];
  const x=choosePerfectionTransition(v,catalog);
  assert.deepEqual(x,{kind:'attach-basic-energy',slot:'active',index:0,
    handIndex:0,printing:BASIC,attackName:'Horror House-GX',
    plan:VERSION});
});

test('funded donor and Basic-paid Active retreat: choose Mewtwo, no further Energy needed',()=>{
  const v=state();
  v.ownPublic.bench[0].energies=[BASIC];
  v.ownPublic.active.energies=[BASIC];
  v.ownHand=[];
  const x=choosePerfectionTransition(v,catalog);
  assert.deepEqual(x,{kind:'paid-retreat',benchIndex:0,
    printing:'Mewtwo & Mew-GX UNM',attackName:'Horror House-GX',
    sourcePrinting:'Gengar & Mimikyu-GX TEU',retreatCostUnits:1,
    plan:VERSION});
});

test('spent GX still seeks non-GX attack cost; no invented immediate readiness',()=>{
  const v=state();
  v.ownPublic.publicTurnRestrictions.gxUsed=true;
  v.ownPublic.bench[0].energies=[BASIC];
  const x=choosePerfectionTransition(v,catalog);
  assert.equal(x.kind,'attach-basic-energy');
  assert.equal(x.slot,'bench');
  v.ownPublic.bench[0].energies=[BASIC,BASIC];
  v.ownPublic.active.energies=[BASIC];
  const funded=choosePerfectionTransition(v,catalog);
  assert.equal(funded.kind,'paid-retreat');
  assert.equal(funded.attackName,'Poltergeist');
});

test('public ability locks and unsupported prerequisites fail closed',()=>{
  const v=state();
  v.opponentPublic.active.abilities=['Initialization'];
  assert.equal(choosePerfectionTransition(v,catalog),null);
  v.opponentPublic.active.abilities=[];
  v.ownPublic.discard=[];
  assert.equal(choosePerfectionTransition(v,catalog),null);
  v.ownPublic.discard=['Gengar & Mimikyu-GX TEU'];
  v.ownPublic.bench[0].abilities=[];
  assert.equal(choosePerfectionTransition(v,catalog),null);
  v.ownPublic.bench[0].abilities=['Perfection'];
  v.ownTurnResources.energyPlayedTurn=3;
  assert.equal(choosePerfectionTransition(v,catalog),null);
});

test('no published own GX donors means no speculative hidden deck read',()=>{
  const v=state();
  const w=structuredClone(v);
  w.opponentHidden.hand=['Different secret'];
  w.opponentHidden.prizes=['A second secret'];
  w.ownerHiddenDeck=['Mewtwo card perhaps'];
  assert.deepEqual(choosePerfectionTransition(v,catalog),
    choosePerfectionTransition(w,catalog));
  v.ownPublic.discard=[];
  v.ownPublic.bench[2]={printing:'Unknown GX',energies:[]};
  assert.equal(choosePerfectionTransition(v,catalog),null);
});

test('status, retreat quota, costly retreat and useful immediate attacker block pivot',()=>{
  const v=state();
  v.ownPublic.bench[0].energies=[BASIC];
  v.ownPublic.active.energies=[BASIC];
  v.ownTurnResources.retreatedTurn=3;
  assert.equal(choosePerfectionTransition(v,catalog),null);
  v.ownTurnResources.retreatedTurn=0;
  v.ownPublic.active.specialConditions=[catalog.specialConditions.ASLEEP];
  assert.equal(choosePerfectionTransition(v,catalog),null);
  v.ownPublic.active.specialConditions=[];
  v.ownPublic.active.printed.retreatCost=[C,C];
  assert.equal(choosePerfectionTransition(v,catalog),null);
  v.ownPublic.active.printed.retreatCost=[C];
  v.ownPublic.active.attacks=[{name:'Good Attack',damage:110,cost:[P]}];
  assert.equal(choosePerfectionTransition(v,catalog),null);
});
