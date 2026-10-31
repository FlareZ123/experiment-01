'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {isDeepStrictEqual}=require('node:util');
const {createHash}=require('node:crypto');

/** @param {unknown} value JSON-serializable genuine Store evidence. */
const evidenceDigest=value=>createHash('sha256')
  .update(JSON.stringify(value??null)).digest('hex');

/**
 * The first observed tactic or scored-candidate divergence is useful even
 * when strict tape playback aborts. Native observations add no extra scorer
 * evaluation or hidden-card inspection; absent score traces remain unknown.
 * @param {object|null} source Read-only live bot sequence.
 * @param {object|null} replay Detached same-root sequence.
 * @returns {object|null} A bounded, printing-free diagnostic.
 */
function nativeTacticSequenceComparison(source,replay) {
  if(!source||!replay)return null;
  const first=(source.steps??[]),second=(replay.steps??[]);
  let mismatch=null;
  const fields=['tactic','rngStart','rngEnd','rngDraws','actionType','threw'];
  for(let i=0;i<Math.max(first.length,second.length);i++){
    const a=first[i]??null,b=second[i]??null;
    if(!isDeepStrictEqual(a,b)){
      mismatch={stepIndex:i,source:a,replay:b};break;
    }
  }
  const simulationsObserved=Array.isArray(source.simulations)&&
    Array.isArray(replay.simulations);
  const sourceSimulations=simulationsObserved?source.simulations:[];
  const replaySimulations=simulationsObserved?replay.simulations:[];
  let firstSimulationDivergence=null;
  if(simulationsObserved){
    for(let i=0;i<Math.max(sourceSimulations.length,replaySimulations.length);i++){
      const a=sourceSimulations[i]??null,b=replaySimulations[i]??null;
      if(!isDeepStrictEqual(a,b)){
        firstSimulationDivergence={index:i,source:a,replay:b};break;
      }
    }
  }
  const evaluationsObserved=Array.isArray(source.evaluations)&&
    Array.isArray(replay.evaluations);
  const original=evaluationsObserved?source.evaluations:[];
  const reconstructed=evaluationsObserved?replay.evaluations:[];
  let scoreMismatch=null;
  if(evaluationsObserved){
    for(let i=0;i<Math.max(original.length,reconstructed.length);i++){
      const a=original[i]??null,b=reconstructed[i]??null;
      if(!isDeepStrictEqual(a,b)){
        scoreMismatch={evaluationIndex:i,source:a,replay:b};break;
      }
    }
  }
  return {
    sourceCalls:first.length,replayCalls:second.length,
    sourceRngCalls:source.rngCalls??null,
    replayRngCalls:replay.rngCalls??null,
    sourceSpeculativeCalls:simulationsObserved?source.simulationCalls??null:null,
    replaySpeculativeCalls:simulationsObserved?replay.simulationCalls??null:null,
    simulationsObserved,
    firstSimulationDivergence,
    sameSimulations:simulationsObserved?firstSimulationDivergence===null:null,
    sameSteps:mismatch===null,
    firstDivergence:mismatch,
    comparedFields:fields,
    scoreTraceObserved:evaluationsObserved,
    sourceEvaluations:evaluationsObserved?original.length:null,
    replayEvaluations:evaluationsObserved?reconstructed.length:null,
    sameEvaluations:evaluationsObserved?scoreMismatch===null:null,
    firstEvaluationDivergence:scoreMismatch,
    scope:'Retrospective native-policy replay trace; no information-set or game qualification'
  };
}

/**
 * The source-first opponent line at 6:0:A is expected on global turn 2,
 * and the candidate's next own turn is 3. At 11:2:B, the source player
 * actually starts second and any turn-2 Boost Shake precedes candidate
 * global turn 3. Both placements are confirmed from the compiled 19 October
 * common-policy development run 39234692630. These are
 * *historical development* roots, not held-out or assured pressure events.
 *
 * @param {{rank:number,candidateSlot:string}} trial
 * @returns {{turn:number,seat:number}}
 */
