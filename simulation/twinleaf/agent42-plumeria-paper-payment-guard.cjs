'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
/** @template T @param {()=>T} run @returns {{result:T,audit:object}} */
function withPaperPlumeriaPayment(run){
 assert.equal(typeof run,'function');
 const {Store}=require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output/game/store/store'));
 const old=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
 const audit={version:'plumeria-paper-cost-v1',observed:0,accepted:0,
  rejected:0,qualifiedGames:0};
 function dispatch(action,...args){
  if(action?.constructor?.name==='ResolvePromptAction'){
   const p=this.state?.prompts?.find(x=>x.id===action.id&&x.result===undefined);
   if(p?.sourceCard?.fullName==='Plumeria BUS'&&
      p.message==='CHOOSE_CARD_TO_DISCARD'&&p.options?.min===2&&
      p.options?.max===2){
    audit.observed++;
    const owner=this.state.players.find(x=>x.id===p.playerId);
    const cards=action.result;
    const valid=Array.isArray(cards)&&cards.length===2&&
      new Set(cards).size===2&&Array.isArray(owner?.hand?.cards)&&
      Array.isArray(p.cards?.cards)&&cards.every(x=>
        owner.hand.cards.includes(x)&&p.cards.cards.includes(x));
    if(!valid){
     audit.rejected++;
     throw Error('PAPER_PLUMERIA_INVALID_TWO_CARD_PAYMENT');
    }
    audit.accepted++;
   }
  }
  return old.value.call(this,action,...args);
 }
 Object.defineProperty(Store.prototype,'dispatch',{...old,value:dispatch});
 try{return {result:run(),audit};}
 finally{
  assert.strictEqual(Store.prototype.dispatch,dispatch);
  Object.defineProperty(Store.prototype,'dispatch',old);
 }
}
module.exports={withPaperPlumeriaPayment};
