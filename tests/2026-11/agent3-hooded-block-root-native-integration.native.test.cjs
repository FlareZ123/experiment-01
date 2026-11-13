'use strict';

const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  runNativeHoodedBlockRootCase,
  PINNED_TWINLEAF,
  SHARED_HELPER_VERSION
} = require('../../simulation/twinleaf/2026-11/agent3-hooded-block-root-native-integration.cjs');

test('actual Agent34/Agent43 root maps Hood attach then paid retreat through pinned Store, candidate-only, both seats', () => {
  const results = [];
  try {
    for (const candidateSeat of [0, 1]) {
      const result = runNativeHoodedBlockRootCase(candidateSeat);
      results.push(result);
      const label = 'candidate physical seat ' + candidateSeat;
      assert.equal(result.candidateSeat, candidateSeat, label);
      assert.equal(result.opponentSeat, 1 - candidateSeat, label);
      assert.equal(result.policyIdentityOwnerSeat, candidateSeat, label);
      assert.equal(result.engineCommit, PINNED_TWINLEAF, label);
      assert.equal(result.engine, 'twinleafgg/' + PINNED_TWINLEAF, label);
      assert.match(result.researchCommit, /^[a-f0-9]{40}$/, label);
      assert.equal(result.policySharedHelperVersion, SHARED_HELPER_VERSION, label);
      assert.match(result.policyIdentitySha256, /^[a-f0-9]{64}$/, label);
      assert.equal(result.postAttachmentHoodVisible, true, label);
      assert.deepEqual(result.observedDecisionSeats,
        [candidateSeat, candidateSeat], label);
      assert.deepEqual(result.typedIntents,
        ['attach-stealthy-hood', 'paid-retreat'], label);
      assert.equal(result.candidateActiveAfterRetreat,
        "Lillie's Clefairy ex JTG", label);
      assert.equal(result.psychicEnergyDiscarded, 2, label);
      assert.equal(result.hoodRemainsOnRetreatedVmax, true, label);
      assert.equal(result.opponentBaselineCalls, 1, label);
      assert.equal(result.opponentPolicyRootsSelected, 0, label);
      assert.equal(result.nativeRootJoinReceipts.length, 2, label);
      assert.deepEqual(result.nativeRootJoinReceipts.map(receipt =>
        receipt.nativeStoreActionOrdinal), [0, 1], label);
      assert.equal(result.nativeRootJoinReceipts.every(receipt =>
        receipt.accepted === true && receipt.seat === candidateSeat), true, label);
      assert.equal(result.competitiveGameQualified, false, label);
    }
  } finally {
    const output = process.env.AGENT3_HOODED_BLOCK_ROOT_OUTPUT;
    if (output) fs.writeFileSync(output,
      JSON.stringify({ schema: 'agent3-hooded-block-root-native-v1', results }, null, 2) + '\n');
  }
});
