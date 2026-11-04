'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { VERSION, PROTOCOL, anytimeAdaptiveFieldTwoSided } =
  require('../simulation/evaluation/agent46-anytime-adaptive-field-two-sided.cjs');

const CANDIDATE = 'f'.repeat(64), SOURCE = '1'.repeat(64);
const roster = (n = 32) => Array.from({ length: n }, (_, i) => ({
  rank: i + 1, printed60Sha256: SOURCE, physicalCards: 60
}));
/** @param {number} cell @param {number} index @param {string} status @param {number} C */
function game(cell, index, status = 'QUALIFIED_NONWIN', C = 32) {
  return {
    trialIndex: index, gameId: 'trial-' + index, cell,
    rank: Math.floor(cell / (C / 32)) + 1,
    candidateSeat: C === 32 ? undefined : Math.floor((cell % (C / 32)) / (C / 64)),
    startingSeat: C === 128 ? cell % 2 : undefined,
    candidatePrinted60Digest: CANDIDATE,
    sourcePrinted60Digest: SOURCE,
    sourceDealFingerprint: (index + 1).toString(16).padStart(64, '0'),
    status
  };
}
function assess(games, overrides = {}) {
  return anytimeAdaptiveFieldTwoSided({
    candidateOrdinal: 1,
    candidateId: 'synthetic-frozen-60',
    candidatePrinted60Digest: CANDIDATE,
    layout: 'RANK',
    selectionProtocol: PROTOCOL,
    externalRegistrationId: 'synthetic-prospective-joint-confidence',
    freshConditionalCellGameDraws: true,
    authenticatedOriginalPrints: roster(),
    games,
    ...overrides
  });
}

test('joint alpha split, version, and zero-game ignorance', () => {
  const r = assess([]);
  assert.equal(VERSION, 'agent46-anytime-adaptive-field-two-sided-v1');
  assert.equal(r.familyAlpha, 0.05);
  assert.equal(r.directionalAlpha, 0.025);
  assert.ok(Math.abs(Math.exp(r.cellLogThreshold) - 2560) < 1e-8);
  assert.equal(r.fieldWinRateLowerBound, 0);
  assert.equal(r.fieldWinRateUpperBound, 1);
  assert.equal(r.decision, 'INSUFFICIENT_INFORMATION');
  assert.equal(r.competitiveQualified, false);
});

test('four qualified hypothetical losses on one rank leave target unresolved', () => {
  const r = assess(Array.from({ length: 4 }, (_, i) => game(5, i)));
  assert.equal(r.qualifiedNonwins, 4);
  assert.ok(Math.abs(r.perCell[5].winRateUpperBound - 0.89400563749872) < 1e-10);
  assert.ok(Math.abs(r.fieldWinRateUpperBound - 0.99668767617184) < 1e-10);
  assert.equal(r.decision, 'INSUFFICIENT_INFORMATION');
});

test('five qualified hypothetical nonwins suffice for conditional 99.5% rejection', () => {
  const r = assess(Array.from({ length: 5 }, (_, i) => game(5, i)));
  assert.equal(r.perCell[5].rank, 6);
  assert.equal(r.qualifiedNonwins, 5);
  assert.ok(Math.abs(r.perCell[5].winRateUpperBound - 0.83781628489020) < 1e-10);
  assert.ok(Math.abs(r.fieldWinRateUpperBound - 0.99493175890282) < 1e-10);
  assert.equal(r.decision, 'CONDITIONAL_EVIDENCE_BELOW_TARGET');
  assert.equal(r.statisticalAssumptionsExternallyVerified, false);
  assert.equal(r.competitiveQualified, false);
});

test('unknown or censored failed attempts count as wins for upper and losses for lower', () => {
  const losses = Array.from({ length: 5 }, (_, i) => game(5, i));
  const plain = assess(losses);
  const withCensor = assess([...losses, game(5, 5, 'CENSORED')]);
  assert.equal(withCensor.protectedCensored, 1);
  assert.equal(withCensor.qualifiedNonwins, 5);
  assert.ok(withCensor.fieldWinRateUpperBound > plain.fieldWinRateUpperBound);
  assert.ok(withCensor.fieldWinRateLowerBound <= plain.fieldWinRateLowerBound);
  assert.equal(withCensor.decision, 'INSUFFICIENT_INFORMATION');
});

