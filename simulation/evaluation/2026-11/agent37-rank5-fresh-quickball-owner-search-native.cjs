'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {runDevelopment} =
  require('../agent41-bilateral-v2-development.cjs');
const {sourceSummary} =
  require('../agent37-rank5-fusion-mobility-prospective.cjs');
const {saveAtomic} =
  require('../agent37-rank5-source-quickball-discard-retrospective.cjs');

const VERSION = 'agent37-rank5-independent-mew-owner-search-native-v1';
const ROOT = path.resolve(__dirname, '../../..');
const REGISTRATION =
  'results/aichi-2026/registrations/agent37-rank5-quickball-search-independent-20261109.json';
const OUTPUT = path.join(ROOT, 'agent37-rank5-fresh-quickball-owner-search-16arm.json');
const SOURCE_SHA =
  'a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05';

/** @returns {{reg:object,sha256:string,trials:object[]}} */
function readFrozenRegistration() {
  const bytes = fs.readFileSync(path.join(ROOT, REGISTRATION));
  const reg = JSON.parse(bytes.toString('utf8'));
  assert.equal(reg.schema, 'agent37-rank5-independent-quickball-source-search-v1');
  assert.equal(reg.status, 'frozen-prior-to-first-native-attempt');
  assert.equal(reg.originalRank, 5);
  assert.equal(reg.originalSourcePrinted60Sha256, SOURCE_SHA);
  assert.equal(reg.noPostOutcomeExclusions, true);
  assert.deepEqual(reg.candidateIds,
    ['champion-reference', 'new-moon-lockbreaker-v1']);
  assert.equal(reg.plannedNativeAttempts, 16);
  assert.equal(reg.registeredGroups.length, 4);
  const ids = new Set();
  for (const group of reg.registeredGroups) {
    assert.equal(group.rank, 5);
    assert.ok(['A', 'B'].includes(group.candidateSlot));
    assert.ok(Number.isSafeInteger(group.repeat) && group.repeat >= 0);
    assert.ok(Number.isSafeInteger(group.seed) &&
      group.seed > 0 && group.seed < 0x80000000);
    assert.ok(!ids.has(group.seed), 'Independent source seeds must be distinct');
    ids.add(group.seed);
  }
  for (const seat of ['A', 'B']) {
    assert.equal(reg.registeredGroups.filter(x => x.candidateSlot === seat).length, 2);
  }
  for (const oldSeed of reg.previousRetrospectiveSeedsExcluded) {
    assert.ok(!ids.has(oldSeed), 'No reused retrospective deal');
  }
  const roster = require('../../../results/aichi-2026/original-printed60-admission-v1.json');
  const original = roster.rows.find(x => x.rank === 5);
  assert.equal(original?.physicalCards, 60);
  assert.equal(original.printed60Sha256, SOURCE_SHA);
  const trials = reg.registeredGroups.flatMap(group =>
    reg.candidateIds.map(candidateId => ({
      ...group, candidateId,
      id: [group.rank, group.repeat, group.candidateSlot, candidateId].join(':')
    })));
  assert.equal(trials.length, 8);
  return {
    reg, trials,
    sha256: createHash('sha256').update(bytes).digest('hex')
  };
}

/**
 * Compare owner-visible native search against a pre-frozen generic owner
 * control on the same physical source/candidate sixties and opening seed.
 * All winning, capped and erroneous rows stay in the saved result.
 * @returns {object}
 */
