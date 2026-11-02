'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {stagedPainfulSpoons}=require('./agent4-rank31-alakazam-movesource-native.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} file @returns {any} */
const native=file=>require(path.join(output,file));
const PRINTING='Guzma & Hala CEC';

/**
 * Prepared native Store case for authenticated rank6 Guzma & Hala.
 * All strategically significant payment and search targets are copied from
 * the original rank6 Kazuma Kashi printed 60 (but no original shuffle/deal).
 * @param {0|1} seat Owner physical seat.
 * @param {0|1|2} paymentCount Submitted count of genuine other hand cards.
 * @returns {object} Real prompt validity and physical recovery.
 */
function probeGuzmaHalaPayment(seat,paymentCount){
  assert.ok(seat===0||seat===1);
  assert.ok([0,1,2].includes(paymentCount));
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const f=stagedPainfulSpoons(seat);
  f.source.active.cards.splice(0,1,f.card('Iron Thorns ex TWM'));
  const handCards=[
    f.card('Plumeria BUS'),
    f.card('Crushing Hammer POR')
  ];
  const supporter=f.card(PRINTING);
  f.source.hand.cards.push(...handCards,supporter);
  const retrieval=[
    f.card('Thunder Mountain LOT'),
    f.card('Handheld Fan TWM'),
    f.card('Double Colorless Energy SUM')
  ];
  f.source.deck.cards.push(...retrieval);
  let rootError=null;
  try{f.store.dispatch(new PlayCardAction(f.source.id,2,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0
  }));}
  catch(e){rootError=String(e?.message??e);}
  let choice=f.state.prompts.find(p=>p.result===undefined&&
    p.constructor.name==='SelectOptionPrompt');
  let choiceError=null;
  if(choice)try{f.store.dispatch(new ResolvePromptAction(choice.id,1));}
  catch(e){choiceError=String(e?.message??e);}
  const payment=f.state.prompts.find(p=>p.result===undefined&&
    p.constructor.name==='ChooseCardsPrompt'&&
    p.message==='CHOOSE_CARD_TO_DISCARD');
  const chosen=handCards.slice(0,paymentCount);
  const paymentValidatorAccepted=payment?
    payment.validate(chosen,f.state):null;
  let paymentError=null;
  if(payment)try{f.store.dispatch(new ResolvePromptAction(payment.id,chosen));}
  catch(e){paymentError=String(e?.message??e);}
  const retrievalPrompt=f.state.prompts.find(p=>p.result===undefined&&
    p.constructor.name==='ChooseCardsPrompt'&&
    p.message==='CHOOSE_CARD_TO_HAND');
  const retrievalValidatorAccepted=retrievalPrompt?
    retrievalPrompt.validate(retrieval,f.state):null;
  let retrievalError=null;
  if(retrievalPrompt)try{
    f.store.dispatch(new ResolvePromptAction(retrievalPrompt.id,retrieval));
  }catch(e){retrievalError=String(e?.message??e);}
  const settlements=[];
  for(let i=0;i<12;i++){
    const p=f.state.prompts.find(q=>q.result===undefined);
    if(!p)break;
    let answer;
    if(p.constructor.name==='WaitPrompt')answer=null;
    else if(p.constructor.name==='ShowCardsPrompt')answer=true;
    else if(p.constructor.name==='ShuffleDeckPrompt')
      answer=Array.from({length:f.source.deck.cards.length},(_,j)=>j);
    else{
      settlements.push({prompt:p.constructor.name,message:p.message??null,
        error:'UNEXPECTED_NATIVE_PROMPT'});
      break;
    }
    let error=null;
    const valid=p.validate(answer,f.state);
    try{f.store.dispatch(new ResolvePromptAction(p.id,answer));}
    catch(e){error=String(e?.message??e);}
    settlements.push({prompt:p.constructor.name,valid,error});
    if(error)break;
  }
  return {
    fixture:'Prepared real Store using original rank6 source printing; no dealt original game',
    sourceRank:6,seat,paymentCount,printing:PRINTING,
    rootError,choiceFound:Boolean(choice),choiceError,
    paymentPromptFound:Boolean(payment),
    paymentPromptLimits:payment?{
      min:payment.options.min,max:payment.options.max
    }:null,
    paymentPromptSourceCard:payment?.sourceCard?.fullName??null,
    paymentValidatorAccepted,paymentError,
    retrievalPromptFound:Boolean(retrievalPrompt),
    retrievalValidatorAccepted,retrievalError,
    recoveredPrintings:retrieval.map(c=>({
      card:c.fullName,inHand:f.source.hand.cards.includes(c),
      inDeck:f.source.deck.cards.includes(c)
    })),
    physicalPaymentCards:handCards.map(c=>({
      card:c.fullName,inHand:f.source.hand.cards.includes(c),
      inDiscard:f.source.discard.cards.includes(c)
    })),
    supporterInDiscard:f.source.discard.cards.includes(supporter),
    pendingPrompts:f.state.prompts.filter(p=>p.result===undefined)
      .map(p=>p.constructor.name),
    settlements,paperPaid:paymentCount===2,
    competitiveQualifiedGames:0
  };
}
if(require.main===module){
  for(const seat of [0,1])for(const payment of [0,1,2]){
    console.log('AGENT30_GUZMA_HALA_NATIVE '+JSON.stringify(
      probeGuzmaHalaPayment(seat,payment)));
  }
}
module.exports={PRINTING,probeGuzmaHalaPayment};
