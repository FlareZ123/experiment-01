'use strict';

const assert = require('node:assert/strict');
const { probeEntry } = require('./entry-draw-lock-action.cjs');
const { installEntryDrawLockHook } = require('./entry-draw-lock-hook.cjs');

/**
 * Garbotoxin BKP explicitly covers hands and requires a Tool on Garbodor.
 * Contrast the natural hand-zone suppression with a Tool-free control.
 * @returns {object}
 */
function runTest() {
  const names = ['Dedenne GX UNB', 'Crobat V DAA'];
  const environments = ['garbotoxin-tool', 'garbotoxin-bare'];
  const run = () => names.flatMap(name => environments.map(
    lock => probeEntry(name, false, lock)
  ));
  const raw = run();
  const restore = installEntryDrawLockHook();
  try {
    const corrected = run();
    for (const row of [...raw, ...corrected]) {
      const shouldDraw = row.lockEnvironment === 'garbotoxin-bare';
      assert.equal(row.benchEntry, true);
      assert.equal(row.promptCount, 0);
      assert.equal(row.entryPrompt, shouldDraw,
        'Garbodor Tool-gated hand-zone lock should match printed Garbotoxin');
      assert.equal(row.drew, shouldDraw ? 6 : 0);
    }
    return {
      kind: 'garbotoxin-hand-zone-entry-draw-lock',
      engine: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
      scope: 'source BKP Garbotoxin on staged Stage-1 Bench; real Store entry action only',
      raw, corrected
    };
  } finally {
    restore();
  }
}

if (require.main === module) console.log(JSON.stringify(runTest(), null, 2));
module.exports = { runTest };
