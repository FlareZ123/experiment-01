'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {originalPrintings}=require('./agent2-vs-seeker-research-original-rank13-aba.cjs');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
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
const {withOwnerTreasurePrompts}=
  require('../twinleaf/agent2/treasure-owner-prompt-native.cjs');
const {VERSION:PROMPT_CONTRACT_VERSION}=
  require('../twinleaf/agent2-first-blocked-prompt-contract.cjs');
const {CODE}=require('../twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');
const {VERSION:GO_FIRST_VERSION}=require('../twinleaf/agent6-go-first-choice.cjs');
const {authenticatedSourceRanks}=require('./agent25-authenticated-source-admission.cjs');
const aichiDecklists=require('../../results/aichi-2026/full-decklists.json');

const VERSION='agent2-v8-common-first-owner-root-canary-v2';
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
  'simulation/evaluation/agent25-authenticated-source-admission.cjs',
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
  'simulation/twinleaf/agent49-mysterious-treasure-frontier.cjs',
  'simulation/twinleaf/agent2/treasure-owner-prompt-native.cjs',
  'simulation/twinleaf/agent5-generic-owner-trainer-opportunity.cjs',
  'simulation/twinleaf/agent50-native-owner-trainer-pass-bridge.cjs',
  'simulation/twinleaf/agent41-paper-prompt-contract-portfolio.cjs',
  'results/aichi-2026/full-decklists.json'
]);

