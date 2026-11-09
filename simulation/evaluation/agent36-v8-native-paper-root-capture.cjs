'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash, randomUUID} = require('node:crypto');
const {runStewardBroaderV8} = require('./agent36-issue25-common-v8.cjs');
const {runDevelopment} = require('./agent41-bilateral-v2-development.cjs');
const {createLivePaperRootReceipts, VERSION:RECORDER_VERSION} =
  require('../twinleaf/agent36-live-paper-root-receipts.cjs');

const VERSION = 'agent36-v8-native-paper-payment-capture-v1';
const ROOT = path.resolve(__dirname, '../..');
const sha = value => createHash('sha256')
  .update(JSON.stringify(value)).digest('hex');

/** An actual Store root ledger, complete or abort-preserved. */
function rootLedger(row) {
  return [row?.rootActionLedger, row?.nativePublicRootArchive?.rootActionLedger,
    row?.nativeAbortEvidence?.rootActionLedger,
    row?.nativeAbortProvenance?.rootActionLedger].find(Array.isArray) ?? null;
}

/** Join real postdispatch receipts to native root action ordinals and names. */
function joinReceiptLedger(receipt, nativeRow) {
  const ledger = rootLedger(nativeRow);
  const roots = receipt?.receipts ?? [];
  const comparisons = ledger?.map((action, i) => {
    const recorded = roots[i];
    return {
      ordinal: action.actionOrdinal,
      matched: recorded?.actionOrdinal === action.actionOrdinal &&
        recorded?.seat === action.playerSlot &&
        recorded?.turnBefore === action.turnBefore &&
        recorded?.action === action.action
    };
  }) ?? null;
  const firstMismatch = comparisons?.find(x => !x.matched) ?? null;
  return {
    status: !receipt ? 'NO_LIVE_STORE_CAPTURE' :
      ledger === null ? 'NO_NATIVE_ROOT_LEDGER' :
        ledger.length !== roots.length ? 'ROOT_COUNT_MISMATCH' :
          firstMismatch ? 'ROOT_IDENTITY_MISMATCH' :
            'EXACT_ROOT_IDENTITY_JOIN',
    nativeRootCount: ledger?.length ?? null,
    capturedStoreRootCount: roots.length,
    firstMismatch,
    allPhysicalReferencesSettled:
      receipt?.settledPhysicalIdentityClean === true
  };
}

/**
 * Run unchanged registered selected-v8 source games with actual Store callbacks.
 * Adapter holds only postdecision evidence and is never passed to either policy.
 * This v8 cohort is a historic developmental panel; native wins remain unqualified.
 */
