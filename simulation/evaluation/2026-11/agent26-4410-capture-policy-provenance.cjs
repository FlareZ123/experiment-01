'use strict';

const {
  CORE_HOOK_ROOTS, SOURCE_ONLY_FEATURES, SOURCE_SCOPED_OPTIONS,
  SOURCE_SCOPED_FEATURES, loadedResearchCodeManifest,
  effectiveOptionsForSeat, sha256
} = require('./agent36-4410-policy-provenance.cjs');
const {auditMode} = require('../agent3-observed-policy-closure.cjs');

function jsonSafe(value, at='$', ancestors=new WeakSet()) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean')
    return value;
  if (typeof value === 'number') {
    if (Number.isFinite(value)) return value;
    throw new TypeError(`Non-finite provenance number at ${at}`);
  }
  if (typeof value === 'undefined') return null;
  if (typeof value !== 'object')
    throw new TypeError(`Unsupported provenance value at ${at}: ${typeof value}`);
  if (ancestors.has(value))
    throw new TypeError(`Cyclic provenance value at ${at}`);
  if (Object.getOwnPropertySymbols(value).length)
    throw new TypeError(`Symbol-keyed provenance property at ${at}`);

  ancestors.add(value);
  let result;
  if (Array.isArray(value)) {
    result = [];
    for (let index = 0; index < value.length; index++) {
      if (!Object.hasOwn(value, index))
        throw new TypeError(`Sparse provenance array at ${at}[${index}]`);
      result.push(jsonSafe(value[index], `${at}[${index}]`, ancestors));
    }
    const allowed = new Set(Array.from({length:value.length}, (_, index) => String(index)));
    if (Object.keys(value).some(key => !allowed.has(key)))
      throw new TypeError(`Non-index provenance array property at ${at}`);
  } else {
    if (Object.getPrototypeOf(value) !== Object.prototype)
      throw new TypeError(`Provenance value must be a plain JSON object at ${at}`);
    result = {};
    for (const key of Object.keys(value).sort()) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor || !Object.hasOwn(descriptor, 'value'))
        throw new TypeError(`Accessor provenance property at ${at}.${key}`);
      Object.defineProperty(result, key, {
        value: jsonSafe(descriptor.value, `${at}.${key}`, ancestors),
        enumerable: true, writable: true, configurable: true
      });
    }
  }
  ancestors.delete(value);
  return result;
}

/**
 * Preserve exact capture-time policy inputs and runtime actor receipts without
 * mislabeling a require.cache snapshot as a complete hook or policy closure.
 * Full competitive hashes remain null until those separate closures are
 * independently resolved and attested.
 */
