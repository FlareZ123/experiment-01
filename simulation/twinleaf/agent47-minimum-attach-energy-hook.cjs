'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {sameTarget,validAttachEnergyTargets}=require('./attach-energy-targets.cjs');
const VERSION='agent47-bounded-mandatory-attach-selection-v1';

/**
 * Repair only a nonempty under-minimum native assignment with a proven single
 * owner recipient. Preserve the bot's original physical Energy and target.
 * Deliberately decline destination/type allocation and special caps.
 * @param {object} state Pinned Store State.
 * @param {object} prompt Native AttachEnergyPrompt.
 * @param {unknown} proposed Original bot result.
 * @returns {{value:unknown,changed:boolean,reason:string}}
 */
function repairMinimumAttachSelection(state,prompt,proposed){
 const options=prompt?.options,min=options?.min;
 if(!Number.isInteger(min)||min<2||min>3||
    !Array.isArray(proposed)||proposed.length<1||proposed.length>=min||
    options.differentTypes===true||options.differentTargets===true||
    (options.maxPerType!==undefined&&options.maxPerType!==null)||
    (Number.isInteger(options.max)&&options.max<min)){
  return {value:proposed,changed:false,reason:'outside-narrow-contract'};
 }
 const cards=prompt.cardList?.cards;
 if(!Array.isArray(cards)||typeof prompt.cardList.filter!=='function'||
    typeof prompt.validate!=='function'||
    typeof prompt.getPerspectivePlayerId!=='function'){
  return {value:proposed,changed:false,reason:'missing-prompt-contract'};
 }
 const actor=state?.players?.find(p=>p.id===prompt.getPerspectivePlayerId());
 if(!actor||typeof actor.forEachPokemon!=='function'||!Array.isArray(prompt.slots)){
  return {value:proposed,changed:false,reason:'no-authenticated-actor'};
 }
 const legalTargets=[];
 actor.forEachPokemon(2,(list,card,target)=>{
  if(prompt.slots.includes(target.slot))legalTargets.push({list,target});
 });
 const destination=proposed[0]?.to;
 if(!destination||proposed.some(row=>!sameTarget(row?.to,destination))){
  return {value:proposed,changed:false,reason:'incompatible-recipient'};
 }
 const eligible=prompt.cardList.filter(prompt.filter),eligibleSet=new Set(eligible);
 const already=new Set();
 for(const row of proposed){
  if(!eligibleSet.has(row?.card)||already.has(row.card)){
   return {value:proposed,changed:false,reason:'invalid-existing-cards'};
  }
  already.add(row.card);
 }
 const missing=min-proposed.length;
 const added=eligible.filter(card=>!already.has(card)).slice(0,missing);
 if(added.length!==missing){
  return {value:proposed,changed:false,reason:'insufficient-eligible-cards'};
 }
 const corrected=[...proposed,...added.map(card=>({card,to:destination}))];
 if(!validAttachEnergyTargets(corrected,legalTargets,options)||
    !prompt.validate(corrected)){
  return {value:proposed,changed:false,reason:'validator-rejected'};
 }
 return {value:corrected,changed:true,reason:'minimum-repaired'};
}

/**
 * Reversible, explicit-opt-in hook for the pinned native resolver.
 * Both seats receive the same narrow correction. A resolver may be invoked
 * speculatively, so audit counts are proposals, not Store acceptance.
 * @template T
 * @param {()=>T} execute
 * @param {{AttachEnergyPromptResolver?:Function,AttachEnergyPrompt?:Function}} [dependencies]
 * @returns {{result:T,audit:object}}
 */
function withMinimumAttachEnergySelection(execute,dependencies={}){
 assert.equal(typeof execute,'function');
 const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
 const Resolver=dependencies.AttachEnergyPromptResolver??
   require(path.join(output,'simple-bot/prompt-resolver/attach-energy-prompt-resolver'))
     .AttachEnergyPromptResolver;
 const Prompt=dependencies.AttachEnergyPrompt??
   require(path.join(output,'game/store/prompts/attach-energy-prompt')).AttachEnergyPrompt;
 const proto=Resolver.prototype;
 const previous=Object.getOwnPropertyDescriptor(proto,'getPromptResult');
 assert.equal(typeof previous?.value,'function');
 const audit={version:VERSION,proposedCorrections:0,unsupported:0,
   speculativeOrReal:true,competitiveQualified:false};
 function patched(state,prompt){
  const original=previous.value.call(this,state,prompt);
  if(!(prompt instanceof Prompt))return original;
  const fix=repairMinimumAttachSelection(state,prompt,original);
  if(fix.changed)audit.proposedCorrections++;
  else if(Array.isArray(original)&&Number.isInteger(prompt?.options?.min)&&
          original.length<prompt.options.min)audit.unsupported++;
  return fix.value;
 }
 Object.defineProperty(proto,'getPromptResult',{...previous,value:patched});
 try{return{result:execute(),audit};}
 catch(error){
  if(error&&typeof error==='object')error.nativeMinimumAttachEvidence=audit;
  throw error;
 }finally{
  assert.strictEqual(proto.getPromptResult,patched);
  Object.defineProperty(proto,'getPromptResult',previous);
 }
}
module.exports={VERSION,repairMinimumAttachSelection,withMinimumAttachEnergySelection};
