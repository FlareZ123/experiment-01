'use strict';

const assert=require('node:assert/strict');
const candidate=require('../../results/aichi-2026/candidate-temple-shadow-rider.json');
const {planAichi,summarisePlan}=require('./aichi-pilot.cjs');
const {runMatch}=require('../twinleaf/headless.cjs');

/** Engine and generic-bot feasibility only, no competitive inference. */
function probeTempleCandidate() {
  const plan=planAichi(candidate,{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const status=summarisePlan(plan);
  assert.equal(status.candidateResolved,true,
    'Source-printed candidate must resolve as a valid 60-card engine deck');
  const opponent=plan.opponents.find(row=>row.rank===10);
  assert.equal(opponent.status,'ready');
  const games=[];
  for(const [a,b] of [[plan.candidate.cards,opponent.cards],
                       [opponent.cards,plan.candidate.cards]]) {
    const result=runMatch({
      deckA:a,deckB:b,seed:2026101613,maxActions:1000,
      label:'Temple Shadow Rider v1 vs Aichi rank 10 engine fixture'
    });
    games.push({
      candidateEngineSide:games.length===0?'A':'B',
      finished:result.finished,endReason:result.endReason,actions:result.actions,
      turns:result.turns,firstTurnSlot:result.firstTurnSlot,
      firstTurnPlayerId:result.firstTurnPlayerId,
      verifiedByDrawLog:result.verifiedByDrawLog,
      candidateWentFirst:result.firstTurnSlot===(games.length===0?0:1),
      winner:result.winner,prizesRemaining:result.prizesRemaining,
      policy:result.policy,engine:result.engine,rules:result.rules,
      deckHashes:result.deckHashes,
      attackTrace:result.attackTrace
    });
  }
  return {
    label:'candidate source and generic-bot engine feasibility; never game-win evidence',
    candidateDigest:plan.candidateDigest,
    sourceManifestDigest:plan.manifestDigest,
    sourcePrintingPermissions:plan.printEquivalencePolicy,
    sourceResolution:status,
    opponentRank:10,
    games
  };
}
if(require.main===module) console.log(JSON.stringify(probeTempleCandidate(),null,2));
module.exports={probeTempleCandidate};
