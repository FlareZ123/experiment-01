'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');

const ROOT = path.resolve(__dirname, '../../../../');
const OUTPUT = path.join(ROOT,
  'results/methodology/2026-11/agent19/shared-player-challenge-corpus-v1.json');
const EXPECTED_ENGINE_PIN = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const ACTUAL_SUBMODULE_PATH = 'vendor/twinleaf';
const ACTUAL_SUBMODULE_REMOTE = 'https://github.com/twinleafgg/twinleafgg.git';
const CANDIDATE_FINGERPRINT =
  '1880c60b44761c0cf22eb3e5cfa43e6e5581c174dc737932c19728cc5da5a1e4';

const INPUTS = [
  {
    rank: 3,
    path: 'results/aichi-2026/2026-11/agent17-rank3-snorlax-stall-opponent-policy-challenge-suite-v1.json',
    cases: [
      ['r3-dev-05-faba-removes-a-visible-opponent-stealthy-hood-before-lower-v', 'tool-control-and-counterplay'],
      ['r3-dev-08-eri-can-discard-field-blower-and-dual-subtype-forest-seal-st', 'resource-cost-and-card-subtypes'],
      ['r3-dev-40-teammates-search-and-play-gated-by-prior-turn-ko', 'event-receipt-and-turn-state'],
      ['r3-dev-12-unsupported-native-prompt-families-fail-closed-rather-than-s', 'unsupported-prompt-fail-closed'],
      ['r3-ho-01-fieldblower-hood-escape', 'held-out-tool-counterplay']
    ]
  },
  {
    rank: 4,
    path: 'results/aichi-2026/2026-11/agent50-rank4-raichu-electrode-opponent-policy-challenge-suite-v2.json',
    cases: [
      ['rank4-dev-05-battle-vip-pass-searches-voltorb-and-pikachu-as-the-two-opening-', 'opening-and-core-plan'],
      ['rank4-dev-14-unit-energy-is-attached-to-alolan-raichu-rather-than-a-support-p', 'energy-allocation'],
      ['rank4-dev-11-hidden-prize-identities-remain-unknown-and-produce-an-abstention', 'hidden-information'],
      ['rank4-dev-19-extra-energy-bomb-prompt-is-declined-rather-than-delegated', 'unsupported-prompt-fail-closed'],
      ['rank4-heldout-source-natural-opening-to-electro-rain', 'held-out-core-plan']
    ]
  },
  {
    rank: 5,
    path: 'results/methodology/2026-11/agent20-rank5-mew-genesect-challenge-suite-v8.json',
    cases: [
      ['R5-FSS-DRAW', 'once-per-turn-draw-sequencing'],
      ['R5-CROSS-FUSION-TECHNO', 'attack-selection-and-donor'],
      ['R5-QUICK-BALL-DISCARD', 'resource-cost-and-preservation'],
      ['R5-TYPED-COST-NEGATIVE', 'typed-energy-legality'],
      ['R5-HO-ENERGY-MIX-WHIFF', 'held-out-search-abstention']
    ]
  },
  {
    rank: 6,
    path: 'results/aichi-2026/2026-11/agent39-rank6-iron-thorns-opponent-policy-challenge-suite-v1.json',
    cases: [
      ['rank6-dev-05-plumeria-denial-outranks-deckout-when-opponent-bench-has-energy-and-paym', 'resource-denial-vs-deckout'],
      ['rank6-dev-13-volt-cyclone-removes-an-active-budew-lock-when-an-attack-is-offered', 'lock-counterplay'],
      ['rank6-dev-29-gladion-prize-selection-abstains-because-face-down-prize-identities-are-', 'prize-information'],
      ['rank6-dev-32-the-real-worker-request-validator-rejects-hidden-opponent-hand-and-rng-f', 'hidden-information-and-seed-privacy'],
      ['rank6-ho-01-native-prompt-settlement', 'held-out-native-prompt-completion']
    ]
  },
  {
    rank: 7,
    path: 'results/aichi-2026/2026-11/agent43-rank7-snorlax-stall-opponent-policy-challenge-suite-v2.json',
    cases: [
      ['r7v2-dev-01-faba-root', 'tool-removal-counterplay'],
      ['r7v2-dev-04-jet-wobbuffet', 'lock-and-board-tradeoff'],
      ['r7v2-dev-03-psychic-hood-negative', 'negative-target-control'],
      ['r7v2-dev-06-alolan-muk-negative', 'negative-ability-lock-control'],
      ['r7v2-ho-03-snorlax-block-tradeoff', 'held-out-lock-tradeoff']
    ]
  },
  {
    rank: 31,
    path: 'results/aichi-2026/2026-11/agent35-rank31-opponent-policy-challenge-suite-v3.json',
    cases: [
      ['r31-dev-02-dusknoir-pre-cursed-blast', 'prize-conversion-and-damage'],
      ['r31-dev-03-dusclops-pre-cursed-blast', 'effect-specific-damage-threshold'],
      ['r31-dev-05-field-blower-mode', 'multi-target-tool-control'],
      ['r31-dev-10-poltergeist-information', 'hidden-information'],
      ['r31-ho-01-dusclops-native-cursed-blast', 'held-out-native-prompt-effect']
    ]
  }
];

