'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {rootPhysicalWitness}=
  require('../simulation/twinleaf/agent5-owner-root-slice.cjs');

const PRINT="Lillie's Determination M1L";
const catalog={
  basics:new Set(),abilityBasics:new Set(),basicEnergies:new Set(['Psychic Energy SVE']),
  basicEnergyTypes:{Psychic:5},colorlessEnergyType:0,
  specialConditions:{ASLEEP:8,PARALYZED:9}
};
function view(hand=[PRINT]){
  return {decisionKind:'owner-root',globalTurn:2,ownHand:hand,
    ownPublic:{
      active:{name:'Mewtwo',energies:['Psychic Energy SVE'],
        publicRestrictions:{},specialConditions:[],
        attacks:[{name:'Pulse',cost:[5]}],printed:{types:[5]}},
      bench:[null,null,null,null,null],
      stadium:[],prizeCount:6,deckCount:38,resolvingSupporter:[],
      publicTurnRestrictions:{attackLockTurnsRemaining:0}
    },
    opponentPublic:{stadium:[],prizeCount:4,deckCount:36,handCount:7},
    ownTurnResources:{supporterPlayedTurn:0,energyPlayedTurn:2,
      supporterPlayLocked:false,energyPlayLocked:false}
  };
}
test('opt-in owner-only shuffle Supporter precedes otherwise payable attack',()=>{
 const owner=view();
 const original=chooseActorRootIntent(owner,catalog);
 assert.equal(original.kind,'attack');
 const recommended=chooseActorRootIntent(owner,catalog,{
   conservativeShuffleBeforeAttack:true});
 assert.equal(recommended.kind,'play-conservative-shuffle-supporter');
 assert.equal(recommended.printing,PRINT);
 assert.equal(recommended.handIndex,0);
 assert.equal(recommended.family,'lillie');
 assert.equal(recommended.drawEstimate.ownDraw,8);
 assert.equal(chooseActorRootIntent(owner,catalog).kind,'attack');
});
test('quota and large hand preserve original payable attack',()=>{
 const spent=view();
 spent.ownTurnResources.supporterPlayedTurn=1;
 assert.equal(chooseActorRootIntent(spent,catalog,{
   conservativeShuffleBeforeAttack:true}).kind,'attack');
 const protectedHand=view([PRINT,'Ultra Ball SVI',
   'Forest Seal Stone SIT','Iono PAL']);
 assert.equal(chooseActorRootIntent(protectedHand,catalog,{
   conservativeShuffleBeforeAttack:true}).kind,'attack');
});
test('public physical receipt checks spent printing plus quota; no draw claim',()=>{
 const intent={kind:'play-conservative-shuffle-supporter',printing:PRINT};
 const before={supporterSpent:0,supporterTurn:0};
 assert.equal(rootPhysicalWitness(intent,before,{
   supporterSpent:1,supporterTurn:1},{}),'confirmed-public-effect');
 assert.equal(rootPhysicalWitness(intent,before,{
   supporterSpent:0,supporterTurn:1},{}),'no-confirmed-public-effect');
 assert.equal(rootPhysicalWitness(intent,before,{
   supporterSpent:1,supporterTurn:0},{}),'no-confirmed-public-effect');
});
