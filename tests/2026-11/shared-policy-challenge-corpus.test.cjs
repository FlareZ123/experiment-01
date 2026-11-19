'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const corpusModule = require('../../simulation/evaluation/2026-11/shared-policy-challenge-corpus.cjs');
const ROOT = path.resolve(__dirname, '../..');

test('normalizes source split aliases without merging evidence classes', () => {
  assert.equal(corpusModule.normalizeSplit('held_out_review', 'scenarios'), 'held-out');
  assert.equal(corpusModule.normalizeSplit('negative_control', 'scenarios'), 'negative-control');
  assert.equal(corpusModule.normalizeSplit(null, 'heldOutReviewCases'), 'held-out');
  assert.equal(corpusModule.normalizeSplit(null, 'nativeBlockedCases'), 'blocked');
  assert.equal(corpusModule.normalizeSplit(null, 'developmentCases'), 'development');
});

test('case projection retains source reference and digest, never raw actor view', () => {
  const spec = {
    rank: 4,
    path: 'fixture-suite.json',
    blob: '0123456789abcdef0123456789abcdef01234567'
  };
  const suite = {
    suiteId: 'fixture-suite',
    developmentCases: [{
      caseId: 'actor-view-root',
      split: 'development',
      evidenceClass: 'synthetic',
      actorView: { publicBoard: 'fixture-only' },
      actorViewSha256: 'a'.repeat(64),
      sourceBinding: { sourceRank: 4 },
      decisionEnvelope: { allowed: ['pass'] },
      costLedger: { cards: [] },
      promptCoverage: { promptTypes: [] },
      executionEvidence: { status: 'not-run' }
    }]
  };
  const record = corpusModule.normalizeCase(suite, spec, 'developmentCases', 0);
  assert.equal(record.rank, 4);
  assert.equal(record.caseId, 'actor-view-root');
  assert.equal(record.sourceArrayIndex, 0);
  assert.equal(record.actorViewDigest, 'a'.repeat(64));
  assert.equal(record.hasActorView, true);
  assert.equal(record.hasDecisionEnvelope, true);
  assert.equal(record.hasCostLedger, true);
  assert.equal(record.hasPromptCoverage, true);
  assert.equal(record.hasExecutionEvidence, true);
  assert.equal(record.structurallyComplete, true);
  assert.deepEqual(record.structuralBlockers, []);
  assert.equal(Object.hasOwn(record, 'actorView'), false);
});

test('fallback references are index-stable and explicitly not stable case IDs', () => {
  const spec = {
    rank: 8,
    path: 'fixture-suite.json',
    blob: '0123456789abcdef0123456789abcdef01234567'
  };
  const suite = { developmentCases: [{ objective: 'case without id' }] };
  const record = corpusModule.normalizeCase(suite, spec, 'developmentCases', 0);
  assert.equal(record.caseId, 'developmentCases#1');
  assert.equal(record.stableCaseId, false);
  assert.equal(record.structurallyComplete, false);
  assert.ok(record.structuralBlockers.includes('stableCaseId'));
  assert.ok(record.structuralBlockers.includes('actorViewDigest'));
});

test('pinned source set regenerates the checked-in corpus exactly', () => {
  const generated = corpusModule.buildCorpus(ROOT);
  const checkedIn = JSON.parse(fs.readFileSync(
    path.join(ROOT, corpusModule.OUTPUT_PATH), 'utf8'
  ));
  assert.deepEqual(generated, checkedIn);
  assert.equal(generated.sourceSuites.length, 12);
  assert.equal(generated.cases.length, 318);
  assert.deepEqual(generated.coverage.indexedRanks, [2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 19, 31]);
  assert.equal(generated.summary.casesWithActorViewDigest, 33);
  assert.equal(generated.summary.casesMissing.actorViewDigest, 285);
  assert.equal(generated.summary.structurallyCompleteCaseCount, 21);
  assert.equal(generated.curatedSubset.totalCases, 30);
  assert.equal(generated.curatedSubset.matchedCaseReferences, 30);
  assert.equal(generated.curatedSubset.splitMismatches, 0);
  assert.equal(generated.curatedSubset.structurallyCompleteCases, 0);
  assert.equal(generated.curatedSubset.runtimeActorViewDigestCases, 0);
  assert.equal(generated.curatedSubset.exactRuntimeObservationCases, 0);
  assert.equal(generated.curatedSubset.nativeGameCount, 0);
  assert.deepEqual(generated.curatedSubset.sourceRanks, [3, 4, 5, 6, 7, 31]);
  assert.equal(generated.curatedCases.length, 30);
  assert.equal(generated.curatedCases[0].hiddenOpponentZonesIncluded, null);
  assert.equal(Object.hasOwn(generated.curatedCases[0], 'actorView'), false);
  const resolvedCurated = corpusModule.resolveCase(ROOT, generated.curatedCases[0]);
  assert.equal(resolvedCurated.caseId, generated.curatedCases[0].caseId);
  assert.deepEqual(generated.summary.structuralCompletenessContract.recognizedEvidenceClasses, [
    'synthetic', 'native-staged', 'source-natural'
  ]);
  assert.equal(generated.cases.filter(row => row.structurallyComplete).length, 21);
  assert.deepEqual(generated.summary.structuralBlockerCounts, {
    stableCaseId: 19,
    actorViewDigest: 285,
    caseSourceBinding: 140,
    decisionEnvelope: 85,
    costLedger: 117,
    promptCoverage: 125,
    executionEvidence: 118,
    recognizedEvidenceClass: 107
  });
  assert.deepEqual(generated.summary.structurallyCompleteBySplit, { development: 21 });
  assert.deepEqual(
    generated.summary.structurallyCompleteByRank.filter(row => row.total > 0),
    [
      { rank: 2, total: 15, development: 15, heldOut: 0, negativeControl: 0, blocked: 0 },
      { rank: 10, total: 6, development: 6, heldOut: 0, negativeControl: 0, blocked: 0 }
    ]
  );
});

test('case resolver rejects references outside the pinned source set', () => {
  assert.throws(() => corpusModule.resolveCase(ROOT, {
    sourceSuitePath: 'private/unlisted.json',
    sourceSuiteGitBlobSha1: '0'.repeat(40),
    sourceArray: 'developmentCases',
    sourceArrayIndex: 0
  }), /not part of the pinned source set/);
});
