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
const {auditCrossCandidateSourcePair}=
  require('./agent44-cross-candidate-source-pair-status.cjs');
const {withNativePaperSupporterDiscipline,VERSION:PAPER_SUPPORTER_VERSION}=
  require('../twinleaf/agent41-paper-supporter-discipline.cjs');
const {withCancelingCologneOncePerTurnHook}=
  require('../twinleaf/canceling-cologne-once-per-turn-hook.cjs');
const {auditAcceptedCologneRoots}=
  require('./agent48-cologne-native-ledger-audit.cjs');
const {withCanonicalActorOnlyPolicy,VERSION:ACTOR_COMPOSITION_VERSION}=
  require('./agent7-canonical-actor-composition.cjs');
const {VERSION:SUPPORTER_ROOT_VERSION,commonConservativeSupporterRootOptions}=
  require('./agent41-bilateral-conservative-supporter-option.cjs');

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
  assert.ok(Number.isSafeInteger(rank)&&rank>0);
  assert.ok(candidateSeat===0||candidateSeat===1);
  if(rank!==6&&rank!==11)return {
    root:null,status:'source-line-not-applicable-to-rank',sourceTurn:null
  };
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
 * Build the Agent34 natural-evolution root option while preserving the
 * historical bilateral default. A physical-seat restriction is opt-in.
 * @param {boolean} enabled
 * @param {null|0|1} ownerSeat
 * @param {boolean} garbodorToolRoot
 * @param {boolean} deferForStarAlchemy
 * @returns {{naturalEvolutionRoot?:true,garbodorResponseOwnerSeat?:null|0|1,
 *   garbotoxinToolRoot?:true,garbotoxinToolRootDeferForStarAlchemy?:boolean}}
 */
function actorGarbodorResponseRootOptions(enabled,ownerSeat=null,
  garbodorToolRoot=false,deferForStarAlchemy=false){
  assert.equal(typeof enabled,'boolean');
  assert.equal(typeof garbodorToolRoot,'boolean');
  assert.equal(typeof deferForStarAlchemy,'boolean');
  assert.ok(!garbodorToolRoot||enabled,
    'Garbodor Tool root requires the natural-evolution root to be enabled');
  assert.ok(ownerSeat===null||ownerSeat===0||ownerSeat===1,
    'Garbodor response owner seat must be null, 0, or 1');
  assert.ok(ownerSeat===null||enabled,
    'A seat-scoped natural-evolution root requires the root to be enabled');
  return enabled?{
    naturalEvolutionRoot:true,
    garbodorResponseOwnerSeat:ownerSeat,
    ...(garbodorToolRoot?{
      garbotoxinToolRoot:true,
      garbotoxinToolRootDeferForStarAlchemy:deferForStarAlchemy
    }:{})
  }:{};
}

/** @returns {object} Canonical actor-wrapper paid-Retreat flags. */
function actorPaidRetreatRootOptions({
  actorTwoUnitPaidRetreatRoot=false,
  actorTwoUnitPaidRetreatTargetTurn=null,
  actorTwoUnitPaidRetreatRootV2=false,
  actorTwoUnitPaidRetreatTargetTurnV2=null
}={}){
  assert.ok(!(actorTwoUnitPaidRetreatRoot&&actorTwoUnitPaidRetreatRootV2),
    'Select only one paid-Retreat policy version');
  assert.ok(actorTwoUnitPaidRetreatTargetTurn===null||
    (actorTwoUnitPaidRetreatRoot&&Number.isSafeInteger(actorTwoUnitPaidRetreatTargetTurn)&&
     actorTwoUnitPaidRetreatTargetTurn>1),
    'Registered v1 paid-Retreat target turn must be an integer >1');
  assert.ok(actorTwoUnitPaidRetreatTargetTurnV2===null||
    (actorTwoUnitPaidRetreatRootV2&&Number.isSafeInteger(actorTwoUnitPaidRetreatTargetTurnV2)&&
     actorTwoUnitPaidRetreatTargetTurnV2>1),
    'Registered v2 paid-Retreat target turn must be an integer >1');
  return {
    ...(actorTwoUnitPaidRetreatRoot?{
      twoUnitPaidRetreatRoot:true,
      twoUnitPaidRetreatTargetTurn:actorTwoUnitPaidRetreatTargetTurn
    }:{}),
    ...(actorTwoUnitPaidRetreatRootV2?{
      twoUnitPaidRetreatRootV2:true,
      twoUnitPaidRetreatTargetTurnV2:actorTwoUnitPaidRetreatTargetTurnV2
    }:{})
  };
}

/**
 * Select an explicit RNG protocol while preserving legacy defaults.
 * @param {{isolatePolicyRandomness?:boolean,isolatePhysicalShuffleRandomnessAfterSetup?:boolean}} [options]
 * @returns {{request:object,manifest:object}}
 */
function rngProtocolSelection(options={}){
  const isolatePolicyRandomness=options.isolatePolicyRandomness??false;
  const isolatePhysicalShuffleRandomnessAfterSetup=
    options.isolatePhysicalShuffleRandomnessAfterSetup??false;
  assert.equal(typeof isolatePolicyRandomness,'boolean');
  assert.equal(typeof isolatePhysicalShuffleRandomnessAfterSetup,'boolean');
  const randomnessProtocol=isolatePhysicalShuffleRandomnessAfterSetup?
    (isolatePolicyRandomness?
      'per-seat-policy-and-physical-shuffle-after-setup-prng-v1':
      'per-seat-physical-shuffle-after-setup-prng-v1'):
    (isolatePolicyRandomness?
      'separate-game-and-per-seat-policy-prng-v1':'legacy-shared-prng');
  return {
    request:{
      isolatePolicyRandomness,
      isolatePhysicalShuffleRandomness:false,
      isolatePhysicalShuffleRandomnessAfterSetup
    },
    manifest:{
      policyRandomIsolation:isolatePolicyRandomness,
      physicalShuffleRandomIsolation:false,
      physicalShuffleRandomIsolationAfterSetup:
        isolatePhysicalShuffleRandomnessAfterSetup,
      randomnessProtocol
    }
  };
}

/**
 * Fail closed unless the live root wrapper receives the requested paid-Retreat selector.
 * @param {{actorOnlyComposition?:boolean,
 *   actorTwoUnitPaidRetreatRoot?:boolean,actorTwoUnitPaidRetreatTargetTurn?:number|null,
 *   actorTwoUnitPaidRetreatRootV2?:boolean,actorTwoUnitPaidRetreatTargetTurnV2?:number|null,
 *   scopedRoot?:object,rootOptions?:object}} options
 * @returns {object} Explicit wrapper and selector-selection receipt.
 */