function sha256(value){
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function safeRootPrefix(native,initial=false){
  if(!Array.isArray(native?.rootActionLedger))return [];
  const selected=initial?native.rootActionLedger.slice(0,24):
    native.rootActionLedger.slice(-12);
  return selected.map(root=>({
    actionOrdinal:root.actionOrdinal??null,
    turnBefore:root.turnBefore??null,
    turnAfter:root.turnAfter??null,
    playerSlot:root.playerSlot??null,
    action:root.action??null,
    pendingPrompt:root.pendingPrompt??null
  }));
}

function runOne(candidateSeat,cards,{
  mysteriousTreasureRoot=false,treasurePaymentChoice='crispin',
  ownerMailFollowupFrame=false,firstRegidragoBenchGrass=false,
  firstCrispinSeekerRecovery=false,
  earlyRegidragoCompressor=false,
  candidateNaturalEvolutionRoot=false
}={}){
  assert.ok(candidateSeat===0||candidateSeat===1);
  const slot=candidateSeat===0?'A':'B';
  const trial={
    id:[SOURCE_RANK,0,slot,CANDIDATE_ID].join(':'),
    rank:SOURCE_RANK,repeat:0,candidateSlot:slot,
    candidateId:CANDIDATE_ID,seed:SEED
  };
  const frameName=mysteriousTreasureRoot?
    'Agent2 v8 original rank13/rank3 Treasure opt-in diagnostic':
    'Agent2 selected-v8 common-policy original rank13/rank3 one-game diagnostic';
  const candidatePrintedCards=aichiDecklists.decks.find(
    deck=>deck.rank===CANDIDATE_RANK)?.cards;
  assert.ok(Array.isArray(candidatePrintedCards));
  assert.equal(candidatePrintedCards.reduce((n,x)=>n+x.count,0),60);
  // runDevelopment is the high-level policy runner: it composes the
  // canonical actor-only root policy around executeDevelopment. Inject one
  // explicit original candidate deck and one registered source matchup.
  const runner=options=>runDevelopment({
    ...options,
    registeredTrials:[trial],
    registeredFrameName:frameName,
    registeredCandidateDecks:{
      [CANDIDATE_ID]:{
        label:'Agent2 original Aichi rank13 Regidrago',
        cards:candidatePrintedCards
      }
    },
    allowSingleCandidateArm:true,
    actorOnlyComposition:true,
    sourceIndependentCommonPolicy:true,
    bilateralSpecialEnergyRoot:true,
    nativeAcceptedTargets:true,
    // Defaults preserve Agent2's original first-Pass quarantine gate.
    // Only the named native follow-up treatment removes that diagnostic abort.
    nativeOwnerTrainerFallback:!ownerMailFollowupFrame,
    ownerFallbackDiagnosticView:!ownerMailFollowupFrame,
    firstBlockedPromptContractObserver:!ownerMailFollowupFrame,
    actorOnlySingleSearch:false,
    actorGenericFallbackAttribution:!ownerMailFollowupFrame,
    mysteriousTreasureRoot,
    mysteriousTreasureMuscleBandPayment:
      mysteriousTreasureRoot&&treasurePaymentChoice==='muscle-band',
    firstRegidragoBenchGrass,firstCrispinSeekerRecovery,
    earlyRegidragoCompressor,
    actorNaturalEvolutionRoot:candidateNaturalEvolutionRoot,
    actorGarbodorResponseOwnerSeat:
      candidateNaturalEvolutionRoot?candidateSeat:null,
    allowAdditionalOriginalSourceRanks:true,
    nativeRootActionLimit:ACTION_LIMIT
  });

  // Match the selected v8 composition: common Thorns root, selected v0
  // setup/quarantine stack, v4 attack/Capture Energy frontier, v5 innermost
  // Prize/promotion prompts, and v7 Volt transfer. One diagnostic trial is
  // injected into the same common executeDevelopment policy.
  const execute=()=>withCommonOwnerThornsRoot(()=>runSelectedIssue25V0({
    runner,
    layers:{firstBlockedPromptEnvelope:!mysteriousTreasureRoot?
      withStewardOwnerPromptFrontier:
      next=>{
        // Install INSIDE the selected-v0 raw-State quarantine, ahead of the
        // real canonical owner runner; unsupported prompts still delegate
        // through the existing quarantine rather than decoding raw State.
        const hooked=withOwnerTreasurePrompts(
          ()=>withStewardOwnerPromptFrontier(next),
          {paymentChoice:treasurePaymentChoice});
        return {result:hooked.result.result,
          audit:{...(hooked.result.audit??{}),
            ownerTreasurePrompts:hooked.audit}};
      }},
    registeredTrialIds:[trial.id],
    allowSingleRegisteredTrial:true,
    nativeRootActionLimit:ACTION_LIMIT
  }));
  const owner=()=>withStewardInnermostOwnerPrompts(execute);
  const volt=withOwnerVoltAcrossNativeMatches(owner);
  const ownerWrapped=volt.result;
  const selected=ownerWrapped.result;
  const nativeRow=selected.rawDevelopment?.rows?.[0]??null;
  const native=nativeRow?.nativeAbortEvidence??null;
  const actor=nativeRow?.actorNativeTrainerFallbackAbortAudit??null;
  const first=actor?.firstUnsupportedOwnerRoot??null;
  const rawPrompt=nativeRow?.firstBlockedPromptContract??null;
  const prompt=rawPrompt?.promptType?rawPrompt:null;
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
  // runDevelopment returns its manifest fields at the top level. The
  // selected-v0 wrapper exposes that complete object as rawDevelopment.
  const activeDevelopmentOutput=selected.rawDevelopment??null;
  const activeRunDevelopmentRegistration=activeDevelopmentOutput?{
    registeredTrialCount:activeDevelopmentOutput.registeredTrialCount??null,
    registeredTrialGroupCount:activeDevelopmentOutput.registeredTrialGroupCount??null,
    registeredSourceRanks:activeDevelopmentOutput.registeredSourceRanks??null,
    registeredCandidateIds:activeDevelopmentOutput.registeredCandidateIds??null,
    registeredCandidateArmMode:activeDevelopmentOutput.registeredCandidateArmMode??null,
    sourceRegistration:activeDevelopmentOutput.sourceRegistration??null,
    allowAdditionalOriginalSourceRanks:true,
    sourceAdmissionScope:
      'published 60-card name/count roster only; not Japanese physical-print certification'
  }:null;
  const activeRunDevelopmentRegistrationValid=Boolean(
    activeDevelopmentOutput?.registeredTrialCount===1&&
    activeDevelopmentOutput?.registeredTrialGroupCount===1&&
    JSON.stringify(activeDevelopmentOutput?.registeredSourceRanks??null)===
      JSON.stringify([SOURCE_RANK])&&
    JSON.stringify(activeDevelopmentOutput?.registeredCandidateIds??null)===
      JSON.stringify([CANDIDATE_ID])&&
    activeDevelopmentOutput?.registeredCandidateArmMode==='single-candidate-arm'&&
    activeDevelopmentOutput?.sourceRegistration===frameName
  );
  const valid=activeRunDevelopmentRegistrationValid&&
    first?.ownerView?.decisionKind==='owner-root'&&
    typeof first.ownerVisibleSha256==='string'&&
    actor?.attemptedUnsupportedPasses===1&&
    Boolean(actor?.firstUnsupportedOwnerRoot)&&
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
    quarantineMessage:String(nativeRow?.error?.message??selected.diagnostic.thrownMessage??'').slice(0,250),
    rootActionPrefixSha256:native?.rootActionLedgerSha256??null
  }:null;

  return {
    trialId:trial.id,candidateRank:CANDIDATE_RANK,
    sourceRank:SOURCE_RANK,candidateSeat,sourceSeat:1-candidateSeat,
    seed:SEED,actionLimit:ACTION_LIMIT,
    // Native setup hashes and terminal indicators are read-only experiment
    // receipts; hidden card identities are never passed to actor decisions.
    sourceDealFingerprint:nativeRow?.sourceDealFingerprint??null,
    fullPhysicalDealFingerprint:nativeRow?.fullPhysicalDealFingerprint??null,
    nativeFinished:nativeRow?.finished===true,
    nativeWinner:nativeRow?.finished===true?nativeRow.winner??null:null,
    nativeEndReason:nativeRow?.endReason??null,
    nativeFinalPrizes:nativeRow?.finalPrizes??null,
    nativeActionCount:nativeRow?.actionCount??null,
    ownerTreasureRootOptIn:mysteriousTreasureRoot,
    firstRegidragoBenchGrassOptIn:firstRegidragoBenchGrass,
    firstCrispinSeekerRecoveryOptIn:firstCrispinSeekerRecovery,
    earlyRegidragoCompressorOptIn:earlyRegidragoCompressor,
    ownerTreasurePaymentChoice:mysteriousTreasureRoot?
      treasurePaymentChoice:null,
    candidateDeckSha256:sha256(cards.candidate),
    sourceDeckSha256:sha256(cards.source),
    status,firstUnsupportedOwnerRoot:first,
    nativeErrorText:typeof nativeRow?.error==='string'?
      nativeRow.error.slice(0,2200):null,
    nativeDirectErrorMessage:String(nativeRow?.error?.message??'').slice(0,650),
    nativeDirectErrorCode:nativeRow?.error?.code??null,
    nativeDirectErrorStack:String(nativeRow?.error?.stack??'').slice(0,1400),
    firstRootProvenance,blockedPromptContract:prompt,
    activeRunDevelopmentRegistration,
    activeRunDevelopmentRegistrationValid,
    nativeAbortEvidence:{
      actionOrdinal:native?.actionOrdinal??null,
      rootActionCount:native?.rootActionCount??null,
      rootActionLedgerSha256:native?.rootActionLedgerSha256??null,
      acceptedRootPrefix:safeRootPrefix(native),
      initialAcceptedRootPrefix:safeRootPrefix(native,true)
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
      ownerTreasurePrompts:selected.diagnostic.audit?.
        firstBlockedPromptEnvelope?.ownerTreasurePrompts??null,
      innermostOwnerPrompts:ownerWrapped.audit??null,
      ownerVolt:volt.audit??null
    },
    selectedV0Manifest:selected.manifest,
    selectedV0Diagnostic:selected.diagnostic,
    runDevelopmentManifest:activeRunDevelopmentRegistration,
    runDevelopmentOutputSummary:activeDevelopmentOutput?{
      schema:activeDevelopmentOutput.schema??null,
      registeredTrialCount:activeDevelopmentOutput.registeredTrialCount??null,
      registeredTrialGroupCount:activeDevelopmentOutput.registeredTrialGroupCount??null,
      registeredSourceRanks:activeDevelopmentOutput.registeredSourceRanks??null,
      registeredCandidateIds:activeDevelopmentOutput.registeredCandidateIds??null,
      registeredCandidateArmMode:activeDevelopmentOutput.registeredCandidateArmMode??null,
      sourceRegistration:activeDevelopmentOutput.sourceRegistration??null,
      rowsReturned:Array.isArray(activeDevelopmentOutput.rows)?
        activeDevelopmentOutput.rows.length:null,
      attempted:activeDevelopmentOutput.attempted??null,
      errors:activeDevelopmentOutput.errors??null,
      competitiveQualifiedGames:
        activeDevelopmentOutput.competitiveQualifiedGames??null
    }:null,
    releaseQualified:false,competitiveGamesQualified:0,
    estimatedWinRate:null
  };
}

