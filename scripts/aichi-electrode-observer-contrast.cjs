'use strict';
const assert = require('node:assert/strict');

const OBSERVER_TAG = 'live-aichi-electrode-public-necessary-conditions-v1';
const METRICS = Object.freeze([
  'decisions', 'activeRaichu', 'benchedElectrode', 'both',
  'bothWithDiscardSpecial', 'withSafePrizeWindow',
  'withPostBombReversalWindow'
]);

/**
 * Compare the original fixed-plan campaign output with the same exact plan
 * instrumented by a read-only source-opponent Electrode opportunity observer.
 * Reject any difference beyond the explicitly requested instrumentation.
 *
 * @param {object} report fixed plan output
 * @returns {object} Normalized copy preserving full raw decision histories.
 */
function withoutObserver(report) {
  const normalized = structuredClone(report);
  delete normalized.policyFlags.captureElectrodeOpportunity;
  for (const record of normalized.records) {
    delete record.traceSummary?.electrodeOpportunitySummary;
  }
  return normalized;
}

/**
 * Compare entire identical-experiment outputs and count the rank-4 source
 * opponent's own non-prompt decisions, independent of its physical seat.
 *
 * A decision-point count is never an independent-game sample.
 *
 * @param {object} control Report generated with observer disabled.
 * @param {object} observed Report generated with observer enabled.
 * @returns {{researchRevision:string, planDigest:string, trials:number,
 *   opponentDecisionTotals:object, byTrial:object[]}}
 */
function compareElectrodeObserver(control, observed) {
  assert.equal(control?.policyFlags?.captureElectrodeOpportunity, false,
    'Control must have observer disabled');
  assert.equal(observed?.policyFlags?.captureElectrodeOpportunity, true,
    'Observed arm must enable read-only observer');
  assert.ok(Array.isArray(control.records) && control.records.length > 0,
    'Need nonempty campaign records');
  assert.equal(control.records.length, observed.records?.length,
    'Both arms must preserve the same scheduled trials');

  // This verifies much more than a matching action list: plans, policy flags
  // except the observer, full traces, outcomes and all environment identities.
  assert.deepStrictEqual(withoutObserver(control), withoutObserver(observed),
    'Observer-enabled campaign diverged outside designated telemetry field');

  const totals = Object.fromEntries(METRICS.map(key => [key, 0]));
  const byTrial = [];
  for (const record of observed.records) {
    assert.equal(record.status, 'completed-engine-game',
      'Only inspected completed, attributed games enter the census');
    assert.equal(record.opponentRank, 4, 'This census is source-locked to rank 4');
    const evidence = record.traceSummary?.electrodeOpportunitySummary;
    assert.equal(evidence?.evidenceType, OBSERVER_TAG, 'Missing observer evidence');
    assert.ok(Array.isArray(evidence.countsBySeat) &&
      evidence.countsBySeat.length === 2, 'Need both physical seat counters');
    const opponentSeat = record.candidateEngineSlot === 'A' ? 1 : 0;
    assert.ok([0, 1].includes(opponentSeat));
    const counts = evidence.countsBySeat[opponentSeat];
    for (const key of METRICS) {
      assert.ok(Number.isSafeInteger(counts[key]) && counts[key] >= 0,
        'Invalid integer observer count: ' + key);
      assert.ok(counts[key] <= counts.decisions,
        'Observer count exceeds decision denominator: ' + key);
      totals[key] += counts[key];
    }
    const inequalities = [
      ['both','activeRaichu'], ['both','benchedElectrode'],
      ['bothWithDiscardSpecial','both'],
      ['withSafePrizeWindow','bothWithDiscardSpecial'],
      ['withPostBombReversalWindow','withSafePrizeWindow']
    ];
    for (const [smaller, larger] of inequalities) {
      assert.ok(counts[smaller] <= counts[larger],
        'Contradictory observer relation: ' + smaller + ' > ' + larger);
    }
    byTrial.push({
      trialId:record.trialId,
      candidateId:record.candidateId,
      candidateEngineSlot:record.candidateEngineSlot,
      opponentSeat,
      candidateActualTurn:record.candidateActualTurn,
      opponentAttacks:record.opponentAttacks,
      counts:Object.fromEntries(METRICS.map(key=>[key, counts[key]]))
    });
  }
  return {
    researchRevision:observed.researchRevision,
    planDigest:observed.planDigest,
    trials:byTrial.length,
    opponentDecisionTotals:totals,
    byTrial
  };
}

module.exports = {
  OBSERVER_TAG, METRICS, withoutObserver, compareElectrodeObserver
};
