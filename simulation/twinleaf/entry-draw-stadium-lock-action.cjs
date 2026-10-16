'use strict';

const assert = require('node:assert/strict');
const { probeEntry } = require('./entry-draw-lock-action.cjs');
const { installEntryDrawLockHook } = require('./entry-draw-lock-hook.cjs');

/**
 * A deliberately contrasting lock matrix:
 * Path to the Peak only targets Rule Box Pokémon in play;
 * Silent Lab also targets Basic Pokémon in the hand.
 * The control environment has no applicable lock.
 * @returns {object}
 */
function runTest() {
  const names = ['Dedenne GX UNB', 'Crobat V DAA'];
  const environments = ['path', 'silent-lab', 'none'];
  const run = () => names.flatMap(name => environments.map(
    lock => probeEntry(name, false, lock)
  ));
  const upstream = run();
  const restore = installEntryDrawLockHook();
  try {
    const guarded = run();
    for (const row of guarded) {
      assert.equal(row.benchEntry, true);
      assert.equal(row.promptCount, 0);
      const shouldDraw = row.lockEnvironment === 'none';
      assert.equal(row.entryPrompt, shouldDraw,
        'Guarded entry was inconsistent with printed Stadium lock');
      assert.equal(row.drew, shouldDraw ? 6 : 0);
    }
    for (const row of upstream) {
      assert.equal(row.benchEntry, true);
      assert.equal(row.promptCount, 0);
      if (row.lockEnvironment === 'none') {
        assert.equal(row.drew, 6, 'Unrestricted source Ability should draw');
      }
    }
    return {
      kind: 'entry-draw-source-stadium-lock-matrix',
      engine: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
      scope: 'constructed board actions; source Path/Silent Lab distinct hand-zone wording',
      upstream, guarded
    };
  } finally {
    restore();
  }
}

if (require.main === module) console.log(JSON.stringify(runTest(), null, 2));
module.exports = { runTest };
