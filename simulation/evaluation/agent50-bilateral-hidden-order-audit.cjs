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
 * @param {{firstFiniteScoredRoot?:boolean,replayCommonPolicy?:boolean}} [scope]
 * @returns {object} Unqualified, failure-inclusive diagnostic.
 */
function auditDevelopmentArm(trial,execute,probe,Bot,clone,makeRandom,scope={}) {
  const target={...candidateDevelopmentTarget(trial),
    ...(scope.firstFiniteScoredRoot===true?
      {firstFiniteScoredRoot:true,probeFreshStoreLegality:true}:{}),
    ...(scope.replayCommonPolicy===true?{replayCommonPolicy:true}:{})};
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
  const ownerBaselineVerified=event?.baselineActionMatchedActual===true &&
    event?.liveStatePreserved===true;
  let classification;
  if(!noninterferenceVerified) {
    classification='probe-changed-or-unverified-live-playback';
  } else if(!event) {
    classification=events.length?'ambiguous-multiple-root-probes':'no-matching-candidate-root';
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
      ownerRootVisible:event.ownerRootVisible??null,
      freshPlayCardStoreProbe:event.freshPlayCardStoreProbe??null,
      replayCommonPolicy:event.replayCommonPolicy===true,
      knownDeckMembershipVerified:event.knownDeckMembershipVerified===true,
      knownDeckTopOrderVerified:event.knownDeckTopOrderVerified===true
    }}:{}),
    comparisonQualified:noninterferenceVerified&&ownerBaselineVerified,
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
  replayCommonPolicy=false}={}) {
  assert.equal(typeof firstFiniteScoredRoot,'boolean');
  assert.equal(typeof replayCommonPolicy,'boolean');
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
    {firstFiniteScoredRoot,replayCommonPolicy}
  ));
  return {
    schema:replayCommonPolicy?
      'agent50-crossrank-historical-first-finite-owner-score-v4':
      firstFiniteScoredRoot?
      'agent50-crossrank-historical-first-finite-owner-score-v3':
      'agent50-crossrank-historical-live-hidden-order-v1',
    protocol:'same-frozen-game control/replay, one candidate root hidden order flip',
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
    replayCommonPolicy:process.env.AGENT50_COMMON_POLICY_REPLAY==='true'
  }),null,2)+'\n');
}
module.exports={candidateDevelopmentTarget,comparisonProjection,
  auditDevelopmentArm,runHistoricalDevelopmentAudit};
