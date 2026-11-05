'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withRank6OwnerShadowMistPassAudit,VERSION,PREFIX,TARGET}=
 require('../simulation/twinleaf/agent8-rank6-shadowmist-source-pass-audit.cjs');

class AddPlayerAction{constructor(){this.clientId=0;}}
class AttackAction{constructor(clientId,name){this.clientId=clientId;this.name=name;}}
class PassTurnAction{constructor(clientId){this.clientId=clientId;}}
class Store{
 constructor(state){this.state=state;}
 dispatch(action){
  const src=this.state.players[1];
  if(action instanceof AttackAction&&action.name==='Shadow Mist'){
   src.cannotPlaySpecialEnergyCards=true;
   src.cannotPlayStadiumCards=true;
   src.playLocksTurnsRemaining=1;
   src.active.damage+=10;
   this.state.activePlayer=1;
  }
  if(action instanceof PassTurnAction){
   src.cannotPlaySpecialEnergyCards=false;
   src.cannotPlayStadiumCards=false;
   src.playLocksTurnsRemaining=0;
   this.state.activePlayer=0;
  }
  return this.state;
 }
}
function setup(){
 const candidate={id:101,hand:{get cards(){
   throw new Error('Opponent private hand leaked');
 }},active:{getPokemonCard:()=>({fullName:'Shadow Rider Calyrex V CRE'})}};
 const source={id:202,hand:{cards:[
   {energyType:'SPECIAL'}, {trainerType:'STADIUM'}, {type:'ordinary'}
 ]},active:{damage:0,energies:{cards:[{}]},
   getPokemonCard:()=>({fullName:'Iron Thorns ex TWM'})},
   prizes:Array.from({length:6},()=>({cards:[{}]})),
   cannotPlaySpecialEnergyCards:false,cannotPlayStadiumCards:false,
   playLocksTurnsRemaining:0};
 const state={players:[candidate,source],activePlayer:0,turn:2};
 const store=new Store(state);
 return {store,source};
}
const deps={Store,EnergyType:{BASIC:'BASIC',SPECIAL:'SPECIAL'},TrainerType:{ITEM:'ITEM',SUPPORTER:'SUPPORTER',STADIUM:'STADIUM',TOOL:'TOOL'}};
test('actual source-owner shadow lock and spent hand categories recorded, no opponent hidden reads',()=>{
 const before=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
 const headless={runMatch:()=>{
  const f=setup();
  f.store.dispatch(new AddPlayerAction());
  f.store.dispatch(new AttackAction(101,'Shadow Mist'));
  f.store.dispatch(new PassTurnAction(202));
  return {native:'returned'};
 }};
 const initial=headless.runMatch;
 const {result,audit}=withRank6OwnerShadowMistPassAudit(
   ()=>headless.runMatch({label:PREFIX+TARGET}),{...deps,headless});
 assert.deepEqual(result,{native:'returned'});
 assert.equal(audit.version,VERSION);
 assert.equal(audit.matchingMatches,1);
 assert.equal(audit.nativeStores,1);
 assert.equal(audit.shadowMistAttacks.length,1);
 assert.equal(audit.sourcePasses.length,1);
 assert.equal(audit.shadowMistAttacks[0].damageBefore,0);
 assert.equal(audit.shadowMistAttacks[0].damageAfter,10);
 assert.equal(audit.shadowMistAttacks[0].specialEnergyLockedAfter,true);
 assert.equal(audit.sourcePasses[0].specialEnergyInSourceHand,1);
 assert.equal(audit.sourcePasses[0].stadiumsInSourceHand,1);
 assert.equal(audit.sourcePasses[0].itemsInSourceHand,0);
 assert.equal(audit.sourcePasses[0].supportersInSourceHand,0);
 assert.equal(audit.sourcePasses[0].toolsInSourceHand,0);
 assert.equal(audit.sourcePasses[0].basicEnergyInSourceHand,0);
 assert.equal(audit.sourcePasses[0].specialEnergyHandPlayLocked,true);
 assert.equal(audit.sourcePasses[0].sourceActiveAttachedEnergyCards,1);
 assert.equal(audit.readsOtherActorPrivate,false);
 assert.strictEqual(headless.runMatch,initial);
 assert.deepEqual(Object.getOwnPropertyDescriptor(Store.prototype,'dispatch'),before);
});
test('nonmatching game never installs a physical owner-hand observer',()=>{
 const headless={runMatch:()=>({unmodified:true})};
 const {audit}=withRank6OwnerShadowMistPassAudit(
   ()=>headless.runMatch({label:PREFIX+'11:102:A:new-moon-lockbreaker-v1'}),
   {...deps,headless});
 assert.equal(audit.matchingMatches,0);
 assert.equal(audit.allRegisteredMatchesDelegated,1);
 assert.equal(audit.nativeStores,0);
 assert.equal(audit.sourcePasses.length,0);
});
