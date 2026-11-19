'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

const OUTPUT_PATH = 'results/methodology/2026-11/shared-policy-challenge-corpus-v1.json';
const PANEL_MANIFEST = {
  path: 'results/methodology/2026-11/agent17-aichi-policy-panel-manifest-20261117.json',
  blob: '01fe1525c78369cfce964ef7532dc4f5db0cd0ea'
};
const SOURCE_SUITES = [
  { rank: 2, path: 'simulation/evaluation/2026-11/agent45-rank2-vileplume-control-challenge-suite-v2.json', blob: 'd5745e3c295bcd5ca485415943688dc29e062db6' },
  { rank: 3, path: 'results/aichi-2026/2026-11/agent17-rank3-snorlax-stall-opponent-policy-challenge-suite-v1.json', blob: 'd3cd2eba6fc1de22381732a19446a9df44d3920d' },
  { rank: 4, path: 'results/aichi-2026/2026-11/agent50-rank4-raichu-electrode-opponent-policy-challenge-suite-v2.json', blob: '1ba58f2cfbb6fc4094afe3b582b10b6b37e8dec9' },
  { rank: 5, path: 'results/methodology/2026-11/agent20-rank5-mew-genesect-challenge-suite-v8.json', blob: '75f2f6ca4df11a10ca5cec6f4997fd9b65c64b6b' },
  { rank: 6, path: 'results/aichi-2026/2026-11/agent39-rank6-iron-thorns-opponent-policy-challenge-suite-v1.json', blob: 'c9c74af47fd8f07daf82672caa56ca0d3db73419' },
  { rank: 7, path: 'results/aichi-2026/2026-11/agent43-rank7-snorlax-stall-opponent-policy-challenge-suite-v2.json', blob: 'b6581c6e327dfff657080b134068e5a2a8ac2ee7' },
  { rank: 8, path: 'results/aichi-2026/2026-11/agent44-rank8-opponent-policy-v1-challenge-suite.json', blob: '61225d17965498cc5e9084f819f70852e61e58ca' },
  { rank: 10, path: 'results/methodology/2026-11/agent43-rank10-phantom-dive-challenge-suite-v2.json', blob: '148798cb40e1f9b076bedb0b6f55d0caf562859e' },
  { rank: 11, path: 'results/aichi-2026/2026-11/agent31-rank11-opponent-policy-v1-challenge-suite.json', blob: '4a8e43ccbfcb5b2caf8a040f962d3712b98eba65' },
  { rank: 12, path: 'results/aichi-2026/2026-11/agent1-rank12-regidrago-opponent-policy-challenge-suite-v2.json', blob: 'd3804faab4070e71c827875e3bb001b96a4d0e88' },
  { rank: 19, path: 'results/methodology/2026-11/agent23-rank19-challenge-suite-v1.json', blob: '5e34e74957fc3ce0815a54d4036a45f2d2ca6f0e' },
  { rank: 31, path: 'results/aichi-2026/2026-11/agent35-rank31-opponent-policy-challenge-suite-v3.json', blob: '986b64d9d0a9724fab329167554e4c6ece5ca629' }
];
const CASE_ARRAYS = [
  'developmentCases',
  'scenarios',
  'negativeControls',
  'heldOutReviewCases',
  'heldOutCases',
  'nativeBlockedCases'
];

function pick(object, keys) {
  for (const key of keys) {
    if (object && object[key] !== undefined && object[key] !== null) return object[key];
  }
  return null;
}

function gitBlobSha1(bytes) {
  const data = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes);
  return createHash('sha1')
    .update(Buffer.from('blob ' + data.length + '\0', 'utf8'))
    .update(data)
    .digest('hex');
}

function readPinnedJson(rootDir, spec) {
  const filePath = path.resolve(rootDir, spec.path);
  const bytes = fs.readFileSync(filePath);
  const actualBlob = gitBlobSha1(bytes);
  if (actualBlob !== spec.blob) {
    throw new Error('Pinned source changed: ' + spec.path +
      ' expected Git blob ' + spec.blob + ' but found ' + actualBlob);
  }
  return JSON.parse(bytes.toString('utf8'));
}

function normalizeSplit(rawSplit, arrayKey) {
  const value = String(rawSplit === null || rawSplit === undefined ? '' : rawSplit)
    .toLowerCase().replace(/[_\s]+/g, '-');
  if (value.includes('held') || value.includes('review')) return 'held-out';
  if (value.includes('negative')) return 'negative-control';
  if (value.includes('block')) return 'blocked';
  if (value.includes('develop')) return 'development';
  if (arrayKey === 'negativeControls') return 'negative-control';
  if (arrayKey === 'heldOutReviewCases' || arrayKey === 'heldOutCases') return 'held-out';
  if (arrayKey === 'nativeBlockedCases') return 'blocked';
  return 'development';
}

