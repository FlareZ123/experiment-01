'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');
const { runTest: replay } = require('./rank8-attach-energy-prompt-source.cjs');
const { installDistinctAttachTargetsHook } = require('./distinct-attach-targets-hook.cjs');

/**
 * Same source 60s/seed/current bot versus reversible target-exclusion policy.
 * The raw arm must hit the archived invalid Tapu Koko duplicate; the corrected
 * arm must have executed an AttachEnergy prompt with prior destination excluded.
 * @returns {object}
 */
function runTest() {
  initializeCards();
  const compiled = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
  const { AttachEnergyPromptResolver } = require(path.join(compiled,
    'simple-bot/prompt-resolver/attach-energy-prompt-resolver'));
  const proto = AttachEnergyPromptResolver.prototype;
  const beforeGet = proto.getPromptResult;
  const beforeAssign = proto.assignToBestTarget;
  const raw = replay();
  assert.equal(raw.status, 'invalid-attach-energy-proposal');
  assert.equal(raw.evidence?.promptId, 57);
  assert.equal(raw.evidence?.differentTargets, true);
  assert.deepEqual(raw.evidence?.selections?.map(x => x.target.index), [2, 2]);

  const restore = installDistinctAttachTargetsHook();
  let corrected;
  let stats;
  try {
    corrected = replay();
    stats = { ...restore.stats };
  } finally {
    restore();
  }
  assert.equal(proto.getPromptResult, beforeGet,
    'getPromptResult prototype must be restored after the source replay');
  assert.equal(proto.assignToBestTarget, beforeAssign,
    'assignToBestTarget prototype must be restored after the source replay');
  assert.ok(stats.restrictedPrompts >= 1,
    'The physical source game must exercise a distinct-target Energy prompt');
  assert.ok(stats.targetExclusions >= 1,
    'A second Energy must have had the earlier destination excluded');
  assert.notEqual(corrected.evidence?.promptId, 57,
    'Corrected policy must progress beyond archived prompt-57 duplicate');
  return {
    kind: 'rank8-tapu-koko-distinct-targets-source-contrast',
    engine: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    sourceHead: 'current execution from manually pinned GitHub Actions workflow',
    qualification: 'one physical source deal, two policies; zero qualified competitive games',
    raw,
    corrected,
    repairedPromptCounts: stats,
    prototypesRestored: true
  };
}

if (require.main === module) console.log(JSON.stringify(runTest(), null, 2));
module.exports = { runTest };
