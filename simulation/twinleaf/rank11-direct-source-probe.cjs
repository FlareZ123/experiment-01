'use strict';

const assert = require('node:assert/strict');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {runMatch} = require('./headless.cjs');
const {withRank11DirectBoostShake} = require('./rank11-direct-boostshake.cjs');
const {seedFrame} = require('./rank11-source-seeds.cjs');
const {verifyActiveEvolution} = require('./agent39-active-boostshake-store-control.cjs');

/**
 * Prospectively fixed, original-deal search. Every seed is retained, including
 * no-opportunity, aborted and source-first/candidate-first games. A selected
 * line is a mechanical witness, not a qualified opponent decision policy.
 * @param {number} [count]
 * @returns {object}
 */
function run(count = 32, seedProtocol = 'legacy-consecutive-v1', sourceSeat = 0) {
  assert(Number.isInteger(count) && count > 0 && count <= 128);
  assert([0,1].includes(sourceSeat));
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
    let game;
    try {
      game=withRank11DirectBoostShake(sourceSeat,() => runMatch({
      deckA:sourceSeat===0 ? opponent.cards : plan.candidate.cards,
      deckB:sourceSeat===1 ? opponent.cards : plan.candidate.cards,seed,
      label:'rank11-direct-source-probe-v1',maxActions:48,
      strictPromptValidation:true,forestSealSearchCorrection:true,
      battleCompressorPositiveSelectionCorrection:true,
      isolatePolicyRandomness:true
      }));
    } catch(error) {
      // Preserve every originally registered deal even if the native Store
      // rejects a prompt or the generic bot fails. Do not replace its seed.
      trials.push({seed,firstTurnSlot:null,sourceActuallyFirst:null,
        sourceOpportunity:null,selectedRoute:null,selectedTool:null,
        selectedActions:[],aborted:null,nextTurnLockWitness:null,
        completed:false,engineFinished:false,
        engineError:{name:error.name,message:error.message},
        qualifiedForCompetitiveInference:false});
      continue;
    }
    trials.push({
      seed,firstTurnSlot:game.result.firstTurnSlot,
      sourceActuallyFirst:game.result.firstTurnSlot===sourceSeat,
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
  // Prove the missing Active target in the real Store after the sampled games,
  // without consuming or modifying the original game RNG and seed frame.
  const nativeActiveControls = [verifyActiveEvolution(0),verifyActiveEvolution(1)];
  return {
    nativeActiveControls,
    study:'source-first-or-second authentic rank11 direct Boost Shake coverage',
    sourceRank:11,candidateRank:1,sourcePhysicalSeat:sourceSeat,
    actualEnginePin:plan.engineRevision,
    sourceManifest:plan.manifestDigest,referenceCandidate:plan.candidateDigest,
    seedProtocol, seedFrame:seeds,
    declaredMaxRootActions:48,actualTrialCount:trials.length,
    startSlotCounts:{
      slot0:trials.filter(t=>t.firstTurnSlot===0).length,
      slot1:trials.filter(t=>t.firstTurnSlot===1).length,
      unobserved:trials.filter(t=>t.firstTurnSlot===null).length
    },
    sourceActualFirstCount:trials.filter(t=>t.sourceActuallyFirst).length,
    opportunities:trials.filter(t=>t.sourceOpportunity!==null).length,
    nativeExceptions:trials.filter(t=>t.engineError).length,
    completed:trials.filter(t=>t.completed).length,
    aborts:trials.filter(t=>t.aborted).length,
    trials,qualifiedForCompetitiveInference:false
  };
}
if (require.main === module) {
  process.stdout.write(JSON.stringify(run(Number(process.env.TRIALS || 32),
    process.env.SEED_PROTOCOL || 'legacy-consecutive-v1',
    Number(process.env.RANK11_SOURCE_SEAT || '0')),null,2)+'\n');
}
module.exports={run};
