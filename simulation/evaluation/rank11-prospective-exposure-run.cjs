'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {loadCampaignInputs,verifyCampaign}=
  require('./aichi-campaign-runner.cjs');
const {loadDefaultCampaign,canonicalCards}=
  require('../../scripts/aichi-comparison-campaign.cjs');
const {planAichi}=require('./aichi-pilot.cjs');
const {
  pinnedFileBlobs,makeRank11ExposureFrame,auditRank11Exposure
}=require('../../scripts/rank11-prospective-exposure.cjs');
const {runWithResearchProfile,RANK11_AUTONOMOUS_PROFILE}=
  require('../twinleaf/policy-profiles.cjs');
const registered=require('../../results/aichi-2026/registrations/rank11-prospective-exposure-v1-20261018.json');

/** @param {unknown} rows @returns {string} */
function sha256(rows){
  return createHash('sha256').update(JSON.stringify(rows)).digest('hex');
}

/**
 * A fixed, pre-outcome partition of the independently committed 64 trials.
 * Four contiguous repetitions form one partition (16 games); no trial may
 * be selected using observed starting order, hand, lock, or terminal result.
 *
 * @param {{partition?:number,maxActions?:number,play?:(request:object)=>object,
 *   resolveCandidate?:(candidate:object)=>object}} options
 * @returns {object}
 */
