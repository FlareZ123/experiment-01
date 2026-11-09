'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {HANDIWORK, chooseOwnerHeldHandiwork} =
  require('../../simulation/twinleaf/agent1-owner-held-handiwork-choice.cjs');

/** @returns {object} Owner-only detached view. */
function view() {
  return {
    decisionKind: 'owner-root', globalTurn: 3,
    ownHand: ['Nest Ball SVI', HANDIWORK, 'Tropical Beach PR-BLW'],
    ownTurnResources: {supporterPlayLocked: false, supporterPlayedTurn: 0},
    ownPublic: {publicTurnRestrictions: {supporterPlayLocked: false}},
    opponentPublic: {deckCount: 32}
  };
}

test('selects originally-held card independent of Mail provenance', () => {
  const v = view();
  assert.deepEqual(chooseOwnerHeldHandiwork(v), {
    kind: 'play-owner-held-handiwork',handIndex: 1,printing: HANDIWORK
  });
  assert.deepEqual(v.ownHand, ['Nest Ball SVI', HANDIWORK, 'Tropical Beach PR-BLW']);
  v.ownHand = ['Nest Ball SVI'];
  assert.equal(chooseOwnerHeldHandiwork(v), null);
});

test('declines first turn, used Supporter, and both Supporter locks', () => {
  const v = view();
  v.globalTurn = 1;
  assert.equal(chooseOwnerHeldHandiwork(v), null);
  v.globalTurn = 2;
  v.ownTurnResources.supporterPlayedTurn = 1;
  assert.equal(chooseOwnerHeldHandiwork(v), null);
  v.ownTurnResources.supporterPlayedTurn = 0;
  v.ownTurnResources.supporterPlayLocked = true;
  assert.equal(chooseOwnerHeldHandiwork(v), null);
  v.ownTurnResources.supporterPlayLocked = false;
  v.ownPublic.publicTurnRestrictions.supporterPlayLocked = true;
  assert.equal(chooseOwnerHeldHandiwork(v), null);
});

test('declines non-owner roots and emptied opponent deck', () => {
  const v = view();
  v.decisionKind = 'owner-prompt';
  assert.equal(chooseOwnerHeldHandiwork(v), null);
  v.decisionKind = 'owner-root';
  v.opponentPublic.deckCount = 0;
  assert.equal(chooseOwnerHeldHandiwork(v), null);
});

test('never accesses opponent concealed zones', () => {
  const v = view();
  Object.defineProperty(v.opponentPublic,'hand',{
    get() {throw Error('opponent hidden hand accessed');}
  });
  Object.defineProperty(v.opponentPublic,'prizes',{
    get() {throw Error('opponent hidden prizes accessed');}
  });
  assert.equal(chooseOwnerHeldHandiwork(v)?.handIndex, 1);
});
