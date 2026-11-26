'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  projectOwnerK1PrizeKnowledge
} = require('../simulation/twinleaf/2026-11/agent48-owner-k1-sampler-projection.cjs');

function capture(overrides = {}) {
  return {
    ownerSeat: 1,
    epoch: 4,
    exactMembershipKnown: true,
    deckMembershipStale: false,
    registeredPrintings: [
      { printing: 'A SET 001', copies: 20 },
      { printing: 'B SET 002', copies: 20 },
      { printing: 'C SET 003', copies: 20 }
    ],
    knownPrintings: [
      { printing: 'A SET 001', copies: 18 },
      { printing: 'B SET 002', copies: 20 },
      { printing: 'C SET 003', copies: 20 }
    ],
    knownPrized: [
      { printing: 'A SET 001', copies: 2 }
    ],
    prizeInferenceCertified: true,
    observedOwnPrizeCount: 2,
    observedAt: { turn: 4, promptId: 'owner-search-17' },
    unaccountedTotal: 2,
    invalidationReason: null,
    ...overrides
  };
}

const options = {
  expectedSeat: 1,
  currentTurn: 6,
  currentPrizeCount: 2
};

test('projects Prize membership from knownPrized, not remaining-deck knownPrintings', () => {
  const projected = projectOwnerK1PrizeKnowledge(capture(), options);
  assert.equal(projected.mode, 'K1');
  assert.equal(projected.ownerSeat, 1);
  assert.deepEqual(projected.knownPrizePrintings, [
    { printing: 'A SET 001', copies: 2 }
  ]);
  assert.deepEqual(projected.ownerK1Snapshot, {
    epoch: 4,
    exactMembershipKnown: true,
    knownPrintings: [{ printing: 'A SET 001', copies: 2 }],
    invalidationReason: null
  });
  assert.equal(projected.observedAt.turn, 4);
  assert.equal(projected.observedAt.promptId, 'owner-search-17');
});

test('deck-only staleness preserves exact Prize K1 certification', () => {
  const projected = projectOwnerK1PrizeKnowledge(capture({
    exactMembershipKnown: false,
    deckMembershipStale: true,
    invalidationReason: 'own-deck-may-have-changed'
  }), options);
  assert.equal(projected.mode, 'K1');
  assert.equal(projected.deckMembershipStale, true);
  assert.equal(projected.prizeInferenceCertified, true);
  assert.equal(projected.ownerK1Snapshot.exactMembershipKnown, true);
  assert.equal(projected.ownerK1Snapshot.invalidationReason, null);
  assert.deepEqual(projected.knownPrizePrintings, [
    { printing: 'A SET 001', copies: 2 }
  ]);
});

test('Prize-composition invalidation removes exact Prize membership', () => {
  const projected = projectOwnerK1PrizeKnowledge(capture({
    knownPrized: null,
    prizeInferenceCertified: false,
    observedOwnPrizeCount: 2,
    invalidationReason: 'own-prizes-changed'
  }), options);
  assert.equal(projected.mode, 'K0');
  assert.equal(projected.ownerK1Snapshot, null);
  assert.deepEqual(projected.knownPrizePrintings, []);
  assert.equal(projected.prizeInvalidationReason, 'own-prizes-changed');
});

test('uncertified Prize inference can retain independent PARTIAL deck knowledge', () => {
  const projected = projectOwnerK1PrizeKnowledge(capture({
    knownPrized: null,
    prizeInferenceCertified: false
  }), {
    ...options,
    knownTopDeck: ['B SET 002'],
    knownBottomDeck: ['C SET 003'],
    knownBottomDeckOrder: true
  });
  assert.equal(projected.mode, 'PARTIAL');
  assert.equal(projected.ownerK1Snapshot, null);
  assert.deepEqual(projected.knownPrizePrintings, []);
  assert.deepEqual(projected.knownTopDeck, ['B SET 002']);
  assert.deepEqual(projected.knownBottomDeck, ['C SET 003']);
  assert.equal(projected.knownBottomDeckOrder, true);
});

test('rejects a capture belonging to the other physical seat', () => {
  assert.throws(() => projectOwnerK1PrizeKnowledge(capture(), {
    ...options,
    expectedSeat: 0
  }), /different physical seat/);
});

test('rejects future captures and stale Prize-count snapshots', () => {
  assert.throws(() => projectOwnerK1PrizeKnowledge(capture(), {
    ...options,
    currentTurn: 3
  }), /future turn/);
  assert.throws(() => projectOwnerK1PrizeKnowledge(capture(), {
    ...options,
    currentPrizeCount: 1
  }), /Prize count changed/);
});

test('rejects certified Prize counts that do not cover every current Prize', () => {
  assert.throws(() => projectOwnerK1PrizeKnowledge(capture({
    knownPrized: [{ printing: 'A SET 001', copies: 1 }]
  }), options), /account for every current Prize/);
});

test('rejects Prize printings absent from the registered 60', () => {
  assert.throws(() => projectOwnerK1PrizeKnowledge(capture({
    knownPrized: [{ printing: 'UNKNOWN SET 999', copies: 2 }]
  }), options), /exceeds the registered deck count/);
});

test('rejects an uncertified capture that still carries an exact Prize list', () => {
  assert.throws(() => projectOwnerK1PrizeKnowledge(capture({
    prizeInferenceCertified: false
  }), options), /must not retain a purported exact Prize multiset/);
});
