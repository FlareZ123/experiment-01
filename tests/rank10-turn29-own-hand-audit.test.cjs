'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {ownHandSnapshot,withTurn29OwnHandAudit}=
 require('../simulation/twinleaf/rank10-turn29-own-hand-audit.cjs');

const enums={
 SuperType:{POKEMON:1,TRAINER:2,ENERGY:3},
 TrainerType:{ITEM:0,SUPPORTER:1,STADIUM:2,TOOL:3},
 digest:()=> 'fixed-source-digest'
};
const state=()=>({
 turn:29,activePlayer:0,
 players:[{
  energyPlayedTurn:10,supporterTurn:10,
  hand:{cards:[
   {fullName:'Grass Energy',superType:3},
   {fullName:'Guzma',superType:2,trainerType:1},
   {fullName:'Regidrago V',superType:1}
  ]}
 }]
});
class AddPlayerAction{}
class OtherAction{}
class RetreatAction{}
class Store{
 constructor(){this.state=state();this.count=0;}
 dispatch(){this.count+=1;return this.count;}
}
function sourceGame(){
 const store=new Store();
 store.dispatch(new AddPlayerAction());
 for(let i=1;i<231;i++)store.dispatch(new OtherAction());
 store.dispatch(new RetreatAction());
 return store.count;
}
test('own-hand projection classifies pinned enum categories only',()=>{
 const result=ownHandSnapshot(state(),0,enums);
 assert.equal(result.energyInHand,1);
 assert.equal(result.supportersInHand,1);
 assert.equal(result.ownHand.length,3);
 assert.equal(JSON.stringify(result).includes('deck'),false);
});
test('observer records both root231 own-hand decisions and restores Store',()=>{
 const original=Store.prototype.dispatch;
 const result=withTurn29OwnHandAudit(Store,()=>[sourceGame(),sourceGame()],enums);
 assert.deepEqual(result.result,[232,232]);
 assert.equal(result.observations.length,2);
 assert.deepEqual(result.observations[0],result.observations[1]);
 assert.equal(result.observations[0].ordinal,231);
 assert.strictEqual(Store.prototype.dispatch,original);
 assert.equal(sourceGame(),232);
});
test('restores the dispatch function when wrapped work throws',()=>{
 const original=Store.prototype.dispatch;
 assert.throws(()=>withTurn29OwnHandAudit(Store,()=>{
  throw Error('synthetic interruption');
 },enums),/synthetic interruption/);
 assert.strictEqual(Store.prototype.dispatch,original);
});
