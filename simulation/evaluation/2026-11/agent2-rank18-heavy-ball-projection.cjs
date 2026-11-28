'use strict';
/*
 * Pinned Twinleaf a9905a76 source-specific Hisuian Heavy Ball ASR146:
 * safely project its temporary OWNER-visible Prize search into actor-only
 * ChooseCardsPrompt, without changing the generic hidden-Prize rule.
 *
 * Pinned upstream temporarily sets every face-down Prize list's isSecret
 * false, aggregates *physical card references* in Prize order into a new
 * CardList, then prompts ChooseCardsPrompt min0/max1 Basic Pokémon.
 * Generic agent36 locateCard checks faceUpPrize instead of isSecret and
 * therefore refuses those newly revealed cards. This opt-in extension
 * permits them only while the authentic source-backed prompt is pending.
 */
const protocol=require('./agent49-policy-protocol.cjs');
const defaultProjection=require('./agent36-prompt-projection.cjs');
const {SOURCE_PRINTINGS}=require('./agent2-rank18-regidrago-opponent-policy.cjs');
const SOURCE='Hisuian Heavy Ball ASR',EFFECT='Hisuian Heavy Ball';
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const VERSION='agent2-rank18-heavy-ball-prize-reveal-v1';
const sourceShort=new Map(SOURCE_PRINTINGS.map(([p])=>[
 p.replace(/ [0-9][A-Za-z0-9/-]*$/,''),p]));
const sourceFull=new Set(SOURCE_PRINTINGS.map(([p])=>p));
function fail(code,msg){throw Object.assign(new Error(msg),{code});}
const arr=x=>Array.isArray(x)?x:[];
const short=x=>typeof x==='string'?x:
 (x?.fullName??x?.printing??x?.name??'');
function sourcePrinting(x){
 const s=short(x);return sourceFull.has(s)?s:(sourceShort.get(s)??null);
}
function exactSource(source,provenance,actor){
 const card=provenance?.sourceCard;
 return source?.classification==='actor-choice'&&
  source.sourceKind==='card-effect'&&
  source.sourcePrinting===SOURCE&&
  source.effectName===EFFECT&&
  provenance?.effectName===EFFECT&&
  card?.name===EFFECT&&card?.fullName===SOURCE&&
  card?.set==='ASR'&&String(card.setNumber)==='146'&&
  arr(actor?.supporter?.cards).includes(card);
}
function projectHeavyBallPrompt(options={}){
 const projection=options.testProjectionApi??defaultProjection;
 const {prompt,state,actorSeat,native,provenanceHook}=options;
 if(prompt?.constructor?.name!=='ChooseCardsPrompt')
   return projection.projectPrompt(options);
 const provenance=provenanceHook?.getPromptProvenance?.(prompt)??null;
 if(provenance?.sourceCard?.name!==EFFECT)
   return projection.projectPrompt(options);
 if((actorSeat!==0&&actorSeat!==1)||
   !Array.isArray(state?.players)||state.players.length!==2||
   ![3,4].includes(state.phase))
   fail('R18_HEAVY_BALL_ACTOR_PHASE','Invalid Heavy Ball phase or seat');
 const actor=state.players[actorSeat];
 if(!actor||prompt.result!==undefined||
   !arr(state.prompts).includes(prompt)||prompt.playerId!==actor.id||
   prompt.getPerspectivePlayerId?.()!==actor.id||
   prompt.player!==actor)
   fail('R18_HEAVY_BALL_OWNER','Heavy Ball prompt is not actor owned');
 const source=projection.makeSource(prompt,state,actorSeat,provenance);
 if(!exactSource(source,provenance,actor))
   fail('R18_HEAVY_BALL_SOURCE','Not exact original ASR146 effect');
 const expected=prompt.message==='CHOOSE_CARD_TO_HAND'&&
   prompt.cards!==actor.hand&&prompt.cards!==actor.deck&&
   prompt.cards!==actor.discard&&
   prompt.filter?.superType===native?.SuperType?.POKEMON&&
   prompt.filter?.stage===native?.Stage?.BASIC&&
   Object.keys(prompt.filter).length===2&&
   prompt.options?.min===0&&prompt.options?.max===1&&
   prompt.options?.allowCancel===false&&
   arr(prompt.options?.blocked).length===0&&
   prompt.options?.isSecret===false&&
   native?.SuperType&&native?.Stage&&
   Array.isArray(prompt.cards?.cards)&&Array.isArray(actor.prizes);
 if(!expected)
   fail('R18_HEAVY_BALL_SHAPE','Pinned ASR146 prompt shape changed');
 const list=actor.prizes.flatMap(prize=>arr(prize?.cards));
 if(list.length!==prompt.cards.cards.length||
    list.some((card,i)=>card!==prompt.cards.cards[i])||
    actor.prizes.some(prize=>arr(prize.cards).length>0&&prize.isSecret!==false))
   fail('R18_HEAVY_BALL_PRIZE_REVEAL','Owner Prizes not temporarily revealed by source');
 const choices=[],choiceByToken=new Map();
 for(let i=0;i<list.length;i++){
  const card=list[i];
  if(card?.superType!==native.SuperType.POKEMON||
     card?.stage!==native.Stage.BASIC)continue;
  const printed=sourcePrinting(card);
  if(!printed)
   fail('R18_HEAVY_BALL_FOREIGN_PRINTING','Prized Basic absent original rank18 60');
  const raw=[i];
  const checked=projection.validateRawPromptResult(prompt,raw,state,{enginePin:PIN});
  if(checked?.valid!==true)
   fail('R18_HEAVY_BALL_NATIVE_VALIDATION','Native rejected owner Basic Prize');
  const token='r18-hball-p'+i;
  choices.push(Object.freeze({
   kind:'card',token,printing:printed,
   label:'Your revealed Prize: '+printed,
   publicMetadata:Object.freeze({
     sourceZone:'prizes',ownerSeat:'actor',isOwnerVisible:true,
     selectionIndex:i,selectedCount:1
   })
  }));
  choiceByToken.set(token,i);
 }
 const emptyValid=projection.validateRawPromptResult(prompt,[],state,{enginePin:PIN});
 if(emptyValid?.valid!==true)
   fail('R18_HEAVY_BALL_EMPTY_VALIDATION','Native rejected optional no-Pokémon selection');
 const empty='r18-hball-none';
 choices.push(Object.freeze({
   kind:'empty-selection',token:empty,label:'Take no Basic Pokémon from revealed Prizes'
 }));
 choiceByToken.set(empty,[]);
 const promptProjection=Object.freeze({
  schema:protocol.PROMPT_SCHEMA,actingSeat:actorSeat,
  promptType:'ChooseCardsPrompt',description:prompt.message,source,
  choices:Object.freeze(choices),
  publicMetadata:Object.freeze({
   selectionType:'card-combination',sourceZone:'prizes',ownerSeat:'actor',
   isOwnerVisible:true,isSecret:false,minimumCount:0,maximumCount:1,
   allowCancel:false
  })
 });
 protocol.validatePrompt(promptProjection,actorSeat);
 return {
  hostOnly:false,promptProjection,choiceByToken,
  diagnostics:Object.freeze({
   promptType:'ChooseCardsPrompt',sourcePrinting:SOURCE,
   originalPrizeCount:list.length,eligibleBasicCount:choices.length-1,
   policy:VERSION,enginePin:PIN
  })
 };
}
module.exports={SOURCE,EFFECT,PIN,VERSION,sourcePrinting,exactSource,projectHeavyBallPrompt};
