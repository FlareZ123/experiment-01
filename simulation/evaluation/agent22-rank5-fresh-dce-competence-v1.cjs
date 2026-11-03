'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {inspectProfile,gitBlobSha}=
  require('./agent41-joint-source-r5-r11-v1.cjs');
const {classifyNativeAttempt}=
  require('./agent41-native-attempt-disposition.cjs');

const repo=path.resolve(__dirname,'../..');
const manifestPath=path.join(__dirname,'agent22-rank5-fresh-dce-competence-v1.json');
const selectedPath=path.join(__dirname,'agent41-joint-source-r5-r11-v1.json');
const outputPath=path.join(repo,'agent22-rank5-fresh-dce-competence-v1-output.json');
const m=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
const selected=JSON.parse(fs.readFileSync(selectedPath,'utf8'));
const manifestBlob='b662cbf32997c383c4065c30ff1e56ecfd72d0fb';

function inspect(){
  const native=inspectProfile();
  assert.equal(gitBlobSha(fs.readFileSync(manifestPath)),manifestBlob);
  assert.equal(m.schema,'agent22-rank5-fresh-mew-dce-mobility-competence-v1');
  assert.equal(m.registeredTrialCount,8);
  assert.equal(m.expectedNativeAttempts,16);
  assert.equal(m.randomGroups.length,4);
  assert.equal(m.pinnedRootRunnerGitBlobSha,
    selected.pinnedSourceFiles['simulation/evaluation/agent41-bilateral-v2-development.cjs']);
  assert.equal(m.pinnedJointSelectedProfileGitBlobSha,
    gitBlobSha(fs.readFileSync(selectedPath)));
  assert.equal(m.pinnedNativeEngine,selected.pinnedVendor);
  assert.equal(m.pinnedOriginalRosterGitBlobSha,
    selected.pinnedSourceFiles['results/aichi-2026/full-decklists.json']);
  const seeds=new Set(m.randomGroups.map(x=>x.seed));
  assert.equal(seeds.size,4);
  assert.ok(![734170394,1297346081,198157155,3062107528,
    3423099534,561933954].some(x=>seeds.has(x)));
  for(const item of m.registeredTrials){
    assert.equal(item.rank,5);
    assert.ok(m.randomGroups.some(x=>
      x.seed===item.seed&&x.candidateSeat===item.candidateSlot&&
      x.repeat===item.repeat));
    assert.equal(item.id,[item.rank,item.repeat,item.candidateSlot,
      item.candidateId].join(':'));
  }
  assert.deepEqual(m.registeredTrials.reduce((a,x)=>{
    a[x.repeat+':'+x.candidateSlot]=(a[x.repeat+':'+x.candidateSlot]??0)+1;
    return a;
  },{}),{'0:A':2,'0:B':2,'1:A':2,'1:B':2});
  return {schema:m.schema,manifestBlob,selectedPolicyBlob:native.profileGitBlob,
    originalRosterBlob:m.pinnedOriginalRosterGitBlobSha,
    frozenRunnerBlob:m.pinnedRootRunnerGitBlobSha,
    engine:m.pinnedNativeEngine,
    independentFreshPhysicalSeedGroups:4,
    candidatePhysicalTrials:8,expectedAttempts:16,
    paperQualified:false};
}

/** First authentic native root event difference, not hypothetical selected proposal. */
function firstDifference(a,b){
  const x=a.rootActionLedger??[],y=b.rootActionLedger??[];
  let i=0;
  while(i<Math.min(x.length,y.length)&&
    JSON.stringify(x[i])===JSON.stringify(y[i]))i++;
  if(i===x.length&&i===y.length)return null;
  return {ordinal:i,
    control:x[i]??null,ablation:y[i]??null,
    firstControlName:x[i]?.action??null,
    firstAblatedName:y[i]?.action??null,
    actorSeat:x[i]?.playerSlot??y[i]?.playerSlot??null,
    turn:x[i]?.turnBefore??y[i]?.turnBefore??null};
}

function resultSummary(row){
  const attacks=Array.isArray(row.sourceAttackSettlement?.attacks)?
    row.sourceAttackSettlement.attacks.filter(a=>
      a.attackName==='Cross Fusion Strike'&&
      a.settledPromptChain===true&&
      a.settlementCrossesClockReset!==true):[];
  return {id:row.trial?.id??null,
    rank:row.trial?.rank??null,
    originalSourceSeat:row.sourceSeat??null,
    actualStarterSeat:row.actualStarterSeat??null,
    sourceDealFingerprint:row.sourceDealFingerprint??null,
    originalPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
    nativeDisposition:classifyNativeAttempt(row).kind,
    rootLedgerSha:row.rootActionLedgerSha256??null,
    settledCrossFusionAttacks:attacks.length,
    attacks:attacks.map(a=>({turn:a.turnBefore,
      ordinal:a.actionOrdinal,
      prizesBefore:a.prizesBefore,
      prizesAfter:a.prizesAfter})),
    sourceGenuinePaidRetreatRoots:(row.rootActionLedger??[])
      .filter(x=>x.playerSlot===row.sourceSeat&&x.action==='RetreatAction'
        &&x.pendingPrompt===null).length,
    sourcePostPassObserved:row.sourceOwnerPostPassMobility?.totalSourcePasses??null,
    nativeSourceAttackChainQualifiedForPaper:false};
}

