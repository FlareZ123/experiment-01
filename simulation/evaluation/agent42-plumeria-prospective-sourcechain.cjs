'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const {writeAtomicLocked,gitBlobSha}=require('./agent20-frozen-rank6-canary-v1.cjs');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {withPaperPlumeriaPayment}=require('../twinleaf/agent42-plumeria-paper-payment-guard.cjs');
const ROOT=path.resolve(__dirname,'../..');
const PROFILE=path.join(__dirname,'agent20-frozen-rank6-canary-v1.json');
const OUTPUT=path.join(ROOT,'agent42-plumeria-prospective-sourcechain-native.json');
const REGISTRATION=path.join(ROOT,'results/aichi-2026/registrations/agent42-prospective-rank6-plumeria-native-20261102.json');
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
function runProspectivePlumeriaSourcechainPair(){
 const profile=JSON.parse(fs.readFileSync(PROFILE,'utf8'));
 assert.equal(profile.schema,'agent20-frozen-bilateral-rank6-canary-v1');
 const registration=JSON.parse(fs.readFileSync(REGISTRATION,'utf8'));
 assert.equal(registration.schema,'agent42-prospective-rank6-plumeria-payment-v1');
 assert.equal(registration.status,'sealed-before-native-execution');
 assert.equal(registration.parentPolicyProfileGitBlob,
  gitBlobSha(fs.readFileSync(PROFILE)));
 assert.equal(registration.registeredTrials.length,8);
 assert.ok(registration.registeredTrials.every(t=>t.rank===6));
 assert.deepEqual(registration.trialSeeds,
  [476812527,2570068619,740204527,615236925]);
 assert.equal(registration.pairCount,4);
 assert.equal(new Set(registration.registeredTrials.map(t=>t.id)).size,8);
 for(const seed of registration.trialSeeds){
  const pair=registration.registeredTrials.filter(t=>t.seed===seed);
  assert.equal(pair.length,2);
  assert.equal(pair[0].candidateSlot,pair[1].candidateSlot);
  assert.deepEqual(pair.map(t=>t.candidateId).sort(),
   ['champion-reference','new-moon-lockbreaker-v1']);
 }

 assert.equal(profile.policyOptions.sharedPaperPaymentPortfolio,true);
 assert.equal(profile.policyOptions.actorOnlyComposition,true);
 assert.equal(gitBlobSha(fs.readFileSync(path.join(ROOT,profile.printedRoster))),
  profile.printedRosterBlobSha,'Immutable original printed roster drift');
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
   registeredTrials:registration.registeredTrials,
   registeredFrameName:'agent42-prospective-rank6-physical-paper-guard-v1'};
  control=runDevelopment(options);
  const observed=withPaperPlumeriaPayment(()=>runDevelopment(options),
   {requireLiveStore:true});
  treatment=observed.result;
  guard=observed.audit;
 }finally{
  if(prior===undefined)delete process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
  else process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV=prior;
 }
 assert.equal(control.rows.length,8);
 assert.equal(treatment.rows.length,8);
 const pairs=control.rows.map((c,i)=>{
  const t=treatment.rows[i];
  assert.equal(c.trial.id,t.trial.id);
  return {trialId:c.trial.id,sourceRank:6,
   candidateId:c.trial.candidateId,sourceSeat:c.trial.candidateSlot==='A'?1:0,
   sourceDealMatch:typeof c.sourceDealFingerprint==='string'&&
    c.sourceDealFingerprint.length===64&&c.sourceDealFingerprint===t.sourceDealFingerprint,
   fullPhysicalDealMatch:typeof c.fullPhysicalDealFingerprint==='string'&&
    c.fullPhysicalDealFingerprint.length===64&&
    c.fullPhysicalDealFingerprint===t.fullPhysicalDealFingerprint,
   sameAcceptedNativeRootLedger:JSON.stringify(c.rootActionLedger)===
    JSON.stringify(t.rootActionLedger),
   controls:{gameFinished:c.gameFinished??null,
    rootCount:c.rootActionCount??null,source:sourcePaymentLine(c)},
   guarded:{gameFinished:t.gameFinished??null,
    rootCount:t.rootActionCount??null,source:sourcePaymentLine(t)},
   guardPhysicalPaymentReceipts:guard.physicalPaymentReceipts.filter(x=>
    guard.nativeAddPlayerStores===8&&x.nativeStoreOrdinal===i+1),
   guardPhysicalEffectReceipts:(guard.physicalEffectReceipts??[]).filter(x=>
    guard.nativeAddPlayerStores===8&&x.nativeStoreOrdinal===i+1),
   qualifiedCompetitiveGames:0};
 });
 return {schema:'agent42-prospective-rank6-plumeria-physical-payment-parity-v1',
  evidenceClass:'Prospective source-payment exposure cohort sealed before native games',
  registration,
  policyProfile:profile.schema,sourceRoster:profile.printedRoster,
  pinnedVendorRevision:vendorRevision,checkoutCommit,
  sourceOriginalRanks:[6],attemptedGames:16,pairCount:pairs.length,
  competitiveQualifiedGames:0,guardAudit:guard,
  allPhysicalSourceDealsMatched:pairs.every(x=>
   x.sourceDealMatch&&x.fullPhysicalDealMatch),
  allRootLedgersMatched:pairs.every(x=>x.sameAcceptedNativeRootLedger),
  nativeStoreToRegisteredTrialOrdinalAsserted:guard.nativeAddPlayerStores===8,
  pairs,
  limitations:['Prospective registered source-payment exposure, not independently certified strength',
   'Only Plumeria exact native payment custody audited, not full-game paper validity',
   'Owner-information-safe two-seat opponent policies are unqualified',
   'No 25-minute paper clock and no original complete 32/32 source field']};
}
if(require.main===module){
 const x=runProspectivePlumeriaSourcechainPair();
 writeAtomicLocked(OUTPUT,JSON.stringify(x,null,2)+'\n');
 console.log('AGENT42_PLUMERIA_SOURCECHAIN '+JSON.stringify({
  attemptedGames:x.attemptedGames,allSameDeals:x.allPhysicalSourceDealsMatched,
  allSameRoots:x.allRootLedgersMatched,liveStores:x.guardAudit.nativeAddPlayerStores,
  payments:x.guardAudit.physicalPaymentReceipts,
  pairs:x.pairs.map(p=>({id:p.trialId,sourceRoots:p.guarded.source.acceptedSourcePlumeriaRoots,
   sourcePaymentChoices:p.guarded.source.ownerPayments.length,
   custody:p.guardPhysicalPaymentReceipts.map(x=>x.independentlyPaidTwo),
   energyCustody:p.guardPhysicalEffectReceipts.map(x=>x.independentEnergyRemoval)}))}));
}
module.exports={runProspectivePlumeriaSourcechainPair,sourcePaymentLine};
