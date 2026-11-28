'use strict';

/*
 * Opt-in host-only bridge for rank27's Regidrago V SIT135 Celestial Roar.
 * This native attack opens one AttachEnergyPrompt for all Basic Energy
 * discarded from the top three. Twinleaf's shared V3 projector currently
 * recognizes only Underworld Door's AttachEnergyPrompt.
 *
 * Pinned source:
 * twinleafgg/twinleafgg@a9905a76
 * ptcg-server/src/sets/09-sword-and-shield/set-silver-tempest/regidrago-v.ts
 *
 * This is research-side, default-off, and cannot repair Twinleaf's other
 * Celestial Roar Special Energy discrepancy without the separate paper hook.
 * Do not expose the transient CardList or raw indices to a worker.
 */
const protocol=require('./agent49-policy-protocol.cjs');
const defaultProjection=require('./agent36-prompt-projection.cjs');
const SOURCE='Regidrago V SIT';
const ATTACK='Celestial Roar';
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
function err(code,message){return Object.assign(new Error(message),{code});}
function exactSource(provenance,source){
  const card=provenance?.sourceCard;
  return source?.classification==='actor-choice' &&
    source?.sourceKind==='card-effect' &&
    source?.sourcePrinting===SOURCE &&
    source?.effectName===ATTACK &&
    card?.name==='Regidrago V' && card?.set==='SIT' &&
    String(card?.setNumber)==='135' && card?.fullName===SOURCE;
}
function projectCelestialRoarPrompt(options={}){
  const projection=options.testProjectionApi??defaultProjection;
  const {prompt,state,actorSeat,native,provenanceHook}=options;
  if(prompt?.constructor?.name!=='AttachEnergyPrompt')
    return projection.projectPrompt(options);
  const provenance=provenanceHook?.getPromptProvenance?.(prompt)??null;
  if(provenance?.sourceCard?.name!=='Regidrago V')
    return projection.projectPrompt(options);

  if((actorSeat!==0&&actorSeat!==1)||!Array.isArray(state?.players)||
     state.players.length!==2||![3,4].includes(state.phase))
    throw err('R27_CELESTIAL_ACTOR_PHASE','Celestial Roar actor/phase mismatch');
  const actor=state.players[actorSeat];
  if(!actor||prompt.result!==undefined ||
     prompt.playerId!==actor.id ||
     prompt.getPerspectivePlayerId?.()!==actor.id ||
     !Array.isArray(state.prompts)||!state.prompts.includes(prompt))
    throw err('R27_CELESTIAL_PROMPT_OWNER','Pending prompt is not actor-owned');
  const source=projection.makeSource(prompt,state,actorSeat,provenance);
  if(!exactSource(provenance,source)||
    actor.active?.getPokemonCard?.()!==provenance.sourceCard)
    throw err('R27_CELESTIAL_SOURCE_NOT_EXACT','Celestial Roar source is not the active original SIT135');

  const exactShape=prompt.message==='ATTACH_ENERGY_CARDS' &&
    prompt.playerType===native?.PlayerType?.BOTTOM_PLAYER &&
    Array.isArray(prompt.slots)&&prompt.slots.length===1&&
    prompt.slots[0]===native?.SlotType?.ACTIVE &&
    prompt.filter?.superType===native?.SuperType?.ENERGY &&
    prompt.filter?.energyType===native?.EnergyType?.BASIC &&
    prompt.options?.allowCancel===false &&
    prompt.options?.differentTypes===false &&
    prompt.options?.differentTargets===false &&
    prompt.options?.sameTarget===false &&
    Array.isArray(prompt.options?.blocked) && prompt.options.blocked.length===0 &&
    Array.isArray(prompt.cardList?.cards) &&
    prompt.cardList.cards.length>=1 && prompt.cardList.cards.length<=3 &&
    typeof native?.EnergyCard==='function';
  if(!exactShape)throw err('R27_CELESTIAL_PROMPT_SHAPE',
    'Pinned Celestial Roar AttachEnergyPrompt shape mismatched');
  const selected=prompt.cardList.cards.map((card,index)=>({card,index}))
    .filter(({card})=>card instanceof native.EnergyCard &&
      card.energyType===native.EnergyType.BASIC &&
      card.superType===native.SuperType.ENERGY);
  const k=selected.length;
  if(k<1||prompt.options.min!==k||prompt.options.max!==k)
    throw err('R27_CELESTIAL_ENERGY_COUNT',
      'Celestial Roar must attach all observed revealed Basic Energy');
  const raw=selected.map(({index})=>({
    to:{player:native.PlayerType.BOTTOM_PLAYER,slot:native.SlotType.ACTIVE,index:0},
    index
  }));
  const validated=projection.validateRawPromptResult(prompt,raw,state,{enginePin:PIN});
  if(validated?.valid!==true)throw err('R27_CELESTIAL_NATIVE_VALIDATION',
    'Mandatory Celestial Roar transfer failed isolated native validation');
  const token='r27-celestial-all-'+k;
  const choice=Object.freeze({
    kind:'energy',token,
    label:'Attach all '+k+' revealed Basic Energy to your active Regidrago V',
    publicMetadata:Object.freeze({
      sourceZone:'effect-revealed',ownerSeat:'actor',isOwnerVisible:true,
      energyType:'BASIC',zone:'active',choiceIndex:0,selectedCount:k
    })
  });
  const promptProjection=Object.freeze({
    schema:protocol.PROMPT_SCHEMA,actingSeat:actorSeat,
    promptType:'AttachEnergyPrompt',
    description:prompt.message,source,choices:Object.freeze([choice]),
    publicMetadata:Object.freeze({
      selectionType:'energy-attachment',count:1,
      minimumCount:k,maximumCount:k,allowCancel:false,
      sourceZone:'effect-revealed',ownerSeat:'actor',isOwnerVisible:true,
      energyType:'BASIC',zone:'active'
    })
  });
  protocol.validatePrompt(promptProjection,actorSeat);
  return {
    hostOnly:false,promptProjection,choiceByToken:new Map([[token,raw]]),
    diagnostics:Object.freeze({
      promptType:'AttachEnergyPrompt',sourcePrinting:SOURCE,
      nativeRequiredEnergyCount:k,choiceCount:1,
      policy:'agent2-rank27-celestial-source-v1'
    })
  };
}
module.exports={SOURCE,ATTACK,PIN,exactSource,projectCelestialRoarPrompt};
