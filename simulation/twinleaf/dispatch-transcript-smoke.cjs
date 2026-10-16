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
  const request = {
    deckA: deck, deckB: deck, seed: 200614, maxActions: 60,
    isolatePolicyRandomness: true
  };
  const control = runMatch(request);
  const capture = withStoreDispatchTranscript(Store, () => runMatch(request),
    {liveStoreOnly: true});
  for (const key of ['actions', 'finished', 'winner', 'endReason', 'actionCounts',
    'actionsBySeat', 'attackTrace', 'abilityTrace', 'prizesRemaining',
    'finalState', 'phase', 'deckHashes', 'randomnessProtocol']) {
    assert.deepEqual(capture.result[key], control[key],
      'Instrumentation must preserve observable ' + key);
  }
  assert.ok(capture.result.actions > 0, 'The engine must take real actions');
  assert.ok(capture.dispatched >= capture.result.actions + 2,
    'Every explicit game-loop dispatch and both player entries must be intercepted');
  assert.equal(capture.actionTrace[0].action, 'AddPlayerAction');
  assert.equal(capture.actionTrace[1].action, 'AddPlayerAction');
  const liveActionCounts = {};
  for (const event of capture.actionTrace.slice(2)) {
    liveActionCounts[event.action] = (liveActionCounts[event.action] || 0) + 1;
  }
  assert.deepEqual(liveActionCounts, capture.result.actionCounts,
    'Captured live actions must match independent root-loop action histogram');
  assert.deepEqual(capture.actionTrace.map(e => e.step),
    Array.from({length: capture.dispatched}, (_, i) => i));
  return {
    kind: 'curated-deck-pinned-Store-dispatch-diagnostic',
    engine: capture.result.engine,
    seed: 200614,
    gameLoopActions: capture.result.actions,
    interceptedDispatches: capture.dispatched,
    excludedSpeculativeDispatches: capture.ignoredOtherStoreDispatches,
    capturedChoiceReferenceEvents: capture.capturedChoiceReferenceEvents,
    failedChoiceReferenceEvents: capture.failedChoiceReferenceEvents,
    captureScope: capture.captureScope,
    controlOutcomeInvariant: true,
    independentActionHistogramInvariant: true,
    parametersCaptured: capture.parametersCaptured,
    replayEligibleTraceSha256: capture.traceSha256,
    diagnosticTraceSha256: capture.diagnosticTraceSha256,
    incompleteCaptureReasons: capture.captureErrors.slice(0, 8),
    status: capture.result.endReason,
    qualification: 'diagnostic only; does not prove replay or competitive policy'
  };
}

if (require.main === module) console.log(JSON.stringify(runDispatchSmoke(), null, 2));
module.exports = {runDispatchSmoke};
