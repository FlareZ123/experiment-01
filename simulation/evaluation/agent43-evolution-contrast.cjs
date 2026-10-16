'use strict';

const assert=require('node:assert/strict');
const {planAichi}=require('./aichi-pilot.cjs');
const {runMatch}=require('../twinleaf/headless.cjs');
const {runShadowRiderEvolutionCounterfactual}=
  require('../twinleaf/shadow-rider-evolution-runner.cjs');

const PIN='twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

/** @param {object} r @returns {object} */
function summarize(r) {
  return {
    seed:r.seed,finished:r.finished,actions:r.actions,turns:r.turns,
    endReason:r.endReason,winner:r.winner,
    prizes:r.prizesRemaining,deckHashes:r.deckHashes,
    shadowVMAXPlayed:r.cardsPlayedBySeat.map(by=>
      by['Shadow Rider Calyrex VMAX']||0),
    shadowAttacks:r.attackTrace.filter(e=>
      e.activePokemon==='Shadow Rider Calyrex VMAX').length,
    proposals:r.experimentalEvolutionProposals||[],
    policy:r.policy,terminalTransition:r.terminalTransition
  };
}

/**
 * Paired bounded policy feasibility, one opponent, two physical seats, two
 * seeded starts. Not a competitive game-win or general performance estimate.
 * @returns {object}
 */
function contrast() {
  const plan=planAichi(1,{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const opponent=plan.opponents.find(x=>x.rank===10);
  assert.ok(plan.candidate.cards && opponent?.cards,
    'Missing source-resolved rank1/rank10 engine decks');
  const flags={
    maxActions:400,strictPromptValidation:true,
    isolatePolicyRandomness:true,
    supporterDecisionCorrection:true,
    leleEntryAbilityLockCorrection:true,
    radiantGateLockCorrection:true,
    shadowRiderEnergyAcrossField:true,
    captureDecisionTrace:true
  };
  const trials=[];
  for(const seed of [2026101643,2026101644]) {
    for(const candidateSeat of [0,1]) {
      const req={
        ...flags,seed,label:'Agent43 evolution opportunity diagnostic',
        deckA:candidateSeat===0?plan.candidate.cards:opponent.cards,
        deckB:candidateSeat===1?plan.candidate.cards:opponent.cards
      };
      try {
        const baseline=runMatch(req);
        const experimental=runShadowRiderEvolutionCounterfactual(req);
        const common=baseline.deckHashes.every((hash,i)=>
          hash===experimental.deckHashes[i]);
        assert.ok(common,'Baseline and counterfactual deck hashes differ');
        trials.push({
          seed,candidateSeat,status:'bounded-engine-feasibility',
          baseline:summarize(baseline),experimental:summarize(experimental)
        });
      } catch(error) {
        trials.push({seed,candidateSeat,status:'engine-or-policy-blocker',
          reason:String(error?.message||error)});
      }
    }
  }
  return {
    purpose:'Observe counterfactual evolution choices only, not win-rate evidence',
    engine:PIN,source:plan.source,manifestDigest:plan.manifestDigest,
    candidateDigest:plan.candidateDigest,
    opponentRank:10,opponentArchetype:opponent.archetype,
    printEquivalencePolicy:plan.printEquivalencePolicy,
    actualPairCount:trials.length,trials
  };
}
if(require.main===module) process.stdout.write(JSON.stringify(contrast(),null,2)+'\n');
module.exports={summarize,contrast};
