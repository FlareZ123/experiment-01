'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {runMirroredIssue25V6}=
  require('./agent1-issue25-mirrored-r6-r11-v6.cjs');
const {buildReceipt}=
  require('./agent1-issue25-v4-public-receipt.cjs');
const {auditRootLedger}=
  require('./agent10-issue25-receipt-independent-audit.cjs');
const {hashRegisteredFile}=
  require('./agent36-issue25-selected-v0.cjs');

const VERSION='agent3-issue25-generic-native-trainer-aba-v10';
const REGISTRATION=
  'results/aichi-2026/registrations/agent3-issue25-native-trainer-fallback-aba-v10-20261104.json';
const BASELINE=
  'results/aichi-2026/registrations/agent3-issue25-v6-readonly-opportunity-pressure-retro-20261104.json';
const ENTRY='simulation/evaluation/agent3-issue25-native-trainer-aba-v10.cjs';
const ROOT=path.resolve(__dirname,'../..');
const HASH_PATHS=[
  ENTRY,REGISTRATION,BASELINE,
  'simulation/twinleaf/agent50-native-owner-trainer-pass-bridge.cjs',
  'simulation/twinleaf/agent49-trainer-hand-payment-veto.cjs',
  'simulation/twinleaf/agent5-native-owner-trainer-frontier-observer.cjs',
  'simulation/twinleaf/agent39-live-initialization-window.cjs',
  'tests/agent3-issue25-native-trainer-aba-v10.test.cjs',
  'tests/agent3-issue25-native-trainer-aba-v10.native.test.cjs'
];
const sha=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8'));

/**
 * For a single frozen eight-arm native run, preserve every registered
 * attempt including original engine failures. Never infer legal/payable
 * actions or match wins from accepted native roots.
 * @param {object} run Executed v6 native wrapper.
 * @param {object} registration Precommitted eight identities.
 * @param {string} armId Predeclared experimental mode.
 * @returns {object}
 */