function candidateDevelopmentTarget(trial) {
  assert.ok(trial.rank===6||trial.rank===11,'Only frozen hard-rank fixtures');
  assert.ok(['A','B'].includes(trial.candidateSlot),'Unknown candidate seat');
  assert.ok((trial.rank===6&&trial.candidateSlot==='A')||
    (trial.rank===11&&trial.candidateSlot==='B'),
  'Historical fixture/seat mismatch');
  return {turn:3,seat:trial.candidateSlot==='A'?0:1};
}

/**
 * Assert that the diagnostic preserves a complete real-root action sequence
 * and relevant terminal, first-start and source-deal observations. Same
 * archived seed alone cannot establish policy noninterference.
 *
 * @param {object} row Genuine development runner output.
 */
function comparisonProjection(row) {
  return {
    error:row.status??null,
    trialId:row.trial?.id??null,
    policyVersion:row.policyVersion??null,
    rootActions:row.rootActionLedgerSha256??null,
    sourceDeal:row.sourceDealFingerprint??null,
    originalFirstOwnerHand:row.sourceFirstOwnHandSha256??null,
    verifiedFirstTurn:row.verifiedFirstTurn??null,
    starter:row.actualStarterSeat??null,
    sourceActuallyFirst:row.sourceActuallyFirst??null,
    actionCount:row.actionCount??null,
    turns:row.turns??null,
    finished:row.finished??null,
    winner:row.winner??null,
    endReason:row.endReason??null,
    finalPrizes:row.finalPrizes??null,
    attackDeclarations:row.attackDeclarations??null,
    settledPublicAttackCount:row.settledPublicAttackCount??null,
    // Root action and terminal equality alone miss identical actions that
    // produced different effects, boards or delegated-copy observations.
    publicBoardSha256:evidenceDigest(row.finalBoard),
    firstSettledAttacksSha256:evidenceDigest(row.firstSettledPublicAttack),
    sourceReplyPacketSha256:evidenceDigest(row.sourceLinePacket),
    candidatePassSamplesSha256:evidenceDigest(row.candidatePassProbeSamples),
    candidatePerfectionSamplesSha256:evidenceDigest(
      row.candidatePerfectionPassSamples)
  };
}

/**
 * Run the same original real game with and without a *detached*, strictly
 * diagnostic hidden-order probe at one candidate decision. Fail closed if
 * anything about the actual source-dealt root ledger changes.
 *
 * @template T
 * @param {object} trial A developmentTrials() row, including exact seed.
 * @param {()=>T} execute Frozen runner, with no probe installed.
 * @param {(Bot:Function,work:()=>T,clone:Function,target:object)=>{result:T,events:object[]}} probe
 * @param {Function} Bot Pinned SimpleTacticsAi, injected for pure tests.
 * @param {(state:object)=>object} clone Full detached clone.
 * @param {()=>()=>number} makeRandom Independent policy RNG factory.
 * @param {{firstFiniteScoredRoot?:boolean,replayCommonPolicy?:boolean,isolateReplayPolicyPerWorld?:boolean,nativeScoreTrace?:boolean,nativeTapeSameWorld?:boolean,nativeTapeFirstFiniteScore?:boolean,nativeTapeHiddenOpponentHandContrast?:boolean,nativeTapeBoundedOpponentHiddenHand?:boolean,nativeTapeBoundedDoubleExchange?:boolean,nativeTapeHandPrizeContrast?:boolean}} [scope]
 * @returns {object} Unqualified, failure-inclusive diagnostic.
 */