function pick() {
  for (const value of arguments) {
    if (value !== undefined && value !== null) return value;
  }
  return null;
}

function gitBlobSha1(text) {
  const bytes = Buffer.from(text, 'utf8');
  return createHash('sha1')
    .update(Buffer.from('blob ' + bytes.length + '\0', 'utf8'))
    .update(bytes)
    .digest('hex');
}

function getRank(suite) {
  return pick(
    suite.sourceRank,
    suite.policy && suite.policy.sourceRank,
    suite.suiteHeader && suite.suiteHeader.sourceRank,
    suite.sourceBinding && suite.sourceBinding.sourceRank,
    suite.sourceBinding && suite.sourceBinding.opponentDeck &&
      suite.sourceBinding.opponentDeck.rank
  );
}

function engineOf(suite) {
  return suite.engine || (suite.dependencies && suite.dependencies.engine) || {};
}

function sourceOf(suite) {
  const binding = suite.sourceBinding || {};
  const source = binding.opponentDeck || binding.sourceDeck || suite.sourceDeck || {};
  return {
    path: pick(source.path, source.sourceListPath, binding.sourceListPath,
      binding.sourceDeckPath, suite.sourceDeck && suite.sourceDeck.path),
    gitBlobSha1: pick(source.gitBlobSha1, source.sourceListBlobSha1,
      binding.sourceListBlobSha1, binding.sourceDeckBlobSha1,
      suite.sourceDeck && suite.sourceDeck.blobSha1),
    fileSha256: pick(source.fileSha256, source.sourceListFileSha256,
      binding.sourceListFileSha256, binding.sourceDeckFileSha256),
    fingerprintSha256: pick(source.fingerprintSha256,
      binding.sourceDeckFingerprintSha256, binding.sourceEntryFingerprintSha256,
      suite.sourceDeck && suite.sourceDeck.printed60Sha256),
    entrySha256: pick(binding.sourceEntryJsonSha256,
      binding.sourceEntryFingerprintSha256),
    player: pick(source.player, binding.sourceDeckPlayer, binding.player),
    cardCount: pick(source.physicalCardCount,
      binding.sourcePhysicalCardCount, binding.sourceDeckCardCount,
      suite.sourceDeck && suite.sourceDeck.physicalCards)
  };
}

function candidateOf(suite) {
  const binding = suite.sourceBinding || {};
  const candidate = binding.fixedCandidate || suite.candidateDeck || {};
  return {
    path: pick(candidate.path, binding.fixedCandidatePath),
    gitBlobSha1: pick(candidate.gitBlobSha1, candidate.blobSha1,
      binding.fixedCandidateBlobSha1),
    fileSha256: pick(candidate.fileSha256, binding.fixedCandidateFileSha256),
    fingerprintSha256: pick(candidate.fingerprintSha256,
      binding.fixedCandidateFingerprintSha256,
      suite.suiteHeader && suite.suiteHeader.candidateDeckFingerprintSha256),
    cardCount: pick(candidate.physicalCardCount,
      binding.fixedCandidatePhysicalCardCount)
  };
}

