'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');
const {runStewardInnermostPrizeV5} =
  require('../simulation/evaluation/agent36-issue25-steward-innermost-prize-v5.cjs');
const {runIssue25V5WithTelepath} =
  require('../simulation/evaluation/agent8-issue25-v5-telepath-development.cjs');
const {writeReceipt} =
  require('../simulation/evaluation/agent1-issue25-v4-public-receipt.cjs');

test('retrospective original-eight native v5 vs same-deal Telepath search, failure inclusive', () => {
  const control = runStewardInnermostPrizeV5();
  const treatment = runIssue25V5WithTelepath();
  const original = new Map(control.diagnostic.selectedNativeAttempts
    .map(row => [row.id, row]));
  const rows = treatment.diagnostic.selectedNativeAttempts;
  const pairs = rows.map(row => {
    const before = original.get(row.id);
    return {
      id: row.id,
      v5Status: before?.status ?? null,
      plusTelepathStatus: row.status,
      v5NativeRoots: before?.rootCount ?? null,
      plusTelepathNativeRoots: row.rootCount,
      sameInitialSourceDeal: !!row.sourcePhysicalDealFingerprint &&
        row.sourcePhysicalDealFingerprint === before?.sourcePhysicalDealFingerprint,
      sameInitialEntireDeal: !!row.fullPhysicalDealFingerprint &&
        row.fullPhysicalDealFingerprint === before?.fullPhysicalDealFingerprint,
      sourceAttackSettlement: row.sourceAttackCount ?? null,
      nativeAbortRootLedgerStatus: row.abortRootLedgerStatus ?? null
    };
  });
  const ownerAudit = treatment.diagnostic.nativeOwnerTelepathicAudit;
  const suspect = pairs.find(row =>
    row.id === '11:102:A:new-moon-lockbreaker-v1');
  const dir = process.env.ISSUE25_AGENT8_TELEPATH_DIR;
  const archived = dir ? {
    control: writeReceipt(control, path.join(dir, 'control'), {
      prefix: 'issue25-steward-v5',
      policyEntryPoint: control.manifest.policyEntryPoint
    }),
    treatment: writeReceipt(treatment, path.join(dir, 'treatment'), {
      prefix: 'issue25-steward-v5',
      policyEntryPoint: treatment.manifest.policyEntryPoint
    })
  } : null;
  const report = {
    schema: 'agent8-issue25-telepath-v5-retrospective-eight-native-v1',
    sourcePolicy: control.manifest.version,
    treatmentPolicy: treatment.manifest.version,
    originalEight: treatment.diagnostic.registered,
    sourceIndependentBothSeats: ownerAudit.sourceIndependentBothSeats,
    actualNativeInnerMatchCalls: ownerAudit.nativeMatchCalls,
    ownerNativeSearchAttempts: ownerAudit.nativeMatchAttempts,
    sameRegistration: pairs.length === 8 &&
      pairs.every(row => original.has(row.id)),
    sameWithinArmSourcePhysicalStart: pairs.every(row =>
      row.sameInitialSourceDeal),
    sameWithinArmFullPhysicalStart: pairs.every(row =>
      row.sameInitialEntireDeal),
    root14Suspect: suspect,
    pairs,
    lockedOriginalArchives: archived,
    selectionCertified: false,
    paperGamesQualified: 0,
    fieldWinRate: null
  };
  console.log('AGENT8_ISSUE25_TELEPATH_RETRO_NATIVE', JSON.stringify(report));
  assert.equal(report.sameRegistration, true);
  assert.equal(report.sameWithinArmSourcePhysicalStart, true);
  assert.equal(report.sameWithinArmFullPhysicalStart, true);
  assert.equal(ownerAudit.nativeMatchCalls, 8);
  assert.equal(treatment.diagnostic.completeRegisteredAttemptReconciliation, true);
  assert.equal(treatment.manifest.releaseQualified, false);
  assert.equal(treatment.diagnostic.competitiveGamesQualified, 0);
});
