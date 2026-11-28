'use strict';
/*
 * Gladion-specific owner-only Prize revelation for a research-side Twinleaf
 * prompt adapter. Does not patch the pinned upstream engine or authorize a
 * native fixture/game. Normal face-down Prize faces remain concealed.
 * Only Gladion's literal "Look at your face-down Prize cards" source may
 * expose OWN Prize names to the acting owner. Strict attested live Supporter
 * provenance, native prompt shape and owner physical custody are required.
 */
const assert=require('node:assert/strict');
const protocol=require('../evaluation/2026-11/agent49-policy-protocol.cjs');
const base=require('../evaluation/2026-11/agent36-prompt-projection.cjs');
const VERSION='agent1-gladion-owner-prize-projection-v1';
const isInt=x=>Number.isSafeInteger(x);
const fullName=x=>typeof x?.fullName==='string'&&x.fullName.length?x.fullName:null;
const cards=x=>Array.isArray(x?.cards)?x.cards:[];
function attest({prompt,state,actorSeat,provenanceHook}={}){
 if(!prompt||!state||![0,1].includes(actorSeat)||!Array.isArray(state.players)||
  state.players.length!==2)return null;
 const owner=state.players[actorSeat];
 if(!owner||prompt.playerId!==owner.id||prompt.result!==undefined||
  prompt.getPerspectivePlayerId?.()!==owner.id||
  !['ChoosePrizePrompt','ChooseCardsPrompt'].includes(prompt.constructor?.name))
   return null;
 const provenance=provenanceHook?.getPromptProvenance?.(prompt);
 const sourceCard=provenance?.sourceCard;
 if(provenance?.sourceKind!=='card-effect'||provenance?.effectName!=='Gladion'||
  !sourceCard||!fullName(sourceCard)?.startsWith('Gladion ')||
  !cards(owner.supporter).includes(sourceCard))return null;
 if(prompt.options?.allowCancel!==false)return null;
 // isSecret means concealed from the opponent, not from the player whom
 // Gladion explicitly allows to look at their own six Prize cards.
 if(!Array.isArray(owner.prizes)||owner.prizes.length!==6||
  !owner.prizes.every(p=>Array.isArray(p?.cards)&&p.cards.length<=1))
   return null;
 // Native card source provenance must also be accepted by the canonical
 // projector; it checks that the effect's source is actor-visible.
 const source=base.makeSource(prompt,state,actorSeat,provenance);
 if(source?.sourceKind!=='card-effect'||source.effectName!=='Gladion'||
  source.sourcePrinting!==fullName(sourceCard))return null;
 return {owner,source};
}
function projected({prompt,state,actorSeat,attested}={}){
 const {owner,source}=attested;
 const choices=[],choiceByToken=new Map();
 let kind,selectionType,items;
 if(prompt.constructor?.name==='ChoosePrizePrompt'){
  if(prompt.options?.useOpponentPrizes!==false||
    prompt.options?.count!==1||
    !Array.isArray(prompt.options?.blocked)||prompt.options.blocked.length!==0)
    return null;
  kind='prize';selectionType='prize-slots';
  items=owner.prizes.map((slot,slotIndex)=>({slot,slotIndex}))
   .filter(({slot})=>slot.cards.length===1)
   .map(({slot,slotIndex},index)=>({card:slot.cards[0],raw:index,
      slotIndex,index}));
 } else if(prompt.constructor?.name==='ChooseCardsPrompt'){
  const requested=cards(prompt.cards);
  if(prompt.options?.min!==1||prompt.options?.max!==1||
    !Array.isArray(prompt.options?.blocked)||prompt.options.blocked.length!==0||
    !requested.length||requested.length>6)return null;
  // No opponent's cards or cards outside the actor's own physical Prizes.
  if(requested.some(c=>!owner.prizes.some(slot=>slot.cards.includes(c))))
   return null;
  kind='card';selectionType='card-combination';
  items=requested.map((card,index)=>({card,raw:index,slotIndex:index,index}));
 } else return null;
 if(items.length<1||items.length>6||
  items.some(({card})=>!fullName(card)))return null;
 for(const [index,{card,raw,slotIndex}]of items.entries()){
  const token='prompt-'+index.toString(36);
  choices.push(Object.freeze({
   token,kind,label:'Your Prize slot '+(slotIndex+1)+' — '+fullName(card),
   printing:fullName(card),
   publicMetadata:Object.freeze({
    selectionIndex:index,selectedCount:1,
    sourceZone:'prizes',ownerSeat:'actor',isOwnerVisible:true,
    ...(selectionType==='prize-slots'?{requiredCount:1}:{})
   })
  }));
  choiceByToken.set(token,raw);
 }
 const publicMetadata={
   selectionType,sourceZone:'prizes',ownerSeat:'actor',
   isOwnerVisible:true,allowCancel:false,isSecret:false,
   ...(selectionType==='prize-slots'?
     {count:items.length,requiredCount:1}:
     {minimumCount:1,maximumCount:1})
 };
 const projection=Object.freeze({
  schema:protocol.PROMPT_SCHEMA,actingSeat:actorSeat,
  promptType:prompt.constructor.name,
  description:typeof prompt.message==='string'?prompt.message:'Choose a Prize card',
  source:Object.freeze(source),choices:Object.freeze(choices),
  publicMetadata:Object.freeze(publicMetadata)
 });
 protocol.validatePrompt(projection,actorSeat);
 return {
  hostOnly:false,promptProjection:projection,choiceByToken,
  diagnostics:Object.freeze({
   version:VERSION,promptType:prompt.constructor.name,
   sourceKind:source.sourceKind,sourcePrinting:source.sourcePrinting,
   ownerPrizeFaceRevealAuthorizedByCardText:true,
   opponentPrizeFacesRead:false,choiceCount:choices.length
  })
 };
}
/*
 * Drop-in call-site-compatible projector. A failed attestation delegates to
 * the canonical strict projector, which keeps face-down Prizes hidden.
 * If a genuine Gladion prompt has an unsupported shape, fail closed rather
 * than return a false face-up choice or pretend it was evaluated.
 */
function projectPromptWithGladionOwnerPrize(args={}){
 const proof=attest(args);
 if(proof){
  const result=projected({...args,attested:proof});
  if(!result)throw Object.assign(
   new Error('Authenticated Gladion owner Prize prompt has unsupported native shape'),
   {code:'GLADION_OWNER_PRIZE_PROMPT_UNSUPPORTED'});
  return result;
 }
 return (args.canonicalProjectPrompt??base.projectPrompt)(args);
}
module.exports={VERSION,attest,projected,projectPromptWithGladionOwnerPrize};
