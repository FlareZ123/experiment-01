'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {scheduledArms,assertManifest}=
  require('./agent41-crossrank-actual-decisions.cjs');
const {withBilateralCommonCandidatePolicy,POLICY_VERSION}=
  require('./agent41-bilateral-common-policy.cjs');
const {candidateAttackSettlement}=
  require('./agent37-candidate-attack-settlement.cjs');
const {withNativePaperSupporterDiscipline,VERSION:PAPER_SUPPORTER_VERSION}=
  require('../twinleaf/agent41-paper-supporter-discipline.cjs');
const {withCanonicalActorOnlyPolicy,VERSION:ACTOR_COMPOSITION_VERSION}=
  require('./agent7-canonical-actor-composition.cjs');

const root=path.resolve(__dirname,'../..');
const registration=JSON.parse(fs.readFileSync(path.join(root,
  'results/aichi-2026/registrations/agent41-crossrank-r6-r11-v1-20261019.json'),'utf8'));

/**
 * Two already published, previously inspected v1 rank/seed/seat streams.
 * Each candidate receives precisely the same new v0 executable algorithm.
 * These are DEVELOPMENT FIXTURES; neither seed is prospective held-out data.
 * @returns {object[]}
 */
function developmentTrials(){
  const tests=new Set(['6:0:A','11:2:B']);
  const selected=scheduledArms().filter(row=>
    tests.has([row.rank,row.repeat,row.candidateSlot].join(':')));
  assert.equal(selected.length,4);
  // Structural list equality must also survive isolated VM tests whose
  // scheduledArms fixture returns arrays from a distinct JavaScript realm.
  assert.equal(JSON.stringify(selected.map(row=>row.id).sort()),
    JSON.stringify([
      '11:2:B:champion-reference','11:2:B:new-moon-lockbreaker-v1',
      '6:0:A:champion-reference','6:0:A:new-moon-lockbreaker-v1'
    ].sort()));
  return selected;
}

/**
 * Previously selected development-only actual-source-first test streams.
 * Rank 11 was selected after observing a successful Tool-Garbodor source
 * setup (Agent 9/11), so this sample MUST NOT enter a prospective denominator.
 * Rank 6 reverses the candidate physical seat of the archived 6:0:A seed;
 * that creates a distinct physical deal, never an interchangeable replay.
 * @returns {object[]}
 */
function sourceFirstPressureTrials(){
  const originals=developmentTrials();
  return originals.map(row=>{
    const candidateSlot='B';
    const seed=row.rank===11?482443328:407516727;
    const id=[row.rank,'retrospective-sourcefirst',row.repeat,
      candidateSlot,row.candidateId].join(':');
    return {...row,candidateSlot,seed,id,
      retrospectiveSelection:row.rank===11?
        'post-observation Tool-Garbodor source success':
        'opposite physical seat of historical rank6 seed'};
  });
}

/** @param {unknown} value @returns {string} */
const sha256=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

/**
 * Label post-source decisions only after the named autonomous source line
 * actually completed. No-opportunity and aborted attempts are not replies.
 * This is still a diagnostic ordering rule, not attack-effect certification.
 *
 * @param {object[]} rootTrace Genuine post-choice Store ledger.
 * @param {6|11} rank
 * @param {object} sourceAudit
 * @param {0|1} candidateSeat
 * @returns {{root:object|null,status:string,sourceTurn:number|null}}
 */
function firstPostSourceDecision(rootTrace,rank,sourceAudit,candidateSeat){
  assert.ok(rank===6||rank===11);
  assert.ok(candidateSeat===0||candidateSeat===1);
  let sourceTurn=null;
  if(rank===11){
    if(sourceAudit?.completed===true &&
        Number.isSafeInteger(sourceAudit.opportunityTurn) &&
        sourceAudit.opportunityTurn>=1) {
      sourceTurn=sourceAudit.opportunityTurn;
    }
  }else{
    if(sourceAudit?.turn2?.completed===true) sourceTurn=2;
    else if(sourceAudit?.turn3?.completed===true) sourceTurn=3;
  }
  if(sourceTurn===null) return {
    root:null,status:'no-completed-source-line',sourceTurn:null
  };
  // Only an actor-owned, non-prompt action on the immediately following
  // global turn can witness the first candidate response. A later action
  // may follow an intervening source turn and is not the same reply window.
  const root=rootTrace.find(row=>row.playerSlot===candidateSeat &&
    row.turnBefore===sourceTurn+1 &&
    row.action!=='ResolvePromptAction')??null;
  return {root,status:root?'candidate-root-after-source-line':
    'no-candidate-root-on-immediate-next-turn',sourceTurn};
}

/**
 * Trace the real Store source line and prompt-closed reply using the same
 * offline evidence packet as the rank6/rank11 historical cross-rank audit.
 * This packet never asserts legal play, full printed effect or win strength.
 *
 * @param {object} game Genuine engine execution.
 * @param {6|11} rank Registered source rank.
 * @param {object} sourceAudit Archived source policy completion.
 * @param {0|1} sourceSeat Source physical seat.
 * @returns {object|null}
 */
