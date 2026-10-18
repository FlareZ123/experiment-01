'use strict';
const assert = require('node:assert/strict');
const {planAichi} = require('./aichi-pilot.cjs');
const {loadNewMoonCandidate} = require('../../scripts/aichi-new-moon-candidate.cjs');
const {EXPANDED_PROFILE,runWithResearchProfile} =
  require('../twinleaf/policy-profiles.cjs');

const CASES = Object.freeze([
  {candidateSeat:0,seed:747246684,priorActions:327,priorTurns:52,priorOwnAttacks:9},
  {candidateSeat:1,seed:83934472,priorActions:306,priorTurns:50,priorOwnAttacks:0}
]);

/** @param {object} result @returns {object} */
function stableRecord(result) {
  return {
    finished:result.finished,winner:result.winner,
    turns:result.turns,actions:result.actions,
    firstTurnSlot:result.firstTurnSlot,
    deckHashes:result.deckHashes,
    prizesRemaining:result.prizesRemaining,
    actionCounts:result.actionCounts,
    attackTrace:result.attackTrace,
    decisionTrace:result.decisionTrace.map(row=>{
      const {attackPassProbe,...untouched}=row;
      return untouched;
    })
  };
}

/**
 * Reproduce the two unqualified source rank11 generic-policy trajectories,
 * then opt in to cloned, post-choice printed attack-announcement probes.
 * Existing choices and hidden cards are never exposed to the bot.
 * @returns {object}
 */
function run() {
  const source = loadNewMoonCandidate();
  const plan = planAichi({label:source.id,cards:source.cards},{
    allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true,
    allowBasicEnergyMirrorPrintings:true
  });
  const opp = plan.opponents.find(d=>d.rank===11);
  assert.equal(opp?.status,'ready');
  assert.equal(plan.candidate.cards.length,60);
  const rows=[];
  for(const entry of CASES) {
    const ownA=entry.candidateSeat===0;
    const request={
      deckA:ownA?plan.candidate.cards:opp.cards,
      deckB:ownA?opp.cards:plan.candidate.cards,
      seed:entry.seed,
      label:'newmoon-rank11-post-choice-pass:'+entry.candidateSeat,
      maxActions:800,
      strictPromptValidation:true,isolatePolicyRandomness:true,
      forestSealSearchCorrection:false,
      attachedToolPowerPolicy:false,postSuperAliasRepairIsolation:false,
      captureDecisionTrace:true
    };
    const ordinary=runWithResearchProfile(request,EXPANDED_PROFILE);
    const observed=runWithResearchProfile({
      ...request,captureAttackPassProbes:true
    },EXPANDED_PROFILE);
    assert.deepEqual(stableRecord(ordinary),stableRecord(observed),
      'Probe changed natural actions or source-dealt game outcome');
    assert.equal(ordinary.actions,entry.priorActions,
      'Archived action count drift under supposedly frozen policy');
    assert.equal(ordinary.turns,entry.priorTurns,
      'Archived turn count drift');
    const ownAttacks=ordinary.attackTrace.filter(a=>a.seat===entry.candidateSeat);
    assert.equal(ownAttacks.length,entry.priorOwnAttacks,
      'Archived candidate attack count drift');
    const passObservations=observed.decisionTrace.filter(row=>
      row.playerSlot===entry.candidateSeat && row.attackPassProbe)
      .map(row=>({
        turn:row.turnBefore,
        active:row.attackPassProbe.activePokemon,
        visibleAttacks:row.attackPassProbe.tested,
        auditError:row.attackPassProbe.auditError || null
      }));
    rows.push({
      sourceRank:11,candidate:source.id,
      seat:entry.candidateSeat,seed:entry.seed,
      actualFirstTurnSlot:ordinary.firstTurnSlot,
      archivedNaturalReplayMatches:true,
      observationalNoninterference:true,
      candidateAttackCount:ownAttacks.length,
      candidatePassedTurns:ordinary.decisionTrace.filter(row=>
        row.playerSlot===entry.candidateSeat && row.action==='PassTurnAction').length,
      candidatePassProbes:passObservations,
      totalAllSeatProbedPasses:observed.decisionTrace.filter(row=>
        row.attackPassProbe).length
    });
  }
  return {
    schema:'newmoon-rank11-postchoice-attack-pass-source-v1',
    engineRevision:plan.engineRevision,
    englishProxyIDCountHash:source.proxyIdCountHash,
    profile:EXPANDED_PROFILE,
    scope:'cloned printed-attack announcements after bot already chose Pass; limited to 4 early printed and 4 Tool passes across seats',
    paperLegalityVerified:false,
    competitiveStrengthCertified:false,
    rows
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,CASES};
