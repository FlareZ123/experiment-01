'use strict';
const assert = require('node:assert/strict');

const SCHEMA = 'agent1-rank17-actor-compressor-bridge-prospective-v1';
const EXPECTED = Object.freeze([
  ...[2443530385, 1246820961, 3029174418].map(seed =>
    `known-positive:${seed}:0`),
  ...[725554645, 1648575463, 1505670861, 2143415530,
    1965282964, 2208314832, 194900276, 4010383176].flatMap(seed =>
    [0, 1].map(seat => `fresh:${seed}:${seat}`))
]);
const PROMPT_CHAIN = Object.freeze([
  'ChooseCardsPrompt', 'ShuffleDeckPrompt', 'WaitPrompt'
]);

/**
 * Inspect immutable original Store action receipts without guessing
 * post-prompt card identities, discard payments, or paper legality.
 * @param {object} archive Complete JSON result of the registered experiment.
 * @returns {object} Fail-closed, cohort-separated native evidence ledger.
 */
function auditArchivedBridge(archive) {
  assert.equal(archive.schema, SCHEMA);
  assert.equal(archive.attemptedNativeArms, 38);
  assert.equal(archive.pairs?.length, 19);

  const tally = {
    'known-positive': { pairs: 0, nativeCompressor: 0, actionChangedPairs: 0 },
    fresh: { pairs: 0, nativeCompressor: 0, actionChangedPairs: 0 }
  };
  const receipts = [];
  const seen = new Set();

  for (const pair of archive.pairs) {
    const { seed, sourceSeat, cohort, control, treatment } = pair;
    assert.ok(cohort === 'known-positive' || cohort === 'fresh');
    assert.ok(sourceSeat === 0 || sourceSeat === 1);
    const identity = `${cohort}:${seed}:${sourceSeat}`;
    assert.ok(EXPECTED.includes(identity), `Unregistered source pair: ${identity}`);
    assert.equal(seen.has(identity), false, `Duplicated source pair: ${identity}`);
    seen.add(identity);
    assert.equal(pair.complete, true);
    assert.equal(pair.matched, true);
    assert.equal(control.error, null);
    assert.equal(treatment.error, null);
    assert.equal(control.seat, sourceSeat);
    assert.equal(treatment.seat, sourceSeat);
    assert.equal(control.seed, seed);
    assert.equal(treatment.seed, seed);
    assert.equal(control.enabled, false);
    assert.equal(treatment.enabled, true);
    assert.ok(typeof control.fullPhysicalDealHash === 'string' &&
      control.fullPhysicalDealHash.length > 0);
    assert.equal(control.fullPhysicalDealHash, treatment.fullPhysicalDealHash);
    assert.equal(control.deckAHash, treatment.deckAHash);
    assert.equal(control.deckBHash, treatment.deckBHash);
    assert.equal(control.actualStarterSeat, treatment.actualStarterSeat);
    assert.equal(control.nativeStatus, treatment.nativeStatus);
    assert.equal(control.nativeWinner, treatment.nativeWinner);
    assert.ok(['engine-game-end', 'action-limit'].includes(control.nativeStatus));
    assert.equal(control.sourceCompressorRoots.length, 0);
    assert.equal(treatment.bridge?.sourceSeat, sourceSeat);
    assert.equal(treatment.bridge?.rejected, 0);
    assert.equal(treatment.bridge?.accepted, treatment.sourceCompressorRoots.length);
    tally[cohort].pairs++;
    const before = control.allNativeRootActions;
    const after = treatment.allNativeRootActions;
    assert.ok(Array.isArray(before) && Array.isArray(after));

    const first = before.findIndex((action, i) =>
      JSON.stringify(action) !== JSON.stringify(after[i])
    );
    const divergent = first >= 0 || before.length !== after.length;
    assert.equal(divergent, !pair.identicalNativeRootTrace);

    if (divergent) {
      assert.ok(first >= 0 && first < before.length && first < after.length);
      assert.equal(before[first].action, 'PassTurnAction');
      assert.equal(before[first].playerSlot, sourceSeat);
      assert.equal(after[first].action, 'PlayCardAction');
      assert.equal(after[first].card, 'Battle Compressor');
      assert.equal(after[first].playerSlot, sourceSeat);
      assert.ok(treatment.sourceCompressorRoots.length > 0);
      tally[cohort].actionChangedPairs++;
    } else {
      assert.equal(treatment.sourceCompressorRoots.length, 0);
    }

    for (const root of treatment.sourceCompressorRoots) {
      assert.equal(root.playerSlot, sourceSeat);
      assert.equal(root.action, 'PlayCardAction');
      assert.equal(root.card, 'Battle Compressor');
      assert.ok(root.turnBefore === 1 || root.turnBefore === 2);
      const index = after.findIndex(action =>
        action.actionOrdinal === root.actionOrdinal);
      assert.ok(index >= 0);
      assert.deepEqual(after[index], root);
      const prompts = after.slice(index + 1, index + 4);
      assert.equal(prompts.length, 3);
      assert.deepEqual(prompts.map(x => x.pendingPrompt), PROMPT_CHAIN);
      assert.ok(prompts.every(x =>
        x.action === 'ResolvePromptAction' &&
        x.playerSlot === sourceSeat &&
        x.initiatingRootActionOrdinal === root.actionOrdinal));
      receipts.push({
        cohort, seed, sourceSeat, actionOrdinal: root.actionOrdinal,
        turn: root.turnBefore, nativeRoot: 'ACCEPTED_WITH_PROMPT_CHAIN',
        paperSelectedCardsAndPayment: 'UNVERIFIED'
      });
    }
    tally[cohort].nativeCompressor += treatment.sourceCompressorRoots.length;
  }

  assert.deepEqual([...seen].sort(), [...EXPECTED].sort());
  assert.equal(tally['known-positive'].pairs, 3);
  assert.equal(tally.fresh.pairs, 16);
  assert.equal(tally['known-positive'].nativeCompressor, 4);
  assert.equal(tally.fresh.nativeCompressor, 2);
  assert.equal(tally['known-positive'].actionChangedPairs, 3);
  assert.equal(tally.fresh.actionChangedPairs, 2);

  return {
    schema: 'agent1-rank17-archived-native-receipt-gate-v1',
    status: 'NATIVE_ROOT_AND_PROMPT_CHAIN_ONLY',
    pairs: 19, matched: 19, arms: 38, tally, receipts,
    nativeWinnerChanges: 0, competitiveQualifiedGames: 0,
    paperCardChoicesAndZoneTransitions: 'UNVERIFIED'
  };
}

module.exports = { auditArchivedBridge, PROMPT_CHAIN, SCHEMA, EXPECTED };
