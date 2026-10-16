'use strict';

const assert = require('node:assert/strict');
const candidate = require('../../results/aichi-2026/candidate-hood-shadow-rider.json');
const { planAichi } = require('./aichi-pilot.cjs');
const { runMatch } = require('../twinleaf/headless.cjs');
const { withHoodAwareSimpleTactics } =
  require('../twinleaf/hood-policy-variant.cjs');

/** @param {object} game @param {number} seat @returns {object} */
function limitedTrace(game, seat) {
  return {
    finished: game.finished, endReason: game.endReason,
    turns: game.turns, actions: game.actions,
    firstTurnSlot:game.firstTurnSlot,
    firstTurnVerified:game.verifiedByDrawLog,
    candidateWentFirst:game.verifiedByDrawLog ? game.firstTurnSlot === seat : null,
    candidateCardsPlayed:game.cardsPlayedBySeat[seat],
    candidateAttacks:game.attackTrace
      .filter(x => x.seat === seat)
      .map(x => ({turn:x.turn,active:x.activePokemon,attack:x.attack})),
    candidateFinalBoard:game.finalState[seat],
    candidateActionsByType:game.actionsBySeat[seat],
    opponentActionsByType:game.actionsBySeat[1-seat],
    prizesRemaining:game.prizesRemaining
  };
}

/**
 * Source-deck-paired comparison under the same random seeds and pinned engine.
 * Both policies are variants of incompetent SimpleTacticsAi; report only
 * behavioral traces, never a competitive win percentage.
 * @returns {object}
 */
function compareHoodPolicies() {
  const plan = planAichi(candidate, {
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  assert.equal(plan.candidate.cards.length,60);
  const results=[];
  for (const rank of [6,8]) {
    const opponent=plan.opponents.find(x=>x.rank===rank);
    assert.equal(opponent.status,'ready');
    for (let candidateSide=0;candidateSide<2;candidateSide++) {
      const decks=[
        candidateSide===0?plan.candidate.cards:opponent.cards,
        candidateSide===1?plan.candidate.cards:opponent.cards
      ];
      const seed=2026101715+rank*97+candidateSide;
      const request={
        deckA:decks[0],deckB:decks[1],seed,maxActions:1000,
        label:'Hood policy controlled candidate vs source rank '+rank
      };
      const generic=runMatch(request);
      const hoodAware=withHoodAwareSimpleTactics(()=>runMatch(request));
      assert.deepEqual(hoodAware.deckHashes,generic.deckHashes);
      assert.equal(generic.verifiedByDrawLog,true);
      assert.equal(hoodAware.verifiedByDrawLog,true);
      assert.equal(hoodAware.firstTurnSlot,generic.firstTurnSlot,
        'Policy must not affect coin-flip turn order');
      results.push({
        opponentRank:rank,opponentArchetype:opponent.archetype,
        candidateEngineSide:candidateSide===0?'A':'B',
        seed,engineDeckHashes:generic.deckHashes,
        baselineGeneric:limitedTrace(generic,candidateSide),
        optInHoodAware:limitedTrace(hoodAware,candidateSide)
      });
    }
  }
  return {
    kind:'Reproducible same-seed weak-policy Hood add-on comparison',
    policyAlternatives:{
      baseline:'Twinleaf SimpleTacticsAi/defaultStateScores',
      optIn:'SimpleTacticsAi with only research-owned lock-aware Arven and AttachTool subclasses'
    },
    candidateDigest:plan.candidateDigest,
    fieldManifestDigest:plan.manifestDigest,
    engineRevision:plan.engineRevision,
    cases:results,
    limitations:'4 paired seed/seat examples; no opponent decision upgrade; no valid competitiveness or win-rate inference'
  };
}
if(require.main===module)console.log(JSON.stringify(compareHoodPolicies(),null,2));
module.exports={compareHoodPolicies};
