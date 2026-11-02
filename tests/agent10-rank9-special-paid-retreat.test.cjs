'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseRank9SpecialPaidRetreat}=require(
  '../simulation/twinleaf/agent10-rank9-special-paid-retreat.cjs');

const catalog={
  stages:{BASIC:0},basicEnergyTypes:{Darkness:3,Psychic:4},
  colorlessEnergyType:5,
  specialConditions:{ASLEEP:11,PARALYZED:12},
  specialEnergies:new Set(['Prism Energy ASC','Telepath [P] Energy M3'])
};
function fixture(){
  return {
    decisionKind:'owner-root',globalTurn:42,
    ownTurnResources:{retreatedTurn:0},
    ownHand:[],
    ownPublic:{
      stadium:[],prizeCount:4,publicTurnRestrictions:{},
      active:{
        printing:'Electrode-GX CES',
        printed:{retreatCost:[5],types:[3],stage:0},
        energies:['Prism Energy ASC','Darkness Energy MEE'],
        attacks:[],specialConditions:[],publicRestrictions:{}
      },
      bench:[
        {printing:'Mega Absol ex M1L',printed:{stage:0,types:[3]},
          energies:['Prism Energy ASC','Prism Energy ASC',
            'Telepath [P] Energy M3'],
          attacks:[{name:'Claw of Darkness',damage:200,cost:[3,3,5]}],
          specialConditions:[],publicRestrictions:{}},
        null
      ]
    },
    opponentPublic:{stadium:[],prizeCount:2}
  };
}
test('physical rank9 two-Prism Telepath funded source proposal',()=>{
  const p=chooseRank9SpecialPaidRetreat(fixture(),catalog);
  assert.equal(p?.kind,'paid-retreat');
  assert.equal(p?.benchIndex,0);
  assert.equal(p?.attackName,'Claw of Darkness');
  assert.equal(p?.baseDamage,200);
  assert.equal(p?.actualNativeRetreatAndPaymentVerified,false);
});
test('abstain when Absol lacks the second Darkness-capable unit',()=>{
  const v=fixture();
  v.ownPublic.bench[0].energies=['Prism Energy ASC',
    'Telepath [P] Energy M3'];
  assert.equal(chooseRank9SpecialPaidRetreat(v,catalog),null);
});
test('abstain after prior normal retreat or while paralyzed',()=>{
  const a=fixture();a.ownTurnResources.retreatedTurn=42;
  assert.equal(chooseRank9SpecialPaidRetreat(a,catalog),null);
  const b=fixture();b.ownPublic.active.specialConditions=[12];
  assert.equal(chooseRank9SpecialPaidRetreat(b,catalog),null);
});
test('abstain on unknown or modified archetype and active funded attack',()=>{
  const a=fixture();a.ownPublic.active.printing='Electrode-GX OTHER';
  assert.equal(chooseRank9SpecialPaidRetreat(a,catalog),null);
  const b=fixture();b.ownPublic.active.attacks=[
    {name:'Already Ready',damage:100,cost:[5]}];
  assert.equal(chooseRank9SpecialPaidRetreat(b,catalog),null);
});
test('abstain if source is restricted from attack or retreat',()=>{
  const a=fixture();a.ownPublic.publicTurnRestrictions.attackLockTurnsRemaining=1;
  assert.equal(chooseRank9SpecialPaidRetreat(a,catalog),null);
  const b=fixture();b.ownPublic.active.publicRestrictions.cannotRetreatWhileActive=true;
  assert.equal(chooseRank9SpecialPaidRetreat(b,catalog),null);
});
