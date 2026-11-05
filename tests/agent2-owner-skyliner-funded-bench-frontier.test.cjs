'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseOwnerSkylinerFundedBenchRetreat:choose}=require(
  '../simulation/twinleaf/agent2-owner-skyliner-funded-bench-frontier.cjs');

const PSY='Psychic Energy MEE';
const MET='Metal Energy MEE';
const catalog={stages:{BASIC:1},colorlessEnergyType:9,
  basicEnergies:new Set([PSY,MET]),
  basicEnergyTypes:{Psychic:5,Metal:8},
  specialConditions:{ASLEEP:1,PARALYZED:2}};
/** @returns {object} A synthetic owner-public genuine-root-shaped state. */
function view(){
  return {decisionKind:'owner-root',actorSeat:1,globalTurn:60,
    ownTurnResources:{retreatedTurn:0},
    ownPublic:{
      publicTurnRestrictions:{attackLockTurnsRemaining:0},
      active:{printing:'Dialga-GX UPR',
        printed:{stage:1,retreatCost:[9,9,9]},
        energies:[PSY,PSY],specialConditions:[],
        publicRestrictions:{},
        attacks:[{name:'Overclock',cost:[8],damage:0},
          {name:'Shred',cost:[8,9,9],damage:80}]},
      bench:[
        {printing:'Latias ex SSP',abilities:['Skyliner'],
          energies:[],specialConditions:[],publicRestrictions:{},
          attacks:[{name:'Eon Blade',cost:[5,5,9],damage:200}]},
        {printing:'Trevenant & Dusknoir-GX SMP',abilities:[],
          energies:[PSY,PSY,PSY],specialConditions:[],publicRestrictions:{},
          attacks:[{name:'Night Watch',cost:[5,5,5],damage:150}]},
        {printing:'Mimikyu GRI',abilities:[],energies:[PSY,PSY],
          specialConditions:[],publicRestrictions:{},
          attacks:[{name:'Copycat',cost:[5,9],damage:0,
            damageCalculation:'copied dynamic attack'}]}
      ]
    },opponentPublic:{active:{printing:'Rotom V LOR'}}};
}
test('owner-only Skyliner proposes funded printed Night Watch from stranded Dialga',()=>{
  const v=view(),snapshot=structuredClone(v);
  const got=choose(v,catalog);
  assert.ok(got);
  assert.equal(got.kind,'skyliner-free-retreat');
  assert.equal(got.benchIndex,1);
  assert.equal(got.attackName,'Night Watch');
  assert.equal(got.baseDamage,150);
  assert.deepEqual(v,snapshot);
});
test('own Skyliner source must exist on face-up board',()=>{
  const v=view();v.ownPublic.bench[0].abilities=[];
  assert.equal(choose(v,catalog),null);
});
test('opponent concealed-zone variation never influences proposal',()=>{
  const v=view(),v2=view();v2.opponentPublic.secretHand=['Counter'];
  assert.deepEqual(choose(v,catalog),choose(v2,catalog));
});
test('no second retreat within same turn',()=>{
  const v=view();v.ownTurnResources.retreatedTurn=60;
  assert.equal(choose(v,catalog),null);
});
test('active attack payable with held Basic is a competing line',()=>{
  const v=view();v.ownPublic.active.energies[0]=MET;
  assert.equal(choose(v,catalog),null);
});
test('Status and known retreat or attack restrictions veto',()=>{
  const a=view(),b=view(),c=view(),d=view();
  a.ownPublic.active.specialConditions=[1];
  b.ownPublic.active.publicRestrictions.cannotRetreatWhileActive=true;
  c.ownPublic.bench[1].publicRestrictions.cannotAttackNextTurn=true;
  d.ownPublic.bench[1].publicRestrictions.blockedAttackNameNextTurn='Night Watch';
  for(const x of [a,b,c,d])assert.equal(choose(x,catalog),null);
});
test('no same-turn turn1 pivot and only Basic active qualifies',()=>{
  const a=view(),b=view();a.globalTurn=1;
  b.ownPublic.active.printed.stage=2;
  assert.equal(choose(a,catalog),null);
  assert.equal(choose(b,catalog),null);
});
