'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
/**
 * @template T
 * @param {()=>T} run Synchronous native workload.
 * @param {{requireLiveStore?:boolean}} [deps] Scope to AddPlayer-created match Stores.
 * @returns {{result:T,audit:object}}
 */
function withPaperPlumeriaPayment(run,deps={}){
 assert.equal(typeof run,'function');
 const {Store}=require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output/game/store/store'));
 const old=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
 const liveOnly=deps.requireLiveStore===true;
 const audit={version:'plumeria-paper-cost-v3-live-scoped',observed:0,accepted:0,
  rejected:0,qualifiedGames:0,physicalPaymentReceipts:[],nativeAddPlayerStores:0,
  requireLiveStore:liveOnly,auxiliaryPromptSkips:0};
 const liveStoreOrder=new WeakMap();
 function dispatch(action,...args){
  if(action?.constructor?.name==='AddPlayerAction'&&!liveStoreOrder.has(this)){
   audit.nativeAddPlayerStores++;
   liveStoreOrder.set(this,audit.nativeAddPlayerStores);
  }
  let receiptBefore=null;
  if(action?.constructor?.name==='ResolvePromptAction'){
   const p=this.state?.prompts?.find(x=>x.id===action.id&&x.result===undefined);
   if(liveOnly&&!liveStoreOrder.has(this)){
    if(p?.sourceCard?.fullName==='Plumeria BUS')audit.auxiliaryPromptSkips++;
    return old.value.call(this,action,...args);
   }
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
    receiptBefore={ownerId:owner.id,
     ownerSeat:this.state.players.indexOf(owner),
     cardNames:cards.map(c=>c.fullName),
     cards,handBefore:cards.filter(c=>owner.hand.cards.includes(c)).length,
     discardBefore:cards.filter(c=>owner.discard.cards.includes(c)).length,
     prompt:p};
   }
  }
  const result=old.value.call(this,action,...args);
  if(receiptBefore){
   const owner=this.state.players.find(x=>x.id===receiptBefore.ownerId);
   const {cards,prompt}=receiptBefore;
   const moved=cards.filter(c=>owner.discard.cards.includes(c)&&
     !owner.hand.cards.includes(c)).length;
   audit.accepted++;
   audit.physicalPaymentReceipts.push({
    printing:'Plumeria BUS',ownerSeat:receiptBefore.ownerSeat,
    nativeStoreOrdinal:liveStoreOrder.get(this)??null,
    globalTurnAfter:this.state.turn??null,
    paymentNames:receiptBefore.cardNames,
    submittedPhysicalCount:cards.length,
    handMembersBefore:receiptBefore.handBefore,
    discardMembersBefore:receiptBefore.discardBefore,
    movedToOwnerDiscardCount:moved,
    noLongerInOwnerHandCount:cards.filter(c=>!owner.hand.cards.includes(c)).length,
    nativePromptSettled:prompt.result!==undefined,
    independentlyPaidTwo:moved===2&&receiptBefore.handBefore===2&&
      receiptBefore.discardBefore===0&&prompt.result!==undefined,
    qualificationScope:'this Store payment only; later game effects unverified'
   });
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
module.exports={withPaperPlumeriaPayment};
