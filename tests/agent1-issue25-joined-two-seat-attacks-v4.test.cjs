'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const test = require('node:test');
const {
  VERSION, withJoinedOwnerAttackFrontier, runJoinedIssue25V4
} = require('../simulation/evaluation/agent1-issue25-joined-two-seat-attacks-v4.cjs');
const {SELECTED_OUTER_TO_INNER} =
  require('../simulation/evaluation/agent36-issue25-selected-v0.cjs');

function noOpOwnerLayers() {
  const entered = [];
  const layers = {};
  for (const name of SELECTED_OUTER_TO_INNER.slice(0, -1)) {
    layers[name] = next => {
      entered.push(name);
      return {result: next(), audit: {name}};
    };
  }
  return {layers, entered};
}

test('joined v4 actually runs common resources for both seats and one printed attack boundary', () => {
  const {layers, entered} = noOpOwnerLayers();
  let runnerOptions = null;
  const out = runJoinedIssue25V4({
    layers,
    attackLayer: next => {
      entered.push('joined-printed-attack');
      return {
        result: next(),
        audit: {
          sourceStampedFutureSight: {ownerPromptSelections: 1},
          printedAttackOrigins: {decisionActionsIssuedByObserver: 0},
          sourceStampedNightWatch: {acceptedDispatches: 1},
          preRunUnpredictableSeedCommitmentSha256: 'a'.repeat(64)
        }
      };
    },
    runner: options => {
      runnerOptions = options;
      return {sourceIndependentCommonPolicyOptIn: true, rows: []};
    }
  });
  assert.deepEqual(runnerOptions, {
    actorOnlyComposition: true,
    nativeRootActionLimit: 48,
    sourceIndependentCommonPolicy: true
  });
  assert.deepEqual(entered, [
    ...SELECTED_OUTER_TO_INNER.slice(0, -2),
    'joined-printed-attack'
  ]);
  assert.equal(out.manifest.version, VERSION);
  assert.equal(out.manifest.actualRunnerConfirmedOption, true);
  assert.equal(out.manifest.sourceIndependentCommonPolicy, true);
  assert.equal(out.manifest.sourceSpecificResourceScriptsSelected, false);
  assert.equal(out.manifest.sourceStampedFutureSightSelected, true);
  assert.equal(out.manifest.sourceStampedNightWatchSelected, true);
  assert.equal(out.manifest.nightWatchPublicFixedSeedSelected, false);
  assert.equal(out.manifest.nightWatchPrivateSeedCommitmentSha256,
    'a'.repeat(64));
  assert.equal(out.diagnostic.sourceStampedNightWatch.acceptedDispatches, 1);
  assert.equal(out.diagnostic.sourceStampedFutureSight.ownerPromptSelections, 1);
  assert.equal(out.diagnostic.printedAttackOrigins.decisionActionsIssuedByObserver, 0);
  assert.equal(out.manifest.fullDecisionPolicySymmetryCertified, false);
  assert.equal(out.manifest.releaseQualified, false);
  assert.equal(out.diagnostic.competitiveGamesQualified, 0);
  assert.equal(out.diagnostic.allRegisteredAttemptsReturned, false);
  assert.ok(out.manifest.resolvedSourceAndPolicyHashes.every(x =>
    /^[a-f0-9]{64}$/.test(x.sha256)));
});

test('run-private seed is generated once, committed, and passed only to printed Night Watch', () => {
  const trace = [];
  const bytes = Buffer.alloc(32, 0x42);
  const seed = bytes.toString('hex');
  const next = () => { trace.push('native'); return 'NATIVE'; };
  const out = withJoinedOwnerAttackFrontier(next, {
    randomBytes: count => {
      assert.equal(count, 32);
      trace.push('entropy');
      return Buffer.from(bytes);
    },
    printedLayer: child => {
      trace.push('printed:enter');
      const result = child();
      trace.push('printed:leave');
      return {result, audit: {
        printedAttackOrigins: {decisionActionsIssuedByObserver: 0},
        sourceStampedFutureSight: {ownerPromptSelections: 2}
      }};
    },
    nightWatchLayer: (child, options) => {
      assert.equal(options.committedSeed, seed);
      assert.equal(options.followSequentialNativeStores, true);
      assert.equal(options.perNativeStoreEntropy, true);
      trace.push('nightwatch:enter');
      const result = child();
      trace.push('nightwatch:leave');
      return {result, audit: {sourcePromptMarks: 3}};
    }
  });
  assert.equal(out.result, 'NATIVE');
  assert.deepEqual(trace, [
    'entropy', 'printed:enter', 'nightwatch:enter',
    'native', 'nightwatch:leave', 'printed:leave'
  ]);
  assert.equal(out.audit.preRunUnpredictableSeedCommitmentSha256,
    crypto.createHash('sha256').update(seed).digest('hex'));
  assert.equal(out.audit.sourceStampedNightWatch.sourcePromptMarks, 3);
  assert.equal(out.audit.fullPaperRandomnessCertified, false);
  assert.equal(out.audit.competitivelyQualifiedGames, 0);
});

test('invalid entropy is rejected before the native game or any card choice', () => {
  let executed = false;
  assert.throws(() => withJoinedOwnerAttackFrontier(() => {
    executed = true;
  }, {randomBytes: () => Buffer.alloc(16)}), /256-bit OS entropy/);
  assert.equal(executed, false);
});

test('native failure remains a failed unqualified four-arm reconciliation', () => {
  const {layers} = noOpOwnerLayers();
  const result = runJoinedIssue25V4({
    layers,
    attackLayer: next => ({result: next(), audit: {}}),
    runner: () => { throw new Error('native attack blocker'); }
  });
  assert.equal(result.diagnostic.thrownMessage, 'native attack blocker');
  assert.equal(result.diagnostic.joinedAttackWrapperObserved, false);
  assert.equal(result.diagnostic.allRegisteredAttemptsReturned, false);
  assert.equal(result.manifest.releaseQualified, false);
  assert.equal(result.diagnostic.competitiveGamesQualified, 0);
});
