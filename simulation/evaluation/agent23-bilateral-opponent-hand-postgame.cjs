'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {isDeepStrictEqual}=require('node:util');
const {candidateDevelopmentTarget,comparisonProjection}=
  require('./agent50-bilateral-hidden-order-audit.cjs');
const {compareOpponentHiddenSwap}=
  require('../twinleaf/opponent-hidden-live-root-probe.cjs');
const {scanBoundedOpponentHiddenWorlds,VERSION:BOUNDED_SCAN_VERSION}=
  require('../twinleaf/agent23-bounded-hidden-world-scan.cjs');

const root=path.resolve(__dirname,'../..');

/**
 * Require unchanged authentic root actions, source physical deal, first
 * player and public post-attack projection before interpreting the
 * postgame hypothetical decision. No winning-strength implication.
 * @param {object} control
 * @param {object} replay
 * @param {object[]} events
 */
function classifyConditionalProbe(control,replay,events){
  const a=comparisonProjection(control);
  const b=comparisonProjection(replay);
  const samePlayback=isDeepStrictEqual(a,b);
  const authenticated=Boolean(a.rootActions&&a.sourceDeal &&
    a.verifiedFirstTurn===true&&a.sourceActuallyFirst===false &&
    b.rootActions&&b.sourceDeal &&
    b.verifiedFirstTurn===true&&b.sourceActuallyFirst===false);
  const noninterfering=samePlayback&&authenticated;
  const event=events.length===1?events[0]:null;
  const matched=event?.baselineActionMatchedActual===true &&
    event?.liveStatePreserved===true &&
    event?.comparedAfterRealGameFinished===true;
  let classification;
  if(!noninterfering)
    classification='unverified-or-changed-live-playback';
  else if(events.length!==1)
    classification=events.length?'ambiguous-multiple-root-probes':
      'no-eligible-live-owner-root';
  else if(!matched)
    classification='fresh-bot-baseline-or-detachment-mismatch';
  else if(event.opportunity!==true)
    classification='no-distinct-hidden-hand-deck-pair';
  else if(event.actionSensitiveToOpponentHiddenHand===true)
    classification='conditional-opponent-hand-action-reversal';
  else if(event.tacticScoreComparison?.equalScoreTraces===false||
    (Number.isSafeInteger(event.scoreOnlyChanges)&&event.scoreOnlyChanges>0))
    classification='conditional-opponent-hand-score-change-only';
  else classification='no-change-under-chosen-counterfactual';

  return {
    classification,samePlayback,authenticated,noninterfering,
    rootOwnerActionReproduced:Boolean(matched),
    exactSourcePhysicalDealPreserved:a.sourceDeal===b.sourceDeal &&
      Boolean(a.sourceDeal),
    hiddenCounterfactualEvaluated:Boolean(event?.opportunity),
    conditionalActionReversal:Boolean(noninterfering&&matched&&
      event?.opportunity&&event.actionSensitiveToOpponentHiddenHand),
    control:a,replay:b,
    diagnostic:event?{
      liveOwnerAction:event.originalSourceAction??null,
      detachedOwnerAction:event.physicalOrder??null,
      counterfactualOwnerAction:event.counterfactualOrder??
        event.firstActionReversal?.counterfactualAction??null,
      baselineActionMatchedActual:event.baselineActionMatchedActual??false,
      comparedAfterRealGameFinished:event.comparedAfterRealGameFinished??false,
      sourceHiddenPoolConserved:event.sourceHiddenPoolConserved??false,
      hiddenSwapKinds:event.chosenExchangeKinds??
        event.firstActionReversal?.exchangeKind??
        event.firstScoreOnlyChange?.exchangeKind??null,
      handIdentityUnobservedHistoryVerified:false,
      boundedWorldScanVersion:event.schema??null,
      eligibleSingleExchanges:event.totalEligibleSingleExchanges??null,
      testedSingleExchanges:event.testedSingleExchanges??null,
      exhaustiveSingleExchangeCoverage:event.exhaustiveSingleExchangeCoverage??null,
      firstActionReversal:event.firstActionReversal??null,
      scoreDelta:event.tacticScoreComparison??
        event.firstScoreOnlyChange?.scoreComparison??null,
      auditError:event.auditError??null
    }:null,
    qualifiedCompetitiveGames:0,
    completeOwnerInformationSetCertified:false,
    caveat:'Retrospective frozen historical development replay with a '+
      'counterfactual conditional on actual private card identities; '+
      'opponent reveal history and complete live actor policy safety unverified.'
  };
}

/**
 * All errors are retained as explicit failed attempts.
 * @param {object} trial
 * @param {Map<string,object>} prepared
 * @param {Function} Bot
 * @param {(state:object)=>object} clone
 * @param {(trial:object,prepared:Map<string,object>)=>object} executeArm
 * @param {Function} observePostgame
 * @param {()=>()=>number} makeRandom
 */
