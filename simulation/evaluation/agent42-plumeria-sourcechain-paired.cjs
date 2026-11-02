'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const {writeAtomicLocked}=require('./agent20-frozen-rank6-canary-v1.cjs');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {withPaperPlumeriaPayment}=require('../twinleaf/agent42-plumeria-paper-payment-guard.cjs');
const ROOT=path.resolve(__dirname,'../..');
const PROFILE=path.join(__dirname,'agent20-frozen-rank6-canary-v1.json');
const OUTPUT=path.join(ROOT,'agent42-plumeria-sourcechain-native.json');
/** @param {object} row @returns {object} */
function sourcePaymentLine(row){
 const sourceSeat=row.trial.candidateSlot==='A'?1:0;
 const roots=row.rootActionLedger??[];
 const plays=roots.filter(r=>r.playerSlot===sourceSeat&&
  r.action==='PlayCardAction'&&r.card==='Plumeria');
 const playOrdinals=new Set(plays.map(r=>r.actionOrdinal));
 const ownerPayments=(row.nativePromptChoices?.events??[]).filter(e=>{
  if(e.actorSeat!==sourceSeat||e.kind!=='ChooseCardsPrompt')return false;
  const root=roots.find(r=>r.actionOrdinal===e.ordinal);
  return playOrdinals.has(root?.initiatingRootActionOrdinal)&&
   e.nativePromptMin===2&&e.nativePromptMax===2;
 });
 return {sourceSeat,acceptedSourcePlumeriaRoots:plays.length,
  playOrdinals:[...playOrdinals],ownerPayments:ownerPayments.map(e=>({
   ordinal:e.ordinal,selectedNames:e.selectedCards,
   sourceZone:e.sourceZone,sourcePlayerSlot:e.sourcePlayerSlot,
   nativePromptMin:e.nativePromptMin,nativePromptMax:e.nativePromptMax
  }))};
}
/**
 * Retrospective same-input selected original rank6 Store experiment.
 * One control and one guarded run of four previous registered native trials.
 * @returns {object}
 */
function runPlumeriaSourcechainPair(){
 const profile=JSON.parse(fs.readFileSync(PROFILE,'utf8'));
 assert.equal(profile.schema,'agent20-frozen-bilateral-rank6-canary-v1');
 assert.equal(profile.registeredTrials.length,4);
 assert.ok(profile.registeredTrials.every(t=>t.rank===6));
 assert.equal(profile.policyOptions.sharedPaperPaymentPortfolio,true);
 assert.equal(profile.policyOptions.actorOnlyComposition,true);
 const checkoutCommit=execFileSync('git',['rev-parse','HEAD'],
  {cwd:ROOT,encoding:'utf8'}).trim();
 const vendorRevision=execFileSync('git',['-C',path.join(ROOT,'vendor/twinleaf'),
  'rev-parse','HEAD'],{encoding:'utf8'}).trim();
 assert.equal(vendorRevision,profile.pinnedVendorRevision);
 const prior=process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
 process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV='true';
 let control,treatment,guard;
 try{
  const options={...profile.policyOptions,
   registeredTrials:profile.registeredTrials,
   registeredFrameName:'agent42-rank6-physical-paper-guard-v1'};
  control=runDevelopment(options);
  const observed=withPaperPlumeriaPayment(()=>runDevelopment(options),
   {requireLiveStore:true});
  treatment=observed.result;
  guard=observed.audit;
 }finally{
  if(prior===undefined)delete process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
  else process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV=prior;
 }
 assert.equal(control.rows.length,4);
 assert.equal(treatment.rows.length,4);
 const pairs=control.rows.map((c,i)=>{
  const t=treatment.rows[i];
  assert.equal(c.trial.id,t.trial.id);
  return {trialId:c.trial.id,sourceRank:6,
   candidateId:c.trial.candidateId,sourceSeat:c.trial.candidateSlot==='A'?1:0,
   sourceDealMatch:c.sourceDealFingerprint===t.sourceDealFingerprint,
   fullPhysicalDealMatch:c.fullPhysicalDealFingerprint===t.fullPhysicalDealFingerprint,
   sameAcceptedNativeRootLedger:JSON.stringify(c.rootActionLedger)===
    JSON.stringify(t.rootActionLedger),
   controls:{gameFinished:c.gameFinished??null,
    rootCount:c.rootActionCount??null,source:sourcePaymentLine(c)},
   guarded:{gameFinished:t.gameFinished??null,
    rootCount:t.rootActionCount??null,source:sourcePaymentLine(t)},
   guardPhysicalPaymentReceipts:guard.physicalPaymentReceipts.filter(x=>
    guard.nativeAddPlayerStores===4&&x.nativeStoreOrdinal===i+1),
   qualifiedCompetitiveGames:0};
 });
 return {schema:'agent42-rank6-plumeria-physical-payment-parity-v1',
  evidenceClass:'Retrospective four-arm developmental native Store comparison',
  policyProfile:profile.schema,sourceRoster:profile.printedRoster,
  pinnedVendorRevision:vendorRevision,checkoutCommit,
  sourceOriginalRanks:[6],attemptedGames:8,pairCount:pairs.length,
  competitiveQualifiedGames:0,guardAudit:guard,
  allPhysicalSourceDealsMatched:pairs.every(x=>
   x.sourceDealMatch&&x.fullPhysicalDealMatch),
  allRootLedgersMatched:pairs.every(x=>x.sameAcceptedNativeRootLedger),
  nativeStoreToRegisteredTrialOrdinalAsserted:guard.nativeAddPlayerStores===4,
  pairs,
  limitations:['Historical selected seeds, not held-out strength',
   'Only Plumeria exact native payment custody audited, not full-game paper validity',
   'Owner-information-safe two-seat opponent policies are unqualified',
   'No 25-minute paper clock and no original complete 32/32 source field']};
}
if(require.main===module){
 const x=runPlumeriaSourcechainPair();
 writeAtomicLocked(OUTPUT,JSON.stringify(x,null,2)+'\n');
 console.log('AGENT42_PLUMERIA_SOURCECHAIN '+JSON.stringify({
  attemptedGames:x.attemptedGames,allSameDeals:x.allPhysicalSourceDealsMatched,
  allSameRoots:x.allRootLedgersMatched,liveStores:x.guardAudit.nativeAddPlayerStores,
  payments:x.guardAudit.physicalPaymentReceipts,
  pairs:x.pairs.map(p=>({id:p.trialId,sourceRoots:p.guarded.source.acceptedSourcePlumeriaRoots,
   sourcePaymentChoices:p.guarded.source.ownerPayments.length,
   custody:p.guardPhysicalPaymentReceipts.map(x=>x.independentlyPaidTwo)}))}));
}
module.exports={runPlumeriaSourcechainPair,sourcePaymentLine};