function auditDevelopmentArm(trial,execute,probe,Bot,clone,makeRandom,scope={}) {
  const target={...candidateDevelopmentTarget(trial),
    ...(scope.firstFiniteScoredRoot===true?
      {firstFiniteScoredRoot:true,probeFreshStoreLegality:true}:{}),
    ...(scope.replayCommonPolicy===true?{replayCommonPolicy:true}:{}),
    ...(scope.isolateReplayPolicyPerWorld===true?
      {isolateReplayPolicyPerWorld:true}:{}),
    ...(scope.nativeScoreTrace===true?{nativeScoreTrace:true}:{}),
    ...(scope.nativeTapeSameWorld===true?{nativeTapeSameWorld:true}:{}),
    ...(scope.nativeTapeFirstFiniteScore===true?{nativeTapeFirstFiniteScore:true}:{}),
    ...(scope.nativeTapeHiddenOrderContrast===true?
      {nativeTapeHiddenOrderContrast:true}:{}),
    ...(scope.nativeTapeHiddenOpponentHandContrast===true?
      {nativeTapeHiddenOpponentHandContrast:true}:{}),
    ...(scope.nativeTapeBoundedOpponentHiddenHand===true?
      {nativeTapeBoundedOpponentHiddenHand:true}:{}),
    ...(scope.nativeTapeBoundedDoubleExchange===true?
      {nativeTapeBoundedDoubleExchange:true}:{}),
    ...(scope.nativeTapeHandPrizeContrast===true?
      {nativeTapeHandPrizeContrast:true}:{})};
  let control;
  try {
    control=execute();
  } catch(error) {
    return {
      trialId:trial.id,target,classification:'control-engine-error',
      error:String(error?.stack||error),comparisonQualified:false,
      competitiveGameQualified:false
    };
  }
  let instrumented,events;
  try {
    const observed=probe(Bot,execute,clone,{...target,makeRandom});
    instrumented=observed.result;
    events=observed.events;
    assert.ok(Array.isArray(events),'Probe must report root observations');
  } catch(error) {
    return {
      trialId:trial.id,target,classification:'probe-engine-or-audit-error',
      error:String(error?.stack||error),
      control:comparisonProjection(control),
      comparisonQualified:false,competitiveGameQualified:false
    };
  }
  const controlProjection=comparisonProjection(control);
  const observedProjection=comparisonProjection(instrumented);
  const samePlayback=isDeepStrictEqual(controlProjection,observedProjection);
  // Fail closed on absent real-root ledgers and verified physical deal.
  const actualExecutionAuthenticated=Boolean(
    controlProjection.rootActions &&
    controlProjection.sourceDeal &&
    controlProjection.verifiedFirstTurn===true &&
    controlProjection.sourceActuallyFirst===false &&
    observedProjection.rootActions &&
    observedProjection.sourceDeal &&
    observedProjection.verifiedFirstTurn===true &&
    observedProjection.sourceActuallyFirst===false);
  const noninterferenceVerified=samePlayback&&actualExecutionAuthenticated;
  const event=events.length===1?events[0]:null;
  // Native same-world replay evidence is stronger than nominal baseline flags.
  // A mocked, stale, or absent failed native parity cannot certify this gate.
  const nativeTapeExpected=scope.nativeTapeSameWorld===true||
    event?.nativeSameWorldTape!=null;
  const ownerBaselineVerified=event?.baselineActionMatchedActual===true &&
    event?.liveStatePreserved===true &&
    (!nativeTapeExpected||
      event?.nativeSameWorldTape?.sameWorldDecisionParityQualified===true);
  let classification;
  if(!noninterferenceVerified) {
    classification='probe-changed-or-unverified-live-playback';
  } else if(!event) {
    classification=events.length?'ambiguous-multiple-root-probes':'no-matching-candidate-root';
  } else if(event.nativeSameWorldTape) {
    if(!ownerBaselineVerified)
      classification='authentic-tape-same-world-parity-veto';
    else if(scope.nativeTapeHiddenOpponentHandContrast===true) {
      const hand=event.nativeOpponentHiddenHandContrast;
      classification=hand?.contrastExecutable!==true?
        'authentic-tape-opponent-hidden-hand-contrast-veto':
        hand.selectedActionChanged===true?
          'conditional-tape-opponent-hidden-hand-action-reversal':
          'conditional-tape-opponent-hidden-hand-no-action-change';
    } else classification='authentic-tape-same-world-parity-only';
  } else if(!ownerBaselineVerified) {
    classification='fresh-bot-baseline-or-live-state-mismatch';
  } else if(event.actionSensitiveToHiddenDeckOrder===true) {
    classification='hidden-order-action-sensitivity-observed';
  } else if(event.tacticScoreComparison?.equalScoreTraces===false) {
    classification='hidden-order-score-sensitivity-only';
  } else if(event.tacticScoreComparison?.physicalEvaluations===0 &&
    event.tacticScoreComparison?.counterfactualEvaluations===0) {
    // Equal empty score traces cannot assess hidden-information leakage
    // through the generic tactic scorer.
    classification='no-generic-tactic-evaluations-on-tested-root';
  } else {
    classification='no-sensitivity-on-tested-root';
  }
  return {
    trialId:trial.id,rank:trial.rank,candidateId:trial.candidateId,
    seed:trial.seed,target,
    classification,control:controlProjection,probed:observedProjection,
    samePlayback,actualExecutionAuthenticated,noninterferenceVerified,
    rootProbeEvents:events.length,
    ...(event?{diagnostic:{
      actualAction: event.originalSourceAction??null,
      auditError:event.auditError??null,
      nativeSameWorldTape:event.nativeSameWorldTape??null,
      nativeTacticSource:event.nativeTacticSource??null,
      nativeTacticReplay:event.nativeTacticReplay??null,
      nativeTacticComparison:nativeTacticSequenceComparison(
        event.nativeTacticSource??null,event.nativeTacticReplay??null),
      sourceStateChangedBeforeFirstScore:
        event.sourceStateChangedBeforeFirstScore??null,
      nativeTapeScoredRootTurn:event.nativeTapeScoredRootTurn??null,
      nativeTapeFiniteScores:event.nativeTapeFiniteScores??null,
      sourceCaptureFidelity:event.sourceCaptureFidelity??null,
      nativeHiddenOrderContrast:event.nativeHiddenOrderContrast??null,
      nativeOpponentHiddenHandContrast:
        event.nativeOpponentHiddenHandContrast??null,
      hiddenWorldCounterfactualCompared:event.counterfactualCompared!==false,
      physicalFreshAction:event.physicalOrder??null,
      reversedFreshAction:event.reversedOrder??null,
      liveStatePreserved:event.liveStatePreserved===true,
      baselineActionMatchedActual:event.baselineActionMatchedActual===true,
      actionSensitiveToHiddenDeckOrder:event.actionSensitiveToHiddenDeckOrder===true,
      tacticScoreComparison:event.tacticScoreComparison??null,
      // Null means not measured. False flags either zero finite results or
      // zero generic scorer calls; only positive values prove actual exposure.
      bothWorldsFiniteScoring:
        typeof event.tacticScoreComparison?.physicalScoreSummary?.finiteScores==='number' &&
        typeof event.tacticScoreComparison?.counterfactualScoreSummary?.finiteScores==='number' ?
          event.tacticScoreComparison.physicalScoreSummary.finiteScores>0 &&
          event.tacticScoreComparison.counterfactualScoreSummary.finiteScores>0:null,
      deckCards:event.deckCards??null,
      chosenRootTurn:event.chosenRootTurn??null,
      actualScorerAttempts:event.actualScorerAttempts??null,
      actualFiniteScores:event.actualFiniteScores??null,
      actualNativeScoreTrace:event.actualNativeScoreTrace??null,
      sourceStateChangedBeforeFirstScore:
        event.sourceStateChangedBeforeFirstScore??null,
      sourceStartGraphDigest:event.sourceStartGraphDigest??null,
      firstScoreSourceGraphDigest:event.firstScoreSourceGraphDigest??null,
      ownerRootVisible:event.ownerRootVisible??null,
      freshPlayCardStoreProbe:event.freshPlayCardStoreProbe??null,
      replayCommonPolicy:event.replayCommonPolicy===true,
      isolatedReplayPolicyPerWorld:event.isolatedReplayPolicyPerWorld===true,
      knownDeckMembershipVerified:event.knownDeckMembershipVerified===true,
      knownDeckTopOrderVerified:event.knownDeckTopOrderVerified===true
    }}:{}),
    conditionalOpponentHandContrastExecutable:
      scope.nativeTapeHiddenOpponentHandContrast===true&&
      noninterferenceVerified&&ownerBaselineVerified&&
      event?.nativeOpponentHiddenHandContrast?.contrastExecutable===true,
    conditionalOpponentHandActionDifference:
      scope.nativeTapeHiddenOpponentHandContrast===true&&
      noninterferenceVerified&&ownerBaselineVerified&&
      event?.nativeOpponentHiddenHandContrast?.contrastExecutable===true&&
      event.nativeOpponentHiddenHandContrast.selectedActionChanged===true,
    informationSetLeakQualified:false,
    comparisonQualified:scope.nativeTapeSameWorld!==true&&
      noninterferenceVerified&&ownerBaselineVerified,
    sameWorldParityQualified:scope.nativeTapeSameWorld===true&&
      noninterferenceVerified&&ownerBaselineVerified,
    competitiveGameQualified:false,
    caveat:'Historical development seed. Order observation/K0/K1 not certified; '+
      'the default full-game bot remains hidden-information-unsafe.'
  };
}

