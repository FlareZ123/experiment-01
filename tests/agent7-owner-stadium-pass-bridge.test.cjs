'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { chooseOwnerStadiumAfterPass, VERSION } =
  require('../simulation/twinleaf/agent7-owner-stadium-pass-bridge.cjs');

const stadium = 'Wondrous Labyrinth Prism Star TEU';
const replacement = 'Thunder Mountain Prism Star LOT';
const other = 'PokéStop PGO';
const fixture = {
  sourceSeat: 0, sourceTurn: 10, sourceOriginal: stadium,
  ownerHeldReplacement: replacement, heldPhysicalHandIndex: 1
};
const catalog = new Map([
  [stadium, { name: 'Wondrous Labyrinth Prism Star', type: 'Stadium' }],
  [replacement, { name: 'Thunder Mountain Prism Star', type: 'Stadium' }],
  [other, { name: 'PokéStop', type: 'Stadium' }]
]);

function view() {
  return {
    decisionKind: 'owner-root', actorSeat: 0, globalTurn: 10,
    ownHand: [other, replacement],
    ownPublic: { stadium: [stadium] },
    opponentPublic: { stadium: [] },
    ownTurnResources: {
      stadiumPlayLocked: false, stadiumPlayedTurn: 2
    }
  };
}

test('registered owner-source authentic Pass selects printed different-name Stadium', () => {
  assert.equal(typeof VERSION, 'string');
  assert.deepEqual(chooseOwnerStadiumAfterPass(view(), catalog, fixture, true), {
    eligible: true,
    reason: 'registered-paper-name-quota-lock-physical-pass',
    handIndex: 1, printing: replacement,
    oldStadium: stadium, newStadium: replacement
  });
});

test('public quota, lock and wrong exact printed current Stadium veto', () => {
  for (const [kind, change, reason] of [
    ['lock', a => { a.ownTurnResources.stadiumPlayLocked = true; },
      'public-stadium-lock-or-quota'],
    ['quota', a => { a.ownTurnResources.stadiumPlayedTurn = 10; },
      'public-stadium-lock-or-quota'],
    ['wrong-current', a => { a.ownPublic.stadium = [other]; },
      'current-public-stadium-does-not-match'],
    ['opponent-stadium', a => { a.opponentPublic.stadium = [other]; },
      'current-public-stadium-does-not-match'],
    ['wrong-index', a => { a.ownHand.reverse(); },
      'registered-physical-hand-index-not-held']
  ]) {
    const a = view();
    change(a);
    assert.equal(chooseOwnerStadiumAfterPass(a, catalog, fixture, true).reason,
      reason, kind);
  }
});

test('source seat/turn and native non-Pass are strict registered gates', () => {
  const a = view();
  a.actorSeat = 1;
  assert.equal(chooseOwnerStadiumAfterPass(a, catalog, fixture, true).reason,
    'not-registered-actor-turn');
  a.actorSeat = 0;
  a.globalTurn = 11;
  assert.equal(chooseOwnerStadiumAfterPass(a, catalog, fixture, true).eligible,
    false);
  a.globalTurn = 10;
  assert.equal(chooseOwnerStadiumAfterPass(a, catalog, fixture, false).reason,
    'native-chose-non-pass');
});

test('same-name printings cannot replace despite different fullName', () => {
  const bad = new Map(catalog);
  bad.set(replacement, { type: 'Stadium', name: 'Wondrous Labyrinth Prism Star' });
  assert.equal(chooseOwnerStadiumAfterPass(view(), bad, fixture, true).reason,
    'printed-stadium-identity-unverified');
});

test('unrelated opponent hidden fields cannot affect actor-owned certificate', () => {
  const a = view();
  const b = view();
  Object.defineProperty(b.opponentPublic, 'hiddenHand', {
    get() { throw new Error('Cannot inspect hidden opponent information'); }
  });
  assert.deepEqual(
    chooseOwnerStadiumAfterPass(a, catalog, fixture, true),
    chooseOwnerStadiumAfterPass(b, catalog, fixture, true)
  );
});
