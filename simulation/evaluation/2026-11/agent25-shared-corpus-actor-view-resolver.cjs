'use strict';

const assert = require('node:assert/strict');
const {
  SOURCE_SUITES,
  readPinnedJson,
  resolveCase
} = require('./shared-policy-challenge-corpus.cjs');

const DIGEST_RE = /^(?:sha256:)?[a-f0-9]{64}$/i;
const FORBIDDEN_EXACT_KEYS = new Set([
  'nativeState', 'fullState', 'gameState', 'transitionRng', 'transitionRandom',
  'gameRng', 'physicalSeed', 'randomSeed', 'seed', 'rng', 'hiddenZones',
  'concealedZones', 'privateState', 'opponentPrivate', 'opponentHidden',
  'opponentHiddenZones', 'enemyPrivate', 'enemyHidden'
]);
const FORBIDDEN_OPPONENT_ZONE_KEY = /^(?:opponent|enemy)(?:.*)(?:hand|deck|prize)(?:cards|identities|contents|faces|private|hidden|concealed)?$/i;
const FORBIDDEN_CONCEALED_ZONE_KEY = /(?:hidden|private|concealed).*(?:hand|deck|prize|card)|(?:hand|deck|prize|card).*(?:hidden|private|concealed)/i;
const FORBIDDEN_HIDDEN_DECK_PRIZE_KEY = /(?:hidden|private|concealed).*(?:deck|prize)|(?:deck|prize).*(?:hidden|private|concealed)/i;

function assertActorOnlyView(value, path = '$', isRoot = true) {
  if (!value || typeof value !== 'object') {
    assert.equal(isRoot, false, 'Actor view must be an object');
    return value;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertActorOnlyView(item, path + '[' + index + ']', false));
    return value;
  }
  const underOpponent = path.split('.').some(segment => /^(?:opponent|enemy)(?:Public)?$/i.test(segment));
  for (const [key, child] of Object.entries(value)) {
    assert.equal(FORBIDDEN_EXACT_KEYS.has(key), false,
      'Actor view contains forbidden engine/RNG field at ' + path + '.' + key);
    assert.equal(FORBIDDEN_OPPONENT_ZONE_KEY.test(key), false,
      'Actor view contains opponent concealed-zone field at ' + path + '.' + key);
    assert.equal(FORBIDDEN_HIDDEN_DECK_PRIZE_KEY.test(key), false,
      'Actor view contains concealed deck/prize field at ' + path + '.' + key);
    if (underOpponent) {
      assert.equal(FORBIDDEN_CONCEALED_ZONE_KEY.test(key), false,
        'Actor view contains opponent concealed-zone field at ' + path + '.' + key);
    }
    if (child && typeof child === 'object') {
      assertActorOnlyView(child, path + '.' + key, false);
    }
  }
  return value;
}

function actorSeatFromView(actorView) {
  const candidates = [
    actorView.actorSeat,
    actorView.seat,
    actorView.observation && actorView.observation.actorSeat
  ].filter(value => value !== undefined && value !== null);
  assert.ok(candidates.length > 0, 'Actor view does not identify its physical seat');
  assert.ok(candidates.every(value => value === candidates[0]),
    'Actor view contains conflicting physical-seat identities');
  assert.ok(candidates[0] === 0 || candidates[0] === 1,
    'Actor view physical seat must be 0 or 1');
  return candidates[0];
}

function deepFreeze(value, seen = new WeakSet()) {
  if (!value || typeof value !== 'object' || seen.has(value)) return value;
  seen.add(value);
  for (const child of Object.values(value)) deepFreeze(child, seen);
  return Object.freeze(value);
}

/**
 * Resolve only two explicitly supported source layouts:
 * 1. an inline object in case.actorView;
 * 2. a key in suite.actorViews referenced by case.actorViewRef.
 *
 * This returns source data; it does not construct a V3 request, certify legal
 * action-frontier completeness, or establish strategic/native competence.
 */