function runFresh() {
  const {reg, trials, sha256} = readFrozenRegistration();
  const baseline = require('../agent41-frozen-bilateral-development-v2.json')
    .policyOptions;
  assert.equal(baseline.actorOnlyComposition, true);
  const common = {
    ...baseline,
    actorNaturalEvolutionRoot: true,
    actorMewGenesectTechnoBlast: true,
    sourceScopedQuickBallRoot: true,
    actorHandDiscard: true,
    actorOnlySingleSearch: true,
    actorDceMewMobilityRoot: true,
    actorGenesectFusionDrawRoot: true
  };
  const policies = {
    genericOwnerSearch: {...common, actorMewGenesectQuickBallSearch: false},
    mewGenesectOwnerSearch: {...common, actorMewGenesectQuickBallSearch: true}
  };
  const modes = {};
  for (const [name, policy] of Object.entries(policies)) {
    try {
      const native = runDevelopment({
        ...policy,
        registeredTrials: trials,
        registeredFrameName: VERSION + '-' + name,
        allowAdditionalOriginalSourceRanks: true
      });
      assert.equal(native.attempted, 8);
      assert.deepEqual(native.rows.map(x => x.trial.id),
        trials.map(x => x.id));
      modes[name] = {
        attempts: native.rows.map(row => ({
          trial: row.trial,
          summary: sourceSummary(row),
          nativeStatus: row.status ?? null,
          rawNativeRow: row
        })),
        nativeReport: native,
        batchError: null
      };
    } catch (error) {
      modes[name] = {
        attempts: trials.map(trial => ({
          trial,
          summary: {nativeDisposition: 'NATIVE_BATCH_ERROR',
            sourceDealFingerprint: null,
            fullPhysicalDealFingerprint: null,
            sourceAttackDeclarations: null,
            competitiveGameQualified: false},
          nativeStatus: 'batch-error',
          rawNativeRow: null
        })),
        nativeReport: null,
        batchError: String(error?.stack ?? error)
      };
    }
  }
  const comparisons = trials.map((trial, index) => {
    const control = modes.genericOwnerSearch.attempts[index];
    const treatment = modes.mewGenesectOwnerSearch.attempts[index];
    const a = control.summary, b = treatment.summary;
    const matchedSource = Boolean(a.sourceDealFingerprint &&
      b.sourceDealFingerprint &&
      a.sourceDealFingerprint === b.sourceDealFingerprint);
    const matchedFull = Boolean(a.fullPhysicalDealFingerprint &&
      b.fullPhysicalDealFingerprint &&
      a.fullPhysicalDealFingerprint === b.fullPhysicalDealFingerprint);
    const matched = matchedSource && matchedFull;
    return {
      trial, matchedSource, matchedFull, matched,
      control: {
        disposition: a.nativeDisposition, status: control.nativeStatus,
        sourceSeat: a.sourceSeat ?? null,
        sourceAttacks: a.sourceAttackDeclarations
      },
      treatment: {
        disposition: b.nativeDisposition, status: treatment.nativeStatus,
        sourceSeat: b.sourceSeat ?? null,
        sourceAttacks: b.sourceAttackDeclarations
      },
      sourceAttackDelta: matched &&
        Number.isSafeInteger(a.sourceAttackDeclarations) &&
        Number.isSafeInteger(b.sourceAttackDeclarations)
        ? b.sourceAttackDeclarations - a.sourceAttackDeclarations
        : null,
      competitiveQualified: false
    };
  });
  return {
    schema: VERSION,
    preregistrationPath: REGISTRATION,
    preregistrationSha256: sha256,
    sourcePrinted60Sha256: SOURCE_SHA,
    frozenCandidateIds: reg.candidateIds,
    developerOnly: true,
    zeroPostOutcomeExclusions: true,
    expectedNativeAttempts: 16,
    attemptedByMode: Object.fromEntries(Object.entries(modes).map(
      ([k, v]) => [k, v.attempts.length])),
    physicallyMatchedSourceAndFullPairs: comparisons.filter(x => x.matched).length,
    comparisons,
    modes,
    competitiveQualifiedGames: 0,
    certifiedWinRate: null,
    qualificationVetoes: reg.explicitQualificationVetoes
  };
}

if (require.main === module) {
  if (process.argv.includes('--inspect-only')) {
    const x = readFrozenRegistration();
    process.stdout.write(JSON.stringify({
      schema: VERSION, registrationSha256: x.sha256,
      trials: x.trials.map(t => t.id),
      expectedNativeAttempts: x.reg.plannedNativeAttempts
    }, null, 2) + '\n');
  } else {
    const result = runFresh();
    saveAtomic(OUTPUT, result);
    process.stdout.write(JSON.stringify({
      schema: result.schema,
      preregistrationSha256: result.preregistrationSha256,
      attempts: result.attemptedByMode,
      physicallyMatchedPairs: result.physicallyMatchedSourceAndFullPairs,
      comparison: result.comparisons,
      batchErrors: Object.fromEntries(Object.entries(result.modes)
        .filter(([, v]) => v.batchError)
        .map(([k, v]) => [k, v.batchError])),
      competitiveQualifiedGames: 0
    }, null, 2) + '\n');
    if (Object.values(result.modes).some(mode => mode.batchError)) {
      process.exitCode = 1;
    }
  }
}

module.exports = {VERSION, REGISTRATION, OUTPUT, readFrozenRegistration, runFresh};