function normalizeCase(suite, spec, arrayKey, index) {
  const sourceCase = suite[arrayKey][index] || {};
  const rawId = pick(sourceCase, ['caseId', 'id']);
  const actorView = sourceCase.actorView;
  const actorViewDigest =
    pick(sourceCase, ['actorViewSha256', 'actorViewDigest']) ||
    pick(actorView, ['sha256', 'digest']) ||
    (typeof actorView === 'string' && /^[a-f0-9]{64}$/i.test(actorView) ? actorView : null);
  const evidenceClass = pick(sourceCase, ['evidenceClass', 'evidence_class']) || 'unspecified';
  const disposition = typeof sourceCase.disposition === 'string'
    ? sourceCase.disposition
    : pick(sourceCase.disposition, ['status', 'result', 'outcome']) ||
      pick(sourceCase, ['status']);

  return {
    rank: spec.rank,
    suiteId: pick(suite, ['suiteId']) || pick(suite.suiteHeader, ['suiteId']) || null,
    sourceSuitePath: spec.path,
    sourceSuiteGitBlobSha1: spec.blob,
    sourceArray: arrayKey,
    sourceArrayIndex: index,
    caseId: rawId || (arrayKey + '#' + (index + 1)),
    stableCaseId: typeof rawId === 'string' && rawId.length > 0,
    split: normalizeSplit(sourceCase.split, arrayKey),
    rawSplit: pick(sourceCase, ['split']),
    evidenceClass,
    caseFamily: pick(sourceCase, [
      'caseClass', 'caseCategory', 'scenarioFamily', 'criticalPlanLine', 'testName', 'category'
    ]),
    objective: pick(sourceCase, ['objective', 'title', 'testName', 'criticalPlanLine']),
    actorViewDigest: actorViewDigest || null,
    actorViewRef: pick(sourceCase, ['actorViewRef', 'actorViewPath']),
    hasActorView: (actorView !== undefined && actorView !== null) ||
      !!actorViewDigest || !!pick(sourceCase, ['actorViewRef', 'actorViewPath']),
    hasDecisionEnvelope: sourceCase.decisionEnvelope !== undefined && sourceCase.decisionEnvelope !== null,
    hasCostLedger: sourceCase.costLedger !== undefined && sourceCase.costLedger !== null,
    hasPromptCoverage: sourceCase.promptCoverage !== undefined && sourceCase.promptCoverage !== null,
    hasExecutionEvidence: sourceCase.executionEvidence !== undefined && sourceCase.executionEvidence !== null,
    hasCaseSourceBinding: sourceCase.sourceBinding !== undefined && sourceCase.sourceBinding !== null,
    disposition: disposition || null,
    reviewerStatus: pick(sourceCase, ['reviewerStatus']) ||
      pick(sourceCase.reviewer, ['status']) ||
      pick(sourceCase.review, ['status']) || null
  };
}