function policyOf(suite) {
  const policy = suite.policy || {};
  return {
    id: pick(policy.policyId, policy.id, policy.policyVersion, policy.version),
    version: pick(policy.version, policy.policyVersion),
    path: pick(policy.modulePath, policy.path),
    blobSha1: pick(policy.moduleBlobSha1, policy.blobSha1, policy.gitBlobSha1),
    sha256: pick(policy.moduleSha256, policy.sha256, policy.fileSha256),
    producerId: pick(policy.policyProducerId, policy.producerId,
      suite.policyProducerId,
      suite.producerBindings && suite.producerBindings.opponentPolicyProducerIdByRank &&
        suite.producerBindings.opponentPolicyProducerIdByRank[String(getRank(suite))]),
    configKeys: Object.keys(policy.config || {}).sort(),
    deterministic: pick(policy.deterministic, null)
  };
}

function collectCases(suite) {
  const out = [];
  for (const record of suite.developmentCases || [])
    out.push({record, split: 'development'});
  for (const record of suite.heldOutReviewCases || [])
    out.push({record, split: 'held-out'});
  for (const record of suite.scenarios || []) {
    out.push({
      record,
      split: String(record.split || 'development').startsWith('held') ?
        'held-out' : 'development'
    });
  }
  return out;
}

function assertNoHiddenActorFields(value, caseId, location) {
  if (Array.isArray(value)) {
    for (const item of value) assertNoHiddenActorFields(item, caseId, location);
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    if (/^(opponentHandCards|opponentDeckCards|opponentPrizeCards|hiddenOpponentHand|hiddenOpponentDeck|hiddenOpponentPrize|randomSeed|rngState|fullStateSnapshot|rawGameState)$/i.test(key)) {
      throw new Error(caseId + ': forbidden actor-view field ' + location + '.' + key);
    }
    assertNoHiddenActorFields(child, caseId, location + '.' + key);
  }
}

function assertActorViewSafe(actorView, caseId) {
  if (!actorView) return;
  assertNoHiddenActorFields(actorView, caseId, 'actorView');
  if (actorView.hiddenOpponentZonesIncluded === true)
    throw new Error(caseId + ': hidden opponent zones included');
  if (actorView.exactRuntimeObservationCaptured === true &&
      !/^[0-9a-f]{64}$/i.test(pick(
        actorView.runtimeActorViewDigestSha256, actorView.digestSha256, ''
      ))) {
    throw new Error(caseId + ': exact runtime view missing digest');
  }
}