/**
 * Recreate Agent 41's frozen *development* inventories. Never substitute
 * this routine for its prospective v2 registration and attempt census.
 *
 * @returns {object}
 */
function runHistoricalDevelopmentAudit({firstFiniteScoredRoot=false,
  replayCommonPolicy=false,isolateReplayPolicyPerWorld=false,
  nativeScoreTrace=false,nativeTapeSameWorld=false,
  nativeTapeFirstFiniteScore=false,nativeTapeHiddenOrderContrast=false,
  nativeTapeHiddenOpponentHandContrast=false,
  nativeTapeBoundedOpponentHiddenHand=false,
  nativeTapeBoundedDoubleExchange=false,
  nativeTapeHandPrizeContrast=false}={}) {
  assert.equal(typeof firstFiniteScoredRoot,'boolean');
  assert.equal(typeof replayCommonPolicy,'boolean');
  assert.equal(typeof isolateReplayPolicyPerWorld,'boolean');
  assert.equal(typeof nativeScoreTrace,'boolean');
  assert.equal(typeof nativeTapeSameWorld,'boolean');
  assert.equal(typeof nativeTapeFirstFiniteScore,'boolean');
  assert.ok(!nativeTapeFirstFiniteScore||
    (nativeTapeSameWorld&&firstFiniteScoredRoot),
    'Finite-scored tape needs authentic native tape and scored root');
  assert.equal(typeof nativeTapeHiddenOrderContrast,'boolean');
  assert.ok(!nativeTapeHiddenOrderContrast||nativeTapeSameWorld,
    'Hidden owner order contrast requires genuine same-world tape mode');
  assert.equal(typeof nativeTapeHiddenOpponentHandContrast,'boolean');
  assert.equal(typeof nativeTapeBoundedOpponentHiddenHand,'boolean');
  assert.equal(typeof nativeTapeBoundedDoubleExchange,'boolean');
  assert.equal(typeof nativeTapeHandPrizeContrast,'boolean');
  assert.ok(!nativeTapeHandPrizeContrast||
    (nativeTapeBoundedOpponentHiddenHand&&!nativeTapeBoundedDoubleExchange),
    'Hand-Prize contrast requires bounded one-swap mode');
  assert.ok(!nativeTapeBoundedDoubleExchange||nativeTapeBoundedOpponentHiddenHand,
    'Double exchange requires bounded native opponent-hand mode');
  assert.ok(!nativeTapeBoundedOpponentHiddenHand||
    nativeTapeHiddenOpponentHandContrast,
    'Bounded hidden-hand scan requires native opponent-hand tape');
  assert.ok(!nativeTapeHiddenOpponentHandContrast||nativeTapeSameWorld,
    'Opponent hand contrast requires genuine same-world tape mode');
  assert.ok(!nativeTapeSameWorld||!firstFiniteScoredRoot||
    nativeTapeFirstFiniteScore,
    'Native scored-root tape requires explicit mode');
  assert.ok(!isolateReplayPolicyPerWorld||replayCommonPolicy,
    'Independent policy replay requires the common-policy opt-in');
  const root=path.resolve(__dirname,'../..');
  const {developmentTrials,executeDevelopment}=
    require('./agent41-bilateral-v2-development.cjs');
  const {planAichi}=require('./aichi-pilot.cjs');
  const {loadNewMoonCandidate}=
    require('../../scripts/aichi-new-moon-candidate.cjs');
  const {initializeCards,seededRandom}=
    require('../twinleaf/headless.cjs');
  const {withPostgameRootOrderProbe}=
    require('./agent50-bilateral-postgame-root-observer.cjs');
  const {assertVendorCloneCompatibleSource,normalizeDeepClonePrototypes}=
    require('../twinleaf/normalize-deep-clone.cjs');
  initializeCards();
  const output=path.join(root,'vendor/twinleaf/ptcg-server/output');
  const {SimpleTacticsAi}=require(path.join(output,
    'simple-bot/simple-tactics-ai'));
  const {deepClone}=require(path.join(output,'utils'));
  const clone=state=>{
    assertVendorCloneCompatibleSource(state);
    return normalizeDeepClonePrototypes(state,deepClone(state));
  };
  const roster=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  const reference=roster.decks.find(row=>row.rank===1);
  assert.ok(reference);
  const manifests=[
    ['champion-reference',{label:'champion-reference',cards:reference.cards}],
    ['new-moon-lockbreaker-v1',{
      label:'new-moon-lockbreaker-v1',cards:loadNewMoonCandidate().cards}]
  ];
  const prepared=new Map(manifests.map(([id,manifest])=>[
    id,{plan:planAichi(manifest,{
      allowEquivalentBasicEnergies:true,
      allowBasicEnergyMirrorPrintings:true,
      allowJapanesePromoHooks:true
    })}
  ]));
  const rows=developmentTrials().map(trial=>auditDevelopmentArm(
    trial,
    ()=>executeDevelopment(trial,prepared),
    withPostgameRootOrderProbe,SimpleTacticsAi,clone,
    ()=>seededRandom((trial.seed^0x5a17b9ef)>>>0),
    {firstFiniteScoredRoot,replayCommonPolicy,isolateReplayPolicyPerWorld,
      nativeScoreTrace,nativeTapeSameWorld,nativeTapeFirstFiniteScore,
      nativeTapeHiddenOrderContrast,nativeTapeHiddenOpponentHandContrast,
      nativeTapeBoundedOpponentHiddenHand,nativeTapeBoundedDoubleExchange,
      nativeTapeHandPrizeContrast}
  ));
  return {
    schema:nativeTapeHandPrizeContrast?
      'agent23-crossrank-native-tape-opponent-hand-prize-v4':
      nativeTapeBoundedDoubleExchange?
      'agent23-crossrank-native-tape-opponent-hand-double-v3':
      nativeTapeFirstFiniteScore?
      'agent50-crossrank-native-first-finite-scored-tape-v1':
      nativeTapeBoundedOpponentHiddenHand?
      'agent23-crossrank-native-tape-opponent-hand-bounded-v2':
      nativeTapeHiddenOpponentHandContrast?
      'agent23-crossrank-native-tape-opponent-hand-exploration-v1':
      nativeTapeHiddenOrderContrast?
      'agent50-crossrank-native-tape-order-exploration-v1':
      nativeTapeSameWorld?
      'agent50-crossrank-native-same-world-tape-prerequisite-v1':
      nativeScoreTrace?
      'agent50-crossrank-historical-first-finite-owner-score-v7':
      isolateReplayPolicyPerWorld?
      'agent50-crossrank-historical-first-finite-owner-score-v5':
      replayCommonPolicy?
      'agent50-crossrank-historical-first-finite-owner-score-v4':
      firstFiniteScoredRoot?
      'agent50-crossrank-historical-first-finite-owner-score-v3':
      'agent50-crossrank-historical-live-hidden-order-v1',
    protocol:nativeTapeHandPrizeContrast?
      'same-frozen-game control/replay and native-tape opponent concealed-hand/Prize swaps':
      nativeTapeBoundedDoubleExchange?
      'same-frozen-game control/replay and disjoint two-card native-tape hand/deck swaps':
      nativeTapeBoundedOpponentHiddenHand?
      'same-frozen-game control/replay and bounded native RNG-tape hidden-hand exchanges':
      'same-frozen-game control/replay, one candidate root hidden order flip',
    targetRankAndActualSeat:firstFiniteScoredRoot?
      'First candidate root at/after global turn 3 returning a finite tactic score for each arm':
      '6:0:A candidate seat A turn 3; 11:2:B candidate seat B turn 3',
    source:'Agent 41 previously inspected v1 development streams; excluded from prospective v2',
    allAttemptsRetained:true,attempts:rows.length,rows,
    liveProbeNoninterfering:rows.filter(r=>r.noninterferenceVerified).length,
    sensitivityObserved:rows.filter(r=>
      r.classification==='hidden-order-action-sensitivity-observed').length,
    bothWorldsFiniteScorerExposures:rows.filter(r=>
      r.diagnostic?.bothWorldsFiniteScoring===true).length,
    scorerAbsentAtBothWorlds:rows.filter(r=>
      r.classification==='no-generic-tactic-evaluations-on-tested-root').length,
    independentlyQualifiedCompetitiveGames:0,
    gameWinRateCertified:false,
    interpretation:'This diagnoses the existing policy at its real decisions. It '+
      'does not implement information-set safety or estimate deck strength.'
  };
}