function normalizeSuite(rootDir, spec, cases) {
  const suite = readPinnedJson(rootDir, spec);
  const policy = suite.policy || {};
  const sourceDeck = suite.sourceDeck ||
    (suite.sourceBinding && suite.sourceBinding.opponentDeck) ||
    (suite.sourceBinding && suite.sourceBinding.sourceDeck) ||
    (suite.sourceBinding && suite.sourceBinding.sourceList) || {};
  const candidateDeck = suite.candidateDeck || suite.candidateBinding ||
    (suite.sourceBinding && suite.sourceBinding.fixedCandidate) || {};
  const engine = suite.engine || (suite.dependencies && suite.dependencies.engine) || {};
  const rank = pick(suite, ['sourceRank']) ||
    pick(policy, ['sourceRank']) ||
    pick(suite.sourceBinding, ['sourceRank']) ||
    pick(sourceDeck, ['rank']) || spec.rank;
  if (rank !== spec.rank) {
    throw new Error('Rank mismatch in ' + spec.path + ': expected ' + spec.rank + ', found ' + rank);
  }

  const caseArrayCounts = {};
  const evidenceClassCounts = {};
  for (const arrayKey of CASE_ARRAYS) {
    if (!Array.isArray(suite[arrayKey])) continue;
    caseArrayCounts[arrayKey] = suite[arrayKey].length;
    for (let index = 0; index < suite[arrayKey].length; index += 1) {
      const record = normalizeCase(suite, spec, arrayKey, index);
      cases.push(record);
      evidenceClassCounts[record.evidenceClass] =
        (evidenceClassCounts[record.evidenceClass] || 0) + 1;
    }
  }

  const execution = suite.executionSummary || suite.testExecution || suite.evidenceSummary || {};
  const sourceFingerprint =
    pick(sourceDeck, [
      'fingerprintSha256', 'sourceDeckFingerprintSha256', 'deckFingerprintSha256',
      'printed60Sha256', 'sourceEntryFingerprintSha256', 'sourceEntryJsonSha256'
    ]) ||
    pick(suite.sourceBinding, [
      'sourceDeckFingerprintSha256', 'sourceEntryFingerprintSha256',
      'sourceEntryJsonSha256', 'sourceFingerprintSha256'
    ]);
  const candidateFingerprint =
    pick(candidateDeck, ['fingerprintSha256', 'fixedCandidateFingerprintSha256', 'deckFingerprintSha256']) ||
    pick(suite.suiteHeader, ['candidateDeckFingerprintSha256']) ||
    pick(suite.sourceBinding && suite.sourceBinding.fixedCandidate, [
      'fingerprintSha256', 'fixedCandidateFingerprintSha256'
    ]);

  return {
    rank,
    suiteId: pick(suite, ['suiteId']) || pick(suite.suiteHeader, ['suiteId']) || null,
    suitePath: spec.path,
    suiteGitBlobSha1: spec.blob,
    schema: pick(suite, ['schema', 'schemaVersion']),
    version: pick(suite, ['suiteVersion', 'version']),
    declaredSuiteSha256: pick(suite, ['suiteSha256']),
    status: pick(suite, ['status']),
    attestationStatus: pick(suite, ['attestationStatus']),
    policyPath: pick(policy, ['path', 'modulePath']),
    policyVersion: pick(policy, ['version', 'policyVersion']),
    policyGitBlobSha1: pick(policy, ['blobSha1', 'moduleBlobSha1', 'gitBlobSha1', 'moduleGitBlobSha1']),
    policySha256: pick(policy, ['sha256', 'moduleSha256', 'fileSha256']),
    sourceDeckPath: pick(sourceDeck, ['path', 'sourceListPath', 'sourceDeckPath']) ||
      pick(suite.sourceBinding, ['sourceListPath', 'sourceDeckPath']),
    sourceDeckFingerprintSha256: sourceFingerprint,
    candidateDeckPath: pick(candidateDeck, ['path', 'candidatePath']),
    candidateDeckFingerprintSha256: candidateFingerprint,
    enginePinnedCommit: pick(engine, ['pinnedCommit', 'pinnedRevision']),
    caseArrayCounts,
    caseCount: Object.values(caseArrayCounts).reduce((sum, count) => sum + count, 0),
    unresolvedCoverageCount: Array.isArray(suite.unresolvedCoverage) ? suite.unresolvedCoverage.length : 0,
    evidenceClassCounts,
    nativeGames: pick(execution, ['nativeGames', 'TwinleafGamesExecuted', 'gamesPlayed']),
    matchupsPlayed: pick(execution, ['matchupsPlayed', 'matchSamples']),
    fullTop32Coverage: pick(execution, ['fullTop32Coverage']),
    winRateClaim: pick(execution, ['winRateClaim', 'claims99_5Percent'])
  };
}

