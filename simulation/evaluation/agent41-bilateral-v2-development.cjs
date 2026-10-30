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
const {withCancelingCologneOncePerTurnHook}=
  require('../twinleaf/canceling-cologne-once-per-turn-hook.cjs');
const {auditAcceptedCologneRoots}=
  require('./agent48-cologne-native-ledger-audit.cjs');
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
  const options={
    sourceSeat,triggerTurn:turn,
    expectedSourceAction:rank===6?'AttackAction':'PlayCardAction',
    expectedSourceDetail:rank===6?'Volt Cyclone':'Boost Shake',
    requirePublicAttackTransitions:true
  };
  try {
    return buildBilateralReplyPacket(game,options);
  } catch(error) {
    // Do not silently accept a reverse Store clock. Keep the original
    // bilateral failure and attach only matching public native reset data.
    if(error && typeof error==='object') {
      // All fields in the Store root ledger are public, post-dispatch
      // choices. Preserve the actual roots on rejected replay cases too:
      // a digest alone prevents independent review of turn continuity.
      const roots=game.rootActionLedger||[];
      error.nativePublicRootArchive={
        rootActionLedgerProtocol:game.rootActionLedgerProtocol,
        rootActionLedger:roots,
        rootActionCount:roots.length,
        rootActionLedgerSha256:sha256(roots),
        // Retain a physical source-deal identity even if later strict
        // one-epoch reply attestation fails on an authenticated reset.
        // No hidden card identities are included in this public digest.
        sourceDealFingerprint:game.initialSourceDealFingerprint?.digestSha256??null,
        sourceDealFingerprintSeat:game.initialSourceDealFingerprint?.seat??null,
        actualStarterSeat:game.firstTurnSlot??null,
        verifiedFirstTurn:game.verifiedByDrawLog??null,
        sourceDealEpochs:game.sourceDealEpochs??null,
        suddenDeathClockResets:game.suddenDeathClockResets??[]
      };
      error.nativeEpochBoundaryEvidence=
        require('./agent44-native-epoch-boundary-audit.cjs')
          .auditNativeEpochBoundaries(game);
      // Validate and retain the whole native root sequence as an explicit
      // diagnostic episode partition before the strict one-epoch packet throws.
      // A valid partition cannot turn this development error into a game win.
      try {
        const partition=require('./native-clock-episodes.cjs')
          .segmentNativeClockEpisodes(game);
        error.nativeEpochStructuralPartition={
          modelVersion:partition.modelVersion,
          actionCount:partition.actionCount,
          outerRegisteredTrials:partition.outerRegisteredTrials,
          observedEpisodeCount:partition.observedEpisodeCount,
          boundaries:partition.boundaries,
          competitiveQualified:false,
          requiresPerEpisodeDealAndTiebreakCertification:
            partition.requiresPerEpisodeDealAndTiebreakCertification
        };
      }catch(partitionError){
        error.nativeEpochStructuralPartitionFailure=
          String(partitionError?.message||partitionError);
      }
    }
    throw error;
  }
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
 * Join already-settled source attacks to the candidate's actual next owner
 * decision. This is a postgame read-only inventory of the actor's hand and
 * face-up board, recorded AFTER the bot chose the action. It cannot prove
 * another action was legal and never feeds private cards back to the bot.
 * Missing and non-Pass replies remain explicit in the denominator.
 * @param {object[]} trace Authentic post-choice native decision trace.
 * @param {object} sourceSettlement Existing strict source-attack settlement.
 * @param {0|1} candidateSeat Candidate's physical seat.
 * @returns {object[]} Observations aligned to every source declaration.
 */
function candidateRepliesAfterSourceAttacks(trace,sourceSettlement,candidateSeat,rootTrace=[]){
  assert.ok(candidateSeat===0||candidateSeat===1);
  assert.ok(Array.isArray(trace));
  assert.ok(Array.isArray(sourceSettlement?.attacks));
  assert.ok(Array.isArray(rootTrace));
  const byOrdinal=new Map(trace.filter(row=>
    row.playerSlot===candidateSeat).map(row=>[row.actionOrdinal,row]));
  return sourceSettlement.attacks.map(attack=>{
    const next=attack.nextSourceRoot??null;
    const sameEpoch=attack.nextSourceSameEpochProven===true;
    const response=next&&sameEpoch?byOrdinal.get(next.ordinal):null;
    // The first independent reply may be a setup Play followed by a Pass on
    // that very same candidate turn. Retain the full owner-root sequence so
    // the earliest omitted action remains visible rather than credited as
    // meaningful resistance merely because its first root was a Play.
    const sameTurnRoots=[];
    if(next&&sameEpoch&&rootTrace.length){
      let started=false;
      for(const root of rootTrace){
        if(root.actionOrdinal===next.ordinal)started=true;
        if(!started)continue;
        if(root.turnBefore!==next.turn || root.playerSlot!==candidateSeat)break;
        if(root.pendingPrompt===null){
          if(sameTurnRoots.length===32)break;
          sameTurnRoots.push({
            ordinal:root.actionOrdinal,action:root.action,
            card:root.card??null,attack:root.attack??null
          });
        }
      }
    }
    const finalPass=sameTurnRoots.findLast(root=>
      root.action==='PassTurnAction')??null;
    const finalPassDecision=finalPass?
      byOrdinal.get(finalPass.ordinal):null;
    const passHasOwnerHand=finalPassDecision?.decisionHandBefore?.perspectiveSeat===
      candidateSeat && Array.isArray(
        finalPassDecision.decisionHandBefore.ownHandPrintings);
    const hasOwnerHand=response?.decisionHandBefore?.perspectiveSeat===
      candidateSeat && Array.isArray(response.decisionHandBefore.ownHandPrintings);
    const isPass=next?.action==='PassTurnAction';
    return {
      sourceAttackOrdinal:attack.actionOrdinal,
      sourceTurn:attack.turnBefore,
      sourceAttackName:attack.attackName,
      sameEpochCandidateReplyVerified:sameEpoch,
      candidateReplyOrdinal:next?.ordinal??null,
      candidateReplyTurn:next?.turn??null,
      candidateReplyAction:next?.action??null,
      candidateReplyTurnRootSequence:sameTurnRoots,
      candidateReplyTurnFinalPass:finalPass?{
        ordinal:finalPass.ordinal,turn:next.turn,
        ownerHandAfterDecision:passHasOwnerHand?
          [...finalPassDecision.decisionHandBefore.ownHandPrintings]:null,
        publicBoardBeforePass:finalPassDecision?.publicBoardBeforePass??null,
        printedBasicEnergyBeforePass:
          finalPassDecision?.printedBasicEnergyBeforePass??null,
        postChoiceAttackProbe:finalPassDecision?.attackPassProbe??null,
        clonedHeldTelepathActiveAttachment:
          finalPassDecision?.heldTelepathPassProbe??null
      }:null,
      status:!next?'no-followup-root':!sameEpoch?'unverified-epoch':
        !response?'trace-row-missing':isPass?'candidate-passed':
        'candidate-other-action',
      ownerHandAfterDecision:isPass&&hasOwnerHand?
        [...response.decisionHandBefore.ownHandPrintings]:null,
      publicBoardBeforePass:isPass?
        (response?.publicBoardBeforePass??null):null,
      printedBasicEnergyBeforePass:isPass?
        (response?.printedBasicEnergyBeforePass??null):null,
      postChoiceAttackProbe:isPass?
        (response?.attackPassProbe??null):null,
      clonedHeldTelepathActiveAttachment:isPass?
        (response?.heldTelepathPassProbe??null):null,
      caveat:'Post-choice owner hand and public board; no alternate-action legality assertion'
    };
  });
}

