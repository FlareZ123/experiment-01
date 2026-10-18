'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {probe} = require('./herdier-treasure-hunt-lock-action.cjs');
const {installHerdierTreasureHuntHook} =
  require('./herdier-treasure-hunt-hook.cjs');

/** @returns {object} */
function runTest() {
  const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
  const {Herdier} = require(path.join(output,
    'sets/08-sun-and-moon/set-sun-and-moon/herdier'));
  const original = Herdier.prototype.reduceEffect;
  const locks = [
    'none', 'wobbuffet', 'garbotoxin-tool', 'garbotoxin-bare',
    'silent-lab', 'iron-thorns'
  ];
  const run = () => [...locks.map(lock => probe(lock)), probe('none', true)];
  const source = run();
  assert.equal(source.find(x => x.lock === 'wobbuffet').recovered, true);
  assert.equal(source.find(x => x.lock === 'garbotoxin-tool').recovered, true);
  assert.equal(source.find(x => x.twoItems).recoveredItemCount, 2);
  assert.equal(source.find(x => x.twoItems).itemPromptMax, 2);

  const restore = installHerdierTreasureHuntHook();
  assert.equal(installHerdierTreasureHuntHook(), restore,
    'Repeated install should return same reversible lifetime');
  let corrected;
  try {
    corrected = run();
    for (const row of corrected) {
      assert.equal(row.evolved, true, row.lock);
      assert.equal(row.matchesPrintedExpectation, true,
        'Printed recovery count/lock mismatch: ' + JSON.stringify(row));
      if (row.expectedRecoveryByPrintedRules) {
        assert.equal(row.itemPromptMax, 1, row.lock);
      } else {
        assert.equal(row.itemPromptMax, null, row.lock);
      }
    }
    const twoItems = corrected.find(x => x.twoItems);
    assert.equal(twoItems.allowedTwoItemSelection, false);
    assert.equal(twoItems.recoveredItemCount, 1);
  } finally {
    restore();
  }
  assert.equal(Herdier.prototype.reduceEffect, original,
    'Must restore pinned reducer unchanged');
  assert.equal(probe('none', true).recoveredItemCount, 2,
    'Restored raw behavior must be observationally identical');
  return {
    kind: 'herdier-on-evolution-ability-lock-and-single-item-contract-v1',
    pinned: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    source, corrected, reducerRestored: true,
    scope: 'staged actual Store PlayCardAction; no fully dealt match',
    qualifiedForCompetitiveInference: false
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(runTest(), null, 2) + '\n');
}
module.exports = {runTest};
