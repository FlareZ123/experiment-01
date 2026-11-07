'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  runV3StoreIdentityNativeContract
} = require('../../simulation/twinleaf/agent30/snap-trap-source-root-store-identity-v3-native-v1.cjs');

test('pinned native Store identity joins the source prompt to the root Store for both seats', () => {
  for (const sourceSeat of [0, 1]) {
    const result = runV3StoreIdentityNativeContract(sourceSeat);
    assert.equal(result.identityReceipt.sourcePromptMarked, true);
    assert.equal(result.identityReceipt.sourceStoreIdentityCaptured, true);
    assert.equal(result.identityReceipt.sourceStoreIsRootStore, true);
    assert.equal(result.identityReceipt.contextStoreIsRootStore, true);
    assert.equal(result.identityReceipt.promptStateIsRootStoreState, true);
    assert.equal(result.identityReceipt.sourceSeat, sourceSeat);
    assert.equal(result.identityReceipt.attackerSeat, 1 - sourceSeat);
    assert.equal(result.settlement.selectedEnergyInLostZone, true);
    assert.equal(result.settlement.selectedEnergyAbsentFromDiscard, true);
    assert.equal(result.settlement.unresolvedPromptCountAfterFinalWait, 0);
    assert.equal(result.markerAudit.exactSourcePromptsStamped, 1);
    assert.equal(result.markerAudit.sourceStoreIdentityCaptures, 1);
    assert.equal(result.markerAudit.hiddenCardIdentitiesInspected, false);
  }
});