function sourceLineReplyPacket(game,rank,sourceAudit,sourceSeat){
  let turn=null;
  if(rank===6){
    if(sourceAudit?.turn2?.completed===true)turn=2;
    else if(sourceAudit?.turn3?.completed===true)turn=3;
  }else if(rank===11 && sourceAudit?.completed===true &&
    Number.isSafeInteger(sourceAudit.opportunityTurn) &&
    sourceAudit.opportunityTurn>=1){
    turn=sourceAudit.opportunityTurn;
  }
  if(turn===null)return null;
  const {buildBilateralReplyPacket}=
    require('./aichi-bilateral-reply-packet.cjs');
  return buildBilateralReplyPacket(game,{
    sourceSeat,triggerTurn:turn,
    expectedSourceAction:rank===6?'AttackAction':'PlayCardAction',
    expectedSourceDetail:rank===6?'Volt Cyclone':'Boost Shake',
    requirePublicAttackTransitions:true
  });
}

/**
 * Keep only owner-slot Pass decisions and the public detached-Store
 * attack announcement probes captured after the action had already been
 * chosen. This samples at most eight Pass roots globally across both actors.
 * Copy and other granted attacks may be absent from the enumeration.
 *
 * @param {object[]} decisionTrace Selective, post-choice Store trace.
 * @param {0|1} candidateSeat Real candidate seat.
 * @returns {{summary:object,samples:object[]}}
 */
function candidatePostChoicePassEvidence(decisionTrace,candidateSeat){
  assert.ok(candidateSeat===0||candidateSeat===1);
  const passes=decisionTrace.filter(row=>
    row.playerSlot===candidateSeat&&row.action==='PassTurnAction');
  const samples=passes.filter(row=>row.attackPassProbe)
    .map(row=>({
      ordinal:row.actionOrdinal,turn:row.turnBefore,
      activePokemon:row.attackPassProbe.activePokemon??null,
      auditError:row.attackPassProbe.auditError??null,
      tested:row.attackPassProbe.tested??[],
      truncated:row.attackPassProbe.truncated??false
    }));
  const perfectionSamples=passes.filter(row=>row.perfectionPassProbe)
    .map(row=>({
      ordinal:row.actionOrdinal,turn:row.turnBefore,
      publicBoardBeforePass:row.publicBoardBeforePass??null,
      ownerHandBeforePass:row.decisionHandBefore?.perspectiveSeat===candidateSeat ?
        (row.decisionHandBefore.ownHandPrintings??null):null,
      ...row.perfectionPassProbe
    }));
  return {
    summary:{
      observedCandidatePasses:passes.length,
      boundedProbeCount:samples.length,
      unprobedCandidatePasses:passes.length-samples.length,
      cloneAcceptedPasses:samples.filter(row=>
        row.tested.some(attack=>attack.engineAcceptedAnnouncement===true)).length,
      observedPerfectionPasses:perfectionSamples.length,
      acceptedPerfectionActivations:perfectionSamples.filter(row=>
        row.activationAccepted===true).length,
      nonemptyCopiedAttackMenus:perfectionSamples.filter(row=>
        row.validAttackNames?.length>0).length,
      boundedAndIncomplete:true,
      caveat:'Only printed/Tool-visible attack announcements on at most 8 globally sampled Pass roots'
    },
    samples,
    perfectionSamples
  };
}

/**
 * Apply the same owner-visible delayed-resource tactic to either candidate
 * physical seat. This is a historical-only opt-in, not a strength treatment.
 * The actual tactic performs owner-deck selection only in its legal prompt.
 * @param {0|1} candidateSeat
 * @param {boolean} enabled
 * @returns {{newMoonAttackPayloadCompressorSeat?:0|1}}
 */
function commonPayloadOption(candidateSeat,enabled,lateWindow=false){
  assert.ok(candidateSeat===0||candidateSeat===1);
  if(!enabled)return {};
  return lateWindow?{newMoonAttackPayloadCompressorLateSeat:candidateSeat}:
    {newMoonAttackPayloadCompressorSeat:candidateSeat};
}

/**
 * A real frozen Store development arm. The v1 source-side policy is retained,
 * the v1 candidate-only New Moon policy is deliberately replaced by common v0.
 * @param {object} trial
 * @param {Map<string,object>} candidates
 * @returns {object}
 */
