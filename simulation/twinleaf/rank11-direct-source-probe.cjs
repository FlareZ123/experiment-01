'use strict';

const assert = require('node:assert/strict');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {runMatch} = require('./headless.cjs');
const {withRank11DirectBoostShake} = require('./rank11-direct-boostshake.cjs');
const {seedFrame} = require('./rank11-source-seeds.cjs');

/**
 * Prospectively fixed, original-deal search. Every seed is retained, including
 * no-opportunity, aborted and source-first/candidate-first games. A selected
 * line is a mechanical witness, not a qualified opponent decision policy.
 * @param {number} [count]
 * @returns {object}
 */
function run(count = 32, seedProtocol = 'legacy-consecutive-v1') {
  assert(Number.isInteger(count) && count > 0 && count <= 128);
  const plan = planAichi(1,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const opponent = plan.opponents.find(deck => deck.rank === 11);
  assert.equal(opponent?.status,'ready');
  assert.equal(opponent.cards.length,60);
  assert.equal(plan.candidate.cards.length,60);
  const trials = [];
  const seeds = seedFrame(count, seedProtocol);
  for (let i=0;i<count;i+=1) {
    const seed=seeds[i];
    const game=withRank11DirectBoostShake(0,() => runMatch({
      deckA:opponent.cards,deckB:plan.candidate.cards,seed,
      label:'rank11-direct-source-probe-v1',maxActions:48,
      strictPromptValidation:true,forestSealSearchCorrection:true,
      battleCompressorPositiveSelectionCorrection:true,
      isolatePolicyRandomness:true
    }));
    trials.push({
      seed,firstTurnSlot:game.result.firstTurnSlot,
      sourceOpportunity:game.policyAudit.opportunityTurn,
      selectedRoute:game.policyAudit.route,
      selectedTool:game.policyAudit.selectedTool,
      selectedActions:game.policyAudit.actions,
      aborted:game.policyAudit.aborted,
      nextTurnLockWitness:game.policyAudit.nextTurnLockWitness,
      completed:game.policyAudit.completed,
      engineFinished:game.result.finished,
      qualifiedForCompetitiveInference:false
    });
  }
  return {
    study:'source-first-or-second authentic rank11 direct Boost Shake coverage',
    sourceRank:11,candidateRank:1,actualEnginePin:plan.engineRevision,
    sourceManifest:plan.manifestDigest,referenceCandidate:plan.candidateDigest,
    seedProtocol, seedFrame:seeds,
    declaredMaxRootActions:48,actualTrialCount:trials.length,
    startSlotCounts:{
      slot0:trials.filter(t=>t.firstTurnSlot===0).length,
      slot1:trials.filter(t=>t.firstTurnSlot===1).length,
      unobserved:trials.filter(t=>t.firstTurnSlot===null).length
    },
    opportunities:trials.filter(t=>t.sourceOpportunity!==null).length,
    completed:trials.filter(t=>t.completed).length,
    aborts:trials.filter(t=>t.aborted).length,
    trials,qualifiedForCompetitiveInference:false
  };
}
if (require.main === module) {
  process.stdout.write(JSON.stringify(run(Number(process.env.TRIALS || 32),
    process.env.SEED_PROTOCOL || 'legacy-consecutive-v1'),null,2)+'\n');
}
module.exports={run};