test('missing source print cannot contribute positive or negative paper evidence', () => {
  const games = Array.from({ length: 80 }, (_, i) => game(31, i));
  const r = assess(games, { authenticatedOriginalPrints: roster(31) });
  assert.equal(r.authenticatedSourceRanks, 31);
  assert.equal(r.qualifiedNonwins, 0);
  assert.equal(r.protectedCensored, 80);
  assert.equal(r.perCell[31].winRateLowerBound, 0);
  assert.equal(r.perCell[31].winRateUpperBound, 1);
  assert.equal(r.fieldWinRateLowerBound, 0);
  assert.equal(r.fieldWinRateUpperBound, 1);
});

test('one unknown fingerprint is conservatively scored in both directions', () => {
  const games = Array.from({ length: 6 }, (_, i) => game(2, i));
  games[0].sourceDealFingerprint = 'not-observed';
  const r = assess(games);
  assert.equal(r.protectedCensored, 1);
  assert.equal(r.qualifiedNonwins, 5);
  assert.equal(r.perCell[2].winRateLowerBound, 0);
  assert.ok(r.perCell[2].winRateUpperBound >
    assess(Array.from({ length: 6 }, (_, i) => game(2, i))).perCell[2].winRateUpperBound);
});

test('joint prospective family supports conditional success on perfect synthetic field', () => {
  const games = [];
  for (let j = 0; j < 2000; j++) {
    for (let cell = 0; cell < 32; cell++) {
      games.push(game(cell, games.length, 'QUALIFIED_WIN'));
    }
  }
  const r = assess(games);
  assert.equal(r.registeredGames, 64000);
  assert.equal(r.qualifiedWins, 64000);
  assert.equal(r.qualifiedNonwins, 0);
  assert.ok(r.fieldWinRateLowerBound > 0.995);
  assert.equal(r.fieldWinRateUpperBound, 1);
  assert.equal(r.decision, 'CONDITIONAL_EVIDENCE_EXCEEDS_TARGET');
  assert.equal(r.competitiveQualified, false);
});

test('a candidate ordinal cannot borrow the first candidate family budget', () => {
  const games = Array.from({ length: 5 }, (_, i) => game(5, i));
  const later = assess(games, { candidateOrdinal: 2 });
  const first = assess(games);
  assert.ok(later.fieldWinRateUpperBound > first.fieldWinRateUpperBound);
  assert.ok(Math.abs(Math.exp(later.cellLogThreshold) - 7680) < 1e-7);
});

test('64 and 128 rank-seat-start cells stay distinct', () => {
  for (const [layout, C] of [['RANK_SEAT', 64], ['RANK_SEAT_START', 128]]) {
    const games = Array.from({ length: 6 }, (_, i) => game(0, i, 'QUALIFIED_NONWIN', C));
    const r = assess(games, { layout });
    assert.equal(r.cellCount, C);
    assert.equal(r.perCell[0].registeredGames, 6);
    assert.equal(r.perCell[1].registeredGames, 0);
    assert.equal(r.perCell[1].winRateLowerBound, 0);
    assert.equal(r.perCell[1].winRateUpperBound, 1);
  }
});

test('malformed protocol, reused physical deal and fake native outcome hard fail', () => {
  assert.throws(() => assess([], { selectionProtocol: 'UPPER_ONLY' }), /two-sided/);
  assert.throws(() => assess([], { alpha: 1 }), /alpha/);
  const repeats = [game(0, 0), game(0, 1)];
  repeats[1].sourceDealFingerprint = repeats[0].sourceDealFingerprint;
  assert.throws(() => assess(repeats), /Repeated physical/);
  assert.throws(() => assess([game(0, 0, 'NATIVE_NONWIN')]), /Altered/);
  const swapped = game(0, 0); swapped.candidatePrinted60Digest = '0'.repeat(64);
  assert.throws(() => assess([swapped]), /Altered/);
});
