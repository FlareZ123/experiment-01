'use strict';
// Proposed host bridge for the established Agent36 projection/dispatch path.
// It does not register a worker, change the active protocol, or dispatch.
const bolt=require('./agent23-rank19-bellowing-thunder-draft.cjs');
const accel=require('./agent23-rank19-acceleration-draft.cjs');
const SOURCE_FINGERPRINT='8fc9b7cf236a50ea34cdf10746bfc01d5f226739d106e4afcf438ed5c8f491eb';
const DISCARD='rank19-bellowing-discard-v1',ATTACH='rank19-attachment-set-v1';
function validContext(c){
 return c?.role==='opponent'&&c.sourceRank===19&&c.sourceFingerprint===SOURCE_FINGERPRINT&&c.enginePin===bolt.PIN&&Array.isArray(c.draftPromptContracts)&&c.draftPromptContracts.every(x=>[DISCARD,ATTACH].includes(x))&&new Set(c.draftPromptContracts).size===c.draftPromptContracts.length;
}
function projectDraftEnergyPrompt({context,prompt,state,actorSeat,native,source}={}){
 if(!validContext(context)||source?.classification!=='actor-choice'||source.sourceKind!=='card-effect'||source.copiedSourcePrinting!==undefined||source.copiedAttackName!==undefined)return null;
 const type=prompt?.constructor?.name;
 let result=null;
 const args={pin:context.enginePin,prompt,state,actorSeat,native,source};
 if(type==='DiscardEnergyPrompt'&&context.draftPromptContracts.includes(DISCARD))result=bolt.project(args);
 if(type==='AttachEnergyPrompt'&&context.draftPromptContracts.includes(ATTACH)&&accel.spec(source))result=accel.project(args);
 if(!result)return null;
 return Object.freeze({
  choices:Object.freeze(result.prompt.choices.map(c=>Object.freeze({...c,...(c.publicMetadata?{publicMetadata:Object.freeze({...c.publicMetadata})}:{})}))),
  publicMetadata:Object.freeze({...result.prompt.publicMetadata}),
  resolve:result.resolve
 });
}
module.exports={SOURCE_FINGERPRINT,projectDraftEnergyPrompt,validContext};
