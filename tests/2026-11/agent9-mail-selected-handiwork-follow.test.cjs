'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {HANDIWORK, chooseMailSelectedHandiwork} =
  require('../../simulation/twinleaf/agent9-mail-selected-handiwork-follow.cjs');

/** @returns {object} Detached actor-only real-root-shaped owner view. */
function view() {
  return {
    decisionKind: 'owner-root',
    actorSeat: 1,
    globalTurn: 3,
    ownHand: ['Trainers\' Mail ROS', HANDIWORK, 'Nest Ball SVI'],
    ownTurnResources: {supporterPlayLocked: false, supporterPlayedTurn: 0},
    ownPublic: {publicTurnRestrictions: {supporterPlayLocked: false}}
  };
}

test('selects exactly the physical Mail-returned held Handiwork', () => {
  const own = view();
  assert.deepEqual(chooseMailSelectedHandiwork(own, [1]), {
    kind: 'play-mail-selected-handiwork',
    handIndex: 1,
    printing: HANDIWORK
  });
  assert.equal(chooseMailSelectedHandiwork(own, [0, 2]), null,
    'an unproven Handiwork in the same hand must remain unselected');
});

test('declines on owner first turn or after Supporter spent', () => {
  const own = view();
  own.globalTurn = 1;
  assert.equal(chooseMailSelectedHandiwork(own, [1]), null);
  own.globalTurn = 3;
  own.ownTurnResources.supporterPlayedTurn = 3;
  assert.equal(chooseMailSelectedHandiwork(own, [1]), null);
});

test('declines under either owner/public Supporter lock', () => {
  const own = view();
  own.ownTurnResources.supporterPlayLocked = true;
  assert.equal(chooseMailSelectedHandiwork(own, [1]), null);
  own.ownTurnResources.supporterPlayLocked = false;
  own.ownPublic.publicTurnRestrictions.supporterPlayLocked = true;
  assert.equal(chooseMailSelectedHandiwork(own, [1]), null);
});

test('guards stale hand-index and same-printing wrong physical copy', () => {
  const own = view();
  own.ownHand.splice(1, 0, HANDIWORK);
  assert.deepEqual(chooseMailSelectedHandiwork(own, [2]), {
    kind: 'play-mail-selected-handiwork',
    handIndex: 2, printing: HANDIWORK
  });
  assert.equal(chooseMailSelectedHandiwork(own, [4]), null);
  assert.equal(chooseMailSelectedHandiwork(own, [-1]), null);
});

test('does not inspect opponent hidden zones or change the view', () => {
  const own = view();
  const forbidden = new Proxy({}, {
    get() { throw Error('opponent-hidden-zone access'); }
  });
  own.opponentPublic = {hand: forbidden, deck: forbidden, prizes: forbidden};
  const originalHand = own.ownHand.slice();
  assert.equal(chooseMailSelectedHandiwork(own, [1])?.printing, HANDIWORK);
  assert.deepEqual(own.ownHand, originalHand);
});
