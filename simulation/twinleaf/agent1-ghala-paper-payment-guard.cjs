'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
/**
 * Default-off reversible paper check for the G&H enhanced two-card branch.
 * Wrap a synchronous native Store fixture; do not install globally.
 * @template T
 * @param {()=>T} run
 * @returns {{result:T,audit:object}}
 */
function withGuard(run){
 assert.equal(typeof run,'function');
 const Store=require(path.resolve(__dirname,
   '../../vendor/twinleaf/ptcg-server/output/game/store/store')).Store;
 const old=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
 assert.equal(typeof old?.value,'function');
 const audit={printing:'Guzma & Hala CEC',
   observedPayments:0,rejectedPayments:0,acceptedPayments:0,
   paperQualifiedGames:0};
 function dispatch(action,...args){
  if(action?.constructor?.name==='ResolvePromptAction'){
   const p=this.state?.prompts?.find(p=>p.id===action.id&&p.result===undefined);
   if(p?.sourceCard?.fullName==='Guzma & Hala CEC'&&
      p.message==='CHOOSE_CARD_TO_DISCARD'){
    audit.observedPayments++;
    const owner=this.state.players.find(x=>x.id===p.playerId);
    const cards=action.result;
    const valid=Array.isArray(cards)&&cards.length===2&&
      new Set(cards).size===2&&Array.isArray(owner?.hand?.cards)&&
      Array.isArray(p.cards?.cards)&&cards.every(c=>
        owner.hand.cards.includes(c)&&p.cards.cards.includes(c));
    if(!valid){
      audit.rejectedPayments++;
      throw Error('PAPER_GHALA_INVALID_TWO_OTHER_CARD_PAYMENT');
    }
    audit.acceptedPayments++;
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
module.exports={withGuard};
