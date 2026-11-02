'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {stagedPainfulSpoons}=require('./agent4-rank31-alakazam-movesource-native.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} p @returns {any} */
const native=p=>require(path.join(output,p));
const PRINTING='Dowsing Machine PLS';

/**
 * Real pinned Store payment/cost audit of rank26 source-printed PLS128.
 * The board is a staged test fixture and is not an original dealt 60.
 * @param {0|1} seat Physical owner seat.
 * @param {0|1|2} count Payment cards sent to the real prompt.
 * @returns {object} Source-visible physical zones and native replies.
 */
function probeDowsingPayment(seat,count){
  assert.ok(seat===0||seat===1);
  assert.ok([0,1,2].includes(count));
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const f=stagedPainfulSpoons(seat);
  const lightning=f.card('Lightning Energy MEE');
  const colorless=f.card('Double Colorless Energy SUM');
  const machine=f.card(PRINTING);
  const target=f.card('Battle VIP Pass FST');
  f.source.hand.cards.push(lightning,colorless,machine);
  f.source.discard.cards.push(target);
  let rootError=null;
  try{
    f.store.dispatch(new PlayCardAction(f.source.id,2,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
  }catch(e){rootError=String(e?.message??e);}
  const pending=()=>f.state.prompts.find(p=>p.result===undefined);
  const payment=f.state.prompts.find(p=>p.result===undefined&&
    p.constructor.name==='ChooseCardsPrompt'&&
    p.message==='CHOOSE_CARD_TO_DISCARD');
  const selected=[lightning,colorless].slice(0,count);
  const validatorAccepted=payment?payment.validate(selected,f.state):null;
  let paymentError=null;
  if(payment){
    try{f.store.dispatch(new ResolvePromptAction(payment.id,selected));}
    catch(e){paymentError=String(e?.message??e);}
  }
  const continuation=[];
  if(!paymentError){
    for(let i=0;i<12;i++){
      const p=pending();
      if(!p)break;
      const kind=p.constructor.name;
      let answer;
      if(kind==='ChooseCardsPrompt'&&p.message==='CHOOSE_CARD_TO_HAND'){
        answer=[target];
      }else if(kind==='WaitPrompt'){
        answer=null;
      }else if(kind==='ShuffleDeckPrompt'){
        answer=Array.from({length:f.source.deck.cards.length},(_,j)=>j);
      }else{
        continuation.push({kind,error:'UNEXPECTED_NATIVE_PROMPT'});
        break;
      }
      const valid=p.validate(answer,f.state);
      let error=null;
      try{f.store.dispatch(new ResolvePromptAction(p.id,answer));}
      catch(e){error=String(e?.message??e);}
      continuation.push({kind,message:p.message??null,valid,error});
      if(error)break;
    }
  }
  return {
    scope:'Prepared real pinned native Store; rank26 original printing, not a dealt match',
    sourceRank:26,seat,count,printing:PRINTING,
    firstPromptFound:Boolean(payment),
    nativePaymentPromptSourceCard:payment?.sourceCard?.fullName??null,
    nativePaymentLimits:payment?{min:payment.options.min,max:payment.options.max,
      allowCancel:payment.options.allowCancel}:null,
    nativePaymentValidatorAccepted:validatorAccepted,
    rootError,paymentError,
    paymentPromptSettled:payment?.result!==undefined,
    nativeRecoveredTarget:f.source.hand.cards.includes(target),
    targetStillInDiscard:f.source.discard.cards.includes(target),
    paymentDiscarded:[lightning,colorless].map(card=>
      f.source.discard.cards.includes(card)),
    paymentHeld:[lightning,colorless].map(card=>
      f.source.hand.cards.includes(card)),
    dowsingInHand:f.source.hand.cards.includes(machine),
    dowsingInDiscard:f.source.discard.cards.includes(machine),
    dowsingInSupporter:f.source.supporter.cards.includes(machine),
    pendingPrompts:f.state.prompts.filter(p=>p.result===undefined)
      .map(p=>p.constructor.name),
    continuation,
    paperPaymentValid:count===2,
    competitivelyQualified:false
  };
}
if(require.main===module){
  for(const seat of [0,1])for(const count of [0,1,2])
    console.log('AGENT30_DOWSING_NATIVE '+JSON.stringify(
      probeDowsingPayment(seat,count)));
}
module.exports={PRINTING,probeDowsingPayment};
