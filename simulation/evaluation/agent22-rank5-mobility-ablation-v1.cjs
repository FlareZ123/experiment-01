'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {gitBlobSha,inspect:inspectTransport}=
  require('./agent22-rank5-options-transport-v1.cjs');
const {classifyNativeAttempt}=require('./agent41-native-attempt-disposition.cjs');

const root=path.resolve(__dirname,'../..');
const profilePath=path.join(__dirname,'agent22-rank5-mobility-ablation-v1.json');
const formerPath=path.join(__dirname,'agent22-rank5-options-transport-v1.json');
const selectedPath=path.join(__dirname,'agent41-joint-source-r5-r11-v1.json');
const outputPath=path.join(root,'agent22-rank5-mobility-ablation-v1-output.json');
const profile=JSON.parse(fs.readFileSync(profilePath,'utf8'));
const former=JSON.parse(fs.readFileSync(formerPath,'utf8'));
const selected=JSON.parse(fs.readFileSync(selectedPath,'utf8'));
const profileBlob='d37a83faa5ee2164c66c3ac2c6a1eb042bfcda11';

/** Owner-pinned, observer-only verification before building or executing games. */
function inspect(){
  const frozen=inspectTransport();
  assert.equal(gitBlobSha(fs.readFileSync(profilePath)),profileBlob);
  assert.equal(profile.schema,'agent22-rank5-mobility-mechanism-ablation-v1');
  assert.equal(profile.originalObservationRunId,41575101335);
  assert.equal(profile.pinnedEarlierTransportManifestSha,
    gitBlobSha(fs.readFileSync(formerPath)));
  assert.equal(profile.pinnedSelectedJointProfileSha,
    gitBlobSha(fs.readFileSync(selectedPath)));
  assert.equal(profile.pinnedVendor,selected.pinnedVendor);
  assert.equal(profile.pinnedRunnerSha,former.actualRunnerGitBlobSha);
  assert.equal(profile.pinnedRosterSha,former.original60GitBlobSha);
  assert.deepEqual(profile.registeredTrials,former.registeredTrials);
  assert.equal(profile.expectedNativeAttempts,32);
  assert.equal(profile.expectedCandidateTrials,8);
  assert.equal(profile.expectedModes,4);
  assert.deepEqual(profile.controlAndAblations.map(x=>x.name),[
    'full-selected-joint92-control',
    'ablate-owner-dce-mew-mobility',
    'ablate-owner-flexible-paid-retreat',
    'ablate-both-owner-retreat-frontiers']);
  for(const mode of profile.controlAndAblations){
    assert.equal(typeof mode.disableDce,'boolean');
    assert.equal(typeof mode.disableFlexible,'boolean');
    assert.deepEqual(mode.options,{
      ...selected.policyOptions,
      actorDceMewMobilityRoot:!mode.disableDce,
      actorFlexiblePaidRetreatRoot:!mode.disableFlexible
    });
    assert.equal(mode.options.nativeRootActionLimit,260);
    assert.equal(mode.options.actorOnlySingleSearch,false);
    assert.equal(mode.options.actorHandDiscard,false);
  }
  return {schema:profile.schema,profileGitBlobSha:profileBlob,
    selectedCodeProfileGitBlobSha:frozen.underlyingJointSelectedCodeProfileGitBlobSha,
    printedRosterGitBlobSha:profile.pinnedRosterSha,
    nativeVendor:profile.pinnedVendor,registeredModes:4,
    originalCandidateTrials:8,registeredNativeAttempts:32,
    controlObservedInPriorRun:profile.originalObservationRunId,
    independentNewSeeds:false,developmentOnly:true};
}

/**
 * Compare serialized genuine native root-action records. A differing event
 * proves selected action divergence, not engine/paper legality of either arm.
 */
function earliestDifference(control,other){
  const a=control?.rootActionLedger??[],b=other?.rootActionLedger??[];
  const n=Math.min(a.length,b.length);
  let i=0;
  while(i<n&&JSON.stringify(a[i])===JSON.stringify(b[i]))i++;
  if(i===n&&a.length===b.length)return null;
  const left=a[i]??null,right=b[i]??null;
  return {index:i,priorRoot:Math.max(0,i-1),
    control:left,ablation:right,
    controlRootAction:left?.action??null,
    ablatedRootAction:right?.action??null,
    controlActorSeat:left?.playerSlot??null,
    ablatedActorSeat:right?.playerSlot??null,
    globalTurn:left?.turnBefore??right?.turnBefore??null};
}

function settledAttacks(row){
  const hits=row.sourceAttackSettlement?.attacks;
  return Array.isArray(hits)?hits.filter(x=>
    x.attackName==='Cross Fusion Strike'&&
    x.settledPromptChain===true&&!x.settlementCrossesClockReset):[];
}