function summarizeArm(run,registration,armId){
  assert.equal(run?.manifest?.sourceIndependentCommonPolicy,true);
  assert.equal(run.manifest.developmentTrialCount,8);
  const transcript=buildReceipt(run,{
    policyEntryPoint:'simulation/evaluation/agent1-issue25-mirrored-r6-r11-v6.cjs'
  });
  assert.equal(transcript.registration.exactJoinedByTrialId,true);
  assert.deepEqual(transcript.registration.expectedIds,registration.trialIds);
  const native=run.rawDevelopment?.rows;
  assert.ok(Array.isArray(native)&&native.length===8);
  const rawById=new Map(native.map(row=>[
    row.trial?.id??row.id,row
  ]));
  assert.equal(rawById.size,8);
  assert.deepEqual([...rawById.keys()].sort(),
    [...registration.trialIds].sort());
  const attempts=transcript.attempts.map(receipt=>{
    const raw=rawById.get(receipt.id);
    assert.ok(raw);
    const nativeRoot=auditRootLedger(receipt,48);
    assert.equal(nativeRoot.verdict,'PASS','Native public root custody failure');
    const sourceSeat=receipt.originalSourceSeat??
      receipt.nativeAbortProvenance?.sourceSeat??null;
    assert.ok(sourceSeat===0||sourceSeat===1);
    const root=receipt.publicRootActions;
    const source=root.filter(x=>x.playerSlot===sourceSeat);
    const candidate=root.filter(x=>x.playerSlot!==sourceSeat);
    const isPlay=x=>x.action==='PlayCardAction';
    const isTrainer=x=>isPlay(x)&&
      /(?:Trainer|Item|Supporter|Stadium|Tool)/.test(String(x.cardType??''));
    const countActions=rows=>({
      totalSelectedPhysicalStoreRoots:rows.length,
      playCard:rows.filter(isPlay).length,
      attack:rows.filter(x=>x.action==='AttackAction').length,
      nonPassNonPrompt:rows.filter(x=>x.action!=='PassTurnAction'&&
        x.action!=='ResolvePromptAction').length,
      pass:rows.filter(x=>x.action==='PassTurnAction').length,
      printedTrainerExplicitlyProven:rows.filter(isTrainer).length
    });
    const actor=raw.actorOnlyDecisionCoverage??null;
    const frontier=actor?.ownerTrainerFrontierAudit?.summary??null;
    const fallback=actor?.nativeOwnerTrainerFallbackAudit??null;
    const sourceFrontier=frontier?.bySeat?.[sourceSeat]??null;
    const candidateFrontier=frontier?.bySeat?.[1-sourceSeat]??null;
    const publicSelected=root.filter(x=>
      x.action==='PlayCardAction'||x.action==='AttackAction')
      .map(x=>({
        ordinal:x.actionOrdinal,owner:x.playerSlot===sourceSeat?'source':'contender',
        turn:x.turnBefore,action:x.action,
        card:x.card??null,attack:x.attack??x.attackName??null
      }));
    return {
      id:receipt.id,status:receipt.status,
      sourceSeat,candidateSeat:1-sourceSeat,
      actualFirstPlayer:receipt.actualFirstPlayer,
      sourceDeckFingerprint:receipt.actualSourceDeckFingerprint,
      candidateDeckFingerprint:receipt.actualCandidateDeckFingerprint,
      sourceDealFingerprint:receipt.sourceDealFingerprint,
      fullPhysicalDealFingerprint:receipt.fullPhysicalDealFingerprint,
      rawPublicRootSha256:receipt.publicRootLedgerSha256Computed,
      rootCount:root.length,rootTraceDigest:sha(root),
      sourceActions:countActions(source),
      candidateActions:countActions(candidate),
      sourceTrainerFrontier:sourceFrontier?{
        observedRoots:sourceFrontier.observedRoots,
        acceptedPassWithUnblockedTrainer:
          sourceFrontier.acceptedPassWithUnblockedTrainer,
        nativeOfferedCopies:sourceFrontier.nativeOfferedCopies,
        genericUnblockedCopies:sourceFrontier.genericUnblockedCopies,
        selectedTrainerRootsAccepted:sourceFrontier.selectedTrainerRootsAccepted
      }:null,
      candidateTrainerFrontier:candidateFrontier?{
        observedRoots:candidateFrontier.observedRoots,
        acceptedPassWithUnblockedTrainer:
          candidateFrontier.acceptedPassWithUnblockedTrainer,
        selectedTrainerRootsAccepted:
          candidateFrontier.selectedTrainerRootsAccepted
      }:null,
      genericNativeFallback:fallback?{
        attemptedUnsupportedPasses:fallback.attemptedUnsupportedPasses,
        selectedNativeTrainerRoots:fallback.selectedNativeTrainerRoots,
        acceptedNativeTrainerRoots:fallback.acceptedNativeTrainerRoots,
        rejectedNativeTrainerRoots:fallback.rejectedNativeTrainerRoots,
        receiptsOmitted:fallback.receiptsOmitted
      }:null,
      rank6PassiveStatus:raw.rank6PassivePressure?.status??null,
      rank6NativePrintedPowerBlocked:
        raw.initializationWindowAudit?.candidateTurn2
          ?.nativePowerChecks?.filter(x=>x.blocked===true)
          .map(x=>({printing:x.printing,powerName:x.powerName}))??null,
      nativeSafeDecoderFrames:
        raw.nativeAbortEvidence?.decoderFrameAttribution??null,
      nativeAbortPrompt:raw.nativeAbortEvidence?.pendingPrompt??
        receipt.abortPendingPrompt??null,
      nativeAbortActionOrdinal:
        raw.nativeAbortEvidence?.actionOrdinal??
        receipt.abortActionOrdinal??null,
      nativeAbortActorPhysicalSeat:
        raw.nativeAbortEvidence?.actingSeat??null,
      nativeFailureStage:raw.nativeAbortEvidence?.failureStage??
        receipt.abortFailureStage??null,
      nativeErrorSanitized:typeof raw.error==='string'?
        raw.error.slice(0,1700):null,
      nativeFallbackAbortDiagnostics:
        raw.nativeGenericFallbackAbortEvidence?{
          attemptedUnsupportedPasses:
            raw.nativeGenericFallbackAbortEvidence.attemptedUnsupportedPasses??
            null,
          acceptedNativeTrainerRoots:
            raw.nativeGenericFallbackAbortEvidence.acceptedNativeTrainerRoots??
            null
        }:null,
      nativeFinished:receipt.finished,
      nativeWinner:receipt.finished===true?receipt.finalNativeWinner:null,
      nativePostStorePhysicalGameQualified:false,
      publicSelectedRoots:publicSelected,
      nativePublicRootActions:root,
      qualifiedGames:0
    };
  });
  return {armId,manifest:{
    selectedWrapper:run.manifest.version,
    actualRuntimeCodePin:run.manifest.observedRepositoryGitCommit??null,
    actualTwinleafPin:run.manifest.observedTwinleafGitCommit??null,
    actorOnlySourceIndependentConfirmed:
      run.manifest.actualRunnerConfirmedOption===true,
    nativeTrainerFallbackSelected:armId==='native-trainer-fallback',
    sameNativeOwnerInformationSafetyCertified:false,
    nativePaperCostCertified:false
  },attempts};
}

