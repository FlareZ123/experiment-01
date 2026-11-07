'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const {
  BOX,FOG,BASIC,VIP,CARRIER,choosePublicOneEnergyBoxKo,
  choosePhysicalBoxPayment
}=require('../simulation/twinleaf/agent43-owner-secretbox-fog-ko.cjs');

/** @returns {object} Detached actor-only owner view with printed lethal attack. */
function view(){
  return {
    decisionKind:'owner-root',globalTurn:14,
    ownHand:[VIP,BOX,CARRIER,VIP,CARRIER],
    ownTurnResources:{itemPlayLocked:false,energyPlayLocked:false,
      energyPlayedTurn:0},
    ownPublic:{
      active:{printing:'Unown AOR',energies:[],attacks:[
        {name:'Hidden Power',cost:[9],damage:10,gxAttack:false}
      ],publicRestrictions:{cannotAttackNextTurn:false},
        specialConditions:[]},
      publicTurnRestrictions:{itemPlayLocked:false,
        attackLockTurnsRemaining:0}
    },
    opponentPublic:{active:{printing:'Trubbish FST',hp:70,damage:60}}
  };
}
test('source-independent public lethal attacker and hand cost selects payoff',()=>{
  assert.deepEqual(choosePublicOneEnergyBoxKo(view()),{
    attackName:'Hidden Power',sourcePrinting:'Unown AOR',
    energyPrinting:BASIC
  });
});
test('no protected hidden Prize/deck information is necessary',()=>{
  const own=view();
  Object.defineProperty(own,'unpermittedHiddenDeck',{get(){
    throw Error('Hidden deck was read');}});
  assert.equal(choosePublicOneEnergyBoxKo(own)?.attackName,'Hidden Power');
});
test('reject when paid search, attack, Item or Energy constraints fail',()=>{
  const v=view();
  const cases=[
    {...v,ownHand:[BOX,VIP,CARRIER]},
    {...v,ownHand:[BOX,VIP,VIP]},
    {...v,ownTurnResources:{...v.ownTurnResources,itemPlayLocked:true}},
    {...v,ownTurnResources:{...v.ownTurnResources,energyPlayedTurn:14}},
    {...v,opponentPublic:{active:{hp:70,damage:59}}},
    {...v,ownPublic:{...v.ownPublic,active:{...v.ownPublic.active,
      attacks:[{name:'False-Fire-Only',cost:[2],damage:10,gxAttack:false}]}}},
    {...v,ownPublic:{...v.ownPublic,active:{...v.ownPublic.active,
      energies:[BASIC]}}},
    {...v,ownPublic:{...v.ownPublic,active:{...v.ownPublic.active,
      specialConditions:['PARALYZED']}}},
    {...v,globalTurn:2}
  ];
  for(const row of cases)assert.equal(choosePublicOneEnergyBoxKo(row),null);
});
test('native physical payment permits same printing on distinct card objects',()=>{
  const box={fullName:BOX};
  const vip1={fullName:VIP},vip2={fullName:VIP};
  const carry1={fullName:CARRIER},carry2={fullName:CARRIER};
  const cards=[vip1,box,carry1,vip2,carry2];
  const owner={hand:{cards}};
  const prompt={cards:{cards:[vip1,carry1,vip2,carry2]},
    validate:(selection)=>selection.length===3&&
      new Set(selection).size===3&&selection.every(x=>cards.includes(x))};
  assert.deepEqual(choosePhysicalBoxPayment(prompt,owner),[vip1,vip2,carry1]);
});
test('physical card/payment shortfall fails closed',()=>{
  const vip1={fullName:VIP},carry={fullName:CARRIER};
  const owner={hand:{cards:[vip1,carry]}};
  const prompt={cards:{cards:[vip1,carry]},validate:()=>true};
  assert.throws(()=>choosePhysicalBoxPayment(prompt,owner),
    /physically held discard is unavailable/);
});

test('candidate source proxy intentionally selects MEE Basic Psychic print, not SVE',()=>{
  const {loadNewMoonCandidate}=
    require('../scripts/aichi-new-moon-candidate.cjs');
  const roster=loadNewMoonCandidate();
  const basic=roster.cards.find(row=>row.category==='Energy'&&
    row.name==='Psychic Energy');
  assert.ok(basic);
  assert.equal(basic.count,3);
  assert.equal(basic.printing.set,'MEE');
  assert.equal(basic.printing.number,'13');
  assert.ok(roster.substitutions.some(x=>
    x.includes('Basic Psychic represented by MEE 13')));
});

test('native Psychic Basic can fund Psychic or Colorless cost, never typed Fire',()=>{
  const v=view();
  const p={psychic:5,colorless:9};
  assert.equal(choosePublicOneEnergyBoxKo(v,p)?.attackName,'Hidden Power');
  const psychic={...v,ownPublic:{...v.ownPublic,active:{
    ...v.ownPublic.active,attacks:[
      {name:'Psychic10',cost:[5],damage:10,gxAttack:false}]}}};
  assert.equal(choosePublicOneEnergyBoxKo(psychic,p)?.attackName,'Psychic10');
  const fire={...v,ownPublic:{...v.ownPublic,active:{
    ...v.ownPublic.active,attacks:[
      {name:'Fire10',cost:[2],damage:10,gxAttack:false}]}}};
  assert.equal(choosePublicOneEnergyBoxKo(fire,p),null);
});
