'use strict';

const assert = require('node:assert/strict');
const {run} = require('./rank11-held-shake-source-screen.cjs');

const FIXTURES = [
  {index: 131, seed: 100383471, outcome: 'positive-control'},
  {index: 137, seed: 1043379306, outcome: 'owner-search-exhausted'},
  {index: 155, seed: 1804615887, outcome: 'both-evolutions-held'}
];

/**
 * Replay three previously archived opportunities through the same source
 * printer, engine and seed schedule, under frozen v1 and opt-in v2 policies.
 * These are retrospective mechanical regressions, not independent samples.
 * @returns {object}
 */
function audit() {
  const rows = [];
  for (const fixture of FIXTURES) {
    const base = run({startIndex: fixture.index, count: 1});
    const guarded = run({
      startIndex: fixture.index, count: 1, conserveGarbodor: true
    });
    const b = base.trials[0];
    const g = guarded.trials[0];
    assert.equal(b.seed, fixture.seed);
    assert.equal(g.seed, fixture.seed);
    assert.equal(b.sourceSeat, 1);
    assert.equal(g.sourceSeat, 1);
    assert.equal(b.rank11ActualFirst, true);
    assert.equal(g.rank11ActualFirst, true);
    assert.deepEqual(b.sourceDeckHashes, g.sourceDeckHashes);
    assert.equal(b.policy?.opportunityDetected, true);
    assert.equal(b.policy?.aborted?.step === 4, fixture.index !== 131);
    assert.equal(guarded.profile, 'rank11-held-shake-v2-k1-guard');
    if (fixture.index === 131) {
      assert.equal(g.policy.opportunityDetected, true);
      assert.equal(g.policy.completeAtDecisionBoundary, true);
      assert.equal(g.policy.guardedExit, null);
      assert.deepEqual(g.policy.actions, b.policy.actions);
      assert.deepEqual(g.firstCandidateActions, b.firstCandidateActions);
      assert.deepEqual(g.terminal, b.terminal);
    } else if (fixture.index === 137) {
      assert.equal(g.policy.opportunityDetected, true);
      assert.equal(g.policy.attemptedActions, 2);
      assert.deepEqual(g.policy.guardedExit, {
        turn: 1, step: 1,
        reason: 'no-Garbodor-in-owner-visible-search'
      });
      assert.equal(g.policy.aborted, null);
    } else {
      assert.equal(g.policy.opportunityDetected, false);
      assert.equal(g.policy.attemptedActions, 0);
      assert.equal(g.noTriggerReplayVerified, true);
    }
    rows.push({
      ...fixture,
      firstSlot: b.rank11ActualFirst ? b.sourceSeat : b.candidateSeat,
      original: {opportunity: b.policy.opportunityDetected,
        actions: b.policy.attemptedActions, aborted: b.policy.aborted,
        terminal: b.terminal},
      guarded: {opportunity: g.policy.opportunityDetected,
        actions: g.policy.attemptedActions,
        guardedExit: g.policy.guardedExit,
        noTriggerReplayVerified: g.noTriggerReplayVerified,
        terminal: g.terminal}
    });
  }
  return {
    study: 'Frozen rank11 v1 versus opt-in owner-search K1 conservatism',
    rows, count: rows.length, positiveUnchanged: true,
    qualifiedForCompetitiveInference: false
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(audit(), null, 2) + '\n');
}
module.exports = {audit, FIXTURES};