function executeDevelopment(trial,candidates,{
  compressorPayload=false,opportunityAudit=false,lateCompressorPayload=false,
  garbotoxinWindow=false,initializationWindow=false,
  mandatoryOptionFallback=false,paperSupporterQuota=false,
  paperSupporterComparisonTrace=false,proposalStateAudit=false,
  nativeProposalValidationAudit=false,nativeProposalTapeOrdinal=null,
  nativeOpponentHiddenReadAudit=false,nativeActionInputWitness=false,
  nativeActionInputTapeOrdinal=null
}={}){
  if(initializationWindow)assert.equal(trial.rank,6,
    'Initialization passive window belongs only to rank 6');
  if(garbotoxinWindow)assert.equal(trial.rank,11,
    'Garbodor power window belongs only to rank 11');
  const {runMatch}=require('../twinleaf/headless.cjs');
  const {withRank11DirectBoostShake}=
    require('../twinleaf/rank11-direct-boostshake.cjs');
  const {withBroadThornsSourceAttack,discardOrder}=
    require('../twinleaf/rank6-broad-thorns-policy.cjs');
  const prepared=candidates.get(trial.candidateId);
  const opponent=prepared.plan.opponents.find(x=>x.rank===trial.rank);
  assert.equal(opponent?.status,'ready');
  const candidateSeat=trial.candidateSlot==='A'?0:1;
  const sourceSeat=1-candidateSeat;
  const payloadResource=commonPayloadOption(candidateSeat,
    compressorPayload,lateCompressorPayload);
  const candidateCards=prepared.plan.candidate.cards;
  assert.equal(candidateCards.length,60);
  assert.equal(opponent.cards.length,60);
  const request={
    deckA:candidateSeat===0?candidateCards:opponent.cards,
    deckB:candidateSeat===1?candidateCards:opponent.cards,
    seed:trial.seed,maxActions:registration.maxRootActions,
    label:'agent41-bilateral-v2-common-policy-development-'+trial.id,
    ...registration.frozenFlags,
    // Shared v2 mechanical integration: intercept every actual actor's
    // owner-visible Trainer/Energy hand-play lock at final root dispatch.
    // This changes the retrospective policy version, never the historical v1
    // deal or seed. A veto's Pass fallback is still strategically unqualified.
    enforceVisiblePlayLockBothSeats:true,
    // Both-seat opt-in: preserve legacy development policy if omitted.
    mandatoryOptionFallback,
    // Reject silently canceled noncancelable prompts under the same opt-in.
    // Frozen registration already requires strictPromptValidation.
    enforceSelectOptionLegality:mandatoryOptionFallback,
    ...payloadResource,
    capturePublicAttackTransitions:true,
    // Read-only, post-dispatch evidence for every native or delegated
    // candidate attack, including a redacted Poltergeist-base audit.
    capturePoltergeistEffectTrace:true,
    captureFinalPublicBoard:true,
    captureAttackPassProbes:true,
    capturePerfectionPassProbeSeat:candidateSeat,
    captureInitialSourceDealFingerprintSeat:sourceSeat
  };
  let ownerCompressorAudit=null;
  let garbotoxinWindowAudit=null;
  let initializationWindowAudit=null;
  let paperSupporterAudit=null;
  let supporterProposalIntegrity=null;
  let nativeValidationAudit=null;
  let nativeHiddenReadAudit=null;
  let nativeActionInputAudit=null;
  const runWithActionInputWitness=()=>{
    if(!nativeActionInputWitness)return runMatch(request);
    const base=path.join(root,'vendor/twinleaf/ptcg-server/output');
    const SimpleTacticsAi=require(path.join(base,
      'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
    const Store=require(path.join(base,'game/store/store')).Store;
    const witnessed=require('../twinleaf/agent23-native-decision-dispatch-witness.cjs')
      .withNativeDecisionDispatchWitness(()=>runMatch(request),
        {SimpleTacticsAi,Store,maxRecords:512,
          tapeOrdinal:nativeActionInputTapeOrdinal});
    nativeActionInputAudit=witnessed.audit;
    return witnessed.result;
  };
  const runWithNativeHiddenReadObserver=()=>{
    if(!nativeOpponentHiddenReadAudit)return runWithActionInputWitness();
    const {SimpleTacticsAi}=require(path.join(root,
      'vendor/twinleaf/ptcg-server/output/simple-bot/simple-tactics-ai'));
    const observed=require('../twinleaf/agent41-native-opponent-hidden-read-observer.cjs')
      .withNativeOpponentHiddenReadObserver(SimpleTacticsAi,
        runWithActionInputWitness,{seat:candidateSeat,turn:3});
    nativeHiddenReadAudit=observed.audit;
    return observed.result;
  };
  const runWithPowerWindow=()=>{
    if(!garbotoxinWindow)return runWithNativeHiddenReadObserver();
    const observed=require('../twinleaf/agent41-live-garbotoxin-ability-window.cjs')
      .withLiveGarbodorAbilityWindow(runWithNativeHiddenReadObserver,{
        sourceSeat,candidateSeat,turn:2
      });
    garbotoxinWindowAudit=observed.audit;
    return observed.result;
  };
  const runWithReadOnlyAudit=()=>{
    if(!opportunityAudit)return runWithPowerWindow();
    const output=require('../twinleaf/owner-compressor-opportunity-audit.cjs')
      .withOwnerCompressorOpportunityAudit(candidateSeat,runWithPowerWindow);
    ownerCompressorAudit=output.audit;
    return output.result;
  };
  const runWithInitializationWindow=()=>{
    if(!initializationWindow)return runWithReadOnlyAudit();
    const observed=require('../twinleaf/agent39-live-initialization-window.cjs')
      .withLiveInitializationWindow(runWithReadOnlyAudit,{sourceSeat,candidateSeat});
    initializationWindowAudit=observed.audit;
    return observed.result;
  };
  const runWithPaperSupporterQuota=()=>{
    if(!paperSupporterQuota)return runWithInitializationWindow();
    const guarded=withNativePaperSupporterDiscipline(
      runWithInitializationWindow);
    paperSupporterAudit=guarded.audit;
    return guarded.result;
  };
  const runWithProposalIntegrity=()=>{
    if(!proposalStateAudit)return runWithPaperSupporterQuota();
    const observed=require('../twinleaf/agent22-supporter-proposal-state-audit.cjs')
      .withSupporterProposalStateAudit(runWithPaperSupporterQuota);
    supporterProposalIntegrity=observed.audit;
    return observed.result;
  };
  const runWithNativeValidationAudit=()=>{
    if(!nativeProposalValidationAudit)return runWithProposalIntegrity();
    const observed=require('../twinleaf/agent41-native-proposal-validation-audit.cjs')
      .withNativeProposalValidationAudit(runWithProposalIntegrity,{
        tapeOrdinal:nativeProposalTapeOrdinal
      });
    nativeValidationAudit=observed.audit;
    return observed.result;
  };
  const common=()=>withBilateralCommonCandidatePolicy(candidateSeat,
    runWithNativeValidationAudit);
  let game,sourceAudit,commonAudit;
  if(trial.rank===11){
    const played=withRank11DirectBoostShake(sourceSeat,common,
      {k0AvoidAllGarbodorHeld:true,k1AvoidMissingGarbodor:true});
    sourceAudit=played.policyAudit;
    game=played.result.result;
    commonAudit=played.result.policyAudit;
  }else{
    const allowedDiscards=discardOrder.slice(0,-5);
    const played=withBroadThornsSourceAttack(()=>
      withBroadThornsSourceAttack(common,
        {seat:sourceSeat,turn:3,discardPriority:allowedDiscards}),
      {seat:sourceSeat,turn:2,discardPriority:allowedDiscards});
    sourceAudit={
      turn2:{started:played.started,completed:played.completed,
        abortReason:played.abortReason},
      turn3:{started:played.result.started,completed:played.result.completed,
        abortReason:played.result.abortReason}
    };
    commonAudit=played.result.result.policyAudit;
    game=played.result.result.result;
  }
  assert.equal(commonAudit.version,POLICY_VERSION);
  assert.equal(game.seed,trial.seed);
  assert.equal(game.engine,'twinleafgg/'+registration.enginePin);
  assert.equal(game.verifiedByDrawLog,true);
  assert.equal(game.promptValidationMode,'predispatch-prompt-validate');
  const declared=game.attackDeclarationTrace||[];
  // Full, actor-filtered, prompt-closed public consequence packet.
  // This is observational only and cannot certify a legal competitive game.
  const candidateSettlement=candidateAttackSettlement(game,candidateSeat);
  assert.equal(candidateSettlement.declarations,
    declared.filter(row=>row.playerSlot===candidateSeat).length);
  const firstSource=game.decisionTrace.find(row=>
    row.playerSlot===sourceSeat &&
    Array.isArray(row.decisionHandBefore?.ownHandPrintings));
  const ownerFirst=firstSource?.decisionHandBefore?.ownHandPrintings??null;
  const packet=game.publicAttackTransitions||[];
  const acceptedAttackEvents=packet.filter(row=>
    row.declarations?.length && row.settled?.after);
  const sourceFirst=game.firstTurnSlot===sourceSeat;
  const rootTrace=game.rootActionLedger||[];
  // Independent postgame parser: count actual source/candidate G&H Play roots
  // and immediately following native SelectOption roots for both v0 controls
  // and the opt-in resolver. This cannot alter any gameplay decision.
  const {sourceGuzmaChoices}=
    require('../twinleaf/agent24-mandatory-source-exposure.cjs');
  assert.ok(Array.isArray(game.decisionTrace),
    'Native game must contain requested actual-actor decision trace');
  const nativeDecisionTrace=game.decisionTrace;
  // Post-game, both-seat native prompt choices are a separate semantic witness.
  // Preserve the older root-skeleton SHA unchanged for archived comparisons.
  const nativePromptChoices=require('../twinleaf/native-prompt-choice-evidence.cjs')
    .nativePromptChoiceEvidence(nativeDecisionTrace);
  const sourceGuzmaModalEvidence=
    sourceGuzmaChoices(nativeDecisionTrace,sourceSeat);
  const candidateGuzmaModalEvidence=
    sourceGuzmaChoices(nativeDecisionTrace,candidateSeat);
  const passiveEvidence=initializationWindow?
    require('./agent41-passive-rank6-pressure.cjs')
      .rank6PassivePressureEvidence(initializationWindowAudit,rootTrace,{
        sourceSeat,candidateSeat,sourceActuallyFirst:sourceFirst
      }):null;
  const candidateCompressorRoots=rootTrace.filter(row=>
    row.playerSlot===candidateSeat && row.action==='PlayCardAction' &&
    row.card==='Battle Compressor');
  const candidateOwnDeckSelectionEvidence=(game.decisionTrace||[])
    .filter(row=>row.playerSlot===candidateSeat &&
      row.cardSelection?.sourceZone==='deck' &&
      row.cardSelection.sourcePlayerSlot===candidateSeat)
    .map(row=>{
      const parentRootOrdinal=rootTrace.find(root=>
        root.actionOrdinal===row.actionOrdinal)?.initiatingRootActionOrdinal??null;
      const initiator=rootTrace.find(root=>
        root.actionOrdinal===parentRootOrdinal);
      return {
        ordinal:row.actionOrdinal,turn:row.turnBefore,
        parentRootOrdinal,
        initiatingAction:initiator?.action??null,
        initiatingCard:initiator?.card??null,
        selectedCards:row.cardSelection.selectedCards
      };
    });
  const sourceDeal=game.initialSourceDealFingerprint;
  assert.equal(sourceDeal?.seat,sourceSeat);
  assert.match(sourceDeal?.digestSha256,/^[0-9a-f]{64}$/);
  const candidateFollowup=firstPostSourceDecision(
    rootTrace,trial.rank,sourceAudit,candidateSeat);
  const sourceLinePacket=sourceLineReplyPacket(game,trial.rank,sourceAudit,sourceSeat);
  const passEvidence=candidatePostChoicePassEvidence(
    game.decisionTrace,candidateSeat);
  return {
    trial,qualifiesForCompetitiveInference:false,
    policyVersion:POLICY_VERSION+
      (paperSupporterQuota?'+'+PAPER_SUPPORTER_VERSION:'')+
      (mandatoryOptionFallback?'+MandatoryOptionDefaultFallback-v1-both-seats+SelectOptionLegalityGate-v1-both-seats':'')+
      (lateCompressorPayload?
      '+owner-compressor-late14-v1':(compressorPayload?'+owner-compressor-v1':'')),
    mandatoryOptionFallbackBothSeats:mandatoryOptionFallback,
    enforceSelectOptionLegalityBothSeats:mandatoryOptionFallback,
    ownerCompressorPayloadOptIn:compressorPayload,
    ownerCompressorLate14OptIn:lateCompressorPayload,
    ...(lateCompressorPayload?{
      candidateBattleCompressorRoots:candidateCompressorRoots.map(row=>({
        turn:row.turnBefore,ordinal:row.actionOrdinal,card:row.card})),
      candidateAttackDeclarationEvidence:declared.filter(row=>
        row.playerSlot===candidateSeat).map(row=>({
        ordinal:row.actionOrdinal,turn:row.turnBefore,
        attackName:row.attackName})),
      sourceAttackDeclarationEvidence:declared.filter(row=>
        row.playerSlot===sourceSeat).map(row=>({
        ordinal:row.actionOrdinal,turn:row.turnBefore,
        attackName:row.attackName}))
    }:{}),
    ...(opportunityAudit?{ownerCompressorOpportunityAudit:ownerCompressorAudit}:{}),
    ...(garbotoxinWindow?{garbotoxinWindowAudit}:{}),
    ...(initializationWindow?{
      initializationWindowAudit,rank6PassivePressure:passiveEvidence
    }:{}),
    finalDispatchVisiblePlayLockV2:game.livePlayLockGuardBothSeats===true,
    nativeSupporterQuotaQualified:paperSupporterQuota?
      paperSupporterAudit?.nativeSupporterQuotaQualified===true:'unverified',
    paperSupporterDiscipline:paperSupporterQuota?paperSupporterAudit:null,
    ...(proposalStateAudit?{supporterProposalIntegrity}:{}),
    ...(nativeProposalValidationAudit?{nativeValidationAudit}:{}),
    ...(nativeOpponentHiddenReadAudit?{
      nativeOpponentHiddenReadAudit:nativeHiddenReadAudit}:{}),
    ...(nativeActionInputWitness?{nativeActionInputAudit}:{}),
    sourceSeat,candidateSeat,sourceActuallyFirst:sourceFirst,
    verifiedFirstTurn:game.verifiedByDrawLog,
    actualStarterSeat:game.firstTurnSlot,
    firstTurnPlayerId:game.firstTurnPlayerId,
    firstTurnPlayerName:game.firstTurnPlayerName,
    firstDrawLogName:game.firstDrawLogName,
    sourceDealFingerprint:sourceDeal.digestSha256,
    sourceFirstOwnHandSha256:ownerFirst?sha256(ownerFirst):null,
    // Read-only owner K1 deck-search choices, for all historical arms.
    // Never give the real deck membership to a pre-search K0 policy.
    candidateOwnDeckSelectionEvidence,
    nativePromptChoices,
    policyAudit:commonAudit,sourceAudit,sourceLinePacket,
    supporterModalEvidence:{
      schema:'agent41-native-guzma-modal-both-seats-postgame-v1',
      nativeDecisionTraceAvailable:true,
      nativeDecisionTraceLength:nativeDecisionTrace.length,
      source:sourceGuzmaModalEvidence,
      candidate:candidateGuzmaModalEvidence,
      sourceObservedModalCount:sourceGuzmaModalEvidence.filter(row=>
        row.nativeOptionObserved).length,
      sourceNullModeCount:sourceGuzmaModalEvidence.filter(row=>
        row.modeResultIsNull===true).length,
      candidateObservedModalCount:candidateGuzmaModalEvidence.filter(row=>
        row.nativeOptionObserved).length,
      candidateNullModeCount:candidateGuzmaModalEvidence.filter(row=>
        row.modeResultIsNull===true).length,
      competitiveDecisionQualified:false
    },
    candidatePostChoicePassProbe:passEvidence.summary,
    candidatePassProbeSamples:passEvidence.samples,
    candidatePerfectionPassSamples:passEvidence.perfectionSamples,
    attackDeclarations:{
      source:declared.filter(r=>r.playerSlot===sourceSeat).length,
      candidate:declared.filter(r=>r.playerSlot===candidateSeat).length
    },
    settledPublicAttackCount:acceptedAttackEvents.length,
    // Unlike the legacy two-event summary below, this retains EVERY
    // candidate declaration and genuine next-source action, or its absence.
    candidateAttackSettlement:candidateSettlement,
    firstSettledPublicAttack:acceptedAttackEvents.slice(0,2).map(row=>({
      actionOrdinal:row.actionOrdinal,turnBefore:row.turnBefore,
      attacker:row.triggerPlayerSlot,chosen:row.declarations,
      prizesAfter:row.settled.prizesRemaining
    })),
    firstCandidatePostSourceRoot:candidateFollowup.root,
    candidateFollowupStatus:candidateFollowup.status,
    candidateFollowupSourceTurn:candidateFollowup.sourceTurn,
    actionCount:game.actions,turns:game.turns,
    finished:game.finished,winner:game.finished?game.winner:null,
    endReason:game.endReason,
    finalPrizes:game.prizesRemaining,finalBoard:game.finalPublicBoard??null,
    rootActionLedgerSha256:sha256(rootTrace),
    ...(paperSupporterComparisonTrace?{
      paperSupporterComparisonTrace:rootTrace.map(row=>({
        actionOrdinal:row.actionOrdinal,turnBefore:row.turnBefore,
        playerSlot:row.playerSlot,action:row.action,
        card:row.card??null,attack:row.attack??null
      }))
    }:{}),
    caveat:'Retrospectively selected development deal; common policy is not hidden-information safe or clock-calibrated'
  };
}

/** @returns {object} */
function runDevelopment({
  compressorPayload=false,opportunityAudit=false,lateCompressorPayload=false,
  mandatoryOptionFallback=false,nativePressureWindows=false,
  sourceFirstRetrospective=false,paperSupporterQuota=false,
  paperSupporterComparisonTrace=false,proposalStateAudit=false,
  nativeProposalValidationAudit=false,nativeProposalTapeOrdinal=null,
  nativeOpponentHiddenReadAudit=false,actorOnlyComposition=false,
  actorOnlySingleSearch=false,actorGenericFallbackAttribution=false,
  actorHandDiscard=false,
  nativeActionInputWitness=false,
  nativeActionInputTapeOrdinal=null
}={}){
  assertManifest();
  const {planAichi}=require('./aichi-pilot.cjs');
  const {loadNewMoonCandidate}=require('../../scripts/aichi-new-moon-candidate.cjs');
  const roster=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  const reference=roster.decks.find(x=>x.rank===1);
  assert.ok(reference);
  const candidateDecks=[
    ['champion-reference',{label:'champion-reference',cards:reference.cards}],
    ['new-moon-lockbreaker-v1',{
      label:'new-moon-lockbreaker-v1',cards:loadNewMoonCandidate().cards}]
  ];
  const prepared=new Map(candidateDecks.map(([id,manifest])=>
    [id,{plan:planAichi(manifest,{allowEquivalentBasicEnergies:true,
      allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true})}]));
  const rows=[];
  const scheduled=sourceFirstRetrospective?
    sourceFirstPressureTrials():developmentTrials();
  for(const trial of scheduled){
    try {
      const execute=()=>executeDevelopment(trial,prepared,{
        compressorPayload,opportunityAudit,lateCompressorPayload,
        mandatoryOptionFallback,paperSupporterQuota,paperSupporterComparisonTrace,
        proposalStateAudit,nativeProposalValidationAudit,nativeProposalTapeOrdinal,
        nativeOpponentHiddenReadAudit,nativeActionInputWitness,
        nativeActionInputTapeOrdinal,
        // An opt-in observational package, with each native Store observer
        // applicable to its own opposing source archetype only.
        initializationWindow:nativePressureWindows&&trial.rank===6,
        garbotoxinWindow:nativePressureWindows&&trial.rank===11
      });
      if(actorOnlyComposition){
        const observed=withCanonicalActorOnlyPolicy(execute,{},
          {ownerSingleSearch:actorOnlySingleSearch,
            genericFallbackAttribution:actorGenericFallbackAttribution,
            actorHandDiscard});
        rows.push({...observed.result,
          actorOnlyPolicyVersion:observed.audit.version,
          actorOnlyDecisionCoverage:observed.audit,
          qualifiesForCompetitiveInference:false});
      }else rows.push(execute());
    }
    catch(error){
      const veto=error?.paperSupporterQuotaEvidence??
        error?.cause?.paperSupporterQuotaEvidence??null;
      const nativeValidation=error?.nativeProposalValidationEvidence??
        error?.cause?.nativeProposalValidationEvidence??null;
      const nativeHiddenRead=error?.nativeHiddenReadEvidence??
        error?.cause?.nativeHiddenReadEvidence??null;
      rows.push({
        trial,status:veto?'paper-supporter-quota-veto':'engine-error',
        error:String(error?.stack||error),
        nativeSupporterQuotaQualified:veto?false:'unverified',
        paperSupporterDiscipline:veto,
        ...(nativeProposalValidationAudit?{
          nativeValidationAudit:nativeValidation}:{}),
        ...(nativeOpponentHiddenReadAudit?{
          nativeOpponentHiddenReadAudit:nativeHiddenRead}:{}),
        ...(nativeActionInputWitness?{
          nativeActionInputAudit:error?.nativeDecisionDispatchEvidence??null}:{}),
        qualifiesForCompetitiveInference:false
      });
    }
  }
  return {
    schema:lateCompressorPayload?
      'agent5-bilateral-common-policy-development-v0c-owner-compressor-late14-v1':
      (opportunityAudit?
      'agent5-bilateral-common-policy-development-v0c-readonly-opportunity-v1':
      (compressorPayload?
        'agent5-bilateral-common-policy-development-v0c-owner-compressor-v1':
        'agent41-bilateral-common-policy-development-v0c-live-lock-guard')),
    sourceRegistration:sourceFirstRetrospective?
      'Retrospective source-first selected exposure; rank11 chosen after source Tool-Garbodor success; not preregistered':
      'historical v1 selection; not v2 preregistration',
    enginePin:registration.enginePin,
    candidatePolicy:POLICY_VERSION+
      (paperSupporterQuota?'+'+PAPER_SUPPORTER_VERSION:'')+
      (mandatoryOptionFallback?'+MandatoryOptionDefaultFallback-v1-both-seats+SelectOptionLegalityGate-v1-both-seats':'')+
      (lateCompressorPayload?
      '+owner-compressor-late14-v1':(compressorPayload?'+owner-compressor-v1':'')),
    mandatoryOptionFallbackBothSeats:mandatoryOptionFallback,
    enforceSelectOptionLegalityBothSeats:mandatoryOptionFallback,
    ownerCompressorPayloadOptIn:compressorPayload,
    ownerCompressorOpportunityAudit:opportunityAudit,
    ownerCompressorLate14OptIn:lateCompressorPayload,
    nativePressureWindowsOptIn:nativePressureWindows,
    paperSupporterQuotaOptIn:paperSupporterQuota,
    paperSupporterComparisonTraceOptIn:paperSupporterComparisonTrace,
    proposalStateAuditOptIn:proposalStateAudit,
    nativeProposalValidationAuditOptIn:nativeProposalValidationAudit,
    nativeOpponentHiddenReadAuditOptIn:nativeOpponentHiddenReadAudit,
    nativeActionInputWitnessOptIn:nativeActionInputWitness,
    nativeActionInputTapeOrdinal:nativeActionInputWitness?
      nativeActionInputTapeOrdinal:null,
    actorOnlyCompositionOptIn:actorOnlyComposition,
    actorOnlyOwnerSingleSearchOptIn:actorOnlyComposition&&actorOnlySingleSearch,
    actorHandDiscardOptIn:actorOnlyComposition&&actorHandDiscard,
    actorNativeFallbackAttributionOptIn:
      actorOnlyComposition&&actorGenericFallbackAttribution,
    actorOnlyCompositionVersion:actorOnlyComposition?
      (rows.find(row=>row.actorOnlyDecisionCoverage)?.actorOnlyDecisionCoverage.version??
        ACTOR_COMPOSITION_VERSION):null,
    actorOnlyCellsWithAudits:actorOnlyComposition?
      rows.filter(row=>row.actorOnlyDecisionCoverage).length:0,
    nativeProposalTapeOrdinal:nativeProposalValidationAudit?
      nativeProposalTapeOrdinal:null,
    nativeSupporterQuotaQualified:paperSupporterQuota?
      rows.every(row=>row.nativeSupporterQuotaQualified===true):'unverified',
    sourceFirstRetrospective,
    retrospectiveSeedProvenance:sourceFirstRetrospective?{
      6:{seed:407516727,seat:'B',selection:'reversed physical source seat'},
      11:{seed:482443328,seat:'B',selection:'post-observed source success'}
    }:null,
    rows,attempted:rows.length,
    sourcePairs:(sourceFirstRetrospective?
      ['6:retrospective-sourcefirst:0:B','11:retrospective-sourcefirst:2:B']:
      ['6:0:A','11:2:B']).map(key=>{
      const here=rows.filter(row=>row.trial?.id.startsWith(key+':'));
      const first=here.find(row=>row.trial.candidateId==='champion-reference');
      const second=here.find(row=>row.trial.candidateId==='new-moon-lockbreaker-v1');
      assert.ok(first&&second);
      return {
        pairId:key,
        sameSourcePhysicalDeal:Boolean(first.sourceDealFingerprint &&
          first.sourceDealFingerprint===second.sourceDealFingerprint),
        sourceDealFingerprints:[
          first.sourceDealFingerprint??null,second.sourceDealFingerprint??null
        ],
        sameActualStarter:Boolean(first.verifiedFirstTurn&&second.verifiedFirstTurn &&
          first.actualStarterSeat===second.actualStarterSeat),
        candidateFollowupStatuses:[first.candidateFollowupStatus??null,
          second.candidateFollowupStatus??null],
        comparativeStrengthQualified:false
      };
    }),
    errors:rows.filter(r=>r.status==='engine-error').length,
    paperSupporterQuotaVetoes:rows.filter(r=>
      r.status==='paper-supporter-quota-veto').length,
    competitiveQualifiedGames:0,winRateCertified:false
  };
}

if(require.main===module){
  const lateWindow=process.env.AGENT5_COMPR_LATE14_DEV==='true';
  const result=runDevelopment({
    compressorPayload:lateWindow ||
      process.env.AGENT5_COMMON_COMPRESSOR_DEV==='true',
    lateCompressorPayload:lateWindow,
    mandatoryOptionFallback:process.env.AGENT41_MANDATORY_OPTION_DEV==='true',
    nativePressureWindows:process.env.AGENT41_NATIVE_PRESSURE_DEV==='true',
    paperSupporterQuota:process.env.AGENT41_PAPER_SUPPORTER_DEV==='true',
    paperSupporterComparisonTrace:
      process.env.AGENT41_PAPER_SUPPORTER_TRACE_DEV==='true',
    proposalStateAudit:process.env.AGENT22_PROPOSAL_STATE_AUDIT==='true',
    nativeProposalValidationAudit:
      process.env.AGENT41_NATIVE_PROPOSAL_VALIDATION_DEV==='true',
    nativeProposalTapeOrdinal:process.env.AGENT41_NATIVE_PROPOSAL_TAPE_ORDINAL?
      Number(process.env.AGENT41_NATIVE_PROPOSAL_TAPE_ORDINAL):null,
    nativeOpponentHiddenReadAudit:
      process.env.AGENT41_NATIVE_HIDDEN_READ_DEV==='true',
    nativeActionInputWitness:
      process.env.AGENT23_NATIVE_INPUT_WITNESS_DEV==='true',
    nativeActionInputTapeOrdinal:
      process.env.AGENT23_NATIVE_INPUT_TAPE_ORDINAL?
        Number(process.env.AGENT23_NATIVE_INPUT_TAPE_ORDINAL):null,
    actorOnlyComposition:process.env.AGENT7_CANONICAL_ACTOR_POLICY_DEV==='true',
    actorOnlySingleSearch:process.env.AGENT41_ACTOR_SINGLE_SEARCH_DEV==='true',
    actorGenericFallbackAttribution:
      process.env.AGENT7_NATIVE_GENERIC_FALLBACK_DEV==='true',
    actorHandDiscard:process.env.AGENT47_ACTOR_HAND_DISCARD_DEV==='true',
    sourceFirstRetrospective:process.env.AGENT41_SOURCEFIRST_RETRO_DEV==='true',
    opportunityAudit:process.env.AGENT5_COMPR_OPPORTUNITY_AUDIT==='true'
  });
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
}
module.exports={developmentTrials,sourceFirstPressureTrials,
  commonPayloadOption,firstPostSourceDecision,
  sourceLineReplyPacket,candidatePostChoicePassEvidence,
  executeDevelopment,runDevelopment};