function normalizeCase(suite, suiteMeta, raw, split, challengeFamily) {
  const actorView = raw.actorView || null;
  assertActorViewSafe(actorView, raw.caseId);
  const caseBinding = raw.sourceBinding || {};
  const source = suiteMeta.sourceDeck;
  const candidate = suiteMeta.candidateDeck;
  const engine = suiteMeta.engine;
  const evidence = pick(
    raw.evidenceClass,
    raw.executionEvidence && raw.executionEvidence.evidenceClass,
    split === 'held-out' ? 'none' : 'unknown'
  );
  if (!['source-natural', 'native-staged', 'synthetic', 'none', 'unknown'].includes(evidence))
    throw new Error(raw.caseId + ': unknown evidence class ' + evidence);

  const rawDisposition = raw.disposition;
  const dispositionStatus = typeof rawDisposition === 'string' ?
    rawDisposition : pick(rawDisposition && rawDisposition.status, raw.status, 'blocked');
  const reason = pick(
    raw.blockReason,
    raw.dispositionReason,
    rawDisposition && typeof rawDisposition === 'object' && rawDisposition.reason,
    raw.reviewerExplanation,
    raw.reason
  );
  const execution = raw.executionEvidence || null;
  const nativeReceipt = pick(
    execution && execution.nativeStoreReceipt,
    execution && execution.nativeAcceptance,
    execution && execution.nativeEffectReceipt
  );
  const traceDigest = pick(
    execution && execution.traceDigest,
    execution && execution.nativeTraceDigest,
    execution && execution.nativeTraceDigestSha256,
    execution && execution.traceDigestSha256
  );
  const nativeGameCount = pick(
    execution && execution.gameCount,
    execution && execution.nativeGameCount,
    execution && execution.nativeGames
  );
  const runtimeDigest = actorView && actorView.exactRuntimeObservationCaptured === true ?
    pick(actorView.runtimeActorViewDigestSha256, actorView.digestSha256) : null;

  return {
    caseId: raw.caseId,
    sourceRank: suiteMeta.sourceRank,
    role: suiteMeta.role,
    split,
    challengeFamily,
    caseClass: pick(raw.caseClass, raw.caseCategory, raw.category, 'decision-case'),
    criticalPlanLine: pick(raw.criticalPlanLine, null),
    objective: pick(raw.objective, raw.title, ''),
    evidenceClass: evidence,
    trainingUse: split === 'held-out' ?
      'held-out-not-used-for-tuning' : 'development-regression-only',
    sourceBinding: {
      sourceDeckPath: source.path || null,
      sourceDeckGitBlobSha1: source.gitBlobSha1 || null,
      sourceDeckFingerprintSha256: source.fingerprintSha256 || null,
      sourceDeckEntrySha256: source.entrySha256 || null,
      sourceDeckCardCount: source.cardCount || null,
      sourceDeckPlayer: source.player || null,
      candidateDeckPath: candidate.path || null,
      candidateDeckGitBlobSha1: candidate.gitBlobSha1 || null,
      candidateDeckFingerprintSha256: candidate.fingerprintSha256 || null,
      engineCommit: engine.pinnedCommit,
      researchHookRevision: engine.researchHookRevision,
      cardPrintReferences: pick(
        caseBinding.cardPrintReferences,
        caseBinding.relevantCardPrintings,
        suite.sourceBinding && suite.sourceBinding.cardPrintReferences,
        []
      ),
      fixtureRef: pick(
        raw.fixtureRef,
        actorView && actorView.fixtureRef,
        execution && execution.testPath,
        actorView && actorView.view && actorView.view.fixtureRef
      ),
      sourceTraceRef: pick(
        caseBinding.sourceTraceRef,
        raw.sourceTraceRef,
        suite.sourceBinding && suite.sourceBinding.sourceTrace &&
          suite.sourceBinding.sourceTrace.path,
        suite.sourceTrace && suite.sourceTrace.path
      )
    },
    actorView: {
      scope: actorView && actorView.scope || null,
      runtimeDigestSha256: runtimeDigest || null,
      fixtureDescriptorSha256: actorView && actorView.fixtureDescriptorSha256 || null,
      digestAlgorithm: actorView && actorView.digestAlgorithm || null,
      fixtureRef: actorView && actorView.fixtureRef || null,
      hiddenOpponentZonesIncluded: actorView &&
        actorView.hiddenOpponentZonesIncluded !== undefined ?
        actorView.hiddenOpponentZonesIncluded : null,
      exactRuntimeObservationCaptured: Boolean(
        actorView && actorView.exactRuntimeObservationCaptured
      ),
      payload: actorView
    },
    decisionEnvelope: raw.decisionEnvelope || null,
    costLedger: raw.costLedger || null,
    promptCoverage: raw.promptCoverage || null,
    executionEvidence: execution,
    disposition: {
      status: dispositionStatus,
      reason: reason || null,
      reviewerStatus: pick(
        raw.reviewerStatus,
        raw.reviewer && raw.reviewer.status
      ),
      unitTestResult: pick(
        execution && execution.unitTestResult,
        execution && execution.result,
        raw.unitResult,
        raw.testResult
      ),
      nativeTwinleafExecution: pick(
        execution && execution.nativeTwinleafExecution
      ),
      nativeStoreReceiptPresent: nativeReceipt !== undefined && nativeReceipt !== null,
      nativeTraceDigestPresent: traceDigest !== undefined && traceDigest !== null,
      nativeGameCount: nativeGameCount === undefined ? null : nativeGameCount
    },
    sourceRecord: {
      suitePath: suiteMeta.path,
      suiteBlobSha1: suiteMeta.blobSha1,
      suiteId: suiteMeta.suiteId,
      caseId: raw.caseId
    }
  };
}