function auditHistoricalTrial(trial,prepared,Bot,clone,executeArm,
  observePostgame,makeRandom,compare=compareOpponentHiddenSwap){
  const target=candidateDevelopmentTarget(trial);
  let control;
  try{control=executeArm(trial,prepared);}
  catch(error){
    return {trialId:trial.id,classification:'control-engine-error',
      error:String(error?.stack??error),qualifiedCompetitiveGames:0};
  }
  try{
    const comparison=observePostgame(Bot,
      ()=>executeArm(trial,prepared),clone,{...target,makeRandom,
        ...(compare===scanBoundedOpponentHiddenWorlds?{
          replayCommonPolicy:true,
          isolateReplayPolicyPerWorld:true
        }:{})},
      {compare});
    assert.ok(Array.isArray(comparison.events),'Missing probe ledger');
    return {
      trialId:trial.id,rank:trial.rank,candidateId:trial.candidateId,
      originalSeed:trial.seed,target,allAttemptsRetained:true,
      ...classifyConditionalProbe(
        control,comparison.result,comparison.events)
    };
  }catch(error){
    return {
      trialId:trial.id,classification:'detached-observer-or-replay-error',
      error:String(error?.stack??error),
      control:comparisonProjection(control),
      qualifiedCompetitiveGames:0,
      completeOwnerInformationSetCertified:false
    };
  }
}

/**
 * Follow the unchanged Agent-41 historical four-arm runner, merely capturing
 * one live genuine candidate root before the whole game ends, then probing
 * a fully detached alternative opponent concealed hand. Never launch a new
 * candidate-versus-opponent campaign or infer a game win percentage.
 */
function runHistorical(){
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
  const rank1=roster.decks.find(row=>row.rank===1);
  assert.ok(rank1);
  const manifests=[
    ['champion-reference',{label:'champion-reference',cards:rank1.cards}],
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
  const trials=developmentTrials();
  const boundedWorldScan=process.env.AGENT23_BOUNDED_HIDDEN_SCAN_DEV==='true';
  const compare=boundedWorldScan?scanBoundedOpponentHiddenWorlds:
    compareOpponentHiddenSwap;
  const rows=trials.map(trial=>auditHistoricalTrial(
    trial,prepared,SimpleTacticsAi,clone,executeDevelopment,
    withPostgameRootOrderProbe,
    ()=>seededRandom((trial.seed^0x23e1b4c5)>>>0),compare
  ));
  return {
    schema:boundedWorldScan?
      'agent23-full-bot-live-opponent-hand-conditional-postgame-multiworld-v2':
      'agent23-full-bot-live-opponent-hand-conditional-postgame-v1',
    boundedWorldScan,scanVersion:boundedWorldScan?BOUNDED_SCAN_VERSION:null,
    runner:'simulation/evaluation/agent41-bilateral-v2-development.cjs',
    engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    experimentScope:'Frozen historical 4 arms, read-only actual owner root; detached conditional private hand/deck exchange after each authentic game',
    attempts:rows.length,expectedHistoricalArms:4,rows,
    completeAttemptCensus:true,
    noninterferingReplays:rows.filter(row=>row.noninterfering).length,
    rootOwnerActionsReproduced:rows.filter(row=>
      row.rootOwnerActionReproduced).length,
    conditionalActionReversals:rows.filter(row=>
      row.conditionalActionReversal).length,
    noRevealedHandHistoryProof:true,
    boundedScanCoverage:boundedWorldScan?rows.map(row=>({
      trialId:row.trialId,
      eligible:row.diagnostic?.eligibleSingleExchanges??null,
      tested:row.diagnostic?.testedSingleExchanges??null,
      complete:row.diagnostic?.exhaustiveSingleExchangeCoverage??false,
      classification:row.classification
    })):null,
    competitiveQualifiedGames:0,
    gameWinRateCertified:false,
    caveat:'A replay-validated counterfactual is still not a complete '+
      'information-set safety certification or a competitive result.'
  };
}
if(require.main===module){
  const result=runHistorical();
  const json=JSON.stringify(result,null,2)+'\n';
  const dest=process.env.AGENT23_RESULT_OUTPUT;
  if(dest){
    // The CI writer owns this one artifact under an exclusive advisory lock.
    // Write a unique temporary file first, and atomically rename it.
    const absolute=path.resolve(dest);
    const lock=absolute+'.lock';
    const fd=fs.openSync(lock,'wx');
    const temporary=absolute+'.tmp-'+process.pid;
    try{
      fs.writeFileSync(temporary,json,{flag:'wx'});
      fs.renameSync(temporary,absolute);
    }finally{
      if(fs.existsSync(temporary))fs.unlinkSync(temporary);
      fs.closeSync(fd);
      fs.unlinkSync(lock);
    }
    process.stdout.write(JSON.stringify({
      schema:result.schema,attempts:result.attempts,
      archive:dest,competitiveQualifiedGames:0
    })+'\n');
  }else{
    process.stdout.write(json);
  }
}
module.exports={classifyConditionalProbe,auditHistoricalTrial,runHistorical};
