'use strict';
const {initializeCards}=require('./headless.cjs');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {runWithResearchProfile,RANK26_PROPAGATION_PROFILE:PROFILE}=require('./policy-profiles.cjs');
const {withRank26SourceSetup}=require('./agent3-rank26-energy-setup.cjs');
const {withDealFingerprint}=require('./rank26-natural-pre-koko-cologne-cohort.cjs');
const {withSourceCompressorRootProvenance}=require('./agent3-compressor-root-provenance-v3.cjs');
const {saveResult}=require('./agent3-rank26-compressor-settlement-prospective-v2.cjs');
const path=require('node:path');
const cases=[
 [72,'B',1,4195563994,'f1c6722173f9d7c7e24224e19783fda15e73fe827a9de749fd02e73f6ead9ffc'],
 [73,'B',1,2722702650,'355cf4abc7273b7a543b8e262ec8b9401b87b19d882af62ecf56d4e667534311'],
 [82,'A',0,3215316899,'d044a97a3b0bdc43833598d0077430cb83116735ecc7e66f0538df4c82d8acd8']
];
function run(){
 initializeCards();
 const f=planAichi(26,{allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true});
 const source=f.candidate.cards,opp=f.opponents.find(x=>x.rank===6).cards;
 const out=[];
 for(const [repeat,slot,seat,seed,expected] of cases) {
  for(const arm of ['baseline','treatment']){
   const request={deckA:seat===0?source:opp,deckB:seat===1?source:opp,rank26SourceSeat:seat,
    seed,maxActions:120,strictPromptValidation:true,isolatePolicyRandomness:true,
    captureDecisionTrace:true,battleCompressorPositiveSelectionCorrection:true,
    forestSealSearchCorrection:true,leleEntryAbilityLockCorrection:true,entryDrawLockCorrection:true,
    label:'agent3-root-v3-'+repeat+'-'+slot};
   const native=withDealFingerprint(()=>withSourceCompressorRootProvenance(seat,()=>
    arm==='baseline'?runWithResearchProfile(request,PROFILE):
    withRank26SourceSetup(seat,()=>runWithResearchProfile(request,PROFILE))));
   const wrapped=native.result;
   const game=arm==='treatment'?wrapped?.result?.result:wrapped?.result;
   const actions=(game?.decisionTrace??[]).filter(x=>x.turnBefore===1&&x.playerSlot===seat);
   out.push({repeat,slot,seat,seed,arm,expected,actual:native.physicalRoot?.digestSha256,
    error:native.error,
    abortSourceCompressorAudit:native.abortSourceCompressorAudit??null,
    sourceFirst:game?.firstTurnSlot===seat,
    actualFirstTurnCompressorPlays:actions.filter(x=>x.action==='PlayCardAction'&&x.card==='Battle Compressor').length,
    sourceActions:actions.map(x=>({action:x.action,card:x.card??null,ordinal:x.actionOrdinal})),
    nativeTerminal:game?.finished===true,receiptAudit:wrapped?.audit,
    competitiveGameQualified:false});
  }
 }
 return {schema:'agent3-rank26-root-provenance-v3-retrospective',engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
  cases:out,summary:{total:out.length,
   identicalRoots:out.filter(x=>x.expected===x.actual).length,
   baselineRootReceipts:out.filter(x=>x.arm==='baseline').reduce((n,x)=>n+(x.receiptAudit?.positiveLinkedSettlements??0),0),
   treatmentRootReceipts:out.filter(x=>x.arm==='treatment').reduce((n,x)=>n+(x.receiptAudit?.positiveLinkedSettlements??0),0),
   competitiveQualifiedGames:0}};
}
module.exports={run,cases};
if(require.main===module){
 const result=run();
 saveResult(path.resolve(process.cwd(),'agent3-rank26-root-provenance-v3.json'),result);
 process.stdout.write(JSON.stringify(result.summary)+'\n');
 if(result.summary.total!==6||result.summary.identicalRoots!==6||
    result.cases.some(x=>x.error||!x.sourceFirst||!x.receiptAudit?.liveRootIdentified))process.exitCode=1;
}
