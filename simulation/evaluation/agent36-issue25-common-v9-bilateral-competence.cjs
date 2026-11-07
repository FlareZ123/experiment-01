'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {execFileSync}=require('node:child_process');

const ROOT=path.resolve(__dirname,'../..');
const VERSION='agent36-issue25-common-v9-bilateral-competence-probe-v1';
const REGISTRATION_PATH='results/aichi-2026/registrations/agent36-common-v9-rank11-newmoon-one-game-20261106.json';
const REGISTRATION=require(path.join(ROOT,REGISTRATION_PATH));
const ROOT_LIMIT=260;

const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {runSelectedIssue25V0,hashRegisteredFiles}=require('./agent36-issue25-selected-v0.cjs');
const {hashRegisteredFile}=require('./agent36-issue25-registered-file-hash.cjs');
const {withCommonOwnerThornsRoot}=require('./agent36-issue25-common-v6.cjs');
const {withOwnerVoltAcrossNativeMatches}=require('./agent36-issue25-common-v7.cjs');
const {withStewardInnermostOwnerPrompts}=require('./agent36-issue25-steward-innermost-prize-v5.cjs');
const {withStewardOwnerPromptFrontier}=require('./agent36-issue25-steward-selected-v4.cjs');
const {withTelepathInsideNativeMatches}=require('./agent8-issue25-v5-telepath-development.cjs');
const {withOwnerTelepathicBenchSearch}=require('../twinleaf/agent8-owner-telepathic-bench-search.cjs');
const {withOwnerAbilityConfirmPolicy}=require('../twinleaf/agent36-owner-ability-confirm-policy.cjs');
const {withAuthoritativeRootPrizeExitObserver}=require('../twinleaf/agent3-authoritative-root-prize-exit-observer.cjs');
const {createFundedPerfectionPassObserver}=require('../twinleaf/agent36-funded-perfection-pass-observer.cjs');
const {
  screenArchivedReciprocalAttempts,
  evaluateBilateralCompetence,
  rootDigest
}=require('./agent45-bilateral-competence-gate.cjs');

const POLICY_PATHS=[
  'simulation/evaluation/agent36-issue25-common-v9-bilateral-competence.cjs',
  'simulation/evaluation/agent41-bilateral-v2-development.cjs',
  'simulation/evaluation/agent36-issue25-selected-v0.cjs',
  'simulation/evaluation/agent36-issue25-common-v6.cjs',
  'simulation/evaluation/agent36-issue25-common-v7.cjs',
  'simulation/evaluation/agent36-issue25-steward-selected-v4.cjs',
  'simulation/evaluation/agent36-issue25-steward-innermost-prize-v5.cjs',
  'simulation/evaluation/agent8-issue25-v5-telepath-development.cjs',
  'simulation/twinleaf/agent34-actor-only-root-policy.cjs',
  'simulation/twinleaf/agent4-allturn-owner-volt-attach-energy.cjs',
  'simulation/twinleaf/agent8-owner-telepathic-bench-search.cjs',
  'simulation/twinleaf/agent36-owner-ability-confirm-policy.cjs'
];
const OBSERVER_PATHS=[
  'simulation/twinleaf/agent3-authoritative-root-prize-exit-observer.cjs',
  'simulation/twinleaf/agent17-native-owner-pass-frontier-witness.cjs',
  'simulation/twinleaf/agent23-native-decision-dispatch-witness.cjs',
  'simulation/twinleaf/agent24-funded-perfection-postpass-stratum.cjs',
  'simulation/twinleaf/agent36-funded-perfection-pass-observer.cjs',
  'simulation/evaluation/agent45-bilateral-competence-gate.cjs'
];
const HASH_PATHS=[...new Set([
  REGISTRATION_PATH,
  'simulation/evaluation/agent36-issue25-common-v9-bilateral-competence.cjs',
  'simulation/evaluation/agent36-issue25-registered-file-hash.cjs',
  'simulation/evaluation/agent41-bilateral-v2-development.cjs',
  'simulation/evaluation/agent36-issue25-selected-v0.cjs',
  'simulation/evaluation/agent36-issue25-common-v6.cjs',
  'simulation/evaluation/agent36-issue25-common-v7.cjs',
  'simulation/evaluation/agent36-issue25-steward-selected-v4.cjs',
  'simulation/evaluation/agent36-issue25-steward-innermost-prize-v5.cjs',
  'simulation/evaluation/agent8-issue25-v5-telepath-development.cjs',
  ...POLICY_PATHS,
  ...OBSERVER_PATHS,
  'simulation/twinleaf/agent24-funded-perfection-postpass-stratum.cjs',
  'simulation/twinleaf/agent36-funded-perfection-pass-observer.cjs',
  'tests/agent36-funded-perfection-pass-observer.test.cjs',
  'tests/agent36-issue25-selected-v0.test.cjs',
  'tests/agent41-bilateral-v2-development.test.cjs'
])];

