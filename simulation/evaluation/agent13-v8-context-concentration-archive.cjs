'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {inspect} = require('./agent36-v8-original-field-archive-audit.cjs');
const {summarizeContextCoverage} = require('./agent13-v8-context-concentration.cjs');

const ARCHIVE = 'issue25-steward-v8.json';
const SHA256 = 'd30132ced995f6f0577937de501e86c0e3c51a9bd116b1891b42506118d81ce0';

/**
 * Reinspect the unchanged original 8-arm archived Store run, preserving
 * real per-root SHA, source-seat identity, and incomplete error histories.
 * @param {string} directory Directory containing the authentic CI artifact.
 * @returns {object}
 */
function verifyOriginalArchive(directory) {
  assert.ok(typeof directory === 'string' && directory.length > 0);
  const raw = fs.readFileSync(path.join(directory, ARCHIVE));
  const sidecar = fs.readFileSync(
    path.join(directory, 'issue25-steward-v8.sha256'), 'utf8');
  const canonical = inspect(raw, sidecar, SHA256);
  const result = summarizeContextCoverage(canonical);
  assert.equal(result.originalNativeAttempts, 8);
  assert.equal(result.sourceAttackTraceKnownContexts, 3);
  assert.equal(result.sourceAttackTraceUnknownContexts, 5);
  assert.equal(result.observedSettledAttackContexts, 3);
  assert.equal(result.totalKnownSourceDeclarations, 20);
  assert.equal(result.totalKnownSourceSettlements, 19);
  assert.equal(result.totalKnownSameEpochOpponentRoots, 19);
  assert.deepEqual(result.immediateOpponentActionCounts,
    {AttackAction:4,PassTurnAction:8,PlayCardAction:7});
  assert.equal(result.totalObservedSourcePrizeTakingAttacks, 2);
  assert.equal(result.totalObservedSourcePrizesTaken, 3);
  assert.deepEqual(result.attackConcentration.map(x=>x.settledAttacks),
    [13,4,2]);
  assert.equal(result.pairedSourceDeals.filter(x=>
    x.physicalSameSourceDeal===false).length,1);
  assert.equal(result.competitivelyQualifiedGames,0);
  assert.equal(result.estimatedWinRate,null);
  return {
    schema:'agent13-original-v8-archive-provenance-and-context-census-v1',
    originalArchiveSha256:SHA256,
    originalRunId:canonical.runId,
    pinnedTwinleaf:canonical.pinnedTwinleaf,
    ...result
  };
}

if (require.main === module) {
  const directory=process.argv[2];
  assert.ok(directory,'Specify the archive directory');
  process.stdout.write('AGENT13_ORIGINAL_V8_CONTEXT_CENSUS '+
    JSON.stringify(verifyOriginalArchive(directory))+'\n');
}

module.exports={ARCHIVE,SHA256,verifyOriginalArchive};
