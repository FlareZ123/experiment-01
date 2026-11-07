'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash,randomUUID}=require('node:crypto');

const registration=require('../../results/aichi-2026/registrations/agent36-issue25-common-v9-vip-aba-20261107.json');
const {runSelectedIssue25V0,hashRegisteredFile}=
  require('./agent36-issue25-selected-v0.cjs');
const {runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {withStewardOwnerPromptFrontier}=
  require('./agent36-issue25-steward-selected-v4.cjs');
const {withStewardInnermostOwnerPrompts}=
  require('./agent36-issue25-steward-innermost-prize-v5.cjs');
const {withCommonOwnerThornsRoot}=
  require('./agent36-issue25-common-v6.cjs');
const {withOwnerVoltAcrossNativeMatches}=
  require('./agent36-issue25-common-v7.cjs');
const {runIssue25V8WithOwnerAbilityPolicy}=
  require('./agent36-issue25-v8-owner-ability-policy.cjs');

const VERSION='agent36-issue25-common-v9-vip-aba-240root-v1';
const ROOT_LIMIT=240;
const ENV='AGENT9_BATTLE_VIP_AFTER_PASS_DEV';
const PHASES=Object.freeze(['A','B','A2']);
const HASH_PATHS=Object.freeze([
  'simulation/evaluation/agent36-issue25-common-v9-vip-aba.cjs',
  'results/aichi-2026/registrations/agent36-issue25-common-v9-vip-aba-20261107.json',
  'simulation/evaluation/agent36-issue25-common-v8.cjs',
  'simulation/evaluation/agent36-issue25-v8-owner-ability-policy.cjs',
  'simulation/evaluation/agent32-issue25-v8-telepath-development.cjs',
  'simulation/evaluation/agent36-issue25-selected-v0.cjs',
  'simulation/evaluation/agent41-bilateral-v2-development.cjs',
  'simulation/evaluation/agent36-issue25-steward-selected-v4.cjs',
  'simulation/evaluation/agent36-issue25-steward-innermost-prize-v5.cjs',
  'simulation/evaluation/agent36-issue25-common-v6.cjs',
  'simulation/evaluation/agent36-issue25-common-v7.cjs',
  'simulation/twinleaf/agent7-canonical-actor-composition.cjs',
  'simulation/twinleaf/agent9-battle-vip-owner-after-pass.cjs',
  'simulation/twinleaf/agent36-owner-ability-confirm-policy.cjs',
  'simulation/twinleaf/agent1-radiant-zero-gate-hook.cjs',
  'simulation/twinleaf/agent8-owner-telepathic-bench-search.cjs',
  'simulation/twinleaf/prompt-integrity.cjs',
  'tests/agent16-issue25-canonical-vip-v11.native.test.cjs',
  'tests/agent36-owner-ability-confirm-policy.test.cjs',
  'tests/agent36-v8-owner-ability-policy.native.test.cjs',
  '.github/workflows/agent36-bilateral-competence-v9.yml'
]);

/** @returns {object[]} Frozen registered contexts in their committed order. */
function trials(){
  assert.equal(registration.schema,
    'agent36-issue25-common-v9-vip-aba-240root-v1');
  assert.equal(registration.maxNativeRootActionsPerArm,ROOT_LIMIT);
  assert.deepEqual(registration.sourceOriginalRanks,[6,11]);
  assert.deepEqual(registration.phases.map(x=>x.id),PHASES);
  assert.equal(registration.trials.length,4);
  const expected=registration.groups.flatMap(group=>
    registration.contendingPrintedSixties.map(candidateId=>({
      ...group,candidateId,
      id:[group.rank,group.repeat,group.candidateSlot,candidateId].join(':')
    })));
  assert.deepEqual(registration.trials,expected);
  assert.equal(new Set(expected.map(x=>x.id)).size,expected.length);
  for(const row of expected){
    assert.ok(row.rank===6||row.rank===11);
    assert.ok(row.candidateSlot==='A'||row.candidateSlot==='B');
    assert.ok(Number.isSafeInteger(row.seed)&&row.seed>=0&&row.seed<=0xffffffff);
  }
  assert.equal(expected.find(x=>x.rank===6).candidateSlot,'B');
  assert.equal(expected.find(x=>x.rank===11).candidateSlot,'A');
  return expected.map(x=>({...x}));
}

/**
 * Scope one process-global opt-in to one synchronous phase and restore it on
 * both success and failure.
 * @template T
 * @param {boolean} enabled
 * @param {()=>T} run
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {T}
 */
function withVipFlag(enabled,run,env=process.env){
  assert.equal(typeof enabled,'boolean');
  assert.equal(typeof run,'function');
  const prior=env[ENV];
  if(enabled)env[ENV]='true';
  else delete env[ENV];
  try{return run();}
  finally{
    if(prior===undefined)delete env[ENV];
    else env[ENV]=prior;
  }
}

/** @param {object} row */
function nativeVipOutcome(row){
  const audit=row.actorOnlyDecisionCoverage?.detailedComponentAudits
    ?.ownerVipAfterPass??null;
  return {
    id:row.trial?.id??row.id??null,
    policyRecorded:audit!==null,
    originalPassRoots:audit?.originalPassRoots??null,
    eligiblePassRoots:audit?.eligiblePassRoots??null,
    acceptedItems:audit?.acceptedItems??null,
    rejectedItems:audit?.rejectedItems??null,
    acceptedSearches:audit?.acceptedSearches??null,
    rejectedSearches:audit?.rejectedSearches??null,
    nativeBenchConfirmed:audit?.nativeBenchConfirmed??null,
    nativeBenchUnconfirmed:audit?.nativeBenchUnconfirmed??null,
    selectedBasicCopies:audit?.selectedBasics??null,
    unresolvedOwnerSearches:audit?.unresolvedOwnerSearches??null,
    bySeat:audit?.bySeat??null,
    rootActionCount:row.rootActionLedger?.length??
      row.nativeAbortEvidence?.rootActionLedger?.length??null
  };
}

/**
 * Find the strongest available public native root ledger without inventing
 * one for rows whose execution aborted before a ledger was preserved.
 * @param {object} row
 * @returns {object[]|null}
 */
function rootLedger(row){
  const direct=row.rootActionLedger;
  const archived=row.nativePublicRootArchive?.rootActionLedger;
  const aborted=row.nativeAbortEvidence?.rootActionLedger??
    row.nativeAbortProvenance?.rootActionLedger??null;
  if(Array.isArray(direct))return direct;
  if(Array.isArray(archived))return archived;
  if(Array.isArray(aborted))return aborted;
  return null;
}

/** @param {object[]|null} ledger */
function ledgerSha256(ledger){
  return Array.isArray(ledger)?
    createHash('sha256').update(JSON.stringify(ledger)).digest('hex'):null;
}

/** @param {object|null} event */
function actionKind(event){
  if(!event||typeof event!=='object')return null;
  for(const key of ['actionType','action','type','kind','name','constructorName']){
    if(typeof event[key]==='string')return event[key];
  }
  return event.constructor?.name??null;
}

/**
 * Compare public action ledgers without copying complete private observations.
 * @param {object} before
 * @param {object} after
 */
function firstRootDifference(before,after){
  const a=rootLedger(before),b=rootLedger(after);
  if(!Array.isArray(a)||!Array.isArray(b))
    return {available:false,index:null,beforeKind:null,afterKind:null,
      afterContainsVip:false,beforeContainsPass:false};
  const n=Math.min(a.length,b.length);
  for(let i=0;i<n;i++){
    if(JSON.stringify(a[i])!==JSON.stringify(b[i])){
      const left=JSON.stringify(a[i]);
      const right=JSON.stringify(b[i]);
      return {
        available:true,index:i+1,
        beforeKind:actionKind(a[i]),afterKind:actionKind(b[i]),
        beforeEventSha256:createHash('sha256').update(left).digest('hex'),
        afterEventSha256:createHash('sha256').update(right).digest('hex'),
        afterContainsVip:right.includes('Battle VIP Pass FST'),
        beforeContainsPass:left.includes('PassTurnAction')
      };
    }
  }
  if(a.length!==b.length){
    const left=a[n-1]??null,right=b[n-1]??null;
    const leftText=JSON.stringify(left),rightText=JSON.stringify(right);
    return {
      available:true,index:n+1,
      beforeKind:actionKind(left),afterKind:actionKind(right),
      beforeEventSha256:left===null?null:
        createHash('sha256').update(leftText).digest('hex'),
      afterEventSha256:right===null?null:
        createHash('sha256').update(rightText).digest('hex'),
      afterContainsVip:rightText?.includes('Battle VIP Pass FST')??false,
      beforeContainsPass:leftText?.includes('PassTurnAction')??false
    };
  }
  return {available:true,index:null,beforeKind:null,afterKind:null,
    afterContainsVip:false,beforeContainsPass:false};
}

/**
 * Preserve native outcome distinctions. A terminal is still unqualified.
 * @param {object} row
 * @param {object|null} attemptedStatus
 */
function summarizeNativeAttempt(row,attemptedStatus=null){
  const ledger=rootLedger(row);
  const acceptedNativeRootCount=row.rootActionCount??
    (Array.isArray(ledger)?ledger.length:
      attemptedStatus?.nativeRootActionCount??null);
  const finished=typeof row.finished==='boolean'?row.finished:null;
  const actionCount=Number.isSafeInteger(row.actionCount)?row.actionCount:null;
  const sourceSeat=row.sourceSeat??attemptedStatus?.originalSourceSeat??
    row.nativeAbortProvenance?.sourceSeat??null;
  const candidateSeat=row.candidateSeat??attemptedStatus?.candidateSeat??
    row.nativeAbortProvenance?.candidateSeat??null;
  const aborted=attemptedStatus?.status==='engine-error'||
    row.nativeAbortProvenance?.aborted===true||
    row.nativeAbortEvidence?.aborted===true||
    row.error!==undefined&&row.error!==null;
  const nativeOutcome=aborted?'engine-error':
    finished===true?'native-terminal':
    finished===false&&acceptedNativeRootCount===ROOT_LIMIT&&
      actionCount===ROOT_LIMIT?'action-cap':'returned-unqualified';
  return {
    id:row.trial?.id??row.id??null,
    nativeOutcome,
    acceptedNativeRootCount,actionCount,finished,
    winner:row.winner??null,endReason:row.endReason??null,
    finalPrizes:row.finalPrizes??null,finalBoard:row.finalBoard??null,
    sourceSeat,candidateSeat,
    sourceDealFingerprint:row.sourceDealFingerprint??null,
    fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
    declaredSourceAttacks:row.sourceAttackSettlement?.attacks?.length??null,
    settledSourceAttacks:row.sourceAttackSettlement?.attacks?.filter(x=>
      x.settledPromptChain===true).length??null,
    rootLedgerSha256:ledgerSha256(ledger),
    paperQualified:false
  };
}

/**
 * @param {object[]} phases
 * @returns {object[]} One matched A/B/A comparison per registered trial.
 */
function compare(phases){
  assert.equal(phases.length,3);
  assert.deepEqual(phases.map(x=>x.phase),PHASES);
  const maps=phases.map(phase=>new Map(
    (phase.rawDevelopment?.rows??[]).map(row=>[
      row.trial?.id??row.id??null,row
    ])
  ));
  return trials().map(trial=>{
    const a=maps[0].get(trial.id)??null;
    const b=maps[1].get(trial.id)??null;
    const a2=maps[2].get(trial.id)??null;
    const all= [a,b,a2];
    const fingerprints=all.map(row=>({
      source:row?.sourceDealFingerprint??null,
      full:row?.fullPhysicalDealFingerprint??null
    }));
    const physicalOpeningMatchedAcrossABA=all.every(Boolean)&&
      fingerprints.every(x=>x.source!==null&&x.full!==null)&&
      fingerprints.every(x=>x.source===fingerprints[0].source&&
        x.full===fingerprints[0].full);
    const controls= a&&a2 ? firstRootDifference(a,a2):null;
    const controlsRepeatedExactly=Boolean(a&&a2&&
      physicalOpeningMatchedAcrossABA&&
      controls?.available===true&&controls.index===null&&
      ledgerSha256(rootLedger(a))===ledgerSha256(rootLedger(a2))&&
      a.winner===a2.winner&&a.finished===a2.finished);
    const treatment=a&&b?firstRootDifference(a,b):null;
    const changed=Boolean(treatment?.available===true&&
      treatment.index!==null);
    const firstTreatmentDifferenceIsVip=Boolean(changed&&
      treatment.afterContainsVip&&treatment.beforeContainsPass);
    const vip=nativeVipOutcome(b??{});
    return {
      id:trial.id,rank:trial.rank,candidateId:trial.candidateId,
      candidateSlot:trial.candidateSlot,seed:trial.seed,
      physicalOpeningMatchedAcrossABA,controlsRepeatedExactly,
      treatmentChanged:changed,
      firstTreatmentDifference:treatment,
      firstTreatmentDifferenceIsVip,
      treatmentNativeOutcome:b? summarizeNativeAttempt(b):null,
      controlNativeOutcome:a? summarizeNativeAttempt(a):null,
      repeatedControlNativeOutcome:a2?summarizeNativeAttempt(a2):null,
      treatmentVipAudit:vip
    };
  });
}

/**
 * Run one phase through the same native common policy and the same owner
 * prompt stack. Only the inner canonical VIP after-Pass flag changes.
 * @param {object} deps
 */
function runRegisteredV9(deps={}){
  const phase=deps.phase;
  assert.ok(PHASES.includes(phase));
  const registered=trials();
  const execute=()=>withCommonOwnerThornsRoot(()=>runSelectedIssue25V0({
    runner:options=>runDevelopment({
      ...options,
      actorOnlyComposition:true,
      sourceIndependentCommonPolicy:true,
      bilateralSpecialEnergyRoot:true,
      nativeAcceptedTargets:true,
      nativeRootActionLimit:ROOT_LIMIT,
      registeredTrials:registered.map(x=>({...x})),
      registeredFrameName:registration.schema,
      allowAdditionalOriginalSourceRanks:true,
      isolatePolicyRandomness:true,
      isolatePhysicalShuffleRandomnessAfterSetup:true
    }),
    layers:{firstBlockedPromptEnvelope:withStewardOwnerPromptFrontier},
    registeredTrialIds:registered.map(x=>x.id),
    nativeRootActionLimit:ROOT_LIMIT
  }),{env:deps.env});
  const voltWrapper=withOwnerVoltAcrossNativeMatches(
    ()=>withStewardInnermostOwnerPrompts(execute,{headless:deps.headless}),
    {headless:deps.headless,voltLayer:deps.voltLayer}
  );
  const selected=voltWrapper.result.result;
  assert.ok(selected?.manifest&&selected?.diagnostic);
  const rows=selected.rawDevelopment?.rows??[];
  const attempted=new Map((selected.diagnostic.attemptedRows??[])
    .map(x=>[x.id,x]));
  const nativeAttempts=rows.map(row=>summarizeNativeAttempt(
    row,attempted.get(row.trial?.id??row.id??null)??null
  ));
  const manifest={
    ...selected.manifest,
    version:VERSION,
    policyEntryPoint:HASH_PATHS[0],
    registrationPath:'results/aichi-2026/registrations/agent36-issue25-common-v9-vip-aba-20261107.json',
    profile:'fresh-seed-ranks6-11-two-candidates-both-source-seats-240root',
    phase,
    vipAfterPassEnabled:phase==='B',
    registeredTrialIds:registered.map(x=>x.id),
    nativeRootActionLimit:ROOT_LIMIT,
    selectedSourceIndependentCommonPolicy:true,
    selectedBilateralSpecialEnergy:true,
    selectedNativeAcceptedTargets:true,
    selectedTelepathOwnerSearch:true,
    selectedOwnerAbilityConfirmPolicy:true,
    selectedOwnerVipAfterPass:phase==='B',
    policyRandomnessIsolated:true,
    physicalShuffleRandomnessIsolatedAfterSetup:true,
    observedGitVendorPinExpected:registration.pinnedTwinleaf,
    fullPaperCardInteractionCertified:false,
    fullFieldOriginalSixtiesAuthenticated:false,
    official25MinuteClockImplemented:false,
    resolvedSourceAndPolicyHashes:[
      ...(selected.manifest.resolvedSourceAndPolicyHashes??[]),
      ...HASH_PATHS.map(hashRegisteredFile)
    ],
    releaseQualified:false,competitiveGamesQualified:0,
    targetWinRate:0.995,targetWinRateDemonstrated:false
  };
  const diagnostic={
    ...selected.diagnostic,
    schema:VERSION,phase,
    nativeAttempts,
    ownerVoltMatchAudit:voltWrapper.audit??null,
    innerOwnerPromptAudit:voltWrapper.result.audit??null,
    nativeVipRows:rows.map(nativeVipOutcome),
    nativeRootLimitActuallyPassedToRunner:ROOT_LIMIT,
    verdict:'DEVELOPMENT-ONLY-NO-COMPETITIVE-ADMISSION',
    competitiveGamesQualified:0,estimatedWinRate:null
  };
  return {manifest,diagnostic,rawDevelopment:selected.rawDevelopment};
}

/**
 * @param {'A'|'B'|'A2'} phase
 * @param {object} [deps]
 */
function runPhase(phase,deps={}){
  const result=withVipFlag(phase==='B',()=>
    runIssue25V8WithOwnerAbilityPolicy({
      runV8:runRegisteredV9,
      v8Deps:{
        phase,headless:deps.headless,
        voltLayer:deps.voltLayer,env:deps.env
      },
      headless:deps.headless
    }));
  const rows=result.rawDevelopment?.rows??[];
  const vipRows=rows.map(nativeVipOutcome);
  return {
    phase,vipAfterPassEnabled:phase==='B',
    manifest:{
      ...result.manifest,
      version:VERSION,phase,
      vipAfterPassEnabled:phase==='B',
      registrationPath:'results/aichi-2026/registrations/agent36-issue25-common-v9-vip-aba-20261107.json',
      resolvedSourceAndPolicyHashes:[
        ...(result.manifest.resolvedSourceAndPolicyHashes??[]),
        ...HASH_PATHS.map(hashRegisteredFile)
      ],
      releaseQualified:false,competitiveGamesQualified:0
    },
    diagnostic:{
      ...result.diagnostic,phase,
      nativeVipRows:vipRows,
      nativeAttempts:(result.rawDevelopment?.rows??[]).map(row=>
        summarizeNativeAttempt(row)),
      verdict:'DEVELOPMENT-ONLY-NO-COMPETITIVE-ADMISSION',
      competitiveGamesQualified:0,estimatedWinRate:null
    },
    rawDevelopment:result.rawDevelopment
  };
}

/** @param {object} phase */
function phaseSummary(phase){
  const rows=phase.diagnostic.nativeAttempts??[];
  const vip=phase.diagnostic.nativeVipRows??[];
  return {
    phase:phase.phase,vipAfterPassEnabled:phase.vipAfterPassEnabled,
    attempts:rows.length,
    nativeTerminals:rows.filter(x=>x.nativeOutcome==='native-terminal').length,
    rootCaps:rows.filter(x=>x.nativeOutcome==='action-cap').length,
    engineErrors:rows.filter(x=>x.nativeOutcome==='engine-error').length,
    acceptedVipItems:vip.reduce((n,x)=>n+(x.acceptedItems??0),0),
    acceptedVipSearches:vip.reduce((n,x)=>n+(x.acceptedSearches??0),0),
    nativeBenchConfirmed:vip.reduce((n,x)=>n+(x.nativeBenchConfirmed??0),0),
    policyAuditRows:vip.filter(x=>x.policyRecorded).length
  };
}

/** Run A/B/A in the exact preregistered order. */
function run(deps={}){
  const execute=deps.phaseRunner??runPhase;
  const phases=PHASES.map(phase=>execute(phase,deps));
  const comparisons=compare(phases);
  const summaries=phases.map(phaseSummary);
  return {
    schema:VERSION,
    registrationPath:'results/aichi-2026/registrations/agent36-issue25-common-v9-vip-aba-20261107.json',
    registration,
    phases,comparisons,
    summary:{
      attempts:phases.reduce((n,x)=>n+(x.diagnostic.nativeAttempts?.length??0),0),
      allRegisteredTrialsReturned:phases.every(x=>
        (x.rawDevelopment?.rows??[]).length===trials().length),
      allPhysicalOpeningsMatchedAcrossABA:comparisons.every(x=>
        x.physicalOpeningMatchedAcrossABA),
      controlsRepeatedExactly:comparisons.every(x=>x.controlsRepeatedExactly),
      treatmentChangedTrialCount:comparisons.filter(x=>x.treatmentChanged).length,
      firstTreatmentDifferenceIsVipCount:comparisons.filter(x=>
        x.firstTreatmentDifferenceIsVip).length,
      phaseSummaries:summaries,
      competitiveGamesQualified:0,
      estimatedWinRate:null,
      targetWinRate:0.995,targetWinRateDemonstrated:false
    },
    releaseQualified:false,competitiveGamesQualified:0,
    estimatedWinRate:null,
    verdict:'DEVELOPMENT-ONLY-NO-COMPETITIVE-ADMISSION'
  };
}

/**
 * Exclusive lock and same-directory atomic renames for the complete archive
 * and its SHA-256 sidecar.
 * @param {object} value
 * @param {string} directory
 */
function writeArchive(value,directory){
  const root=path.resolve(__dirname,'../..');
  const dir=path.resolve(root,directory);
  const relative=path.relative(root,dir);
  assert.ok(relative&&relative!=='..'&&!relative.startsWith('..'+path.sep)&&
    !path.isAbsolute(relative),'Archive directory must remain inside repository');
  fs.mkdirSync(dir,{recursive:true});
  const prefix='agent36-issue25-common-v9-vip-aba';
  const file=path.join(dir,prefix+'.json');
  const digestFile=file+'.sha256';
  const lock=path.join(dir,'.'+prefix+'.lock');
  const tmp=file+'.'+randomUUID()+'.tmp';
  const digestTmp=digestFile+'.'+randomUUID()+'.tmp';
  const fd=fs.openSync(lock,'wx');
  const data=Buffer.from(JSON.stringify(value,null,2)+'\n');
  const digest=createHash('sha256').update(data).digest('hex');
  try{
    fs.writeFileSync(tmp,data,{flag:'wx'});
    fs.renameSync(tmp,file);
    fs.writeFileSync(digestTmp,digest+'  '+prefix+'.json\n',{flag:'wx'});
    fs.renameSync(digestTmp,digestFile);
  }finally{
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    if(fs.existsSync(digestTmp))fs.unlinkSync(digestTmp);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
  return {file:path.relative(root,file),sha256:digest,bytes:data.length};
}

function main(){
  const output=run();
  const saved=writeArchive(output,'artifacts/agent36-v9-vip-aba');
  process.stdout.write(JSON.stringify({
    version:output.schema,
    registeredTrials:trials().length,
    phases:output.summary.phaseSummaries,
    allPhysicalOpeningsMatchedAcrossABA:
      output.summary.allPhysicalOpeningsMatchedAcrossABA,
    controlsRepeatedExactly:output.summary.controlsRepeatedExactly,
    treatmentChangedTrialCount:output.summary.treatmentChangedTrialCount,
    firstTreatmentDifferenceIsVipCount:
      output.summary.firstTreatmentDifferenceIsVipCount,
    competitiveGamesQualified:0,
    archive:saved
  },null,2)+'\n');
}

if(require.main===module)main();

module.exports={
  VERSION,ROOT_LIMIT,ENV,PHASES,HASH_PATHS,trials,withVipFlag,
  nativeVipOutcome,rootLedger,ledgerSha256,actionKind,firstRootDifference,
  summarizeNativeAttempt,compare,runRegisteredV9,runPhase,phaseSummary,
  run,writeArchive
};
