'use strict';
const assert = require('node:assert/strict');
const {planAichi} = require('./aichi-pilot.cjs');
const {loadNewMoonCandidate} = require('../../scripts/aichi-new-moon-candidate.cjs');
const {runWithResearchProfile, RANK11_AUTONOMOUS_PROFILE, EXPANDED_PROFILE} =
  require('../twinleaf/policy-profiles.cjs');

const SOURCE_FIRST_SEED = 1244180408;
const OPTIONS = Object.freeze({
  allowEquivalentBasicEnergies:true,
  allowJapanesePromoHooks:true,
  allowBasicEnergyMirrorPrintings:true
});

/** @param {object} game @param {number} candidateSeat @returns {object} */
function summarize(game,candidateSeat) {
  return {
    finished:game.finished, winnerIndex:game.winner,
    turns:game.turns, actions:game.actions,
    endReason:game.endReason,
    firstTurnSlot:game.firstTurnSlot,
    verifiedByDrawLog:game.verifiedByDrawLog,
    deckHashes:game.deckHashes,
    policy:game.policy,
    effectiveProfile:game.researchPolicyProfile,
    rank11AutonomousPolicy:game.rank11AutonomousPolicy || null,
    prizesRemaining:game.prizesRemaining,
    finalState:game.finalState,
    candidateAttacks:game.attackTrace.filter(a=>a.seat===candidateSeat)
      .map(a=>({turn:a.turn,pokemon:a.activePokemon,attack:a.attack})),
    rank11Attacks:game.attackTrace.filter(a=>a.seat!==candidateSeat)
      .map(a=>({turn:a.turn,pokemon:a.activePokemon,attack:a.attack})),
    candidatePlayedCards:game.cardsPlayedBySeat[candidateSeat],
    rank11PlayedCards:game.cardsPlayedBySeat[1-candidateSeat],
    candidateFirstDecisions:game.decisionTrace.filter(e=>e.playerSlot===candidateSeat).slice(0,20),
    sourceFirstDecisions:game.decisionTrace.filter(e=>e.playerSlot!==candidateSeat).slice(0,20)
  };
}

/**
 * Compare unchanged reference with one immutable 60-card structural challenger
 * under both a conditional opponent-first ALS profile and experimental generic
 * Expanded policy. The same real published source and seed are kept fixed.
 * One selected deal is a policy test and never evidence of matchup win rate.
 * @returns {object}
 */
function run() {
  const base = planAichi(1, OPTIONS);
  const proposal = loadNewMoonCandidate();
  const challenger = planAichi({label:proposal.id,cards:proposal.cards},OPTIONS);
  const rank11 = base.opponents.find(deck=>deck.rank===11);
  assert.equal(rank11?.status,'ready');
  assert.deepEqual(challenger.opponents.find(deck=>deck.rank===11).cards,rank11.cards);
  assert.equal(base.candidate.cards.length,60);
  assert.equal(challenger.candidate.cards.length,60);
  const rows=[];
  for(const candidate of [
    {id:'champion-reference',plan:base},
    {id:proposal.id,plan:challenger}
  ]) {
    for(const policy of [EXPANDED_PROFILE,RANK11_AUTONOMOUS_PROFILE]) {
      const request={
        deckA:rank11.cards,deckB:candidate.plan.candidate.cards,
        seed:SOURCE_FIRST_SEED,maxActions:700,
        strictPromptValidation:true,
        forestSealSearchCorrection:true,
        battleCompressorPositiveSelectionCorrection:true,
        isolatePolicyRandomness:true,
        captureDecisionTrace:true,
        label:'rank11-source-first:'+candidate.id+':'+policy,
        ...(policy===RANK11_AUTONOMOUS_PROFILE?{rank11SourceSeat:0}:{})
      };
      const result=runWithResearchProfile(request,policy);
      assert.equal(result.firstTurnSlot,0,
        'Verified source first-turn changed after candidate substitution');
      assert.equal(result.verifiedByDrawLog,true);
      assert.equal(result.researchPolicyProfile,policy);
      rows.push({
        candidateId:candidate.id,
        candidateDigest:candidate.plan.candidateDigest,
        rank11SourceRank:11,rank11SourceSeat:0,
        policy,sourceFirstSeed:SOURCE_FIRST_SEED,
        outcome:summarize(result,1)
      });
    }
  }
  return {
    schema:'rank11-newmoon-source-first-autonomous-counterpilot-v1',
    purpose:'paired exact-source policy feasibility; never competitive win rate',
    engineRevision:base.engineRevision,
    sourceManifestDigest:base.manifestDigest,
    newMoonProxyHash:proposal.proxyIdCountHash,
    candidates:rows.length/2,
    policies:[EXPANDED_PROFILE,RANK11_AUTONOMOUS_PROFILE],
    completed:rows.filter(row=>row.outcome.finished===true).length,
    strengthCertified:false,
    opponentAutonomyCertified:false,
    paperLegalityCertified:false,
    rows
  };
}

if(require.main===module) process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,SOURCE_FIRST_SEED};
