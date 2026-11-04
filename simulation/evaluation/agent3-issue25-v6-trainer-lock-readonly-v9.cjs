'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {runMirroredIssue25V6}=
  require('./agent1-issue25-mirrored-r6-r11-v6.cjs');
const {hashRegisteredFile}=
  require('./agent36-issue25-selected-v0.cjs');

const VERSION='agent3-issue25-readonly-owner-trainer-and-passive-pressure-v9';
const ENTRY='simulation/evaluation/agent3-issue25-v6-trainer-lock-readonly-v9.cjs';
const REGISTRATION=
  'results/aichi-2026/registrations/agent3-issue25-v6-readonly-opportunity-pressure-retro-20261104.json';
const ROOT=path.resolve(__dirname,'../..');
const HASH_PATHS=[
  ENTRY,REGISTRATION,
  'simulation/twinleaf/agent29-bilateral-owner-trainer-frontier.cjs',
  'simulation/twinleaf/agent5-native-owner-trainer-frontier-observer.cjs',
  'simulation/twinleaf/agent39-live-initialization-window.cjs',
  'simulation/evaluation/agent41-passive-rank6-pressure.cjs',
  'tests/agent3-issue25-v6-trainer-lock-readonly-v9.test.cjs',
  'tests/agent3-issue25-v6-trainer-lock-readonly-v9.native.test.cjs'
];
const sha256=value=>createHash('sha256')
  .update(JSON.stringify(value)).digest('hex');

/**
 * Compare actual source-deal, complete opening, public roots, statuses, seat
 * and starter with the fixed downloaded v6 observation. Deliberate read-only
 * instrumentation may be called A/A only if all eight physical experiments
 * are genuinely identical. Native root ledgers must not be reconstructed.
 *
 * @param {object} executed An actual v6 runner return with observer flags.
 * @param {object} prereg Frozen expected v6 full public native evidence.
 * @returns {object} Fail-closed retrospective diagnostic.
 */
