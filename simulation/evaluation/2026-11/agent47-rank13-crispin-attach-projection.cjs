'use strict';

/*
 * Opt-in, source-exact Crispin SCR133 AttachEnergyPrompt projection.
 * Research adapter only; vendor Twinleaf and the current V3 projector are not
 * modified. Modelled after the existing rank30 Wondrous Patch extension.
 *
 * The pinned Crispin reducer (a9905a7) searches two Basic Energy of different
 * types, moves both to a temporary CardList, and opens an AttachEnergyPrompt
 * selecting one of those two cards for a pokemon in play. The ordinary V3
 * projector accepts AttachEnergyPrompt only from Underworld Door, so without
 * a scoped extension a recovered Crispin cannot complete its printed effect.
 * No game/CI admission is implied by this branch-only module.
 */
const protocol=require('./agent49-policy-protocol.cjs');
const defaultProjection=require('./agent36-prompt-projection.cjs');
const SOURCE='Crispin SCR';
const ENERGY=new Set(['Grass Energy','Fire Energy']);
function err(code,message) {
  return Object.assign(new Error(message),{code});
}
function print(card) {return typeof card?.fullName==='string'?card.fullName:null;}
function getPokemon(slot) {return slot?.getPokemonCard?.()??null;}
function isNativeCrispin(source,provenance) {
  const card=provenance?.sourceCard;
  return source?.classification==='actor-choice' &&
    source.sourceKind==='card-effect' &&
    source.sourcePrinting===SOURCE && source.effectName==='Crispin' &&
    card?.name==='Crispin' && card?.set==='SCR' &&
    String(card?.setNumber)==='133' && card?.fullName===SOURCE;
}
function projectRank13CrispinPrompt(options={}) {
  const {prompt,state,actorSeat,native,provenanceHook}=options;
  const projection=options.testProjectionApi??defaultProjection;
  if(prompt?.constructor?.name!=='AttachEnergyPrompt')
    return projection.projectPrompt(options);
  const provenance=provenanceHook?.getPromptProvenance?.(prompt)??null;
  // Unrelated energy sources retain the existing projector's fail-closed
  // behavior, including its exact Underworld Door contract.
  if(provenance?.sourceCard?.name!=='Crispin')
    return projection.projectPrompt(options);

  const actor=state?.players?.[actorSeat];
  if((actorSeat!==0&&actorSeat!==1) || !actor ||
     prompt.playerId!==actor.id ||
     prompt.getPerspectivePlayerId?.()!==actor.id)
    throw err('R13_CRISPIN_SEAT_MISMATCH','Crispin prompt owner is not the actor');
  if(prompt.result!==undefined || !state.prompts?.includes(prompt))
    throw err('R13_CRISPIN_STALE_PROMPT','Crispin prompt is stale');
  const source=projection.makeSource(prompt,state,actorSeat,provenance);
  if(!isNativeCrispin(source,provenance))
    throw err('R13_CRISPIN_SOURCE_NOT_EXACT','Crispin typed origin mismatch');

  const shape=prompt.message==='ATTACH_ENERGY_CARDS' &&
    prompt.playerType===native.PlayerType.BOTTOM_PLAYER &&
    Array.isArray(prompt.slots) && prompt.slots.length===2 &&
    prompt.slots.includes(native.SlotType.BENCH) &&
    prompt.slots.includes(native.SlotType.ACTIVE) &&
    prompt.filter?.superType===native.SuperType.ENERGY &&
    prompt.filter?.energyType===native.EnergyType.BASIC &&
    prompt.options?.allowCancel===false &&
    prompt.options?.min===1 && prompt.options?.max===1 &&
    Array.isArray(prompt.cardList?.cards) &&
    prompt.cardList.cards.length===2 &&
    typeof native.EnergyCard==='function';
  if(!shape)throw err('R13_CRISPIN_SHAPE_UNSUPPORTED',
    'Pinned Crispin temporary Energy attachment shape mismatch');

  const entries=prompt.cardList.cards.map((card,index)=>({card,index}));
  if(!entries.every(({card})=>
    card instanceof native.EnergyCard &&
    card.energyType===native.EnergyType.BASIC &&
    ENERGY.has(card.name) &&
    typeof print(card)==='string') ||
    new Set(entries.map(({card})=>card.name)).size!==2)
    throw err('R13_CRISPIN_ENERGY_PAIR_UNSUPPORTED',
      'Crispin selected Energy pair does not match exact rank13 Grass/Fire path');

  const slots=[
    {slot:native.SlotType.ACTIVE,index:0,zone:'active',pokemon:getPokemon(actor.active)}
  ];
  for(let index=0;index<(actor.bench?.length??0);index++){
    slots.push({slot:native.SlotType.BENCH,index,zone:'bench',
      pokemon:getPokemon(actor.bench[index])});
  }

  const choices=[],choiceByToken=new Map();
  for(const to of slots){
    if(!to.pokemon)continue;
    for(const from of entries){
      const raw=[{to:{player:native.PlayerType.BOTTOM_PLAYER,
        slot:to.slot,index:to.index},index:from.index}];
      const acceptance=projection.validateRawPromptResult(prompt,raw,state);
      if(!acceptance.valid)continue;
      if(choices.length>=32)
        throw err('R13_CRISPIN_FRONTIER_TOO_LARGE','Crispin assignment cap exceeded');
      const token='r13-crispin-'+choices.length.toString(36);
      choices.push(Object.freeze({
        kind:'energy',token,printing:print(from.card),
        label:'Attach '+print(from.card)+' to '+to.zone+' '+(to.index+1),
        publicMetadata:{
          sourceZone:'effect-revealed',ownerSeat:'actor',
          isOwnerVisible:true,energyType:'BASIC',zone:to.zone,
          ...(to.zone==='bench'?{benchIndex:to.index}:{}),
          choiceIndex:choices.length,selectedCount:1
        }
      }));
      choiceByToken.set(token,raw);
    }
  }
  if(choices.length===0)
    throw err('R13_CRISPIN_NO_LEGAL_CHOICE','No validated Crispin Energy assignment');
  const promptProjection=Object.freeze({
    schema:protocol.PROMPT_SCHEMA,actingSeat:actorSeat,
    promptType:'AttachEnergyPrompt',
    description:typeof prompt.message==='string'?prompt.message:null,
    source,choices:Object.freeze(choices),
    publicMetadata:Object.freeze({
      selectionType:'energy-attachment',count:choices.length,
      minimumCount:1,maximumCount:1,
      allowCancel:false,sourceZone:'effect-revealed',
      ownerSeat:'actor',isOwnerVisible:true,
      energyType:'BASIC',zone:'mixed'
    })
  });
  protocol.validatePrompt(promptProjection,actorSeat);
  return {hostOnly:false,promptProjection,choiceByToken,
    diagnostics:Object.freeze({
      promptType:'AttachEnergyPrompt',sourcePrinting:SOURCE,
      choiceCount:choices.length,selectionType:'energy-attachment',
      sourceZone:'effect-revealed'
    })};
}
module.exports={SOURCE,isNativeCrispin,projectRank13CrispinPrompt};