function executeRank11ExposurePartition(options={}){
  const partition=options.partition??0;
  const maxActions=options.maxActions??90;
  if(!Number.isInteger(partition)||partition<0||partition>3 ||
     !Number.isInteger(maxActions)||maxActions<1||maxActions>300){
    throw new Error('A predeclared partition 0..3 and 1..300 actions required');
  }
  const inputs=loadCampaignInputs();
  inputs.campaign=loadDefaultCampaign('decorrelated-slots-v3');
  const campaign=verifyCampaign(inputs);
  const expected=makeRank11ExposureFrame(campaign,{
    seedBase:registered.seedBase,repeats:registered.repeats,
    fileBlobs:pinnedFileBlobs(path.resolve(__dirname,'../..'))
  });
  assert.deepEqual(registered,expected,
    'Frozen source/policy/seed registration differs from the live checkout');
  assert.equal(registered.policyProfile,RANK11_AUTONOMOUS_PROFILE);
  const planned=registered.trials.filter(trial=>
    Math.floor(trial.repeat/4)===partition);
  assert.equal(planned.length,16,'Each predeclared partition must have 16 trials');
  const candidates=new Map(inputs.candidates.map(candidate=>[candidate.id,candidate]));
  const prepare=options.resolveCandidate || (candidate=>planAichi({
    label:candidate.id,cards:candidate.cards
  },{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  }));
  const resolved=new Map();
  for(const row of registered.candidateRows){
    const candidate=candidates.get(row.id);
    assert.ok(candidate,'Missing printed 60 source '+row.id);
    assert.equal(sha256(canonicalCards(candidate.cards)),row.deckDigest,
      'Pre-registered candidate has since changed printings');
    const plan=prepare(candidate);
    const source=plan.opponents.find(x=>x.rank===11);
    assert.equal(plan.engineRevision,registered.engineRevision);
    assert.equal(plan.candidate.cards?.length,60,'Candidate resolution failed');
    assert.equal(source?.status,'ready','Rank11 source resolution failed');
    assert.equal(source.cards.length,60);
    resolved.set(row.id,{candidate:plan.candidate.cards,opponent:source.cards});
  }
  const play=options.play || (request=>
    runWithResearchProfile(request,RANK11_AUTONOMOUS_PROFILE));
  const observations=[],actionSamples=[];
  for(const trial of planned){
    const decks=resolved.get(trial.candidateId);
    const candidateA=trial.candidateEngineSlot==='A';
    const deckA=candidateA?decks.candidate:decks.opponent;
    const deckB=candidateA?decks.opponent:decks.candidate;
    const core={
      trialId:trial.trialId,seed:trial.seed,
      candidateDigest:trial.candidateDigest,
      opponentDigest:trial.opponentDigest,
      candidateEngineSlot:trial.candidateEngineSlot,
      observedPolicyProfile:registered.policyProfile,
      finished:false
    };
    const request={
      deckA,deckB,seed:trial.seed,maxActions,
      rank11SourceSeat:trial.opponentEngineSeat,
      label:trial.trialId,
      strictPromptValidation:true,
      forestSealSearchCorrection:true,
      battleCompressorPositiveSelectionCorrection:true,
      captureDecisionTrace:true
    };
    try {
      const game=play(request);
      assert.equal(game.researchPolicyProfile,registered.policyProfile,
        'Ran with wrong bot implementation');
      assert.equal(game.seed,trial.seed,'Engine changed selected seed');
      assert.equal(game.engine,'twinleafgg/'+registered.engineRevision);
      assert.deepEqual(game.deckHashes,[sha256(deckA),sha256(deckB)],
        'Live engine did not run the registered physical decks');
      const slot=candidateA?0:1;
      const sourceFirst=game.firstTurnSlot===trial.opponentEngineSeat;
      const firstResponse=(game.decisionTrace||[]).filter(entry=>
        entry.playerSlot===slot && entry.turnBefore===2).slice(0,20);
      const opponentOpening=(game.decisionTrace||[]).filter(entry=>
        entry.playerSlot===trial.opponentEngineSeat &&
        entry.turnBefore===1).slice(0,24);
      observations.push({
        ...core,status:game.finished?'engine-terminal':'action-capped',
        finished:game.finished,firstTurnSlot:game.firstTurnSlot,
        verifiedByDrawLog:game.verifiedByDrawLog,
        sourcePolicyAudit:game.rank11AutonomousPolicy||null,
        // A decision trace alone does not prove a strategically legal response.
        candidateResponse:{playerSlot:slot,turnBefore:2,
          legalStateTransitionWitness:false},
        actionCount:game.actions,turns:game.turns
      });
      actionSamples.push({
        trialId:trial.trialId,
        actualSourceFirst:sourceFirst,
        firstTurnLogVerified:game.verifiedByDrawLog,
        sourceOpeningDecisions:opponentOpening,
        candidateGlobalTurn2Decisions:firstResponse,
        sourceCompletedLock:game.rank11AutonomousPolicy
          ?.completeAtDecisionBoundary===true,
        semanticAndCompetenceReview:'not-performed',
        engineReportedTerminalWinnerForDiagnosticsOnly:
          game.finished?game.winner:null
      });
    }catch(error){
      observations.push({
        ...core,status:'engine-exception',
        verifiedByDrawLog:false,
        error:String(error?.stack||error)
      });
      actionSamples.push({
        trialId:trial.trialId,
        status:'engine-exception',
        note:'Preserved failed attempt; no invented starting order or outcome'
      });
    }
  }
  const audit=auditRank11Exposure(registered,observations);
  assert.equal(audit.received,16);
  assert.equal(audit.scheduled,64);
  return {
    study:'precommitted actual-start rank11 autonomous lock exposure',
    engineRevision:registered.engineRevision,
    fixedRegistrationSha256:registered.frameSha256,
    executedPartition:partition,
    partitionRange:[partition*4,partition*4+3],
    actionCapPerTrial:maxActions,
    phase:'diagnostic-only',
    currentSourceResearchRevision:process.env.GITHUB_SHA||null,
    observedTrialCount:observations.length,
    totalRegisteredTrialCount:registered.trials.length,
    observations,actionSamples,audit,
    independentlyQualifiedCompetitiveGames:0,
    warning:'No game is qualified as competitive. All 64 declared seeds remain in the schedule, including attempts outside this partition.'
  };
}

if(require.main===module){
  const partition=Number(process.env.RANK11_EXPOSURE_PARTITION||0);
  process.stdout.write(JSON.stringify(
    executeRank11ExposurePartition({partition}),null,2)+'\n');
}
module.exports={executeRank11ExposurePartition};