function auditReadOnlyReplay(executed,prereg){
  const {manifest,diagnostic,rawDevelopment}=executed;
  assert.ok(prereg&&prereg.schema===
    'agent3-issue25-v6-readonly-opportunity-pressure-replay-v1');
  assert.equal(prereg.baselineRecordedRows.length,8);
  assert.ok(manifest.sourceIndependentCommonPolicy===true);
  assert.equal(manifest.developmentTrialCount,8);
  assert.ok(Array.isArray(diagnostic?.registered));
  assert.ok(Array.isArray(diagnostic?.attemptedRows));
  const ids=prereg.baselineRecordedRows.map(r=>r.id);
  assert.equal(new Set(ids).size,8);
  assert.deepEqual(diagnostic.registered,ids);
  assert.equal(diagnostic.rawRowIdentityReconciliation?.exactlyReconciled,true);
  const statuses=new Map(diagnostic.attemptedRows.map(row=>[row.id,row]));
  assert.equal(statuses.size,8);
  const rawRows=rawDevelopment?.rows;
  assert.ok(Array.isArray(rawRows)&&rawRows.length===8);
  const rawById=new Map();
  for(const raw of rawRows){
    const id=raw.trial?.id??raw.id??null;
    assert.equal(typeof id,'string');
    if(raw.trial?.id&&raw.id)assert.equal(raw.trial.id,raw.id);
    assert.ok(!rawById.has(id));
    rawById.set(id,raw);
  }
  assert.deepEqual([...rawById.keys()].sort(),[...ids].sort());
  const rows=prereg.baselineRecordedRows.map(base=>{
    const raw=rawById.get(base.id);
    const status=statuses.get(base.id);
    assert.ok(raw&&status);
    const actions=raw.rootActionLedger??
      raw.nativePublicRootArchive?.rootActionLedger??
      raw.nativeAbortEvidence?.rootActionLedger??null;
    const realRoots=Array.isArray(actions)?actions:null;
    const sourceSeat=status.originalSourceSeat??
      status.nativeAbortProvenance?.sourceSeat??null;
    const ownerAudit=raw.actorOnlyDecisionCoverage?.ownerTrainerFrontierAudit??null;
    const frontier=ownerAudit?.summary??null;
    const actor=sourceSeat===0||sourceSeat===1?
      frontier?.bySeat?.[sourceSeat]??null:null;
    const other=sourceSeat===0||sourceSeat===1?
      frontier?.bySeat?.[1-sourceSeat]??null:null;
    const observed={
      sourceDealFingerprint:status.sourceDealFingerprint??null,
      fullPhysicalDealFingerprint:status.fullPhysicalDealFingerprint??null,
      publicRootLedgerSha256:realRoots===null?null:sha256(realRoots),
      nativeRootCount:realRoots?.length??null,
      status:status.status??null,
      actualSourceSeat:sourceSeat,
      actualFirstPlayer:status.actualStarterSeat??null
    };
    const fields=Object.keys(observed);
    const checks=Object.fromEntries(fields.map(field=>[
      field,observed[field]===base[field]
    ]));
    const rawOwnerAuditPresent=ownerAudit!==null;
    const observerReadOnly=ownerAudit?.summary?.readOnly??null;
    return {
      id:base.id,rank:Number(base.id.split(':')[0]),
      baselineExactChecks:checks,
      allBaselineNativeFieldsEqual:fields.every(field=>checks[field]),
      originalNativeSourceSeatProvenance:
        status.originalSourceSeat===null?
          'attested-abort-only':'actual-row',
      nativeAcceptedRoots:observed.nativeRootCount,
      nativeDisposition:observed.status,
      observedSourceSeat:sourceSeat,
      observedFirstPlayer:observed.actualFirstPlayer,
      ownerTrainerFrontier:{
        observed:rawOwnerAuditPresent,
        readOnly:observerReadOnly,
        observedRealOwnerRoots:frontier?.observedRootCount??null,
        omittedRoots:frontier?.rootsOmittedDueToCap??null,
        nativeCatalogPrintings:frontier?.nativeCatalogPrintings??null,
        sourceSeat:actor,
        candidateSeat:other,
        sourceK0GuaranteedVipPasses:sourceSeat===null?null:
          ownerAudit?.roots?.filter(e=>e.seat===sourceSeat&&
            e.guaranteedK0VipPassed===true).length??null,
        rawOwnerPrivateHandNamesPublished:false,
        offeredByUpstreamEnumeratorMeansPaperLegal:false
      },
      passiveOrPowerLock:{
        rank6:raw.rank6PassivePressure??null,
        rank6NativeBoundaries:raw.initializationWindowAudit?{
          sourceTurn1:raw.initializationWindowAudit.sourceTurn1!==null,
          candidateTurn2:raw.initializationWindowAudit.candidateTurn2!==null,
          sourceReturnTurn3:raw.initializationWindowAudit.sourceReturnTurn3!==null,
          nativeCandidateTurn2Powers:
            raw.initializationWindowAudit.candidateTurn2
              ?.nativePowerChecks?.map(power=>({
                printing:power.printing,powerName:power.powerName,
                blocked:power.blocked
              }))??null
        }:null,
        rank11NativeObserverPresent:raw.garbotoxinWindowAudit!==undefined
      }
    };
  });
  return {
    schema:VERSION+'-retrospective-audit-v1',
    status:'NATIVE_DEVELOPMENT_ONLY',
    baselineNativeRunId:prereg.baselineNativeRunId,
    baselineJsonSha256:prereg.baselineJsonSha256,
    originalV6Registration:prereg.baselineTrialRegistration,
    actualObservedEngineGitRevision:manifest.observedTwinleafGitCommit??null,
    actualObservedRepositoryGitRevision:manifest.observedRepositoryGitCommit??null,
    actualRunnerSourceIndependent:manifest.actualRunnerConfirmedOption===true,
    actualObservedOwnerTrainerFlag:rawRows.every(row=>
      row.actorOnlyDecisionCoverage?.ownerGenericTrainerFrontierOptIn===true),
    actualObservedOwnerTrainerFlagOnUnabortedRows:rawRows.every(row=>
      statuses.get(row.trial?.id??row.id)?.status==='engine-error'||
      row.actorOnlyDecisionCoverage?.ownerGenericTrainerFrontierOptIn===true),
    actualObservedPowerWindowFlag:rawDevelopment?.nativePressureWindowsOptIn??null,
    rows,
    gates:{
      allEightExactRawIdentities:rows.length===8,
      completeOriginalNativeParity:rows.every(row=>
        row.allBaselineNativeFieldsEqual),
      observedOwnerTrainerCensusAllEight:rows.every(row=>
        row.ownerTrainerFrontier.observed===true),
      observedOwnerTrainerCensusOnUnabortedRows:rows.every(row=>
        row.nativeDisposition==='engine-error'||
        row.ownerTrainerFrontier.observed===true),
      independentAbortObserverEvidenceUnavailable:rows.some(row=>
        row.nativeDisposition==='engine-error'&&
        row.ownerTrainerFrontier.observed!==true),
      anyOriginalSourcePaperLegalTrainerCertified:false,
      passiveLockTacticalPressureCertified:false,
      ownerPolicyNoninterferenceCertified:false,
      gameResultsCompetitivelyQualified:false,
      paperClockCertified:false,
      all32OriginalFieldCertified:false,
      fixed60WinnerInferred:false
    },
    qualifiedCompetitiveGames:0
  };
}

