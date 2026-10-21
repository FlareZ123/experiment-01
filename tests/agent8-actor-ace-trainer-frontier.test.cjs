'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseEmergencyAceTrainer,VERSION}=
  require('../simulation/twinleaf/agent8-actor-ace-trainer-frontier.cjs');
const {chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {rootPhysicalWitness}=
  require('../simulation/twinleaf/agent5-owner-root-slice.cjs');

const P=5,C=9;
const catalog={
  basics:new Set(),abilityBasics:new Set(),
  basicEnergies:new Set(['Psychic Energy MEE']),
  basicEnergyTypes:{Psychic:P},colorlessEnergyType:C,
  specialConditions:{ASLEEP:2,PARALYZED:0}
};
function view(){
  return {
    decisionKind:'owner-root',globalTurn:22,
    ownHand:['Ace Trainer AOR','Escape Rope BST','Secret Box TWM',
      'Field Blower GRI','Psychic Energy MEE'],
    ownTurnResources:{supporterPlayedTurn:0,supporterPlayLocked:false,
      energyPlayedTurn:0,energyPlayLocked:false,
      pokemonPlayLocked:false,itemPlayLocked:false},
    ownPublic:{
      active:{name:'Galarian Articuno V',energies:[],
        specialConditions:[],publicRestrictions:{},
        attacks:[{name:'Psyray',cost:[P,C,C],gxAttack:false}]},
      bench:[null,null,null,null,null],deckCount:35,prizeCount:6,
      stadium:[],publicTurnRestrictions:{gxUsed:false,
        supporterPlayLocked:false,attackLockTurnsRemaining:0}
    },
    opponentPublic:{prizeCount:5,handCount:8,bench:[]},
    opponentHidden:{hand:['private'],deck:['private'],prizes:['private']}
  };
}
test('supporter recovery only after consuming an available Basic Energy root',()=>{
  const v=view();
  const attach=chooseActorRootIntent(v,catalog,{
    energyFrontier:true,emergencyAceTrainerRoot:true});
  assert.equal(attach.kind,'attach-basic-energy');
  v.ownTurnResources.energyPlayedTurn=22;
  v.ownHand.splice(v.ownHand.indexOf('Psychic Energy MEE'),1);
  const supporter=chooseActorRootIntent(v,catalog,{
    energyFrontier:true,emergencyAceTrainerRoot:true});
  assert.deepEqual(supporter,{
    kind:'play-ace-trainer',handIndex:0,printing:'Ace Trainer AOR'
  });
  assert.ok(VERSION.startsWith('agent8-'));
});
test('Ace Trainer remains legal and selectable as a one-card emergency topdeck',()=>{
  for(const hand of [
    ['Ace Trainer AOR'],
    ['Ace Trainer AOR','Field Blower GRI'],
    ['Ace Trainer AOR','Field Blower GRI','Escape Rope BST']
  ]){
    const v=view();
    v.ownHand=hand;
    v.ownTurnResources.energyPlayedTurn=v.globalTurn;
    assert.deepEqual(chooseEmergencyAceTrainer(v),{
      kind:'play-ace-trainer',handIndex:0,printing:'Ace Trainer AOR'
    });
    assert.deepEqual(chooseActorRootIntent(v,catalog,{
      emergencyAceTrainerRoot:true
    }),{kind:'play-ace-trainer',handIndex:0,printing:'Ace Trainer AOR'});
  }
  const v=view();
  v.ownHand=['Field Blower GRI','Ace Trainer AOR'];
  assert.equal(chooseEmergencyAceTrainer(v).handIndex,1);
});
test('default canonical root remains a Pass for the same stalled owner',()=>{
  const v=view();
  v.ownTurnResources.energyPlayedTurn=22;
  v.ownHand.splice(-1,1);
  assert.equal(chooseActorRootIntent(v,catalog,{energyFrontier:true}).kind,
    'pass');
});
test('never propose if equal Prizes, played Supporter, lock or no deck',()=>{
  const v=view();
  v.opponentPublic.prizeCount=6;
  assert.equal(chooseEmergencyAceTrainer(v),null);
  v.opponentPublic.prizeCount=5;
  v.ownTurnResources.supporterPlayedTurn=1;
  assert.equal(chooseEmergencyAceTrainer(v),null);
  v.ownTurnResources.supporterPlayedTurn=0;
  v.ownTurnResources.supporterPlayLocked=true;
  assert.equal(chooseEmergencyAceTrainer(v),null);
  v.ownTurnResources.supporterPlayLocked=false;
  v.ownPublic.deckCount=0;
  assert.equal(chooseEmergencyAceTrainer(v),null);
  v.ownPublic.deckCount=30;
  v.globalTurn=1;
  assert.equal(chooseEmergencyAceTrainer(v),null);
});
test('private opponent and owner hidden deck identities never affect intent',()=>{
  const a=view(),b=view();
  b.opponentHidden={hand:['forbidden knowledge'],prizes:[],deck:[]};
  b.ownerHiddenDeckOrder=['other'];
  assert.deepEqual(chooseEmergencyAceTrainer(a),
    chooseEmergencyAceTrainer(b));
});
test('Ace Trainer public physical witness requires supporter spend and quota',()=>{
  const intent={kind:'play-ace-trainer',printing:'Ace Trainer AOR'};
  const old={supporterTurn:0,aceTrainerSpent:0};
  assert.equal(rootPhysicalWitness(intent,old,{supporterTurn:1,
    aceTrainerSpent:1},{}),'confirmed-public-effect');
  assert.equal(rootPhysicalWitness(intent,old,{supporterTurn:0,
    aceTrainerSpent:1},{}),'no-confirmed-public-effect');
});
