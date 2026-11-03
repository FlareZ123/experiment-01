'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {choosePublicApexRoot}=
 require('../simulation/twinleaf/agent8-rank13-source-apex-attack-frontier.cjs');
const catalog={specialConditions:{ASLEEP:11,PARALYZED:12}};
const base={decisionKind:'owner-root',globalTurn:16,
  ownPublic:{active:{printing:'Regidrago VSTAR SIT',
    attacks:[{name:'Apex Dragon'}],energies:['Double Dragon Energy ROS',
     'Grass Energy MEE','Fire Energy MEE'],
    publicRestrictions:{},specialConditions:[]},
   discard:['Noivern ex PAL','Dragapult ex TWM'],stadium:[],
   publicTurnRestrictions:{}},opponentPublic:{stadium:[]}};
test('offers native Apex only when visible active, cost and payload are present',()=>{
 const selected=choosePublicApexRoot(base,catalog);
 assert.equal(selected.attackName,'Apex Dragon');
 assert.equal(selected.publicGates.allThreeNecessaryPublicGates,true);
 assert.equal(selected.nativeStoreAndAttackEffectUnverified,true);
});
test('stranded attacker or no discarded source fails public gate',()=>{
 assert.equal(choosePublicApexRoot({...base,ownPublic:{
  ...base.ownPublic,active:{...base.ownPublic.active,printing:'Tapu Lele-GX GRI'}
 }},catalog),null);
 assert.equal(choosePublicApexRoot({...base,ownPublic:{
  ...base.ownPublic,discard:[]
 }},catalog),null);
});
test('public attack locks, Temple and paralysis veto',()=>{
 assert.equal(choosePublicApexRoot({...base,opponentPublic:{
  stadium:['Temple of Sinnoh ASR']
 }},catalog),null);
 assert.equal(choosePublicApexRoot({...base,ownPublic:{
  ...base.ownPublic,active:{...base.ownPublic.active,
   publicRestrictions:{cannotAttackNextTurn:true}}
 }},catalog),null);
 assert.equal(choosePublicApexRoot({...base,ownPublic:{
  ...base.ownPublic,active:{...base.ownPublic.active,
   specialConditions:[catalog.specialConditions.PARALYZED]}
 }},catalog),null);
});
