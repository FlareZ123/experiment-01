'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {loadCampaignInputs}=require('./aichi-campaign-runner.cjs');
const {planAichi}=require('./aichi-pilot.cjs');
const {sourceFirstPressureTrials,executeDevelopment}=
 require('./agent41-bilateral-v2-development.cjs');
const {withCanonicalActorOnlyPolicy}=
 require('./agent7-canonical-actor-composition.cjs');
const {withSourceT3BackOrder}=
 require('../twinleaf/agent28-source-t3-backorder.cjs');
const {initializeCards}=require('../twinleaf/headless.cjs');
const SOURCE_DEAL='60b66e9e74e6e2914d92ba2c03dce8671b372e624f4f50797a6022a3eb955e31';
const CONTROL_LEDGER='b6810151644e298d8a4bdfcd766e8adf509a5c25e6a73a0f4aa02c4c8fd9f5a6';
/** @returns {object} Paired native original-Store source-first replay. */
function run(){
 initializeCards();
 const trial=sourceFirstPressureTrials().find(t=>t.rank===11&&
   t.candidateId==='new-moon-lockbreaker-v1');
 assert.equal(trial?.seed,482443328);
 const row=loadCampaignInputs().candidates.find(c=>c.id==='new-moon-lockbreaker-v1');
 const plan=planAichi({label:row.id,cards:row.cards},{
   allowEquivalentBasicEnergies:true,allowBasicEnergyMirrorPrintings:true,
   allowJapanesePromoHooks:true});
 assert.equal(plan.candidate.cards.length,60);
 const prepared=new Map([[row.id,{plan}]]);
 const match=()=>{
   const observed=withCanonicalActorOnlyPolicy(
     ()=>executeDevelopment(trial,prepared,{
       mandatoryOptionFallback:true,paperSupporterQuota:true,
       initializationWindow:false,garbotoxinWindow:true
     }),{},{
       ownerSingleSearch:true,genericFallbackAttribution:true,
       actorHandDiscard:true,actorChoosePokemon:true
     });
   return {...observed.result,actorAudit:observed.audit};
 };
 const control=match();
 assert.equal(control.sourceDealFingerprint,SOURCE_DEAL);
 assert.equal(control.rootActionLedgerSha256,CONTROL_LEDGER);
 const paired=withSourceT3BackOrder(match);
 const treatment=paired.result;
 assert.equal(treatment.sourceDealFingerprint,SOURCE_DEAL);
 let same=0;
 while(same<control.rootActionLedger.length&&
       same<treatment.rootActionLedger.length&&
       JSON.stringify(control.rootActionLedger[same])===
       JSON.stringify(treatment.rootActionLedger[same]))++same;
 return {schema:'agent28-source-first-rank11-t3-backorder-v1',
   sourceDeal:SOURCE_DEAL,enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
   sourceActuallyFirst:true,sharedPrefix:same,
   audit:paired.audit,control,treatment,
   competitiveQualifiedGames:0,winRateCertified:false};
}
/** @param {string} file @param {string} contents */
function writeLocked(file,contents){
 const lock=file+'.lock';
 const fd=fs.openSync(lock,'wx');
 const tmp=file+'.'+process.pid+'.tmp';
 try{fs.writeFileSync(tmp,contents);fs.renameSync(tmp,file);}
 finally{if(fs.existsSync(tmp))fs.unlinkSync(tmp);fs.closeSync(fd);fs.unlinkSync(lock);}
}
if(require.main===module){
 const r=run();
 writeLocked('agent28-t3-backorder-native.json',JSON.stringify(r,null,2)+'\n');
 process.stdout.write(JSON.stringify({sourceDeal:r.sourceDeal,
  sharedPrefix:r.sharedPrefix,audit:r.audit,
  control:{winner:r.control.winner,prizes:r.control.finalPrizes,
   roots:r.control.actionCount},
  treatment:{winner:r.treatment.winner,prizes:r.treatment.finalPrizes,
   roots:r.treatment.actionCount},
  qualifiedGames:0},null,2)+'\n');
}
module.exports={run};
