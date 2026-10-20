'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  developmentTrials, executeDevelopment
} = require('./agent41-bilateral-v2-development.cjs');
const {
  withOwnerEnergyWindowAudit
} = require('../twinleaf/owner-energy-window-audit.cjs');

const ROOT_SHA = '87ef423a77ec6aafd6063fd3ad054ce3f9d29806a52ab04f21c1c6bb0e1495e4';

/**
 * Replay exactly the previously observed 260-root rank6 New Moon failure.
 * The sole intervention is a read-only owner Energy and Powerglass observer.
 * The unchanged root history digest is a noninterference precondition.
 *
 * @returns {object} Machine-readable real Store diagnostic, not a game win.
 */
function replayRank6EnergyWindow() {
  const {planAichi} = require('./aichi-pilot.cjs');
  const {loadNewMoonCandidate} =
    require('../../scripts/aichi-new-moon-candidate.cjs');
  const root = path.resolve(__dirname, '../..');
  const decklist = JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'), 'utf8'));
  const manifest = {
    label: 'new-moon-lockbreaker-v1',
    cards: loadNewMoonCandidate().cards
  };
  assert.equal(manifest.cards.reduce((n, card) => n + card.count, 0), 60);
  const plan = planAichi(manifest, {
    allowEquivalentBasicEnergies: true,
    allowBasicEnergyMirrorPrintings: true,
    allowJapanesePromoHooks: true
  });
  const source = plan.opponents.find(row => row.rank === 6);
  assert.equal(source?.status, 'ready');
  const prepared = new Map([['new-moon-lockbreaker-v1', {plan}]]);
  const trial = developmentTrials().find(row =>
    row.id === '6:0:A:new-moon-lockbreaker-v1');
  assert.ok(trial, 'Frozen rank6 New Moon 260-root arm missing');
  const observed = withOwnerEnergyWindowAudit(0, () =>
    executeDevelopment(trial, prepared, {
      compressorPayload: true,
      opportunityAudit: true,
      lateCompressorPayload: true
    }));
  const game = observed.result;
  assert.equal(game.trial.id, trial.id);
  assert.equal(game.verifiedFirstTurn, true);
  assert.equal(game.actualStarterSeat, 0);
  assert.equal(game.sourceSeat, 1);
  assert.equal(game.candidateSeat, 0);
  assert.equal(game.actionCount, 260);
  assert.equal(game.attackDeclarations.candidate, 0);
  assert.equal(game.rootActionLedgerSha256, ROOT_SHA,
    'Read-only adapter or upstream revisions changed original root history');
  const finalGengar = game.finalBoard?.[0]?.active;
  assert.equal(finalGengar?.name, 'Gengar & Mimikyu-GX');
  assert.ok(finalGengar.toolCards.includes('Powerglass'));
  assert.deepEqual(finalGengar.energyCards, []);
  assert.equal(observed.audit.candidateSeat, 0);

  return {
    schema: 'agent43-authentic-rank6-owner-energy-window-v1',
    evidenceClass: 'historical-development-observation',
    qualifiesForCompetitiveInference: false,
    trial: game.trial,
    baselineRootSha256: ROOT_SHA,
    observedRootSha256: game.rootActionLedgerSha256,
    sameRootHistory: true,
    sourcePhysicalDealFingerprint: game.sourceDealFingerprint,
    policyVersion: game.policyVersion,
    originalCandidateSetup: {
      ownerDecisions: game.ownerCompressorOpportunityAudit?.observedOwnerRootDecisions,
      ownTurns: game.ownerCompressorOpportunityAudit?.observedOwnTurns,
      candidateAttacks: game.attackDeclarations.candidate,
      finalGengar
    },
    ownerEnergyWindow: observed.audit,
    limits: [
      'Retrospective first-start selected only for causal diagnosis',
      'Nominal Energy resources do not prove legal or optimal choices',
      'Powerglass-like prompt signature is not guaranteed reducer provenance',
      'Generic two-sided bot remains hidden-information and competence unqualified',
      'Printed paper legality, clock and game win rate remain unqualified'
    ]
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(replayRank6EnergyWindow(), null, 2)+'\n');
}

module.exports = {ROOT_SHA, replayRank6EnergyWindow};
