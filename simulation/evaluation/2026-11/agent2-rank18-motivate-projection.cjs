'use strict';
/*
 * Opt-in source-exact host-side projection for original Aichi rank18
 * Squawkabilly ex PAL169 / Motivate AttachEnergyPrompt, pinned Twinleaf
 * a9905a76. No default host/Store mutation and no invented worker raw cards.
 * Pinned source: ptcg-server/src/sets/10-scarlet-and-violet/
 * set-paldea-evolved/squawkabilly-ex.ts
 *
 * Native source contract: one AttachEnergyPrompt from actor.discard with
 * allowCancel:false, min:0, max:2, sameTarget:true, Basic Energy only,
 * BOTTOM_PLAYER / BENCH, after a real active Squawk's Motivate attack.
 * Encode a single native-validated composite result as one opaque policy token.
 */
const protocol=require('./agent49-policy-protocol.cjs');
const projectionDefault=require('./agent36-prompt-projection.cjs');
const {energyCoverage}=require('./agent2-rank27-regidrago-opponent-policy.cjs');
const SOURCE='Squawkabilly ex PAL';
const ATTACK='Motivate';
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const VERSION='agent2-rank18-motivate-source-v1';
const BASIC_NAMES=new Map([
 ['Grass Energy',['Grass Energy MEE','Grass Energy MEE 9']],
 ['Fire Energy',['Fire Energy MEE','Fire Energy MEE 10']]
]);
function fail(code,message){throw Object.assign(new Error(message),{code});}
function arr(x){return Array.isArray(x)?x:[];}
function exactSource(provenance,source){
 const card=provenance?.sourceCard;
 return source?.classification==='actor-choice'&&
   source.sourceKind==='card-effect'&&
   source.sourcePrinting===SOURCE&&
   source.effectName===ATTACK&&
   provenance?.effectName===ATTACK&&
   card?.name==='Squawkabilly ex'&&
   card?.fullName===SOURCE&&card?.set==='PAL'&&
   String(card?.setNumber)==='169';
}
function normalizeEnergy(card,native){
 if(!(card instanceof native.EnergyCard)||
    card?.superType!==native.SuperType.ENERGY||
    card?.energyType!==native.EnergyType.BASIC||
    !BASIC_NAMES.has(card?.name))return null;
 const alias=BASIC_NAMES.get(card.name);
 if(!alias.includes(card.fullName)&&
    !(card?.set==='MEE'&&
      alias.includes(card.name+' MEE'+(card.setNumber?' '+card.setNumber:''))))
   return null;
 if(card.name==='Grass Energy' &&
    !arr(card.provides).includes(native.CardType.GRASS))return null;
 if(card.name==='Fire Energy' &&
    !arr(card.provides).includes(native.CardType.FIRE))return null;
 return card.name==='Grass Energy'?'Grass Energy MEE 9':'Fire Energy MEE 10';
}
function normalizeAttached(card,native){
 const v=normalizeEnergy(card,native);
 if(v)return v;
 if(card instanceof native.EnergyCard&&
    card.name==='Double Dragon Energy'&&
    card.energyType===native.EnergyType.SPECIAL&&
    card.fullName==='Double Dragon Energy ROS')return 'Double Dragon Energy ROS 97';
 return null;
}
function targetInfo(slot,index){
 const card=slot?.getPokemonCard?.();
 if(!card)return null;
 const full=card.fullName;
 if(!['Regidrago V SIT','Regidrago VSTAR SIT'].includes(full)||
    card?.set!=='SIT'||String(card.setNumber)!==
       (full==='Regidrago VSTAR SIT'?'136':'135'))return null;
 return {slot,index,full};
}
function templeActive(state,actorSeat){
 for(const seat of [actorSeat,1-actorSeat]){
  const player=state.players?.[seat];
  const stadiums=arr(player?.stadium?.cards);
  if(stadiums.some(c=>c?.name==='Temple of Sinnoh'&&
      c.set==='ASR'&&String(c.setNumber)==='155'))
    return true;
 }
 return false;
}
function optimizedTransfer(actor,prompt,native,state,actorSeat){
 const available=arr(prompt.cardList.cards).map((card,index)=>({
  card,index,printing:normalizeEnergy(card,native)
 })).filter(x=>x.printing!==null);
 const targets=arr(actor.bench).map((slot,index)=>targetInfo(slot,index))
   .filter(Boolean);
 const temple=templeActive(state,actorSeat);
 let best={score:0,indices:[],target:null,after:0};
 for(const target of targets){
  const attached=arr(target.slot.cards).map(card=>normalizeAttached(card,native))
    .filter(Boolean);
  const before=energyCoverage(attached,temple);
  const tries=[[]];
  for(let i=0;i<available.length;i++){
   tries.push([available[i]]);
   for(let j=i+1;j<available.length;j++)
     tries.push([available[i],available[j]]);
  }
  for(const chosen of tries){
   if(chosen.length===0)continue;
   const after=energyCoverage([...attached,...chosen.map(x=>x.printing)],temple);
   const gain=after-before;
   if(gain<=0)continue;
   // Definite attack readiness takes precedence over just added resources;
   // next prioritize VSTAR over unevolved V, and avoid excess payment.
   const score=gain*100+(after===3?350:0)+
      (target.full==='Regidrago VSTAR SIT'?35:0)-
      chosen.length*3+(before*4);
   const indices=chosen.map(x=>x.index);
   if(score>best.score){
    best={score,indices,target,after};
   }
  }
 }
 if(best.score<=0)return {raw:[],count:0,target:null,after:0};
 return {
  raw:best.indices.map(index=>({
   to:{player:native.PlayerType.BOTTOM_PLAYER,
       slot:native.SlotType.BENCH,index:best.target.index},
   index
  })),
  count:best.indices.length,target:best.target,after:best.after
 };
}
function projectMotivatePrompt(options={}){
 const projection=options.testProjectionApi??projectionDefault;
 const {prompt,state,actorSeat,native,provenanceHook}=options;
 if(prompt?.constructor?.name!=='AttachEnergyPrompt')
   return projection.projectPrompt(options);
 const provenance=provenanceHook?.getPromptProvenance?.(prompt)??null;
 if(provenance?.sourceCard?.name!=='Squawkabilly ex')
   return projection.projectPrompt(options);
 if((actorSeat!==0&&actorSeat!==1)||
    !Array.isArray(state?.players)||state.players.length!==2||
    ![3,4].includes(state.phase))
   fail('R18_MOTIVATE_ACTOR_PHASE','Invalid rank18 Motivate active phase/seat');
 const actor=state.players[actorSeat];
 if(!actor||prompt?.result!==undefined||
    !Array.isArray(state.prompts)||!state.prompts.includes(prompt)||
    prompt.playerId!==actor.id||
    prompt.getPerspectivePlayerId?.()!==actor.id)
   fail('R18_MOTIVATE_PROMPT_OWNER','Motivate prompt is not the active actor prompt');
 const source=projection.makeSource(prompt,state,actorSeat,provenance);
 if(!exactSource(provenance,source)||
    actor.active?.getPokemonCard?.()!==provenance.sourceCard)
   fail('R18_MOTIVATE_SOURCE','Must be original active PAL169 Motivate');
 const expected=prompt.message==='ATTACH_ENERGY_TO_BENCH'&&
   prompt.cardList===actor.discard&&
   prompt.playerType===native?.PlayerType?.BOTTOM_PLAYER&&
   Array.isArray(prompt.slots)&&prompt.slots.length===1&&
   prompt.slots[0]===native?.SlotType?.BENCH&&
   prompt.filter?.superType===native?.SuperType?.ENERGY&&
   prompt.filter?.energyType===native?.EnergyType?.BASIC&&
   Object.keys(prompt.filter).length===2&&
   prompt.options?.allowCancel===false&&
   prompt.options?.min===0&&prompt.options?.max===2&&
   prompt.options?.sameTarget===true&&
   prompt.options?.differentTypes===false&&
   prompt.options?.differentTargets===false&&
   arr(prompt.options?.blocked).length===0&&
   arr(prompt.options?.blockedTo).length===0&&
   prompt.options?.validCardTypes===undefined&&
   prompt.options?.maxPerType===undefined&&
   Array.isArray(actor.bench)&&Array.isArray(prompt.cardList?.cards)&&
   typeof native?.EnergyCard==='function'&&
   native?.CardType&&native?.SuperType&&native?.EnergyType;
 if(!expected)
   fail('R18_MOTIVATE_PROMPT_SHAPE','Pinned PAL169 Motivate shape changed');
 const selection=optimizedTransfer(actor,prompt,native,state,actorSeat);
 const raw=selection.raw;
 const validated=projection.validateRawPromptResult(prompt,raw,state,{enginePin:PIN});
 if(validated?.valid!==true)
   fail('R18_MOTIVATE_NATIVE_VALIDATION','Native Motivate composite invalid');
 const token='r18-motivate-'+selection.count+
    (selection.target?'-b'+selection.target.index:'-none');
 const choice=Object.freeze({
   kind:'energy',token,
   label:selection.target?
     ('Attach '+selection.count+' Basic Energy from discard to Bench '+
     (selection.target.index+1)+': '+selection.target.full):
     'Attach no Energy from discard (Motivate still deals 20 damage)',
   publicMetadata:Object.freeze({
     sourceZone:'discard',ownerSeat:'actor',isOwnerVisible:true,
     energyType:'BASIC',zone:'bench',selectedCount:selection.count,
     ...(selection.target?{benchIndex:selection.target.index}:{})
   })
 });
 const promptProjection=Object.freeze({
   schema:protocol.PROMPT_SCHEMA,actingSeat:actorSeat,
   promptType:'AttachEnergyPrompt',
   description:prompt.message,source,
   choices:Object.freeze([choice]),
   publicMetadata:Object.freeze({
     selectionType:'energy-attachment',count:1,
     minimumCount:selection.count,maximumCount:selection.count,
     allowCancel:false,sourceZone:'discard',
     ownerSeat:'actor',isOwnerVisible:true,energyType:'BASIC',zone:'bench'
   })
 });
 protocol.validatePrompt(promptProjection,actorSeat);
 return {
  hostOnly:false,promptProjection,
  choiceByToken:new Map([[token,raw]]),
  diagnostics:Object.freeze({
   promptType:'AttachEnergyPrompt',sourcePrinting:SOURCE,
   choiceCount:1,nativeSelectedBasicCount:selection.count,
   targetBenchIndex:selection.target?.index??null,
   policy:VERSION,enginePin:PIN
  })
 };
}
module.exports={SOURCE,ATTACK,PIN,VERSION,exactSource,normalizeEnergy,
 templeActive,optimizedTransfer,projectMotivatePrompt};