function buildCorpus(root = ROOT) {
  const sourceSuites = [];
  const cases = [];

  for (const input of INPUTS) {
    const absolute = path.join(root, input.path);
    const rawText = fs.readFileSync(absolute, 'utf8');
    const suite = JSON.parse(rawText);
    const rank = getRank(suite);
    if (rank !== input.rank)
      throw new Error(input.path + ': expected rank ' + input.rank + ', found ' + rank);

    const binding = suite.sourceBinding || {};
    const declaredEngine = engineOf(suite);
    const declaredSubmodulePath = pick(
      declaredEngine.submodulePath,
      binding.engineSubmodulePath,
      ACTUAL_SUBMODULE_PATH
    );
    const declaredRemote = pick(
      declaredEngine.remote,
      binding.engineRemote,
      ACTUAL_SUBMODULE_REMOTE
    );
    const pin = pick(
      declaredEngine.pinnedCommit,
      declaredEngine.pinnedRevision,
      binding.enginePinnedCommit,
      binding.engineCommit,
      suite.suiteHeader && suite.suiteHeader.engine &&
        suite.suiteHeader.engine.pinnedCommit
    );
    if (pin !== EXPECTED_ENGINE_PIN)
      throw new Error(input.path + ': Twinleaf pin mismatch: ' + pin);

    const sourceDeck = sourceOf(suite);
    const candidateDeck = candidateOf(suite);
    if (sourceDeck.cardCount !== 60)
      throw new Error(input.path + ': source deck list card count is not 60');
    if (candidateDeck.fingerprintSha256 !== CANDIDATE_FINGERPRINT)
      throw new Error(input.path + ': candidate fingerprint mismatch');

    const policy = policyOf(suite);
    const meta = {
      path: input.path,
      blobSha1: gitBlobSha1(rawText),
      suiteId: pick(suite.suiteId),
      suiteVersion: pick(suite.suiteVersion, suite.version),
      status: pick(suite.status),
      attestationStatus: pick(suite.attestationStatus),
      sourceRole: pick(suite.role, suite.policy && suite.policy.role,
        suite.suiteHeader && suite.suiteHeader.role, 'opponent-policy'),
      role: 'opponent',
      sourceRank: rank,
      sourceDeck,
      candidateDeck,
      engine: {
        actualSubmodulePath: ACTUAL_SUBMODULE_PATH,
        declaredSubmodulePath,
        actualRemote: ACTUAL_SUBMODULE_REMOTE,
        declaredRemote,
        pinnedCommit: pin,
        researchHookRevision: pick(
          declaredEngine.researchHookRevision,
          binding.researchHookRevision,
          'none'
        )
      },
      policy,
      declaredSuiteSha256: pick(suite.suiteSha256),
      originalCaseCounts: {
        development: suite.developmentCases ? suite.developmentCases.length :
          (suite.scenarios || []).filter(c => !String(c.split || '').startsWith('held')).length,
        heldOut: suite.heldOutReviewCases ? suite.heldOutReviewCases.length :
          (suite.scenarios || []).filter(c => String(c.split || '').startsWith('held')).length,
        negativeControls: (suite.negativeControls || []).length
      }
    };
    sourceSuites.push(meta);

    const byId = new Map(collectCases(suite).map(item => [item.record.caseId, item]));
    for (const [caseId, family] of input.cases) {
      const selected = byId.get(caseId);
      if (!selected)
        throw new Error(input.path + ': selected case not found: ' + caseId);
      const normalized = normalizeCase(
        suite, meta, selected.record, selected.split, family
      );
      if (normalized.disposition.status !== 'blocked')
        throw new Error(caseId + ': unexpected admission status ' +
          normalized.disposition.status);
      if (normalized.disposition.nativeStoreReceiptPresent ||
          normalized.disposition.nativeTraceDigestPresent ||
          normalized.disposition.nativeTwinleafExecution === true ||
          (typeof normalized.disposition.nativeGameCount === 'number' &&
            normalized.disposition.nativeGameCount > 0)) {
        throw new Error(caseId + ': native evidence appeared; review before regeneration');
      }
      cases.push(normalized);
    }
  }

  cases.sort((a, b) => a.sourceRank - b.sourceRank ||
    a.split.localeCompare(b.split) || a.caseId.localeCompare(b.caseId));

  const candidates = [...new Set(
    sourceSuites.map(suite => suite.candidateDeck.fingerprintSha256)
  )];
  if (candidates.length !== 1)
    throw new Error('Source suites do not share one candidate fingerprint');

  const countBy = key => cases.reduce((out, record) => {
    const value = record[key];
    out[value] = (out[value] || 0) + 1;
    return out;
  }, {});
  const corpus = {
    schema: 'aichi-shared-player-challenge-corpus-v1',
    purpose: 'Compact, source-bound regression and held-out challenge cases distilled from existing opponent-policy prototypes for one reusable, actor-observation-only, seat-symmetric player/search system.',
    targetArchitecture: 'One shared policy/search implementation used for either physical seat; no per-rank policy logic or runtime config dialects.',
    enginePin: EXPECTED_ENGINE_PIN,
    candidateDeckFingerprintSha256: candidates[0],
    sourceRanks: sourceSuites.map(suite => suite.sourceRank),
    corpusRules: [
      'Policy input is limited to the acting player’s validated observation, owner-authenticated prompt, public event receipt and legal action frontier.',
      'The same policy implementation must be seat-symmetric; seat and exact source-deck identity are immutable context, not hidden-state access.',
      'All current records are opponent-policy cases; they do not establish candidate-role coverage or seat-symmetry.',
      'Unknown or unsupported prompts, unavailable targets and unpayable actions fail closed; never fabricate a pass or delegate to a hidden-state bot.',
      'Development cases are regression-only, not supervised strategic labels; held-out cases are not used for tuning.',
      'A synthetic case proves only its recorded synthetic behavior. It is not native reachability, source-natural frequency, strategic competence, a matchup or a win-rate observation.'
    ],
    sourceSuites,
    summary: {
      totalCases: cases.length,
      developmentCases: cases.filter(record => record.split === 'development').length,
      heldOutCases: cases.filter(record => record.split === 'held-out').length,
      sourceRanks: [...new Set(cases.map(record => record.sourceRank))],
      roleCounts: cases.reduce((out, record) => {
        out[record.role] = (out[record.role] || 0) + 1;
        return out;
      }, {}),
      candidateRoleCases: cases.filter(record => record.role === 'candidate-policy').length,
      evidenceClassCounts: countBy('evidenceClass'),
      dispositionCounts: cases.reduce((out, record) => {
        const status = record.disposition.status;
        out[status] = (out[status] || 0) + 1;
        return out;
      }, {}),
      exactRuntimeActorViewDigests: cases.filter(record =>
        record.actorView.runtimeDigestSha256).length,
      nativeStoreReceipts: cases.filter(record =>
        record.disposition.nativeStoreReceiptPresent).length,
      nativeTraceDigests: cases.filter(record =>
        record.disposition.nativeTraceDigestPresent).length,
      nativeGameCount: cases.reduce((sum, record) => sum +
        (typeof record.disposition.nativeGameCount === 'number' ?
          record.disposition.nativeGameCount : 0), 0),
      sourceNaturalCases: cases.filter(record =>
        record.evidenceClass === 'source-natural').length,
      nativeStagedCases: cases.filter(record =>
        record.evidenceClass === 'native-staged').length
    },
    cases
  };

  if (corpus.summary.totalCases !== 30 ||
      corpus.summary.developmentCases !== 24 ||
      corpus.summary.heldOutCases !== 6 ||
      corpus.summary.nativeStoreReceipts !== 0 ||
      corpus.summary.nativeTraceDigests !== 0 ||
      corpus.summary.nativeGameCount !== 0 ||
      corpus.summary.exactRuntimeActorViewDigests !== 0) {
    throw new Error('Unexpected corpus evidence summary; manual review required');
  }
  return corpus;
}

if (require.main === module) {
  const corpus = buildCorpus();
  fs.mkdirSync(path.dirname(OUTPUT), {recursive: true});
  fs.writeFileSync(OUTPUT, JSON.stringify(corpus, null, 2) + '\n');
  process.stdout.write(JSON.stringify(corpus.summary, null, 2) + '\n');
}

module.exports = {buildCorpus, INPUTS};