function resolveActorViewPayload(sourceCase, suite) {
  assert.ok(sourceCase && typeof sourceCase === 'object');
  assert.ok(suite && typeof suite === 'object');
  const inline = sourceCase.actorView;
  const ref = sourceCase.actorViewRef;
  let actorView = null;
  let resolutionKind = null;

  if (inline !== undefined && inline !== null) {
    assert.ok(inline && typeof inline === 'object' && !Array.isArray(inline),
      'Inline actorView must be an object; digest strings are not payloads');
    actorView = inline;
    resolutionKind = 'inline-object';
  } else if (typeof ref === 'string' && ref.length > 0) {
    assert.ok(suite.actorViews && typeof suite.actorViews === 'object' &&
      !Array.isArray(suite.actorViews),
    'Referenced actor view requires a suite.actorViews object map');
    assert.equal(Object.hasOwn(suite.actorViews, ref), true,
      'Actor-view reference is absent from the pinned suite.actorViews map');
    actorView = suite.actorViews[ref];
    resolutionKind = 'suite-actorViews-key';
    assert.ok(actorView && typeof actorView === 'object' && !Array.isArray(actorView),
      'Resolved suite actor view must be an object');
  } else {
    throw new Error('ACTOR_VIEW_NOT_RESOLVABLE: case has no supported inline object or suite actorViewRef');
  }

  if (typeof ref === 'string' && inline !== undefined && inline !== null &&
      suite.actorViews && Object.hasOwn(suite.actorViews, ref)) {
    assert.deepEqual(inline, suite.actorViews[ref],
      'Inline actor view conflicts with its suite actorViewRef');
  }

  const digest = sourceCase.actorViewDigest ?? sourceCase.actorViewSha256 ??
    actorView.digest ?? actorView.sha256 ?? null;
  assert.ok(typeof digest === 'string' && DIGEST_RE.test(digest),
    'Actor-view payload requires an explicit 64-hex SHA-256 digest');
  assertActorOnlyView(actorView);
  const actorSeat = actorSeatFromView(actorView);
  return {
    actorView: deepFreeze(actorView),
    actorViewDigest: digest,
    actorSeat,
    resolutionKind
  };
}

function resolveActorView(rootDir, corpusRecord, dependencies = {}) {
  assert.ok(corpusRecord && typeof corpusRecord === 'object');
  const sourceSuites = dependencies.sourceSuites || SOURCE_SUITES;
  const readPinnedJsonFn = dependencies.readPinnedJson || readPinnedJson;
  const resolveCaseFn = dependencies.resolveCase || resolveCase;
  const sourceSuiteBlobVerified = dependencies.sourceSuiteBlobVerified ??
    (readPinnedJsonFn === readPinnedJson && resolveCaseFn === resolveCase);
  const spec = sourceSuites.find(source =>
    source.path === corpusRecord.sourceSuitePath &&
    source.blob === corpusRecord.sourceSuiteGitBlobSha1
  );
  if (!spec) throw new Error('Actor-view reference is not part of the pinned source set');
  const suite = readPinnedJsonFn(rootDir, spec);
  const sourceCase = resolveCaseFn(rootDir, corpusRecord);
  const resolved = resolveActorViewPayload(sourceCase, suite);
  const indexedDigest = corpusRecord.actorViewDigest;
  if (indexedDigest !== undefined && indexedDigest !== null) {
    assert.equal(resolved.actorViewDigest, indexedDigest,
      'Resolved actor-view digest differs from the pinned corpus record');
  }
  return Object.freeze({
    caseRecord: sourceCase,
    actorView: resolved.actorView,
    actorViewDigest: resolved.actorViewDigest,
    actorSeat: resolved.actorSeat,
    resolutionKind: resolved.resolutionKind,
    sourceSuitePath: spec.path,
    sourceSuiteGitBlobSha1: spec.blob,
    sourceSuiteBlobVerified,
    digestVerification: 'not-recomputed; actor view is bound by the pinned suite blob',
    privacyReview: 'structural-key-screen-only; not a privacy certification'
  });
}

module.exports = {
  DIGEST_RE,
  assertActorOnlyView,
  actorSeatFromView,
  resolveActorViewPayload,
  resolveActorView
};