/**
 * Require both physical orientations to reach the same fail-closed
 * owner-root diagnostic with an explicit active rank-3 registration.
 * @param {unknown} rows
 * @returns {boolean}
 */
function hasReleaseQualifiedFirstOwnerRoot(rows){
  if(!Array.isArray(rows)||rows.length!==2)return false;
  const candidateSeats=new Set(rows.map(row=>row?.candidateSeat));
  if(candidateSeats.size!==2||!candidateSeats.has(0)||!candidateSeats.has(1))
    return false;
  return rows.every(row=>{
    const registration=row?.activeRunDevelopmentRegistration;
    const ownerRoot=row?.firstUnsupportedOwnerRoot;
    const native=row?.nativeAbortEvidence;
    const actor=row?.actorAbortCounters;
    const selectedV0=row?.selectedV0;
    const expectedSlot=row?.candidateSeat===0?'A':'B';
    return row?.status==='quarantined-first-owner-root-captured'&&
      row?.activeRunDevelopmentRegistrationValid===true&&
      row?.candidateRank===CANDIDATE_RANK&&
      row?.sourceRank===SOURCE_RANK&&
      (row?.candidateSeat===0||row?.candidateSeat===1)&&
      row?.sourceSeat===1-row?.candidateSeat&&
      row?.seed===SEED&&
      row?.actionLimit===ACTION_LIMIT&&
      row?.trialId===[SOURCE_RANK,0,expectedSlot,CANDIDATE_ID].join(':')&&
      registration?.registeredTrialCount===1&&
      registration?.registeredTrialGroupCount===1&&
      JSON.stringify(registration?.registeredSourceRanks??null)===
        JSON.stringify([SOURCE_RANK])&&
      JSON.stringify(registration?.registeredCandidateIds??null)===
        JSON.stringify([CANDIDATE_ID])&&
      registration?.registeredCandidateArmMode==='single-candidate-arm'&&
      registration?.allowAdditionalOriginalSourceRanks===true&&
      ownerRoot?.ownerView?.decisionKind==='owner-root'&&
      /^[a-f0-9]{64}$/.test(ownerRoot?.ownerVisibleSha256??'')&&
      ownerRoot?.hiddenSourceIdentitiesIncluded===false&&
      actor?.attemptedUnsupportedPasses===1&&
      actor?.firstUnsupportedOwnerRootCaptured===true&&
      selectedV0?.rawDecoderExecuted===false&&
      selectedV0?.fallbackCalls===1&&
      selectedV0?.thrownCode===CODE&&
      Number.isSafeInteger(native?.actionOrdinal)&&
      native?.rootActionCount===native.actionOrdinal;
  });
}

