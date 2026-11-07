'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {originalPrintings}=require('./agent2-vs-seeker-research-original-rank13-aba.cjs');
const {executeDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {
  runSelectedIssue25V0,hashRegisteredFile,observedGitRevision,
  observedLoadedResearchModuleDigest
}=require('./agent36-issue25-selected-v0.cjs');
const {withStewardOwnerPromptFrontier}=
  require('./agent36-issue25-steward-selected-v4.cjs');
const {withStewardInnermostOwnerPrompts}=
  require('./agent36-issue25-steward-innermost-prize-v5.cjs');
const {withCommonOwnerThornsRoot}=
  require('./agent36-issue25-common-v6.cjs');
const {withOwnerVoltAcrossNativeMatches}=
  require('./agent36-issue25-common-v7.cjs');
const {
  withFirstBlockedPromptContract,VERSION:PROMPT_CONTRACT_VERSION
}=require('../twinleaf/agent2-first-blocked-prompt-contract.cjs');
const {CODE}=require('../twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');
const {VERSION:GO_FIRST_VERSION}=require('../twinleaf/agent6-go-first-choice.cjs');

const VERSION='agent2-v8-common-first-owner-root-canary-v1';
const ENGINE_PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const SEED=290134;
const ACTION_LIMIT=128;
const CANDIDATE_RANK=13;
const SOURCE_RANK=3;
const CANDIDATE_ID='agent2-original-rank13-v8-common';
const HASH_PATHS=Object.freeze([
  'simulation/evaluation/agent2-v8-common-first-owner-root-canary.cjs',
  'simulation/evaluation/agent2-vs-seeker-research-original-rank13-aba.cjs',
  'simulation/evaluation/agent41-bilateral-v2-development.cjs',
  'simulation/evaluation/agent36-issue25-selected-v0.cjs',
  'simulation/evaluation/agent36-issue25-steward-selected-v4.cjs',
  'simulation/evaluation/agent36-issue25-steward-innermost-prize-v5.cjs',
  'simulation/evaluation/agent36-issue25-common-v6.cjs',
  'simulation/evaluation/agent36-issue25-common-v7.cjs',
  'simulation/twinleaf/agent2-first-blocked-prompt-contract.cjs',
  'simulation/twinleaf/agent34-actor-only-root-policy.cjs',
  'simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs',
  'simulation/twinleaf/agent6-go-first-choice.cjs',
  'simulation/twinleaf/agent50-owner-starting-basic-choice.cjs',
  'simulation/twinleaf/agent50-owner-public-acknowledgements.cjs',
  'simulation/twinleaf/agent50-owner-mandatory-showcards.cjs',
  'simulation/twinleaf/agent50-first-blocked-prompt-envelope.cjs',
  'simulation/evaluation/agent1-issue25-joined-three-attacks-v5.cjs',
  'simulation/twinleaf/agent41-owner-capture-energy-search.cjs',
  'simulation/twinleaf/agent21-owner-first-prize-reveal.cjs',
  'simulation/twinleaf/agent8-actor-only-choose-pokemon.cjs',
  'simulation/twinleaf/agent1-charged-promotion-choice.cjs',
  'simulation/twinleaf/agent4-allturn-owner-volt-attach-energy.cjs',
  'results/aichi-2026/full-decklists.json'
]);

function sha256(value){
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function safeRootPrefix(native){
  if(!Array.isArray(native?.rootActionLedger))return [];
  return native.rootActionLedger.slice(-12).map(root=>({
    actionOrdinal:root.actionOrdinal??null,
    turnBefore:root.turnBefore??null,
    turnAfter:root.turnAfter??null,
    playerSlot:root.playerSlot??null,
    action:root.action??null,
    pendingPrompt:root.pendingPrompt??null
  }));
}

function runOne(candidateSeat,cards){
  assert.ok(candidateSeat===0||candidateSeat===1);
  const slot=candidateSeat===0?'A':'B';
  const trial={
    id:[SOURCE_RANK,0,slot,CANDIDATE_ID].join(':'),
    rank:SOURCE_RANK,repeat:0,candidateSlot:slot,
    candidateId:CANDIDATE_ID,seed:SEED
  };
  const candidates=new Map([[CANDIDATE_ID,{plan:{
    candidate:{cards:cards.candidate},
    opponents:[{rank:SOURCE_RANK,status:'ready',cards:cards.source}]
  }}]]);
  let row=null;

  // This is the same executeDevelopment common-policy path used by the
  // selected v8 runner. The only additional flags expose and quarantine the
  // first unsupported owner Trainer root; they never execute the native
  // fallback or qualify a competitive game.
  const runner=options=>{
    try{
      const observed=withFirstBlockedPromptContract(()=>
        executeDevelopment(trial,candidates,{
          ...options,
          actorOnlyComposition:true,
          sourceIndependentCommonPolicy:true,
          bilateralSpecialEnergyRoot:true,
          nativeAcceptedTargets:true,
          nativeOwnerTrainerFallback:true,
          ownerFallbackDiagnosticView:true,
          actorOnlySingleSearch:false,
          actorGenericFallbackAttribution:true,
          nativeRootActionLimit:ACTION_LIMIT,
          registeredTrial:true
        }));
      row=observed.result;
      return {rows:[row],promptContractObserverAudit:observed.audit};
    }catch(error){
      if(error?.code!==CODE)throw error;
      const native=error?.nativeAbortEvidence??
        error?.cause?.nativeAbortEvidence??null;
      const actor=error?.actorNativeTrainerFallbackAbortAudit??
        error?.cause?.actorNativeTrainerFallbackAbortAudit??null;
      const prompt=error?.agent2FirstBlockedPromptContract??
        error?.cause?.agent2FirstBlockedPromptContract??null;
      row={
        trial,id:trial.id,status:'engine-aborted-unqualified',
        finished:false,
        rootActionCount:native?.rootActionCount??null,
        nativeRootActionCount:native?.rootActionCount??null,
        nativeAbortProvenance:{
          code:error.code,
          message:String(error.message??error).slice(0,250),
          nativeAbortEvidence:native,
          actorNativeTrainerFallbackAbortAudit:actor,
          firstBlockedPromptContract:prompt,
          goFirstChoiceAudit:error?.goFirstChoiceAudit??null
        }
      };
      return {rows:[row]};
    }
  };

  // Match the selected v8 composition: common Thorns root, selected v0
  // setup/quarantine stack, v4 attack/Capture Energy frontier, v5 innermost
  // Prize/promotion prompts, and v7 Volt transfer. One diagnostic trial is
  // injected into the same common executeDevelopment policy.
  const execute=()=>withCommonOwnerThornsRoot(()=>runSelectedIssue25V0({
    runner,
    layers:{firstBlockedPromptEnvelope:withStewardOwnerPromptFrontier},
    registeredTrialIds:[trial.id],
    allowSingleRegisteredTrial:true,
    nativeRootActionLimit:ACTION_LIMIT
  }));
  const owner=withStewardInnermostOwnerPrompts(execute);
  const volt=withOwnerVoltAcrossNativeMatches(()=>owner);
  const selected=volt.result.result;
  const nativeRow=selected.rawDevelopment?.rows?.[0]??row;
  const provenance=nativeRow?.nativeAbortProvenance??{};
  const native=provenance.nativeAbortEvidence??null;
  const actor=provenance.actorNativeTrainerFallbackAbortAudit??null;
  const first=actor?.firstUnsupportedOwnerRoot??null;
  const prompt=provenance.firstBlockedPromptContract??null;
  const goFirst=selected.diagnostic.audit?.declineGoFirstBothSeats??null;
  const startingBasics=
    selected.diagnostic.audit?.agent50AllEligibleInitialBasics??null;
  const publicAcks=
    selected.diagnostic.audit?.publicMulliganAndWaitAcks??null;
  const showCards=
    selected.diagnostic.audit?.mandatoryInTurnShowCards??null;
  const attackFrontier=
    selected.diagnostic.audit?.firstBlockedPromptEnvelope??null;
  const quarantine=
    selected.diagnostic.audit?.nativeRawStateQuarantine??null;
  const valid=first?.ownerView?.decisionKind==='owner-root'&&
    typeof first.ownerVisibleSha256==='string'&&
    actor?.attemptedUnsupportedPasses===1&&
    actor?.originalNativeDecoderExecuted===false&&
    selected.diagnostic.rawDecoderExecuted===false&&
    selected.diagnostic.fallbackCalls===1&&
    selected.diagnostic.thrownCode===CODE&&
    Number.isSafeInteger(native?.actionOrdinal)&&
    native?.rootActionCount===native.actionOrdinal&&
    first.hiddenSourceIdentitiesIncluded===false;
  const status=valid?'quarantined-first-owner-root-captured':
    prompt?'blocked-owner-prompt-contract-captured':
      'unqualified-native-abort';
  const firstRootProvenance=first?{
    candidateSeat,sourceSeat:1-candidateSeat,
    actorSeat:first.ownerView?.actorSeat??null,
    actionOrdinal:native?.actionOrdinal??null,
    acceptedRootCount:native?.rootActionCount??null,
    intentKind:'pass',
    intentReason:'no-supported-owner-visible-root',
    quarantineCode:selected.diagnostic.thrownCode??null,
    quarantineMessage:String(selected.diagnostic.thrownMessage??'').slice(0,250),
    rootActionPrefixSha256:native?.rootActionLedgerSha256??null
  }:null;

  return {
    trialId:trial.id,candidateRank:CANDIDATE_RANK,
    sourceRank:SOURCE_RANK,candidateSeat,sourceSeat:1-candidateSeat,
    seed:SEED,actionLimit:ACTION_LIMIT,
    candidateDeckSha256:sha256(cards.candidate),
    sourceDeckSha256:sha256(cards.source),
    status,firstUnsupportedOwnerRoot:first,
    firstRootProvenance,firstBlockedPromptContract:prompt,
    nativeAbortEvidence:{
      actionOrdinal:native?.actionOrdinal??null,
      rootActionCount:native?.rootActionCount??null,
      rootActionLedgerSha256:native?.rootActionLedgerSha256??null,
      acceptedRootPrefix:safeRootPrefix(native)
    },
    actorAbortCounters:actor?{
      attemptedUnsupportedPasses:actor.attemptedUnsupportedPasses,
      originalNativeDecoderExecuted:actor.originalNativeDecoderExecuted,
      firstUnsupportedOwnerRootCaptured:
        actor.firstUnsupportedOwnerRoot!==null
    }:null,
    selectedV0:{
      version:selected.manifest.version,
      selectedOuterToInner:selected.manifest.selectedOuterToInner,
      runtimeGitAttestationStatus:selected.manifest.runtimeGitAttestationStatus,
      registeredAttemptReconciliation:
        selected.diagnostic.registeredAttemptReconciliation,
      rawDecoderExecuted:selected.diagnostic.rawDecoderExecuted,
      fallbackCalls:selected.diagnostic.fallbackCalls,
      thrownCode:selected.diagnostic.thrownCode,
      thrownMessage:selected.diagnostic.thrownMessage,
      goFirstAudit:goFirst,
      startingBasicAudit:startingBasics,
      publicAcknowledgementAudit:publicAcks,
      mandatoryShowCardsAudit:showCards,
      v8AttackAndCaptureFrontierAudit:attackFrontier,
      nativeQuarantineAudit:quarantine
    },
    v8OuterAudits:{
      innermostOwnerPrompts:owner.audit??null,
      ownerVolt:volt.audit??null
    },
    selectedV0Manifest:selected.manifest,
    selectedV0Diagnostic:selected.diagnostic,
    releaseQualified:false,competitiveGamesQualified:0,
    estimatedWinRate:null
  };
}

function run(){
  const resolvedSourceAndPolicyHashes=HASH_PATHS.map(hashRegisteredFile);
  const cards=originalPrintings();
  const rows=[runOne(0,cards),runOne(1,cards)];
  return {
    schema:VERSION,enginePin:ENGINE_PIN,
    observedTwinleafCommit:observedGitRevision('vendor/twinleaf'),
    observedRepositoryCommit:observedGitRevision('.'),
    sourceCodeCommit:process.env.GITHUB_SHA??null,
    observedLoadedResearchModuleDigest:observedLoadedResearchModuleDigest(),
    resolvedSourceAndPolicyHashes,
    selectedV8OuterVersions:{
      stewardOwnerPromptFrontier:
        require('./agent36-issue25-steward-selected-v4.cjs').VERSION,
      stewardInnermostOwnerPrompts:
        require('./agent36-issue25-steward-innermost-prize-v5.cjs').VERSION,
      commonThornsRoot:
        require('./agent36-issue25-common-v6.cjs').VERSION,
      ownerVolt:
        require('./agent36-issue25-common-v7.cjs').VERSION,
      firstBlockedPromptContract:PROMPT_CONTRACT_VERSION
    },
    sourceDeck:'Aichi Open League 2026 Top 32 rank 3 original Snorlax Stall',
    candidateDeck:'Aichi Open League 2026 Top 32 rank 13 original Regidrago',
    goFirstPolicy:[false,false],
    selectedV0SetupAdapterVersions:{
      goFirst:GO_FIRST_VERSION,
      startingBasics:require('../twinleaf/agent50-owner-starting-basic-choice.cjs').VERSION,
      publicAcknowledgements:require('../twinleaf/agent50-owner-public-acknowledgements.cjs').VERSION,
      mandatoryShowCards:require('../twinleaf/agent50-owner-mandatory-showcards.cjs').VERSION,
      blockedPromptEnvelope:require('../twinleaf/agent50-first-blocked-prompt-envelope.cjs').VERSION
    },
    selectedV0SetupAdapters:[
      'agent6-go-first-choice',
      'agent50-owner-starting-basic-choice',
      'agent50-owner-public-acknowledgements',
      'agent50-owner-mandatory-showcards',
      'agent50-first-blocked-prompt-envelope'
    ],
    selectedV0SetupAndQuarantineStack:[
      'nativeRawStateQuarantine',
      'declineGoFirstBothSeats',
      'agent50AllEligibleInitialBasics',
      'publicMulliganAndWaitAcks',
      'mandatoryInTurnShowCards',
      'firstBlockedPromptEnvelope',
      'canonicalActorCommonRunner'
    ],
    diagnosticOnlyFlags:{
      nativeOwnerTrainerFallback:true,
      ownerFallbackDiagnosticView:true,
      actorGenericFallbackAttribution:true,
      quarantineAbortsBeforeOriginalNativeDecoder:true
    },
    rows,
    bothSeatsCaptured:rows.every(row=>
      row.status==='quarantined-first-owner-root-captured'),
    competitiveGamesQualified:0,estimatedWinRate:null,
    releaseQualified:false
  };
}

if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');

module.exports={VERSION,ENGINE_PIN,SEED,ACTION_LIMIT,HASH_PATHS,
  safeRootPrefix,runOne,run};
