'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { buildCorpus } = require('../../simulation/evaluation/2026-11/shared-policy-challenge-corpus.cjs');
const {
  resolveActorViewPayload,
  resolveActorView,
  assertActorOnlyView,
  actorSeatFromView
} = require('../../simulation/evaluation/2026-11/agent25-shared-corpus-actor-view-resolver.cjs');

const DIGEST = 'a'.repeat(64);

test('resolves an inline actor-view object without rewriting its payload', () => {
  const actorView = {
    role: 'opponent',
    seat: 0,
    observation: { actorSeat: 0, ownPublic: { prizeCount: 6 }, opponentPublic: { handCount: 4 } },
    prompt: null
  };
  const resolved = resolveActorViewPayload({ actorView, actorViewDigest: 'sha256:' + DIGEST }, {});
  assert.equal(resolved.resolutionKind, 'inline-object');
  assert.equal(resolved.actorSeat, 0);
  assert.equal(resolved.actorViewDigest, 'sha256:' + DIGEST);
  assert.deepEqual(resolved.actorView, actorView);
  assert.equal(Object.isFrozen(resolved.actorView), true);
  assert.equal(Object.isFrozen(resolved.actorView.observation), true);
});

test('resolves an actorViewRef only through the pinned suite actorViews map', () => {
  const actorView = { actorSeat: 1, ownHand: ['known'], opponentPublic: { handCount: 3 } };
  const resolved = resolveActorViewPayload({
    actorViewRef: 'case-1', actorViewSha256: DIGEST
  }, { actorViews: { 'case-1': actorView } });
  assert.equal(resolved.resolutionKind, 'suite-actorViews-key');
  assert.equal(resolved.actorSeat, 1);
  assert.deepEqual(resolved.actorView, actorView);
});

test('fails closed for missing refs, unsupported external refs, and absent payloads', () => {
  assert.throws(() => resolveActorViewPayload({ actorViewRef: 'missing', actorViewSha256: DIGEST },
    { actorViews: {} }), /absent from the pinned suite/);
  assert.throws(() => resolveActorViewPayload({ actorViewRef: 'file.json', actorViewSha256: DIGEST },
    {}), /requires a suite.actorViews object map/);
  assert.throws(() => resolveActorViewPayload({ actorViewSha256: DIGEST }, {}),
    /ACTOR_VIEW_NOT_RESOLVABLE/);
  assert.throws(() => resolveActorViewPayload({ actorView: DIGEST, actorViewSha256: DIGEST }, {}),
    /Inline actorView must be an object/);
});

test('requires explicit digest and one consistent physical seat', () => {
  assert.throws(() => resolveActorViewPayload({
    actorView: { actorSeat: 0 }
  }, {}), /explicit 64-hex SHA-256 digest/);
  assert.throws(() => actorSeatFromView({ actorSeat: 0, seat: 1 }), /conflicting physical-seat/);
  assert.throws(() => actorSeatFromView({ actorSeat: 2 }), /must be 0 or 1/);
});

test('rejects opponent concealed-zone, engine-state, and RNG fields recursively', () => {
  for (const actorView of [
    { actorSeat: 0, opponentHandCards: ['secret'] },
    { actorSeat: 0, opponentPublic: { hiddenDeckIdentities: ['secret'] } },
    { actorSeat: 0, prompt: { nativeState: {} } },
    { actorSeat: 0, publicEventReceipt: { randomSeed: 123 } }
  ]) {
    assert.throws(() => assertActorOnlyView(actorView),
      /forbidden|concealed-zone|concealed deck\/prize/);
  }
});

test('permits public opponent counts and owner-private information', () => {
  const actorView = {
    actorSeat: 1,
    ownHand: ['known to actor'],
    opponentPublic: { handCount: 4, deckCount: 30, prizeCount: 6, publicHand: null }
  };
  assert.equal(actorSeatFromView(actorView), 1);
  assert.equal(assertActorOnlyView(actorView), actorView);
});

