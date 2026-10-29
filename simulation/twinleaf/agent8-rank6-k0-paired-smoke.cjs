'use strict';
const assert=require('node:assert/strict');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {runMatch}=require('./headless.cjs');
const {withSourceK0OpportunityWitness}=require('./agent8-source-k0-opportunity-witness.cjs');
function run(){
 const p=planAichi(1,{allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true});
 const o=p.opponents.find(x=>x.rank===6);
 const request={deckA:o.cards,deckB:p.candidate.cards,
  seed:407516727,maxActions:48,strictPromptValidation:true,
  forestSealSearchCorrection:true,supporterDecisionCorrection:true,
  isolatePolicyRandomness:true,captureDecisionTrace:true};
 const control=runMatch(request);
 const observed=withSourceK0OpportunityWitness(6,0,()=>runMatch(request));
 assert.ok(observed.audit?.rank6);
 assert.deepEqual(observed.result.decisionTrace,control.decisionTrace);
 return {sourceK0:observed.audit,decisionTraceIdentical:true,qualified:false};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run};
