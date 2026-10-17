'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {resolveManifestFile} = require('./resolve-field.cjs');
const {runMatch} = require('./headless.cjs');

/**
 * Produce a compact diagnostic record for a bounded source-deck game.
 * Only action/exposure observations are recorded; no competitive inference.
 *
 * @param {object} game
 * @param {number} candidateSlot
 * @returns {object}
 */
function summarize(game, candidateSlot) {
  return {
    simulatorProfile: game.prototypeSafeSimulatorIsolation ? 'prototype-safe' : 'pinned',
    verifiedByDrawLog: game.verifiedByDrawLog,
    actualFirstTurnSlot: game.firstTurnSlot,
    rank10ActualTurn: game.firstTurnSlot === candidateSlot ? 'first' : 'second',
    finished: game.finished,
    endReason: game.endReason,
    actions: game.actions,
    turns: game.turns,
    candidateDoubleDragonPlayed:
      game.cardsPlayedBySeat[candidateSlot]['Double Dragon Energy'] || 0,
    candidateApexAttacks: game.attackTrace
      .filter(action => action.seat === candidateSlot &&
        action.attack === 'Apex Dragon').length,
    candidateTotalAttacks: game.attackTrace
      .filter(action => action.seat === candidateSlot).length,
    opponentTotalAttacks: game.attackTrace
      .filter(action => action.seat !== candidateSlot).length,
    candidateFinalPrizes: game.prizesRemaining[candidateSlot],
    opponentFinalPrizes: game.prizesRemaining[1 - candidateSlot],
    policy: game.policy,
    deckHashes: game.deckHashes
  };
}

/**
 * Frozen, paired source-deck Regidrago v4 policy and clone-fidelity exposure.
 * Opponent and bot remain experimental. The outputs are diagnostic and are
 * explicitly prohibited from being treated as competitive win-rate evidence.
 *
 * @returns {object}
 */
function checkCloneSensitivityBySeat() {
  const field = resolveManifestFile(
    path.resolve(__dirname, '../../results/aichi-2026/full-decklists.json'),
    {allowEquivalentBasicEnergies: true, allowJapanesePromoHooks: true}
  );
  const decks = new Map(field.decks.map(deck => [deck.rank, deck]));
  const rank10 = decks.get(10), champion = decks.get(1);
  assert.ok(rank10?.playableUnderEngine && champion?.playableUnderEngine);
  const cases = [];
  for (const {candidateSlot, seed} of [
    {candidateSlot: 0, seed: 3162592764},
    {candidateSlot: 1, seed: 4246551499}
  ]) {
    const request = {
      deckA: candidateSlot === 0 ? rank10.cardIds : champion.cardIds,
      deckB: candidateSlot === 0 ? champion.cardIds : rank10.cardIds,
      seed, maxActions: 350,
      label: 'rank10-DDE-v4-simulator-profile-sensitivity',
      doubleDragonRecovery: true,
      isolatePolicyRandomness: true
    };
    const pinned = runMatch(request);
    const safe = runMatch({...request, prototypeSafeSimulatorIsolation: true});
    assert.deepEqual(pinned.deckHashes, safe.deckHashes);
    assert.equal(pinned.seed, safe.seed);
    assert.equal(pinned.verifiedByDrawLog, true);
    assert.equal(safe.verifiedByDrawLog, true);
    assert.equal(pinned.firstTurnSlot, safe.firstTurnSlot,
      'Cloning modes must not silently reassign who actually started');
    assert.match(pinned.policy, /DoubleDragonAttachTactic-v4/);
    assert.match(safe.policy, /DoubleDragonAttachTactic-v4/);
    assert.match(safe.policy, /PrototypeSafeSimulatorIsolation-experimental-v1/);
    cases.push({
      candidateSlot, seed, exactSourceRanksBySlot:
        candidateSlot === 0 ? [10,1] : [1,10],
      pinned: summarize(pinned, candidateSlot),
      prototypeSafe: summarize(safe, candidateSlot),
      sameActionCount: pinned.actions === safe.actions,
      sameAttackCounts: pinned.attackTrace.length === safe.attackTrace.length
    });
  }
  return {
    kind: 'rank10-DDE-v4-pinned-vs-prototype-safe-two-seat-diagnostic',
    sourceRank10: 'Haruku Yoshioka Regidrago',
    sourceRank1: 'Yasunori Kato Shadow Rider Calyrex',
    policy: 'DoubleDragonAttachTactic-v4, weak default bot otherwise',
    sourceDecksUnchanged: true,
    engine: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    cases,
    caveat: 'Bounded two-deal source-deck execution checks and observable action counts. Neither engine continuation, clone compatibility nor a finished game implies realistic competitive policy or a matchup win probability.'
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(checkCloneSensitivityBySeat(), null, 2) + '\n');
}
module.exports = {summarize, checkCloneSensitivityBySeat};
