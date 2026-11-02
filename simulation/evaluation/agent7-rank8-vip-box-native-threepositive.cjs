'use strict';

const assert = require('node:assert/strict');
const {run} = require('./agent7-rank8-vip-box-native-prospective.cjs');

/**
 * Retrospective selected-witness investigation only. The 128-pair
 * preregistered prospective result already identified these three source
 * opportunity seeds. These are not an independent success-rate sample.
 */
function inspect() {
  const result = run({retrospectiveIndices: [683, 694, 756]});
  assert.equal(result.registeredTrials, 128);
  assert.equal(result.actualOriginalDealsReplayed, 3);
  assert.equal(result.totalNativeAttempted, 6);
  assert.equal(result.competitiveQualifiedGames, 0);
  assert.equal(result.summary.noVipBoxContention, 0);
  assert.equal(result.summary.nativeError, 0);
  assert.deepEqual(result.rows.map(r => r.trial),
    ['rank8-original-box-k0:683', 'rank8-original-box-k0:694',
     'rank8-original-box-k0:756']);
  return result;
}

if (require.main === module) process.stdout.write(
  JSON.stringify(inspect(), null, 2) + '\n');

module.exports = {inspect};
