'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { initializeCards, runMatch } = require('../twinleaf/headless.cjs');
const { buildPlan, evaluatePlan } = require('./field-benchmark.cjs');

/**
 * Resolve an Aichi event comparison from actual pinned Twinleaf card IDs.
 * Missing cards are preserved as blockers. All field placements are retained.
 *
 * @param {number|object} candidate Published placement rank or custom 60-card deck.
 */
function planAichi(candidate = 1) {
  const file = path.resolve(__dirname, '../../results/aichi-2026/full-decklists.json');
  const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
  return buildPlan(manifest, initializeCards().getAllCards(), candidate);
}

/** @param {ReturnType<typeof planAichi>} plan */
function summarisePlan(plan) {
  return {
    source: plan.source, engineRevision: plan.engineRevision,
    manifestDigest: plan.manifestDigest,
    candidateRank: plan.candidateRank, candidateLabel: plan.candidateLabel,
    candidateDigest: plan.candidateDigest,
    candidateResolved: plan.candidate.cards !== null,
    candidateUnresolved: plan.candidate.unresolved,
    readyRanks: plan.opponents.filter(x => x.status === 'ready').map(x => x.rank),
    unavailableSourceRanks: plan.opponents.filter(
      x => x.status === 'missing-published-list').map(x => x.rank),
    blockedRanks: plan.opponents.filter(x => x.status === 'unresolved-printings')
      .map(x => ({
        rank: x.rank, player: x.player, archetype: x.archetype,
        unresolved: x.unresolved.map(row => ({
          name: row.name, printing: row.printing, reason: row.reason
        }))
      })),
    semanticSupportVerified: false,
    paperLegalityVerified: false
  };
}

/**
 * Run a bounded feasibility pilot. This is never a competitive win-rate claim.
 * @param {{candidate?:number|object,gamesPerSeat?:number,seedBase?:number,maxActions?:number}} options
 */
function runAichiPilot(options = {}) {
  const plan = planAichi(options.candidate || 1);
  const report = evaluatePlan(plan, {
    runMatch, gamesPerSeat: options.gamesPerSeat || 1,
    seedBase: options.seedBase || 20261015,
    maxActions: options.maxActions || 600
  });
  return { plan: summarisePlan(plan), evaluation: report };
}

if (require.main === module) {
  console.log(JSON.stringify(summarisePlan(planAichi()), null, 2));
}

module.exports = { planAichi, summarisePlan, runAichiPilot };
