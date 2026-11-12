'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');

const SOURCE_ONLY_FEATURES = Object.freeze({
  actorDceMewMobilitySourceOnly: 'actorDceMewMobilityRoot',
  actorGenericFundedFloatStoneSourceOnly: 'actorGenericFundedFloatStoneRoot',
  actorGenesectFusionDrawSourceOnly: 'actorGenesectFusionDrawRoot',
  actorMewDceRecipientSourceOnly: 'actorMewDceRecipientRoot',
  actorMewGenesectBenchFirstSourceOnly: 'actorMewGenesectBenchFirst',
  actorMewGenesectTechnoBlastSourceOnly: 'actorMewGenesectTechnoBlast',
  actorNaturalEvolutionSourceOnly: 'actorNaturalEvolutionRoot',
  actorOwnerMailAfterPassSourceOnly: 'actorOwnerMailAfterPass',
  actorPotentialKoSourceOnly: 'actorPotentialKoRoot',
  actorSeekerGuzmaSourceOnly: 'actorSeekerGuzmaNominalKo',
  earlyRegidragoCompressorSourceOnly: 'earlyRegidragoCompressor',
  rank13CrispinSourceOnly: 'rank13Crispin',
  rank13SourceFirstOwnGrassSourceOnly: 'rank13SourceFirstOwnGrass'
});

