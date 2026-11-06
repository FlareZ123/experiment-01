'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {prereg} = require('../simulation/evaluation/agent31-crossrank5-11-floatstone-transfer.cjs');
const {preflight} = require('../simulation/evaluation/agent31-rank1-prospective-basic-recipient-pair.cjs');
const {runDevelopment} = require('../simulation/evaluation/agent41-bilateral-v2-development.cjs');
const {installUnderworldDoorPsychicRecipientHook} =
  require('../simulation/twinleaf/underworld-door-psychic-recipient-hook.cjs');
const {save} = require('../simulation/evaluation/agent43-guzma-original-source-pair.cjs');

const VERSION = 'agent31-all-owner-pass-retrospective-two-originals-v1';
const TRIAL_IDS = Object.freeze([
  '5:0:A:champion-reference',
  '11:3:B:champion-reference'
]);

/**
 * Reinspect two existing, outcome-known original source deals. The first is
 * a rank5 control; the second is the historical rank11 Float Stone positive.
 * This is an observational regression, never a new held-out sample.
 *
 * @returns {object} Complete original native rows plus Pass custody census.
 */
function run() {
  const registry = prereg();
  const registeredTrials = registry.trials.filter(row => TRIAL_IDS.includes(row.id));
  assert.equal(registeredTrials.length, TRIAL_IDS.length);
  assert.deepEqual(registeredTrials.map(row => row.id), [...TRIAL_IDS]);
  const previous = preflight();
  const options = {
    ...previous.registration.frozenCommonPolicy,
    registeredTrials,
    registeredFrameName: registry.schema,
    bilateralBasicEnergyRecipientFrontier: true,
    actorUnderworldDoorPromptOwner: true,
    actorUnderworldDoorRoot: true,
    actorFundedShadowRiderFloatStoneRoot: false,
    nativeAllOwnerPassFrontier: true
  };
  const old = process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
  process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV = 'true';
  const undo = installUnderworldDoorPsychicRecipientHook();
  let outcome;
  try {
    outcome = runDevelopment(options);
  } finally {
    undo();
    if (old === undefined) delete process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
    else process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV = old;
  }
  assert.equal(outcome.rows.length, TRIAL_IDS.length);
  const summary = outcome.rows.map(row => {
    const frontier = row.nativeAllOwnerPassFrontier ?? null;
    return {
      id: row.trial.id,
      status: row.status ?? 'unreported',
      sourceSeat: row.sourceSeat ?? null,
      candidateSeat: row.candidateSeat ?? null,
      seed: row.trial.seed,
      sourceDealFingerprint: row.sourceDealFingerprint ?? null,
      fullPhysicalDealFingerprint: row.fullPhysicalDealFingerprint ?? null,
      rootActionLedgerSha256: row.rootActionLedgerSha256 ?? null,
      nativeRootCount: row.rootActionLedger?.length ?? null,
      census: frontier ? {
        actualNativePassRoots: frontier.actualNativePassRoots,
        observedOwnerPassRoots: frontier.observedOwnerPassRoots,
        completeNativePassCoverage: frontier.completeNativePassCoverage,
        source: frontier.counts.source,
        candidate: frontier.counts.candidate
      } : null,
      error: row.error ?? null
    };
  });
  return {
    schema: VERSION,
    originalRegistration: registry.schema,
    originalRegisteredBeforeResults: registry.registeredBeforeNativeResults,
    historicalOutcomeKnownBeforeThisReplay: true,
    intervention: 'read-only nativeAllOwnerPassFrontier flag; same historical control actor policy',
    originalRank11PositiveSelectedRetrospectively: true,
    matchedControlAndRescueClaim: false,
    originalSourceRanks: [5, 11],
    selectedCompetitivePolicyChanged: false,
    competitivelyQualifiedGames: 0,
    summary,
    native: outcome
  };
}

test('all real owner Pass roots have a matching own-hand/public-board receipt', () => {
  const evidence = run();
  if (process.env.AGENT31_PASS_CENSUS_OUTPUT)
    save(process.env.AGENT31_PASS_CENSUS_OUTPUT, evidence);
  for (const row of evidence.summary) {
    assert.ok(row.census, 'Missing or aborted all-owner native Pass audit: ' +
      JSON.stringify({id: row.id, status: row.status, error: row.error}));
    assert.equal(row.census.completeNativePassCoverage, true);
    assert.equal(row.census.actualNativePassRoots,
      row.census.observedOwnerPassRoots);
    assert.equal(
      row.census.source.passes + row.census.candidate.passes,
      row.census.actualNativePassRoots);
  }
  console.log('AGENT31_ALL_OWNER_PASS_NATIVE ' +
    JSON.stringify({schema: VERSION, summary: evidence.summary,
      competitivelyQualifiedGames: 0}));
});

module.exports = {VERSION, TRIAL_IDS, run};
