'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const registration = require('../../results/aichi-2026/registrations/agent10-rank11-heldout-headway-4seed-20261103.json');
const profile = require('./agent41-frozen-bilateral-development-v2.json');
const {treatmentOptions} = require('./agent10-rank9-known-dead-attack-counterfactual.cjs');
const {firstDifferent} = require('./agent10-rank11-funding-mobility-disaggregation.cjs');

const ROOT = path.resolve(__dirname, '../..');
const VERSION = 'agent10-rank11-heldout-headway-4seed-v1';

/** @param {object} row @param {0|1} sourceSeat */
function sourceTrace(row, sourceSeat) {
  const roots = row.rootActionLedger ?? [];
  const attacks = roots.filter(x =>
    x.playerSlot === sourceSeat && x.action === 'AttackAction');
  const acceptedEnergy = (row.nativeAcceptedTargetSidecar?.events ?? [])
    .filter(x => x.playerSlot === sourceSeat &&
      x.storeAccepted === true &&
      x.declared?.ownerHandPrinting === 'Darkness Energy MEE')
    .map(x => ({
      turn: x.turnBefore,
      ownerHandPrinting: x.declared.ownerHandPrinting,
      declaredTarget: x.declared.target ?? null,
      publicBoardChanges: x.publicBoardChanges ?? []
    }));
  const claws = row.sourceAttackSettlement?.attacks?.filter(x =>
    x.attackName === 'Claw of Darkness') ?? [];
  return {
    sourceSeat,
    firstClaw: attacks.find(x => x.attack === 'Claw of Darkness')?.turnBefore ?? null,
    sourceClawDeclarations: attacks.filter(x =>
      x.attack === 'Claw of Darkness').length,
    sourceMotivateDeclarations: attacks.filter(x =>
      x.attack === 'Motivate').length,
    sourceRetreatDeclarations: roots.filter(x =>
      x.playerSlot === sourceSeat && x.action === 'RetreatAction').length,
    acceptedPhysicalDarknessRecipients: acceptedEnergy,
    clawSettlements: claws.map(x => ({
      turn: x.turnBefore,
      settled: x.settledPromptChain ?? null,
      prizesBefore: x.prizesBefore ?? null,
      prizesAfter: x.prizesAfter ?? null,
      nextOpponentRoot: x.nextSourceRoot ?? null,
      nextOpponentSameEpoch: x.nextSourceSameEpochProven ?? null
    }))
  };
}

/** @param {object} row */
function nativeStatus(row) {
  return {
    finished: row.finished ?? null,
    nativeWinner: row.finished ? row.winner : null,
    endReason: row.endReason ?? null,
    actionCount: row.actionCount ?? null,
    error: row.error ?? null,
    prizes: row.finalPrizes ?? null,
    qualifiedPaperGame: false
  };
}

/**
 * Audit all factors within each candidate-specific physical deal, and separately
 * disclose cross-candidate source deal equality, which shared seeds do not assure.
 * @param {object[]} rows
 * @param {object} reference
 */
function integrity(rows, reference) {
  return rows.map(row => ({
    sameSourcePrinted60: row.sourceDeckFingerprint === reference.sourceDeckFingerprint,
    sameCandidatePrinted60: row.candidateDeckFingerprint === reference.candidateDeckFingerprint,
    fullPhysicalDealPresent: typeof row.fullPhysicalDealFingerprint === 'string',
    sameBothPlayerPhysicalDeal:
      typeof row.fullPhysicalDealFingerprint === 'string' &&
      row.fullPhysicalDealFingerprint === reference.fullPhysicalDealFingerprint,
    sameSourcePhysicalDeal:
      row.sourceDealFingerprint === reference.sourceDealFingerprint,
    sameNativeStarter: row.actualStarterSeat === reference.actualStarterSeat
  }));
}

