'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards, runMatch, upstreamSmokeDeck} = require('./headless.cjs');
const {withStoreDispatchTranscript} = require('./store-dispatch-transcript.cjs');

function runDispatchSmoke() {
  initializeCards();
  const {Store} = require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store'));
  const deck = upstreamSmokeDeck();
  const capture = withStoreDispatchTranscript(Store, () => runMatch({
    deckA: deck, deckB: deck, seed: 200614, maxActions: 60,
    isolatePolicyRandomness: true
  }), {liveStoreOnly: true});
  assert.ok(capture.result.actions > 0, 'The engine must take real actions');
  assert.ok(capture.dispatched >= capture.result.actions + 2,
    'Every explicit game-loop dispatch and both player entries must be intercepted');
  assert.equal(capture.actionTrace[0].action, 'AddPlayerAction');
  assert.deepEqual(capture.actionTrace.map(e => e.step),
    Array.from({length: capture.dispatched}, (_, i) => i));
  return {
    kind: 'curated-deck-pinned-Store-dispatch-diagnostic',
    engine: capture.result.engine,
    seed: 200614,
    gameLoopActions: capture.result.actions,
    interceptedDispatches: capture.dispatched,
    excludedSpeculativeDispatches: capture.ignoredOtherStoreDispatches,
    captureScope: capture.captureScope,
    parametersCaptured: capture.parametersCaptured,
    canonicalTraceSha256: capture.traceSha256,
    incompleteCaptureReasons: capture.captureErrors.slice(0, 8),
    status: capture.result.endReason,
    qualification: 'diagnostic only; does not prove replay or competitive policy'
  };
}

if (require.main === module) console.log(JSON.stringify(runDispatchSmoke(), null, 2));
module.exports = {runDispatchSmoke};
