'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const VERSION='agent9-native-dedechange-decision-custody-observer-v1';

/**
 * Preserve before/after physical owner custody at a real printed Dedechange
 * ConfirmPrompt, without changing any native action or reading deck order.
 *
 * @template T
 * @param {()=>T} run
 * @returns {{result:T,audit:{version:string,events:object[],ownerOnly:boolean}}}
 */
function withOwnerDedechangeReceipt(run){
  assert.equal(typeof run,'function');
  const output=path.resolve(__dirname,'../../../vendor/twinleaf/ptcg-server/output');
  const {Store}=require(path.join(output,'game/store/store'));
  const descriptor=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof descriptor?.value,'function');
  assert.equal(descriptor.configurable,true);
  const pendingByPrompt=new WeakMap();
  const audit={version:VERSION,events:[],ownerOnly:true,
    readsOpponentHidden:false,readsUnopenedDeck:false,
    competitiveGamesQualified:0};
  function observedDispatch(action,...args){
    const state=this.state;
    const beforePrompts=new Set(state?.prompts??[]);
    const playedOwner=action?.constructor?.name==='PlayCardAction'?
      state.players.find(p=>p.id===action.id):null;
    const physicalPlayed=playedOwner?.hand?.cards?.[action.handIndex]??null;
    const enteringDedenne=physicalPlayed?.fullName==='Dedenne GX UNB';
    const prompt=state?.prompts?.find(p=>p.result===undefined&&
      action?.constructor?.name==='ResolvePromptAction'&&p.id===action.id);
    const owner=prompt?state.players.find(p=>p.id===prompt.playerId):null;
    const seat=owner?state.players.indexOf(owner):-1;
    const lineage=prompt?pendingByPrompt.get(prompt):null;
    const isDedenne=prompt?.message==='WANT_TO_USE_ABILITY'&&owner&&
      lineage?.ownerId===owner.id&&owner.bench.some(slot=>
        slot.cards.includes(lineage.physical));
    if(!isDedenne){
      const response=descriptor.value.apply(this,[action,...args]);
      if(enteringDedenne){
        const actor=this.state.players.find(p=>p.id===playedOwner.id);
        const physicallyBenched=actor.bench.some(slot=>
          slot.cards.includes(physicalPlayed));
        if(physicallyBenched)
          for(const newlyOffered of this.state.prompts){
            if(!beforePrompts.has(newlyOffered)&&
                newlyOffered.playerId===actor.id&&
                newlyOffered.message==='WANT_TO_USE_ABILITY')
              pendingByPrompt.set(newlyOffered,{
                ownerId:actor.id,physical:physicalPlayed});
          }
      }
      return response;
    }
    const beforeHand=[...owner.hand.cards];
    const beforeDiscard=[...owner.discard.cards];
    const beforeLost=[...owner.lostzone.cards];
    const deckBefore=owner.deck.cards.length;
    const result=descriptor.value.apply(this,[action,...args]);
    const after=this.state.players.find(p=>p.id===owner.id);
    const discarded=beforeHand.filter(c=>
      !beforeDiscard.includes(c)&&after.discard.cards.includes(c));
    const lost=beforeHand.filter(c=>
      !beforeLost.includes(c)&&after.lostzone.cards.includes(c));
    const retained=beforeHand.filter(c=>after.hand.cards.includes(c));
    const originalMoved=discarded.length+lost.length;
    const deckDelta=deckBefore-after.deck.cards.length;
    const nativeConfirmSettled=prompt.result===action.result;
    const nativePaymentConserved=action.result===true?
      originalMoved===beforeHand.length&&retained.length===0&&
      deckDelta===6&&after.hand.cards.length===6:
      originalMoved===0&&retained.length===beforeHand.length&&
      deckDelta===0&&after.hand.cards.length===beforeHand.length;
    pendingByPrompt.delete(prompt);
    audit.events.push({seat,turn:state.turn,answer:action.result,
      exactPhysicalEntryPromptLineage:true,
      promptNativeSettled:nativeConfirmSettled,
      originalHandCount:beforeHand.length,
      originalHandPrintings:beforeHand.map(c=>c.fullName),
      originalDiscardedPrintings:discarded.map(c=>c.fullName),
      originalLostZonePrintings:lost.map(c=>c.fullName),
      originalRetainedPrintings:retained.map(c=>c.fullName),
      sourceDeckBefore:deckBefore,sourceDeckAfter:after.deck.cards.length,
      deckDelta,postHandCount:after.hand.cards.length,
      nativePaymentConserved,
      originalPhysicalDedenneBenched:after.bench.some(slot=>
        slot.cards.some(c=>c.fullName==='Dedenne GX UNB'))});
    assert.ok(nativeConfirmSettled&&nativePaymentConserved,
      'Owner Dedechange native physical destination mismatch');
    return result;
  }
  Object.defineProperty(Store.prototype,'dispatch',{
    ...descriptor,value:observedDispatch
  });
  try{return {result:run(),audit};}
  catch(error){
    if(error&&typeof error==='object')
      error.agent9DedechangeReceipt={...audit,events:[...audit.events],
        aborted:true};
    throw error;
  }finally{
    assert.strictEqual(Store.prototype.dispatch,observedDispatch);
    Object.defineProperty(Store.prototype,'dispatch',descriptor);
  }
}

module.exports={VERSION,withOwnerDedechangeReceipt};
