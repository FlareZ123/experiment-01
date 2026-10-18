'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {runMatch} = require('./headless.cjs');
const {withRank11HeldShake} = require('./rank11-held-shake-opener.cjs');

const N = 80;
const SEED_LABEL = 'agent6-rank11-held-shake-v1-20261018-precommitted';

/**
 * One predetermined print-60 source-screen schedule, generated without
 * looking at results. Both physical slots have forty independently derived
 * seeds. This is a diagnostic exposure census, not a win-rate sample.
 * @returns {{trialId:string,seed:number,sourceSeat:0|1}[]}
 */
function schedule(startIndex = 0, count = N) {
  assert(Number.isInteger(startIndex) && startIndex >= 0);
  assert(Number.isInteger(count) && count > 0);
  return Array.from({length: count}, (_, offset) => {
    const index = startIndex + offset;
    const sourceSeat = index % 2;
    const seed = crypto.createHash('sha256')
      .update(SEED_LABEL + ':' + index).digest().readUInt32BE(0);
    return {trialId: 'held-shake:' + index, seed, sourceSeat};
  });
}

/** @param {object} r */
function outcome(r) {
  return {finished: r.finished, winner: r.winner,
    actions: r.actions, turns: r.turns,
    prizesRemaining: r.prizesRemaining};
}

/** @returns {object} */
function run({startIndex = 0, count = N} = {}) {
  const rows = schedule(startIndex, count);
  assert.equal(new Set(rows.map(r => r.seed)).size, rows.length);
  const scheduleDigest = crypto.createHash('sha256')
    .update(JSON.stringify(rows)).digest('hex');
  const plan = planAichi(1, {
    allowEquivalentBasicEnergies: true,
    allowJapanesePromoHooks: true
  });
  const source = plan.opponents.find(d => d.rank === 11);
  assert.equal(source?.status, 'ready');
  assert.equal(source.cards.length, 60);
  assert.equal(plan.candidate.cards.length, 60);
  const trials = [];
  const noTriggerControls = {0: 0, 1: 0};

  for (const row of rows) {
    const candidateSeat = 1 - row.sourceSeat;
    const request = {
      deckA: row.sourceSeat === 0 ? source.cards : plan.candidate.cards,
      deckB: row.sourceSeat === 1 ? source.cards : plan.candidate.cards,
      seed: row.seed,
      maxActions: 85,
      strictPromptValidation: true,
      forestSealSearchCorrection: true,
      battleCompressorPositiveSelectionCorrection: true,
      isolatePolicyRandomness: true,
      captureDecisionTrace: true,
      label: row.trialId
    };
    try {
    const wrapped = withRank11HeldShake(row.sourceSeat,
      () => runMatch(request));
    const game = wrapped.result;
    const policy = wrapped.policyAudit;
    const rank11ActualFirst = game.firstTurnSlot === row.sourceSeat;
    const candidateActions = game.decisionTrace.filter(e =>
      e.playerSlot === candidateSeat);
    const record = {
      ...row, candidateSeat, rank11ActualFirst,
      openingOpportunity: policy.opportunityDetected,
      completedLine: policy.completeAtDecisionBoundary,
      policy, sourceDeckHashes: game.deckHashes,
      terminal: outcome(game),
      firstCandidateActions: candidateActions.slice(0, 6),
      noTriggerReplayVerified: false,
      pairedOriginalSource: null
    };
    // Certify physical setup/seed equality for every event that triggered,
    // and noninterference for the first two no-trigger trials per seat.
    const needsControl = policy.opportunityDetected ||
      noTriggerControls[row.sourceSeat] < 2;
    if (needsControl) {
      const original = runMatch({...request, label: row.trialId + ':control'});
      assert.equal(original.firstTurnSlot, game.firstTurnSlot,
        'Source deal changed first-turn orientation');
      assert.deepEqual(original.deckHashes, game.deckHashes,
        'Source candidate/opponent 60 identity drift');
      record.pairedOriginalSource = outcome(original);
      if (!policy.opportunityDetected) {
        assert.deepEqual(game.decisionTrace, original.decisionTrace,
          'No-trigger policy changed actual source actions');
        assert.deepEqual(outcome(game), outcome(original),
          'No-trigger policy changed outcome');
        record.noTriggerReplayVerified = true;
        noTriggerControls[row.sourceSeat] += 1;
      }
    }
    trials.push(record);
    } catch (error) {
      // Failed source actions, bot errors and control mismatches are retained
      // in the same precommitted denominator, with no inferred turn order.
      trials.push({
        ...row, candidateSeat, rank11ActualFirst: null,
        openingOpportunity: null, completedLine: false,
        policy: null, sourceDeckHashes: null, terminal: null,
        firstCandidateActions: [], noTriggerReplayVerified: false,
        pairedOriginalSource: null,
        error: {name: error.name, message: error.message}
      });
    }
  }
  const first = trials.filter(t => t.rank11ActualFirst === true);
  const second = trials.filter(t => t.rank11ActualFirst === false);
  const opportunities = trials.filter(t => t.openingOpportunity);
  return {
    study: 'rank11 held-Boost-Shake owner-visible autonomous opportunity screen',
    profile: 'rank11-held-shake-v1',
    seedLabel: SEED_LABEL,
    startIndex, count,
    scheduleDigest,
    schedule: rows,
    engineRevision: plan.engineRevision,
    sourceRank: 11, sourceManifestDigest: plan.manifestDigest,
    candidateRank: 1, candidateDigest: plan.candidateDigest,
    maxActions: 85, totalTrials: trials.length,
    actualStarts: {rank11First: first.length, rank11Second: second.length},
    opportunityCounts: {
      all: opportunities.length,
      rank11First: first.filter(t => t.openingOpportunity).length,
      rank11Second: second.filter(t => t.openingOpportunity).length
    },
    completeCount: trials.filter(t => t.completedLine).length,
    abortedCount: trials.filter(t => t.policy?.aborted).length,
    failedTrialCount: trials.filter(t => t.error).length,
    noTriggerVerifiedControls: trials.filter(t =>
      t.noTriggerReplayVerified).length,
    exposureGatePassed: opportunities.some(t => t.completedLine),
    trials,
    qualifiedForCompetitiveInference: false,
    caveat: 'All attempted seeds retained. A search target can be Prized, a ' +
      'Bot action can fail, and generic candidate response remains unqualified.'
  };
}

if (require.main === module) {
  const extended = process.env.AICHI_HELD_SHAKE_EXTENDED === 'true';
  const args = extended ? {startIndex:80, count:160} : {};
  process.stdout.write(JSON.stringify(run(args), null, 2) + '\n');
}
module.exports = {run, schedule, SEED_LABEL, N};
