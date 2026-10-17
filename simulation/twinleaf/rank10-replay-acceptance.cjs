'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');

/**
 * Demand a complete source-Store input replay from each frozen rank-10 arm.
 * This validates a mechanical transport milestone only. It does not qualify
 * the Simulator, decision policies, paper rules or a competitive win rate.
 * @param {object} report Fresh-process replay report.
 * @returns {{arm:string,dispatches:number}[]}
 */
function requireCompleteRank10Replay(report) {
  assert.equal(report?.schema, 'rank10-archived-input-fresh-process-test-v1');
  assert.equal(report.controlsAndForksQualifiedForCompetitiveInference, false);
  assert.equal(report.sourceReplayMechanicsVerified, false);
  assert.ok(Array.isArray(report.findings), 'Missing replay-arm findings');
  assert.equal(report.findings.length, 2, 'Expected both archived replay arms');
  const verified = [];
  for (const arm of ['control', 'alternate']) {
    const matches = report.findings.filter(finding => finding?.arm === arm);
    assert.equal(matches.length, 1, 'Expected exactly one '+arm+' replay');
    const finding = matches[0];
    assert.equal(finding.status, 'complete-reconstructed-live-input-trace',
      arm+' replay is incomplete: '+String(finding.reason || finding.status));
    assert.equal(finding.matchSummaryIdentical, true,
      arm+' replay produced a different match result');
    assert.ok(Number.isSafeInteger(finding.verifiedDispatches) &&
      finding.verifiedDispatches >= 3, arm+' replay has no complete dispatches');
    assert.equal(finding.verifiedDispatches, finding.sourceActions,
      arm+' replay stopped before the final action');
    assert.equal(finding.graphVerifiedDispatches, finding.sourceActions,
      arm+' Store data-graph checks lack full dispatch coverage');
    assert.equal(finding.storeDataGraphContract,
      'live-store-data-graph-except-logs-v1',
      arm+' Store data-graph contract changed or was not recorded');
    verified.push({arm, dispatches:finding.verifiedDispatches});
  }
  return verified;
}

if (require.main === module) {
  const filename = process.argv[2];
  assert.ok(filename, 'Pass the fresh-process source replay JSON path');
  const report = JSON.parse(fs.readFileSync(filename, 'utf8'));
  process.stdout.write(JSON.stringify({
    status:'source-input-and-store-data-graph-replay-complete-only',
    verified:requireCompleteRank10Replay(report),
    competitiveInferenceQualified:false,
    sourceReplayMechanicsVerified:false
  })+'\n');
}
module.exports = {requireCompleteRank10Replay};
