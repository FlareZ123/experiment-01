'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  canonicalJson,
  sha256,
  buildPolicyProvenance,
  buildEnvironmentManifest,
  loadedResearchCodeManifest,
  effectiveOptionsForSeat,
  policyDefinitionHashes
} = require('../../simulation/evaluation/2026-11/agent36-4410-policy-provenance.cjs');

function tempRoot() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'agent1-4410-policy-'));
}

function commonPolicyAudit() {
  return {
    version: 'agent41-bilateral-common-resource-policy-v0',
    twoSeatVersion: 'agent36-identical-two-seat-resource-wrapper-v1',
    sharedResourcePolicySelected: true,
    installedPhysicalSeats: [0, 1],
    wrapperInstallationOrder: [0, 1],
    selectedSameAdapterFunctionsForEachSeat: true,
    sourceRankConditionalResourceWrapper: false
  };
}

function activationAudit(overrides = {}) {
  return {
    agent4RawStateFallbackQuarantineOuter: true,
    agent50OwnerPublicAcknowledgementsInner: true,
    agent36LivePaperRootReceipts: true,
    sourceIndependentCommonPolicy: true,
    actorOnlyComposition: true,
    ...overrides
  };
}

function policyInput(overrides = {}) {
  return {
    options: { actorOnlyComposition: true, sourceIndependentCommonPolicy: true },
    sourceSeat: 0,
    candidateSeat: 1,
    policyVersion: 'frozen-policy-v1',
    candidatePolicy: 'new-moon-lockbreaker-v1',
    commonPolicyAudit: commonPolicyAudit(),
    hookRevisionSha: 'a'.repeat(64),
    environmentSha256: 'b'.repeat(64),
    activationAudit: activationAudit(),
    ...overrides
  };
}

test('canonical JSON is key-order invariant and rejects non-JSON values', () => {
  assert.equal(canonicalJson({ b: 2, a: 1 }), canonicalJson({ a: 1, b: 2 }));
  assert.equal(canonicalJson({ b: [2, 1], a: true }), '{"a":true,"b":[2,1]}');
  assert.throws(() => canonicalJson({ missing: undefined }), /Undefined provenance value/);
  assert.throws(() => canonicalJson([undefined]), /Provenance values must be plain finite JSON/);
  assert.throws(() => canonicalJson({ nested: new Date(0) }), /Provenance values must be plain finite JSON/);
});

