'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {stagedPainfulSpoons}=require('./agent4-rank31-alakazam-movesource-native.cjs');
const {assertValidPromptAction}=require('./prompt-integrity.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath @returns {any} */
const native=modulePath=>require(path.join(output,modulePath));

/**
 * Prepared, actual pinned Store owner turn using printed items from original
 * Aichi rank14: Ultra Ball MEG131, Grass Energy MEE9, Fire Energy MEE10 and
 * Regidrago V SIT135. Other filler cards/board state are not rank14's 60.
 *
 * Resolve a deliberately paper-illegal zero-card Ultra Ball discard payment
 * against the real native prompt/Store and observe whether native deck search
 * and a physical Pokémon addition are reached. No full-match inference.
 * @param {0|1} [seat=0]
 * @param {'zero'|'two'} [payment='zero']
 * @returns {object}
 */
function probeUltraBallZeroPayment(seat=0,payment='zero'){
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const f=stagedPainfulSpoons(seat);
  const grass=f.card('Grass Energy MEE');
  const fire=f.card('Fire Energy MEE');
  const ball=f.card('Ultra Ball MEG');
  const regidrago=f.card('Regidrago V SIT');
  f.source.hand.cards.push(grass,fire,ball);
  f.source.deck.cards.push(regidrago);
  const evidence=[];
  const pending=()=>f.state.prompts.find(p=>p.result===undefined);
  let rootError=null;
  try{
    f.store.dispatch(new PlayCardAction(f.source.id,2,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
  }catch(e){rootError=String(e?.message??e);}
  const paymentPrompt=f.state.prompts.find(p=>p.result===undefined&&
    p.constructor.name==='ChooseCardsPrompt');
  const originalValidatorAccepted=paymentPrompt?.validate([],f.state)??null;
  const originalMin=paymentPrompt?.options.min??null;
  const originalMax=paymentPrompt?.options.max??null;
  const paymentPromptSource=paymentPrompt?.sourceCard?.fullName??null;
  const chosenPayment=payment==='two'?[grass,fire]:[];
  let strictError=null;
  let zeroPaymentError=null;
  if(paymentPrompt){
    const answer=new ResolvePromptAction(paymentPrompt.id,chosenPayment);
    try{assertValidPromptAction(f.state,answer);}
    catch(e){strictError=String(e?.message??e);}
    try{f.store.dispatch(answer);}
    catch(e){zeroPaymentError=String(e?.message??e);}
  }
  for(let i=0;i<12;i++){
    const p=pending();
    if(!p)break;
    const type=p.constructor.name;
    let answer;
    if(type==='ChooseCardsPrompt')answer=[regidrago];
    else if(type==='ShowCardsPrompt')answer=true;
    else if(type==='ShuffleDeckPrompt')
      answer=Array.from({length:f.source.deck.cards.length},(_,index)=>index);
    else if(type==='WaitPrompt')answer=null;
    else{
      evidence.push({type,error:'Unexpected pending native continuation'});
      break;
    }
    const validatorAccepted=p.validate(answer,f.state);
    let error=null;
    try{f.store.dispatch(new ResolvePromptAction(p.id,answer));}
    catch(e){error=String(e?.message??e);}
    evidence.push({type,validatorAccepted,error,
      chosen:type==='ChooseCardsPrompt'?[regidrago.fullName]:undefined});
    if(error)break;
  }
  return {seat,payment,sourceRank:14,originalPrintedCard:'Ultra Ball MEG 131',
    originalPrintedTarget:'Regidrago V SIT 135',
    physicalOwnerOpeningHand:['Grass Energy MEE','Fire Energy MEE','Ultra Ball MEG'],
    rootError,originalValidatorAccepted,originalMin,originalMax,
    paymentPromptSource,strictError,zeroPaymentError,
    zeroPaymentPromptSettled:paymentPrompt?.result!==undefined,
    grassStillInHand:f.source.hand.cards.includes(grass),
    fireStillInHand:f.source.hand.cards.includes(fire),
    grassDiscarded:f.source.discard.cards.includes(grass),
    fireDiscarded:f.source.discard.cards.includes(fire),
    regidragoAddedToHand:f.source.hand.cards.includes(regidrago),
    regidragoStillInDeck:f.source.deck.cards.includes(regidrago),
    ownerHandAfter:f.source.hand.cards.map(x=>x.fullName),
    ballInDiscard:f.source.discard.cards.includes(ball),
    promptsPending:f.state.prompts.filter(p=>p.result===undefined)
      .map(p=>p.constructor.name),
    continuation:evidence,
    scope:'Actual original rank14 individual printing family in prepared native Store; zero-payment is paper-illegal and no full game was run'};
}
if(require.main===module)
  console.log(JSON.stringify([probeUltraBallZeroPayment(0),
    probeUltraBallZeroPayment(1)],null,2));
module.exports={probeUltraBallZeroPayment};