function record(mode,row){
  const attacks=settledAttacks(row);
  const disposition=classifyNativeAttempt(row);
  return {mode,trialId:row.trial?.id??null,
    sourceSeat:row.sourceSeat??null,
    candidateSeat:row.candidateSeat??null,
    seed:row.trial?.seed??null,
    sourcePhysicalDeal:row.sourceDealFingerprint??null,
    actualStarterSeat:row.actualStarterSeat??null,
    nativeDisposition:disposition.kind,
    settledCrossFusionCount:attacks.length,
    firstSettledCrossFusion:attacks.length?{
      turnBefore:attacks[0].turnBefore,
      actionOrdinal:attacks[0].actionOrdinal,
      prizesBefore:attacks[0].prizesBefore,
      prizesAfter:attacks[0].prizesAfter}:null,
    paperAndTournamentQualified:false};
}

function atomicSave(data){
  const lock=outputPath+'.lock';
  const fd=fs.openSync(lock,'wx',0o600);
  const temp=outputPath+'.tmp.'+process.pid;
  try{
    fs.writeFileSync(temp,JSON.stringify(data,null,2)+'\n',{flag:'wx'});
    const open=fs.openSync(temp,'r');
    try{fs.fsyncSync(open);}finally{fs.closeSync(open);}
    fs.renameSync(temp,outputPath);
  }finally{
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
}

function execute(){
  const preflight=inspect();
  const {runDevelopment}=
    require('./agent41-bilateral-v2-development.cjs');
  const flag='AGENT4_NATIVE_PAYMENT_RECEIPT_DEV';
  assert.equal(process.env[flag],undefined);
  process.env[flag]='true';
  const modes=[];
  try{
    for(const mode of profile.controlAndAblations){
      const raw=runDevelopment({...mode.options,
        registeredTrials:profile.registeredTrials,
        registeredFrameName:profile.schema+'-common-physical-frame'});
      assert.equal(raw.rows.length,profile.expectedCandidateTrials);
      modes.push({mode:mode.name,raw,records:raw.rows.map(x=>record(mode.name,x))});
    }
  }finally{delete process.env[flag];}
  const comparisons=[];
  for(const trial of profile.registeredTrials){
    const original=modes[0].raw.rows.find(x=>x.trial?.id===trial.id);
    const c=modes[0].records.find(x=>x.trialId===trial.id);
    assert.ok(original&&c);
    for(let i=1;i<modes.length;i++){
      const actual=modes[i].raw.rows.find(x=>x.trial?.id===trial.id);
      const a=modes[i].records.find(x=>x.trialId===trial.id);
      assert.ok(actual&&a);
      comparisons.push({trialId:trial.id,ablatedMode:modes[i].mode,
        sourceDealSame:Boolean(c.sourcePhysicalDeal&&
          a.sourcePhysicalDeal===c.sourcePhysicalDeal),
        actualStarterSame:c.actualStarterSeat!==null&&
          a.actualStarterSeat===c.actualStarterSeat,
        controlSourceAttacks:c.settledCrossFusionCount,
        ablatedSourceAttacks:a.settledCrossFusionCount,
        controlDisposition:c.nativeDisposition,
        ablatedDisposition:a.nativeDisposition,
        firstRootDifference:earliestDifference(original,actual)});
    }
  }
  const completed=modes.reduce((n,x)=>n+x.records.length,0);
  const summary={
    registeredAttempts:profile.expectedNativeAttempts,
    attempted:completed,
    allSourceDealMatched:comparisons.every(x=>x.sourceDealSame),
    allActualStartersMatched:comparisons.every(x=>x.actualStarterSame),
    sourceDealMatchedPairs:comparisons.filter(x=>x.sourceDealSame).length,
    totalPairs:comparisons.length,
    settledCrossFusionByMode:modes.map(x=>({
      mode:x.mode,attacks:x.records.reduce((n,r)=>n+r.settledCrossFusionCount,0),
      attempts:x.records.length})),
    firstDifferencesOnRepeat1SourceSeat0:comparisons.filter(x=>
      x.trialId.startsWith('5:1:B:')).map(x=>({
        trial:x.trialId,ablation:x.ablatedMode,
        before:x.firstRootDifference?.controlRootAction??null,
        after:x.firstRootDifference?.ablatedRootAction??null,
        ordinal:x.firstRootDifference?.index??null,
        sourceAttacks:x.ablatedSourceAttacks
      }))
  };
  const out={schema:'agent22-rank5-native-mobility-ablation-result-v1',
    preflight,fullRawModes:modes,matchedPolicyComparisons:comparisons,
    summary,competitiveQualifiedGames:0,
    fullPaperRuleAudit:false,clockAndOpponentPolicyQualified:false,
    inference:'Retrospective mechanistic owner-root ablation, no game win-rate'};
  atomicSave(out);
  process.stdout.write(JSON.stringify(summary)+'\n');
  assert.equal(completed,32);
  return out;
}

if(require.main===module){
  if(process.argv.includes('--inspect-only'))
    process.stdout.write(JSON.stringify(inspect(),null,2)+'\n');
  else execute();
}
module.exports={inspect,earliestDifference,settledAttacks,record,execute};
