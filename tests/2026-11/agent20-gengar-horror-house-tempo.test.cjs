'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseGengarHorrorHouseTempo:GENGAR_LINE,GENGAR,LATIAS,
  LELE,HORROR}=require('../../simulation/twinleaf/2026-11/agent20-gengar-horror-house-tempo.cjs');

const P='Psychic Energy MEE';
const catalog={
  basicEnergies:new Set([P]),
  basicEnergyTypes:{Psychic:5},
  specialConditions:{ASLEEP:1,PARALYZED:2}
};

/**
 * A valid detached owner-only observation from a prospective paper game.
 * @param {object} [config] Override particular cards or owner resources.
 * @returns {object}
 */
function view(config={}){
  const gengar={printing:GENGAR,energies:[],
    attacks:[{name:HORROR,gxAttack:true,cost:[5]}],
    publicRestrictions:{},specialConditions:[]};
  const latias={printing:LATIAS,energies:[],abilities:['Skyliner']};
  const lele={printing:LELE,energies:[],publicRestrictions:{},
    specialConditions:[]};
  return {
    decisionKind:'owner-root',globalTurn:4,
    ownHand:[P],ownTurnResources:{retreatedTurn:0,
      energyPlayedTurn:0,energyPlayLocked:false},
    ownPublic:{active:lele,bench:[gengar,null,null,null,null],
      publicTurnRestrictions:{gxUsed:false,cannotUseGXAttacks:false,
        attackLockTurnsRemaining:0,energyPlayLocked:false}},
    opponentPublic:{active:{printing:'Mew V FST'}},
    ...config,
    mocks:{gengar,latias,lele}
  };
}

test('stage one: fund publicly Benched Gengar with held Psychic',()=>{
  const v=view();const result=GENGAR_LINE(v,catalog);
  assert.deepEqual({
    kind:result.kind,slot:result.slot,index:result.index,
    handIndex:result.handIndex,printing:result.printing
  },{kind:'attach-basic-energy',slot:'bench',index:0,
    handIndex:0,printing:P});
  assert.equal(result.stage,'fund-one-psychic-horror-house');
});
test('stage two: after Latias appears, promote the charged Gengar',()=>{
  const v=view();v.mocks.gengar.energies=[P];
  v.ownPublic.bench[4]=v.mocks.latias;
  v.globalTurn=8;
  const result=GENGAR_LINE(v,catalog);
  assert.equal(result.kind,'paid-retreat');
  assert.equal(result.benchIndex,0);
  assert.equal(result.stage,'skyliner-zero-cost-promotion');
});
test('stage three: owner GX attack when Gengar is active and funded',()=>{
  const v=view();v.mocks.gengar.energies=[P];
  v.ownPublic.active=v.mocks.gengar;v.ownPublic.bench[0]=v.mocks.lele;
  v.globalTurn=8;
  assert.deepEqual({
    kind:GENGAR_LINE(v,catalog).kind,
    attack:GENGAR_LINE(v,catalog).attackName
  },{kind:'attack',attack:HORROR});
});
test('never spend GX twice',()=>{
  const v=view();v.ownPublic.publicTurnRestrictions.gxUsed=true;
  assert.equal(GENGAR_LINE(v,catalog),null);
});
test('only own hand Energy is selectable; opponent unknown hand absent',()=>{
  const v=view();v.ownHand=[];assert.equal(GENGAR_LINE(v,catalog),null);
});
test('do not attach a second Energy in a completed attachment turn',()=>{
  const v=view();v.ownTurnResources.energyPlayedTurn=4;
  assert.equal(GENGAR_LINE(v,catalog),null);
});
test('do not force a retreat through paralysis',()=>{
  const v=view();v.mocks.gengar.energies=[P];
  v.ownPublic.bench[4]=v.mocks.latias;
  v.ownPublic.active.specialConditions=[1];
  assert.equal(GENGAR_LINE(v,catalog),null);
});
test('do not retreat without a public Skyliner source',()=>{
  const v=view();v.mocks.gengar.energies=[P];
  assert.equal(GENGAR_LINE(v,catalog),null);
});
test('do not promote after own already-used retreat',()=>{
  const v=view();v.mocks.gengar.energies=[P];
  v.ownPublic.bench[4]=v.mocks.latias;
  v.ownTurnResources.retreatedTurn=4;
  assert.equal(GENGAR_LINE(v,catalog),null);
});
test('respect public attack restriction on Gengar',()=>{
  const v=view();v.mocks.gengar.publicRestrictions.cannotAttackNextTurn=true;
  assert.equal(GENGAR_LINE(v,catalog),null);
});
test('reject undocumented GX attack printing or cost',()=>{
  const v=view();v.mocks.gengar.attacks[0].cost=[5,5];
  assert.equal(GENGAR_LINE(v,catalog),null);
});