function paidRetreatRootWrapperActivationReceipt({
  actorOnlyComposition=false,
  actorTwoUnitPaidRetreatRoot=false,
  actorTwoUnitPaidRetreatTargetTurn=null,
  actorTwoUnitPaidRetreatRootV2=false,
  actorTwoUnitPaidRetreatTargetTurnV2=null,
  scopedRoot=null,
  rootOptions=null
}={}){
  const optIn=actorTwoUnitPaidRetreatRoot||actorTwoUnitPaidRetreatRootV2;
  const optionPassed=actorTwoUnitPaidRetreatRoot?
    rootOptions?.twoUnitPaidRetreatRoot===true&&
      rootOptions?.twoUnitPaidRetreatTargetTurn===actorTwoUnitPaidRetreatTargetTurn:
    actorTwoUnitPaidRetreatRootV2?
      rootOptions?.twoUnitPaidRetreatRootV2===true&&
        rootOptions?.twoUnitPaidRetreatTargetTurnV2===actorTwoUnitPaidRetreatTargetTurnV2:
      false;
  const selected=typeof scopedRoot?.root==='function'&&(!optIn||optionPassed);
  assert.ok(!optIn||actorOnlyComposition,
    'Paid-Retreat root selection requires bilateral actor-only composition');
  assert.ok(!optIn||selected,
    'Paid-Retreat opt-in did not pass its selector into the live scopedRoot wrapper');
  return {
    twoUnitPaidRetreatRootOptIn:actorTwoUnitPaidRetreatRoot,
    twoUnitPaidRetreatRootV2OptIn:actorTwoUnitPaidRetreatRootV2,
    twoUnitPaidRetreatRootOptionPassed:optIn&&optionPassed,
    twoUnitPaidRetreatRootWrapperSelected:optIn&&selected
  };
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
  paperPromptPortfolio=false,sharedPaperPaymentPortfolio=false,
  paperQuickBallPayment=false,paperSecretBoxPayment=false,
  nativeOwnerSupporterOpportunity=false,nativeSetupCompensationAudit=false,
  nativePublicMulliganRevealsAudit=false,
  nativeSetupCoinChoiceReceipt=false,physicalZoneGate=false,
  nativeRejectedActionEvidence=false,actorNativeAorItemLock=false,
  proposalStateAudit=false,nativeProposalValidationAudit=false,nativeProposalTapeOrdinal=null,
  nativeOpponentHiddenReadAudit=false,nativeActionInputWitness=false,
  nativeActionInputTapeOrdinal=null,nativeAcceptedTargets=false,
  nativeQuickBallOwnerTransactionAudit=false,
  paperTerminalAttackKo=false,
  nativeRootActionLimit=null,nativeFirstTurnPublicBoard=false,
  nativeAllOwnerPassFrontier=false,
  rank6K1AlternativeEnergy=false,
  rank6ScriptedSpecialConditionGuard=false,
  rank11SourceSupporterPassRescue=false,
  rank11ExclusiveOpening=false,
  paperRank9ElectrodeGXCorrection=false,
  sourceIndependentCommonPolicy=false,
  nativeOwnerTrainerFallback=false,ownerFallbackDiagnosticView=false,
  mysteriousTreasureRoot=false,firstBlockedPromptContractObserver=false,
  losslessNativeRootJoin=false,registeredTrial=false,
  isolatePolicyRandomness=false,
  isolatePhysicalShuffleRandomnessAfterSetup=false,
  specialRedCardPaperPreselection=false,
  specialRedCardPaperCorrection=false,
  specialRedCardPaperSpeculativeShuffle=false,
  onRootStoreCreated=null,onRootActionDispatched=null,
  captureNativeAttackPhysicalTape=false
}={}){
  if(initializationWindow)assert.equal(trial.rank,6,
    'Initialization passive window belongs only to rank 6');
  if(garbotoxinWindow)assert.equal(trial.rank,11,
    'Garbodor power window belongs only to rank 11');
  const rng=rngProtocolSelection({
    isolatePolicyRandomness,isolatePhysicalShuffleRandomnessAfterSetup
  });
  const nativeAttackTape=captureNativeAttackPhysicalTape?
    require('./2026-11/agent13-postgame-attack-modality-ledger.cjs')
      .createPostgameAttackTape():null;
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
    seed:trial.seed,
    maxActions:nativeRootActionLimit??registration.maxRootActions,
    // The actual headless Store callback also receives the exact currently
    // executing registered trial ID. Existing single-argument users ignore it.
    // Observer data is postgame-only and never enters an actor information set.
    onRootStoreCreated:onRootStoreCreated||nativeAttackTape?
      store=>{
        onRootStoreCreated?.(store,trial.id);
        nativeAttackTape?.onRootStoreCreated(store);
      }:null,
    onRootActionDispatched:onRootActionDispatched||nativeAttackTape?
      (...args)=>{
        onRootActionDispatched?.(...args);
        nativeAttackTape?.onRootActionDispatched(...args);
      }:null,
    label:'agent41-bilateral-v2-common-policy-development-'+trial.id,
    ...registration.frozenFlags,
    ...rng.request,
    specialRedCardPaperPreselection,
    specialRedCardPaperCorrection,
    specialRedCardPaperSpeculativeShuffle,
    // Optional both-seat release gate: native Store must retain all physical
    // sixty cards after every settled root. Leave historical fixtures unchanged.
    capturePhysicalZoneIntegrity:physicalZoneGate,
    enforceSettledPhysicalZoneIntegrity:physicalZoneGate,
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
    // Pure post-game public Active/Bench observer, off for every frozen arm.
    captureStartingBoard:nativeFirstTurnPublicBoard,
    captureAttackPassProbes:true,
    capturePerfectionPassProbeSeat:candidateSeat,
    captureHeldTelepathPassProbeSeat:candidateSeat,
    captureInitialSourceDealFingerprintSeat:sourceSeat,
    // Existing opaque two-seat setup fingerprint authenticates the complete
    // physical deal. It is postdecision evidence and never reaches policy.
    captureInitialFullPhysicalDeal:true,
    // Owner-only postgame evidence, captured at the native loop boundary
    // before the first bot decision of each live player's own first turn.
    captureFirstLiveOwnerHands:true,
    // First-setup accepted coin, chooser and real first-draw receipt. Postgame only.
    captureSetupCoinChoiceReceipt:nativeSetupCoinChoiceReceipt,
    ...(losslessNativeRootJoin?{captureNativePolicyActionJoin:true}:{}),
    // Native Store's setup/shuffle and optional-mulligan observer is strictly
    // read-only. Leave prior full-match policy and archive schema unchanged
    // unless the audit is specifically requested.
    ...(nativeSetupCompensationAudit?{captureSetupCompensation:true}:{}),
    ...(nativePublicMulliganRevealsAudit?{capturePublicMulliganReveals:true}:{}),
    // Preserve the actual failed Store root, pre-dispatch public board,
    // accepted label ledger, and source physical-deal digest on abort.
    // This post-choice observer cannot affect either player's bot policy.
    captureNativeAbortEvidence:true,
    // Offline post-failure owner-card identity; never supplied to either bot.
    captureRejectedActionEvidence:nativeRejectedActionEvidence,
    paperTerminalAttackKoCorrection:paperTerminalAttackKo,
    electrodeGXEnergyCorrection:paperRank9ElectrodeGXCorrection
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
  let paperPromptPortfolioAudit=null;
  let sharedPaperPaymentAudit=null;
  let paperQuickBallAudit=null;
  let paperSecretBoxAudit=null;
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
  // Research-owned, printing-aware pre-dispatch Store gate. It is opt-in
  // and covers only TWM Volt Cyclone physical Energy transfers.
  // All other prompt families receive an explicit unverified disposition.
  const runWithPaperPromptPortfolio=()=>{
    if(!paperPromptPortfolio)return runWithNativeAcceptedTargets();
    const witnessed=require('../twinleaf/agent39-paper-prompt-portfolio.cjs')
      .withPaperPromptPortfolio(runWithNativeAcceptedTargets);
    paperPromptPortfolioAudit=witnessed.audit;
    return witnessed.result;
  };
  // Default-off source-printed Secret Box TWM three physical hand-card
  // mandatory payment guard. Optional four-category deck search is separate.
  // Only the actual live original Store is checked, never policy clones.
  const runWithPaperSecretBoxPayment=()=>{
    if(!paperSecretBoxPayment)return runWithPaperPromptPortfolio();
    const observed=require('../twinleaf/agent4-secret-box-paper-payment-hook.cjs')
      .withPaperSecretBoxMandatoryPayment(runWithPaperPromptPortfolio,{
        requireLiveStore:true,currentTrialId:()=>trial.id
      });
    paperSecretBoxAudit=observed.audit;
    return observed.result;
  };
  // V3 additive Quick Ball printed mandatory-payment gate. The separate
  // Basic search allows zero cards, so this wrapper only checks genuine
  // CHOOSE_CARD_TO_DISCARD source prompts, on the live Store for each trial.
  // Always default OFF in historical and reference comparisons.
  const runWithPaperQuickBallPayment=()=>{
    if(!paperQuickBallPayment)return runWithPaperSecretBoxPayment();
    const observed=require('../twinleaf/agent4-quick-ball-paper-payment-hook.cjs')
      .withPaperQuickBallMandatoryPayment(runWithPaperSecretBoxPayment,{
        requireLiveStore:true,currentTrialId:()=>trial.id
      });
    paperQuickBallAudit=observed.audit;
    return observed.result;
  };
  // Shared v11 source-printed Roxie/Ultra Ball/Secret Box/Alakazam payment gate.
  // Distinct from the historical Agent39 portfolio for audit attribution.
  const runWithSharedPaperPaymentPortfolio=()=>{
    if(!sharedPaperPaymentPortfolio)return runWithPaperQuickBallPayment();
    const observed=require('../twinleaf/agent41-paper-prompt-contract-portfolio.cjs')
      .withPaperPromptContractPortfolio(runWithPaperQuickBallPayment,{
        requireLiveStore:true,currentTrialId:()=>trial.id
      });
    sharedPaperPaymentAudit=observed.audit;
    return observed.result;
  };
  const runWithActionInputWitness=()=>{
    if(!nativeActionInputWitness)return runWithSharedPaperPaymentPortfolio();
    const base=path.join(root,'vendor/twinleaf/ptcg-server/output');
    const SimpleTacticsAi=require(path.join(base,
      'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
    const Store=require(path.join(base,'game/store/store')).Store;
    const witnessed=require('../twinleaf/agent23-native-decision-dispatch-witness.cjs')
      .withNativeDecisionDispatchWitness(runWithSharedPaperPaymentPortfolio,
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
  const common=()=>sourceIndependentCommonPolicy?
    require('./agent36-bilateral-two-seat-common-policy.cjs')
      .withIdenticalTwoSeatCommonPolicy(runWithOwnerSupporterOpportunity):
    withBilateralCommonCandidatePolicy(candidateSeat,
      runWithOwnerSupporterOpportunity);
  let game,sourceAudit,commonAudit;
  let sourceSupporterRescueAudit=null;
  let sourceExclusiveOpeningAudit=null;
  if(sourceIndependentCommonPolicy){
    // Independent development gate: no rank-conditioned opponent script.
    // The same three resource adapters run for both real physical seats.
    const played=common();
    sourceAudit=null;
    commonAudit=played.policyAudit;
    game=played.result;
  }else if(trial.rank===11){
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
  }else if(trial.rank===6){
    const allowedDiscards=discardOrder.slice(0,-5);
    const played=withBroadThornsSourceAttack(()=>
      withBroadThornsSourceAttack(common,
        {seat:sourceSeat,turn:3,discardPriority:allowedDiscards,
          k1AlternativeEnergy:rank6K1AlternativeEnergy,
          nativeSpecialConditionAttackGuard:rank6ScriptedSpecialConditionGuard}),
      {seat:sourceSeat,turn:2,discardPriority:allowedDiscards,
        k1AlternativeEnergy:rank6K1AlternativeEnergy,
        nativeSpecialConditionAttackGuard:rank6ScriptedSpecialConditionGuard});
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
  }else{
    // Other original source ranks receive the same symmetric native root
    // policy without a rank-6 Thorns or rank-11 Garbodor source override.
    const played=common();
    sourceAudit=null;
    commonAudit=played.policyAudit;
    game=played.result;
  }
  assert.equal(commonAudit.version,POLICY_VERSION);
  assert.equal(game.seed,trial.seed);
  assert.equal(game.engine,'twinleafgg/'+registration.enginePin);
  assert.equal(game.verifiedByDrawLog,true);
  assert.equal(game.promptValidationMode,'predispatch-prompt-validate');
  assert.equal(game.policyRandomIsolation,rng.manifest.policyRandomIsolation);
  assert.equal(game.physicalShuffleRandomIsolation,
    rng.manifest.physicalShuffleRandomIsolation);
  assert.equal(game.physicalShuffleRandomIsolationAfterSetup,
    rng.manifest.physicalShuffleRandomIsolationAfterSetup);
  assert.equal(game.randomnessProtocol,rng.manifest.randomnessProtocol);
  if(nativeAcceptedTargets){
    // A completed native witness must contain genuine root-linked accepted
    // Store dispatches and a two-seat physical deal. Empty prompt effects
    // remain explicitly observable as zero, never inferred as a certified
    // destination. Engine errors preserve separately typed abort sidecars.
    assert.equal(nativeAcceptedTargetAudit?.observedLiveStore,true);
    if(nativeAcceptedTargetAudit?.rootOrdinalLinked!==true){
      // Preserve the actual Store-side observer record on the existing
      // fail-closed linkage veto; otherwise all context is lost in the catch.
      const mismatch=new Error('Actual native target/root ordinal linkage failed');
      mismatch.nativeAcceptedTargetEvidence=nativeAcceptedTargetAudit;
      throw mismatch;
    }
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
  const legacyFirstSource=game.decisionTrace.find(row=>
    row.playerSlot===sourceSeat &&
    Array.isArray(row.decisionHandBefore?.ownHandPrintings));
  const legacyFirstSourceHand=legacyFirstSource?.decisionHandBefore?.ownHandPrintings??null;
  const sourceFirst=game.firstTurnSlot===sourceSeat;
  assert.equal(game.firstLiveOwnerHands?.schema,'first-live-owner-hand-prebot-v1');
  const firstLiveOwnerHand=game.firstLiveOwnerHands.bySeat[sourceSeat];
  const candidateFirstLiveOwnerHand=game.firstLiveOwnerHands.bySeat[candidateSeat];
  if(firstLiveOwnerHand){
    assert.equal(firstLiveOwnerHand.seat,sourceSeat);
    assert.equal(firstLiveOwnerHand.turn,sourceFirst?1:2);
  }
  if(candidateFirstLiveOwnerHand){
    assert.equal(candidateFirstLiveOwnerHand.seat,candidateSeat);
    assert.equal(candidateFirstLiveOwnerHand.turn,sourceFirst?2:1);
  }
  const ownerFirst=firstLiveOwnerHand?.ownHandPrintings??null;
  const candidateOwnerFirst=candidateFirstLiveOwnerHand?.ownHandPrintings??null;
  const packet=game.publicAttackTransitions||[];
  const acceptedAttackEvents=packet.filter(row=>
    row.declarations?.length && row.settled?.after);
  const rootTrace=game.rootActionLedger||[];
  const nativeAttackPhysicalTape=nativeAttackTape?.result()??null;
  // Additive postgame modality census; legacy attackDeclarations retains its
  // historical meaning of native logged ordinary AttackAction declarations.
  const nativeAttackModalityLedger=
    require('./2026-11/agent13-postgame-attack-modality-ledger.cjs')
      .postgameAttackModalityLedger({rootActionLedger:rootTrace,
        publicAttackTransitions:packet,nativeFinished:game.finished,
        physicalZoneTape:nativeAttackPhysicalTape});
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
    physicalZoneQualification:require('./physical-zone-qualification.cjs')
      .classifyPhysicalZoneEvidence({requested:physicalZoneGate,game}),
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
      (paperPromptPortfolio?'+'+require('../twinleaf/agent39-paper-prompt-portfolio.cjs').VERSION:'')+
      (sharedPaperPaymentPortfolio?'+agent41-paper-prompt-v11-source-payment-opt-in':'')+
      (paperQuickBallPayment?'+agent4-paper-quickball-v3-live-store-cost':'')+
      (paperSecretBoxPayment?'+agent4-paper-secretbox-twm-three-cost-v1-live-store':'')+
      (mandatoryOptionFallback?'+MandatoryOptionDefaultFallback-v1-both-seats+SelectOptionLegalityGate-v1-both-seats':'')+
      (earlyBenchedCompressorPayload?'+owner-compressor-benched-v1':
        (anyTurnCompressorPayload?'+owner-compressor-anyturn-v1':
        (lateCompressorPayload?
        '+owner-compressor-late14-v1':(compressorPayload?'+owner-compressor-v1':''))))+
      (nativeOwnerTrainerFallback?'+native-owner-trainer-fallback-v1':'')+
      (ownerFallbackDiagnosticView?'+owner-fallback-diagnostic-view-v1':'')+
      (mysteriousTreasureRoot?'+'+require('../twinleaf/agent49-mysterious-treasure-frontier.cjs').VERSION:'')+
      (firstBlockedPromptContractObserver?'+agent2-first-blocked-prompt-contract-v1':''),
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
    paperPromptPortfolioOptIn:paperPromptPortfolio,
    sharedPaperPaymentPortfolioOptIn:sharedPaperPaymentPortfolio,
    paperQuickBallPaymentOptIn:paperQuickBallPayment,
    paperQuickBallPaymentAudit:paperQuickBallPayment?paperQuickBallAudit:null,
    paperSecretBoxPaymentOptIn:paperSecretBoxPayment,
    paperSecretBoxPaymentAudit:paperSecretBoxPayment?paperSecretBoxAudit:null,
    sharedPaperPaymentPortfolioAudit:sharedPaperPaymentPortfolio?
      sharedPaperPaymentAudit:null,
    paperSameTargetAttachEnergyAudit:paperSameTargetAttachEnergy?
      sameTargetAttachEnergyAudit:null,
    paperPromptPortfolioAudit:paperPromptPortfolio?paperPromptPortfolioAudit:null,
    paperPromptOriginalSourceRootReconciliation:paperPromptPortfolio?
      require('./agent39-print-prompt-root-reconciliation.cjs')
        .reconcileVoltCycloneRoot({
          rootActionLedger:game.rootActionLedger,
          paperPromptPortfolioAudit
        },sourceSeat):null,
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
    ...(nativeQuickBallOwnerTransactionAudit?{
      nativeQuickBallOwnerTransactions:
        require('./agent41-quickball-owner-transaction.cjs')
          .reconcileQuickBallOwnerTransactions({
            decisionTrace:game.decisionTrace,
            rootActionLedger:rootTrace,
            nativeAcceptedTargetSidecar:nativeAcceptedTargetAudit
          })
    }:{}),
    sourceSeat,candidateSeat,sourceActuallyFirst:sourceFirst,
    rngProtocol:rng.manifest,
    policyRandomIsolation:game.policyRandomIsolation,
    physicalShuffleRandomIsolation:game.physicalShuffleRandomIsolation,
    physicalShuffleRandomIsolationAfterSetup:
      game.physicalShuffleRandomIsolationAfterSetup,
    randomnessProtocol:game.randomnessProtocol,
    ...(specialRedCardPaperPreselection?{
      specialRedCardPaperPreselection:game.specialRedCardPaperPreselection===true,
      specialRedCardPaperPreselectionVersion:
        game.specialRedCardPaperPreselectionVersion??null,
      specialRedCardPaperPreselectionAudits:
        game.specialRedCardPaperPreselectionAudits??[]
    }:{}),
    ...(specialRedCardPaperCorrection?{
      specialRedCardPaperCorrection:game.specialRedCardPaperCorrection===true,
      specialRedCardPaperShuffleProtocol:
        game.specialRedCardPaperShuffleProtocol??null
    }:{}),
    ...(specialRedCardPaperSpeculativeShuffle?{
      specialRedCardPaperSpeculativeShuffle:
        game.specialRedCardPaperSpeculativeShuffle===true,
      specialRedCardPaperSpeculativeShuffleProtocol:
        game.specialRedCardPaperSpeculativeShuffleProtocol??null
    }:{}),
    enginePin:registration.enginePin,
    candidateDeckFingerprint:sha256(candidateCards),
    sourceDeckFingerprint:sha256(opponent.cards),
    verifiedFirstTurn:game.verifiedByDrawLog,
    actualStarterSeat:game.firstTurnSlot,
    ...(nativeSetupCoinChoiceReceipt?{
      nativeSetupCoinChoiceReceipt:game.setupCoinChoiceReceipt??null
    }:{}),
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
    // This second digest ignores hand ordering and keeps duplicate native
    // card.fullName values. Native fullName need not encode collector-number
    // artwork variants, so this is a name/set multiset, not paper print proof.
    sourceFirstOwnHandMultisetSha256:ownerFirst?
      sha256(ownerFirst.slice().sort()):null,
    candidateFirstOwnHandSha256:candidateOwnerFirst?
      sha256(candidateOwnerFirst):null,
    candidateFirstOwnHandMultisetSha256:candidateOwnerFirst?
      sha256(candidateOwnerFirst.slice().sort()):null,
    candidateFirstOwnHandFirstActionOrdinal:
      candidateFirstLiveOwnerHand?.actionOrdinal??null,
    candidateFirstOwnHandProtocol:game.firstLiveOwnerHands.schema,
    sourceFirstOwnHandProtocol:game.firstLiveOwnerHands.schema,
    sourceFirstOwnHandFirstActionOrdinal:firstLiveOwnerHand?.actionOrdinal??null,
    sourceLegacyFirstObservedHandSha256:legacyFirstSourceHand?
      sha256(legacyFirstSourceHand):null,
    sourceLegacyFirstObservedHandTurn:legacyFirstSource?.turnBefore??null,
    sourceLegacyFirstObservedHandActionOrdinal:
      legacyFirstSource?.actionOrdinal??null,
    ...(nativeFirstTurnPublicBoard?{
      sourceInitialPublicActiveBench:game.initialBoardAtFirstTurn??null,
      sourceFirstOwnerRelevantHandCounts:ownerFirst?Object.fromEntries(
        ['Budew','Boost Shake','Trubbish','Garbodor','Float Stone',
          'Secret Box','Quick Ball','Battle VIP Pass'].map(name=>[
          name,ownerFirst.filter(card=>
            card===name||card.startsWith(name+' ')).length
        ])):null
    }:{}),
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
    ...(nativeAllOwnerPassFrontier?{
      nativeAllOwnerPassFrontier:
        require('./agent31-bilateral-all-owner-pass-evidence.cjs')
          .auditAllOwnerPasses(game.decisionTrace,rootTrace,trial,sourceSeat)
    }:{}),
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
    // Perfection copies use UseAbilityAction, so this is separate from the
    // ordinary-root-only historical counters above. Prize status is unknown
    // without a separate physical-root tape and independent paper audit.
    nativeAttackModalityLedger,
    ...(nativeAttackPhysicalTape?{nativeAttackPhysicalTape}:{}),
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

/**
 * Preserve the actual printed sixty in each physical native seat for the
 * existing owner-only Trainer frontier. This metadata is supplied only to
 * a postgame read-only observer, never to the opposing decision policy.
 *
 * @param {{candidateId:string,candidateSlot:'A'|'B',rank:number}} trial
 * @param {Map<string,{plan:object}>} prepared Verified source plans.
 * @returns {string[][]} Two exact ordered native deck printing arrays.
 */
function registeredNativeSeatDecks(trial,prepared){
  assert.ok(prepared instanceof Map);
  assert.ok(trial?.candidateSlot==='A'||trial?.candidateSlot==='B');
  const plan=prepared.get(trial.candidateId)?.plan;
  assert.ok(plan&&Array.isArray(plan.opponents));
  const candidate=plan.candidate?.cards;
  const source=plan.opponents.find(row=>row.rank===trial.rank)?.cards;
  assert.equal(candidate?.length,60);
  assert.equal(source?.length,60);
  const decks=trial.candidateSlot==='A'?
    [candidate,source]:[source,candidate];
  assert.ok(decks.every(deck=>deck.every(
    printing=>typeof printing==='string'&&printing.length>0)));
  return decks.map(deck=>[...deck]);
}

/** @returns {object} */
function bilateralJetBenchRootOptions(enabled){
  return enabled?{jetBenchSwitchRoot:true,jetPostRoboContinuation:true,
    jetPostSeekerFabaContinuation:true,rank7FabaJetBridge:true}:{};
}

/**
 * Validate immutable source/candidate trial groups. The default remains the
 * historical paired-candidate design. Single-arm modes distinguish one
 * natural game from one fixed candidate across many source groups.
 * @param {object[]} registeredTrials
 * @param {number[]} admittedRanks
 * @param {boolean} allowSingleCandidateArm
 * @param {boolean} allowSingleCandidatePerGroup
 * @returns {{groupCount:number,trialIds:string[]}}
 */
function validateRegisteredTrialGroups(registeredTrials,admittedRanks,
  allowSingleCandidateArm=false,allowSingleCandidatePerGroup=false) {
  assert.ok(Array.isArray(registeredTrials)&&registeredTrials.length>0);
  assert.ok(Array.isArray(admittedRanks));
  assert.ok(!(allowSingleCandidateArm&&allowSingleCandidatePerGroup),
    'Single-candidate modes are mutually exclusive');
  if(allowSingleCandidateArm) {
    assert.equal(registeredTrials.length,1,
      'Single-candidate mode must register exactly one natural game');
  }
  const expectedCandidateIds=['champion-reference','new-moon-lockbreaker-v1'];
  const groups=new Map();
  const ids=new Set();
  for(const trial of registeredTrials) {
    assert.ok(admittedRanks.includes(trial.rank),
      'Registered source rank requires an authenticated original 60');
    assert.ok(['A','B'].includes(trial.candidateSlot));
    assert.ok((allowSingleCandidateArm||allowSingleCandidatePerGroup)?
      (typeof trial.candidateId==='string'&&trial.candidateId.length>0):
      expectedCandidateIds.includes(trial.candidateId));
    assert.ok(Number.isSafeInteger(trial.repeat)&&trial.repeat>=0);
    assert.ok(Number.isSafeInteger(trial.seed)&&trial.seed>=0&&
      trial.seed<=0xffffffff);
    assert.equal(trial.id,[trial.rank,trial.repeat,trial.candidateSlot,
      trial.candidateId].join(':'));
    assert.ok(!ids.has(trial.id),'Duplicate preregistered arm');
    ids.add(trial.id);
    const groupId=trial.id.slice(0,trial.id.lastIndexOf(':'));
    const group=groups.get(groupId)||{seed:trial.seed,ids:[]};
    assert.equal(group.seed,trial.seed,
      'Candidate pair must use identical preregistered integer seed');
    group.ids.push(trial.candidateId);
    groups.set(groupId,group);
  }
  if(allowSingleCandidateArm) {
    assert.equal(groups.size,1,
      'Single-candidate mode must contain exactly one registered group');
    assert.equal([...groups.values()][0].ids.length,1,
      'Single-candidate mode must contain exactly one candidate arm');
  } else if(allowSingleCandidatePerGroup) {
    assert.ok(groups.size>1,
      'Single-candidate-per-group mode requires multiple source groups');
    const candidateIds=new Set();
    for(const group of groups.values()) {
      assert.equal(group.ids.length,1,
        'Each source group must contain exactly one candidate arm');
      candidateIds.add(group.ids[0]);
    }
    assert.equal(candidateIds.size,1,
      'Every source group must use the same fixed candidate');
  } else {
    for(const group of groups.values()) {
      assert.deepEqual(group.ids.slice().sort(),expectedCandidateIds);
    }
  }
  return {groupCount:groups.size,trialIds:[...ids]};
}

/**
 * Return only complete two-contender comparison keys. Explicit single-arm
 * modes retain native rows without fabricating cross-candidate comparisons.
 * @param {object[]} scheduled
 * @param {boolean} allowSingleCandidateArm
 * @param {boolean} allowSingleCandidatePerGroup
 * @returns {string[]}
 */
function registeredSourcePairKeys(scheduled,allowSingleCandidateArm=false,
  allowSingleCandidatePerGroup=false) {
  assert.ok(Array.isArray(scheduled));
  assert.ok(!(allowSingleCandidateArm&&allowSingleCandidatePerGroup));
  if(allowSingleCandidateArm){
    assert.equal(scheduled.length,1,
      'Single-candidate comparison gate requires exactly one scheduled game');
    return [];
  }
  if(allowSingleCandidatePerGroup){
    const groups=new Map();
    for(const row of scheduled){
      const key=row.id.slice(0,row.id.lastIndexOf(':'));
      const group=groups.get(key)||[];
      group.push(row.candidateId);
      groups.set(key,group);
    }
    assert.ok(groups.size>1);
    const candidateIds=new Set();
    for(const ids of groups.values()){
      assert.equal(ids.length,1,
        'Single-candidate-per-group comparison gate requires one arm per group');
      candidateIds.add(ids[0]);
    }
    assert.equal(candidateIds.size,1,
      'Single-candidate-per-group comparison gate requires one fixed candidate');
    return [];
  }
  return [...new Set(scheduled.map(row=>
    row.id.slice(0,row.id.lastIndexOf(':'))))];
}

function runDevelopment({
  compressorPayload=false,opportunityAudit=false,lateCompressorPayload=false,
  anyTurnCompressorPayload=false,earlyBenchedCompressorPayload=false,
  mandatoryOptionFallback=false,nativePressureWindows=false,
  sourceFirstRetrospective=false,paperSupporterQuota=false,
  paperCologneQuota=false,paperFullBenchCallForFamily=false,
  paperSupporterComparisonTrace=false,paperSameTargetAttachEnergy=false,
  paperPromptPortfolio=false,sharedPaperPaymentPortfolio=false,
  paperQuickBallPayment=false,paperSecretBoxPayment=false,
  nativeOwnerSupporterOpportunity=false,nativeSetupCompensationAudit=false,
  nativePublicMulliganRevealsAudit=false,
  nativeSetupCoinChoiceReceipt=false,physicalZoneGate=false,
  nativeRejectedActionEvidence=false,actorNativeAorItemLock=false,
  actorColoredStarterBias=false,
  proposalStateAudit=false,nativeProposalValidationAudit=false,nativeProposalTapeOrdinal=null,
  nativeOpponentHiddenReadAudit=false,actorOnlyComposition=false,
  sourceIndependentCommonPolicy=false,
  ownerGenericTrainerFrontier=false,nativeOwnerTrainerFallback=false,
  ownerFallbackDiagnosticView=false,mysteriousTreasureRoot=false,
  mysteriousTreasureMuscleBandPayment=false,
  firstRegidragoBenchGrass=false,retreatFundingBridge=false,
  firstCrispinSeekerRecovery=false,
  earlyRegidragoCompressor=false,
  earlyRegidragoCompressorSourceOnly=false,
  earlyRegidragoCompressorAllowFirstOwnTurnTwo=false,
  rank13CrispinRoot=false,rank13CrispinSourceOnly=false,
  rank13SourceFirstOwnGrass=false,rank13SourceFirstOwnGrassSourceOnly=false,
  bilateralPerfectionRoot=false,
  bilateralPerfectionTransitionRoot=false,
  bilateralGengarHorrorHouseTempo=false,
  bilateralGengarFlexibleV2=false,
  bilateralGengarResourceProtectedV3=false,
  bilateralGengarHorrorHouseMinOpponentHandCount=0,
  firstBlockedPromptContractObserver=false,
  actorOnlySingleSearch=false,actorMewGenesectQuickBallSearch=false,
  actorMewUltraBallRoot=false,actorMewUltraBallSearch=false,
  actorMewUltraBallPaymentGuard=false,
  actorMewQuickBallPaymentGuard=false,
  actorGenericFallbackAttribution=false,
  actorHandDiscard=false,actorAttackFuelDiscard=false,actorChoosePokemon=false,
  actorPotentialKoRoot=false,actorPotentialKoSourceOnly=false,
  actorOriginal29PrintedFidelity=false,
  actorNaturalEvolutionRoot=false,actorNaturalEvolutionSourceOnly=false,
  actorGarbodorResponseOwnerSeat=null,
  actorGarbodorToolRoot=false,actorGarbodorToolRootDeferForStarAlchemy=false,
  actorMewGenesectTechnoBlast=false,
  actorMewGenesectTechnoBlastSourceOnly=false,
  actorMewMaxMiracleOverSelfCopy=false,
  actorDceMewMobilityRoot=false,actorDceMewMobilitySourceOnly=false,
  actorMewDceRecipientRoot=false,actorMewDceRecipientSourceOnly=false,
  actorMewGenesectBenchFirst=false,actorMewGenesectBenchFirstSourceOnly=false,
  actorGenesectFusionDrawRoot=false,
  actorGenesectFusionDrawSourceOnly=false,
  actorGenesectFusionDrawPerCopyPublicUsage=false,
  actorUnderworldDoorRoot=false,
  actorPathUnderworldStadiumCounter=false,
  actorMimikyuApexFundedPromotion=false,
  actorTempleDdeDenialRoot=false,
  actorArvenHoodSearchRoot=false,
  actorPathToPeakOpposingAbility=false,
  actorUnderworldActiveFundingPriority=false,
  actorUnderworldActiveFundingThresholdV2=false,
  actorUnderworldActiveFundingMirrorVeto=false,
  actorUnderworldActiveFundingMinTurn=null,
  actorMaxGeistManualRecovery=false,
  actorFundedShadowRiderFloatStoneRoot=false,
  actorTwoUnitPaidRetreatRoot=false,
  actorTwoUnitPaidRetreatTargetTurn=null,
  actorTwoUnitPaidRetreatRootV2=false,
  actorTwoUnitPaidRetreatTargetTurnV2=null,
  isolatePolicyRandomness=false,
  isolatePhysicalShuffleRandomnessAfterSetup=false,
  specialRedCardPaperPreselection=false,
  specialRedCardPaperCorrection=false,
  specialRedCardPaperSpeculativeShuffle=false,
  onRootStoreCreated=null,onRootActionDispatched=null,
  captureNativeAttackPhysicalTape=false,
  actorGenericFundedFloatStoneRoot=false,
  actorGenericFundedFloatStoneSourceOnly=false,
  actorGenericFundedFloatStoneCandidateOnly=false,
  actorGenericFundedFloatStoneCensus=false,
  actorGenericTacticalSwitchRoot=false,
  actorOpponentBlockSwitchRoot=false,
  actorZeroEnergyStrandFloatStoneRoot=false,
  actorZeroEnergyStrandFloatStoneTargetTurn=null,
  actorZeroEnergyStrandFloatStoneOwnerSeat=null,
  actorUnderworldDoorPromptOwner=false,
  actorUnderworldAttackGapRecipient=false,
  sourceCrobatDceMewRetreat=false,
  actorFarewellLetterRoot=false,
  actorVipBeforeAttack=false,
  actorVipMegaAbsolTarget=false,
  actorVipAfterPass=false,
  actorVipAfterPassAdapter=null,
  actorFogPromptAdapter=null,
  actorVipRank9MegaVoltorbRecipient=false,
  actorPlumeriaAfterPass=false,actorOwnerMailAfterPass=false,
  actorOwnerMailAfterPassSourceOnly=false,
  actorOwnerMailSelectedMarnieOnPass=false,
  actorBilateralLillieAfterPass=false,
  actorDeckoutRescueRoot=false,actorDeckoutRescueBeforeAttack=false,
  actorEarlyForestSealRoot=false,bilateralEarlyForestSealRoot=false,
  actorPaleMoonGXRoot=false,
  actorOwnerMailAfterPassScope=null,
  actorGuzmaPromptContinuation=false,actorGuzmaNominalGust=false,
  actorSeekerGuzmaNominalKo=false,actorSeekerGuzmaSourceOnly=false,
  actorSeekerGuzmaOwnerSeat=null,actorSeekerGuzmaGlobalTurn=null,
  actorRank9SpecialFundedGuzma=false,
  actorRank9CompressorOwnerBridge=false,
  actorRank9CompressorOwnerCandidate=false,
  actorRank9CompressorAnyTurn=false,
  actorRank9CompressorBombAfter=false,
  actorRank9LateBenchBomb=false,
  actorRank9PostBombRope=false,
  actorRank9RopeOpponentSurvival=false,
  actorRank9RopeOpponentDamageAware=false,
  actorRank9UltraDeadVipAfterPass=false,
  actorRank9CompressorEnergyTarget=3,
  paperRank9ElectrodeGXCorrection=false,
  actorRank9MegaAbsolFundingRoot=false,
  actorActiveMegaClawPriorityRoot=false,
  actorRank9SpecialPaidRetreatSource=false,
  actorFlexiblePaidRetreatRoot=false,
  actorSkylinerFundedBenchRetreatRoot=false,
  actorChargedPromotion=false,sourceFloatStoneMobility=false,
  nativeActionInputWitness=false,
  nativeActionInputTapeOrdinal=null,nativeAcceptedTargets=false,
  nativeQuickBallOwnerTransactionAudit=false,
  paperTerminalAttackKo=false,
  nativeRootActionLimit=null,nativeFirstTurnPublicBoard=false,
  nativeAllOwnerPassFrontier=false,
  rank6K1AlternativeEnergy=false,
  rank6ScriptedSpecialConditionGuard=false,
  rank11SourceSupporterPassRescue=false,
  rank11ExclusiveOpening=false,
  sourceScopedSpecialEnergyRoot=false,
  candidateScopedSpecialEnergyRoot=false,
  bilateralSpecialEnergyRoot=false,
  sourceScopedQuickBallRoot=false,candidateScopedQuickBallRoot=false,
  sourceScopedStrandedMarnieRoot=false,
  sourceScopedDialgaShredT53=false,
  sourceQuickBallPreservePayableAttack=false,
  bilateralPublicContextSpecialEnergy=false,
  bilateralBasicEnergyRecipientFrontier=false,
  bilateralPerfectionBenchFunding=false,
  bilateralConservativeShuffleRoot=false,
  bilateralEnergyContest=false,
  bilateralJetBenchSwitchRoot=false,
  sameRootProposalChoice=false,sameRootChoiceApply=false,
  sameRootProbeAll=false,sameRootPublicEventReceipt=false,
  nativeToolAttachRoot=false,nativePlumeriaChoice=false,
  teamFlareGruntDenialRoot=false,
  nativeZeroCostDenialChoice=false,
  losslessNativeRootJoin=false,
  registeredToolEnergyCeiling=false,nativeCoheldDenialCanPlay=false,
  sameRootPassAttackProbeGlobalTurn=null,
  sameRootPublicNoBenchTerminal=false,
  sameRootPositiveAttackOverPass=false,
  sameRootThornsEmptyBench=false,
  candidateOnlyKnownDeadRoot=false,bilateralKnownDeadAttackRoot=false,
  registeredTrials=null,registeredFrameName=null,
  registeredCandidateDecks=null,
  allowSingleCandidateArm=false,allowSingleCandidatePerGroup=false,
  allowAdditionalOriginalSourceRanks=false,
  allowExtendedRegisteredNativeRootCap=false
}={}){
  const naturalEvolutionOptions=actorGarbodorResponseRootOptions(
    actorNaturalEvolutionRoot,actorGarbodorResponseOwnerSeat,
    actorGarbodorToolRoot,actorGarbodorToolRootDeferForStarAlchemy);
  const rng=rngProtocolSelection({
    isolatePolicyRandomness,isolatePhysicalShuffleRandomnessAfterSetup
  });
  assert.ok(!specialRedCardPaperCorrection||specialRedCardPaperPreselection,
    'Shared M4 paper Store correction requires owner-root preselection');
  assert.ok(!specialRedCardPaperSpeculativeShuffle||
    (specialRedCardPaperPreselection&&specialRedCardPaperCorrection&&
    isolatePolicyRandomness&&isolatePhysicalShuffleRandomnessAfterSetup),
    'M4 speculative clone requires both paper hooks and both RNG isolation domains');
  assert.ok(!actorRank9UltraDeadVipAfterPass||actorRank9CompressorBombAfter,
    'Original dead-VIP Ultra Ball rescue requires the source Bomb composition');
  assert.ok(!actorRank9CompressorOwnerCandidate||actorRank9CompressorOwnerBridge,
    'Candidate-owner rank9 source bridge needs the original native line');
  assert.ok(!(actorGenericFundedFloatStoneCandidateOnly&&actorGenericFundedFloatStoneSourceOnly),
    'Funded Float target must be exactly one physical side');
  assert.ok(!actorRank9LateBenchBomb||actorRank9CompressorBombAfter,
    'Later-turn bench Bomb requires the source Bomb composition');
  assert.ok(!actorRank9PostBombRope||actorRank9LateBenchBomb,
    'Post-Bomb Rope requires native later-turn Bench Bomb');
  assert.ok(!actorRank9RopeOpponentSurvival||actorRank9PostBombRope,
    'Adversarial Rope replacement requires real source post-Bomb Rope');
  assert.ok(!actorRank9RopeOpponentDamageAware||actorRank9RopeOpponentSurvival,
    'Damage-aware opponent replacement requires owner-only survival flag');
  assert.ok([1,2,3].includes(actorRank9CompressorEnergyTarget),
    'Rank9 source Compressor target must be 1–3 physical Energy');
  assert.ok(!sourceIndependentCommonPolicy||actorOnlyComposition,
    'Two-seat source-independent resource gate requires actor-only base policy');
  assert.ok(!actorColoredStarterBias||actorOnlyComposition,
    'Owner-only setup choice requires the native actor composition');
  assert.ok(!ownerGenericTrainerFrontier||actorOnlyComposition,
    'Owner Trainer census requires canonical actor composition');
  assert.ok(!nativeOwnerTrainerFallback||actorOnlyComposition,
    'Native Trainer fallback requires canonical actor composition');
  assert.ok(!ownerFallbackDiagnosticView||nativeOwnerTrainerFallback,
    'Owner fallback diagnostic view requires native Trainer fallback');
  assert.ok(!ownerFallbackDiagnosticView||actorOnlyComposition,
    'Owner fallback diagnostic view requires canonical actor composition');
  assert.ok(!bilateralPerfectionRoot||actorOnlyComposition,
    'Bilateral paid Perfection root requires the actor-only two-seat policy');
  assert.ok(!bilateralPerfectionTransitionRoot||
    (actorOnlyComposition&&bilateralPerfectionRoot),
    'Bilateral transition requires paid Perfection actor-only roots');
  assert.ok(!mysteriousTreasureRoot||actorOnlyComposition,
    'Mysterious Treasure root requires canonical actor composition');
  assert.ok(!mysteriousTreasureMuscleBandPayment||mysteriousTreasureRoot,
    'Alternative Treasure payment requires the same source-owned Item root');
  assert.ok(!firstRegidragoBenchGrass||actorOnlyComposition,
    'Early Regidrago Bench funding requires canonical actor composition');
  assert.ok(!retreatFundingBridge||actorOnlyComposition,
    'Two-action retreat funding requires bilateral canonical actor composition');
  assert.ok(!firstCrispinSeekerRecovery||mysteriousTreasureRoot,
    'First-turn Crispin recovery requires the enabled Treasure root');
  assert.ok(!actorSeekerGuzmaNominalKo||
    (actorOnlyComposition&&actorGuzmaPromptContinuation),
    'VS Seeker Guzma tactic requires canonical owner root and Guzma prompts');
  assert.ok(!actorSeekerGuzmaSourceOnly||actorSeekerGuzmaNominalKo,
    'Source-only Seeker/Guzma requires the policy enabled');
  assert.ok(!actorPotentialKoSourceOnly||actorPotentialKoRoot,
    'Source-only potential KO requires the policy enabled');
  assert.ok(!actorOwnerMailAfterPassSourceOnly||actorOwnerMailAfterPass,
    'Source-only Trainers Mail requires its native owner Mail wrapper');
  assert.ok(!actorGenesectFusionDrawSourceOnly||actorGenesectFusionDrawRoot,
    'Source-only Genesect draw requires the native actor draw root');
  assert.ok(!actorGenesectFusionDrawPerCopyPublicUsage||actorGenesectFusionDrawRoot,
    'Per-physical-copy Genesect marker mode requires native draw actor');
  assert.ok(!actorMewUltraBallPaymentGuard||actorHandDiscard,
    'Owner Mew Ultra Ball safe payment requires actual hand-discard resolver');
  assert.ok(!actorAttackFuelDiscard||actorOnlyComposition,
    'Dynamic attack-fuel payment requires bilateral actor-only policy');
  assert.ok(!actorAttackFuelDiscard||actorHandDiscard,
    'Dynamic attack-fuel payment requires the owner hand-discard component');
  assert.ok(!actorAttackFuelDiscard||!actorMewUltraBallPaymentGuard,
    'Source-specific Mew payment and dynamic generic payment must be separate arms');
  assert.ok(!actorMewQuickBallPaymentGuard||actorMewUltraBallPaymentGuard,
    'Owner Mew Quick Ball protection requires source Ultra Ball payment guard');
  assert.ok(!actorMewUltraBallSearch||actorOnlySingleSearch,
    'Mew Ultra Ball search requires owner-only search');
  assert.ok(!actorMewUltraBallRoot||actorOnlyComposition,
    'Original Mew Ultra Ball root requires canonical owner root');
  assert.ok(!actorMewGenesectQuickBallSearch||actorOnlySingleSearch,
    'Mew/Genesect Quick Ball search requires owner-only search');
  assert.ok(!actorNaturalEvolutionSourceOnly||actorNaturalEvolutionRoot,
    'Source-only evolution requires the native actor evolution root');
  assert.ok(!actorDceMewMobilitySourceOnly||actorDceMewMobilityRoot,
    'Source-only DCE Mew mobility requires the actor mobility root');
  assert.ok(!actorMewDceRecipientSourceOnly||actorMewDceRecipientRoot,
    'Source-only Mew DCE funding requires the owner recipient root');
  assert.ok(!actorMewGenesectBenchFirstSourceOnly||actorMewGenesectBenchFirst,
    'Source-only Mew/Genesect Bench priority requires the owner root');
  assert.ok(!actorMewGenesectTechnoBlastSourceOnly||actorMewGenesectTechnoBlast,
    'Source-only Mew copy priority requires the owner attack chooser');
  assert.ok(!earlyRegidragoCompressor||actorOnlyComposition,
    'Early Regidrago Compressor requires canonical owner root');
  assert.ok(!earlyRegidragoCompressorSourceOnly||earlyRegidragoCompressor,
    'Source-scoped early compressor requires the native owner root');
  assert.ok(!earlyRegidragoCompressorAllowFirstOwnTurnTwo||earlyRegidragoCompressor,
    'Opening-turn-two compressor requires the native owner root');
  assert.ok(!rank13CrispinRoot||actorOnlyComposition,
    'Source Crispin requires canonical owner-root decisions');
  assert.ok(!rank13CrispinSourceOnly||rank13CrispinRoot,
    'Source-only Crispin requires the native Crispin owner root');
  assert.ok(!rank13SourceFirstOwnGrass||actorOnlyComposition,
    'Rank13 Grass Bench source root requires native actor composition');
  assert.ok(!rank13SourceFirstOwnGrassSourceOnly||rank13SourceFirstOwnGrass,
    'Source-scoped Grass Bench requires owner Grass root');
  assert.ok(!actorPotentialKoRoot||actorOnlyComposition,
    'Type-aware potential KO root requires canonical actor composition');
  assert.ok(!actorOriginal29PrintedFidelity||actorOnlyComposition,
    'Original29 native print correction requires canonical actor composition');
  assert.ok(!firstBlockedPromptContractObserver||actorOnlyComposition,
    'First blocked prompt observer requires canonical actor composition');
  assert.ok(registeredCandidateDecks===null||
    (registeredTrials!==null&&(allowSingleCandidateArm||allowSingleCandidatePerGroup)),
    'Custom candidate decks require an explicit single-candidate registration');
  assert.ok(!allowExtendedRegisteredNativeRootCap||
    Array.isArray(registeredTrials),
    'Extended native root limit requires explicit registered trials');
  assert.ok(nativeRootActionLimit===null||
    (Number.isSafeInteger(nativeRootActionLimit)&&
      nativeRootActionLimit>=16&&
      (nativeRootActionLimit<=registration.maxRootActions||
        (allowExtendedRegisteredNativeRootCap&&nativeRootActionLimit<=640))),
    'Read-only registered panel cap must be a bounded native integer');
  assert.ok(!nativeQuickBallOwnerTransactionAudit||nativeAcceptedTargets,
    'Quick Ball transaction proof requires the native accepted-target sidecar');
  assert.ok(!sourceQuickBallPreservePayableAttack||
    (sourceScopedQuickBallRoot&&actorOnlyComposition),
    'Source payable-attack protection requires source-owned Quick Ball actor');
  assert.ok(!sourceScopedStrandedMarnieRoot||actorOnlyComposition,
    'Source-only held Marnie root requires the actor-only policy');
  assert.ok(!sourceScopedDialgaShredT53||actorOnlyComposition,
    'Source-only Dialga Shred root requires the actor-only policy');
  assert.ok(!(sourceScopedQuickBallRoot&&candidateScopedQuickBallRoot),
    'Quick Ball source and candidate scope probes are exclusive');
  assert.ok((!sourceScopedQuickBallRoot&&!candidateScopedQuickBallRoot)||
    actorOnlyComposition,'Scoped Quick Ball requires actor-only policy');
  assert.ok(!(paperPromptPortfolio&&sharedPaperPaymentPortfolio),
    'Choose exactly one legacy or unified source-printing paper prompt portfolio');
  assert.ok(!actorNativeAorItemLock||actorOnlyComposition,
    'Effective AOR Item play veto requires authenticated actor-only root composition');
  assert.ok(!bilateralKnownDeadAttackRoot||
    (actorOnlyComposition&&!candidateOnlyKnownDeadRoot),
    'Symmetric known-dead attack correction requires two-seat actor-only composition and excludes candidate-only diagnostic');
  assert.ok(!actorNaturalEvolutionRoot||actorOnlyComposition,
    'Native symmetric natural evolution requires actor-only roots');
  assert.ok(!actorGarbodorToolRoot||actorOnlyComposition,
    'Native Garbotoxin Tool response requires actor-only roots');
  assert.ok(!actorFarewellLetterRoot||actorOnlyComposition,
    'Native symmetric Farewell Letter requires actor-only roots');
  assert.ok(!actorMewGenesectTechnoBlast||actorOnlyComposition,
    'Native symmetric Mew/Genesect copy preference requires actor-only prompts');
  assert.ok(!actorMewMaxMiracleOverSelfCopy||actorOnlyComposition,
    'Mew self-copy correction requires owner-only bilateral attack prompts');
  assert.ok(!actorDceMewMobilityRoot||actorOnlyComposition,
    'Owner-paid DCE retreat must use the same actor-only policy in both seats');
  assert.ok(!actorGenesectFusionDrawRoot||actorOnlyComposition,
    'Genesect Fusion draw must use the same actor-only policy in both seats');
  assert.ok(!actorUnderworldDoorRoot||actorOnlyComposition,
    'Underworld Door must use the same actor-only policy in both seats');
  assert.ok(!actorArvenHoodSearchRoot||actorOnlyComposition,
    'Arven Hood search must use the same actor-only policy in both seats');
  assert.ok(!actorPathToPeakOpposingAbility||actorOnlyComposition,
    'Path adversarial Stadium line must use owner-only symmetric actor policy');
  assert.ok(!actorPathUnderworldStadiumCounter||
    (actorUnderworldDoorRoot&&actorOnlyComposition),
    'Path Stadium recovery requires the same owner-marked Underworld root in both seats');
  assert.ok(!actorMimikyuApexFundedPromotion||actorOnlyComposition,
    'Post-Apex Mimikyu promotion requires actor-only bilateral composition');
  assert.ok(!actorUnderworldActiveFundingPriority||
    (actorUnderworldDoorRoot&&actorOnlyComposition),
    'Active Psychic priority requires symmetric Underworld root');
  assert.ok(!actorUnderworldActiveFundingThresholdV2||
    (actorUnderworldDoorRoot&&actorOnlyComposition),
    'Immediate Max Geist threshold requires symmetric Underworld root');
  assert.ok(!actorUnderworldActiveFundingThresholdV2||
    (!actorUnderworldActiveFundingPriority&&
     !actorUnderworldActiveFundingMirrorVeto&&
     actorUnderworldActiveFundingMinTurn===null),
    'Threshold v2 replaces broad v1 priority and its modifiers');
  assert.ok(!actorUnderworldActiveFundingMirrorVeto||
    (actorUnderworldActiveFundingPriority&&actorOnlyComposition),
    'Public mirror veto requires symmetric Active Psychic priority root');
  assert.ok(actorUnderworldActiveFundingMinTurn===null||
    (actorUnderworldActiveFundingPriority&&actorOnlyComposition&&
      Number.isSafeInteger(actorUnderworldActiveFundingMinTurn)&&
      actorUnderworldActiveFundingMinTurn>=1),
    'Public minimum turn requires positive integer and enabled Active priority');
  assert.ok(!actorFundedShadowRiderFloatStoneRoot||actorOnlyComposition,
    'Funded Shadow Rider Float Stone must be symmetric actor-only roots');
  assert.ok(!actorTwoUnitPaidRetreatRoot||actorOnlyComposition,
    'Paid two-Colorless VMAX Retreat must be symmetric actor-only roots');
  assert.ok(actorTwoUnitPaidRetreatTargetTurn===null||
    (actorTwoUnitPaidRetreatRoot&&
     Number.isSafeInteger(actorTwoUnitPaidRetreatTargetTurn)&&
     actorTwoUnitPaidRetreatTargetTurn>1),
    'Registered two-Card Retreat target turn must be an integer >1');
  assert.ok(!actorTwoUnitPaidRetreatRootV2||actorOnlyComposition,
    'Paid Retreat v2 must be symmetric actor-only roots');
  assert.ok(actorTwoUnitPaidRetreatTargetTurnV2===null||
    (actorTwoUnitPaidRetreatRootV2&&
     Number.isSafeInteger(actorTwoUnitPaidRetreatTargetTurnV2)&&
     actorTwoUnitPaidRetreatTargetTurnV2>1),
    'Registered v2 paid-Retreat target turn must be an integer >1');
  assert.ok(!(actorTwoUnitPaidRetreatRoot&&actorTwoUnitPaidRetreatRootV2),
    'Select only one paid-Retreat policy version');
  assert.ok(onRootStoreCreated===null||typeof onRootStoreCreated==='function');
  assert.ok(onRootActionDispatched===null||typeof onRootActionDispatched==='function');
  assert.ok(!actorGenericFundedFloatStoneRoot||actorOnlyComposition,
    'Generic funded Float Stone must use the same actor-only policy in both seats');
  assert.ok(!actorGenericFundedFloatStoneSourceOnly||actorGenericFundedFloatStoneRoot,
    'Source-scoped funded Float Stone requires the owner-visible funded Float policy');
  assert.ok(!actorGenericFundedFloatStoneCensus||actorOnlyComposition,
    'Float Stone census must observe the same actor-only policy in both seats');
  assert.ok(!actorGenericTacticalSwitchRoot||actorOnlyComposition,
    'Generic funded KO Item Switch requires actor-only composition');
  assert.ok(!actorSkylinerFundedBenchRetreatRoot||actorOnlyComposition,
    'Skyliner funded Bench attack must use symmetric actor-only roots');
  assert.ok(!actorOpponentBlockSwitchRoot||actorOnlyComposition,
    'Opponent Block Item rescue requires actor-only composition');
  assert.ok(!actorZeroEnergyStrandFloatStoneRoot||actorOnlyComposition,
    'Zero-Energy strand rescue requires actor-only composition');
  assert.ok(!actorZeroEnergyStrandFloatStoneRoot||
    ((actorZeroEnergyStrandFloatStoneTargetTurn===null||
      (Number.isSafeInteger(actorZeroEnergyStrandFloatStoneTargetTurn)&&
       actorZeroEnergyStrandFloatStoneTargetTurn>1))&&
     (actorZeroEnergyStrandFloatStoneOwnerSeat===null||
      [0,1].includes(actorZeroEnergyStrandFloatStoneOwnerSeat))),
    'Strand rescue must have an explicit valid optional turn and physical-seat scope');
  assert.ok(!actorUnderworldDoorPromptOwner||actorOnlyComposition,
    'Owner Underworld prompt selection requires actor-only composition');
  assert.ok(!actorUnderworldAttackGapRecipient||
    (actorUnderworldDoorRoot&&actorUnderworldDoorPromptOwner&&
     actorOnlyComposition),
    'Bench recipient arbitration requires the same owner-only Underworld root and prompt both seats');
  assert.ok(!actorVipBeforeAttack||actorOnlyComposition,
    'Native source/VIP attack contention requires both-seat actor-only roots');
  assert.ok(!actorVipAfterPass||actorOnlyComposition,
    'Original first-turn VIP after-Pass requires both-seat actor-only root');
  assert.ok(actorVipAfterPassAdapter===null||
    typeof actorVipAfterPassAdapter==='function',
    'VIP after-Pass adapter must be a function or null');
  assert.ok(actorVipAfterPassAdapter===null||actorVipAfterPass,
    'VIP after-Pass adapter injection requires the explicit opt-in');
  assert.ok(actorFogPromptAdapter===null||
    typeof actorFogPromptAdapter==='function',
    'Fog search adapter must be a function or null');
  assert.ok(actorFogPromptAdapter===null||actorOnlyComposition,
    'Fog search adapter needs the native actor-only policy');
  assert.ok(!actorVipRank9MegaVoltorbRecipient||actorVipAfterPass,
    'Exact original Mega and Voltorb VIP targets require after-Pass owner prompt');
  assert.ok(!actorVipMegaAbsolTarget||(actorVipBeforeAttack&&actorOnlyComposition),
    'Mega Absol VIP targeting requires native both-seat VIP before Attack');
  assert.ok(!actorChargedPromotion||(actorOnlyComposition&&actorChoosePokemon),
    'Charged promotion requires actor-only composition and ChoosePokemon');
  assert.ok(!actorActiveMegaClawPriorityRoot||actorRank9MegaAbsolFundingRoot,
    'Active Mega priority needs existing staged funding');
  assert.ok(!actorRank9CompressorOwnerBridge||
    (actorOnlyComposition&&paperRank9ElectrodeGXCorrection),
    'Rank9 source Compressor bridge requires actor-only policy and paper-correct CES48');
  assert.ok(!actorRank9CompressorAnyTurn||actorRank9CompressorOwnerBridge,
    'Late source Compressor probe requires explicit original rank9 owner bridge');
  assert.ok(!actorRank9MegaAbsolFundingRoot||actorOnlyComposition,
    'Rank9 Mega Absol staging requires the common actor-only root');
  assert.ok(!actorRank9SpecialFundedGuzma||
    (actorOnlyComposition&&actorGuzmaPromptContinuation),
    'Special-funded Guzma needs canonical both-seat root and prompt bridge');
  assert.ok(!actorGuzmaPromptContinuation||actorOnlyComposition,
    'Guzma owner recipient bridge requires canonical actor composition');
  assert.ok(!actorGuzmaNominalGust||actorGuzmaPromptContinuation,
    'Nominal opponent gust requires the original Guzma native prompt bridge');
  assert.ok(!actorPlumeriaAfterPass||actorOnlyComposition,
    'Plumeria after-Pass requires canonical actor composition');
  assert.ok(!actorOwnerMailAfterPass||actorOnlyComposition,
    'Owner Mail after-Pass requires canonical actor composition');
  assert.ok(!actorOwnerMailSelectedMarnieOnPass||actorOwnerMailAfterPass,
    'Owner Mail selected-Marnie continuation requires active Mail policy');
  assert.ok(actorOwnerMailAfterPassScope===null||
    (actorOwnerMailAfterPass&&
      typeof actorOwnerMailAfterPassScope.trialId==='string'&&
      Number.isSafeInteger(actorOwnerMailAfterPassScope.globalTurn)&&
      actorOwnerMailAfterPassScope.globalTurn>0),
    'Mail root scope requires registered trial and positive global turn');
  assert.ok(!bilateralSpecialEnergyRoot||actorOnlyComposition,
    'Both-seat Special Energy root requires canonical actor composition');
  assert.ok(!bilateralEnergyContest||bilateralSpecialEnergyRoot,
    'Basic/Special contention requires symmetric both-seat Special root');
  assert.ok(!bilateralPublicContextSpecialEnergy||actorOnlyComposition,
    'Public-context Special Energy requires canonical actor composition');
  assert.ok(!bilateralJetBenchSwitchRoot||actorOnlyComposition,
    'Bilateral Jet Bench switch requires canonical actor composition');
  assert.ok(!bilateralPerfectionBenchFunding||actorOnlyComposition,
    'Bilateral Benched Perfection Energy funding requires actor-only roots');
  assert.ok(!bilateralBasicEnergyRecipientFrontier||actorOnlyComposition,
    'Two-seat Basic Energy recipient frontier requires canonical actor composition');
  const conservativeSupporterRootOptions=commonConservativeSupporterRootOptions({
    enabled:bilateralConservativeShuffleRoot,actorOnlyComposition
  });
  assert.ok(!sameRootProposalChoice||actorOnlyComposition,
    'Same-root proposal choice requires canonical actor composition');
  assert.ok(!sameRootChoiceApply||sameRootProposalChoice,
    'Same-root selection requires an enabled same-root proposal set');
  assert.ok(!losslessNativeRootJoin||
    (actorOnlyComposition&&sameRootProposalChoice),
    'Lossless native policy ordinal join requires both-seat same-root roots');
  assert.ok(!registeredToolEnergyCeiling||
    (nativeToolAttachRoot&&sameRootChoiceApply&&actorOnlyComposition),
    'Own-60 Tool Energy ceiling needs applied both-seat native Tool selection');
  assert.ok(!nativeToolAttachRoot||
    (actorOnlyComposition&&sameRootProposalChoice&&sameRootChoiceApply&&
      !sameRootProbeAll),
    'Native Tool selection requires both-seat same-root applied selector');
  assert.ok(!nativePlumeriaChoice||
    (actorOnlyComposition&&sameRootProposalChoice&&sameRootChoiceApply&&
      actorPlumeriaAfterPass&&!sameRootProbeAll),
    'Native Plumeria contender requires both-seat root choice and mandatory native prompt adoption');
  assert.ok(!nativeZeroCostDenialChoice||
    (nativePlumeriaChoice&&teamFlareGruntDenialRoot&&actorOnlyComposition&&
      sameRootChoiceApply&&!sameRootProbeAll),
    'Coheld free Supporter choice requires a native-capable two-branch Supporter contender');
  assert.ok(!sameRootProbeAll||sameRootProposalChoice,
    'All-proposer census requires an enabled same-root observer');
  assert.ok(!sameRootProbeAll||!sameRootChoiceApply,
    'All-proposer census is observation-only');
  assert.ok(!sameRootPublicEventReceipt||sameRootProposalChoice,
    'Public events require owner same-root observation');
  assert.ok(!nativeCoheldDenialCanPlay||sameRootProposalChoice,
    'Original Store coheld native eligibility needs same-root owner inspection');
  assert.ok(!sameRootPublicNoBenchTerminal||sameRootProposalChoice,
    'Public terminal Knock Out screen requires owner same-root observation');
  assert.ok(!sameRootPositiveAttackOverPass||sameRootProposalChoice,
    'Positive Attack over Pass needs explicit same-root observer');
  assert.ok(!sameRootThornsEmptyBench||sameRootProposalChoice,
    'Exact printed no-Bench attack needs same-root owner observation');
  assert.ok(sameRootPassAttackProbeGlobalTurn==null||
    (sameRootProposalChoice&&
      Number.isSafeInteger(sameRootPassAttackProbeGlobalTurn)&&
      sameRootPassAttackProbeGlobalTurn>=1),
    'Bounded pass/attack fork requires a positive public turn and owner observer');
  assert.ok(!(bilateralPublicContextSpecialEnergy&&
      (bilateralSpecialEnergyRoot||sourceScopedSpecialEnergyRoot||
      candidateScopedSpecialEnergyRoot)),
    'Compare public-context and narrow Special root as distinct policies');
  assert.ok(!sourceFloatStoneMobility||actorOnlyComposition,
    'Source Float Stone rescue requires actor-only composition');
  // Validate pure policy configuration before checking frozen source files;
  // still fail closed before loading a candidate or starting any game.
  assertManifest();
  const {planAichi}=require('./aichi-pilot.cjs');
  const {loadNewMoonCandidate}=require('../../scripts/aichi-new-moon-candidate.cjs');
  const roster=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  const reference=roster.decks.find(x=>x.rank===1);
  assert.ok(reference);
  const baseCandidateDecks=[
    ['champion-reference',{label:'champion-reference',cards:reference.cards}],
    ['new-moon-lockbreaker-v1',{
      label:'new-moon-lockbreaker-v1',cards:loadNewMoonCandidate().cards}]
  ];
  const extraCandidateDecks=Object.entries(registeredCandidateDecks??{}).map(
    ([id,manifest])=>{
      assert.ok(typeof id==='string'&&id.length>0);
      assert.ok(!baseCandidateDecks.some(([baseId])=>baseId===id),
        'Custom candidate id cannot replace a frozen base candidate');
      assert.ok(manifest&&Array.isArray(manifest.cards));
      assert.equal(manifest.cards.reduce((n,x)=>n+x.count,0),60,
        'Custom registered candidate must contain exactly 60 printed cards');
      return [id,{label:manifest.label??id,cards:manifest.cards}];
    });
  const candidateDecks=[...baseCandidateDecks,...extraCandidateDecks];
  const prepared=new Map(candidateDecks.map(([id,manifest])=>
    [id,{plan:planAichi(manifest,{allowEquivalentBasicEnergies:true,
      allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true})}]));
  const rows=[];
  assert.ok(!(allowSingleCandidateArm&&allowSingleCandidatePerGroup),
    'Single-candidate modes are mutually exclusive');
  assert.ok(!(allowSingleCandidateArm||allowSingleCandidatePerGroup)||
    registeredTrials!==null,
    'Single-candidate modes require explicit registered trials');
  if(registeredTrials!==null){
    assert.equal(sourceFirstRetrospective,false,
      'Prospective trials cannot activate selected historical source-first seeds');
    assert.ok(typeof registeredFrameName==='string' &&
      registeredFrameName.length>0);
    assert.ok(Array.isArray(registeredTrials)&&registeredTrials.length>0);
    const admittedRanks=require('./agent25-authenticated-source-admission.cjs')
      .authenticatedSourceRanks(roster,allowAdditionalOriginalSourceRanks);
    validateRegisteredTrialGroups(registeredTrials,admittedRanks,
      allowSingleCandidateArm,allowSingleCandidatePerGroup);
  }
  const scheduled=registeredTrials??(sourceFirstRetrospective?
    sourceFirstPressureTrials():developmentTrials());
  for(const trial of scheduled){
    assert.ok(prepared.has(trial.candidateId),
      'Every registered trial must resolve to a prepared candidate deck');
    // Own-registered-60 information is available to the owning actor but
    // never to the opponent actor. Preserve original printed manifest entries
    // separately from the resolver's flattened native card IDs.
    const sourcePrintedSixty=registeredToolEnergyCeiling?
      roster.decks.find(x=>x.rank===trial.rank)?.cards:null;
    const candidatePrintedSixty=registeredToolEnergyCeiling?
      (trial.candidateId==='champion-reference'?reference.cards:
        trial.candidateId==='new-moon-lockbreaker-v1'?
          loadNewMoonCandidate().cards:
          registeredCandidateDecks?.[trial.candidateId]?.cards):null;
    if(registeredToolEnergyCeiling){
      assert.ok(Array.isArray(sourcePrintedSixty)&&
        Array.isArray(candidatePrintedSixty));
      assert.equal(sourcePrintedSixty.reduce((n,x)=>n+x.count,0),60);
      assert.equal(candidatePrintedSixty.reduce((n,x)=>n+x.count,0),60);
    }
    const ownerRegisteredSixtiesBySeat=registeredToolEnergyCeiling?
      (trial.candidateSlot==='A'?{
        0:candidatePrintedSixty,1:sourcePrintedSixty
      }:{0:sourcePrintedSixty,1:candidatePrintedSixty}):null;
    let paidRetreatWrapperActivation={
      twoUnitPaidRetreatRootOptIn:actorTwoUnitPaidRetreatRoot,
      twoUnitPaidRetreatRootV2OptIn:actorTwoUnitPaidRetreatRootV2,
      twoUnitPaidRetreatRootOptionPassed:false,
      twoUnitPaidRetreatRootWrapperSelected:false
    };
    try {
      let firstBlockedPromptContractObserverAudit=null;
      const executeBase=()=>executeDevelopment(trial,prepared,{
        compressorPayload,opportunityAudit,lateCompressorPayload,
        anyTurnCompressorPayload,earlyBenchedCompressorPayload,
        mandatoryOptionFallback,paperSupporterQuota,paperCologneQuota,
        paperFullBenchCallForFamily,paperSameTargetAttachEnergy,
        paperPromptPortfolio,sharedPaperPaymentPortfolio,paperQuickBallPayment,
        paperSecretBoxPayment,
        paperSupporterComparisonTrace,nativeOwnerSupporterOpportunity,
        nativeSetupCompensationAudit,nativePublicMulliganRevealsAudit,
        nativeSetupCoinChoiceReceipt,physicalZoneGate,
        nativeRejectedActionEvidence,actorNativeAorItemLock,
        proposalStateAudit,nativeProposalValidationAudit,nativeProposalTapeOrdinal,
        nativeOpponentHiddenReadAudit,nativeActionInputWitness,
        nativeAcceptedTargets,nativeQuickBallOwnerTransactionAudit,
        losslessNativeRootJoin,isolatePolicyRandomness,
        isolatePhysicalShuffleRandomnessAfterSetup,
        specialRedCardPaperPreselection,
        specialRedCardPaperCorrection,
        specialRedCardPaperSpeculativeShuffle,
        onRootStoreCreated,onRootActionDispatched,
        captureNativeAttackPhysicalTape,
        nativeRootActionLimit,nativeFirstTurnPublicBoard,
        nativeAllOwnerPassFrontier,
        nativeActionInputTapeOrdinal,paperTerminalAttackKo,
        rank6K1AlternativeEnergy,rank6ScriptedSpecialConditionGuard,
        rank11SourceSupporterPassRescue,
        rank11ExclusiveOpening,paperRank9ElectrodeGXCorrection,
        sourceIndependentCommonPolicy,
        nativeOwnerTrainerFallback,ownerFallbackDiagnosticView,
        mysteriousTreasureRoot,firstBlockedPromptContractObserver,
        registeredTrial:registeredTrials!==null,
        // An opt-in observational package, with each native Store observer
        // applicable to its own opposing source archetype only.
        initializationWindow:nativePressureWindows&&trial.rank===6,
        garbotoxinWindow:nativePressureWindows&&trial.rank===11
      });
      const execute=()=>{
        if(!firstBlockedPromptContractObserver)return executeBase();
        const observed=require('../twinleaf/agent2-first-blocked-prompt-contract.cjs')
          .withFirstBlockedPromptContract(executeBase);
        firstBlockedPromptContractObserverAudit=observed.audit;
        return observed.result&&typeof observed.result==='object'?
          {...observed.result,
            firstBlockedPromptContractObserverAudit}:observed.result;
      };
      if(actorOnlyComposition){
        // A two-seat mode applies one native-owned root selector to both
        // players. One-seat modes remain explicitly asymmetric diagnostics.
        const energyProfile=require('./agent41-bilateral-special-energy-profile.cjs')
          .specialEnergyRootProfile({
            bilateral:bilateralSpecialEnergyRoot,
            source:sourceScopedSpecialEnergyRoot,
            candidate:candidateScopedSpecialEnergyRoot
          },trial.candidateSlot);
        const paidRetreatRootOptions=actorPaidRetreatRootOptions({
          actorTwoUnitPaidRetreatRoot,actorTwoUnitPaidRetreatTargetTurn,
          actorTwoUnitPaidRetreatRootV2,actorTwoUnitPaidRetreatTargetTurnV2
        });
        const scopedRoot=(!actorColoredStarterBias&&
          !energyProfile.enabled&&!bilateralPublicContextSpecialEnergy&&
          !bilateralJetBenchSwitchRoot&&
          !bilateralBasicEnergyRecipientFrontier&&
          !bilateralPerfectionBenchFunding&&
          !bilateralPerfectionTransitionRoot&&
          !bilateralGengarHorrorHouseTempo&&!bilateralGengarFlexibleV2&&
          !bilateralGengarResourceProtectedV3&&
          !sourceFloatStoneMobility&&!sameRootProposalChoice&&
          !sourceScopedQuickBallRoot&&!candidateScopedQuickBallRoot&&
          !sourceScopedStrandedMarnieRoot&&
          !sourceScopedDialgaShredT53&&
          !bilateralConservativeShuffleRoot&&!actorNaturalEvolutionRoot&&
          !actorEarlyForestSealRoot&&!bilateralEarlyForestSealRoot&&
          !actorPaleMoonGXRoot&&
          !actorDceMewMobilityRoot&&!actorMewDceRecipientRoot&&
          !actorMewGenesectBenchFirst&&
          !actorGenesectFusionDrawRoot&&
          !actorUnderworldDoorRoot&&!actorMimikyuApexFundedPromotion&&
          !actorTempleDdeDenialRoot&&
          !actorArvenHoodSearchRoot&&
          !actorFundedShadowRiderFloatStoneRoot&&
          !actorTwoUnitPaidRetreatRoot&&!actorTwoUnitPaidRetreatRootV2&&
          !actorMewUltraBallRoot&&
          !actorGenericFundedFloatStoneRoot&&
          !actorGenericFundedFloatStoneCensus&&
          !actorZeroEnergyStrandFloatStoneRoot&&
          !actorGenericTacticalSwitchRoot&&
          !actorOpponentBlockSwitchRoot&&
          !sourceCrobatDceMewRetreat&&
          !actorFarewellLetterRoot&&!actorRank9SpecialFundedGuzma&&
          !actorRank9MegaAbsolFundingRoot&&
          !actorRank9CompressorOwnerBridge&&
          !actorRank9SpecialPaidRetreatSource&&
          !actorFlexiblePaidRetreatRoot&&
          !candidateOnlyKnownDeadRoot&&!bilateralKnownDeadAttackRoot&&
          !nativeOwnerTrainerFallback&&!ownerFallbackDiagnosticView&&
          !mysteriousTreasureRoot&&!actorPotentialKoRoot&&
          !actorSeekerGuzmaNominalKo&&
          !bilateralPerfectionRoot)?{}:
          {root:work=>require('../twinleaf/agent34-actor-only-root-policy.cjs')
            .withActorOnlyRootPolicy(actorColoredStarterBias?
              ()=>require('../twinleaf/2026-11/agent41-owner-colored-starter.cjs')
                .withOwnerColoredStarter(work).result:work,{
              ...(energyProfile.enabled?{
                specialEnergyRoot:true,
                specialEnergyRootOwnerSeat:energyProfile.ownerSeat,
                contestedEnergyRoot:bilateralEnergyContest
              }:{}),
              ...(bilateralPublicContextSpecialEnergy?{
                publicContextSpecialEnergy:true,
                specialEnergyRootOwnerSeat:null
              }:{}),
              ...bilateralJetBenchRootOptions(bilateralJetBenchSwitchRoot),
              ...(bilateralBasicEnergyRecipientFrontier?{
                energyRecipientFrontier:true,
                mobilityAwareRecipient:true
              }:{}),
              ...(actorEarlyForestSealRoot||bilateralEarlyForestSealRoot?{
                earlyForestSealRoot:true,
                earlyForestSealRootOwnerSeat:
                  bilateralEarlyForestSealRoot?null:
                    (trial.candidateSlot==='A'?0:1)
              }:{}),
              ...(actorPaleMoonGXRoot?{
                paleMoonGXRoot:true,
                paleMoonGXRootOwnerSeat:trial.candidateSlot==='A'?0:1
              }:{}),
              ...(bilateralPerfectionBenchFunding?{
                perfectionBenchFunding:true
              }:{}),
              ...(bilateralGengarHorrorHouseTempo?{
                gengarHorrorHouseTempo:true,
                gengarHorrorHouseMinOpponentHandCount:
                  bilateralGengarHorrorHouseMinOpponentHandCount
              }:{}),
              ...(bilateralGengarFlexibleV2?{
                gengarFlexibleV2:true,
                gengarHorrorHouseMinOpponentHandCount:
                  bilateralGengarHorrorHouseMinOpponentHandCount
              }:{}),
              ...(bilateralGengarResourceProtectedV3?{
                gengarResourceProtectedV3:true,
                gengarHorrorHouseMinOpponentHandCount:
                  bilateralGengarHorrorHouseMinOpponentHandCount
              }:{}),
              ...(bilateralPerfectionTransitionRoot?{
                perfectionTransitionRoot:true
              }:{}),
              ...conservativeSupporterRootOptions,
              ...(sourceScopedStrandedMarnieRoot?{
                strandedMarnieRoot:true,
                strandedMarnieRootOwnerSeat:
                  1-(trial.candidateSlot==='A'?0:1)
              }:{}),
              ...(sourceScopedDialgaShredT53?{
                sourceDialgaShredT53:true,
                sourceDialgaShredT53OwnerSeat:
                  1-(trial.candidateSlot==='A'?0:1)
              }:{}),
              ...(sourceScopedQuickBallRoot||candidateScopedQuickBallRoot?{
                quickBallRoot:true,
                quickBallRootOwnerSeat:sourceScopedQuickBallRoot?
                  1-(trial.candidateSlot==='A'?0:1):
                  (trial.candidateSlot==='A'?0:1),
                quickBallPayableAttackPriority:
                  sourceQuickBallPreservePayableAttack===true
              }:{}),
              ...(actorMewUltraBallRoot?{
                mewUltraBallEvolutionRoot:true,
                mewUltraBallEvolutionRootOwnerSeat:
                  1-(trial.candidateSlot==='A'?0:1)
              }:{}),
              ...naturalEvolutionOptions,
              ...(actorNaturalEvolutionSourceOnly?{
                naturalEvolutionRootOwnerSeat:
                  1-(trial.candidateSlot==='A'?0:1)
              }:{}),
              ...(actorMewDceRecipientRoot?{
                mewDceRecipientRoot:true,
                ...(actorMewDceRecipientSourceOnly?{
                  mewDceRecipientRootOwnerSeat:
                    1-(trial.candidateSlot==='A'?0:1)
                }:{})
              }:{}),
              ...(actorMewGenesectBenchFirst?{
                mewGenesectBenchFirst:true,
                ...(actorMewGenesectBenchFirstSourceOnly?{
                  mewGenesectBenchFirstOwnerSeat:
                    1-(trial.candidateSlot==='A'?0:1)
                }:{})
              }:{}),
              ...(actorDceMewMobilityRoot?{
                dceMewMobilityRoot:true,
                ...(actorDceMewMobilitySourceOnly?{
                  dceMewMobilityRootOwnerSeat:
                    1-(trial.candidateSlot==='A'?0:1)
                }:{})
              }:{}),
              ...(sourceCrobatDceMewRetreat?{
                crobatDceMewRetreat:true,
                crobatDceMewRetreatOwnerSeat:
                  1-(trial.candidateSlot==='A'?0:1)
              }:{}),
              ...(actorGenesectFusionDrawRoot?{
                genesectFusionDraw:true,
                genesectPerCopyPublicUsage:
                  actorGenesectFusionDrawPerCopyPublicUsage,
                ...(actorGenesectFusionDrawSourceOnly?{
                  genesectFusionDrawOwnerSeat:
                    1-(trial.candidateSlot==='A'?0:1)
                }:{})
              }:{}),
              ...(actorUnderworldDoorRoot?{
                underworldDoorRoot:true
              }:{}),
              ...(actorPathUnderworldStadiumCounter?{
                pathUnderworldStadiumCounter:true
              }:{}),
              ...(actorMimikyuApexFundedPromotion?{
                mimikyuApexFundedPromotion:true,copycatHistoryRoot:true
              }:{}),
              ...(actorTempleDdeDenialRoot?{
                templeDdeDenial:true
              }:{}),
              ...(actorArvenHoodSearchRoot?{
                arvenHoodSearch:true
              }:{}),
              ...(actorPathToPeakOpposingAbility?{
                pathToPeakOpposingAbility:true
              }:{}),
              ...(actorUnderworldActiveFundingPriority?{
                underworldActiveFundingPriority:true
              }:{}),
              ...(actorUnderworldActiveFundingThresholdV2?{
                underworldActiveFundingThresholdV2:true
              }:{}),
              ...(actorUnderworldActiveFundingMirrorVeto?{
                underworldActiveFundingMirrorVeto:true
              }:{}),
              ...(actorUnderworldActiveFundingMinTurn!==null?{
                underworldActiveFundingMinTurn:actorUnderworldActiveFundingMinTurn
              }:{}),
              ...(actorMaxGeistManualRecovery?{
                maxGeistManualRecovery:true
              }:{}),
              ...(actorFundedShadowRiderFloatStoneRoot?{
                fundedVmaxFloatStoneRoot:true
              }:{}),
              ...(nativeOwnerTrainerFallback?{
                nativeOwnerTrainerFallback:true
              }:{}),
              ...(ownerFallbackDiagnosticView?{
                ownerFallbackDiagnosticView:true
              }:{}),
              ...(mysteriousTreasureRoot?{
                mysteriousTreasureRoot:true
              }:{}),
              ...(mysteriousTreasureMuscleBandPayment?{
                mysteriousTreasureMuscleBandPayment:true
              }:{}),
              ...(firstRegidragoBenchGrass?{
                firstRegidragoBenchGrass:true
              }:{}),
              ...(retreatFundingBridge?{
                retreatFundingBridge:true
              }:{}),
              ...(firstCrispinSeekerRecovery?{
                firstCrispinSeekerRecovery:true
              }:{}),
              ...(actorSeekerGuzmaNominalKo?{
                seekerGuzmaNominalKo:true,
                seekerGuzmaOwnerSeat:actorSeekerGuzmaSourceOnly?
                  1-(trial.candidateSlot==='A'?0:1):actorSeekerGuzmaOwnerSeat,
                seekerGuzmaGlobalTurn:actorSeekerGuzmaGlobalTurn
              }:{}),
              ...(rank13SourceFirstOwnGrass?{
                rank13SourceFirstOwnGrass:true,
                ...(rank13SourceFirstOwnGrassSourceOnly?{
                  rank13SourceFirstOwnGrassOwnerSeat:
                    1-(trial.candidateSlot==='A'?0:1)
                }:{})
              }:{}),
              ...(rank13CrispinRoot?{
                rank13CrispinRoot:true,
                ...(rank13CrispinSourceOnly?{
                  rank13CrispinRootOwnerSeat:
                    1-(trial.candidateSlot==='A'?0:1)
                }:{})
              }:{}),
              ...(earlyRegidragoCompressor?{
                earlyRegidragoCompressor:true,
                ...(earlyRegidragoCompressorSourceOnly?{
                  earlyRegidragoCompressorOwnerSeat:
                    1-(trial.candidateSlot==='A'?0:1)
                }:{}),
                earlyRegidragoCompressorAllowFirstOwnTurnTwo
              }:{}),
              ...(bilateralPerfectionRoot?{
                perfectionRoot:true
              }:{}),
              ...(actorPotentialKoRoot?{
                potentialKoRoot:true,
                ...(actorPotentialKoSourceOnly?{
                  potentialKoRootOwnerSeat:1-(trial.candidateSlot==='A'?0:1)
                }:{})
              }:{}),
              ...paidRetreatRootOptions,
              ...(actorGenericFundedFloatStoneRoot?{
                genericFundedFloatStoneRoot:true,
                ...(actorGenericFundedFloatStoneSourceOnly||
                    actorGenericFundedFloatStoneCandidateOnly?{
                  genericFundedFloatStoneOwnerSeat:
                    actorGenericFundedFloatStoneCandidateOnly?
                      (trial.candidateSlot==='A'?0:1):
                      1-(trial.candidateSlot==='A'?0:1)
                }:{})
              }:{}),
              ...(actorGenericFundedFloatStoneCensus?{
                genericFundedFloatStoneAudit:true
              }:{}),
              ...(actorGenericTacticalSwitchRoot?{
                genericTacticalSwitchRoot:true
              }:{}),
              ...(actorOpponentBlockSwitchRoot?{
                opponentBlockSwitchRoot:true
              }:{}),
              ...(actorZeroEnergyStrandFloatStoneRoot?{
                zeroEnergyStrandFloatStoneRoot:true,
                zeroEnergyStrandFloatStoneTargetTurn:
                  actorZeroEnergyStrandFloatStoneTargetTurn,
                zeroEnergyStrandFloatStoneOwnerSeat:
                  actorZeroEnergyStrandFloatStoneOwnerSeat
              }:{}),
              ...(actorFarewellLetterRoot?{
                farewellLetterRoot:true
              }:{}),
              ...(actorRank9SpecialFundedGuzma?{
                rank9SpecialFundedGuzma:true
              }:{}),
              ...(actorRank9MegaAbsolFundingRoot?{
                rank9MegaAbsolFundingRoot:true,
                activeMegaClawPriorityRoot:actorActiveMegaClawPriorityRoot
              }:{}),
              ...(actorFlexiblePaidRetreatRoot?{
                flexiblePaidRetreatRoot:true
              }:{}),
              ...(actorSkylinerFundedBenchRetreatRoot?{
                skylinerFundedBenchRetreatRoot:true
              }:{}),
              ...(actorRank9SpecialPaidRetreatSource?{
                rank9SpecialPaidRetreat:true,
                rank9SpecialPaidRetreatOwnerSeat:
                  1-(trial.candidateSlot==='A'?0:1)
              }:{}),
              ...(sameRootProposalChoice?{
                sameRootProposalChoice:true,
                sameRootChoiceApply,sameRootProbeAll,
                sameRootPublicEventReceipt,nativeToolAttachRoot,
                nativePlumeriaChoice,nativeZeroCostDenialChoice,
                teamFlareGruntDenialRoot,
                losslessNativeRootJoin,
                ...(registeredToolEnergyCeiling?{
                  registeredToolEnergyCeiling:true,ownRegisteredSixtiesBySeat:
                    ownerRegisteredSixtiesBySeat
                }:{}),
                nativeCoheldDenialCanPlay,
                sameRootPassAttackProbeGlobalTurn,
                publicNoBenchTerminalAttack:sameRootPublicNoBenchTerminal,
                positiveAttackOverPass:sameRootPositiveAttackOverPass,
                thornsEmptyBenchVoltPreference:sameRootThornsEmptyBench
              }:{}),
              ...(sourceFloatStoneMobility?{
                floatStoneMobility:true,
                floatStoneMobilityOwnerSeat:1-(trial.candidateSlot==='A'?0:1)
              }:{}),
              ...(bilateralKnownDeadAttackRoot?{
                knownDeadAttackRoot:true,
                knownDeadAttackRootOwnerSeat:null
              }:{}),
              ...(candidateOnlyKnownDeadRoot?{
                knownDeadAttackRoot:true,
                knownDeadAttackRootOwnerSeat:trial.candidateSlot==='A'?0:1
              }:{})
            })};
        paidRetreatWrapperActivation=paidRetreatRootWrapperActivationReceipt({
          actorOnlyComposition,actorTwoUnitPaidRetreatRoot,
          actorTwoUnitPaidRetreatTargetTurn,actorTwoUnitPaidRetreatRootV2,
          actorTwoUnitPaidRetreatTargetTurnV2,scopedRoot,
          rootOptions:paidRetreatRootOptions
        });
        const chargedPokemon=actorChargedPromotion?{
          pokemon:work=>require('../twinleaf/agent8-actor-only-choose-pokemon.cjs')
            .withActorOnlyChoosePokemon(work,{
              choose:require('../twinleaf/agent1-charged-promotion-choice.cjs')
                .chooseChargedOwnPromotion
            })
        }:{};
        // Opt-in developmental owner-only Mail continuation. The original
        // printed sixties and source physical deal remain unchanged. Native
        // card and genuine top-four prompts determine actual settlement.
        let ownerMailAudit=null;
        const withOptionalOwnerMail=()=>{
          if(!actorOwnerMailAfterPass||
              (actorOwnerMailAfterPassScope&&
                trial.id!==actorOwnerMailAfterPassScope.trialId))
            return execute();
          const sourceSeat=1-(trial.candidateSlot==='A'?0:1);
          const optionalScope=actorOwnerMailAfterPassScope?{
            allowRoot:view=>view.actorSeat===sourceSeat&&
              view.globalTurn===actorOwnerMailAfterPassScope.globalTurn
          }:actorOwnerMailAfterPassSourceOnly?{
            allowRoot:view=>view.actorSeat===sourceSeat
          }:{};
          const wrapped=require('../twinleaf/agent9-native-owner-mail-after-pass.cjs')
            .withOwnerMailAfterPass(execute,
              registeredNativeSeatDecks(trial,prepared),{
                ...optionalScope,
                playMailSelectedMarnieOnPass:
                  actorOwnerMailSelectedMarnieOnPass
              });
          ownerMailAudit=wrapped.audit;
          return wrapped.result;
        };
        const withOptionalPrintedFidelity=()=>{
          if(!actorOriginal29PrintedFidelity)
            return withOptionalOwnerMail();
          const corrected=require(
            '../twinleaf/agent50-original29-printed-fidelity-hook.cjs')
            .withOriginal29PrintedFidelity(withOptionalOwnerMail);
          return corrected.result;
        };
        const withOptionalMimikyuApexCompatibility=()=>{
          if(!actorMimikyuApexFundedPromotion)
            return withOptionalPrintedFidelity();
          return require(
            '../twinleaf/2026-11/agent6-mimikyu-apex-paper-compatibility.cjs'
          ).withMimikyuApexPaperCompatibility(withOptionalPrintedFidelity);
        };
        const observed=withCanonicalActorOnlyPolicy(
          withOptionalMimikyuApexCompatibility,
          {...scopedRoot,...chargedPokemon,
            ...(actorVipAfterPassAdapter?{
              vipAfterPass:actorVipAfterPassAdapter
            }:{}),
            ...(actorFogPromptAdapter?{
              fog:actorFogPromptAdapter
            }:{})},
          {ownerSingleSearch:actorOnlySingleSearch,
            ...(actorMewUltraBallSearch?{
              ownerMewUltraBallSearchSeat:
                1-(trial.candidateSlot==='A'?0:1)
            }:{}),
            ...(actorMewGenesectQuickBallSearch?{
              ownerMewGenesectQuickBallSearchSeat:
                1-(trial.candidateSlot==='A'?0:1)
            }:{}),
            ...(actorMewUltraBallPaymentGuard?{
              ownerMewUltraBallDiscardSeat:
                1-(trial.candidateSlot==='A'?0:1),
              ownerMewQuickBallPaymentGuard:actorMewQuickBallPaymentGuard
            }:{}),
            preferMewGenesectTechnoBlast:actorMewGenesectTechnoBlast,
            preferMewGenesectTechnoBlastOwnerSeat:
              actorMewGenesectTechnoBlastSourceOnly?
                1-(trial.candidateSlot==='A'?0:1):null,
            preferMewMaxMiracleOverSelfCopy:actorMewMaxMiracleOverSelfCopy,
            genericFallbackAttribution:actorGenericFallbackAttribution,
            ownerGenericTrainerFrontier,nativeOwnerTrainerFallback,
            // A selected frontier always retains the independent owner-only
            // printed temporal, payment, Prize and target negative evidence.
            // It remains read-only; historical frontier-off v2 is unchanged.
            ownerPaperNecessity:ownerGenericTrainerFrontier,
            ...(ownerGenericTrainerFrontier?{
              ownerTrainerRegisteredSixties:registeredNativeSeatDecks(
                trial,prepared)
            }:{}),
            nativeAorItemLock:actorNativeAorItemLock,
            actorHandDiscard,actorAttackFuelDiscard,actorChoosePokemon,
            ownerUnderworldPromptContinuation:actorUnderworldDoorPromptOwner,
            ownerUnderworldAttackGapRecipient:actorUnderworldAttackGapRecipient,
            ownerPlumeriaAfterPass:actorPlumeriaAfterPass,
            ownerLillieAfterPass:actorBilateralLillieAfterPass,
            ownerDeckoutRescueRoot:actorDeckoutRescueRoot,
            ownerDeckoutRescueBeforeAttack:actorDeckoutRescueBeforeAttack,
            ownerVipBeforeAttack:actorVipBeforeAttack,
            ownerVipMegaAbsolTarget:actorVipMegaAbsolTarget,
            ownerVipAfterPass:actorVipAfterPass,
            ownerVipRank9MegaVoltorbRecipient:
              actorVipRank9MegaVoltorbRecipient,
            sameRootNativePlumeriaChoice:nativePlumeriaChoice,
            sameRootNativeFreeFlareChoice:nativeZeroCostDenialChoice,
            guzmaOwnerPromptContinuation:actorGuzmaPromptContinuation,
            guzmaNominalGust:actorGuzmaNominalGust,
            seekerGuzmaNominalKo:actorSeekerGuzmaNominalKo,
            seekerGuzmaOwnerSeat:actorSeekerGuzmaOwnerSeat,
            seekerGuzmaGlobalTurn:actorSeekerGuzmaGlobalTurn,
            rank9SpecialFundedGuzma:actorRank9SpecialFundedGuzma,
            ...(actorRank9CompressorOwnerBridge?{
              rank9CompressorOwnerSeat:actorRank9CompressorOwnerCandidate?
                (trial.candidateSlot==='A'?0:1):
                1-(trial.candidateSlot==='A'?0:1),
              ...(actorRank9CompressorAnyTurn?{
                rank9CompressorMaxGlobalTurn:Infinity
              }:{}),
              ...(actorRank9CompressorBombAfter?{
                rank9CompressorBombAfter:true
              }:{}),
              ...(actorRank9LateBenchBomb?{
                rank9LateBenchBomb:true
              }:{}),
              ...(actorRank9PostBombRope?{
                rank9PostBombRope:true
              }:{}),
              ...(actorRank9RopeOpponentSurvival?{
                rank9RopeOpponentSurvival:true
              }:{}),
              ...(actorRank9RopeOpponentDamageAware?{
                rank9RopeOpponentDamageAware:true
              }:{}),
              ...(actorRank9UltraDeadVipAfterPass?{
                rank9UltraDeadVipAfterPass:true
              }:{}),
              ...(actorRank9CompressorEnergyTarget!==3?{
                rank9CompressorEnergyTarget:actorRank9CompressorEnergyTarget
              }:{})
            }:{}),
            ...((anyTurnCompressorPayload||earlyBenchedCompressorPayload)?{
              ownerDonorSetup:{seat:trial.candidateSlot==='A'?0:1,
                setup:earlyBenchedCompressorPayload?
                  {allowBenchedMewtwo:true,maxGlobalTurn:6}:
                  {maxGlobalTurn:Number.POSITIVE_INFINITY}}
            }:{})});
        rows.push({...observed.result,...paidRetreatWrapperActivation,
          ...(actorOwnerMailAfterPass?{
            ownerMailAfterPassAudit:ownerMailAudit
          }:{}),
          ...(actorBilateralLillieAfterPass?{
            ownerBilateralLillieAfterPassAudit:
              observed.audit.ownerLillieAfterPassAudit
          }:{}),
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
          ...(bilateralJetBenchSwitchRoot?{
            bilateralJetBenchSwitchProfile:{
              version:require('../twinleaf/agent40-public-jet-bench-frontier.cjs').VERSION,
              mode:'both',ownerSeat:null,sharedPolicy:true
            }
          }:{}),
          ...(bilateralPerfectionBenchFunding?{
            bilateralPerfectionBenchFundingProfile:{
              version:require('../twinleaf/agent24-early-perfection-recipient.cjs').VERSION,
              bothPhysicalSeats:true,actorOnlyInformation:true,
              developmentOnly:true,competitiveQualified:false
            }
          }:{}),
          ...(bilateralBasicEnergyRecipientFrontier?{
            bilateralBasicEnergyRecipientProfile:{
              version:require('../twinleaf/agent44-actor-energy-recipient.cjs').VERSION,
              bothPhysicalSeats:true,ownerSeat:null,
              actorOnlyInformation:true,mobilityAware:true,
              developmentOnly:true,competitiveQualified:false
            }
          }:{}),
          ...(bilateralConservativeShuffleRoot?{
            bilateralConservativeShuffleRootProfile:{
              version:SUPPORTER_ROOT_VERSION,bothPhysicalSeats:true,
              ownerSeat:null,sharedPolicy:true,
              nativeSupporterSettlement:'independent-store-witness-required',
              competitiveQualified:false
            }
          }:{}),
          ...(bilateralKnownDeadAttackRoot?{
            bilateralKnownDeadAttackProfile:{
              version:require('../twinleaf/agent1-actor-dead-first-attack-frontier.cjs').VERSION,
              bothPhysicalSeats:true,ownerSeat:null,sharedPolicy:true,
              exactPrintingOnly:true,competitiveQualified:false
            }
          }:{}),
          ...(actorRank9MegaAbsolFundingRoot?{
            rank9MegaAbsolFundingProfile:{
              version:require('../twinleaf/agent2-rank9-mega-absol-funding.cjs').VERSION,
              bothPhysicalSeats:true,ownerVisible:true,
              completeGameStrengthQualified:false
            }
          }:{}),
          ...(actorRank9SpecialFundedGuzma?{
            rank9SpecialFundedGuzmaProfile:{
              version:require('../twinleaf/agent2-rank9-special-guzma-frontier.cjs').VERSION,
              bothPhysicalSeats:true,ownerVisible:true,
              nativePaperActionChainQualified:false,
              competitiveGameQualified:false
            }
          }:{}),
          actorOnlyPolicyVersion:observed.audit.version,
          actorOnlyDecisionCoverage:observed.audit,
          qualifiesForCompetitiveInference:false});
      }else rows.push({...execute(),...paidRetreatWrapperActivation});
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
      const sharedFamilyAbort=error?.agent47SharedFamilyPromptAudit??
        error?.cause?.agent47SharedFamilyPromptAudit??null;
      const sameTargetAbort=error?.nativeSameTargetEnergyEvidence??
        error?.cause?.nativeSameTargetEnergyEvidence??null;
      const {error:archivedError,nativeStoreCauseStack,
        nativeAbortEvidence:nativeAbort}=
        require('../twinleaf/native-dispatch-abort-evidence.cjs')
          .publicNativeAbortError(error);
      rows.push({
        trial,
        sourceSeat:trial.candidateSlot==='A'?1:0,
        candidateSeat:trial.candidateSlot==='A'?0:1,
        ...paidRetreatWrapperActivation,
        rngProtocol:rng.manifest,
        policyRandomIsolation:rng.manifest.policyRandomIsolation,
        physicalShuffleRandomIsolation:
          rng.manifest.physicalShuffleRandomIsolation,
        physicalShuffleRandomIsolationAfterSetup:
          rng.manifest.physicalShuffleRandomIsolationAfterSetup,
        randomnessProtocol:rng.manifest.randomnessProtocol,
        status:error?.code===
          require('./physical-zone-qualification.cjs').INVALID_CODE?
          'engine-physical-invalid':classifyNativeAbort(veto),
        physicalZoneQualification:require('./physical-zone-qualification.cjs')
          .classifyPhysicalZoneEvidence({requested:physicalZoneGate,error}),
        error:archivedError,
        nativeStoreCauseStack,
        // Native aborts carry physical deal receipts inside the error custody;
        // lift only independently validated post-error evidence into arm rows.
        // Unknown source fingerprints stay null and no error becomes a win.
        ...require('./agent18-aborted-native-provenance.cjs')
          .extractNativeAbortProvenance(trial,nativeAbort),
        ...(error?.nativePublicRootArchive??{}),
        // Post-abort aggregate from the actual actor root, with no hand cards.
        actorNativeTrainerFallbackAbortAudit:
          error?.actorNativeTrainerFallbackAbortAudit??null,
        ...(actorOwnerMailAfterPass?{
          ownerMailAfterPassAbortAudit:
            error?.ownerMailAfterPassAbortAudit??
            error?.cause?.ownerMailAfterPassAbortAudit??null
        }:{}),
        firstBlockedPromptContract:
          error?.agent2FirstBlockedPromptContract??
          error?.cause?.agent2FirstBlockedPromptContract??null,
        nativeAbortEvidence:nativeAbort,
        // Owner-only post-attack physical search evidence remains visible
        // even if a later native prompt or dispatch aborts the same game.
        sharedTrubbishFamilyOwnerAbortAudit:sharedFamilyAbort,
        // Independently preserve accepted first-setup coin/chooser/draw even
        // when a later Store dispatch fails before the normal game return.
        nativeSetupCoinChoiceReceipt:
          error?.nativeSetupCoinChoiceReceipt??null,
        // Archive the attempted card only. The diagnostic observer's entire
        // owner hand is intentionally excluded from this postgame receipt.
        ...(nativeRejectedActionEvidence?{
          nativeRejectedPlayCard:(()=>{
            const rejected=error?.rejectedActionEvidence??
              error?.cause?.rejectedActionEvidence??null;
            return rejected?{
              schema:'agent8-rejected-playcard-postgame-v1',
              actionOrdinal:rejected.actionOrdinal,
              turn:rejected.turn,
              actingSeat:rejected.actingSeat,
              playedCardPrinting:rejected.playedCardPrinting,
              chosenTarget:rejected.chosenTarget,
              ownerPlayLockFlags:rejected.ownerPlayLockFlags,
              rejectionMessage:rejected.rejectionMessage,
              postgameOnly:true,competitiveGameQualified:false
            }:null;
          })()
        }:{}),
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
        ...(sharedPaperPaymentPortfolio?{
          sharedPaperPaymentPortfolioAbortEvidence:
            error?.agent41UnifiedPaperPromptPortfolio??
            error?.cause?.agent41UnifiedPaperPromptPortfolio??null}:{}),
        ...(paperPromptPortfolio?{
          paperPromptPortfolioAbortEvidence:
            error?.paperPromptPortfolioEvidence??
            error?.cause?.paperPromptPortfolioEvidence??null}:{}),
        ...(actorOnlyComposition&&actorGenericFallbackAttribution?{
          nativeGenericFallbackAbortEvidence:genericAbort}:{}),
        qualifiesForCompetitiveInference:false
      });
    }
  }
  return {
    rngProtocol:rng.manifest,
    policyRandomIsolation:rng.manifest.policyRandomIsolation,
    physicalShuffleRandomIsolation:rng.manifest.physicalShuffleRandomIsolation,
    physicalShuffleRandomIsolationAfterSetup:
      rng.manifest.physicalShuffleRandomIsolationAfterSetup,
    randomnessProtocol:rng.manifest.randomnessProtocol,
    twoUnitPaidRetreatRootOptIn:actorTwoUnitPaidRetreatRoot,
    twoUnitPaidRetreatRootV2OptIn:actorTwoUnitPaidRetreatRootV2,
    twoUnitPaidRetreatRootOptionPassed:
      (actorTwoUnitPaidRetreatRoot||actorTwoUnitPaidRetreatRootV2)&&
      rows.length>0&&rows.every(row=>
        row.twoUnitPaidRetreatRootOptionPassed===true),
    twoUnitPaidRetreatRootWrapperSelected:
      (actorTwoUnitPaidRetreatRoot||actorTwoUnitPaidRetreatRootV2)&&
      rows.length>0&&rows.every(row=>
        row.twoUnitPaidRetreatRootWrapperSelected===true),
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
    registeredCandidateArmMode:registeredTrials===null?'historical-schedule':
      (allowSingleCandidatePerGroup?'single-candidate-per-source-group':
      (allowSingleCandidateArm?'single-candidate-arm':'paired-candidate-arms')),
    registeredTrialCount:scheduled.length,
    registeredTrialGroupCount:new Set(scheduled.map(row=>
      row.id.slice(0,row.id.lastIndexOf(':')))).size,
    registeredSourceRanks:registeredTrials===null?null:
      [...new Set(scheduled.map(row=>row.rank))].sort((a,b)=>a-b),
    registeredCandidateIds:registeredTrials===null?null:
      [...new Set(scheduled.map(row=>row.candidateId))].sort(),
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
      (paperPromptPortfolio?'+'+require('../twinleaf/agent39-paper-prompt-portfolio.cjs').VERSION:'')+
      (sharedPaperPaymentPortfolio?'+agent41-paper-prompt-v11-source-payment-opt-in':'')+
      (paperQuickBallPayment?'+agent4-paper-quickball-v3-live-store-cost':'')+
      (paperSecretBoxPayment?'+agent4-paper-secretbox-twm-three-cost-v1-live-store':'')+
      (bilateralJetBenchSwitchRoot?'+'+require('../twinleaf/agent40-public-jet-bench-frontier.cjs').VERSION:'')+
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
    paperPromptPortfolioOptIn:paperPromptPortfolio,
    sharedPaperPaymentPortfolioOptIn:sharedPaperPaymentPortfolio,
    paperQuickBallPaymentOptIn:paperQuickBallPayment,
    paperSecretBoxPaymentOptIn:paperSecretBoxPayment,
    paperSupporterComparisonTraceOptIn:paperSupporterComparisonTrace,
    nativeOwnerSupporterOpportunityOptIn:nativeOwnerSupporterOpportunity,
    nativeSetupCompensationAuditOptIn:nativeSetupCompensationAudit,
    nativePublicMulliganRevealsAuditOptIn:nativePublicMulliganRevealsAudit,
    nativeSetupCoinChoiceReceiptOptIn:nativeSetupCoinChoiceReceipt,
    ...(specialRedCardPaperPreselection?{
      specialRedCardPaperPreselectionOptIn:true}:{}),
    ...(specialRedCardPaperCorrection?{
      specialRedCardPaperCorrectionOptIn:true}:{}),
    ...(specialRedCardPaperSpeculativeShuffle?{
      specialRedCardPaperSpeculativeShuffleOptIn:true}:{}),
    physicalZoneGateOptIn:physicalZoneGate,
    nativeRejectedActionEvidenceOptIn:nativeRejectedActionEvidence,
    physicalZoneQualificationSummary:require('./physical-zone-qualification.cjs')
      .summarizePhysicalQualification(rows),
    proposalStateAuditOptIn:proposalStateAudit,
    nativeProposalValidationAuditOptIn:nativeProposalValidationAudit,
    nativeOpponentHiddenReadAuditOptIn:nativeOpponentHiddenReadAudit,
    nativeActionInputWitnessOptIn:nativeActionInputWitness,
    nativeAcceptedTargetsOptIn:nativeAcceptedTargets,
    nativeQuickBallOwnerTransactionAuditOptIn:
      nativeQuickBallOwnerTransactionAudit,
    nativeActionInputTapeOrdinal:nativeActionInputWitness?
      nativeActionInputTapeOrdinal:null,
    actorOnlyCompositionOptIn:actorOnlyComposition,
    retreatFundingBridgeOptIn:actorOnlyComposition&&retreatFundingBridge,
    bilateralJetBenchSwitchRootOptIn:bilateralJetBenchSwitchRoot,
    bilateralConservativeShuffleRootOptIn:bilateralConservativeShuffleRoot,
    actorNativeAorItemLockOptIn:actorNativeAorItemLock,
    actorNaturalEvolutionRootOptIn:
      actorOnlyComposition&&actorNaturalEvolutionRoot,
    actorGarbodorResponseOwnerSeat:
      actorOnlyComposition&&actorNaturalEvolutionRoot?
        actorGarbodorResponseOwnerSeat:null,
    actorGarbodorResponseScope:!actorNaturalEvolutionRoot?'disabled':
      (actorGarbodorResponseOwnerSeat===null?'bilateral':'seat-scoped'),
    actorGarbodorToolRootOptIn:
      actorOnlyComposition&&actorGarbodorToolRoot,
    actorGarbodorToolRootDeferForStarAlchemy:
      actorOnlyComposition&&actorGarbodorToolRoot?
        actorGarbodorToolRootDeferForStarAlchemy:null,
    actorDceMewMobilityRootOptIn:
      actorOnlyComposition&&actorDceMewMobilityRoot,
    actorGenesectFusionDrawRootOptIn:
      actorOnlyComposition&&actorGenesectFusionDrawRoot,
    actorGenesectFusionDrawPerCopyPublicUsageOptIn:
      actorOnlyComposition&&actorGenesectFusionDrawPerCopyPublicUsage,
    actorFarewellLetterRootOptIn:
      actorOnlyComposition&&actorFarewellLetterRoot,
    actorMewGenesectTechnoBlastOptIn:
      actorOnlyComposition&&actorMewGenesectTechnoBlast,
    actorMewGenesectTechnoBlastSourceOnly:
      actorOnlyComposition&&actorMewGenesectTechnoBlastSourceOnly,
    actorMewDceRecipientSourceOnly:
      actorOnlyComposition&&actorMewDceRecipientSourceOnly,
    actorMewMaxMiracleOverSelfCopyOptIn:
      actorOnlyComposition&&actorMewMaxMiracleOverSelfCopy,
    sameRootProposalChoiceOptIn:sameRootProposalChoice,
    sameRootChoiceApplyOptIn:sameRootProposalChoice&&sameRootChoiceApply,
    nativeToolAttachRootOptIn:sameRootProposalChoice&&
      sameRootChoiceApply&&nativeToolAttachRoot,
    nativePlumeriaChoiceOptIn:sameRootProposalChoice&&
      sameRootChoiceApply&&nativePlumeriaChoice,
    nativeZeroCostDenialChoiceOptIn:sameRootProposalChoice&&
      sameRootChoiceApply&&nativeZeroCostDenialChoice,
    registeredToolEnergyCeilingOptIn:registeredToolEnergyCeiling,
    losslessNativeRootJoinOptIn:losslessNativeRootJoin,
    sameRootProbeAllOptIn:sameRootProposalChoice&&sameRootProbeAll,
    sameRootPassAttackProbeGlobalTurn:sameRootProposalChoice?
      sameRootPassAttackProbeGlobalTurn:null,
    sameRootPublicNoBenchTerminalOptIn:sameRootProposalChoice&&
      sameRootPublicNoBenchTerminal,
    sameRootPositiveAttackOverPassOptIn:sameRootProposalChoice&&
      sameRootPositiveAttackOverPass,
    sameRootThornsEmptyBenchOptIn:sameRootProposalChoice&&
      sameRootThornsEmptyBench,
    sameRootPublicEventReceiptOptIn:
      sameRootProposalChoice&&sameRootPublicEventReceipt,
    // Root diagnostics live beneath the composed actor's component audits.
    // The prior shallow path silently reported zero audited arms even when
    // both physical seats generated genuine Store owner-root observations.
    sameRootProposalAuditedArms:rows.filter(row=>
      row.actorOnlyDecisionCoverage?.detailedComponentAudits?.root
        ?.sameRootProposalChoice).length,
    sameRootChangedRoots:rows.reduce((n,row)=>n+
      (row.actorOnlyDecisionCoverage?.detailedComponentAudits?.root
        ?.sameRootProposalChoice?.changedRoots??0),0),
    actorMewUltraBallRootOptIn:actorOnlyComposition&&actorMewUltraBallRoot,
    actorMewUltraBallSearchOptIn:actorOnlyComposition&&actorMewUltraBallSearch,
    actorMewUltraBallPaymentGuardOptIn:
      actorOnlyComposition&&actorMewUltraBallPaymentGuard,
    actorMewQuickBallPaymentGuardOptIn:
      actorOnlyComposition&&actorMewQuickBallPaymentGuard,
    actorOnlyOwnerSingleSearchOptIn:actorOnlyComposition&&actorOnlySingleSearch,
    actorHandDiscardOptIn:actorOnlyComposition&&actorHandDiscard,
    actorAttackFuelDiscardOptIn:
      actorOnlyComposition&&actorAttackFuelDiscard,
    actorPotentialKoRootOptIn:actorOnlyComposition&&actorPotentialKoRoot,
    actorOriginal29PrintedFidelityOptIn:
      actorOnlyComposition&&actorOriginal29PrintedFidelity,
    actorPlumeriaAfterPassOptIn:actorOnlyComposition&&actorPlumeriaAfterPass,
    actorChoosePokemonOptIn:actorOnlyComposition&&actorChoosePokemon,
    actorGuzmaPromptContinuationOptIn:
      actorOnlyComposition&&actorGuzmaPromptContinuation,
    actorGuzmaNominalGustOptIn:
      actorOnlyComposition&&actorGuzmaPromptContinuation&&actorGuzmaNominalGust,
    actorChargedPromotionOptIn:actorOnlyComposition&&actorChargedPromotion,
    sourceFloatStoneMobilityOptIn:actorOnlyComposition&&sourceFloatStoneMobility,
    actorFundedShadowRiderFloatStoneRootOptIn:
      actorOnlyComposition&&actorFundedShadowRiderFloatStoneRoot,
    actorMimikyuApexFundedPromotionOptIn:
      actorOnlyComposition&&actorMimikyuApexFundedPromotion,
    actorGenericFundedFloatStoneRootOptIn:
      actorOnlyComposition&&actorGenericFundedFloatStoneRoot,
    actorGenericFundedFloatStoneSourceOnly:
      actorOnlyComposition&&actorGenericFundedFloatStoneSourceOnly,
    actorGenericFundedFloatStoneCensusOptIn:
      actorOnlyComposition&&actorGenericFundedFloatStoneCensus,
    actorGenericTacticalSwitchRootOptIn:
      actorOnlyComposition&&actorGenericTacticalSwitchRoot,
    actorOpponentBlockSwitchRootOptIn:
      actorOnlyComposition&&actorOpponentBlockSwitchRoot,
    actorZeroEnergyStrandFloatStoneRootOptIn:
      actorOnlyComposition&&actorZeroEnergyStrandFloatStoneRoot,
    actorZeroEnergyStrandFloatStoneTargetTurn:
      actorZeroEnergyStrandFloatStoneRoot?
        actorZeroEnergyStrandFloatStoneTargetTurn:null,
    actorZeroEnergyStrandFloatStoneOwnerSeat:
      actorZeroEnergyStrandFloatStoneRoot?
        actorZeroEnergyStrandFloatStoneOwnerSeat:null,
    rank11ExclusiveOpeningOptIn:rank11ExclusiveOpening,
    actorNativeFallbackAttributionOptIn:
      actorOnlyComposition&&actorGenericFallbackAttribution,
    actorBilateralLillieAfterPassOptIn:actorOnlyComposition&&
      actorBilateralLillieAfterPass,
    actorDeckoutRescueRootOptIn:actorOnlyComposition&&
      actorDeckoutRescueRoot,
    actorDeckoutRescueBeforeAttackOptIn:actorOnlyComposition&&
      actorDeckoutRescueBeforeAttack,
    actorEarlyForestSealRootOptIn:actorOnlyComposition&&
      actorEarlyForestSealRoot,
    bilateralEarlyForestSealRootOptIn:actorOnlyComposition&&
      bilateralEarlyForestSealRoot,
    actorPaleMoonGXRootOptIn:actorOnlyComposition&&actorPaleMoonGXRoot,
    actorVipAfterPassAdapterInjected:actorVipAfterPassAdapter!==null,
    actorFogPromptAdapterInjected:actorFogPromptAdapter!==null,
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
    sourceIndependentCommonPolicyOptIn:sourceIndependentCommonPolicy,
    nativeAllOwnerPassFrontierOptIn:nativeAllOwnerPassFrontier,
    registeredTrialFrame:registeredTrials!==null?registeredFrameName:null,
    rank6K1AlternativeEnergyOptIn:rank6K1AlternativeEnergy,
    rank6ScriptedSpecialConditionGuardOptIn:rank6ScriptedSpecialConditionGuard,
    rank11SourceSupporterPassRescueOptIn:rank11SourceSupporterPassRescue,
    sourceScopedSpecialEnergyRootOptIn:sourceScopedSpecialEnergyRoot,
    candidateScopedSpecialEnergyRootOptIn:candidateScopedSpecialEnergyRoot,
    retrospectiveSeedProvenance:sourceFirstRetrospective?{
      6:{seed:407516727,seat:'B',selection:'reversed physical source seat'},
      11:{seed:482443328,seat:'B',selection:'post-observed source success'}
    }:null,
    rows,attempted:rows.length,
    // A one-game prospective registration has no second fixed contender
    // against which a cross-candidate comparison can be constructed.
    sourcePairs:registeredSourcePairKeys(scheduled,allowSingleCandidateArm,
      allowSingleCandidatePerGroup)
      .map(key=>{
      const here=rows.filter(row=>row.trial?.id.startsWith(key+':'));
      const first=here.find(row=>row.trial.candidateId==='champion-reference');
      const second=here.find(row=>row.trial.candidateId==='new-moon-lockbreaker-v1');
      assert.ok(first&&second);
      return {
        pairId:key,
        ...auditCrossCandidateSourcePair(first,second),
        sourceDealFingerprints:[
          first.sourceDealFingerprint??null,second.sourceDealFingerprint??null
        ],
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
    errors:rows.filter(r=>['engine-error','engine-physical-invalid']
      .includes(r.status)).length,
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
    paperPromptPortfolio:
      process.env.AGENT39_PAPER_PROMPT_PORTFOLIO_DEV==='true',
    sharedPaperPaymentPortfolio:
      process.env.AGENT15_SHARED_SOURCE_PAYMENT_PORTFOLIO_DEV==='true',
    paperSupporterComparisonTrace:
      process.env.AGENT41_PAPER_SUPPORTER_TRACE_DEV==='true',
    nativeOwnerSupporterOpportunity:
      process.env.AGENT2_NATIVE_OWNER_SUPPORTER_OPPORTUNITY_DEV==='true',
    nativeSetupCompensationAudit:
      process.env.AGENT31_NATIVE_SETUP_COMPENSATION_DEV==='true',
    nativePublicMulliganRevealsAudit:
      process.env.AGENT31_NATIVE_PUBLIC_MULLIGAN_DEV==='true',
    physicalZoneGate:process.env.AGENT24_PHYSICAL_ZONE_GATE_DEV==='true',
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
    nativeQuickBallOwnerTransactionAudit:
      process.env.AGENT41_QUICKBALL_TRANSACTION_DEV==='true',
    paperTerminalAttackKo:
      process.env.AGENT3_PAPER_TERMINAL_ATTACK_KO_DEV==='true',
    nativeActionInputTapeOrdinal:
      process.env.AGENT23_NATIVE_INPUT_TAPE_ORDINAL?
        Number(process.env.AGENT23_NATIVE_INPUT_TAPE_ORDINAL):null,
    actorOnlyComposition:process.env.AGENT7_CANONICAL_ACTOR_POLICY_DEV==='true',
    ownerGenericTrainerFrontier:process.env.AGENT7_OWNER_GENERIC_TRAINER_FRONTIER_DEV==='true',
    nativeOwnerTrainerFallback:process.env.AGENT50_NATIVE_TRAINER_PASS_FALLBACK_DEV==='true',
    actorMewGenesectTechnoBlast:
      process.env.AGENT13_MEW_GENES_COPY_DEV==='true',
    actorMewMaxMiracleOverSelfCopy:
      process.env.AGENT13_MEW_SELF_COPY_MAX_MIRACLE_DEV==='true',
    actorDceMewMobilityRoot:
      process.env.AGENT37_DCE_MEW_RETREAT_DEV==='true',
    actorGenesectFusionDrawRoot:
      process.env.AGENT37_GENESECT_FUSION_DRAW_DEV==='true',
    actorOnlySingleSearch:process.env.AGENT41_ACTOR_SINGLE_SEARCH_DEV==='true',
    actorGenericFallbackAttribution:
      process.env.AGENT7_NATIVE_GENERIC_FALLBACK_DEV==='true',
    actorHandDiscard:process.env.AGENT47_ACTOR_HAND_DISCARD_DEV==='true',
    actorAttackFuelDiscard:
      process.env.AGENT47_ATTACK_FUEL_PAYMENT_DEV==='true',
    actorChoosePokemon:process.env.AGENT8_ACTOR_CHOOSE_POKEMON_DEV==='true',
    actorPlumeriaAfterPass:
      process.env.AGENT38_CANONICAL_PLUMERIA_AFTERPASS_DEV==='true',
    actorGuzmaPromptContinuation:
      process.env.AGENT43_GUZMA_PROMPT_CONTINUATION_DEV==='true',
    actorGuzmaNominalGust:
      process.env.AGENT43_GUZMA_NOMINAL_GUST_DEV==='true',
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
      process.env.AGENT41_ENERGY_CONTEST_DEV==='true',
    bilateralJetBenchSwitchRoot:
      process.env.AGENT41_BILATERAL_JET_BENCH_DEV==='true',
    sameRootProposalChoice:
      process.env.AGENT41_SAME_ROOT_PROPOSALS_DEV==='true',
    sameRootChoiceApply:
      process.env.AGENT41_SAME_ROOT_SELECT_DEV==='true',
    nativeToolAttachRoot:
      process.env.AGENT41_NATIVE_TOOL_ATTACH_DEV==='true',
    nativePlumeriaChoice:
      process.env.AGENT41_NATIVE_PLUMERIA_CHOICE_DEV==='true',
    nativeZeroCostDenialChoice:
      process.env.AGENT41_NATIVE_FREE_FLARE_CHOICE_DEV==='true',
    teamFlareGruntDenialRoot:
      process.env.AGENT1_TEAM_FLARE_GRUNT_DEV==='true',
    registeredToolEnergyCeiling:
      process.env.AGENT41_REGISTERED_TOOL_ENERGY_DEV==='true',
    sameRootProbeAll:
      process.env.AGENT41_SAME_ROOT_ALL_PROBES_DEV==='true',
    sameRootPublicEventReceipt:
      process.env.AGENT41_SAME_ROOT_EVENT_RECEIPT_DEV==='true',
    sameRootPassAttackProbeGlobalTurn:
      process.env.AGENT7_PASS_ATTACK_PROBE_TURN&&
        process.env.AGENT7_PASS_ATTACK_PROBE_TURN!=='none'?
        Number(process.env.AGENT7_PASS_ATTACK_PROBE_TURN):null,
    sameRootPublicNoBenchTerminal:
      process.env.AGENT7_PUBLIC_NO_BENCH_TERMINAL_DEV==='true',
    sameRootPositiveAttackOverPass:
      process.env.AGENT7_POSITIVE_ATTACK_OVER_PASS_DEV==='true',
    sameRootThornsEmptyBench:
      process.env.AGENT7_THORNS_EMPTY_BENCH_ATTACK_DEV==='true',
    isolatePolicyRandomness:
      process.env.AGENT41_ISOLATE_POLICY_RANDOMNESS==='true',
    isolatePhysicalShuffleRandomnessAfterSetup:
      process.env.AGENT41_ISOLATE_PHYSICAL_SHUFFLE_AFTER_SETUP==='true'
  });
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
}
module.exports={developmentTrials,sourceFirstPressureTrials,
  commonPayloadOption,actorGarbodorResponseRootOptions,
  actorPaidRetreatRootOptions,bilateralJetBenchRootOptions,
  rngProtocolSelection,
  paidRetreatRootWrapperActivationReceipt,firstPostSourceDecision,
  sourceLineReplyPacket,candidatePostChoicePassEvidence,
  candidateRepliesAfterSourceAttacks,scopedSpecialEnergyActorSeat,
  executeDevelopment,runDevelopment,registeredNativeSeatDecks,
  validateRegisteredTrialGroups,registeredSourcePairKeys,
  classifyNativeAbort};