function runV8NativePaperCapture(deps = {}) {
  const steward = deps.steward ?? runStewardBroaderV8;
  const runner = deps.runner ?? runDevelopment;
  const recorders = new Map();
  const byStore = new WeakMap();
  const executeRunner = options => runner({
    ...options,
    onRootStoreCreated: (store, trialId) => {
      assert.equal(typeof trialId, 'string');
      assert.ok(!recorders.has(trialId), 'Duplicate actual Store trial');
      const recorder = createLivePaperRootReceipts(trialId);
      recorder.onRootStoreCreated(store);
      recorders.set(trialId, recorder);
      byStore.set(store, recorder);
    },
    onRootActionDispatched: (store, action, ordinal, seat, turn) => {
      const recorder = byStore.get(store);
      assert.ok(recorder, 'Unregistered Store emitted accepted root');
      recorder.onRootActionDispatched(store, action, ordinal, seat, turn);
    }
  });
  let selected;
  try {
    selected = steward({runner: executeRunner});
  } finally {
    for (const recorder of recorders.values()) recorder.close();
  }
  const registered = selected.diagnostic.registered;
  assert.ok(Array.isArray(registered));
  const native = selected.rawDevelopment?.rows ?? [];
  const rawById = new Map(native.map(row => [row.trial?.id ?? row.id, row]));
  const captured = registered.map(trialId => {
    const record = recorders.get(trialId)?.result() ?? null;
    const nativeRow = rawById.get(trialId) ?? null;
    const join = joinReceiptLedger(record, nativeRow);
    return {trialId, nativeFound: nativeRow !== null,
      originalSourceSeat: nativeRow?.sourceSeat ?? null,
      candidateSeat: nativeRow?.candidateSeat ?? null,
      sourceDealFingerprint: nativeRow?.sourceDealFingerprint ?? null,
      fullPhysicalDealFingerprint:
        nativeRow?.fullPhysicalDealFingerprint ?? null,
      nativeFinished: nativeRow?.finished === true,
      nativeWinner: nativeRow?.winner ?? null,
      join, nativeRootLedgerSha256: rootLedger(nativeRow) ?
        sha(rootLedger(nativeRow)) : null,
      storeRaw: record
    };
  });
  const matched = captured.filter(x =>
    x.join.status === 'EXACT_ROOT_IDENTITY_JOIN');
  return {
    schema: VERSION, recorderVersion: RECORDER_VERSION,
    sourceRegistration: selected.manifest.originalSourceRegistration,
    selectedDevelopmentalPolicy: selected.manifest.version,
    observedVendorGitCommit: selected.manifest.observedTwinleafGitCommit,
    codeSourceHashes: selected.manifest.resolvedSourceAndPolicyHashes,
    registeredTrialIds: registered,
    expectedNativeAttempts: registered.length,
    actualNativeAttempts: native.length,
    matchingExactNativeStoreRootTapes: matched.length,
    paperPaymentReviewPassed: false,
    officialClockReviewPassed: false,
    independentCompetenceReviewPassed: false,
    independentlyQualifiedGames: 0,
    captured,
    developmentalNativeOutcome: selected.diagnostic.actualAttemptRows
  };
}

/** Atomic locked JSON artifact, with digest of the exact persisted bytes. */
function writeArchive(value, output = 'artifacts/agent36-paper-root-capture') {
  const dir = path.resolve(ROOT, output);
  const relative = path.relative(ROOT, dir);
  assert.ok(relative && relative !== '..' &&
    !relative.startsWith('..' + path.sep) && !path.isAbsolute(relative));
  fs.mkdirSync(dir, {recursive: true});
  const name = 'agent36-v8-native-paper-root-capture.json';
  const target = path.join(dir, name);
  const lock = target + '.lock';
  const temp = target + '.' + randomUUID() + '.tmp';
  const fd = fs.openSync(lock, 'wx');
  try {
    const bytes = JSON.stringify(value, null, 2) + '\n';
    fs.writeFileSync(temp, bytes, {flag: 'wx'});
    fs.renameSync(temp, target);
    return {file: path.relative(ROOT, target), bytes: Buffer.byteLength(bytes),
      sha256: createHash('sha256').update(bytes).digest('hex')};
  } finally {
    if (fs.existsSync(temp)) fs.unlinkSync(temp);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}

if (require.main === module) {
  const result = runV8NativePaperCapture();
  const artifact = writeArchive(result);
  process.stdout.write(JSON.stringify({
    schema: VERSION, artifact,
    expectedNativeAttempts: result.expectedNativeAttempts,
    actualNativeAttempts: result.actualNativeAttempts,
    matchingExactNativeStoreRootTapes: result.matchingExactNativeStoreRootTapes,
    capturedRoots: result.captured.reduce((n, item) =>
      n + (item.storeRaw?.acceptedStoreRootCount ?? 0), 0),
    unqualified: true
  }) + '\n');
  if (result.matchingExactNativeStoreRootTapes !==
      result.expectedNativeAttempts) process.exitCode = 1;
}

module.exports = {VERSION, rootLedger, joinReceiptLedger,
  runV8NativePaperCapture, writeArchive};
