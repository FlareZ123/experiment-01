'use strict';

/*
 * Development-only opt-in source-bound Raihan EVS152 AttachEnergyPrompt
 * projection. No vendor mutation and NO production Agent36/V3 installation.
 * The pinned rank1 native physical continuation shows Raihan's transfer
 * result shape is [{to:{player,slot,index},card:<physical discard Energy>}],
 * not Underworld Door's card-index transfer. Refuse every other source.
 */

const protocol=require('./agent49-policy-protocol.cjs');
const baseProjection=require('./agent36-prompt-projection.cjs');

const RAIHAN_NAME='Raihan',RAIHAN_SET='EVS',RAIHAN_NUMBER='152';
const KNOWN_NAMES=new Set(['Raihan EVS','Raihan EVS 152']);
function fail(code,message){
  throw Object.assign(new Error(message),{code});
}
function printing(card){return card?.fullName??card?.name??'';}
function sourceIsExact(source,provenance){
  const card=provenance?.sourceCard;
  return source?.classification==='actor-choice'&&
    source?.sourceKind==='card-effect'&&source?.effectName==='Raihan'&&
    card?.name===RAIHAN_NAME&&card?.set===RAIHAN_SET&&
    String(card?.setNumber)===RAIHAN_NUMBER&&
    KNOWN_NAMES.has(card?.fullName)&&
    source.sourcePrinting===card.fullName;
}
function projectRaihanOwnerAttachPrompt(options={}){
  const {prompt,state,actorSeat,native,provenanceHook}=options;
  const projector=options.testProjectionApi??baseProjection;
  const provenance=provenanceHook?.getPromptProvenance?.(prompt)??null;
  if(prompt?.constructor?.name!=='AttachEnergyPrompt' ||
      provenance?.sourceCard?.name!=='Raihan')
    return projector.projectPrompt(options);
  const source=projector.makeSource(prompt,state,actorSeat,provenance);
  if(!sourceIsExact(source,provenance))
    fail('AGENT3_RAIHAN_SOURCE_NOT_EXACT','Untrusted Raihan source printing or effect');
  if((actorSeat!==0&&actorSeat!==1)||
      !Array.isArray(state?.players)||!state.players[actorSeat]||
      state.players[actorSeat].id!==prompt.playerId ||
      prompt.getPerspectivePlayerId?.()!==state.players[actorSeat].id)
    fail('AGENT3_RAIHAN_SEAT_MISMATCH','Raihan AttachEnergyPrompt actor seat mismatch');
  if(prompt.result!==undefined||!state.prompts?.includes(prompt))
    fail('AGENT3_RAIHAN_STALE_PROMPT','Raihan native owner prompt is stale');
  const actor=state.players[actorSeat];
  // Do not weaken the Underworld Door projector with a generic broad source.
  // Every Raihan source slot must reference the actor's real discard CardList.
  if(prompt.cardList!==actor.discard ||
      prompt.playerType!==native?.PlayerType?.BOTTOM_PLAYER ||
      !Array.isArray(prompt.slots)||
      !prompt.slots.every(slot=>slot===native.SlotType.ACTIVE||
        slot===native.SlotType.BENCH||
        (native.SlotType.BOARD!==undefined&&slot===native.SlotType.BOARD)) ||
      !prompt.slots.length ||
      prompt.options?.min!==1||prompt.options?.max!==1 ||
      !Array.isArray(actor.discard.cards) ||
      typeof native?.EnergyCard!=='function' ||
      !native?.EnergyType||!native?.SlotType)
    fail('AGENT3_RAIHAN_PROMPT_SHAPE_UNSUPPORTED',
      'Raihan pinned native owner discard-attachment contract mismatch');

  const eligible=typeof actor.discard.filter==='function'
    ?actor.discard.filter(prompt.filter):actor.discard.cards;
  if(!Array.isArray(eligible))fail('AGENT3_RAIHAN_ENERGY_FILTER_UNSUPPORTED',
    'Native discard CardList did not return a card array');
  const accepted=new Set(eligible);
  const energies=actor.discard.cards.filter(card=>
    accepted.has(card)&&card instanceof native.EnergyCard&&
    card.energyType===native.EnergyType.BASIC);
  const slots=[];
  if((prompt.slots.includes(native.SlotType.ACTIVE)||
      prompt.slots.includes(native.SlotType.BOARD))&&
      actor.active?.getPokemonCard?.())
    slots.push({zone:'active',index:0,slot:native.SlotType.ACTIVE,
      pokemon:actor.active.getPokemonCard()});
  if(prompt.slots.includes(native.SlotType.BENCH)||
      prompt.slots.includes(native.SlotType.BOARD)) {
    for(let index=0;index<(actor.bench??[]).length;index++){
      const pokemon=actor.bench[index]?.getPokemonCard?.();
      if(pokemon)slots.push({zone:'bench',index,slot:native.SlotType.BENCH,pokemon});
    }
  }
  const choices=[],choiceByToken=new Map();
  for(const target of slots)for(const energy of energies){
    // Confirm the exact pinned Raihan transfer with native prompt validation.
    const raw=[{to:{
      player:native.PlayerType.BOTTOM_PLAYER,slot:target.slot,index:target.index
    },card:energy}];
    if(!projector.validateRawPromptResult(prompt,raw,state).valid)continue;
    if(choices.length>=512)fail('AGENT3_RAIHAN_FRONTIER_TOO_LARGE','Raihan choice cap');
    const token='agent3-raihan-'+choices.length.toString(36);
    choices.push(Object.freeze({
      token,kind:'energy',printing:printing(energy),
      label:'Attach '+printing(energy)+' from discard to '+
        (target.zone==='active'?'Active':'Bench '+(target.index+1)),
      publicMetadata:Object.freeze({
        sourceZone:'discard',ownerSeat:'actor',isOwnerVisible:true,
        energyType:'BASIC',zone:target.zone,
        ...(target.zone==='bench'?{benchIndex:target.index}:{}),
        choiceIndex:choices.length,selectedCount:1
      })
    }));
    choiceByToken.set(token,raw);
  }
  if(prompt.options?.allowCancel===true&&
      projector.validateRawPromptResult(prompt,null,state).valid){
    const token='agent3-raihan-cancel';
    choices.push(Object.freeze({token,kind:'cancel',label:'Cancel'}));
    choiceByToken.set(token,null);
  }
  if(!choices.length)fail('AGENT3_RAIHAN_NO_NATIVE_CHOICES',
    'No native-valid actor-only Raihan discard-to-own-Pokemon assignments');
  const publicMetadata=Object.freeze({
    selectionType:'energy-attachment',count:choices.length,
    minimumCount:1,maximumCount:1,allowCancel:prompt.options.allowCancel===true,
    sourceZone:'discard',ownerSeat:'actor',isOwnerVisible:true,
    energyType:'BASIC',zone:'active,bench'
  });
  const promptProjection=Object.freeze({
    schema:protocol.PROMPT_SCHEMA,actingSeat:actorSeat,
    promptType:'AttachEnergyPrompt',
    description:typeof prompt.message==='string'?prompt.message:null,
    source,choices:Object.freeze(choices),publicMetadata
  });
  protocol.validatePrompt(promptProjection,actorSeat);
  return {
    hostOnly:false,promptProjection,choiceByToken,
    diagnostics:Object.freeze({
      promptType:'AttachEnergyPrompt',sourceKind:'card-effect',
      sourcePrinting:source.sourcePrinting,choiceCount:choices.length,
      selectionType:'energy-attachment',sourceZone:'discard'
    })
  };
}
module.exports={sourceIsExact,projectRaihanOwnerAttachPrompt};
