'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {inspectProfile,gitBlobSha}=
  require('./agent41-joint-source-r5-r11-v1.cjs');
const {withGenesectDceRetreatCustody}=
  require('../twinleaf/agent22-genesect-dce-retreat-custody.cjs');

const root=path.resolve(__dirname,'../..');
const registrationPath=path.join(__dirname,'agent22-rank5-genesect-fee-custody-v1.json');
const selectedPath=path.join(__dirname,'agent41-joint-source-r5-r11-v1.json');
const outPath=path.join(root,'agent22-rank5-genesect-fee-custody-v1-output.json');
const registration=JSON.parse(fs.readFileSync(registrationPath,'utf8'));
const selected=JSON.parse(fs.readFileSync(selectedPath,'utf8'));
const frozenRegistrationBlob='164231e0e9d6f529f45157babd42837b60b55f8a';

/** Fixed historical positive physical witnesses only; no future hand selection. */
function inspect(){
  const base=inspectProfile();
  assert.equal(gitBlobSha(fs.readFileSync(registrationPath)),frozenRegistrationBlob);
  assert.equal(registration.schema,
    'agent22-rank5-genesect-physical-dce-payment-retrospective-v1');
  assert.equal(registration.expectedNativeAttempts,2);
  assert.equal(registration.registeredTrials.length,2);
  assert.deepEqual(registration.registeredTrials.map(x=>x.candidateId),
    ['champion-reference','new-moon-lockbreaker-v1']);
  assert.equal(registration.pinnedJointProfileBlob,
    gitBlobSha(fs.readFileSync(selectedPath)));
  assert.equal(registration.pinnedSourceRosterBlob,
    selected.pinnedSourceFiles['results/aichi-2026/full-decklists.json']);
  assert.equal(registration.pinnedEngine,selected.pinnedVendor);
  assert.equal(registration.pinnedRunnerBlob,
    selected.pinnedSourceFiles['simulation/evaluation/agent41-bilateral-v2-development.cjs']);
  assert.equal(registration.registeredFrameName,
    'agent22-rank5-same-code-option-shape-transport-v1-common-physical-frame');
  return {registeredSourceRank:5,originalPrintedRoster:registration.pinnedSourceRosterBlob,
    selectedPolicyProfileBlob:base.profileGitBlob,
    selectedNativeRunnerBlob:registration.pinnedRunnerBlob,
    nativeEngine:registration.pinnedEngine,
    initialObservationalSourceRun:registration.preObservedOnlySourceDeal.historicalReferenceRun,
    expectedSourcePhysicalDeals:2,observerReadOnly:true,
    outcomeGameQualified:false};
}

function lockedSave(payload){
  const lock=outPath+'.lock';
  const fd=fs.openSync(lock,'wx',0o600);
  const temp=outPath+'.tmp.'+process.pid;
  try{
    fs.writeFileSync(temp,JSON.stringify(payload,null,2)+'\n',{flag:'wx'});
    const output=fs.openSync(temp,'r');
    try{fs.fsyncSync(output);}finally{fs.closeSync(output);}
    fs.renameSync(temp,outPath);
  }finally{
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
}

function execute(){
  const preflight=inspect();
  const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
  const ambient='AGENT4_NATIVE_PAYMENT_RECEIPT_DEV';
  assert.equal(process.env[ambient],undefined);
  process.env[ambient]='true';
  let run;
  try{
    run=withGenesectDceRetreatCustody(()=>
      runDevelopment({...selected.policyOptions,
        registeredTrials:registration.registeredTrials,
        registeredFrameName:registration.registeredFrameName}));
  }finally{delete process.env[ambient];}
  const raw=run.result;
  assert.equal(raw.rows.length,2);
  const comparisons=registration.registeredTrials.map(trial=>{
    const row=raw.rows.find(x=>x.trial?.id===trial.id);
    assert.ok(row);
    const expected=registration.preObservedOnlySourceDeal;
    return {trialId:trial.id,
      exactOriginalSourceDealMatch:
        row.sourceDealFingerprint===expected.sha256,
      originalSourceSeat:row.sourceSeat,
      correctOriginalSourceSeat:row.sourceSeat===expected.actualSourceSeat,
      correctActualStarter:row.actualStarterSeat===expected.actualStarterSeat,
      exactUnchangedRootLedger:
        row.rootActionLedgerSha256===expected.historicalRootLedgerSha256[trial.id],
      originalRootLedgerSha256:expected.historicalRootLedgerSha256[trial.id],
      replayRootLedgerSha256:row.rootActionLedgerSha256,
      originalNativeSourceAttacks:(row.sourceAttackSettlement?.attacks??[])
        .filter(x=>x.attackName==='Cross Fusion Strike'&&
          x.settledPromptChain===true).length,
      sourceNativeRetreatActionCount:(row.rootActionLedger??[])
        .filter(x=>x.playerSlot===expected.actualSourceSeat&&
          x.action==='RetreatAction'&&x.pendingPrompt===null).length};
  });
  const receipts=run.audit.records;
  const output={
    schema:'agent22-rank5-genesect-dce-native-exact-custody-v1',
    preflight,registration,comparisons,
    genuinePhysicalObserver:run.audit,
    completeNativeRawRows:raw,
    noChangeToAgent41OriginalSourcePolicy:true,
    noChangeToPinnedVendor:true,
    samePhysicalInitialDealEveryTrial:comparisons.every(x=>x.exactOriginalSourceDealMatch),
    unchangedSourceNativeRootLedgers:comparisons.every(x=>x.exactUnchangedRootLedger),
    physicalDceFeeAndPromotionReceipts:receipts.filter(x=>
      x.status==='EXACT_PHYSICAL_DCE_FEE_AND_MEW_PROMOTION').length,
    observerExaminedRealNativeStore:true,
    paperFullChainAndClockQualified:false,
    competitiveQualifiedGames:0};
  lockedSave(output);
  process.stdout.write(JSON.stringify({
    schema:output.schema,attempted:comparisons.length,
    exactSourceDeals:comparisons.filter(x=>x.exactOriginalSourceDealMatch).length,
    unchangedActionLedgers:comparisons.filter(x=>x.exactUnchangedRootLedger).length,
    physicalFees:output.physicalDceFeeAndPromotionReceipts,
    observer:run.audit,comparisons,competitiveQualifiedGames:0})+'\n');
  return output;
}

if(require.main===module){
  if(process.argv.includes('--inspect-only'))
    process.stdout.write(JSON.stringify(inspect(),null,2)+'\n');
  else execute();
}
module.exports={inspect,execute};
