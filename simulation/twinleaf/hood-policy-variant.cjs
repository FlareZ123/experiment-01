'use strict';

const path = require('node:path');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
const { hoodAwareArvenResolverClass } =
  require('./hood-aware-arven-resolver.cjs');
const { hoodAwareAttachToolTacticClass } =
  require('./hood-aware-attach-tool-tactic.cjs');

/**
 * Synchronously substitute two narrow research-side SimpleTacticsAi
 * constructors while invoking fn, then restore the exact shared arrays.
 *
 * Both bots are technically initialized with these classes, but opponents
 * lacking the Hood + Shadow Rider combination take the original fallback.
 * This is a controlled adapter and leaves the pinned vendor code untouched.
 *
 * @template T
 * @param {()=>T} fn Run an entire synchronous seeded match batch.
 * @returns {T}
 */
function withHoodAwareSimpleTactics(fn) {
  const definitions = require(path.join(output,
    'simple-bot/simple-bot-definitions'));
  const resolvers = definitions.allPromptResolvers;
  const tactics = definitions.allSimpleTactics;
  const resolverIndex = resolvers.findIndex(c => c.name === 'ChooseCardsPromptResolver');
  const tacticIndex = tactics.findIndex(c => c.name === 'AttachToolTactic');
  if (resolverIndex < 0 || tacticIndex < 0) {
    throw new Error('Pinned SimpleTacticsAi extension points changed.');
  }
  const originalResolver = resolvers[resolverIndex];
  const originalTactic = tactics[tacticIndex];
  resolvers[resolverIndex] = hoodAwareArvenResolverClass();
  tactics[tacticIndex] = hoodAwareAttachToolTacticClass();
  try {
    return fn();
  } finally {
    resolvers[resolverIndex] = originalResolver;
    tactics[tacticIndex] = originalTactic;
  }
}

module.exports = { withHoodAwareSimpleTactics };