if(require.main===module) {
  process.stdout.write(JSON.stringify(runHistoricalDevelopmentAudit({
    firstFiniteScoredRoot:process.env.AGENT50_FIRST_FINITE_ROOT==='true',
    replayCommonPolicy:process.env.AGENT50_COMMON_POLICY_REPLAY==='true'||
      process.env.AGENT50_ISOLATED_POLICY_WORLDS==='true',
    isolateReplayPolicyPerWorld:process.env.AGENT50_ISOLATED_POLICY_WORLDS==='true',
    nativeScoreTrace:process.env.AGENT50_NATIVE_SCORE_TRACE==='true',
    nativeTapeSameWorld:process.env.AGENT50_NATIVE_TAPE_SAME_WORLD==='true',
    nativeTapeFirstFiniteScore:
      process.env.AGENT50_NATIVE_TAPE_FIRST_FINITE_SCORE==='true',
    nativeTapeHiddenOrderContrast:
      process.env.AGENT50_NATIVE_TAPE_HIDDEN_DECK_ORDER==='true',
    nativeTapeHiddenOpponentHandContrast:
      process.env.AGENT23_NATIVE_OPPONENT_HAND_TAPE==='true',
    nativeTapeBoundedOpponentHiddenHand:
      process.env.AGENT23_NATIVE_BOUNDED_OPPONENT_HAND_TAPE==='true',
    nativeTapeBoundedDoubleExchange:
      process.env.AGENT23_NATIVE_BOUNDED_DOUBLE_SWAP_DEV==='true',
    nativeTapeHandPrizeContrast:
      process.env.AGENT23_NATIVE_OPPONENT_PRIZE_TAPE==='true'
  }),null,2)+'\n');
}
module.exports={candidateDevelopmentTarget,comparisonProjection,
  nativeTacticSequenceComparison,auditDevelopmentArm,runHistoricalDevelopmentAudit};
