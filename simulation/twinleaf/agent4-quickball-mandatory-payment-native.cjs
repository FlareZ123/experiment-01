'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {stagedPainfulSpoons}=
  require('./agent4-rank31-alakazam-movesource-native.cjs');
const output=path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} file @returns {any} */
const native=file=>require(path.join(output,file));

/**
 * Original source-printed Quick Ball in a prepared native Store. The owner
 * has a single other physical card, so the engine immediately pays that
 * unavoidable cost and proceeds directly to the optional Basic search.
 * @param {0|1} [seat]
 * @param {'zero'|'one'} [search] Number of Basic cards to search (0 or 1)
 * @returns {object} Physical payment, search and prompt evidence
 */
function probeQuickBallMandatoryPayment(seat=0,search='zero'){
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
  const prompt=pending();
  const choice=search==='one'?[dedenne]:[];
  const promptEvidence={
    printing:prompt?.sourceCard?.fullName??null,
    type:prompt?.constructor?.name??null,
    message:prompt?.message??null,
    fromOwnerDeck:prompt?.cards===f.source.deck,
    min:prompt?.options?.min??null,max:prompt?.options?.max??null,
    nativeValidated:prompt?.validate(choice,f.state)??null
  };
  const energyAutoDiscardedBeforeSearch=f.source.discard.cards.includes(energy);
  let searchError=null;
  if(prompt){
    try{f.store.dispatch(new ResolvePromptAction(prompt.id,choice));}
    catch(error){searchError=String(error?.message??error);}
  }
  const continuation=settleContinuation(f,searchError===null,dedenne);
  return {
    seat,search,originalSourceRank:5,
    originalPrintedQuickBall:'Quick Ball FST',
    originalPrintedSearchTarget:'Dedenne GX UNB',
    beforeHand,rootError,promptEvidence,
    energyAutoDiscardedBeforeSearch,searchError,
    searchSettled:prompt?.result!==undefined,
    energyInHand:f.source.hand.cards.includes(energy),
    energyInDiscard:f.source.discard.cards.includes(energy),
    ballInHand:f.source.hand.cards.includes(ball),
    ballInDiscard:f.source.discard.cards.includes(ball),
    dedenneInHand:f.source.hand.cards.includes(dedenne),
    dedenneInDeck:f.source.deck.cards.includes(dedenne),
    pendingPrompts:f.state.prompts.filter(p=>p.result===undefined)
      .map(p=>p.constructor.name),continuation,qualifiedGame:false
  };
}

/**
 * A physically different Quick Ball hand with two OTHER discard choices,
 * which requires an explicit native payment prompt before the Basic search.
 * @param {0|1} [seat]
 * @param {'zero'|'one'} [payment]
 * @returns {object}
 */
function probeQuickBallExplicitPayment(seat=0,payment='zero'){
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const f=stagedPainfulSpoons(seat);
  const energy=f.card('Psychic Energy SVE');
  const second=f.card('Grass Energy MEE');
  const ball=f.card('Quick Ball FST');
  const dedenne=f.card('Dedenne GX UNB');
  f.source.hand.cards.push(energy,second,ball);
  f.source.deck.cards.push(dedenne);
  let rootError=null;
  try{
    f.store.dispatch(new PlayCardAction(f.source.id,2,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
  }catch(error){rootError=String(error?.message??error);}
  const pending=()=>f.state.prompts.find(p=>p.result===undefined);
  const prompt=pending();
  const chosen=payment==='one'?[energy]:[];
  const before={
    promptType:prompt?.constructor?.name??null,
    message:prompt?.message??null,
    printing:prompt?.sourceCard?.fullName??null,
    offered:prompt?.cards?.cards?.map(c=>c.fullName)??[],
    offeredPhysicalHand:prompt?.cards?.cards?.every(c=>f.source.hand.cards.includes(c))??false,
    min:prompt?.options?.min??null,
    max:prompt?.options?.max??null,
    nativeValidatorAccepted:prompt?.validate(chosen,f.state)??null,
    firstEnergyStillInHand:f.source.hand.cards.includes(energy),
    secondEnergyStillInHand:f.source.hand.cards.includes(second)
  };
  let paymentError=null;
  if(prompt){
    try{f.store.dispatch(new ResolvePromptAction(prompt.id,chosen));}
    catch(error){paymentError=String(error?.message??error);}
  }
  const paymentSettled=prompt?.result!==undefined;
  const continuation=settleContinuation(f,paymentError===null,dedenne);
  return {
    seat,payment,originalSourceRank:5,
    originalPrintedQuickBall:'Quick Ball FST',
    rootError,paymentPromptEvidence:before,paymentError,paymentSettled,
    energyInHand:f.source.hand.cards.includes(energy),
    energyInDiscard:f.source.discard.cards.includes(energy),
    secondInHand:f.source.hand.cards.includes(second),
    secondInDiscard:f.source.discard.cards.includes(second),
    ballInHand:f.source.hand.cards.includes(ball),
    ballInDiscard:f.source.discard.cards.includes(ball),
    dedenneInHand:f.source.hand.cards.includes(dedenne),
    dedenneInDeck:f.source.deck.cards.includes(dedenne),
    pendingPrompts:f.state.prompts.filter(p=>p.result===undefined)
      .map(p=>p.constructor.name),continuation,qualifiedGame:false
  };
}

/** @param {object} f Native fixture @param {boolean} allowed
 * @param {object} target Physical Basic in own deck @returns {object[]} */
function settleContinuation(f,allowed,target){
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const evidence=[];
  if(!allowed)return evidence;
  for(let i=0;i<15;i++){
    const p=f.state.prompts.find(x=>x.result===undefined);
    if(!p)break;
    const type=p.constructor.name;
    let answer;
    if(type==='ChooseCardsPrompt'){
      assert.equal(p.message,'CHOOSE_CARD_TO_HAND');
      answer=[target];
    }else if(type==='ShowCardsPrompt')answer=true;
    else if(type==='ShuffleDeckPrompt')
      answer=Array.from({length:f.source.deck.cards.length},(_,index)=>index);
    else if(type==='WaitPrompt')answer=null;
    else{evidence.push({type,error:'unexpected-pending-native-prompt'});break;}
    let error=null;
    try{f.store.dispatch(new ResolvePromptAction(p.id,answer));}
    catch(e){error=String(e?.message??e);}
    evidence.push({type,error});
    if(error)break;
  }
  return evidence;
}

/** @param {0|1} [seat] @returns {object} */
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
module.exports={probeQuickBallMandatoryPayment,
  probeQuickBallExplicitPayment,probeQuickBallNoOtherCard};