const REPLY_FIELDS=[
  'sourceAttackOrdinal',
  'sourceTurn',
  'sourceAttackName',
  'candidateReplyTurn',
  'candidateReplyAction',
  'ownerHandAfterDecision',
  'publicBoardBeforePass',
  'printedBasicEnergyBeforePass',
  'postChoiceAttackProbe',
  'clonedHeldTelepathActiveAttachment',
  'candidateReplyTurnRootSequence',
  'candidateReplyTurnFinalPass'
];

/**
 * @param {string} value
 * @returns {string}
 */
function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

/**
 * Return the one immutable prospective trial.
 * @returns {object[]}
 */
function trials() {
  assert.equal(REGISTRATION.schema,VERSION);
  assert.equal(REGISTRATION.status,'FROZEN_BEFORE_EXECUTION');
  assert.equal(REGISTRATION.trialCount,1);
  assert.equal(REGISTRATION.maxNativeRootActionsPerArm,ROOT_LIMIT);
  assert.equal(REGISTRATION.trials.length,1);
  const trial=REGISTRATION.trials[0];
  assert.equal(trial.id,[trial.rank,trial.repeat,trial.candidateSlot,
    trial.candidateId].join(':'));
  assert.equal(trial.id,'11:1000:B:new-moon-lockbreaker-v1');
  assert.equal(trial.seed,626469135);
  assert.equal(trial.rank,11);
  assert.equal(trial.candidateSlot,'B');
  assert.equal(trial.candidateId,'new-moon-lockbreaker-v1');
  return [{...trial}];
}

/**
 * Hash the authenticated original source's card identity/count list. This is
 * deliberately not labelled a physical-print hash.
 * @returns {string}
 */
