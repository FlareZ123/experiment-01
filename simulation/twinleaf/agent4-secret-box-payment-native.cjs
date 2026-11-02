'use strict';
const path=require('node:path');
const {stagedPainfulSpoons}=
  require('./agent4-rank31-alakazam-movesource-native.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {any} */
const native=name=>require(path.join(output,name));

/**
 * Real pinned Store source-print Secret Box from an actual owner hand of four
 * distinct physical payment choices. All board fillers are prepared and
 * this fixture never claims a natural 60-card game.
 * @param {0|1} [seat]
 * @param {'zero'|'three'} [payment]
 * @param {'none'|'four'} [searchMode] Optional real own-deck search selection
 * @returns {object}
 */
function probeSecretBoxPayment(seat=0,payment='zero',searchMode='none'){
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const f=stagedPainfulSpoons(seat);
  const [energyA,energyB,energyC,pass]=[
    f.card('Psychic Energy SVE'),
    f.card('Grass Energy MEE'),
    f.card('Fire Energy MEE'),
    f.card('Battle VIP Pass FST')
  ];
  const box=f.card('Secret Box TWM');
  const targets=[
    f.card('Field Blower GRI'),f.card('Powerglass SFA'),
    f.card('Crispin SCR'),f.card('Sky Field ROS')
  ];
  f.source.hand.cards.push(energyA,energyB,energyC,pass,box);
  f.source.deck.cards.push(...targets);
  const pending=()=>f.state.prompts.find(p=>p.result===undefined);
  let rootError=null;
  try{
    f.store.dispatch(new PlayCardAction(f.source.id,4,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
  }catch(error){rootError=String(error?.message??error);}
  const prompt=pending();
  const selected=payment==='three'?[energyA,energyB,energyC]:[];
  const paymentPromptEvidence={
    type:prompt?.constructor?.name??null,
    message:prompt?.message??null,
    sourcePrinting:prompt?.sourceCard?.fullName??null,
    min:prompt?.options?.min??null,max:prompt?.options?.max??null,
    ownerId:prompt?.playerId??null,
    offered:prompt?.cards?.cards?.map(c=>c.fullName)??[],
    ownerHandSubset:prompt?.cards?.cards?.every(c=>f.source.hand.cards.includes(c))??false,
    nativeValidatorAccepted:prompt?.validate(selected,f.state)??null
  };
  let paymentError=null;
  if(prompt){
    try{f.store.dispatch(new ResolvePromptAction(prompt.id,selected));}
    catch(error){paymentError=String(error?.message??error);}
  }
  const paymentSettled=prompt?.result!==undefined;
  const continuation=[];
  if(paymentError===null)for(let i=0;i<15;i++){
    const p=pending();
    if(!p)break;
    const type=p.constructor.name;
    let reply;
    if(type==='ChooseCardsPrompt'){
      // Search from a private own deck may legally fail each category.
      reply=searchMode==='four'?targets:(p.validate([],f.state)?[]:
        [p.cards.cards.find(card=>p.validate([card],f.state))].filter(Boolean));
    }else if(type==='ShowCardsPrompt')reply=true;
    else if(type==='ShuffleDeckPrompt')
      reply=Array.from({length:f.source.deck.cards.length},(_,index)=>index);
    else if(type==='WaitPrompt')reply=null;
    else{continuation.push({type,error:'UNHANDLED_NATIVE_PROMPT'});break;}
    let error=null;
    try{f.store.dispatch(new ResolvePromptAction(p.id,reply));}
    catch(e){error=String(e?.message??e);}
    continuation.push({type,message:p.message??null,
      selected:reply?.map?.(c=>c?.fullName??null)??null,
      nativeValidatorAccepted:typeof p.validate==='function'&&Array.isArray(reply)?
        p.validate(reply,f.state):null,error});
    if(error)break;
  }
  return {seat,payment,searchMode,originalPrinting:'Secret Box TWM',
    rootError,paymentPromptEvidence,paymentError,paymentSettled,
    energyADiscarded:f.source.discard.cards.includes(energyA),
    energyBDiscarded:f.source.discard.cards.includes(energyB),
    energyCDiscarded:f.source.discard.cards.includes(energyC),
    passInHand:f.source.hand.cards.includes(pass),
    boxInHand:f.source.hand.cards.includes(box),
    boxInDiscard:f.source.discard.cards.includes(box),
    pendingPrompts:f.state.prompts.filter(p=>p.result===undefined)
      .map(p=>p.constructor.name),
    targetLocations:targets.map(card=>({
      printing:card.fullName,inHand:f.source.hand.cards.includes(card),
      inDeck:f.source.deck.cards.includes(card)})),
    continuation,qualifiedGame:false};
}

/** @param {0|1} [seat] @returns {object} */
function probeSecretBoxInsufficientRoot(seat=0){
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const f=stagedPainfulSpoons(seat);
  const others=[f.card('Grass Energy MEE'),f.card('Fire Energy MEE')];
  const box=f.card('Secret Box TWM');
  f.source.hand.cards.push(...others,box);
  f.source.deck.cards.push(f.card('Field Blower GRI'));
  let rootError=null;
  try{
    f.store.dispatch(new PlayCardAction(f.source.id,2,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
  }catch(error){rootError=String(error?.message??error);}
  return {seat,rootError,hand:f.source.hand.cards.map(c=>c.fullName),
    boxRetained:f.source.hand.cards.includes(box),
    boxDiscarded:f.source.discard.cards.includes(box),
    pendingPrompts:f.state.prompts.filter(p=>p.result===undefined)
      .map(p=>p.constructor.name),qualifiedGame:false};
}
module.exports={probeSecretBoxPayment,probeSecretBoxInsufficientRoot};