function buildCaptureOnlyPolicyProvenance({
  repositoryRoot, entryFile, development, row, options, runnerConfig = {},
  sourceSeat, candidateSeat, trialId, candidateManifestBlobSha,
  policyProfileBlobSha, enginePin, hookActivationReceipts = {},
  runtimeEvidenceReceipts = {}, cacheEntries
}) {
  if (!repositoryRoot || !entryFile || !development || !row ||
      !options || ![0, 1].includes(sourceSeat) ||
      candidateSeat !== 1 - sourceSeat || typeof trialId !== 'string' ||
      typeof enginePin !== 'string') {
    throw new TypeError('4410 capture provenance requires exact trial, seats, options and engine pin');
  }
  if (row.trial?.id !== trialId)
    throw new TypeError('4410 capture provenance trialId must match row.trial.id');
  if (row.candidateSeat !== candidateSeat)
    throw new TypeError('4410 capture provenance candidateSeat must match row.candidateSeat');
  if (Object.hasOwn(row, 'sourceSeat') && row.sourceSeat !== sourceSeat)
    throw new TypeError('4410 capture provenance sourceSeat must match row.sourceSeat');

  const safeOptions = jsonSafe(options);
  const safeRunnerConfig = jsonSafe(runnerConfig);
  const safeHookActivationReceipts = jsonSafe(hookActivationReceipts);
  const safeRuntimeEvidenceReceipts = jsonSafe(runtimeEvidenceReceipts);
  const runtimeLoadedCodeManifest = loadedResearchCodeManifest({
    repositoryRoot, entryFiles: [entryFile],
    ...(cacheEntries ? {cacheEntries} : {}),
    requiredRoots: []
  });

  let actorRuntimeClosure = null;
  let actorRuntimeClosureError = null;
  if (typeof candidateManifestBlobSha === 'string' &&
      candidateManifestBlobSha.length > 0) {
    try {
      actorRuntimeClosure = auditMode(
        {id: '4410', native: development},
        {manifestBlob: candidateManifestBlobSha, enginePin}
      );
    } catch (error) {
      actorRuntimeClosureError = String(error?.message || error);
    }
  } else {
    actorRuntimeClosureError = 'candidate manifest Git blob SHA unavailable';
  }

  const effectiveSeatConfiguration = [0, 1].map(seat => {
    const projected = effectiveOptionsForSeat(safeOptions, seat, sourceSeat);
    const value = {
      schema: 'agent26-4410-effective-seat-configuration-projection-v2',
      trialId, seat, sourceSeat, candidateSeat,
      configuredPolicyOptions: safeOptions,
      effectiveSeatOptions: projected.options,
      unknownSourceOnlyFlags: projected.unknownSourceOnlyFlags,
      actorRuntimeDigest: actorRuntimeClosure?.observedRuntimeDigest ?? null
    };
    return {...value, effectiveSeatConfigSha256: sha256(value)};
  });

  const actorOnlyDecisionCoverage = jsonSafe(row.actorOnlyDecisionCoverage ?? null);
  const mewDceRootApplicationReceipt =
    actorOnlyDecisionCoverage?.detailedComponentAudits?.root ?? null;
  const paperCologneNativePlayAudit = jsonSafe(row.paperCologneNativePlayAudit ?? null);
  const safeActivationReceipts = safeHookActivationReceipts;

  const activatedHookManifest = {
    schema: 'agent26-4410-activated-hook-manifest-v1',
    status: 'PARTIAL_ACTIVATION_RECEIPTS_ONLY',
    complete: false,
    observedActivationReceipts: safeActivationReceipts,
    unresolvedDependencyScopes: [{
      scope: 'activated-hook-transitive-dependency-closure',
      reason: 'Observed installation receipts are preserved, but the activated hook dependency closure has not been independently attested.'
    }],
    sha256: null
  };

  const policyEntryManifest = {
    schema: 'agent26-4410-policy-entry-manifest-v1',
    status: 'INCOMPLETE_RUNTIME_SNAPSHOT_ONLY',
    complete: false,
    candidateRootInventory: CORE_HOOK_ROOTS,
    runtimeLoadedCodeSnapshotSha256: runtimeLoadedCodeManifest.sha256,
    unresolvedDependencySites: [],
    unresolvedDependencyInventoryComplete: false,
    unresolvedDependencyScopes: [{
      scope: 'conditional-and-dynamic-policy-entrypoint-closure',
      reason: 'The post-run require.cache snapshot does not prove the complete conditional policy-entrypoint dependency closure.'
    }],
    sha256: null
  };

  const perSeat = effectiveSeatConfiguration.map(item => ({
    seat: item.seat,
    effectiveOptions: item.effectiveSeatOptions,
    unknownSourceOnlyFlags: item.unknownSourceOnlyFlags,
    effectiveSeatConfigSha256: item.effectiveSeatConfigSha256,
    policySha256: null
  }));
  const unknownSourceOnlyFlags = [...new Set(
    perSeat.flatMap(item => item.unknownSourceOnlyFlags)
  )].sort();

  const policyManifest = {
    schema: 'agent36-effective-bilateral-policy-manifest-v1',
    complete: false,
    samePolicy: false,
    reason: 'capture-only; activated-hook and policy-entrypoint closures are not independently attested',
    hookRevisionSha: null,
    environmentSha256: runtimeLoadedCodeManifest.environment?.sha256 ?? null,
    policyVersion: row.actorOnlyPolicyVersion ??
      development.actorOnlyCompositionVersion ?? null,
    candidatePolicy: 'new-moon-lockbreaker-v1',
    sourceSeat, candidateSeat,
    activationAudit: safeActivationReceipts,
    requestedOptions: safeOptions,
    sourceOnlyFeatureMap: SOURCE_ONLY_FEATURES,
    sourceScopedOptions: SOURCE_SCOPED_OPTIONS,
    sourceScopedFeatureMap: SOURCE_SCOPED_FEATURES,
    policySha256BySeat: [null, null],
    perSeat,
    unknownSourceOnlyFlags,
    configurationRoots: CORE_HOOK_ROOTS,
    actorRuntimeClosureDigest: actorRuntimeClosure?.observedModeClosureDigest ?? null,
    mewDceRootApplicationReceipt,
    paperCologneNativePlayAudit
  };

  const result = {
    schema: 'agent26-4410-capture-only-policy-provenance-v2',
    status: 'PARTIAL_CAPTURE_ONLY',
    trialId, sourceSeat, candidateSeat,
    candidateManifestPath: 'results/als/new-moon-lockbreak-japanese-print-60.json',
    candidateManifestBlobSha256: candidateManifestBlobSha ?? null,
    policyProfilePath: 'simulation/evaluation/agent41-frozen-bilateral-development-v2.json',
    policyProfileBlobSha256: policyProfileBlobSha ?? null,
    enginePin,
    runtimeLoadedCodeManifest,
    runtimeLoadedCodeSnapshotSha256: runtimeLoadedCodeManifest.sha256,
    runnerExecutionConfig: safeRunnerConfig,
    runtimeEvidenceReceipts: safeRuntimeEvidenceReceipts,
    effectiveSeatConfiguration,
    effectiveSeatConfigSha256BySeat: effectiveSeatConfiguration.map(
      item => item.effectiveSeatConfigSha256),
    actorRuntimeClosure,
    actorRuntimeClosureError,
    actorOnlyDecisionCoverage,
    mewDceRootApplicationReceipt,
    paperCologneNativePlayAudit,
    activatedHookManifest,
    policyEntryManifest,
    policyManifest,
    policyManifestSha256: sha256(policyManifest),
    hookRevisionSha: null,
    policySha256BySeat: [null, null],
    samePolicy: false,
    competitivePolicyCompetenceReady: false,
    reason: 'A runtime snapshot and observed actor receipt are descriptive evidence only; complete activated-hook and policy-entrypoint closures remain unproven.'
  };
  result.policyProvenanceSha256 = sha256(result);
  return result;
}

module.exports = {buildCaptureOnlyPolicyProvenance, jsonSafe};