/**
 * Exact eight IDs x three A/B/A arms. Compare pre-choice physical native
 * initialization separately from action changes and terminal claims.
 * @param {object[]} arms Predefined control/treatment/control-repeat.
 * @param {object} registration Immutable pre-run manifest.
 * @param {object} baseline Original v6 downloaded native receipts.
 * @returns {object} Retrospective observational A/B/A diagnostic.
 */
function comparePanel(arms,registration,baseline){
  assert.deepEqual(arms.map(x=>x.armId),
    registration.experimentalArms.map(x=>x.id));
  assert.equal(arms.length,3);
  assert.equal(baseline.baselineRecordedRows.length,8);
  const expected=new Map(baseline.baselineRecordedRows.map(x=>[x.id,x]));
  assert.equal(expected.size,8);
  const byArm=arms.map(arm=>{
    const map=new Map(arm.attempts.map(x=>[x.id,x]));
    assert.equal(map.size,8);
    assert.deepEqual([...map.keys()].sort(),
      [...registration.trialIds].sort());
    return map;
  });
  const groups=registration.trialIds.map(id=>{
    const [c,t,replay]=byArm.map(m=>m.get(id));
    const orig=expected.get(id);
    assert.ok(orig);
    const physicalInputEqual=
      [c,t,replay].every(x=>
        x.fullPhysicalDealFingerprint!==null&&
        x.fullPhysicalDealFingerprint===c.fullPhysicalDealFingerprint);
    const sourcePhysicalEqual=[c,t,replay].every(x=>
      x.sourceDealFingerprint!==null&&
      x.sourceDealFingerprint===c.sourceDealFingerprint);
    const sameFirstPlayer=[c,t,replay].every(x=>
      x.actualFirstPlayer===c.actualFirstPlayer);
    const eachPrintingObserved=[c,t,replay].every(x=>
      typeof x.sourceDeckFingerprint==='string'&&
      typeof x.candidateDeckFingerprint==='string');
    const samePrintedSixties=eachPrintingObserved?
      [c,t,replay].every(x=>
        x.sourceDeckFingerprint===c.sourceDeckFingerprint&&
        x.candidateDeckFingerprint===c.candidateDeckFingerprint):null;
    const baselineReplayMatch=
      c.sourceDealFingerprint===orig.sourceDealFingerprint&&
      c.fullPhysicalDealFingerprint===orig.fullPhysicalDealFingerprint&&
      c.rawPublicRootSha256===orig.publicRootLedgerSha256&&
      c.rootCount===orig.nativeRootCount&&
      c.status===orig.status&&
      c.sourceSeat===orig.actualSourceSeat&&
      c.actualFirstPlayer===orig.actualFirstPlayer;
    const repeatedControlIdentical=c.status===replay.status&&
      c.rootCount===replay.rootCount&&
      c.rawPublicRootSha256===replay.rawPublicRootSha256&&
      c.sourceDealFingerprint===replay.sourceDealFingerprint;
    const treatments=[c,t,replay];
    const firstDifference=()=>{
      const lim=Math.max(c.nativePublicRootActions.length,
        t.nativePublicRootActions.length);
      for(let i=0;i<lim;i++){
        const old=c.nativePublicRootActions[i]??null;
        const modern=t.nativePublicRootActions[i]??null;
        if(sha(old)!==sha(modern)){
          return {index:i,
            control:old?{
              ordinal:old.actionOrdinal,turn:old.turnBefore,
              seat:old.playerSlot,action:old.action,
              card:old.card??null,attack:old.attack??old.attackName??null
            }:null,
            treatment:modern?{
              ordinal:modern.actionOrdinal,turn:modern.turnBefore,
              seat:modern.playerSlot,action:modern.action,
              card:modern.card??null,
              attack:modern.attack??modern.attackName??null
            }:null,
            treatmentNextPublicRoots:t.nativePublicRootActions.slice(i+1,i+7)
              .map(x=>({ordinal:x.actionOrdinal,turn:x.turnBefore,
                seat:x.playerSlot,action:x.action,card:x.card??null,
                attack:x.attack??x.attackName??null}))
          };
        }
      }
      return null;
    };
    const compact=x=>{
      const {nativePublicRootActions,...without}=x;
      return without;
    };
    return {
      id,sourceRank:Number(id.split(':')[0]),
      physicalInputEqual,sourcePhysicalEqual,sameFirstPlayer,
      samePrintedSixties,eachPrintingObserved,baselineReplayMatch,
      repeatedControlIdentical,
      firstPublicActionDifference:firstDifference(),
      nativeSourceNonPassDelta:
        t.sourceActions.nonPassNonPrompt-c.sourceActions.nonPassNonPrompt,
      nativeSourceAttacksDelta:
        t.sourceActions.attack-c.sourceActions.attack,
      nativeCandidateAttacksDelta:
        t.candidateActions.attack-c.candidateActions.attack,
      arms:treatments.map(compact),
      gameOutcomeClassification:'DEVELOPMENT_ONLY',
      qualifiedCompetitiveGames:0
    };
  });
  const total=x=>groups.reduce((n,g)=>n+Number(x(g)),0);
  return {
    schema:VERSION+'-24arm-failure-inclusive-native-development',
    registration:REGISTRATION,
    frozenOriginalEightIDs:registration.trialIds,
    modes:registration.experimentalArms,
    attemptsExpected:24,attemptsArchived:groups.length*3,
    exactTrialCoverage:groups.length===8,
    groupCount:groups.length,
    physicalMatchGroups:total(g=>g.physicalInputEqual),
    sourcePhysicalMatchGroups:total(g=>g.sourcePhysicalEqual),
    printedSixtiesMatchGroups:total(g=>g.samePrintedSixties===true),
    printedSixtiesNotAttestedGroups:total(g=>g.samePrintedSixties===null),
    printedSixtiesContradictionGroups:total(g=>g.samePrintedSixties===false),
    exactInitialStarterMatchGroups:total(g=>g.sameFirstPlayer),
    originalV6ControlReproducedGroups:total(g=>g.baselineReplayMatch),
    repeatControlPublicRootReproducedGroups:
      total(g=>g.repeatedControlIdentical),
    sourceTrainerReadOnlyObservedNativeArms:groups.reduce((n,g)=>
      n+g.arms.filter(x=>x.sourceTrainerFrontier!==null).length,0),
    treatmentAcceptedNativeTrainerFallbackRoots:total(g=>
      g.arms[1].genericNativeFallback?.acceptedNativeTrainerRoots??0),
    treatmentSelectedNativeTrainerFallbackRoots:total(g=>
      g.arms[1].genericNativeFallback?.selectedNativeTrainerRoots??0),
    treatmentNativeErrors:total(g=>g.arms[1].status==='engine-error'),
    originalSourceSelectedNonPassTotalControl:total(g=>
      g.arms[0].sourceActions.nonPassNonPrompt),
    originalSourceSelectedNonPassTotalTreatment:total(g=>
      g.arms[1].sourceActions.nonPassNonPrompt),
    originalSourceAttackTotalControl:total(g=>g.arms[0].sourceActions.attack),
    originalSourceAttackTotalTreatment:total(g=>g.arms[1].sourceActions.attack),
    contenderAttackTotalControl:total(g=>g.arms[0].candidateActions.attack),
    contenderAttackTotalTreatment:total(g=>g.arms[1].candidateActions.attack),
    firstPublicActionDifferences:total(g=>
      g.firstPublicActionDifference!==null),
    nativeFallbackOwnerInformationSetCertified:false,
    selectedNativePaymentsPaperVerified:false,
    selectedNativeOwnerTargetsPaperVerified:false,
    gameWinnerCompetitiveCertified:false,
    originalFieldTop32Certified:false,
    paperMatchClockCertified:false,
    independentCompetitiveGames:0,
    bestFixedSixtySelected:false,
    demonstrationOf99Point5Percent:false,
    groups
  };
}

