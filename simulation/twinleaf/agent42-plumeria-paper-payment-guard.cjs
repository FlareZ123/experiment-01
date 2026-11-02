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
 const {CardTag}=require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output/game/store/card/card-types'));
 const old=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
 const liveOnly=deps.requireLiveStore===true;
 const audit={version:'plumeria-paper-cost-v4-prism-lostzone-physical',observed:0,accepted:0,
  rejected:0,qualifiedGames:0,physicalPaymentReceipts:[],
  physicalEffectReceipts:[],nativeAddPlayerStores:0,
  requireLiveStore:liveOnly,auxiliaryPromptSkips:0};
 const liveStoreOrder=new WeakMap();
 const pendingPaymentByStore=new WeakMap();
 function dispatch(action,...args){
  if(action?.constructor?.name==='AddPlayerAction'&&!liveStoreOrder.has(this)){
   audit.nativeAddPlayerStores++;
   liveStoreOrder.set(this,audit.nativeAddPlayerStores);
  }
  let receiptBefore=null,targetBefore=null,energyBefore=null;
  if(action?.constructor?.name==='ResolvePromptAction'){
   const p=this.state?.prompts?.find(x=>x.id===action.id&&x.result===undefined);
   if(liveOnly&&!liveStoreOrder.has(this)){
    if(p?.sourceCard?.fullName==='Plumeria BUS')audit.auxiliaryPromptSkips++;
    return old.value.call(this,action,...args);
   }
   const pending=pendingPaymentByStore.get(this);
   if(pending?.stage==='paid'&&p?.constructor?.name==='ChoosePokemonPrompt'&&
      p.message==='CHOOSE_POKEMON_TO_DISCARD_CARDS')
    targetBefore={pending,prompt:p,selected:action.result};
   if(pending?.stage==='targeted'&&p?.constructor?.name==='ChooseCardsPrompt'&&
      p.message==='CHOOSE_CARD_TO_DISCARD'&&p.options?.min===1&&
      p.options?.max===1){
    const opponent=this.state.players.find(x=>x.id!==pending.ownerId);
    const selected=Array.isArray(action.result)?action.result[0]:null;
    energyBefore={pending,prompt:p,selected,
     inTargetBefore:pending.target?.cards?.includes(selected)??false,
     inOpponentDiscardBefore:opponent?.discard?.cards?.includes(selected)??false};
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
     lostzoneBefore:cards.filter(c=>owner.lostzone.cards.includes(c)).length,
     prompt:p};
   }
  }
  const result=old.value.call(this,action,...args);
  if(receiptBefore){
   const owner=this.state.players.find(x=>x.id===receiptBefore.ownerId);
   const {cards,prompt}=receiptBefore;
   const moved=cards.filter(c=>owner.discard.cards.includes(c)&&
     !owner.hand.cards.includes(c)).length;
   const movedLostZone=cards.filter(c=>owner.lostzone.cards.includes(c)&&
     !owner.hand.cards.includes(c)).length;
   const zoneDetails=cards.map(c=>{
    const prismStar=c.tags?.includes(CardTag.PRISM_STAR)===true;
    const inHandAfter=owner.hand.cards.includes(c);
    const inDiscardAfter=owner.discard.cards.includes(c);
    const inLostZoneAfter=owner.lostzone.cards.includes(c);
    return {printing:c.fullName,
     expectedDestination:prismStar?'lostzone':'discard',
     actualDestination:inDiscardAfter?'discard':inLostZoneAfter?'lostzone':
       inHandAfter?'hand':'other',
     paperDiscardRedirectCorrect:prismStar?inLostZoneAfter:inDiscardAfter,
     inHandAfter};
   });
   const correctDestinations=zoneDetails.every(x=>
    x.paperDiscardRedirectCorrect&&!x.inHandAfter);

   audit.accepted++;
   const paymentReceipt={
    printing:'Plumeria BUS',ownerSeat:receiptBefore.ownerSeat,
    nativeStoreOrdinal:liveStoreOrder.get(this)??null,
    globalTurnAfter:this.state.turn??null,
    paymentNames:receiptBefore.cardNames,
    submittedPhysicalCount:cards.length,
    handMembersBefore:receiptBefore.handBefore,
    discardMembersBefore:receiptBefore.discardBefore,
    lostzoneMembersBefore:receiptBefore.lostzoneBefore,
    movedToOwnerDiscardCount:moved,
    movedToOwnerLostZoneCount:movedLostZone,
    physicalPaymentDestinations:zoneDetails,
    noLongerInOwnerHandCount:cards.filter(c=>!owner.hand.cards.includes(c)).length,
    nativePromptSettled:prompt.result!==undefined,
    independentlyPaidTwo:correctDestinations&&receiptBefore.handBefore===2&&
      receiptBefore.discardBefore===0&&receiptBefore.lostzoneBefore===0&&
      prompt.result!==undefined,
    qualificationScope:'the exact hand payment only'
   };
   audit.physicalPaymentReceipts.push(paymentReceipt);
   pendingPaymentByStore.set(this,{stage:'paid',ownerId:owner.id,
    paymentReceipt,target:null});
  }
  if(targetBefore){
   const {pending,prompt,selected}=targetBefore;
   const opponent=this.state.players.find(x=>x.id!==pending.ownerId);
   const targetValid=Array.isArray(selected)&&selected.length===1&&
    [opponent.active,...opponent.bench].includes(selected[0])&&
    prompt.result!==undefined;
   if(targetValid){
    pending.stage='targeted';
    pending.target=selected[0];
   }else pendingPaymentByStore.delete(this);
  }
  if(energyBefore){
   const {pending,prompt,selected,inTargetBefore,inOpponentDiscardBefore}=
    energyBefore;
   const opponent=this.state.players.find(x=>x.id!==pending.ownerId);
   const afterInDiscard=opponent.discard.cards.includes(selected);
   const afterAttached=pending.target?.cards?.includes(selected)??false;
   audit.physicalEffectReceipts.push({
    printing:'Plumeria BUS',
    ownerSeat:pending.paymentReceipt.ownerSeat,
    nativeStoreOrdinal:liveStoreOrder.get(this)??null,
    paymentIndependentlyPaidTwo:pending.paymentReceipt.independentlyPaidTwo,
    targetInActualOpponentBoardBefore:true,
    energyPrinting:selected?.fullName??null,
    energyAttachedToTargetBefore:inTargetBefore,
    energyInOpponentDiscardBefore:inOpponentDiscardBefore,
    energyInOpponentDiscardAfter:afterInDiscard,
    energyStillAttachedAfter:afterAttached,
    nativePromptSettled:prompt.result!==undefined,
    independentEnergyRemoval:inTargetBefore&&!inOpponentDiscardBefore&&
     afterInDiscard&&!afterAttached&&prompt.result!==undefined,
    qualificationScope:'same native Plumeria effect, not entire game'
   });
   pendingPaymentByStore.delete(this);
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
