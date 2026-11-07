'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {withStunfiskSnapTrapPromptMarker} =
  require('./stunfisk-snap-trap-prompt-marker-v3.cjs');
const {runSnapTrapPrismStarDestinationContract} =
  require('../agent12/snap-trap-prism-star-destination-native-v1.cjs');

const output = path.resolve(__dirname, '../../../vendor/twinleaf/ptcg-server/output');
const load = relativePath => require(path.join(output, relativePath));

/**
 * Run the real pinned Snap Trap / Prism Star fixture with the Agent30 v3
 * source marker, proving that the prompt's source Store is the root Store.
 * @param {0|1} sourceSeat
 * @returns {object}
 */
function runV3StoreIdentityNativeContract(sourceSeat) {
  const {ResolvePromptAction} = load('game/store/actions/resolve-prompt-action');
  let rootStore = null;
  let promptStore = null;
  let sourceProof = null;
  let identityReceipt = null;

  const marked = withStunfiskSnapTrapPromptMarker(
    (getOriginForPrompt, getStoreForPrompt) => {
      return runSnapTrapPrismStarDestinationContract({
        sourceSeat,
        onRootStoreCreated(store) {
          rootStore = store;
        },
        resolveOwnerPrompt(context) {
          const prompt = context.prompt;
          sourceProof = getOriginForPrompt(prompt);
          promptStore = getStoreForPrompt(prompt);
          identityReceipt = {
            sourcePromptMarked: sourceProof !== null,
            sourceStoreIdentityCaptured: sourceProof?.sourceStoreIdentityCaptured === true,
            sourceStoreIsRootStore: promptStore === rootStore,
            contextStoreIsRootStore: context.store === rootStore,
            promptStateIsRootStoreState: context.state === rootStore.state,
            sourceSeat: sourceProof?.sourceSeat,
            attackerSeat: sourceProof?.attackerSeat
          };

          assert.ok(sourceProof, 'the exact native Snap Trap prompt must have a source proof');
          assert.equal(sourceProof.sourceStoreIdentityCaptured, true);
          assert.strictEqual(promptStore, context.store);
          assert.strictEqual(promptStore, rootStore);
          assert.strictEqual(context.state, rootStore.state);

          const selected = prompt.cards.energies.cards.find(card =>
            String(card.fullName || card.name || '').includes('Beast Energy')
          );
          assert.ok(selected, 'the public attached-Energy list must contain Beast Energy');
          assert.equal(prompt.validate([selected]), true);
          return new ResolvePromptAction(prompt.id, [selected]);
        }
      });
    }
  );

  assert.ok(rootStore);
  assert.ok(promptStore);
  assert.equal(marked.audit.sourceStoreIdentityCaptures, 1);
  assert.equal(marked.audit.exactSourcePromptsStamped.length, 1);
  assert.strictEqual(marked.audit.exactSourcePromptsStamped[0], sourceProof);
  assert.strictEqual(marked.result.prompt.promptId, sourceProof.pendingNativePromptId);
  assert.equal(identityReceipt.sourceSeat, sourceSeat);
  assert.equal(identityReceipt.attackerSeat, 1 - sourceSeat);
  assert.equal(marked.result.resolution.selectedEnergyInLostZone, true);
  assert.equal(marked.result.resolution.selectedEnergyAbsentFromDiscard, true);
  assert.equal(marked.result.prompt.unresolvedPromptCountAfterFinalWait, 0);

  return {
    schema: 'agent30-snap-trap-source-root-store-identity-v3-native-v1',
    sourceSeat,
    attackerSeat: 1 - sourceSeat,
    identityReceipt,
    settlement: {
      promptId: marked.result.prompt.promptId,
      selectedEnergyInLostZone: marked.result.resolution.selectedEnergyInLostZone,
      selectedEnergyAbsentFromDiscard: marked.result.resolution.selectedEnergyAbsentFromDiscard,
      unresolvedPromptCountAfterFinalWait: marked.result.prompt.unresolvedPromptCountAfterFinalWait
    },
    markerAudit: {
      exactSourcePromptsStamped: marked.audit.exactSourcePromptsStamped.length,
      sourceStoreIdentityCaptures: marked.audit.sourceStoreIdentityCaptures,
      hiddenCardIdentitiesInspected: marked.audit.hiddenCardIdentitiesInspected
    },
    competitiveGamesQualified: 0,
    winRateEstimate: null
  };
}

module.exports = {runV3StoreIdentityNativeContract};