function run() {
  assert.equal(registration.schema,
    'agent10-rank11-prospective-active-headway-4seed-symmetric-factors-v1');
  const trials = registration.trialRows;
  assert.equal(trials.length, 8);
  assert.equal(new Set(trials.map(x => x.id)).size, 8);
  assert.equal(registration.totalNativeAttempts, 24);
  require('./agent41-frozen-bilateral-development-v1.cjs')
    .assertPinnedNativeStore(ROOT, profile);
  const previous = {};
  for (const [key, value] of Object.entries(profile.injectedResearchEnvironment)) {
    previous[key] = process.env[key];
    process.env[key] = value;
  }
  const factorRows = {};
  try {
    const evaluate = require('./agent41-bilateral-v2-development.cjs').runDevelopment;
    for (const [factor, opts] of Object.entries(registration.factors)) {
      const result = evaluate({
        ...treatmentOptions(),
        ...opts,
        actorFlexiblePaidRetreatRoot: false,
        registeredTrials: trials,
        allowAdditionalOriginalSourceRanks: true,
        registeredFrameName: VERSION + '-' + factor
      });
      assert.equal(result.attempted, trials.length);
      assert.equal(result.rows.length, trials.length);
      factorRows[factor] = result;
    }
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }

  const factors = Object.keys(registration.factors);
  const records = trials.map((trial, i) => {
    const sourceSeat = trial.candidateSlot === 'A' ? 1 : 0;
    const control = factorRows.control.rows[i];
    const rows = factors.map(name => factorRows[name].rows[i]);
    for (const row of rows) assert.equal(row.trial.id, trial.id);
    const matching = integrity(rows, control);
    return {
      trialId: trial.id, originalSourceRank: trial.rank, sourceSeat,
      originalSourceSeed: trial.seed, candidateId: trial.candidateId,
      integrity: Object.fromEntries(factors.map((name, j) =>
        [name, matching[j]])),
      cases: Object.fromEntries(factors.map((name, j) => [name, {
        rootFirstDifferenceFromControl:
          firstDifferent(control.rootActionLedger ?? [],
            rows[j].rootActionLedger ?? []),
        source: sourceTrace(rows[j], sourceSeat),
        native: nativeStatus(rows[j])
      }]))
    };
  });
  const crossCandidateSourceParity = [];
  for (let i = 0; i < trials.length; i += 2) {
    assert.equal(trials[i].seed, trials[i+1].seed);
    for (const factor of factors) {
      const a = factorRows[factor].rows[i];
      const b = factorRows[factor].rows[i+1];
      crossCandidateSourceParity.push({
        sourceSeed: trials[i].seed,
        sourceSeat: trials[i].candidateSlot === 'A' ? 1 : 0,
        factor,
        bothSourceDigestsPresent:
          typeof a.sourceDealFingerprint === 'string' &&
          typeof b.sourceDealFingerprint === 'string',
        matchingSourcePhysicalDeal:
          a.sourceDealFingerprint === b.sourceDealFingerprint,
        matchingActualStarter: a.actualStarterSeat === b.actualStarterSeat
      });
    }
  }
  const allWithinCandidateParity = records.every(r =>
    Object.values(r.integrity).every(g =>
      g.sameSourcePrinted60 && g.sameCandidatePrinted60 &&
      g.fullPhysicalDealPresent && g.sameBothPlayerPhysicalDeal &&
      g.sameSourcePhysicalDeal && g.sameNativeStarter));
  return {
    schema: VERSION,
    registrationFile:
      'results/aichi-2026/registrations/agent10-rank11-heldout-headway-4seed-20261103.json',
    nativeVendorRevision: profile.pinnedVendorRevision,
    researchHead: process.env.GITHUB_SHA ?? null,
    preregistered: true,
    independentOriginalSourceSeedGroups: 4,
    candidateSpecificPhysicalDeals: 8,
    actualNativeAttempts: factors.length * trials.length,
    withinCandidateFactorPhysicalParity: allWithinCandidateParity,
    crossCandidateSourceParity,
    records,
    rawFactors: factorRows,
    competitiveQualifiedGames: 0,
    caveat: 'Fresh four-seed original rank11 source exploratory policy replication; no paper-valid or 25-minute-qualified games. Do not treat seed equality as cross-candidate physical identity or engine winners as competitive wins.'
  };
}

if (require.main === module) {
  const result = run();
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  assert.equal(result.actualNativeAttempts, 24);
  assert.equal(result.withinCandidateFactorPhysicalParity, true);
}

module.exports = {VERSION, sourceTrace, nativeStatus, integrity, run};