test('environment manifest hashes referenced values without disclosing them', () => {
  const root = tempRoot();
  try {
    const dot = path.join(root, 'dot.cjs');
    const bracket = path.join(root, 'bracket.cjs');
    fs.writeFileSync(dot, 'const value = process.env.POLICY_A;\n');
    fs.writeFileSync(bracket, "const value = process.env['POLICY_B'];\n");
    const manifest = buildEnvironmentManifest([
      { path: 'dot.cjs', absolutePath: dot },
      { path: 'bracket.cjs', absolutePath: bracket }
    ], {
      POLICY_A: 'private-value-a',
      POLICY_B: 'private-value-b',
      GITHUB_SHA: 'excluded-runtime-sha',
      RUNNER_TEMP: '/tmp/runner',
      PATH: '/usr/bin'
    });
    assert.equal(manifest.complete, true);
    assert.deepEqual(manifest.values.map(x => x.key), ['POLICY_A', 'POLICY_B']);
    assert.ok(manifest.values.every(x => x.present && /^[0-9a-f]{64}$/.test(x.valueSha256)));
    assert.equal(Object.hasOwn(manifest.values[0], 'value'), false);
    assert.equal(JSON.stringify(manifest).includes('private-value-a'), false);
    assert.equal(JSON.stringify(manifest).includes('private-value-b'), false);
    assert.match(manifest.sha256, /^[0-9a-f]{64}$/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('dynamic environment lookup fails the environment closure closed', () => {
  const root = tempRoot();
  try {
    const dynamic = path.join(root, 'dynamic.cjs');
    fs.writeFileSync(dynamic, 'const value = process.env[process.env.POLICY_KEY];\n');
    const manifest = buildEnvironmentManifest([
      { path: 'dynamic.cjs', absolutePath: dynamic }
    ], { POLICY_KEY: 'SECRET_NAME', SECRET_NAME: 'secret-value' });
    assert.equal(manifest.complete, false);
    assert.equal(manifest.sha256, null);
    assert.equal(manifest.unresolved.length, 1);
    assert.equal(manifest.unresolved[0].dynamicBracketReads, 1);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('runtime closure hashes only repository-owned loaded files and enforces required roots', () => {
  const root = tempRoot();
  try {
    const main = path.join(root, 'simulation', 'main.cjs');
    const helper = path.join(root, 'scripts', 'helper.cjs');
    fs.mkdirSync(path.dirname(main), { recursive: true });
    fs.mkdirSync(path.dirname(helper), { recursive: true });
    fs.writeFileSync(main, "module.exports = require('../../scripts/helper.cjs');\n");
    fs.writeFileSync(helper, 'module.exports = 7;\n');
    const resourceData = path.join(root, 'resources', 'sets', 'en.json');
    fs.mkdirSync(path.dirname(resourceData), { recursive: true });
    fs.writeFileSync(resourceData, '{"set":"data"}\n');
    const manifest = loadedResearchCodeManifest({
      repositoryRoot: root,
      entryFiles: [main],
      cacheEntries: [{ filename: main }, { filename: helper }, { filename: resourceData }],
      requiredRoots: ['simulation/main.cjs', 'scripts/helper.cjs']
    });
    assert.equal(manifest.complete, true);
    assert.deepEqual(manifest.files.map(x => x.path), ['scripts/helper.cjs', 'simulation/main.cjs']);
    assert.deepEqual(manifest.missingCoreRoots, []);
    assert.deepEqual(manifest.unclassifiedRepoModules, []);
    assert.deepEqual(manifest.excludedDataModules, ['resources/sets/en.json']);
    assert.match(manifest.sha256, /^[0-9a-f]{64}$/);
    assert.equal(manifest.environment.complete, true);

    const missing = loadedResearchCodeManifest({
      repositoryRoot: root,
      entryFiles: [main],
      cacheEntries: [{ filename: main }],
      requiredRoots: ['simulation/not-loaded.cjs']
    });
    assert.equal(missing.complete, false);
    assert.deepEqual(missing.missingCoreRoots, ['simulation/not-loaded.cjs']);

    const docs = path.join(root, 'docs', 'unclassified.cjs');
    fs.mkdirSync(path.dirname(docs), { recursive: true });
    fs.writeFileSync(docs, 'module.exports = 1;\n');
    const unclassified = loadedResearchCodeManifest({
      repositoryRoot: root,
      entryFiles: [main],
      cacheEntries: [{ filename: main }, { filename: docs }],
      requiredRoots: ['simulation/main.cjs']
    });
    assert.equal(unclassified.complete, false);
    assert.deepEqual(unclassified.unclassifiedRepoModules, ['docs/unclassified.cjs']);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('source-only and source-scoped options are projected to the correct physical seat', () => {
  const options = {
    actorMewDceRecipientSourceOnly: true,
    actorMewDceRecipientRoot: true,
    actorMewUltraBallRoot: true
  };
  const source = effectiveOptionsForSeat(options, 0, 0);
  const candidate = effectiveOptionsForSeat(options, 1, 0);
  assert.equal(source.options.actorMewDceRecipientSourceOnly, true);
  assert.equal(source.options.actorMewDceRecipientRoot, true);
  assert.equal(candidate.options.actorMewDceRecipientSourceOnly, false);
  assert.equal(candidate.options.actorMewDceRecipientRoot, false);
  assert.equal(candidate.options.actorMewUltraBallRoot, false);
  assert.deepEqual(source.unknownSourceOnlyFlags, []);
  assert.deepEqual(candidate.unknownSourceOnlyFlags, []);
});

test('4410 Mew DCE recipient source-only root is projected only to the original source seat', () => {
  const options = {
    actorMewDceRecipientSourceOnly: true,
    actorMewDceRecipientRoot: true
  };
  const source = effectiveOptionsForSeat(options, 0, 0);
  const candidate = effectiveOptionsForSeat(options, 1, 0);
  assert.equal(source.options.actorMewDceRecipientSourceOnly, true);
  assert.equal(source.options.actorMewDceRecipientRoot, true);
  assert.equal(candidate.options.actorMewDceRecipientSourceOnly, false);
  assert.equal(candidate.options.actorMewDceRecipientRoot, false);
  assert.deepEqual(source.unknownSourceOnlyFlags, []);
  assert.deepEqual(candidate.unknownSourceOnlyFlags, []);
});

test('4410 Mew DCE recipient source-only configuration produces distinct seat fingerprints', () => {
  const result = policyDefinitionHashes(policyInput({
    options: {
      actorOnlyComposition: true,
      sourceIndependentCommonPolicy: true,
      actorMewDceRecipientSourceOnly: true,
      actorMewDceRecipientRoot: true
    }
  }));
  assert.equal(result.complete, true);
  assert.equal(result.samePolicy, false);
  assert.notEqual(result.policySha256BySeat[0], result.policySha256BySeat[1]);
  assert.equal(result.perSeat[0].effectiveOptions.actorMewDceRecipientRoot, true);
  assert.equal(result.perSeat[1].effectiveOptions.actorMewDceRecipientRoot, false);
  assert.equal(result.perSeat[0].enabledSourceOnlyFlags.includes(
    'actorMewDceRecipientSourceOnly'), true);
  assert.equal(result.perSeat[1].enabledSourceOnlyFlags.includes(
    'actorMewDceRecipientSourceOnly'), false);
});

test('complete common policy with identical effective options produces equal per-seat hashes', () => {
  const result = policyDefinitionHashes(policyInput());
  assert.equal(result.complete, true);
  assert.equal(result.samePolicy, true);
  assert.equal(result.reason, 'exact-effective-seat-config-and-loaded-code-closure');
  assert.equal(result.policySha256BySeat.length, 2);
  assert.match(result.policySha256BySeat[0], /^[0-9a-f]{64}$/);
  assert.equal(result.policySha256BySeat[0], result.policySha256BySeat[1]);
});

test('source-only options produce distinct hashes without hiding the seat difference', () => {
  const result = policyDefinitionHashes(policyInput({
    options: {
      actorOnlyComposition: true,
      sourceIndependentCommonPolicy: true,
      actorMewDceRecipientSourceOnly: true,
      actorMewDceRecipientRoot: true
    }
  }));
  assert.equal(result.complete, true);
  assert.equal(result.samePolicy, false);
  assert.notEqual(result.policySha256BySeat[0], result.policySha256BySeat[1]);
  assert.equal(result.perSeat[0].enabledSourceOnlyFlags.includes(
    'actorMewDceRecipientSourceOnly'), true);
  assert.equal(result.perSeat[1].enabledSourceOnlyFlags.includes(
    'actorMewDceRecipientSourceOnly'), false);
});

test('unmapped active source-only options fail closed', () => {
  const result = policyDefinitionHashes(policyInput({
    options: { unknownSourceOnly: true }
  }));
  assert.equal(result.complete, false);
  assert.equal(result.samePolicy, false);
  assert.equal(result.policySha256BySeat, null);
  assert.deepEqual(result.unknownSourceOnlyFlags, ['unknownSourceOnly']);
});

test('missing activation or two-seat common-policy evidence fails closed', () => {
  const noActivation = policyDefinitionHashes(policyInput({
    activationAudit: activationAudit({ agent50OwnerPublicAcknowledgementsInner: false })
  }));
  assert.equal(noActivation.complete, false);
  assert.equal(noActivation.policySha256BySeat, null);
  assert.equal(noActivation.reason, 'required-hook-activation-audit-incomplete');

  const noCommonPolicy = policyDefinitionHashes(policyInput({
    commonPolicyAudit: { ...commonPolicyAudit(), selectedSameAdapterFunctionsForEachSeat: false }
  }));
  assert.equal(noCommonPolicy.complete, false);
  assert.equal(noCommonPolicy.policySha256BySeat, null);
  assert.equal(noCommonPolicy.reason, 'two-seat-common-policy-audit-incomplete');
});

test('invalid code or environment digests fail closed', () => {
  const result = policyDefinitionHashes(policyInput({ hookRevisionSha: 'not-a-sha256' }));
  assert.equal(result.complete, false);
  assert.equal(result.policySha256BySeat, null);
  assert.equal(result.reason, 'missing-policy-config-version-seat-or-hook-manifest');
});


test('policy manifest carries a canonical digest and remains explicitly incomplete without a loaded closure', () => {
  const input = {
    repositoryRoot: path.resolve(__dirname, '../..'),
    entryFile: __filename,
    cacheEntries: [],
    options: { actorOnlyComposition: true, actorMewDceRecipientSourceOnly: true },
    sourceSeat: 0,
    candidateSeat: 1,
    policyVersion: 'frozen-policy-v1',
    candidatePolicy: 'new-moon-lockbreaker-v1',
    commonPolicyAudit: commonPolicyAudit(),
    activationAudit: activationAudit()
  };
  const first = buildPolicyProvenance(input);
  const changed = buildPolicyProvenance({
    ...input,
    options: { ...input.options, actorMewDceRecipientSourceOnly: false }
  });
  assert.match(first.policyManifestSha256, /^[0-9a-f]{64}$/);
  assert.equal(first.policyManifestSha256, sha256(first.policyManifest));
  assert.notEqual(first.policyManifestSha256, changed.policyManifestSha256);
  assert.equal(first.hookRevisionSha, null);
  assert.equal(first.policySha256BySeat, null);
  assert.equal(first.policyManifest.complete, false);
});

test('full inherited Mew v6 source-only option set projects only to original source seat', () => {
  const options = {
    actorPotentialKoSourceOnly: true,
    actorPotentialKoRoot: true,
    actorGenericFundedFloatStoneSourceOnly: true,
    actorGenericFundedFloatStoneRoot: true,
    actorSeekerGuzmaSourceOnly: true,
    actorSeekerGuzmaNominalKo: true,
    actorOwnerMailAfterPassSourceOnly: true,
    actorOwnerMailAfterPass: true,
    actorNaturalEvolutionSourceOnly: true,
    actorNaturalEvolutionRoot: true,
    actorDceMewMobilitySourceOnly: true,
    actorDceMewMobilityRoot: true,
    actorMewGenesectTechnoBlastSourceOnly: true,
    actorMewGenesectTechnoBlast: true,
    actorMewDceRecipientSourceOnly: true,
    actorMewDceRecipientRoot: true,
    sourceScopedQuickBallRoot: true
  };
  const source = effectiveOptionsForSeat(options, 0, 0);
  const candidate = effectiveOptionsForSeat(options, 1, 0);
  const pairs = [
    ['actorPotentialKoSourceOnly', 'actorPotentialKoRoot'],
    ['actorGenericFundedFloatStoneSourceOnly', 'actorGenericFundedFloatStoneRoot'],
    ['actorSeekerGuzmaSourceOnly', 'actorSeekerGuzmaNominalKo'],
    ['actorOwnerMailAfterPassSourceOnly', 'actorOwnerMailAfterPass'],
    ['actorNaturalEvolutionSourceOnly', 'actorNaturalEvolutionRoot'],
    ['actorDceMewMobilitySourceOnly', 'actorDceMewMobilityRoot'],
    ['actorMewGenesectTechnoBlastSourceOnly', 'actorMewGenesectTechnoBlast'],
    ['actorMewDceRecipientSourceOnly', 'actorMewDceRecipientRoot']
  ];
  for (const [flag, feature] of pairs) {
    assert.equal(source.options[flag], true, flag);
    assert.equal(source.options[feature], true, feature);
    assert.equal(candidate.options[flag], false, flag);
    assert.equal(candidate.options[feature], false, feature);
  }
  assert.equal(source.options.sourceScopedQuickBallRoot, true);
  assert.equal(candidate.options.sourceScopedQuickBallRoot, false);
  assert.deepEqual(source.unknownSourceOnlyFlags, []);
  assert.deepEqual(candidate.unknownSourceOnlyFlags, []);

  const result = policyDefinitionHashes(policyInput({ options }));
  assert.equal(result.complete, true);
  assert.equal(result.samePolicy, false);
  assert.notEqual(result.policySha256BySeat[0], result.policySha256BySeat[1]);
  assert.deepEqual(result.perSeat[0].enabledSourceOnlyFlags.slice().sort(),
    pairs.map(([flag]) => flag).sort());
  assert.deepEqual(result.perSeat[1].enabledSourceOnlyFlags, []);
});