/**
 * Execute A/B/A within same frozen IDs and actor policy; native fallback
 * is the only gameplay policy option changed. Read-only observers identical.
 * @param {{runner?:Function,layers?:object,attackLayer?:Function}} [deps]
 */
function runNativeTrainerAbaV10(deps={}){
  const registration=read(REGISTRATION),baseline=read(BASELINE);
  assert.equal(registration.schema,
    'agent3-issue25-generic-native-trainer-v10-aba-retro-registration-v1');
  assert.equal(registration.expectedGames,24);
  const runner=deps.runner??runDevelopment;
  const modes=registration.experimentalArms;
  const arms=modes.map(mode=>{
    const nativeTrainer=mode.nativeOwnerTrainerFallback;
    assert.equal(typeof nativeTrainer,'boolean');
    const selected=runMirroredIssue25V6({
      runner:options=>runner({...options,
        ownerGenericTrainerFrontier:true,
        nativePressureWindows:true,
        nativeOwnerTrainerFallback:nativeTrainer}),
      layers:deps.layers,attackLayer:deps.attackLayer
    });
    return summarizeArm(selected,registration,mode.id);
  });
  const result=comparePanel(arms,registration,baseline);
  result.provenance={
    manifestCodePaths:HASH_PATHS.map(hashRegisteredFile),
    initialV6ArchivedNativeRunId:baseline.baselineNativeRunId,
    baselineNativeJsonSha256:baseline.baselineJsonSha256,
    observedTwinleafGitPins:arms.map(x=>x.manifest.actualTwinleafPin),
    observedResearchGitPins:arms.map(x=>x.manifest.actualRuntimeCodePin),
    armOptions:arms.map(x=>x.manifest),
    sourceFirstTreatmentIsAnOwnerFallbackOnly:true,
    independentPerGameRandomnessNotQualified:true,
    releaseQualified:false
  };
  return result;
}

