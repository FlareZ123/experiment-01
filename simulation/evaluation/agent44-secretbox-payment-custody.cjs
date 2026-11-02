'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const VERSION='agent44-live-source-secret-box-physical-payment-custody-v1';
const PRINTING='Secret Box TWM';

/**
 * Passive, postgame-only receipt for the genuine native Secret Box payment.
 * The pinned Store can accept illegal empty prompt replies. This observer
 * verifies that actual selected physical owner-hand cards were moved to the
 * owner's discard pile; it does not turn invalid payment into legal payment.
 *
 * The source owner alone is observed at its own native payment prompt.
 * No private opponent information is passed into a live bot policy.
 *
 * @template T
 * @param {()=>T} execute A synchronous real or test Store run.
 * @param {{Store?:Function,sourceSeat?:0|1|null}} [options]
 * @returns {{result:T,audit:object}}
 */
function withSourceSecretBoxPhysicalPaymentCustody(execute,options={}){
  assert.equal(typeof execute,'function');
  const Store=options.Store??require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store')).Store;
  const sourceSeat=options.sourceSeat??null;
  assert.ok(sourceSeat===null||sourceSeat===0||sourceSeat===1);
  const descriptor=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof descriptor?.value,'function');
  let live=null;
  const audit={version:VERSION,sourceSeat,liveStoreObserved:false,
    inspectedPayments:0,acceptedPayments:0,physicalPaidPayments:0,
    paperInvalidPayments:0,rejectedPayments:0,receipts:[],
    allObservedAcceptedPaymentsPaperPaid:true,competitiveGames:0};

  /** @param {object} action */
  function dispatch(action,...rest){
    if(live===null&&action?.constructor?.name==='AddPlayerAction'){
      live=this;
      audit.liveStoreObserved=true;
    }
    if(this!==live||action?.constructor?.name!=='ResolvePromptAction')
      return descriptor.value.call(this,action,...rest);
    const state=this.state;
    const pending=state.prompts?.find(prompt=>
      prompt.id===action.id&&prompt.result===undefined);
    if(pending?.constructor?.name!=='ChooseCardsPrompt'||
       pending.sourceCard?.fullName!==PRINTING||
       pending.message!=='CHOOSE_CARD_TO_DISCARD')
      return descriptor.value.call(this,action,...rest);
    const ownerSeat=state.players.findIndex(p=>p.id===pending.playerId);
    if(ownerSeat<0||sourceSeat!==null&&ownerSeat!==sourceSeat)
      return descriptor.value.call(this,action,...rest);
    const owner=state.players[ownerSeat];
    const selection=action.result;
    const beforeHand=[...owner.hand.cards];
    const beforeDiscard=[...owner.discard.cards];
    const exactTriple=Array.isArray(selection)&&selection.length===3&&
      new Set(selection).size===3&&
      selection.every(c=>beforeHand.includes(c)&&pending.cards?.cards.includes(c));
    const receipt={ownerSeat,turn:state.turn,promptId:pending.id,
      sourcePrinting:PRINTING,
      proposedPhysicalCardCount:Array.isArray(selection)?selection.length:null,
      exactThreeDistinctOfferedOwnerHandCards:exactTriple,
      paymentPrintings:Array.isArray(selection)?selection.map(c=>c?.fullName??null):[],
      beforeHandCount:beforeHand.length,beforeDiscardCount:beforeDiscard.length,
      acceptedByStore:false,afterHandCount:null,afterDiscardCount:null,
      selectedObjectsLeftOwnerHand:null,selectedObjectsEnteredOwnerDiscard:null,
      physicallyPaperPaid:false,error:null};
    audit.inspectedPayments++;
    try{
      const answer=descriptor.value.call(this,action,...rest);
      const settledOwner=this.state.players.find(p=>p.id===pending.playerId);
      receipt.acceptedByStore=true;
      receipt.afterHandCount=settledOwner.hand.cards.length;
      receipt.afterDiscardCount=settledOwner.discard.cards.length;
      receipt.selectedObjectsLeftOwnerHand=Array.isArray(selection)&&
        selection.every(c=>!settledOwner.hand.cards.includes(c));
      receipt.selectedObjectsEnteredOwnerDiscard=Array.isArray(selection)&&
        selection.every(c=>settledOwner.discard.cards.includes(c));
      receipt.physicallyPaperPaid=exactTriple&&
        receipt.selectedObjectsLeftOwnerHand&&
        receipt.selectedObjectsEnteredOwnerDiscard&&
        receipt.afterHandCount<=beforeHand.length-3&&
        receipt.afterDiscardCount>=beforeDiscard.length+3;
      audit.acceptedPayments++;
      if(receipt.physicallyPaperPaid)audit.physicalPaidPayments++;
      else{
        audit.paperInvalidPayments++;
        audit.allObservedAcceptedPaymentsPaperPaid=false;
      }
      audit.receipts.push(receipt);
      return answer;
    }catch(error){
      receipt.error=String(error?.message??error);
      audit.rejectedPayments++;
      audit.receipts.push(receipt);
      throw error;
    }
  }
  Object.defineProperty(Store.prototype,'dispatch',{...descriptor,value:dispatch});
  try{return {result:execute(),audit};}
  finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',descriptor);
  }
}
module.exports={VERSION,withSourceSecretBoxPhysicalPaymentCustody};
