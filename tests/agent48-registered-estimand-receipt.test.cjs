'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {registeredEstimandReceipt} =
  require('../simulation/evaluation/agent48-registered-estimand-receipt.cjs');

const A = 'a'.repeat(64), B = 'b'.repeat(64), C = 'c'.repeat(64);
const plan = (id, candidateId = 'champion', extra = {}) => ({
  id, rank: 5, seed: 101, candidateSlot: 'A', candidateId,
  candidatePrintSha256: candidateId === 'champion' ? A : B,
  sourcePrintSha256: C, ...extra
});
const native = (trial, extra = {}) => ({
  trial, status: 'engine-terminal', sourceDealFingerprint: A,
  fullPhysicalDealFingerprint: B, verifiedFirstTurn: true,
  actualStarterSeat: 1, sourceSeat: 1, ...extra
});
const compare = (id, leftId, rightId, purpose = 'same-60-policy-ab') =>
  ({id, leftId, rightId, purpose});

test('a genuine different-deck source deal mismatch remains in natural denominator', () => {
  const p = [plan('reference', 'champion'), plan('newmoon', 'newmoon')];
  const output = registeredEstimandReceipt(p, [
    native(p[0]), native(p[1], {sourceDealFingerprint: C,
      status: 'action-cap-or-incomplete'})
  ], [compare('same-seed', 'reference', 'newmoon',
    'different-60-fixed-opening')]);
  const pop = output.primaryNaturalGamePopulationRetained;
  assert.equal(pop.registeredAttempts, 2);
  assert.equal(pop.nativeRowsObserved, 2);
  assert.equal(pop.statusCounts['action-cap-or-incomplete'], 1);
  assert.equal(pop.crossDeckPhysicalParityUsedAsFilter, false);
  assert.equal(output.secondaryControlledPairPretreatmentParity[0].parity,
    'MISMATCHED');
  assert.equal(output.secondaryControlledPairPretreatmentParity[0]
    .onlyConditionalFixedOpeningDiagnostic, true);
});

test('an error and missing native row remain separate registered attempts', () => {
  const p = [plan('a'), plan('b'), plan('c')];
  const out = registeredEstimandReceipt(p, [
    native(p[0], {status: 'engine-error'}),
    native(p[1], {status: 'action-cap-or-incomplete'})
  ]);
  const pop = out.primaryNaturalGamePopulationRetained;
  assert.equal(pop.registeredAttempts, 3);
  assert.equal(pop.nativeRowsObserved, 2);
  assert.equal(pop.missingNativeRows, 1);
  assert.equal(pop.statusCounts['MISSING_NATIVE_ROW'], 1);
  assert.equal(pop.statusCounts['engine-error'], 1);
  assert.equal(pop.statusCounts['action-cap-or-incomplete'], 1);
  assert.equal(out.gameWinRateCertified, false);
});

test('same fixed 60, matched complete pretreatment custody qualifies only reported pairing', () => {
  const p = [plan('control'), plan('treatment')];
  const out = registeredEstimandReceipt(p, [native(p[0]), native(p[1])],
    [compare('ab', 'control', 'treatment')]);
  assert.equal(out.secondaryControlledPairPretreatmentParity[0].parity,
    'MATCHED_REPORTED_INITIAL_STATE');
  assert.equal(out.secondaryControlledPairPretreatmentParity[0]
    .competitiveInferenceQualified, false);
});

test('first-live hand mismatch is downstream and never filters the pair', () => {
  const p = [plan('control'), plan('treatment')];
  const out = registeredEstimandReceipt(p, [
    native(p[0], {sourceFirstOwnHandSha256: A}),
    native(p[1], {sourceFirstOwnHandSha256: C})
  ], [compare('ab', 'control', 'treatment')]);
  assert.equal(out.secondaryControlledPairPretreatmentParity[0].parity,
    'MATCHED_REPORTED_INITIAL_STATE');
  assert.equal(out.postTreatmentFirstLiveHandUsedForPairing, false);
});

test('unknown physical full deal cannot be inferred from identical source fingerprints', () => {
  const p = [plan('control'), plan('treatment')];
  const out = registeredEstimandReceipt(p, [
    native(p[0]), native(p[1], {fullPhysicalDealFingerprint: null})
  ], [compare('ab', 'control', 'treatment')]);
  assert.equal(out.secondaryControlledPairPretreatmentParity[0].parity,
    'UNKNOWN');
});

test('known source mismatch vetoes even if full deal custody is missing', () => {
  const p = [plan('control'), plan('treatment')];
  const out = registeredEstimandReceipt(p, [
    native(p[0], {fullPhysicalDealFingerprint: null}),
    native(p[1], {sourceDealFingerprint: C,
      fullPhysicalDealFingerprint: null})
  ], [compare('ab', 'control', 'treatment')]);
  assert.equal(out.secondaryControlledPairPretreatmentParity[0].parity,
    'MISMATCHED');
});

test('same candidate alias with a changed printed hash fails controlled pairing', () => {
  const p = [plan('control'), plan('treatment', 'champion',
    {candidatePrintSha256: C})];
  const out = registeredEstimandReceipt(p, [native(p[0]), native(p[1])],
    [compare('ab', 'control', 'treatment')]);
  assert.equal(out.secondaryControlledPairPretreatmentParity[0].parity,
    'MISMATCHED');
});

test('different fixed deck lists cannot masquerade as same-60 policy A/B', () => {
  const p = [plan('control', 'champion'), plan('treatment', 'newmoon')];
  const out = registeredEstimandReceipt(p, [native(p[0]), native(p[1])],
    [compare('wrong', 'control', 'treatment')]);
  assert.equal(out.secondaryControlledPairPretreatmentParity[0].parity,
    'INELIGIBLE_PLAN');
});

test('a stale native attempt identity fails closed', () => {
  const p = [plan('control')];
  assert.throws(() => registeredEstimandReceipt(p, [
    native(plan('other'))
  ]), /Unregistered native trial/);
  assert.throws(() => registeredEstimandReceipt(p, [
    native(p[0]), native(p[0])
  ]), /Duplicate native attempt/);
  assert.throws(() => registeredEstimandReceipt(p, [
    native({...p[0], seed: 202})
  ]), /differs from frozen registration/);
});

test('invalid comparison registrations do not create silently omitted pairs', () => {
  const p = [plan('control'), plan('treatment')];
  assert.throws(() => registeredEstimandReceipt(p, [], [
    compare('a', 'control', 'absent')
  ]), /unregistered trial/);
  assert.throws(() => registeredEstimandReceipt(p, [], [
    compare('a', 'control', 'treatment'),
    compare('a', 'control', 'treatment')
  ]), /Duplicate comparison ID/);
});