function lockedSave(data){
  const lock=outputPath+'.lock';
  const fd=fs.openSync(lock,'wx',0o600);
  const temp=outputPath+'.tmp.'+process.pid;
  try{
    fs.writeFileSync(temp,JSON.stringify(data,null,2)+'\n',{flag:'wx'});
    const o=fs.openSync(temp,'r');
    try{fs.fsyncSync(o);}finally{fs.closeSync(o);}
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
  const ambient='AGENT4_NATIVE_PAYMENT_RECEIPT_DEV';
  assert.equal(process.env[ambient],undefined);
  process.env[ambient]='true';
  let raw;
  try{
    raw=[{name:m.control.name,dceOn:true},
      {name:m.ablation.name,dceOn:false}].map(mode=>{
        const output=runDevelopment({...selected.policyOptions,
          actorDceMewMobilityRoot:mode.dceOn,
          registeredTrials:m.registeredTrials,
          registeredFrameName:m.registeredFrameName});
        return {...mode,output,rows:output.rows.map(resultSummary)};
      });
  }finally{delete process.env[ambient];}
  const pairs=m.registeredTrials.map(trial=>{
    const controlRow=raw[0].output.rows.find(x=>x.trial?.id===trial.id);
    const ablatedRow=raw[1].output.rows.find(x=>x.trial?.id===trial.id);
    assert.ok(controlRow&&ablatedRow);
    const c=raw[0].rows.find(x=>x.id===trial.id);
    const a=raw[1].rows.find(x=>x.id===trial.id);
    return {id:trial.id,
      sameSourcePhysicalDeal:Boolean(c.sourceDealFingerprint&&
        c.sourceDealFingerprint===a.sourceDealFingerprint),
      sameActualStartingPlayer:c.actualStarterSeat!==null&&
        c.actualStarterSeat===a.actualStarterSeat,
      controlAttacks:c.settledCrossFusionAttacks,
      ablatedAttacks:a.settledCrossFusionAttacks,
      controlRetreats:c.sourceGenuinePaidRetreatRoots,
      ablatedRetreats:a.sourceGenuinePaidRetreatRoots,
      firstNativeRootDifference:firstDifference(controlRow,ablatedRow),
      sourceDispositionControl:c.nativeDisposition,
      sourceDispositionAblated:a.nativeDisposition};
  });
  const summarized={registeredOriginalPhysicalGroups:m.registeredGroupCount,
    attempted:raw.reduce((n,x)=>n+x.rows.length,0),
    physicalSourcePairsMatch:pairs.filter(x=>x.sameSourcePhysicalDeal).length,
    actualStarterPairsMatch:pairs.filter(x=>x.sameActualStartingPlayer).length,
    totalSourcePairs:pairs.length,
    byMode:raw.map(x=>({mode:x.name,attempted:x.rows.length,
      settledCrossFusion:x.rows.reduce((n,r)=>n+r.settledCrossFusionAttacks,0),
      originalSourceNativeRetreats:x.rows.reduce(
        (n,r)=>n+r.sourceGenuinePaidRetreatRoots,0),
      dispositionCounts:x.rows.reduce((acc,r)=>{
        acc[r.nativeDisposition]=(acc[r.nativeDisposition]??0)+1;return acc;},{}),
      sourceAttackPositiveAttempts:x.rows.filter(r=>r.settledCrossFusionAttacks>0).length})),
    allPositiveAndNoOpportunityCasesRetained:true,
    noCompetitiveGameOutcomes:true};
  const preserved={schema:'agent22-fresh-rank5-dce-native-source-competence-v1',
    preflight,registeredManifest:m,rawModes:raw,pairs,summary:summarized,
    independentSourceSeedGroups:4,
    opponentPolicyAndNativeEffectsUnqualified:true,
    competitiveQualifiedGames:0};
  lockedSave(preserved);
  process.stdout.write(JSON.stringify({summary:summarized,
    pairs:pairs.map(p=>({id:p.id,sourceMatched:p.sameSourcePhysicalDeal,
      controlAttacks:p.controlAttacks,ablatedAttacks:p.ablatedAttacks,
      controlRetreats:p.controlRetreats,ablatedRetreats:p.ablatedRetreats,
      firstDivergence:p.firstNativeRootDifference?.firstControlName??null}))})+'\n');
  assert.equal(summarized.attempted,16);
  return preserved;
}
if(require.main===module){
  if(process.argv.includes('--inspect-only'))
    process.stdout.write(JSON.stringify(inspect(),null,2)+'\n');
  else execute();
}
module.exports={inspect,firstDifference,resultSummary,execute};
