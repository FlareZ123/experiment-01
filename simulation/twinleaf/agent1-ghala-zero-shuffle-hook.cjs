'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
/**
 * Opt-in reversible live Store repair: G&H's empty owner-deck search
 * must still ask for a genuine deck shuffle.
 * @template T
 * @param {()=>T} run
 * @returns {{result:T,audit:object}}
 */
function withZeroShuffle(run){
 const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
 const Store=require(path.join(base,'game/store/store')).Store;
 const {SHUFFLE_DECK}=require(path.join(base,'game/store/prefabs/prefabs'));
 const old=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
 const audit={marked:0,scheduled:0,competitiveQualifiedGames:0};
 function dispatch(action,...args){
  const state=this.state;
  const p=action?.constructor?.name==='ResolvePromptAction'?
    state.prompts.find(x=>x.id===action.id&&x.result===undefined):null;
  const owner=state.players.find(x=>x.id===p?.playerId);
  const zero=p?.sourceCard?.fullName==='Guzma & Hala CEC'&&
    p.message==='CHOOSE_CARD_TO_HAND'&&p.cards===owner?.deck&&
    Array.isArray(action.result)&&action.result.length===0;
  const result=old.value.call(this,action,...args);
  if(zero){
   audit.marked++;
   const hasShuffle=this.state.prompts.some(x=>
     x.result===undefined&&x.constructor.name==='ShuffleDeckPrompt'&&
     x.playerId===owner.id);
   if(!hasShuffle){
    SHUFFLE_DECK(this,this.state,owner);
    audit.scheduled++;
   }
  }
  return result;
 }
 Object.defineProperty(Store.prototype,'dispatch',{...old,value:dispatch});
 try{return {result:run(),audit};}
 finally{
  assert.strictEqual(Store.prototype.dispatch,dispatch);
  Object.defineProperty(Store.prototype,'dispatch',old);
 }
}
module.exports={withZeroShuffle};
