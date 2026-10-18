'use strict';

const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {loadNewMoonCandidate} = require('../../scripts/aichi-new-moon-candidate.cjs');
const {runMatch} = require('./headless.cjs');
const {withVIP} = require('./rank11-newmoon-first-vip-counterfactual.cjs');
const {withFarewellBeforeVip} =
  require('./newmoon-farewell-vip-bench-policy.cjs');
const {withNewMoonBenchReservation} =
  require('./newmoon-bench-reservation-policy.cjs');
const {withRank11DirectBoostShake} = require('./rank11-direct-boostshake.cjs');

const SEED = 2809154458; // Retrospectively selected, explicitly not a win sample.
/** @param {object} x */
const digest = x => createHash('sha256')
  .update(JSON.stringify(x)).digest('hex');

/**
 * A matched source-dealt first-turn capacity fork:
 *
 * Control: same accepted Mewtwo + Gengar VIP action from Agent 2's report.
 * Alternative: try up to two engine-validated, unattached Bench Unown
 * Farewell Letter Abilities before the SAME VIP wrapper. No fabricated cards,
 * hidden deck reads, forced abilities, or post-deal board injections.
 *
 * This is a retrospective mechanical/policy counterfactual. It is not a
 * prospective trial, a demonstration of improved strength, or game evidence.
 *
 * @returns {object} Failure-inclusive paired diagnostic.
 */
function run(includeReservation = false) {
  const proposal = loadNewMoonCandidate();
  const plan = planAichi({label:proposal.id, cards:proposal.cards}, {
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const rank11 = plan.opponents.find(row => row.rank === 11);
  assert.equal(rank11?.status, 'ready');
  const deckHashes = [digest(rank11.cards),digest(plan.candidate.cards)];
  const common = {
    deckA:rank11.cards,deckB:plan.candidate.cards,seed:SEED,
    maxActions:110,strictPromptValidation:true,
    forestSealSearchCorrection:true,
    battleCompressorPositiveSelectionCorrection:true,
    isolatePolicyRandomness:true,captureDecisionTrace:true
  };

  /**
   * @param {boolean} enabled Farewell-first policy active.
   * @param {boolean} [reserve] Preserve open slots after the actual VIP.
   */
  function arm(enabled,reserve=false) {
    try {
      const play=()=>runMatch({...common,
        label:'rank11-first-farewell-vip:'+enabled+':reserve:'+reserve});
      const inner=()=>reserve ?
        withNewMoonBenchReservation(play,1) : {result:play(),audit:null};
      const outer=withRank11DirectBoostShake(0,()=>withVIP(
        ()=>withFarewellBeforeVip(inner,{enabled,candidateSeat:1}),true));
      const vip=outer.result;
      const farewell=vip.game;
      const reservation=farewell.result;
      const game=reservation.result;
      assert.deepEqual(game.deckHashes,deckHashes);
      assert.equal(game.engine,'twinleafgg/'+plan.engineRevision);
      assert.equal(game.firstTurnSlot,1);
      assert.equal(game.verifiedByDrawLog,true);
      return {
        status:'engine-observed',enabled,reserve,
        firstTurnSlot:game.firstTurnSlot,deckHashes:game.deckHashes,
        firstOwnerDecision:farewell.audit.opening,
        farewellAudit:farewell.audit,vipAudit:vip.audit,
        reservationAudit:reservation.audit,
        rank11PolicyAudit:outer.policyAudit,
        firstCandidateTurn:game.decisionTrace.filter(row =>
          row.playerSlot===1 && row.turnBefore===1),
        nextCandidateTurn:game.decisionTrace.filter(row =>
          row.playerSlot===1 && row.turnBefore===3),
        executedFarewell:game.abilityTrace.filter(row =>
          row.seat===1 && row.name==='Farewell Letter'),
        candidateAttackDeclarations:game.attackDeclarationTrace.filter(row =>
          row.playerSlot===1),
        actions:game.actions,turns:game.turns,finished:game.finished,
        endReason:game.endReason,prizesRemaining:game.prizesRemaining,
        qualifiedForCompetitiveInference:false
      };
    } catch (error) {
      return {status:'engine-or-policy-exception',enabled,reserve,
        error:String(error?.stack || error),
        qualifiedForCompetitiveInference:false};
    }
  }

  const baseline=arm(false);
  const farewellFirst=arm(true);
  const failures=[baseline,farewellFirst].filter(row =>
    row.status!=='engine-observed').length;
  let initialOwnerInformationIdentical=null;
  if (!failures) {
    initialOwnerInformationIdentical = JSON.stringify(baseline.firstOwnerDecision) ===
      JSON.stringify(farewellFirst.firstOwnerDecision);
    if (!initialOwnerInformationIdentical) {
      throw new Error('Source first-owner decision changed across intervention arms');
    }
  }
  return {
    schema:'rank11-newmoon-farewell-vip-source-pair-v1',
    date:'2026-10-18',candidate:proposal.id,
    candidatePrintingStatus:'provisional-English-mechanics-proxy',
    sourceRank:11,sourceSeat:0,candidateSeat:1,
    retrospectiveSourceSeed:SEED,pinnedEngine:plan.engineRevision,
    source60Digest:deckHashes[0],candidate60Digest:deckHashes[1],
    initialOwnerInformationIdentical, failures,
    baseline,farewellFirst,qualifiedCompetitiveGames:0,
    limitations:'One selected real source deal. This isolates a live first-turn ability/Bench-capacity choice, not policy optimality, complete printed effect equivalence or a representative game win probability.'
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
}
module.exports={run,SEED};
