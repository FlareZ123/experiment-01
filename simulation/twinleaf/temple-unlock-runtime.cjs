'use strict';
const assert = require('node:assert/strict');
const candidate = require('../../results/aichi-2026/candidate-temple-shadow-rider.json');
const { planAichi } = require('../evaluation/aichi-pilot.cjs');
const { runMatch } = require('./headless.cjs');
const { marshadowResponsePolicyProbe } = require('./marshadow-response-policy.cjs');

/** @returns {object} */
function probeTempleUnlock() {
  const prepared = marshadowResponsePolicyProbe();
  assert.equal(prepared.optInChoice, 'Resetting Hole');
  assert.equal(prepared.paidApexDragonCopiedDamage, 20);
  const plan = planAichi(candidate, {
    allowEquivalentBasicEnergies: true,
    allowBasicEnergyMirrorPrintings: true,
    allowJapanesePromoHooks: true
  });
  assert.equal(plan.candidate.cards.length, 60);
  const opponent = plan.opponents.find(row => row.rank === 10);
  assert.equal(opponent.status, 'ready');
  const trials = [];
  for (const seed of [20261016, 20261103]) {
    for (const regidragoSeat of [0, 1]) {
      for (const unlock of [false, true]) {
        const cards = [opponent.cards, plan.candidate.cards];
        const game = runMatch({
          deckA: cards[regidragoSeat], deckB: cards[1 - regidragoSeat],
          seed, maxActions: 600, isolatePolicyRandomness: true,
          supporterDecisionCorrection: true, doubleDragonRecovery: true,
          ...(unlock ? { templeUnlockRecovery: true } : {}),
          label: 'Temple candidate vs exact rank 10, opt-in policy'
        });
        const regAttacks = game.attackTrace.filter(t => t.seat === regidragoSeat);
        trials.push({
          seed, regidragoSeat, unlock,
          finished: game.finished, turns: game.turns, actions: game.actions,
          actuallyWentFirst: game.firstTurnSlot === regidragoSeat,
          verifiedByDrawLog: game.verifiedByDrawLog,
          templePlays: game.cardsPlayedBySeat[1 - regidragoSeat]['Temple of Sinnoh'] || 0,
          marshadowResettingHole: game.abilityTrace.filter(a =>
            a.seat === regidragoSeat && a.name === 'Resetting Hole').length,
          regidragoApexAttacks: regAttacks.filter(t => t.attack === 'Apex Dragon').length,
          opponentTotalAttacks: game.attackTrace.filter(t => t.seat !== regidragoSeat).length,
          policy: game.policy, deckHashes: game.deckHashes
        });
      }
    }
  }
  return {
    scope:'Synthetic legal Apex unlock, plus authentic Temple challenger and rank10 four seed-seat pairs',
    engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    prepared, candidateDigest:plan.candidateDigest, manifestDigest:plan.manifestDigest,
    trials, caveat:'Weak-bot tactical characterization, no paper match-win estimate'
  };
}
if(require.main===module)console.log(JSON.stringify(probeTempleUnlock(),null,2));
module.exports={probeTempleUnlock};
