'use strict';
/*
 * Development-only, opt-in Wondrous Patch AttachEnergyPrompt projection.
 * The pinned Twinleaf card is named "Wondrous Patch" PFL 94 but its fullName
 * was observed as "Wonder Patch MBD": require both native source identity and
 * trusted card-effect provenance. No modification of vendor or shared projector.
 * This module is NOT installed in the production V3 dispatcher.
 */
const protocol=require('./agent49-policy-protocol.cjs');
const baseProjection=require('./agent36-prompt-projection.cjs');
const PRINT='Wonder Patch MBD';
const CANONICAL='Wondrous Patch PFL 94';
const ENERGY=/^(?:Basic )?Psychic Energy\b/i;

function sourceIsExact(source,provenance) {
  const card=provenance?.sourceCard;
  if(source?.sourceKind!=='card-effect'||source?.classification!=='actor-choice')return false;
  const original=card?.name==='Wondrous Patch'&&card?.set==='PFL'&&
    String(card?.setNumber)==='94'&&card?.fullName===PRINT;
  const corrected=card?.name==='Wondrous Patch'&&card?.set==='PFL'&&
    String(card?.setNumber)==='94'&&card?.fullName===CANONICAL;
  return (original||corrected)&&source.sourcePrinting===card.fullName &&
    ['Wondrous Patch','Wonder Patch'].includes(source.effectName);
}
function slotPokemon(slot){return slot?.getPokemonCard?.()??null;}
function printing(card){return typeof card?.fullName==='string'?card.fullName:card?.name??'';}
function projectRank30Prompt(options={}) {
  const {prompt,state,actorSeat,native,store,provenanceHook}=options;
  const projection=options.testProjectionApi??baseProjection;
  const provenance=provenanceHook?.getPromptProvenance?.(prompt)??null;
  if(prompt?.constructor?.name!=='AttachEnergyPrompt'||!provenance ||
     provenance?.sourceCard?.name!=='Wondrous Patch')
    return projection.projectPrompt(options);
  const source=projection.makeSource(prompt,state,actorSeat,provenance);
  if(!sourceIsExact(source,provenance)) {
    const error=new Error('Exact Wondrous Patch source provenance not established');
    error.code='R30_PATCH_SOURCE_NOT_EXACT';throw error;
  }
  if((actorSeat!==0&&actorSeat!==1)||!state?.players?.[actorSeat]||
      state.players[actorSeat].id!==prompt.playerId ||
      prompt.getPerspectivePlayerId?.()!==state.players[actorSeat].id)
    throw Object.assign(new Error('Wondrous Patch source actor mismatch'),{code:'R30_PATCH_SEAT_MISMATCH'});
  const actor=state.players[actorSeat];
  if(prompt.result!==undefined||!state.prompts?.includes(prompt))
    throw Object.assign(new Error('Wondrous Patch prompt stale'),{code:'R30_PATCH_STALE_PROMPT'});
  const exactShape=prompt.message==='ATTACH_ENERGY_TO_BENCH' &&
    prompt.cardList===actor.discard && prompt.playerType===native.PlayerType.BOTTOM_PLAYER &&
    Array.isArray(prompt.slots)&&prompt.slots.length===1 &&
    prompt.slots[0]===native.SlotType.BENCH &&
    prompt.filter?.superType===native.SuperType.ENERGY &&
    prompt.filter?.energyType===native.EnergyType.BASIC &&
    prompt.filter?.name==='Psychic Energy'&&
    prompt.options?.min===1&&prompt.options?.max===1;
  if(!exactShape||typeof native.CheckPokemonTypeEffect!=='function'||
     typeof native.EnergyCard!=='function'||typeof store?.reduceEffect!=='function')
    throw Object.assign(new Error('Pinned Wondrous Patch prompt contract mismatch'),{code:'R30_PATCH_SHAPE_UNSUPPORTED'});
  const rows=actor.discard.cards.map((energy,index)=>({energy,index})).filter(({energy})=>
    energy instanceof native.EnergyCard && energy.energyType===native.EnergyType.BASIC &&
    energy.name==='Psychic Energy' && Array.isArray(energy.provides) &&
    energy.provides.includes(native.CardType.PSYCHIC));
  const bench=[];
  for(let i=0;i<actor.bench.length;i++) {
    const pokemon=slotPokemon(actor.bench[i]);if(!pokemon)continue;
    const effect=new native.CheckPokemonTypeEffect(actor.bench[i]);
    store.reduceEffect(state,effect);
    if(effect.cardTypes?.includes(native.CardType.PSYCHIC))bench.push({index:i,pokemon});
  }
  const choices=[],choiceByToken=new Map();
  for(const to of bench)for(const from of rows){
    const raw=[{to:{player:native.PlayerType.BOTTOM_PLAYER,slot:native.SlotType.BENCH,
      index:to.index},index:from.index}];
    const validation=projection.validateRawPromptResult(prompt,raw,state);
    if(!validation.valid)continue;
    if(choices.length>=512)
      throw Object.assign(new Error('Wondrous Patch frontier too large'),{code:'R30_PATCH_FRONTIER_TOO_LARGE'});
    const token='r30-patch-'+choices.length.toString(36);
    const choice=Object.freeze({kind:'energy',token,printing:printing(from.energy),
      label:'Attach '+printing(from.energy)+' from discard to Bench '+(to.index+1),
      publicMetadata:{sourceZone:'discard',ownerSeat:'actor',isOwnerVisible:true,
        energyType:'BASIC',zone:'bench',benchIndex:to.index,
        choiceIndex:choices.length,selectedCount:1}});
    choices.push(choice);choiceByToken.set(token,raw);
  }
  if(prompt.options?.allowCancel===true) {
    const raw=null;
    const validation=projection.validateRawPromptResult(prompt,raw,state);
    if(validation.valid) {
      const token='r30-patch-cancel';
      choices.push(Object.freeze({kind:'cancel',token,label:'Cancel'}));
      choiceByToken.set(token,raw);
    }
  }
  if(!choices.length)throw Object.assign(new Error('Wondrous Patch has no native-valid public choices'),
    {code:'R30_PATCH_NO_LEGAL_CHOICE'});
  const promptProjection=Object.freeze({
    schema:protocol.PROMPT_SCHEMA,actingSeat:actorSeat,promptType:'AttachEnergyPrompt',
    description:typeof prompt.message==='string'?prompt.message:null,source,
    choices:Object.freeze(choices),
    publicMetadata:Object.freeze({selectionType:'energy-attachment',
      count:choices.length,minimumCount:1,maximumCount:1,
      allowCancel:prompt.options?.allowCancel===true,
      sourceZone:'discard',ownerSeat:'actor',isOwnerVisible:true,
      energyType:'BASIC',zone:'bench'})
  });
  protocol.validatePrompt(promptProjection,actorSeat);
  return {hostOnly:false,promptProjection,choiceByToken,
    diagnostics:Object.freeze({promptType:'AttachEnergyPrompt',sourceKind:source.sourceKind,
      sourcePrinting:source.sourcePrinting,choiceCount:choices.length,
      selectionType:'energy-attachment',sourceZone:'discard'})};
}
module.exports={PRINT,CANONICAL,sourceIsExact,projectRank30Prompt};
