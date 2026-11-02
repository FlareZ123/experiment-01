'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  preflight, disposition, runCanary, PROFILE_BLOB, REGISTRATION_BLOB
} = require('../simulation/evaluation/agent21-single-profile-rank5-canary.cjs');

test('externally pinned one-profile registration selects exactly eight source arms', () => {
  const {profile, registration, trials} = preflight({pinNative: false});
  assert.match(PROFILE_BLOB, /^[a-f0-9]{40}$/);
  assert.match(REGISTRATION_BLOB, /^[a-f0-9]{40}$/);
  assert.equal(registration.plannedArms, 8);
  assert.equal(trials.length, 8);
  assert.equal(new Set(trials.map(t => t.id)).size, 8);
  assert.deepEqual(new Set(trials.map(t => t.candidateSlot)), new Set(['A', 'B']));
  assert.deepEqual(new Set(trials.map(t => t.candidateId)),
    new Set(['champion-reference', 'new-moon-lockbreaker-v1']));
  assert.equal(profile.candidatePrinted60Evidence.newMoonProxyGitBlobSha,
    'd9777831271bec8c4ac400d0a2d9f49cc03c630b');
  assert.notEqual(profile.candidatePrinted60Evidence.newMoonSource52GitBlobSha,
    profile.candidatePrinted60Evidence.newMoonProxyGitBlobSha);
  assert.equal(profile.selectedPolicyOptions.actorOnlyComposition, true);
  assert.equal(profile.selectedPolicyOptions.paperQuickBallPayment, true);
  assert.equal(profile.selectedPolicyOptions.paperSecretBoxPayment, true);
  assert.equal(profile.selectedPolicyOptions.sharedPaperPaymentPortfolio, true);
  assert.equal(Object.keys(profile).filter(key => key === 'policyModes').length, 0);
});

test('one injected symmetric selected mode preserves source pairs and remains unqualified', () => {
  let called = 0;
  const output = runCanary({skipNativePin: true, runDevelopment: opts => {
    called++;
    assert.equal(opts.registeredFrameName,
      'agent21-one-selected-rank5-bilateral-canary-v1');
    assert.equal(opts.actorMewGenesectTechnoBlast, true);
    assert.equal(opts.paperSecretBoxPayment, true);
    assert.equal(opts.paperQuickBallPayment, true);
    assert.equal(opts.sharedPaperPaymentPortfolio, true);
    assert.equal(opts.registeredTrials.length, 8);
    return {
      attempted: 8,
      rows: opts.registeredTrials.map(trial => ({
        trial, finished: true, verifiedFirstTurn: true,
        actualStarterSeat: trial.candidateSlot === 'A' ? 1 : 0,
        sourceDealFingerprint: trial.rank + ':' + trial.repeat +
          ':' + trial.candidateSlot,
        attackDeclarations: {source: 1}
      }))
    };
  }});
  assert.equal(called, 1);
  assert.equal(output.retainedArms, 8);
  assert.equal(output.gates.CONFIG_FROZEN, true);
  assert.equal(output.gates.BOTH_SEATS_EXECUTED, false);
  assert.equal(output.gates.PAPER_PAYMENT_VERIFIED, false);
  assert.equal(output.gates.SOURCE_PAYOFF_WITNESSED, false);
  assert.equal(output.competitiveQualifiedGames, 0);
  assert.equal(output.certifiedWinRate, null);
  assert.equal(output.attempts.every(a =>
    a.status === 'ENGINE_TERMINAL_UNQUALIFIED'), true);
  assert.equal(output.sourcePhysicalDealPairs.every(p =>
    p.sourcePhysicalDealPairStatus === 'EXACT_SOURCE_DEAL_MATCH'), true);
});

test('unexpected ambient AGENT policy switches fail before runner invocation', () => {
  const previous = process.env.AGENT999_UNREGISTERED_POLICY_DEV;
  let called = false;
  try {
    process.env.AGENT999_UNREGISTERED_POLICY_DEV = 'true';
    assert.throws(() => runCanary({
      skipNativePin: true,
      runDevelopment: () => { called = true; }
    }), /Ambient AGENT policy override/);
    assert.equal(called, false);
  } finally {
    if (previous === undefined) delete process.env.AGENT999_UNREGISTERED_POLICY_DEV;
    else process.env.AGENT999_UNREGISTERED_POLICY_DEV = previous;
  }
});

test('one fatal batch error retains every registered attempt with unknown outcome', () => {
  const output = runCanary({skipNativePin: true,
    runDevelopment: () => { throw new Error('native setup fixture error'); }});
  assert.equal(output.retainedArms, 8);
  assert.match(output.batchError, /native setup fixture error/);
  assert.equal(output.attempts.filter(a =>
    a.status === 'BATCH_ABORT_UNEXECUTED_OR_UNKNOWN').length, 8);
  assert.equal(output.sourcePhysicalDealPairs.every(p =>
    p.sourcePhysicalDealPairStatus === 'UNVERIFIED'), true);
  assert.equal(output.gates.BOTH_SEATS_EXECUTED, false);
  assert.equal(output.competitiveQualifiedGames, 0);
});

test('native disposition respects invalid payment and physical zone outcomes', () => {
  assert.equal(disposition(null), 'MISSING_NATIVE_ROW');
  assert.equal(disposition({status: 'engine-physical-invalid'}),
    'PHYSICAL_ZONE_INVALID');
  assert.equal(disposition({status: 'paper-supporter-quota-veto'}), 'PAPER_VETO');
  assert.equal(disposition({status: 'engine-error', error: 'rejected'}),
    'NATIVE_ERROR');
  assert.equal(disposition({finished: true}), 'ENGINE_TERMINAL_UNQUALIFIED');
  assert.equal(disposition({finished: false}), 'CENSORED_OR_UNFINISHED');
  assert.equal(disposition({}), 'UNVERIFIED_NATIVE_DISPOSITION');
});

test('native pin can only be bypassed with a real injected test runner', () => {
  assert.throws(() => runCanary({skipNativePin: true}),
    /only with an injected test runner/);
});
