'use strict';

const { performance } = require('node:perf_hooks');
const { runMatch, upstreamSmokeDeck } = require('./headless.cjs');

/**
 * A bounded game-completion viability probe. The opponent and challenger are
 * intentionally the same upstream Standard Dragapult deck to isolate the
 * engine/policy ability to reach a terminal state. No Aichi claim is possible.
 */
function probeCompletion() {
  const cards = upstreamSmokeDeck();
  const seed = 3141592653;
  const maxActions = 1200;
  const started = performance.now();
  const result = runMatch({
    deckA: cards,
    deckB: cards,
    seed,
    maxActions,
    label: 'matched-upstream-standard-deck-engine-terminal-probe'
  });
  return {
    kind: 'engine-terminal-probe',
    significance: 'Simulator and policy termination feasibility only, no Aichi games',
    durationMs: Math.round(performance.now() - started),
    result
  };
}

if (require.main === module) {
  console.log(JSON.stringify(probeCompletion(), null, 2));
}

module.exports = { probeCompletion };