/**
 * Atomic, exclusive native result publication.
 * @param {object} result Complete 24-arm development diagnostic.
 * @param {string} directory User-provided output artifact directory.
 */
function writePanel(result,directory){
  const bytes=Buffer.from(JSON.stringify(result,null,2)+'\n');
  assert.ok(bytes.length<8*1024*1024);
  fs.mkdirSync(directory,{recursive:true});
  const lock=path.join(directory,'.agent3-issue25-trainer-v10.lock');
  const fd=fs.openSync(lock,'wx');
  const file=path.join(directory,'agent3-issue25-trainer-v10.json');
  const shaFile=path.join(directory,'agent3-issue25-trainer-v10.sha256');
  const tmp=file+'.'+process.pid+'.tmp',tmpSha=shaFile+'.'+process.pid+'.tmp';
  const digest=createHash('sha256').update(bytes).digest('hex');
  try{
    fs.writeFileSync(tmp,bytes,{flag:'wx'});
    fs.renameSync(tmp,file);
    fs.writeFileSync(tmpSha,
      digest+'  agent3-issue25-trainer-v10.json\n',{flag:'wx'});
    fs.renameSync(tmpSha,shaFile);
  }finally{
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    if(fs.existsSync(tmpSha))fs.unlinkSync(tmpSha);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
  return {path:file,digest,bytes:bytes.length};
}
module.exports={VERSION,REGISTRATION,BASELINE,ENTRY,HASH_PATHS,
  summarizeArm,comparePanel,runNativeTrainerAbaV10,writePanel};