function sourceNameCountSha256() {
  const roster=JSON.parse(fs.readFileSync(path.join(ROOT,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  const deck=roster.decks.find(row=>row.rank===11);
  assert.ok(deck&&Array.isArray(deck.cards));
  assert.equal(deck.cards.reduce((sum,row)=>sum+row.count,0),60);
  const canonical=deck.cards.slice().sort((a,b)=>
    a.name<b.name?-1:a.name>b.name?1:0)
    .map(row=>row.name+'\t'+row.count).join('\n');
  return sha256(canonical);
}

/**
 * Hash the fixed proposed Japanese print-ID/count list.
 * @returns {string}
 */
function candidatePrinted60Sha256() {
  const manifest=JSON.parse(fs.readFileSync(path.join(ROOT,
    'results/als/new-moon-lockbreak-japanese-print-60.json'),'utf8'));
  assert.equal(manifest.schema,'new-moon-lockbreak-proposed-japanese-prints-v1');
  assert.equal(manifest.entries.reduce((sum,row)=>sum+row.count,0),60);
  const canonical=manifest.entries.slice().sort((a,b)=>
    a.japanese_card_id-b.japanese_card_id)
    .map(row=>row.japanese_card_id+'\t'+row.count).join('\n');
  return sha256(canonical);
}

/**
 * Preserve only the already-established owner/public post-Prize projection.
 * No opponent hidden hand or counterfactual legality assertion is copied.
 * @param {object} row
 * @returns {object[]}
 */
function projectCandidateRepliesAfterSourceAttacks(row) {
  return (row.candidateRepliesAfterSourceAttacks??[]).map(reply=>{
    const projected={};
    for(const field of REPLY_FIELDS) {
      if(Object.hasOwn(reply,field))projected[field]=reply[field];
    }
    return projected;
  });
}

/**
 * Produce a bounded, owner/public evidence row from the native development
 * output. The root ledger is the actual accepted Store-root sequence.
 * @param {object} row
 * @returns {object}
 */
function summarizeNativeAttempt(row) {
  const id=row.trial?.id??row.id??null;
  const roots=Array.isArray(row.rootActionLedger)?row.rootActionLedger:[];
  const rootCount=row.rootActionCount??roots.length;
  const ledgerComplete=roots.length===rootCount;
  const ledgerDigest=roots.length?rootDigest(roots):null;
  const aborted=row.error!==undefined&&row.error!==null;
  const nativeOutcome=aborted?'engine-error':
    row.finished===true?'native-terminal':
      rootCount>=ROOT_LIMIT?'action-cap':'returned-unqualified';
  return {
    id,
    status:nativeOutcome==='native-terminal'?'native-terminal-unqualified':
      nativeOutcome==='action-cap'?'root-cap-unqualified':
        nativeOutcome==='engine-error'?'engine-error':'returned-unqualified',
    nativeOutcome,
    rank:row.rank??row.trial?.rank??null,
    repeat:row.repeat??row.trial?.repeat??null,
    candidateSlot:row.candidateSlot??row.trial?.candidateSlot??null,
    candidateId:row.candidateId??row.trial?.candidateId??null,
    seed:row.seed??row.trial?.seed??null,
    sourceSeat:row.sourceSeat??null,
    candidateSeat:row.candidateSeat??null,
    actualFirstPlayerSeat:row.actualStarterSeat??null,
    sourceActuallyFirst:row.sourceActuallyFirst??null,
    sourceDeckFingerprint:row.sourceDeckFingerprint??null,
    candidateDeckFingerprint:row.candidateDeckFingerprint??null,
    sourceDealFingerprint:row.sourceDealFingerprint??null,
    fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
    randomnessProtocol:row.randomnessProtocol??null,
    policyRandomIsolation:row.policyRandomIsolation??null,
    physicalShuffleRandomIsolation:row.physicalShuffleRandomIsolation??null,
    physicalShuffleRandomIsolationAfterSetup:
      row.physicalShuffleRandomIsolationAfterSetup??null,
    nativeSetupCoinChoiceReceipt:row.nativeSetupCoinChoiceReceipt??null,
    nativeActionInputAudit:row.nativeActionInputAudit??null,
    nativeAllOwnerPassFrontier:row.nativeAllOwnerPassFrontier??null,
    candidatePostChoicePassProbe:row.candidatePostChoicePassProbe??null,
    candidatePassProbeSamples:row.candidatePassProbeSamples??[],
    candidatePerfectionPassSamples:row.candidatePerfectionPassSamples??[],
    candidateRepliesAfterSourceAttacks:
      projectCandidateRepliesAfterSourceAttacks(row),
    attackDeclarations:row.attackDeclarations??null,
    settledPublicAttackCount:row.settledPublicAttackCount??null,
    candidateAttackSettlement:row.candidateAttackSettlement??null,
    sourceAttackSettlement:row.sourceAttackSettlement??null,
    firstSettledPublicAttack:row.firstSettledPublicAttack??[],
    firstCandidatePostSourceRoot:row.firstCandidatePostSourceRoot??null,
    candidateFollowupStatus:row.candidateFollowupStatus??null,
    candidateFollowupSourceTurn:row.candidateFollowupSourceTurn??null,
    actionCount:row.actionCount??null,
    turns:row.turns??null,
    finished:row.finished??false,
    winner:row.winner??null,
    endReason:row.endReason??null,
    finalPrizes:row.finalPrizes??null,
    finalBoard:row.finalBoard??null,
    rootActionCount:rootCount,
    rootActionLedger:roots,
    rootActionLedgerSha256Reported:row.rootActionLedgerSha256??null,
    publicRootActions:roots,
    publicRootActionsTruncated:!ledgerComplete,
    publicRootActionCount:rootCount,
    publicRootLedgerSha256Computed:ledgerDigest,
    publicRootLedgerSha256Reported:row.rootActionLedgerSha256??null,
    nativeAcceptedTargetAudit:row.nativeAcceptedTargetAudit??null,
    physicalZoneQualification:row.physicalZoneQualification??null,
    terminalAttackKoBeforeEndTurnAudit:
      row.terminalAttackKoBeforeEndTurnAudit??null,
    sourceDealEpochs:row.sourceDealEpochs??null,
    suddenDeathClockResets:row.suddenDeathClockResets??[],
    error:aborted?String(row.error?.message??row.error):null
  };
}

/**
 * Map the native row to Agent45's archive-screen contract.
 * @param {object} row
 * @returns {object}
 */
function toGateAttempt(row) {
  return {
    id:row.id,
    status:row.status,
    publicRootActions:row.publicRootActions,
    publicRootActionsTruncated:row.publicRootActionsTruncated,
    publicRootActionCount:row.publicRootActionCount,
    publicRootLedgerSha256Computed:row.publicRootLedgerSha256Computed,
    publicRootLedgerSha256Reported:row.publicRootLedgerSha256Reported,
    originalSourceSeat:row.sourceSeat,
    candidateSeat:row.candidateSeat,
    actualSourceAttackSettlement:row.sourceAttackSettlement
  };
}

/**
 * @param {object} row
 * @param {object} metadata
 * @returns {object|null}
 */
function evaluateGate(row,metadata) {
  if(!Array.isArray(row.publicRootActions))return null;
  const roots=row.publicRootActions;
  return evaluateBilateralCompetence({
    registrationRef:REGISTRATION_PATH,
    trialId:row.id,
    originalSourceRank:11,
    originalSourceSeat:row.sourceSeat,
    candidateSeat:row.candidateSeat,
    actualFirstPlayerSeat:row.actualFirstPlayerSeat,
    sourcePhysicalDealSha256:row.sourceDealFingerprint,
    fullPhysicalDealSha256:row.fullPhysicalDealFingerprint,
    vendorCommitSha:metadata.vendorPin,
    researchRevisionSha:metadata.researchRevision,
    hookRevisionSha:metadata.hookHash,
    originalPrinted60Sha256:null,
    candidatePrinted60Sha256:metadata.candidatePrinted60Sha256,
    policySha256BySeat:[metadata.policyHash,metadata.policyHash],
    rootActionLedger:roots,
    rootActionLedgerSha256:rootDigest(roots),
    actionCertificates:[],
    independentFullPaperRulesAudit:false,
    hiddenInformationAudit:false,
    official25MinuteClockAudit:false,
    nativeFinished:row.finished,
    nativeWinner:row.winner,
    nativeEndReason:row.endReason,
    finalPrizes:row.finalPrizes,
    engineError:row.nativeOutcome==='engine-error',
    rootCapReached:row.nativeOutcome==='action-cap'
  });
}

/**
 * Atomically replace one artifact while holding an exclusive lock.
 * @param {string} outputPath
 * @param {object} value
 */
function writeJsonAtomic(outputPath,value) {
  fs.mkdirSync(path.dirname(outputPath),{recursive:true});
  const lockPath=outputPath+'.lock';
  const tempPath=outputPath+'.'+process.pid+'.tmp';
  const lockFd=fs.openSync(lockPath,'wx');
  let tempFd=null;
  try {
    fs.writeFileSync(lockFd,String(process.pid),'utf8');
    fs.fsyncSync(lockFd);
    tempFd=fs.openSync(tempPath,'wx');
    fs.writeFileSync(tempFd,JSON.stringify(value,null,2)+'\n','utf8');
    fs.fsyncSync(tempFd);
    fs.closeSync(tempFd);
    tempFd=null;
    fs.renameSync(tempPath,outputPath);
  } finally {
    if(tempFd!==null)fs.closeSync(tempFd);
    if(fs.existsSync(tempPath))fs.unlinkSync(tempPath);
    fs.closeSync(lockFd);
    fs.unlinkSync(lockPath);
  }
}

/**
 * Execute the one prospectively frozen game under the identical policy stack
 * on both seats. Observers are post-choice and never feed private information
 * into either player's decision policy.
 *
 * @param {{
 *   runner?:Function,
 *   attackLayer?:Function,
 *   ownerLayer?:Function,
 *   globalVoltLayer?:Function,
 *   telepathMatchLayer?:Function,
 *   headless?:object,
 *   Store?:Function,
 *   env?:NodeJS.ProcessEnv
 * }} [deps]
 * @returns {object}
 */
function runStewardBilateralProbeV9(deps={}) {
  const trialList=trials();
  const trial=trialList[0];
  const runner=deps.runner??runDevelopment;
  const attack=deps.attackLayer??withStewardOwnerPromptFrontier;
  const owner=deps.ownerLayer??withStewardInnermostOwnerPrompts;
  const globalVolt=deps.globalVoltLayer??withOwnerVoltAcrossNativeMatches;
  const telepathMatch=deps.telepathMatchLayer??withTelepathInsideNativeMatches;
  const headless=deps.headless??require('../twinleaf/headless.cjs');
  const Store=deps.Store??require(path.join(ROOT,
    'vendor/twinleaf/ptcg-server/output/game/store/store.js')).Store;
  assert.equal(typeof runner,'function');
  assert.equal(typeof attack,'function');
  assert.equal(typeof owner,'function');
  assert.equal(typeof globalVolt,'function');
  assert.equal(typeof telepathMatch,'function');

  const researchRevision=execFileSync('git',['rev-parse','HEAD'],{
    cwd:ROOT,encoding:'utf8'
  }).trim();
  const vendorPin=execFileSync('git',['-C',path.join(ROOT,'vendor/twinleaf'),
    'rev-parse','HEAD'],{cwd:ROOT,encoding:'utf8'}).trim();
  assert.equal(vendorPin,REGISTRATION.twinleaf.pinnedCommit,
    'Pinned Twinleaf submodule revision changed after registration freeze');

  const allHashes=hashRegisteredFiles(HASH_PATHS);
  const policyHashes=POLICY_PATHS.map(hashRegisteredFile);
  const observerHashes=OBSERVER_PATHS.map(hashRegisteredFile);
  const policyHash=sha256(JSON.stringify(policyHashes));
  const hookHash=sha256(JSON.stringify(allHashes));
  const metadata={
    researchRevision,vendorPin,policyHash,hookHash,
    sourceNameCountSha256:sourceNameCountSha256(),
    candidatePrinted60Sha256:candidatePrinted60Sha256(),
    sourceDecklistSha256:hashRegisteredFile(
      'results/aichi-2026/full-decklists.json').sha256,
    candidatePrintManifestSha256:hashRegisteredFile(
      'results/als/new-moon-lockbreak-japanese-print-60.json').sha256,
    candidateEngineProxySha256:hashRegisteredFile(
      'results/als/new-moon-lockbreak-english-proxy-60.json').sha256,
    registrationSha256:hashRegisteredFile(REGISTRATION_PATH).sha256
  };

  const rootBinding={current:null};
  const fundedPerfection=createFundedPerfectionPassObserver({
    Store,maxRecords:4
  });
  fundedPerfection.install();
  let voltWrapper;
  let selected;
  try {
    const execute=()=>withCommonOwnerThornsRoot(()=>
      runSelectedIssue25V0({
        registeredTrialIds:[trial.id],
        allowSingleRegisteredTrial:true,
        nativeRootActionLimit:ROOT_LIMIT,
        layers:{
          firstBlockedPromptEnvelope:next=>attack(next)
        },
        runner:options=>runner({
          ...options,
          actorOnlyComposition:true,
          sourceIndependentCommonPolicy:true,
          bilateralSpecialEnergyRoot:true,
          nativeAcceptedTargets:true,
          nativeRootActionLimit:ROOT_LIMIT,
          isolatePolicyRandomness:true,
          isolatePhysicalShuffleRandomnessAfterSetup:false,
          paperSupporterQuota:true,
          nativeActionInputWitness:true,
          nativeAllOwnerPassFrontier:true,
          nativeSetupCoinChoiceReceipt:true,
          physicalZoneGate:true,
          registeredTrials:trialList,
          registeredFrameName:REGISTRATION.schema,
          allowSingleCandidateArm:true,
          allowAdditionalOriginalSourceRanks:false,
          onRootStoreCreated:store=>{
            rootBinding.current=store;
            options.onRootStoreCreated?.(store);
          },
          onRootActionDispatched:(store,action,ordinal,seat,turnBefore)=>{
            fundedPerfection.onRootActionDispatched(
              store,action,ordinal,seat,turnBefore);
            options.onRootActionDispatched?.(
              store,action,ordinal,seat,turnBefore);
          }
        })
      }),{env:deps.env});

    const telepath=()=>telepathMatch(execute,{
      headless,
      telepath:run=>{
        const prize=withAuthoritativeRootPrizeExitObserver(run,{
          Store,rootBinding
        });
        const ability=withOwnerAbilityConfirmPolicy(()=>prize.result);
        const tele=withOwnerTelepathicBenchSearch(()=>ability.result);
        return {
          result:tele.result,
          audit:{
            prize:prize.audit,
            ability:ability.audit,
            telepath:tele.audit
          }
        };
      }
    });
    const ownerWrapper=()=>owner(telepath);
    voltWrapper=globalVolt(ownerWrapper,{
      headless,voltLayer:deps.voltLayer
    });
    selected=voltWrapper.result.result.result;
  } finally {
    fundedPerfection.restore();
  }

  const raw=selected.rawDevelopment;
  assert.ok(raw&&Array.isArray(raw.rows),
    'Selected runner must return its native development rows');
  assert.equal(raw.rows.length,1,
    'Prospective registration must execute exactly one natural game');
  const nativeAttempt=summarizeNativeAttempt(raw.rows[0]);
  const gateAttempt=toGateAttempt(nativeAttempt);
  const archiveScreen=screenArchivedReciprocalAttempts({
    attempts:[gateAttempt]
  });
  const competence=evaluateGate(nativeAttempt,metadata);

  const policyMatchAudit=voltWrapper.result.result?.audit??null;
  const ownerPromptAudit=voltWrapper.result?.audit??null;
  const telepathAudit=voltWrapper.result.result?.audit??null;
  const manifest={
    version:VERSION,
    historicalOnly:false,
    prospective:true,
    registrationPath:REGISTRATION_PATH,
    registrationStatus:REGISTRATION.status,
    registeredTrialIds:[trial.id],
    registeredTrialCount:1,
    registeredCandidateArmMode:raw.registeredCandidateArmMode??null,
    registeredTrialMode:selected.manifest?.registeredTrialMode??null,
    originalSourceRanks:[11],
    candidateDeckIds:['new-moon-lockbreaker-v1'],
    candidateSlot:'B',
    nativeRootActionLimit:ROOT_LIMIT,
    samePolicyBothSeats:true,
    sourceIndependentCommonPolicy:true,
    actorOnlyComposition:true,
    policyHash,
    policySha256BySeat:[policyHash,policyHash],
    hookHash,
    policyHashes,
    observerHashes,
    codeHashes:allHashes,
    researchRevision,
    vendorPin,
    submodulePath:'vendor/twinleaf',
    rngProtocol:'separate-game-and-per-seat-policy-prng-v1',
    isolatePolicyRandomness:true,
    isolatePhysicalShuffleRandomnessAfterSetup:false,
    sourceNameCountSha256:metadata.sourceNameCountSha256,
    originalPrinted60Sha256:null,
    candidatePrinted60Sha256:metadata.candidatePrinted60Sha256,
    sourceDecklistSha256:metadata.sourceDecklistSha256,
    candidatePrintManifestSha256:metadata.candidatePrintManifestSha256,
    candidateEngineProxySha256:metadata.candidateEngineProxySha256,
    exactOriginalPhysicalPrintsVerified:false,
    candidatePrintManifestOfficial:false,
    independentFullPaperRulesAudit:false,
    hiddenInformationAudit:false,
    official25MinuteClockAudit:false,
    competitiveGamesQualified:0,
    targetWinRate:0.995,
    targetWinRateDemonstrated:false
  };
  const output={
    manifest,
    selectedPolicyManifest:selected.manifest,
    selectedPolicyDiagnostic:selected.diagnostic,
    nativeAttempt,
    postPrizeOwnerDecisionAudit:{
      source:"runDevelopment.candidateRepliesAfterSourceAttacks",
      ownerPrivateAftergameEvidence:true,
      opponentHiddenHandIncluded:false,
      alternativeActionLegalityCertified:false,
      rows:nativeAttempt.candidateRepliesAfterSourceAttacks
    },
    fundedPerfectionPassObserver:fundedPerfection.summary(),
    nativeAdapterAudit:{
      volt:voltWrapper.audit??null,
      ownerPrompt:ownerPromptAudit,
      telepathMatches:telepathAudit,
      policyMatch:policyMatchAudit
    },
    agent45ArchiveScreen:archiveScreen,
    agent45CompetenceEvaluation:competence,
    qualification:{
      naturalGameObserved:nativeAttempt.finished===true,
      bilateralMaterialEpisodeQualified:false,
      competitiveAdmission:false,
      reason:"One prospective development game; no independently reviewed action certificates, exact original printed-60 hash, full paper rules audit, hidden-information audit, or official 25-minute clock audit."
    }
  };
  return output;
}

function main() {
  const output=runStewardBilateralProbeV9();
  const outputPath=path.join(ROOT,
    'artifacts/agent36-bilateral-competence-v9/issue25-common-v9.json');
  writeJsonAtomic(outputPath,output);
  process.stdout.write(JSON.stringify({
    version:output.manifest.version,
    trialId:output.manifest.registeredTrialIds[0],
    rootActionCount:output.nativeAttempt.rootActionCount,
    finished:output.nativeAttempt.finished,
    winner:output.nativeAttempt.winner,
    endReason:output.nativeAttempt.endReason,
    rawReciprocalLooking:output.agent45ArchiveScreen.rawReciprocalLooking,
    qualified:output.agent45ArchiveScreen.qualified,
    competitiveGamesQualified:0,
    artifact:outputPath
  },null,2)+'\n');
}

if(require.main===module)main();

module.exports={
  VERSION,ROOT_LIMIT,REGISTRATION_PATH,POLICY_PATHS,OBSERVER_PATHS,HASH_PATHS,
  trials,sourceNameCountSha256,candidatePrinted60Sha256,
  projectCandidateRepliesAfterSourceAttacks,summarizeNativeAttempt,toGateAttempt,
  evaluateGate,writeJsonAtomic,runStewardBilateralProbeV9
};