const EXCLUDED_RUNTIME_ENV_PREFIXES = ['GITHUB_', 'RUNNER_'];
const EXCLUDED_RUNTIME_ENV_KEYS = new Set([
  'PATH','HOME','PWD','TMPDIR','TEMP','TMP','SHLVL','_'
]);
const ENV_DOT = /\bprocess\s*\.\s*env\s*\.\s*([A-Za-z_$][\w$]*)/g;
const ENV_BRACKET = /\bprocess\s*\.\s*env\s*\[/g;
const ENV_BRACKET_LITERAL = /\bprocess\s*\.\s*env\s*\[\s*(['"])([^'"]+)\1\s*\]/g;
const ENV_BASE = /\bprocess\s*\.\s*env\b/g;

const CORE_HOOK_ROOTS = Object.freeze([
  'simulation/evaluation/agent41-bilateral-v2-development.cjs',
  'simulation/evaluation/agent41-crossrank-actual-decisions.cjs',
  'simulation/evaluation/agent37-candidate-attack-settlement.cjs',
  'simulation/evaluation/agent44-cross-candidate-source-pair-status.cjs',
  'simulation/evaluation/agent41-bilateral-conservative-supporter-option.cjs',
  'simulation/evaluation/agent48-cologne-native-ledger-audit.cjs',
  'simulation/evaluation/agent41-frozen-bilateral-development-v2.json',
  'simulation/evaluation/agent36-bilateral-two-seat-common-policy.cjs',
  'simulation/evaluation/agent41-bilateral-common-policy.cjs',
  'simulation/evaluation/agent7-canonical-actor-composition.cjs',
  'simulation/evaluation/2026-11/agent8-source-mew-funding-v6.cjs',
  'simulation/evaluation/2026-11/agent8-source-mew-combat-v5.cjs',
  'simulation/evaluation/2026-11/agent8-source-evolution-2x2-v4.cjs',
  'simulation/evaluation/2026-11/agent8-source-challenger-2x2-v2.cjs',
  'simulation/evaluation/2026-11/agent8-source-challenger-2x2.cjs',
  'simulation/evaluation/2026-11/agent44-first-original-rank5-newmoon-case.cjs',
  'simulation/evaluation/2026-11/agent36-4410-policy-provenance.cjs',
  'simulation/twinleaf/agent41-paper-supporter-discipline.cjs',
  'simulation/twinleaf/canceling-cologne-once-per-turn-hook.cjs',
  'simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs',
  'simulation/twinleaf/agent50-owner-public-acknowledgements.cjs',
  'simulation/twinleaf/agent36-live-paper-root-receipts.cjs',
  'scripts/aichi-new-moon-candidate.cjs'
]);

// These options are wired by the bilateral runner to the original-source
// physical seat even though their names do not end in SourceOnly.
const SOURCE_SCOPED_OPTIONS = Object.freeze([
  'actorMewUltraBallRoot',
  'actorMewUltraBallSearch',
  'actorMewUltraBallPaymentGuard',
  'actorMewQuickBallPaymentGuard',
  'actorMewGenesectQuickBallSearch'
]);

// The development entrypoint derives a concrete owner-seat root from this
// control flag; hash the derived feature and owner seat, not only the toggle.
const SOURCE_SCOPED_FEATURES = Object.freeze({
  sourceScopedQuickBallRoot: 'quickBallRoot'
});

function canonicalJson(value) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean' ||
      (typeof value === 'number' && Number.isFinite(value))) return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(canonicalJson).join(',') + ']';
  if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    const keys = Object.keys(value).sort();
    if (keys.some(key => value[key] === undefined)) throw new TypeError('Undefined provenance value');
    return '{' + keys.map(key => JSON.stringify(key) + ':' + canonicalJson(value[key])).join(',') + '}';
  }
  throw new TypeError('Provenance values must be plain finite JSON');
}

function sha256(value) {
  return createHash('sha256').update(canonicalJson(value), 'utf8').digest('hex');
}

function fileSha256(filename) {
  return createHash('sha256').update(fs.readFileSync(filename)).digest('hex');
}

function buildEnvironmentManifest(files, env = process.env) {
  const keys = new Set();
  const unresolved = [];
  for (const file of files) {
    const source = fs.readFileSync(file.absolutePath, 'utf8');
    const dotKeys = [...source.matchAll(ENV_DOT)].map(match => match[1]);
    const bracketKeys = [...source.matchAll(ENV_BRACKET_LITERAL)].map(match => match[2]);
    const bracketCount = [...source.matchAll(ENV_BRACKET)].length;
    const baseCount = [...source.matchAll(ENV_BASE)].length;
    if (bracketCount > bracketKeys.length ||
        baseCount > dotKeys.length + bracketCount) {
      unresolved.push({path: file.path, dynamicBracketReads: Math.max(0, bracketCount - bracketKeys.length),
        unclassifiedReads: Math.max(0, baseCount - dotKeys.length - bracketCount)});
    }
    for (const key of [...dotKeys, ...bracketKeys]) {
      if (EXCLUDED_RUNTIME_ENV_KEYS.has(key) ||
          EXCLUDED_RUNTIME_ENV_PREFIXES.some(prefix => key.startsWith(prefix))) continue;
      keys.add(key);
    }
  }
  const values = [...keys].sort().map(key => ({key, present: typeof env[key] === 'string',
    valueSha256: typeof env[key] === 'string' ?
      createHash('sha256').update(env[key], 'utf8').digest('hex') : null}));
  const complete = unresolved.length === 0;
  return {schema:'agent36-policy-environment-manifest-v1', values, unresolved, complete,
    sha256:complete ? sha256(values) : null};
}

/**
 * Hash the exact research-owned runtime modules loaded by this process.
 * Twinleaf vendor modules are excluded because vendorCommitSha pins them.
 */
function loadedResearchCodeManifest({repositoryRoot, entryFiles = [],
  cacheEntries = Object.values(require.cache), requiredRoots = CORE_HOOK_ROOTS}) {
  const root = path.resolve(repositoryRoot);
  const filenames = new Set(entryFiles.map(file => path.resolve(file)));
  for (const entry of cacheEntries) {
    if (typeof entry?.filename === 'string') filenames.add(path.resolve(entry.filename));
  }
  const files = [];
  const unreadable = [];
  const absoluteFiles = [];
  const unclassifiedRepoModules = [];
  const excludedDataModules = [];
  for (const filename of filenames) {
    const relative = path.relative(root, filename).split(path.sep).join('/');
    if (!(relative.startsWith('simulation/') || relative.startsWith('scripts/'))) {
      if (relative.startsWith('results/') || relative.startsWith('resources/')) excludedDataModules.push(relative);
      else if (relative.startsWith('vendor/') || relative.startsWith('node_modules/') ||
          relative.startsWith('agents/') || relative.startsWith('communications/') ||
          relative.startsWith('artifacts/') || relative.startsWith('.github/')) {
        // Data, pinned engine, CI and coordination are separately identified.
      } else if (!relative.startsWith('.git/')) unclassifiedRepoModules.push(relative);
      continue;
    }
    try {
      files.push({path: relative, sha256: fileSha256(filename)});
      absoluteFiles.push({path: relative, absolutePath: filename});
    } catch (error) {
      unreadable.push({path: relative, error: String(error?.message || error)});
    }
  }
  files.sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
  absoluteFiles.sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
  unreadable.sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
  unclassifiedRepoModules.sort();
  excludedDataModules.sort();
  const missingCoreRoots = requiredRoots.filter(name => !files.some(file => file.path === name));
  const complete = files.length > 0 && unreadable.length === 0 &&
    unclassifiedRepoModules.length === 0 && missingCoreRoots.length === 0;
  const environment = complete ? buildEnvironmentManifest(absoluteFiles) : {
    schema:'agent36-policy-environment-manifest-v1', values:[], unresolved:[],
    complete:false, sha256:null
  };
  const manifest = {
    schema: 'agent36-loaded-research-runtime-code-manifest-v1',
    scope: 'runtime require.cache closure of research-owned simulation and scripts modules; vendor engine pinned separately',
    closureMethod: 'post-run Node require.cache snapshot plus explicit main entry file',
    requiredRoots, missingCoreRoots, unclassifiedRepoModules, excludedDataModules,
    files, unreadable, environment, complete
  };
  return {...manifest, sha256: complete ? sha256(files) : null};
}

function effectiveOptionsForSeat(options, seat, sourceSeat) {
  const effective = {...options};
  const unknownSourceOnlyFlags = [];
  for (const [flag, feature] of Object.entries(SOURCE_ONLY_FEATURES)) {
    if (options[flag] !== true) continue;
    if (seat !== sourceSeat) {
      effective[flag] = false;
      effective[feature] = false;
    }
  }
  for (const [flag, feature] of Object.entries(SOURCE_SCOPED_FEATURES)) {
    if (options[flag] !== true) continue;
    if (seat === sourceSeat) {
      effective[feature] = true;
      effective[feature + 'OwnerSeat'] = sourceSeat;
    } else {
      effective[flag] = false;
      effective[feature] = false;
      effective[feature + 'OwnerSeat'] = null;
    }
  }
  for (const [key, value] of Object.entries(options)) {
    if (key.endsWith('SourceOnly') && value === true &&
        !Object.hasOwn(SOURCE_ONLY_FEATURES, key)) unknownSourceOnlyFlags.push(key);
    if (key.startsWith('sourceScoped') && value === true && seat !== sourceSeat)
      effective[key] = false;
  }
  if (seat !== sourceSeat) {
    for (const key of SOURCE_SCOPED_OPTIONS) {
      if (options[key] === true) effective[key] = false;
    }
  }
  return {options: effective, unknownSourceOnlyFlags};
}

function policyDefinitionHashes({options, sourceSeat, candidateSeat,
  policyVersion, candidatePolicy, commonPolicyAudit, hookRevisionSha,
  environmentSha256, activationAudit}) {
  if (!options || typeof options !== 'object' ||
      ![0, 1].includes(sourceSeat) || candidateSeat !== 1 - sourceSeat ||
      typeof policyVersion !== 'string' || !policyVersion ||
      typeof candidatePolicy !== 'string' || !candidatePolicy ||
      !/^[0-9a-f]{64}$/.test(hookRevisionSha || '') ||
      !/^[0-9a-f]{64}$/.test(environmentSha256 || '')) {
    return {complete: false, policySha256BySeat: null, samePolicy: false,
      reason: 'missing-policy-config-version-seat-or-hook-manifest'};
  }
  const seats = commonPolicyAudit?.installedPhysicalSeats;
  const commonPolicyReady = commonPolicyAudit?.sharedResourcePolicySelected === true &&
    commonPolicyAudit?.selectedSameAdapterFunctionsForEachSeat === true &&
    commonPolicyAudit?.sourceRankConditionalResourceWrapper === false &&
    Array.isArray(seats) && seats.length === 2 && seats[0] === 0 && seats[1] === 1 &&
    Array.isArray(commonPolicyAudit.wrapperInstallationOrder) &&
    commonPolicyAudit.wrapperInstallationOrder.length === 2 &&
    commonPolicyAudit.wrapperInstallationOrder[0] === 0 &&
    commonPolicyAudit.wrapperInstallationOrder[1] === 1 &&
    typeof commonPolicyAudit.version === 'string' && !!commonPolicyAudit.version &&
    typeof commonPolicyAudit.twoSeatVersion === 'string' && !!commonPolicyAudit.twoSeatVersion;
  const hooksActivated = activationAudit?.agent4RawStateFallbackQuarantineOuter === true &&
    activationAudit?.agent50OwnerPublicAcknowledgementsInner === true &&
    activationAudit?.agent36LivePaperRootReceipts === true &&
    activationAudit?.sourceIndependentCommonPolicy === true &&
    activationAudit?.actorOnlyComposition === true;
  if (!commonPolicyReady || !hooksActivated) return {complete: false, policySha256BySeat: null,
    samePolicy: false, reason: !commonPolicyReady ?
      'two-seat-common-policy-audit-incomplete' : 'required-hook-activation-audit-incomplete'};

  const perSeat = [0, 1].map(seat => {
    const projected = effectiveOptionsForSeat(options, seat, sourceSeat);
    return {
      seat,
      effectiveOptions: projected.options,
      unknownSourceOnlyFlags: projected.unknownSourceOnlyFlags,
      definition: {
        schema: 'agent36-per-seat-policy-definition-v1',
        policyVersion,
        candidatePolicy,
        hookRevisionSha,
        environmentSha256,
        activationAudit,
        commonPolicy: {
          version: commonPolicyAudit.version,
          twoSeatVersion: commonPolicyAudit.twoSeatVersion,
          sharedResourcePolicySelected: commonPolicyAudit.sharedResourcePolicySelected,
          installedPhysicalSeats: commonPolicyAudit.installedPhysicalSeats,
          wrapperInstallationOrder: commonPolicyAudit.wrapperInstallationOrder,
          selectedSameAdapterFunctionsForEachSeat:
            commonPolicyAudit.selectedSameAdapterFunctionsForEachSeat,
          sourceRankConditionalResourceWrapper:
            commonPolicyAudit.sourceRankConditionalResourceWrapper
        },
        effectiveOptions: projected.options
      }
    };
  });
  const unknown = perSeat.flatMap(row => row.unknownSourceOnlyFlags);
  if (unknown.length) return {complete: false, policySha256BySeat: null,
    samePolicy: false, reason: 'unmapped-active-source-only-options',
    unknownSourceOnlyFlags: [...new Set(unknown)].sort(), perSeat};
  const policySha256BySeat = perSeat.map(row => sha256(row.definition));
  return {complete: true, policySha256BySeat,
    samePolicy: policySha256BySeat[0] === policySha256BySeat[1],
    reason: 'exact-effective-seat-config-and-loaded-code-closure',
    perSeat: perSeat.map(row => ({seat: row.seat,
      effectiveOptions: row.effectiveOptions,
      enabledSourceOnlyFlags: Object.keys(row.effectiveOptions).filter(key =>
        key.endsWith('SourceOnly') && row.effectiveOptions[key] === true),
      enabledSourceScopedOptions: [...Object.keys(row.effectiveOptions).filter(key =>
        key.startsWith('sourceScoped') && row.effectiveOptions[key] === true),
        ...SOURCE_SCOPED_OPTIONS.filter(key=>row.effectiveOptions[key]===true)],
      policySha256: policySha256BySeat[row.seat]}))};
}

function buildPolicyProvenance({repositoryRoot, entryFile, options,
  sourceSeat, candidateSeat, policyVersion, candidatePolicy, commonPolicyAudit,
  activationAudit, cacheEntries}) {
  const hookManifest = loadedResearchCodeManifest({repositoryRoot,
    entryFiles: [entryFile], ...(cacheEntries ? {cacheEntries} : {})});
  const policy = hookManifest.complete ? policyDefinitionHashes({options,
    sourceSeat, candidateSeat, policyVersion, candidatePolicy,
    commonPolicyAudit, hookRevisionSha: hookManifest.sha256,
    environmentSha256: hookManifest.environment?.sha256, activationAudit}) : {
      complete: false, policySha256BySeat: null, samePolicy: false,
      reason: 'loaded-research-code-manifest-incomplete'
    };
  const policyManifest = {
    schema: 'agent36-effective-bilateral-policy-manifest-v1',
    complete: policy.complete,
    samePolicy: policy.samePolicy,
    reason: policy.reason,
    hookRevisionSha: hookManifest.sha256,
    environmentSha256: hookManifest.environment?.sha256??null,
    policyVersion: policyVersion??null,
    candidatePolicy: candidatePolicy??null,
    sourceSeat, candidateSeat,
    activationAudit: activationAudit??null,
    requestedOptions: options??null,
    sourceOnlyFeatureMap: SOURCE_ONLY_FEATURES,
    sourceScopedOptions: SOURCE_SCOPED_OPTIONS,
    sourceScopedFeatureMap: SOURCE_SCOPED_FEATURES,
    policySha256BySeat: policy.policySha256BySeat??null,
    perSeat: policy.perSeat ?? null,
    unknownSourceOnlyFlags: policy.unknownSourceOnlyFlags ?? [],
    configurationRoots: CORE_HOOK_ROOTS
  };
  return {
    hookRevisionSha: hookManifest.sha256,
    hookManifest,
    policySha256BySeat: policy.policySha256BySeat,
    policyManifest,
    policyManifestSha256: sha256(policyManifest)
  };
}

module.exports = {CORE_HOOK_ROOTS, SOURCE_ONLY_FEATURES, SOURCE_SCOPED_OPTIONS,
  SOURCE_SCOPED_FEATURES,
  canonicalJson, sha256, buildEnvironmentManifest, loadedResearchCodeManifest,
  effectiveOptionsForSeat, policyDefinitionHashes, buildPolicyProvenance};
