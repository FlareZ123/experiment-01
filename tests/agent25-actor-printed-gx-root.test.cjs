'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const catalog={
  basics:new Set(),abilityBasics:new Set(),
  basicEnergies:new Set(['Psychic Energy MEE']),
  basicEnergyTypes:{Psychic:5},colorlessEnergyType:9,
  specialConditions:{ASLEEP:2,PARALYZED:0}
};
function view(){
  return {decisionKind:'owner-root',globalTurn:2,ownHand:[],
    ownPublic:{
      active:{energies:['Psychic Energy MEE','Psychic Energy MEE'],
        printed:{types:[5]},
        attacks:[{name:'Power-GX',cost:[5,9],gxAttack:true}],
        specialConditions:[],publicRestrictions:{}},
      bench:[null,null,null,null,null],
      publicTurnRestrictions:{gxUsed:false,cannotUseGXAttacks:false,attackLockTurnsRemaining:0}
    },
    opponentPublic:{stadium:[]},
    ownTurnResources:{energyPlayedTurn:2,energyPlayLocked:false,
      pokemonPlayLocked:false,specialEnergyPlayLocked:false}
  };
}
test('optional printed GX root preserves original default',()=>{
 assert.equal(chooseActorRootIntent(view(),catalog).kind,'pass');
 assert.deepEqual(chooseActorRootIntent(view(),catalog,{printedGxRoot:true}),{
  kind:'attack',attackName:'Power-GX'
 });
});
test('spent GX and explicit rule prohibition veto a GX attack',()=>{
 for(const key of ['gxUsed','cannotUseGXAttacks']){
  const v=view();v.ownPublic.publicTurnRestrictions[key]=true;
  assert.equal(chooseActorRootIntent(v,catalog,{printedGxRoot:true}).kind,'pass');
 }
});
test('unpaid cost, first turn, sleep and attack lock veto optional GX',()=>{
 for(const change of [
  v=>v.ownPublic.active.energies=[],
  v=>v.globalTurn=1,
  v=>v.ownPublic.active.specialConditions=[catalog.specialConditions.ASLEEP],
  v=>v.ownPublic.active.publicRestrictions.cannotAttackNextTurn=true,
  v=>v.ownPublic.active.publicRestrictions.blockedAttackNameNextTurn='Power-GX'
 ]){
  const v=view();change(v);
  assert.equal(chooseActorRootIntent(v,catalog,{printedGxRoot:true}).kind,'pass');
 }
});

test('printed GX suffix protects quota when native gxAttack flag is false',()=>{
  const v=view();
  v.ownPublic.active.attacks[0].gxAttack=false;
  assert.equal(chooseActorRootIntent(v,catalog).kind,'pass');
  assert.equal(chooseActorRootIntent(v,catalog,{printedGxRoot:true}).attackName,
    'Power-GX');
  v.ownPublic.publicTurnRestrictions.gxUsed=true;
  assert.equal(chooseActorRootIntent(v,catalog,{printedGxRoot:true}).kind,
    'pass');
  v.ownPublic.publicTurnRestrictions.gxUsed=false;
  v.ownPublic.publicTurnRestrictions.cannotUseGXAttacks=true;
  assert.equal(chooseActorRootIntent(v,catalog,{printedGxRoot:true}).kind,
    'pass');
});