/**
 * Apply the same owner-visible delayed-resource tactic to either candidate
 * physical seat. This is a historical-only opt-in, not a strength treatment.
 * The actual tactic performs owner-deck selection only in its legal prompt.
 * @param {0|1} candidateSeat
 * @param {boolean} enabled
 * @returns {{newMoonAttackPayloadCompressorSeat?:0|1,
 *   newMoonAttackPayloadCompressorAnyTurnSeat?:0|1}}
 */
function commonPayloadOption(candidateSeat,enabled,lateWindow=false,anyTurn=false){
  assert.ok(candidateSeat===0||candidateSeat===1);
  if(!enabled)return {};
  return anyTurn?{newMoonAttackPayloadCompressorAnyTurnSeat:candidateSeat}:
    (lateWindow?{newMoonAttackPayloadCompressorLateSeat:candidateSeat}:
      {newMoonAttackPayloadCompressorSeat:candidateSeat});
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
  anyTurnCompressorPayload=false,earlyBenchedCompressorPayload=false,
  garbotoxinWindow=false,initializationWindow=false,
  mandatoryOptionFallback=false,paperSupporterQuota=false,
  paperCologneQuota=false,paperFullBenchCallForFamily=false,
  paperSupporterComparisonTrace=false,paperSameTargetAttachEnergy=false,
  nativeOwnerSupporterOpportunity=false,nativeSetupCompensationAudit=false,
  nativePublicMulliganRevealsAudit=false,
  proposalStateAudit=false,nativeProposalValidationAudit=false,nativeProposalTapeOrdinal=null,
  nativeOpponentHiddenReadAudit=false,nativeActionInputWitness=false,
  nativeActionInputTapeOrdinal=null,nativeAcceptedTargets=false,
  paperTerminalAttackKo=false,
  rank6K1AlternativeEnergy=false,
  rank11SourceSupporterPassRescue=false,
  rank11ExclusiveOpening=false,
  registeredTrial=false
}={}){
  if(initializationWindow)assert.equal(trial.rank,6,
    'Initialization passive window belongs only to rank 6');
  if(garbotoxinWindow)assert.equal(trial.rank,11,
    'Garbodor power window belongs only to rank 11');
  const {runMatch}=require('../twinleaf/headless.cjs');
  const {withRank11DirectBoostShake}=
    require('../twinleaf/rank11-direct-boostshake.cjs');
  const {withRank11ExclusiveOpeners}=
    require('../twinleaf/rank11-exclusive-openers.cjs');
  const {withBroadThornsSourceAttack,discardOrder}=
    require('../twinleaf/rank6-broad-thorns-policy.cjs');
  const prepared=candidates.get(trial.candidateId);
  const opponent=prepared.plan.opponents.find(x=>x.rank===trial.rank);
  assert.equal(opponent?.status,'ready');
  const candidateSeat=trial.candidateSlot==='A'?0:1;
  const sourceSeat=1-candidateSeat;
  const payloadResource=earlyBenchedCompressorPayload?
    {newMoonAttackPayloadCompressorBenchedSeat:candidateSeat}:
    commonPayloadOption(candidateSeat,compressorPayload,
      lateCompressorPayload,anyTurnCompressorPayload);
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
    captureHeldTelepathPassProbeSeat:candidateSeat,
    captureInitialSourceDealFingerprintSeat:sourceSeat,
    // Existing opaque two-seat setup fingerprint authenticates the complete
    // physical deal. It is postdecision evidence and never reaches policy.
    captureInitialFullPhysicalDeal:true,
    // Native Store's setup/shuffle and optional-mulligan observer is strictly
    // read-only. Leave prior full-match policy and archive schema unchanged
    // unless the audit is specifically requested.
    ...(nativeSetupCompensationAudit?{captureSetupCompensation:true}:{}),
    ...(nativePublicMulliganRevealsAudit?{capturePublicMulliganReveals:true}:{}),
    // Preserve the actual failed Store root, pre-dispatch public board,
    // accepted label ledger, and source physical-deal digest on abort.
    // This post-choice observer cannot affect either player's bot policy.
    captureNativeAbortEvidence:true,
    paperTerminalAttackKoCorrection:paperTerminalAttackKo
  };
  let ownerCompressorAudit=null;
  let garbotoxinWindowAudit=null;
  let initializationWindowAudit=null;
  let paperSupporterAudit=null;
  let ownerSupporterOpportunityAudit=null;
  let fullBenchTrubbishAudit=null;
  let supporterProposalIntegrity=null;
  let nativeValidationAudit=null;
  let nativeHiddenReadAudit=null;
  let nativeActionInputAudit=null;
  let sameTargetAttachEnergyAudit=null;
  let nativeAcceptedTargetAudit=null;
  let nativeAcceptedEnergyPromptAudit=null;
  // Development-only, both-seat correction for the original bot's split
  // AttachEnergyPrompt selection when the printed prompt requires sameTarget.
  // A native Store or strict prompt failure still aborts the trial.
  const runWithSameTargetAttachEnergy=()=>{
    if(!paperSameTargetAttachEnergy)return runMatch(request);
    const observed=require('../twinleaf/same-target-attach-energy-hook.cjs')
      .withSameTargetAttachEnergySelection(()=>runMatch(request));
    sameTargetAttachEnergyAudit=observed.audit;
    return observed.result;
  };
  const runWithNativeAcceptedTargets=()=>{
    if(!nativeAcceptedTargets)return runWithSameTargetAttachEnergy();
    const Store=require(path.join(root,
      'vendor/twinleaf/ptcg-server/output/game/store/store')).Store;
    // Capture both accepted root target geometry and typed Energy-prompt
    // public destinations. The latter may be deferred or unobservable, so
    // these separate read-only receipts cannot certify every physical choice.
    const runWithEnergyPromptWitness=()=>{
      const witnessed=require('../twinleaf/accepted-energy-prompt-public-witness.cjs')
        .withAcceptedEnergyPromptPublicWitness(runWithSameTargetAttachEnergy,{Store});
      nativeAcceptedEnergyPromptAudit=witnessed.audit;
      return witnessed.result;
    };
    const observed=require('../twinleaf/native-accepted-target-store-observer.cjs')
      .withAcceptedTargetWitness(runWithEnergyPromptWitness,{Store});
    nativeAcceptedTargetAudit=observed.audit;
    return observed.result;
  };
  const runWithActionInputWitness=()=>{
    if(!nativeActionInputWitness)return runWithNativeAcceptedTargets();
    const base=path.join(root,'vendor/twinleaf/ptcg-server/output');
    const SimpleTacticsAi=require(path.join(base,
      'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
    const Store=require(path.join(base,'game/store/store')).Store;
    const witnessed=require('../twinleaf/agent23-native-decision-dispatch-witness.cjs')
      .withNativeDecisionDispatchWitness(runWithNativeAcceptedTargets,
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
  // Paper C-11: Trubbish FST Call for Family ends without searching when
  // every Bench slot is filled. Keep this reversible correction both-seat
  // and off in all historical default comparison arms.
  const runWithPaperFullBench=()=>{
    if(!paperFullBenchCallForFamily)return runWithInitializationWindow();
    const observed=require('../twinleaf/agent38-paper-fullbench-callforfamily-hook.cjs')
      .withPaperFullBenchTrubbishHook(runWithInitializationWindow);
    fullBenchTrubbishAudit=observed.audit;
    return observed.result;
  };
  // The scoped Cologne correction applies to both real players and is
  // installed inside the independent Supporter discipline wrapper.
  const runWithPaperCologneQuota=()=>paperCologneQuota?
    withCancelingCologneOncePerTurnHook(runWithPaperFullBench):
    runWithPaperFullBench();
  const runWithPaperSupporterQuota=()=>{
    if(!paperSupporterQuota)return runWithPaperCologneQuota();
    const guarded=withNativePaperSupporterDiscipline(
      runWithPaperCologneQuota);
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
  const runWithOwnerSupporterOpportunity=()=>{
    if(!nativeOwnerSupporterOpportunity)return runWithNativeValidationAudit();
    const observed=require('../twinleaf/agent2-native-owner-supporter-opportunity.cjs')
      .withNativeOwnerSupporterOpportunity(runWithNativeValidationAudit);
    ownerSupporterOpportunityAudit=observed.audit;
    return observed.result;
  };
  const common=()=>withBilateralCommonCandidatePolicy(candidateSeat,
    runWithOwnerSupporterOpportunity);
  let game,sourceAudit,commonAudit;
  let sourceSupporterRescueAudit=null;
  let sourceExclusiveOpeningAudit=null;
  if(trial.rank===11){
    const runSource=rank11SourceSupporterPassRescue?()=>{
      const r=require('../twinleaf/agent41-rank11-source-pass-supporter.cjs')
        .withRank11SourcePassSupporter(sourceSeat,common);
      sourceSupporterRescueAudit=r.audit;
      return r.result;
    }:common;
    const played=rank11ExclusiveOpening?
      withRank11ExclusiveOpeners(sourceSeat,runSource):
      withRank11DirectBoostShake(sourceSeat,runSource,
        {k0AvoidAllGarbodorHeld:true,k1AvoidMissingGarbodor:true});
    sourceExclusiveOpeningAudit=rank11ExclusiveOpening?played.policyAudit:null;
    sourceAudit=rank11ExclusiveOpening&&
      played.policyAudit.selected?.kind==='held-seal'?
      played.policyAudit.held:
      (rank11ExclusiveOpening?played.policyAudit.direct:played.policyAudit);
    game=played.result.result;
    commonAudit=played.result.policyAudit;
  }else{
    const allowedDiscards=discardOrder.slice(0,-5);
    const played=withBroadThornsSourceAttack(()=>
      withBroadThornsSourceAttack(common,
        {seat:sourceSeat,turn:3,discardPriority:allowedDiscards,
          k1AlternativeEnergy:rank6K1AlternativeEnergy}),
      {seat:sourceSeat,turn:2,discardPriority:allowedDiscards,
        k1AlternativeEnergy:rank6K1AlternativeEnergy});
    sourceAudit={
      turn2:{started:played.started,completed:played.completed,
        abortReason:played.abortReason,
        k1BackupEnergyName:played.backupEnergyName??null},
      turn3:{started:played.result.started,completed:played.result.completed,
        abortReason:played.result.abortReason,
        k1BackupEnergyName:played.result.backupEnergyName??null}
    };
    commonAudit=played.result.result.policyAudit;
    game=played.result.result.result;
  }
  assert.equal(commonAudit.version,POLICY_VERSION);
  assert.equal(game.seed,trial.seed);
  assert.equal(game.engine,'twinleafgg/'+registration.enginePin);
  assert.equal(game.verifiedByDrawLog,true);
  assert.equal(game.promptValidationMode,'predispatch-prompt-validate');
  if(nativeAcceptedTargets){
    // A completed native witness must contain genuine root-linked accepted
    // Store dispatches and a two-seat physical deal. Empty prompt effects
    // remain explicitly observable as zero, never inferred as a certified
    // destination. Engine errors preserve separately typed abort sidecars.
    assert.equal(nativeAcceptedTargetAudit?.observedLiveStore,true);
    assert.equal(nativeAcceptedTargetAudit?.rootOrdinalLinked,true);
    assert.equal(nativeAcceptedEnergyPromptAudit?.observedLiveStore,true);
    assert.equal(nativeAcceptedEnergyPromptAudit?.schema,
      'accepted-attach-energy-prompt-public-delta-v1');
    assert.equal(game.initialFullPhysicalDealFingerprint?.schema,
      'initial-full-physical-deal-sha256-v1');
    assert.equal(typeof game.initialFullPhysicalDealFingerprint.digestSha256,
      'string');
  }
  const declared=game.attackDeclarationTrace||[];
  // Full, actor-filtered, prompt-closed public consequence packet.
  // This is observational only and cannot certify a legal competitive game.
  const candidateSettlement=candidateAttackSettlement(game,candidateSeat);
  const sourceSettlement=candidateAttackSettlement(game,sourceSeat);
  assert.equal(candidateSettlement.declarations,
    declared.filter(row=>row.playerSlot===candidateSeat).length);
  assert.equal(sourceSettlement.declarations,
    declared.filter(row=>row.playerSlot===sourceSeat).length);
  const firstSource=game.decisionTrace.find(row=>
    row.playerSlot===sourceSeat &&
    Array.isArray(row.decisionHandBefore?.ownHandPrintings));
  const ownerFirst=firstSource?.decisionHandBefore?.ownHandPrintings??null;
  const packet=game.publicAttackTransitions||[];
  const acceptedAttackEvents=packet.filter(row=>
    row.declarations?.length && row.settled?.after);
  const sourceFirst=game.firstTurnSlot===sourceSeat;
  const rootTrace=game.rootActionLedger||[];
  const cologneNativePlayAudit=auditAcceptedCologneRoots(
    rootTrace,game.suddenDeathClockResets??[]);
  if(paperCologneQuota){
    assert.equal(cologneNativePlayAudit.acceptedOncePerSeatTurn,true,
      'Paper Cologne guard permitted two successful plays by one actor in one turn');
  }
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
  // Read-only source-owner hand witness after each already-chosen Pass.
  // Never feed these post-decision observations back into either policy.
  const sourceOwnerPostPassMobility=
    require('./agent17-source-own-postpass-mobility.cjs')
      .sourceOwnerPostPassMobility(game.decisionTrace,rootTrace,sourceSeat);
  // Read-only, actor-owned first-turn hand resource census. These detached
  // counts are post-policy evidence and are never visible to a bot.
  const sourceFirstOwnedAffordances=
    require('./agent1-source-first-owned-affordances.cjs')
      .sourceFirstOwnedAffordances(game.decisionTrace,sourceSeat,sourceFirst,rootTrace);
  const passEvidence=candidatePostChoicePassEvidence(
    game.decisionTrace,candidateSeat);
  return {
    trial,qualifiesForCompetitiveInference:false,
    rank11SourceSupporterPassRescueOptIn:rank11SourceSupporterPassRescue,
    rank11SourceSupporterRescueAudit:sourceSupporterRescueAudit,
    rank11ExclusiveOpeningOptIn:rank11ExclusiveOpening,
    rank11ExclusiveOpeningAudit:sourceExclusiveOpeningAudit,
    policyVersion:POLICY_VERSION+
      (rank11ExclusiveOpening?'+rank11-exclusive-openers-v1':'')+
      (paperSupporterQuota?'+'+PAPER_SUPPORTER_VERSION:'')+
      (paperCologneQuota?'+agent48-paper-cologne-same-turn-guard-v1':'')+
      (paperFullBenchCallForFamily?'+agent38-paper-fullbench-trubbish-fst-v1':'')+
      (paperSameTargetAttachEnergy?'+bot-same-target-energy-selection-v1':'')+
      (mandatoryOptionFallback?'+MandatoryOptionDefaultFallback-v1-both-seats+SelectOptionLegalityGate-v1-both-seats':'')+
      (earlyBenchedCompressorPayload?'+owner-compressor-benched-v1':
        (anyTurnCompressorPayload?'+owner-compressor-anyturn-v1':
        (lateCompressorPayload?
        '+owner-compressor-late14-v1':(compressorPayload?'+owner-compressor-v1':'')))),
    mandatoryOptionFallbackBothSeats:mandatoryOptionFallback,
    enforceSelectOptionLegalityBothSeats:mandatoryOptionFallback,
    ownerCompressorPayloadOptIn:compressorPayload,
    ownerCompressorLate14OptIn:lateCompressorPayload,
    ownerCompressorAnyTurnOptIn:anyTurnCompressorPayload,
    ownerCompressorBenchedOptIn:earlyBenchedCompressorPayload,
    ...((lateCompressorPayload||anyTurnCompressorPayload||
      earlyBenchedCompressorPayload)?{
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
    paperCologneQuotaOptIn:paperCologneQuota,
    paperFullBenchCallForFamilyOptIn:paperFullBenchCallForFamily,
    paperSameTargetAttachEnergyOptIn:paperSameTargetAttachEnergy,
    paperSameTargetAttachEnergyAudit:paperSameTargetAttachEnergy?
      sameTargetAttachEnergyAudit:null,
    paperFullBenchCallForFamilyAudit:paperFullBenchCallForFamily?
      fullBenchTrubbishAudit:null,
    paperCologneNativePlayAudit:cologneNativePlayAudit,
    nativeSupporterQuotaQualified:paperSupporterQuota?
      paperSupporterAudit?.nativeSupporterQuotaQualified===true:'unverified',
    paperSupporterDiscipline:paperSupporterQuota?paperSupporterAudit:null,
    ...(nativeOwnerSupporterOpportunity?{ownerSupporterOpportunityAudit}:{}),
    ...(proposalStateAudit?{supporterProposalIntegrity}:{}),
    ...(nativeProposalValidationAudit?{nativeValidationAudit}:{}),
    ...(nativeOpponentHiddenReadAudit?{
      nativeOpponentHiddenReadAudit:nativeHiddenReadAudit}:{}),
    ...(nativeActionInputWitness?{nativeActionInputAudit}:{}),
    ...(nativeAcceptedTargets?{
      nativeAcceptedTargetSidecar:nativeAcceptedTargetAudit,
      nativeAcceptedEnergyPromptSidecar:nativeAcceptedEnergyPromptAudit,
      physicalTargetCertification:'selective-public-evidence-only'}:{}),
    sourceSeat,candidateSeat,sourceActuallyFirst:sourceFirst,
    enginePin:registration.enginePin,
    candidateDeckFingerprint:sha256(candidateCards),
    sourceDeckFingerprint:sha256(opponent.cards),
    verifiedFirstTurn:game.verifiedByDrawLog,
    actualStarterSeat:game.firstTurnSlot,
    firstTurnPlayerId:game.firstTurnPlayerId,
    firstTurnPlayerName:game.firstTurnPlayerName,
    firstDrawLogName:game.firstDrawLogName,
    sourceDealFingerprint:sourceDeal.digestSha256,
    fullPhysicalDealFingerprint:
      game.initialFullPhysicalDealFingerprint?.digestSha256??null,
    fullPhysicalDealProtocol:
      game.initialFullPhysicalDealFingerprint?.schema??null,
    ...(nativeSetupCompensationAudit?{
      initialSetupCompensation:game.initialSetupCompensation??null}:{}),
    ...(nativePublicMulliganRevealsAudit?{
      initialPublicMulliganReveals:game.initialPublicMulliganReveals??null}:{}),
    sourceFirstOwnHandSha256:ownerFirst?sha256(ownerFirst):null,
    // Read-only owner K1 deck-search choices, for all historical arms.
    // Never give the real deck membership to a pre-search K0 policy.
    candidateOwnDeckSelectionEvidence,
    nativePromptChoices,
    policyAudit:commonAudit,sourceAudit,sourceLinePacket,
    sourceOwnerPostPassMobility,
    sourceFirstOwnedAffordances,
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
    candidateRepliesAfterSourceAttacks:candidateRepliesAfterSourceAttacks(
      game.decisionTrace,sourceSettlement,candidateSeat,rootTrace),
    attackDeclarations:{
      source:declared.filter(r=>r.playerSlot===sourceSeat).length,
      candidate:declared.filter(r=>r.playerSlot===candidateSeat).length
    },
    settledPublicAttackCount:acceptedAttackEvents.length,
    // Unlike the legacy two-event summary below, this retains EVERY
    // candidate declaration and genuine next-source action, or its absence.
    candidateAttackSettlement:candidateSettlement,
    // Symmetric, postgame native settlement. In the reused reducer's schema,
    // nextSourceRoot is the opponent's next root: the CANDIDATE here.
    sourceAttackSettlement:{
      ...sourceSettlement,
      auditedActorRole:'source',
      nextSourceRootRole:'candidate'
    },
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
    // Retain actual post-Store public roots for independent checksum and
    // epoch-continuity review. They are diagnostic, never a win certificate.
    rootActionLedgerProtocol:game.rootActionLedgerProtocol,
    rootActionCount:rootTrace.length,
    rootActionLedger:rootTrace,
    terminalAttackKoBeforeEndTurnAudit:game.terminalAttackKoBeforeEndTurnAudit??null,
    sourceDealEpochs:game.sourceDealEpochs??null,
    suddenDeathClockResets:game.suddenDeathClockResets??[],
    ...(paperSupporterComparisonTrace?{
      paperSupporterComparisonTrace:rootTrace.map(row=>({
        actionOrdinal:row.actionOrdinal,turnBefore:row.turnBefore,
        playerSlot:row.playerSlot,action:row.action,
        card:row.card??null,attack:row.attack??null
      }))
    }:{}),
    caveat:registeredTrial?
      'Prospectively prespecified development deal; common policy is not hidden-information safe or clock-calibrated':
      'Retrospectively selected development deal; common policy is not hidden-information safe or clock-calibrated'
  };
}

/**
 * The wrapper attaches quota evidence on every downstream exception. Only an
 * actual Store-level Supporter rejection identifies a quota veto. An aborted
 * attack or unrelated Store error must retain its original engine category.
 * @param {object|null|undefined} evidence Native paper-quota abort audit.
 * @returns {'paper-supporter-quota-veto'|'engine-error'}
 */
function classifyNativeAbort(evidence){
  return Array.isArray(evidence?.rootDispatchVetoes)&&
    evidence.rootDispatchVetoes.length>0?
      'paper-supporter-quota-veto':'engine-error';
}

/**
 * Isolate exactly one actor's Special Energy root for a paired source-deal
 * comparison. Null keeps the default fully unchanged native bot.
 * @param {'none'|'source'|'candidate'} scope
 * @param {'A'|'B'} candidateSlot
 * @returns {0|1|null}
 */
function scopedSpecialEnergyActorSeat(scope,candidateSlot){
  assert.ok(['none','source','candidate'].includes(scope));
  assert.ok(['A','B'].includes(candidateSlot));
  if(scope==='none')return null;
  const candidateSeat=candidateSlot==='A'?0:1;
  return scope==='candidate'?candidateSeat:1-candidateSeat;
}

/** @returns {object} */
function runDevelopment({
  compressorPayload=false,opportunityAudit=false,lateCompressorPayload=false,
  anyTurnCompressorPayload=false,earlyBenchedCompressorPayload=false,
  mandatoryOptionFallback=false,nativePressureWindows=false,
  sourceFirstRetrospective=false,paperSupporterQuota=false,
  paperCologneQuota=false,paperFullBenchCallForFamily=false,
  paperSupporterComparisonTrace=false,paperSameTargetAttachEnergy=false,
  nativeOwnerSupporterOpportunity=false,nativeSetupCompensationAudit=false,
  nativePublicMulliganRevealsAudit=false,
  proposalStateAudit=false,nativeProposalValidationAudit=false,nativeProposalTapeOrdinal=null,
  nativeOpponentHiddenReadAudit=false,actorOnlyComposition=false,
  actorOnlySingleSearch=false,actorGenericFallbackAttribution=false,
  actorHandDiscard=false,actorChoosePokemon=false,
  actorPlumeriaAfterPass=false,
  actorGuzmaPromptContinuation=false,actorChargedPromotion=false,sourceFloatStoneMobility=false,
  nativeActionInputWitness=false,
  nativeActionInputTapeOrdinal=null,nativeAcceptedTargets=false,
  paperTerminalAttackKo=false,
  rank6K1AlternativeEnergy=false,
  rank11SourceSupporterPassRescue=false,
  rank11ExclusiveOpening=false,
  sourceScopedSpecialEnergyRoot=false,
  candidateScopedSpecialEnergyRoot=false,
  bilateralSpecialEnergyRoot=false,
  bilateralPublicContextSpecialEnergy=false,
  bilateralEnergyContest=false,
  candidateOnlyKnownDeadRoot=false,
  registeredTrials=null,registeredFrameName=null
}={}){
  assertManifest();
  assert.ok(!actorChargedPromotion||(actorOnlyComposition&&actorChoosePokemon),
    'Charged promotion requires actor-only composition and ChoosePokemon');
  assert.ok(!actorGuzmaPromptContinuation||actorOnlyComposition,
    'Guzma owner recipient bridge requires canonical actor composition');
  assert.ok(!actorPlumeriaAfterPass||actorOnlyComposition,
    'Plumeria after-Pass requires canonical actor composition');
  assert.ok(!bilateralSpecialEnergyRoot||actorOnlyComposition,
    'Both-seat Special Energy root requires canonical actor composition');
  assert.ok(!bilateralEnergyContest||bilateralSpecialEnergyRoot,
    'Basic/Special contention requires symmetric both-seat Special root');
  assert.ok(!bilateralPublicContextSpecialEnergy||actorOnlyComposition,
    'Public-context Special Energy requires canonical actor composition');
  assert.ok(!(bilateralPublicContextSpecialEnergy&&
      (bilateralSpecialEnergyRoot||sourceScopedSpecialEnergyRoot||
      candidateScopedSpecialEnergyRoot)),
    'Compare public-context and narrow Special root as distinct policies');
  assert.ok(!sourceFloatStoneMobility||actorOnlyComposition,
    'Source Float Stone rescue requires actor-only composition');
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
  if(registeredTrials!==null){
    assert.equal(sourceFirstRetrospective,false,
      'Prospective trials cannot activate selected historical source-first seeds');
    assert.ok(typeof registeredFrameName==='string' &&
      registeredFrameName.length>0);
    assert.ok(Array.isArray(registeredTrials)&&registeredTrials.length>0);
    const groups=new Map();
    const ids=new Set();
    for(const trial of registeredTrials){
      assert.ok([6,11].includes(trial.rank));
      assert.ok(['A','B'].includes(trial.candidateSlot));
      assert.ok(['champion-reference','new-moon-lockbreaker-v1']
        .includes(trial.candidateId));
      assert.ok(Number.isSafeInteger(trial.repeat)&&trial.repeat>=0);
      assert.ok(Number.isSafeInteger(trial.seed)&&trial.seed>=0&&
        trial.seed<=0xffffffff);
      assert.equal(trial.id,[trial.rank,trial.repeat,trial.candidateSlot,
        trial.candidateId].join(':'));
      assert.ok(!ids.has(trial.id),'Duplicate preregistered arm');
      ids.add(trial.id);
      const group=trial.id.slice(0,trial.id.lastIndexOf(':'));
      const existing=groups.get(group)||{seed:trial.seed,ids:[]};
      assert.equal(existing.seed,trial.seed,
        'Candidate pair must use identical preregistered integer seed');
      existing.ids.push(trial.candidateId);
      groups.set(group,existing);
    }
    for(const group of groups.values()){
      assert.deepEqual(group.ids.slice().sort(),
        ['champion-reference','new-moon-lockbreaker-v1']);
    }
  }
  const scheduled=registeredTrials??(sourceFirstRetrospective?
    sourceFirstPressureTrials():developmentTrials());
  for(const trial of scheduled){
    try {
      const execute=()=>executeDevelopment(trial,prepared,{
        compressorPayload,opportunityAudit,lateCompressorPayload,
        anyTurnCompressorPayload,earlyBenchedCompressorPayload,
        mandatoryOptionFallback,paperSupporterQuota,paperCologneQuota,
        paperFullBenchCallForFamily,paperSameTargetAttachEnergy,
        paperSupporterComparisonTrace,nativeOwnerSupporterOpportunity,
        nativeSetupCompensationAudit,nativePublicMulliganRevealsAudit,
        proposalStateAudit,nativeProposalValidationAudit,nativeProposalTapeOrdinal,
        nativeOpponentHiddenReadAudit,nativeActionInputWitness,
        nativeAcceptedTargets,
        nativeActionInputTapeOrdinal,paperTerminalAttackKo,
        rank6K1AlternativeEnergy,
        rank11SourceSupporterPassRescue,
        rank11ExclusiveOpening,
        registeredTrial:registeredTrials!==null,
        // An opt-in observational package, with each native Store observer
        // applicable to its own opposing source archetype only.
        initializationWindow:nativePressureWindows&&trial.rank===6,
        garbotoxinWindow:nativePressureWindows&&trial.rank===11
      });
      if(actorOnlyComposition){
        // A two-seat mode applies one native-owned root selector to both
        // players. One-seat modes remain explicitly asymmetric diagnostics.
        const energyProfile=require('./agent41-bilateral-special-energy-profile.cjs')
          .specialEnergyRootProfile({
            bilateral:bilateralSpecialEnergyRoot,
            source:sourceScopedSpecialEnergyRoot,
            candidate:candidateScopedSpecialEnergyRoot
          },trial.candidateSlot);
        const scopedRoot=(!energyProfile.enabled&&!bilateralPublicContextSpecialEnergy&&
          !sourceFloatStoneMobility&&
          !candidateOnlyKnownDeadRoot)?{}:
          {root:work=>require('../twinleaf/agent34-actor-only-root-policy.cjs')
            .withActorOnlyRootPolicy(work,{
              ...(energyProfile.enabled?{
                specialEnergyRoot:true,
                specialEnergyRootOwnerSeat:energyProfile.ownerSeat,
                contestedEnergyRoot:bilateralEnergyContest
              }:{}),
              ...(bilateralPublicContextSpecialEnergy?{
                publicContextSpecialEnergy:true,
                specialEnergyRootOwnerSeat:null
              }:{}),
              ...(sourceFloatStoneMobility?{
                floatStoneMobility:true,
                floatStoneMobilityOwnerSeat:1-(trial.candidateSlot==='A'?0:1)
              }:{}),
              ...(candidateOnlyKnownDeadRoot?{
                knownDeadAttackRoot:true,
                knownDeadAttackRootOwnerSeat:trial.candidateSlot==='A'?0:1
              }:{})
            })};
        const chargedPokemon=actorChargedPromotion?{
          pokemon:work=>require('../twinleaf/agent8-actor-only-choose-pokemon.cjs')
            .withActorOnlyChoosePokemon(work,{
              choose:require('../twinleaf/agent1-charged-promotion-choice.cjs')
                .chooseChargedOwnPromotion
            })
        }:{};
        const observed=withCanonicalActorOnlyPolicy(execute,
          {...scopedRoot,...chargedPokemon},
          {ownerSingleSearch:actorOnlySingleSearch,
            genericFallbackAttribution:actorGenericFallbackAttribution,
            actorHandDiscard,actorChoosePokemon,
            ownerPlumeriaAfterPass:actorPlumeriaAfterPass,
            guzmaOwnerPromptContinuation:actorGuzmaPromptContinuation,
            ...((anyTurnCompressorPayload||earlyBenchedCompressorPayload)?{
              ownerDonorSetup:{seat:trial.candidateSlot==='A'?0:1,
                setup:earlyBenchedCompressorPayload?
                  {allowBenchedMewtwo:true,maxGlobalTurn:6}:
                  {maxGlobalTurn:Number.POSITIVE_INFINITY}}
            }:{})});
        rows.push({...observed.result,
          ...(bilateralSpecialEnergyRoot?{
            bilateralSpecialEnergyProfile:{...energyProfile,
              immediateAttackContest:bilateralEnergyContest}
          }:{}),
          ...(bilateralPublicContextSpecialEnergy?{
            bilateralPublicContextSpecialProfile:{
              version:'agent17-owner-flexible-energy-model-v1-canonical-both-seats',
              mode:'both',ownerSeat:null,sharedPolicy:true,
              specialEnergyModel:'actor-energy-payability',
              rootSelector:'agent17-public-context-special-energy'
            }
          }:{}),
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
      const genericAbort=error?.nativeGenericFallbackEvidence??
        error?.cause?.nativeGenericFallbackEvidence??null;
      const sameTargetAbort=error?.nativeSameTargetEnergyEvidence??
        error?.cause?.nativeSameTargetEnergyEvidence??null;
      const {error:archivedError,nativeStoreCauseStack,
        nativeAbortEvidence:nativeAbort}=
        require('../twinleaf/native-dispatch-abort-evidence.cjs')
          .publicNativeAbortError(error);
      rows.push({
        trial,status:classifyNativeAbort(veto),
        error:archivedError,
        nativeStoreCauseStack,
        ...(error?.nativePublicRootArchive??{}),
        nativeAbortEvidence:nativeAbort,
        ...(error?.nativeEpochBoundaryEvidence?{
          nativeEpochBoundaryEvidence:error.nativeEpochBoundaryEvidence
        }:{}),
        ...(error?.nativeEpochStructuralPartition?{
          nativeEpochStructuralPartition:error.nativeEpochStructuralPartition
        }:{}),
        ...(error?.nativeEpochStructuralPartitionFailure?{
          nativeEpochStructuralPartitionFailure:
            error.nativeEpochStructuralPartitionFailure
        }:{}),
        nativeSupporterQuotaQualified:veto?false:'unverified',
        paperSupporterDiscipline:veto,
        ...(nativeProposalValidationAudit?{
          nativeValidationAudit:nativeValidation}:{}),
        ...(nativeOwnerSupporterOpportunity?{
          ownerSupporterOpportunityAbortEvidence:
            error?.agent2OwnerSupporterOpportunityEvidence??null}:{}),
        ...(nativeOpponentHiddenReadAudit?{
          nativeOpponentHiddenReadAudit:nativeHiddenRead}:{}),
        ...(nativeActionInputWitness?{
          nativeActionInputAudit:error?.nativeDecisionDispatchEvidence??null}:{}),
        ...(nativeAcceptedTargets?{
          nativeAcceptedTargetSidecarAbort:
            require('../twinleaf/native-accepted-target-store-observer.cjs')
              .acceptedTargetAbortEvidence(error),
          nativeAcceptedEnergyPromptSidecarAbort:
            require('../twinleaf/accepted-energy-prompt-public-witness.cjs')
              .acceptedEnergyPromptPublicAbortEvidence(error)}:{}),
        ...(paperSameTargetAttachEnergy?{
          paperSameTargetAttachEnergyAbortEvidence:sameTargetAbort}:{}),
        ...(actorOnlyComposition&&actorGenericFallbackAttribution?{
          nativeGenericFallbackAbortEvidence:genericAbort}:{}),
        qualifiesForCompetitiveInference:false
      });
    }
  }
  return {
    schema:earlyBenchedCompressorPayload?
      'agent32-bilateral-common-policy-development-v0c-owner-compressor-benched-v1':
      (anyTurnCompressorPayload?
      'agent32-bilateral-common-policy-development-v0c-owner-compressor-anyturn-v1':
      (lateCompressorPayload?
      'agent5-bilateral-common-policy-development-v0c-owner-compressor-late14-v1':
      (opportunityAudit?
      'agent5-bilateral-common-policy-development-v0c-readonly-opportunity-v1':
      (compressorPayload?
        'agent5-bilateral-common-policy-development-v0c-owner-compressor-v1':
        'agent41-bilateral-common-policy-development-v0c-live-lock-guard')))),
    sourceRegistration:registeredTrials!==null?
      registeredFrameName:(sourceFirstRetrospective?
      'Retrospective source-first selected exposure; rank11 chosen after source Tool-Garbodor success; not preregistered':
      'historical v1 selection; not v2 preregistration'),
    enginePin:registration.enginePin,
    candidatePolicy:POLICY_VERSION+
      (rank11ExclusiveOpening?'+rank11-exclusive-openers-v1':'')+
      (paperSupporterQuota?'+'+PAPER_SUPPORTER_VERSION:'')+
      (paperCologneQuota?'+agent48-paper-cologne-same-turn-guard-v1':'')+
      (paperFullBenchCallForFamily?'+agent38-paper-fullbench-trubbish-fst-v1':'')+
      (paperSameTargetAttachEnergy?'+bot-same-target-energy-selection-v1':'')+
      (mandatoryOptionFallback?'+MandatoryOptionDefaultFallback-v1-both-seats+SelectOptionLegalityGate-v1-both-seats':'')+
      (earlyBenchedCompressorPayload?'+owner-compressor-benched-v1':
        (anyTurnCompressorPayload?'+owner-compressor-anyturn-v1':
        (lateCompressorPayload?
        '+owner-compressor-late14-v1':(compressorPayload?'+owner-compressor-v1':'')))),
    mandatoryOptionFallbackBothSeats:mandatoryOptionFallback,
    enforceSelectOptionLegalityBothSeats:mandatoryOptionFallback,
    ownerCompressorPayloadOptIn:compressorPayload,
    ownerCompressorOpportunityAudit:opportunityAudit,
    ownerCompressorLate14OptIn:lateCompressorPayload,
    ownerCompressorAnyTurnOptIn:anyTurnCompressorPayload,
    ownerCompressorBenchedOptIn:earlyBenchedCompressorPayload,
    nativePressureWindowsOptIn:nativePressureWindows,
    paperSupporterQuotaOptIn:paperSupporterQuota,
    paperCologneQuotaOptIn:paperCologneQuota,
    paperFullBenchCallForFamilyOptIn:paperFullBenchCallForFamily,
    paperSameTargetAttachEnergyOptIn:paperSameTargetAttachEnergy,
    paperSupporterComparisonTraceOptIn:paperSupporterComparisonTrace,
    nativeOwnerSupporterOpportunityOptIn:nativeOwnerSupporterOpportunity,
    nativeSetupCompensationAuditOptIn:nativeSetupCompensationAudit,
    nativePublicMulliganRevealsAuditOptIn:nativePublicMulliganRevealsAudit,
    proposalStateAuditOptIn:proposalStateAudit,
    nativeProposalValidationAuditOptIn:nativeProposalValidationAudit,
    nativeOpponentHiddenReadAuditOptIn:nativeOpponentHiddenReadAudit,
    nativeActionInputWitnessOptIn:nativeActionInputWitness,
    nativeAcceptedTargetsOptIn:nativeAcceptedTargets,
    nativeActionInputTapeOrdinal:nativeActionInputWitness?
      nativeActionInputTapeOrdinal:null,
    actorOnlyCompositionOptIn:actorOnlyComposition,
    actorOnlyOwnerSingleSearchOptIn:actorOnlyComposition&&actorOnlySingleSearch,
    actorHandDiscardOptIn:actorOnlyComposition&&actorHandDiscard,
    actorPlumeriaAfterPassOptIn:actorOnlyComposition&&actorPlumeriaAfterPass,
    actorChoosePokemonOptIn:actorOnlyComposition&&actorChoosePokemon,
    actorGuzmaPromptContinuationOptIn:
      actorOnlyComposition&&actorGuzmaPromptContinuation,
    actorChargedPromotionOptIn:actorOnlyComposition&&actorChargedPromotion,
    sourceFloatStoneMobilityOptIn:actorOnlyComposition&&sourceFloatStoneMobility,
    rank11ExclusiveOpeningOptIn:rank11ExclusiveOpening,
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
    registeredTrialFrame:registeredTrials!==null?registeredFrameName:null,
    rank6K1AlternativeEnergyOptIn:rank6K1AlternativeEnergy,
    rank11SourceSupporterPassRescueOptIn:rank11SourceSupporterPassRescue,
    sourceScopedSpecialEnergyRootOptIn:sourceScopedSpecialEnergyRoot,
    candidateScopedSpecialEnergyRootOptIn:candidateScopedSpecialEnergyRoot,
    retrospectiveSeedProvenance:sourceFirstRetrospective?{
      6:{seed:407516727,seat:'B',selection:'reversed physical source seat'},
      11:{seed:482443328,seat:'B',selection:'post-observed source success'}
    }:null,
    rows,attempted:rows.length,
    sourcePairs:[...new Set(scheduled.map(row=>
      row.id.slice(0,row.id.lastIndexOf(':'))))].map(key=>{
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
        // Different fixed 60s are not a same-deck policy A/B, irrespective
        // of matching source start or legacy root-label coincidence.
        pairedPhysicalTargetEvidence:
          require('./agent41-native-paired-target-audit.cjs')
            .comparePairedAcceptedTargets(first,second),
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
  const anyTurn=process.env.AGENT32_COMPR_ANYTURN_DEV==='true';
  const earlyBenched=process.env.AGENT32_COMPR_BENCHED_DEV==='true';
  const result=runDevelopment({
    compressorPayload:earlyBenched || anyTurn || lateWindow ||
      process.env.AGENT5_COMMON_COMPRESSOR_DEV==='true',
    lateCompressorPayload:lateWindow,
    anyTurnCompressorPayload:anyTurn,
    earlyBenchedCompressorPayload:earlyBenched,
    mandatoryOptionFallback:process.env.AGENT41_MANDATORY_OPTION_DEV==='true',
    nativePressureWindows:process.env.AGENT41_NATIVE_PRESSURE_DEV==='true',
    paperSupporterQuota:process.env.AGENT41_PAPER_SUPPORTER_DEV==='true',
    paperCologneQuota:process.env.AGENT48_PAPER_COLOGNE_DEV==='true',
    paperFullBenchCallForFamily:
      process.env.AGENT38_PAPER_FULLBENCH_TRUBBISH_DEV==='true',
    paperSameTargetAttachEnergy:
      process.env.AGENT12_SAME_TARGET_ATTACH_DEV==='true',
    paperSupporterComparisonTrace:
      process.env.AGENT41_PAPER_SUPPORTER_TRACE_DEV==='true',
    nativeOwnerSupporterOpportunity:
      process.env.AGENT2_NATIVE_OWNER_SUPPORTER_OPPORTUNITY_DEV==='true',
    nativeSetupCompensationAudit:
      process.env.AGENT31_NATIVE_SETUP_COMPENSATION_DEV==='true',
    nativePublicMulliganRevealsAudit:
      process.env.AGENT31_NATIVE_PUBLIC_MULLIGAN_DEV==='true',
    proposalStateAudit:process.env.AGENT22_PROPOSAL_STATE_AUDIT==='true',
    nativeProposalValidationAudit:
      process.env.AGENT41_NATIVE_PROPOSAL_VALIDATION_DEV==='true',
    nativeProposalTapeOrdinal:process.env.AGENT41_NATIVE_PROPOSAL_TAPE_ORDINAL?
      Number(process.env.AGENT41_NATIVE_PROPOSAL_TAPE_ORDINAL):null,
    nativeOpponentHiddenReadAudit:
      process.env.AGENT41_NATIVE_HIDDEN_READ_DEV==='true',
    nativeActionInputWitness:
      process.env.AGENT23_NATIVE_INPUT_WITNESS_DEV==='true',
    nativeAcceptedTargets:
      process.env.AGENT12_NATIVE_TARGET_SIDECAR_DEV==='true',
    paperTerminalAttackKo:
      process.env.AGENT3_PAPER_TERMINAL_ATTACK_KO_DEV==='true',
    nativeActionInputTapeOrdinal:
      process.env.AGENT23_NATIVE_INPUT_TAPE_ORDINAL?
        Number(process.env.AGENT23_NATIVE_INPUT_TAPE_ORDINAL):null,
    actorOnlyComposition:process.env.AGENT7_CANONICAL_ACTOR_POLICY_DEV==='true',
    actorOnlySingleSearch:process.env.AGENT41_ACTOR_SINGLE_SEARCH_DEV==='true',
    actorGenericFallbackAttribution:
      process.env.AGENT7_NATIVE_GENERIC_FALLBACK_DEV==='true',
    actorHandDiscard:process.env.AGENT47_ACTOR_HAND_DISCARD_DEV==='true',
    actorChoosePokemon:process.env.AGENT8_ACTOR_CHOOSE_POKEMON_DEV==='true',
    actorPlumeriaAfterPass:
      process.env.AGENT38_CANONICAL_PLUMERIA_AFTERPASS_DEV==='true',
    actorGuzmaPromptContinuation:
      process.env.AGENT43_GUZMA_PROMPT_CONTINUATION_DEV==='true',
    actorChargedPromotion:process.env.AGENT1_CHARGED_PROMOTION_DEV==='true',
    sourceFloatStoneMobility:
      process.env.AGENT1_SOURCE_FLOAT_MOBILITY_DEV==='true',
    sourceFirstRetrospective:process.env.AGENT41_SOURCEFIRST_RETRO_DEV==='true',
    opportunityAudit:process.env.AGENT5_COMPR_OPPORTUNITY_AUDIT==='true',
    rank6K1AlternativeEnergy:
      process.env.AGENT49_RANK6_K1_ALT_ENERGY_DEV==='true',
    sourceScopedSpecialEnergyRoot:
      process.env.AGENT49_SOURCE_SCOPED_SPECIAL_DEV==='true',
    candidateScopedSpecialEnergyRoot:
      process.env.AGENT4_CANDIDATE_SPECIAL_ROOT_DEV==='true',
    bilateralSpecialEnergyRoot:
      process.env.AGENT41_BILATERAL_SPECIAL_ENERGY_DEV==='true',
    bilateralPublicContextSpecialEnergy:
      process.env.AGENT41_BILATERAL_PUBLIC_SPECIAL_DEV==='true',
    bilateralEnergyContest:
      process.env.AGENT41_ENERGY_CONTEST_DEV==='true'
  });
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
}
module.exports={developmentTrials,sourceFirstPressureTrials,
  commonPayloadOption,firstPostSourceDecision,
  sourceLineReplyPacket,candidatePostChoicePassEvidence,
  candidateRepliesAfterSourceAttacks,scopedSpecialEnergyActorSeat,
  executeDevelopment,runDevelopment,classifyNativeAbort};