function run({mysteriousTreasureRoot=false,treasurePaymentChoice='crispin',
  ownerMailFollowupFrame=false,firstRegidragoBenchGrass=false,
  firstCrispinSeekerRecovery=false,earlyRegidragoCompressor=false,
  candidateNaturalEvolutionRoot=false}={}){
  const admittedSourceRanks=authenticatedSourceRanks(aichiDecklists,true);
  assert.ok(admittedSourceRanks.includes(SOURCE_RANK),
    'Rank 3 must be present in the published 60-card source roster');
  const resolvedSourceAndPolicyHashes=HASH_PATHS.map(hashRegisteredFile);
  const cards=originalPrintings();
  const rows=[
    runOne(0,cards,{mysteriousTreasureRoot,treasurePaymentChoice,
      ownerMailFollowupFrame,firstRegidragoBenchGrass,
      firstCrispinSeekerRecovery,earlyRegidragoCompressor,
      candidateNaturalEvolutionRoot}),
    runOne(1,cards,{mysteriousTreasureRoot,treasurePaymentChoice,
      ownerMailFollowupFrame,firstRegidragoBenchGrass,
      firstCrispinSeekerRecovery,earlyRegidragoCompressor,
      candidateNaturalEvolutionRoot})
  ];
  return {
    schema:VERSION,enginePin:ENGINE_PIN,
    runnerMode:mysteriousTreasureRoot?
      'runDevelopment-canonical-actor-only-policy+treasure-root-optin':
      'runDevelopment-canonical-actor-only-policy',
    sourceAdmissionReceipt:{
      allowAdditionalOriginalSourceRanks:true,
      eligibleOriginalSourceRanks:admittedSourceRanks,
      scope:'published original 60-card name/count lists; no Japanese physical-print or paper-legality certification'
    },
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
      mysteriousTreasureRoot,
      ownerMailFollowupFrame,firstRegidragoBenchGrass,
      firstCrispinSeekerRecovery,earlyRegidragoCompressor,
      candidateNaturalEvolutionRoot,
      treasurePaymentChoice:mysteriousTreasureRoot?treasurePaymentChoice:null,
      nativeOwnerTrainerFallback:!ownerMailFollowupFrame,
      ownerFallbackDiagnosticView:!ownerMailFollowupFrame,
      actorGenericFallbackAttribution:!ownerMailFollowupFrame,
      quarantineAbortsBeforeOriginalNativeDecoder:true
    },
    rows,
    bothSeatsCaptured:hasReleaseQualifiedFirstOwnerRoot(rows),
    canaryGate:{
      expectedPhysicalOrientations:2,
      returnedRows:rows.length,
      registeredSourceRank:SOURCE_RANK,
      registeredCandidateId:CANDIDATE_ID,
      passed:hasReleaseQualifiedFirstOwnerRoot(rows)
    },
    competitiveGamesQualified:0,estimatedWinRate:null,
    releaseQualified:false
  };
}

if(require.main===module){
  const result=run();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(!result.bothSeatsCaptured){
    process.stderr.write(
      'Selected-v8 first-owner-root canary gate failed; inspect the uploaded receipt.\n'
    );
    process.exitCode=1;
  }
}

module.exports={VERSION,ENGINE_PIN,SEED,ACTION_LIMIT,HASH_PATHS,
  safeRootPrefix,hasReleaseQualifiedFirstOwnerRoot,runOne,run};
