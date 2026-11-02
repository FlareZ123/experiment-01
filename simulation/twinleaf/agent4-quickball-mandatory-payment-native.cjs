'use strict';
const path=require('node:path');
const {stagedPainfulSpoons}=
  require('./agent4-rank31-alakazam-movesource-native.cjs');
const output=path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} file @returns {any} */
const native=file=>require(path.join(output,file));

/**
 * Run original rank-5 source Quick Ball FST against a genuine pinned Store.
 * The exercise is a prepared board with genuine printed physical cards,
 * not a naturally dealt match or evidence of competitive performance.
 * @param {0|1} [seat]
 * @param {'zero'|'one'} [payment]
 * @returns {object} Actual native Store prompt and physical zone receipts
 */
function probeQuickBallMandatoryPayment(seat=0,payment='zero'){
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const f=stagedPainfulSpoons(seat);
  const energy=f.card('Psychic Energy SVE');
  const ball=f.card('Quick Ball FST');
  const dedenne=f.card('Dedenne GX UNB');
  f.source.hand.cards.push(energy,ball);
  f.source.deck.cards.push(dedenne);
  const beforeHand=f.source.hand.cards.length;
  const pending=()=>f.state.prompts.find(p=>p.result===undefined);
  let rootError=null;
  try{
    f.store.dispatch(new PlayCardAction(f.source.id,1,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
  }catch(error){rootError=String(error?.message??error);}
  const prompt=f.state.prompts.find(p=>p.result===undefined&&
    p.constructor.name==='ChooseCardsPrompt');
  const chosenPayment=payment==='one'?[energy]:[];
  const promptEvidence={
    printing:prompt?.sourceCard?.fullName??null,
    type:prompt?.constructor?.name??null,
    message:prompt?.message??null,
    cardsZone:prompt?.cards===f.source.hand?'hand':
      prompt?.cards===f.source.deck?'deck':
      (prompt?.cards?.cards?.every(card=>f.source.hand.cards.includes(card))?
        'hand-physical-subset':'other'),
    offered:prompt?.cards?.cards?.map(card=>card.fullName)??[],
    min:prompt?.options?.min??null,
    max:prompt?.options?.max??null,
    nativeValidated:prompt?.validate(chosenPayment,f.state)??null,
    resultDefinedBeforeReply:prompt?.result!==undefined,
    energyInHandAfterRoot:f.source.hand.cards.includes(energy),
    energyInDiscardAfterRoot:f.source.discard.cards.includes(energy)
  };
  let paymentError=null;
  if(prompt){
    try{
      f.store.dispatch(new ResolvePromptAction(prompt.id,chosenPayment));
    }catch(error){paymentError=String(error?.message??error);}
  }
  const continuation=[];
  for(let i=0;paymentError===null&&i<12;i++){
    const p=pending();
    if(!p)break;
    const type=p.constructor.name;
    let answer;
    if(type==='ChooseCardsPrompt')answer=[dedenne];
    else if(type==='ShowCardsPrompt')answer=true;
    else if(type==='ShuffleDeckPrompt')
      answer=Array.from({length:f.source.deck.cards.length},(_,j)=>j);
    else if(type==='WaitPrompt')answer=null;
    else{
      continuation.push({type,error:'unexpected-pending-native-prompt'});
      break;
    }
    let error=null;
    try{f.store.dispatch(new ResolvePromptAction(p.id,answer));}
    catch(e){error=String(e?.message??e);}
    continuation.push({type,error});
    if(error)break;
  }
  return {
    seat,payment,originalSourceRank:5,
    originalPrintedQuickBall:'Quick Ball FST',
    originalPrintedSearchTarget:'Dedenne GX UNB',
    beforeHand,rootError,promptEvidence,paymentError,
    paymentSettled:prompt?.result!==undefined,
    energyInHand:f.source.hand.cards.includes(energy),
    energyInDiscard:f.source.discard.cards.includes(energy),
    ballInHand:f.source.hand.cards.includes(ball),
    ballInDiscard:f.source.discard.cards.includes(ball),
    dedenneInHand:f.source.hand.cards.includes(dedenne),
    dedenneInDeck:f.source.deck.cards.includes(dedenne),
    pendingPrompts:f.state.prompts.filter(p=>p.result===undefined)
      .map(p=>p.constructor.name),
    continuation,
    qualifiedGame:false
  };
}

/**
 * Original printed Quick Ball with no other owner hand card. Native root
 * may reject without a separate guard; compare that with paper preflight.
 * @param {0|1} [seat]
 * @returns {object}
 */
function probeQuickBallNoOtherCard(seat=0){
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const f=stagedPainfulSpoons(seat);
  const ball=f.card('Quick Ball FST');
  const dedenne=f.card('Dedenne GX UNB');
  f.source.hand.cards.push(ball);
  f.source.deck.cards.push(dedenne);
  let error=null;
  try{
    f.store.dispatch(new PlayCardAction(f.source.id,0,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
  }catch(e){error=String(e?.message??e);}
  return {seat,error,ballInHand:f.source.hand.cards.includes(ball),
    ballInDiscard:f.source.discard.cards.includes(ball),
    ownerHandSize:f.source.hand.cards.length,
    pendingPrompts:f.state.prompts.filter(p=>p.result===undefined)
      .map(p=>p.constructor.name),qualifiedGame:false};
}
module.exports={probeQuickBallMandatoryPayment,probeQuickBallNoOtherCard};
