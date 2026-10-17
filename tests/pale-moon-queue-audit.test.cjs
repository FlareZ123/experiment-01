'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {inspectPaleMoonExits,withPaleMoonQueueAudit}=require('../simulation/twinleaf/pale-moon-queue-audit.cjs');
const subject={getPokemonCard:()=>({fullName:'subject'})};
const backup={getPokemonCard:()=>({fullName:'backup'})};
const queue={type:'knock_out',attack:{name:'Pale Moon-GX'},target:subject};
class AddPlayerAction {}
class RetreatAction {constructor(clear=false){this.clear=clear;}}
class Store {
 constructor(){this.state={turn:5,players:[
   {active:subject,bench:[backup],pendingEndOfTurnEffects:[queue]},
   {active:backup,bench:[],pendingEndOfTurnEffects:[]}
 ]};}
 dispatch(action){if(action instanceof RetreatAction){
   const player=this.state.players[0];player.active=backup;player.bench=[subject];
   if(action.clear)player.pendingEndOfTurnEffects=[];
 }}
}
test('detects exact-target pending KO after switch',()=>{
 const before=[{active:subject,bench:[backup],pending:[queue]}];
 const after=[{active:backup,bench:[subject],pending:[queue]}];
 assert.equal(inspectPaleMoonExits(before,after)[0].queuePersistsOnBench,true);
 assert.equal(inspectPaleMoonExits(before,[{...after[0],pending:[]}])[0].queuePersistsOnBench,false);
});
test('isolates root store and distinguishes bad, clean and absent queue',()=>{
 const original=Store.prototype.dispatch;
 const failing=withPaleMoonQueueAudit(Store,()=>{
   const root=new Store();root.dispatch(new AddPlayerAction());
   new Store().dispatch(new RetreatAction());
   root.dispatch(new RetreatAction());
 });
 assert.equal(failing.rootDispatches,2);
 assert.equal(failing.status,'exercised-failing');
 assert.equal(failing.exits[0].step,1);
 const cleared=withPaleMoonQueueAudit(Store,()=>{
   const root=new Store();root.dispatch(new AddPlayerAction());
   root.dispatch(new RetreatAction(true));
 });
 assert.equal(cleared.status,'exercised-cleared');
 const absent=withPaleMoonQueueAudit(Store,()=>{
   const root=new Store();root.state.players[0].pendingEndOfTurnEffects=[];
   root.dispatch(new AddPlayerAction());root.dispatch(new RetreatAction());
 });
 assert.equal(absent.status,'not-exercised');
 assert.equal(Store.prototype.dispatch,original);
});