test('resolves only source-bound corpus records and keeps digest/privacy limits explicit', () => {
  const spec = { path: 'suite.json', blob: '1'.repeat(40) };
  const actorView = { actorSeat: 0, ownHand: ['visible'], opponentPublic: { handCount: 2 } };
  const sourceCase = { actorView, actorViewDigest: DIGEST, caseId: 'case-1' };
  const record = {
    sourceSuitePath: spec.path,
    sourceSuiteGitBlobSha1: spec.blob,
    actorViewDigest: DIGEST,
    caseId: 'case-1'
  };
  const resolved = resolveActorView('/fixture', record, {
    sourceSuites: [spec],
    readPinnedJson: () => ({}),
    resolveCase: () => sourceCase
  });
  assert.equal(resolved.sourceSuiteBlobVerified, false,
    'Injected fixture resolvers do not claim the real Git blob was checked');
  assert.equal(resolved.digestVerification,
    'not-recomputed; actor view is bound by the pinned suite blob');
  assert.equal(resolved.privacyReview,
    'structural-key-screen-only; not a privacy certification');
  assert.equal(resolved.actorSeat, 0);
  assert.equal(Object.isFrozen(resolved.actorView), true);
});

test('rejects mismatched corpus digest and unpinned source suite', () => {
  const spec = { path: 'suite.json', blob: '2'.repeat(40) };
  const sourceCase = { actorView: { actorSeat: 1 }, actorViewDigest: DIGEST };
  const deps = {
    sourceSuites: [spec],
    readPinnedJson: () => ({}),
    resolveCase: () => sourceCase
  };
  assert.throws(() => resolveActorView('/fixture', {
    sourceSuitePath: spec.path, sourceSuiteGitBlobSha1: spec.blob,
    actorViewDigest: 'b'.repeat(64)
  }, deps), /differs from the pinned corpus record/);
  assert.throws(() => resolveActorView('/fixture', {
    sourceSuitePath: 'other.json', sourceSuiteGitBlobSha1: '3'.repeat(40)
  }, deps), /not part of the pinned source set/);
});

test('pinned rank-2 suite actorViewRef and rank-10 inline actorView layouts resolve', () => {
  const root = path.resolve(__dirname, '../..');
  const corpus = buildCorpus(root);
  const rank2 = corpus.cases.filter(record => record.rank === 2 && record.actorViewRef);
  const rank10 = corpus.cases.filter(record => record.rank === 10 && record.actorViewDigest);
  assert.equal(rank2.length, 19);
  assert.equal(rank10.length, 6);
  for (const record of [...rank2, ...rank10]) {
    const resolved = resolveActorView(root, record);
    assert.equal(resolved.actorSeat, 0);
    assert.equal(resolved.actorViewDigest, record.actorViewDigest);
    assert.equal(resolved.sourceSuiteBlobVerified, true,
      'Default pinned reader and case resolver verify the source suite blob');
    assert.equal(resolved.digestVerification,
      'not-recomputed; actor view is bound by the pinned suite blob');
    assert.equal(resolved.privacyReview,
      'structural-key-screen-only; not a privacy certification');
  }
  assert.equal(resolveActorView(root, rank2[0]).resolutionKind, 'suite-actorViews-key');
  assert.equal(resolveActorView(root, rank10[0]).resolutionKind, 'inline-object');
});

test('rank-10 native-blocked prompt with no actor view remains unresolved', () => {
  const root = path.resolve(__dirname, '../..');
  const corpus = buildCorpus(root);
  const record = corpus.cases.find(row => row.rank === 10 &&
    row.caseId === 'rank10-pd-07-native-putdamage-prompt');
  assert.ok(record);
  assert.throws(() => resolveActorView(root, record), /ACTOR_VIEW_NOT_RESOLVABLE/);
});

test('rejects an inline payload that disagrees with its suite-level reference', () => {
  assert.throws(() => resolveActorViewPayload({
    actorView: { actorSeat: 0 },
    actorViewRef: 'case-1',
    actorViewSha256: DIGEST
  }, { actorViews: { 'case-1': { actorSeat: 1 } } }), /conflicts with its suite actorViewRef/);
});
