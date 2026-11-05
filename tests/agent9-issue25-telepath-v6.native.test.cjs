'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {runStewardInnermostPrizeV5} =
  require('../simulation/evaluation/agent36-issue25-steward-innermost-prize-v5.cjs');
const {runTelepathV6} =
  require('../simulation/evaluation/agent9-issue25-telepath-v6-development.cjs');
const {writeReceipt} =
  require('../simulation/evaluation/agent1-issue25-v4-public-receipt.cjs');
const {classifySourceEnergyAttachment} =
  require('../simulation/evaluation/agent18-source-energy-physical-custody.cjs');

const TARGET = '11:102:A:new-moon-lockbreaker-v1';

/**
 * Inspect complete original attempts, including failures. Public root traces
 * are admissible observations; hidden owner deck contents are never printed.
 */
test('exact original eight v5/v6 Telepath comparison preserves initial physical deals', () => {
  const control = runStewardInnermostPrizeV5();
  const treatment = runTelepathV6();
  const original = new Map(control.diagnostic.selectedNativeAttempts.map(
    row => [row.id, row]
  ));
  const updated = treatment.diagnostic.selectedNativeAttempts;
  const pairs = updated.map(row => {
    const old = original.get(row.id);
    return {
      id: row.id,
      sourceSeat: row.sourceSeat,
      controlStatus: old?.status ?? null,
      treatmentStatus: row.status,
      controlRoots: old?.rootCount ?? null,
      treatmentRoots: row.rootCount,
      sourcePhysicalDealMatched: Boolean(old?.sourcePhysicalDealFingerprint) &&
        old.sourcePhysicalDealFingerprint === row.sourcePhysicalDealFingerprint,
      entirePhysicalDealMatched: Boolean(old?.fullPhysicalDealFingerprint) &&
        old.fullPhysicalDealFingerprint === row.fullPhysicalDealFingerprint,
      sourceAttackCount: row.sourceAttackCount,
      abortLedger: row.abortRootLedgerStatus
    };
  });
  const telemetry = treatment.diagnostic.telepathicOwnerContinuationAudit;
  const attempt = treatment.rawDevelopment?.rows?.find(row =>
    (row.trial?.id ?? row.id) === TARGET
  );
  const rootActions = attempt?.rootActionLedger ??
    attempt?.nativeAbortEvidence?.rootActionLedger ?? [];
  const targetSidecar = attempt?.status === 'engine-error' ?
    attempt.nativeAcceptedTargetSidecarAbort :
    attempt?.nativeAcceptedTargetSidecar;
  const targetPhysicalAttachments = (targetSidecar?.events ?? [])
    .filter(event => event.playerSlot === 0 &&
      event.action === 'PlayCardAction' &&
      event.declared?.ownerHandPrinting === 'Telepath [P] Energy M3')
    .map(event => classifySourceEnergyAttachment(
      event, 0, targetSidecar?.rootOrdinalLinked === true
    ));
  const publicLastRoots = rootActions.slice(-12).map(row => ({
    actionOrdinal: row.actionOrdinal ?? null,
    turn: row.turnBefore ?? null,
    seat: row.playerSlot ?? null,
    action: row.action ?? null,
    card: row.card ?? null,
    pendingPrompt: row.pendingPrompt ?? null
  }));
  const archiveDir = process.env.AGENT9_TELEPATH_V6_DIR;
  const archives = archiveDir ? {
    control: writeReceipt(control, path.join(archiveDir, 'control'), {
      prefix: 'issue25-steward-v5',
      policyEntryPoint: control.manifest.policyEntryPoint
    }),
    treatment: writeReceipt(treatment, path.join(archiveDir, 'treatment'), {
      prefix: 'issue25-steward-v5',
      policyEntryPoint: treatment.manifest.policyEntryPoint
    })
  } : null;
  const publicAudit = {
    schema: 'agent9-issue25-telepath-native-comparison-v1',
    actualCompiledSourceIdentity: treatment.manifest.runtimeGitAttestationStatus,
    observedPinnedTwinleafCommit: treatment.manifest.observedTwinleafGitCommit,
    codeAndDataHashes: treatment.manifest.resolvedSourceAndPolicyHashes,
    controlVersion: control.manifest.version,
    treatmentVersion: treatment.manifest.version,
    sameEightUniqueRegisteredIds: pairs.length === 8 &&
      new Set(pairs.map(x => x.id)).size === 8 &&
      pairs.every(x => original.has(x.id)),
    matchedEightInitialSourcePhysicalDeals: pairs.every(x =>
      x.sourcePhysicalDealMatched),
    matchedEightEntireInitialPhysicalDeals: pairs.every(x =>
      x.entirePhysicalDealMatched),
    pairs,
    telepathOwnerAudit: telemetry,
    targetPhysicalAttachments,
    targetPublicLastRoots: publicLastRoots,
    archives,
    releaseStatus: 'FAIL-native-development-only',
    competitiveGamesQualified: 0
  };
  console.log('AGENT9_ISSUE25_TELEPATH_V6', JSON.stringify(publicAudit));
  assert.equal(publicAudit.sameEightUniqueRegisteredIds, true);
  assert.equal(publicAudit.matchedEightInitialSourcePhysicalDeals, true);
  assert.equal(publicAudit.matchedEightEntireInitialPhysicalDeals, true);
  assert.equal(treatment.manifest.releaseQualified, false);
  assert.equal(treatment.diagnostic.competitiveGamesQualified, 0);
  assert.equal(telemetry.physicalStores, 8);
  assert.equal(telemetry.readsUnopenedDeck, false);
  assert.equal(telemetry.readsOpponentHidden, false);
  assert.ok(telemetry.actualAttachments > 0,
    'frozen v5 root13 must attach genuine Telepath Energy');
  assert.ok(telemetry.matchingOwnerSearches > 0,
    'an attached Telepath must open a genuine matched owner-deck prompt');
  assert.ok(telemetry.settled > 0,
    'owner-deck physical Telepath search must settle');
  assert.equal(telemetry.custodyFailures, 0);
  assert.equal(telemetry.shuffleMissing, 0);
  assert.ok(targetPhysicalAttachments.some(row =>
    row.nativePhysicalAttachmentVerified === true &&
    row.acceptedRootOrdinal === 13 &&
    row.physicalEnergyCard === 'Telepath [P] Energy M3'),
  'accepted root13 requires independent physical native target custody');
  const targetPair = pairs.find(row => row.id === TARGET);
  assert.equal(targetPair.controlStatus, 'engine-error');
  assert.ok(targetPair.treatmentRoots > 14,
    'root14 must advance after narrow Telepath owner continuation');
});