/**
 * Run original v6 joined symmetric policy with TWO preexisting read-only
 * observers, unchanged source/candidate 60s, seats, seeds, and action cap.
 *
 * @param {{runner?:Function,layers?:object,attackLayer?:Function}} [deps]
 * @returns {{execution:object,audit:object}}
 */
function runReadOnlyReplayV9(deps={}){
  const prereg=JSON.parse(fs.readFileSync(
    path.join(ROOT,REGISTRATION),'utf8'));
  const runner=deps.runner??runDevelopment;
  const execution=runMirroredIssue25V6({
    runner:options=>runner({...options,
      ownerGenericTrainerFrontier:true,nativePressureWindows:true}),
    layers:deps.layers,attackLayer:deps.attackLayer
  });
  const audit=auditReadOnlyReplay(execution,prereg);
  const manifest={
    ...execution.manifest,
    version:VERSION,
    policyEntryPoint:ENTRY,
    originalSourceRankSeatRegistrationUnchanged:true,
    observationalReadOnlyOptions:
      prereg.additionalRunnerObserverOptions,
    originalActorAndSourceStampedAttackHandlersUnchanged:true,
    observedLoadedResearchModuleDigest:
      execution.manifest.observedLoadedResearchModuleDigest,
    resolvedSourceAndPolicyHashes:[
      ...execution.manifest.resolvedSourceAndPolicyHashes,
      ...HASH_PATHS.map(hashRegisteredFile)
    ],
    competeAgainstFull32Qualified:false,
    competitiveGamesQualified:0,
    releaseQualified:false
  };
  return {execution:{...execution,manifest},audit};
}

/**
 * Write a bounded redacted transcript atomically under a process lock.
 * @param {object} data Source ID and owner-private redacted diagnostic.
 * @param {string} directory Native CI artifact directory.
 */
function writeReadOnlyReplayV9(data,directory){
  assert.ok(data?.audit);
  const output=Buffer.from(JSON.stringify({
    schema:VERSION+'-public-artifact-v1',
    observedManifest:data.execution.manifest,
    audit:data.audit
  },null,2)+'\n');
  assert.ok(output.length<=2*1024*1024);
  fs.mkdirSync(directory,{recursive:true});
  const file=path.join(directory,'agent3-issue25-readonly-v9.json');
  const shaFile=path.join(directory,'agent3-issue25-readonly-v9.sha256');
  const lock=path.join(directory,'.agent3-issue25-readonly-v9.lock');
  const lockFd=fs.openSync(lock,'wx');
  const tmp=file+'.'+process.pid+'.tmp';
  const shaTmp=shaFile+'.'+process.pid+'.tmp';
  const digest=createHash('sha256').update(output).digest('hex');
  try{
    fs.writeFileSync(tmp,output,{flag:'wx'});
    fs.renameSync(tmp,file);
    fs.writeFileSync(shaTmp,digest+'  agent3-issue25-readonly-v9.json\n',
      {flag:'wx'});
    fs.renameSync(shaTmp,shaFile);
  }finally{
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    if(fs.existsSync(shaTmp))fs.unlinkSync(shaTmp);
    fs.closeSync(lockFd);
    fs.unlinkSync(lock);
  }
  return {path:file,sha256:digest,bytes:output.length};
}

module.exports={VERSION,ENTRY,REGISTRATION,HASH_PATHS,
  auditReadOnlyReplay,runReadOnlyReplayV9,writeReadOnlyReplayV9};
