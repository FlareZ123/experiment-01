'use strict';

const assert = require('node:assert/strict');
const {planAichi} = require('./aichi-pilot.cjs');
const {loadNewMoonCandidate} = require('../../scripts/aichi-new-moon-candidate.cjs');
const {
  runWithResearchProfile, RANK11_AUTONOMOUS_PROFILE,
  RANK11_SUPPORTER_PROFILE
} = require('../twinleaf/policy-profiles.cjs');

const SOURCE_FIRST_SEED = 1244180408;
const SOURCE_SEAT = 0;
const CANDIDATE_SEAT = 1;
const MAX_ACTIONS = 450;

/** @param {object} row @returns {object} */
function projectedDecision(row) {
  return {
    turn:row.turnBefore, actor:row.playerSlot, action:row.action,
    card:row.card ?? null, ability:row.ability ?? null,
    attack:row.attack ?? null,
    selected:row.cardSelection?.selectedCards ?? null
  };
}

/** @param {object} game @returns {object} */
function summarize(game) {
  const actions=game.decisionTrace.map(projectedDecision);
  return {
    effectiveProfile:game.researchPolicyProfile,
    reportedPolicy:game.policy,
    supporterCorrection:game.supporterDecisionCorrection,
    sourceAudit:game.rank11AutonomousPolicy,
    trueFirstSeat:game.firstTurnSlot,
    firstDrawVerified:game.verifiedByDrawLog,
    finished:game.finished,winner:game.winner,
    endReason:game.endReason,actions:game.actions,turns:game.turns,
    prizes:game.prizesRemaining,
    sourcePlayed:game.cardsPlayedBySeat[SOURCE_SEAT],
    candidatePlayed:game.cardsPlayedBySeat[CANDIDATE_SEAT],
    sourceOpening:actions.filter(row=>row.turn===1 && row.actor===SOURCE_SEAT),
    firstCandidateResponse:actions.filter(row=>
      row.turn===2 && row.actor===CANDIDATE_SEAT),
    nextSourceTurn:actions.filter(row=>row.turn===3 && row.actor===SOURCE_SEAT),
    nextCandidateTurn:actions.filter(row=>row.turn===4 && row.actor===CANDIDATE_SEAT),
    attackDeclarationProtocol:game.attackDeclarationTraceProtocol,
    attacks:(game.attackDeclarationTrace||[]).map(row=>({
      source:row.playerSlot===SOURCE_SEAT?'rank11':'candidate',
      actionOrdinal:row.actionOrdinal,turn:row.turnBefore,
      attackName:row.attackName,trigger:row.triggerAction,
      resolutionStatus:row.resolutionStatus
    })),
    nativeAttacks:game.attackTrace.map(row=>({
      seat:row.seat,turn:row.turn,attack:row.attack
    })),
    decisionCount:actions.length
  };
}

/** @returns {object} */
function run() {
  const proposal=loadNewMoonCandidate();
  const plan=planAichi({label:proposal.id,cards:proposal.cards},{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const rank11=plan.opponents.find(row=>row.rank===11);
  assert.equal(rank11?.status,'ready');
  const request={
    deckA:rank11.cards,deckB:plan.candidate.cards,
    seed:SOURCE_FIRST_SEED,maxActions:MAX_ACTIONS,
    rank11SourceSeat:SOURCE_SEAT,
    strictPromptValidation:true,forestSealSearchCorrection:true,
    battleCompressorPositiveSelectionCorrection:true,
    isolatePolicyRandomness:true,captureDecisionTrace:true,
    label:'same-deal-source11-newmoon-versioned-supporter-composition'
  };
  const control=runWithResearchProfile(request,RANK11_AUTONOMOUS_PROFILE);
  const combined=runWithResearchProfile(request,RANK11_SUPPORTER_PROFILE);
  for(const game of [control,combined]) {
    assert.equal(game.firstTurnSlot,SOURCE_SEAT);
    assert.equal(game.verifiedByDrawLog,true);
    assert.equal(game.rank11AutonomousPolicy?.completeAtDecisionBoundary,true);
  }
  assert.deepEqual(control.deckHashes,combined.deckHashes);
  assert.equal(control.supporterDecisionCorrection,false);
  assert.equal(combined.supporterDecisionCorrection,true);
  const oldActions=control.decisionTrace.map(projectedDecision);
  const newActions=combined.decisionTrace.map(projectedDecision);
  const count=Math.min(oldActions.length,newActions.length);
  let firstDifferentIndex=null;
  for(let i=0;i<count;i++) {
    if(JSON.stringify(oldActions[i])!==JSON.stringify(newActions[i])) {
      firstDifferentIndex=i;
      break;
    }
  }
  if(firstDifferentIndex===null && oldActions.length!==newActions.length) {
    firstDifferentIndex=count;
  }
  const firstDivergence=firstDifferentIndex===null ? null : {
    decisionIndex:firstDifferentIndex,
    baseline:oldActions[firstDifferentIndex] ?? null,
    combined:newActions[firstDifferentIndex] ?? null
  };
  return {
    schema:'rank11-source-first-autonomous-plus-supporter-same-deal-v1',
    scope:'Single selected actual source-first printed-60 deal. Decision-policy counterfactual only.',
    seed:SOURCE_FIRST_SEED,sourceRank:11,sourceSeat:SOURCE_SEAT,
    candidate:proposal.id,candidateSeat:CANDIDATE_SEAT,
    sourceManifestDigest:plan.manifestDigest,
    candidateDigest:plan.candidateDigest,
    opponentDigest:rank11.canonicalDigest || null,
    deckHashes:control.deckHashes,
    pinnedEngine:plan.engineRevision,
    maxActions:MAX_ACTIONS,
    unchangedSourceFirstTurn:JSON.stringify(summarize(control).sourceOpening)===
      JSON.stringify(summarize(combined).sourceOpening),
    firstDivergence,
    control:summarize(control),combined:summarize(combined),
    experimentallyCompetent:false,paperClockModeled:false,
    competitivelyQualifiedGames:0,
    caution:'A real engine log declaration is weaker than independently verified attack effects. Exact seed selected as a positive rank11 opening, not representative field sampling.'
  };
}

if(require.main===module) process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,SOURCE_FIRST_SEED,projectedDecision};