function countBy(records, key) {
  return records.reduce((counts, record) => {
    const value = record[key];
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
}

function buildCorpus(rootDir) {
  const repositoryRoot = rootDir || path.resolve(__dirname, '../../..');
  const panel = readPinnedJson(repositoryRoot, PANEL_MANIFEST);
  const panelRanks = new Set((panel.ranks || []).map(entry => entry.rank));
  const cases = [];
  const sourceSuites = SOURCE_SUITES.map(spec => {
    if (!panelRanks.has(spec.rank)) {
      throw new Error('Source rank ' + spec.rank + ' is absent from the pinned Aichi panel manifest');
    }
    return normalizeSuite(repositoryRoot, spec, cases);
  });
  const indexedRanks = sourceSuites.map(source => source.rank).sort((a, b) => a - b);
  const allRanks = Array.from({ length: 32 }, (_, index) => index + 1);
  const missing = key => cases.filter(record => !record[key]).length;

  return {
    schema: 'aichi-shared-policy-challenge-corpus/v1',
    status: 'index-only; not a policy bundle, competence attestation, matchup result, or field evaluation',
    purpose: 'Compact, source-pinned index of existing Aichi opponent-policy challenge cases for conversion into regression and held-out challenges for one shared seat-symmetric policy/search implementation.',
    benchmark: {
      primaryEstimand: 'One English-language paper Expanded candidate against the unchanged original Aichi Japanese Extra Top 32 lists; custom cross-format challenge, not a sanctioned Expanded-vs-Expanded result.',
      referenceCandidate: {
        name: 'Hood Shield Shadow Rider v1',
        fingerprintSha256: '1880c60b44761c0cf22eb3e5cfa43e6e5581c174dc737932c19728cc5da5a1e4',
        status: 'leading developmental challenger; not selected as final fixed 60'
      },
      twinleaf: {
        submodulePath: 'vendor/twinleaf',
        remote: 'https://github.com/twinleafgg/twinleafgg.git',
        pinnedCommit: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05'
      },
      fieldStatus: {
        exactSourceLists: 29,
        sourceRanksUnavailable: [23, 25, 28],
        originalPhysicalOpponentsPaperAdmitted: 0,
        competitivelyQualifiedGames: 0,
        finalFixed60Selected: false,
        demonstratedWinRate: null,
        claims99_5Percent: false
      }
    },
    sharedPolicyContract: {
      implementation: 'One reusable policy/search implementation must pilot either physical seat and any exact source deck; rank/deck identity comes only from a frozen source manifest, never a rank-specific runtime policy module.',
      observationBoundary: 'Actor-visible observation, legal action frontier, and permitted public history/receipts only; never opponent hidden zones or physical RNG/seed as policy inputs.',
      evaluation: 'Same architecture on both seats; preserve development/held-out split; held-out cases never tune policy; source-natural/native-staged/synthetic evidence remain distinct.',
      suiteContentContract: 'results/methodology/2026-11/agent2-policy-challenge-suite-operational-contract-20261117.md',
      fieldPanelManifest: 'results/methodology/2026-11/agent17-aichi-policy-panel-manifest-20261117.json',
      prototypeReadinessSynthesis: 'results/methodology/2026-11/agent35-opponent-policy-prototype-readiness-20261117.md'
    },
    coverage: {
      indexedRanks,
      ranksNotIndexed: allRanks.filter(rank => !indexedRanks.includes(rank)),
      sourceUnavailableRanks: [23, 25, 28],
      suiteCount: sourceSuites.length,
      candidatePolicySuiteIncluded: false,
      rank1FirstTracePolicyIncludedAsSuite: false,
      note: 'Only source suites found in the current public tree are indexed. Absence here is not proof that no private or uncommitted suite exists; it is not permission to invent a proxy.'
    },
    summary: {
      caseCount: cases.length,
      splitCounts: countBy(cases, 'split'),
      evidenceClassCounts: countBy(cases, 'evidenceClass'),
      casesWithActorView: cases.filter(record => record.hasActorView).length,
      casesWithActorViewDigest: cases.filter(record => record.actorViewDigest).length,
      casesWithDecisionEnvelope: cases.filter(record => record.hasDecisionEnvelope).length,
      casesWithCostLedger: cases.filter(record => record.hasCostLedger).length,
      casesWithPromptCoverage: cases.filter(record => record.hasPromptCoverage).length,
      casesWithExecutionEvidence: cases.filter(record => record.hasExecutionEvidence).length,
      casesWithStableCaseId: cases.filter(record => record.stableCaseId).length,
      casesWithCaseSourceBinding: cases.filter(record => record.hasCaseSourceBinding).length,
      casesMissing: {
        actorViewDigest: missing('actorViewDigest'),
        decisionEnvelope: missing('hasDecisionEnvelope'),
        costLedger: missing('hasCostLedger'),
        promptCoverage: missing('hasPromptCoverage'),
        executionEvidence: missing('hasExecutionEvidence'),
        stableCaseId: missing('stableCaseId')
      }
    },
    sourceSuites,
    cases
  };
}

function resolveCase(rootDir, corpusRecord) {
  const spec = SOURCE_SUITES.find(source =>
    source.path === corpusRecord.sourceSuitePath &&
    source.blob === corpusRecord.sourceSuiteGitBlobSha1
  );
  if (!spec) throw new Error('Case reference is not part of the pinned source set');
  const suite = readPinnedJson(rootDir || path.resolve(__dirname, '../../..'), spec);
  const records = suite[corpusRecord.sourceArray];
  if (!Array.isArray(records)) throw new Error('Referenced source array is missing');
  const sourceCase = records[corpusRecord.sourceArrayIndex];
  if (!sourceCase) throw new Error('Referenced source case is missing');
  const rawId = pick(sourceCase, ['caseId', 'id']);
  if (corpusRecord.stableCaseId && rawId !== corpusRecord.caseId) {
    throw new Error('Stable case ID no longer matches its pinned source record');
  }
  return sourceCase;
}

if (require.main === module) {
  const rootDir = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(__dirname, '../../..');
  const corpus = buildCorpus(rootDir);
  const serialized = JSON.stringify(corpus, null, 2) + '\n';
  if (process.argv.includes('--write')) {
    fs.writeFileSync(path.join(rootDir, OUTPUT_PATH), serialized);
  } else {
    process.stdout.write(serialized);
  }
}

module.exports = {
  OUTPUT_PATH,
  PANEL_MANIFEST,
  SOURCE_SUITES,
  buildCorpus,
  gitBlobSha1,
  normalizeCase,
  normalizeSplit,
  readPinnedJson,
  resolveCase
};
