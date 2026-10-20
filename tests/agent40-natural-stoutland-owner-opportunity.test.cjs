'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {opponentOwnerResourceSnapshot} =
  require('../simulation/twinleaf/agent40-rank2-natural-stoutland-exposure.cjs');

const TYPES = {SUPPORTER: 2, ITEM: 1};
const card = (fullName, trainerType = 0) => ({fullName, trainerType});

/** @param {0|1} sourceSeat @param {number} quota */
function fixture(sourceSeat, quota) {
  const owner = {
    active: {getPokemonCard: () => card('Shadow Rider Calyrex V CRE')},
    bench: [{getPokemonCard: () => card('Tapu Lele-GX GRI')}],
    hand: {cards: [
      card("Lillie's Determination M1L", TYPES.SUPPORTER),
      card('Battle VIP Pass FST', TYPES.ITEM),
      card('Psychic Energy SVE')
    ]},
    discard: {cards: [
      card("Boss's Orders PAL", TYPES.SUPPORTER),
      card('VS Seeker PHF', TYPES.ITEM)
    ]},
    supporterTurn: quota
  };
  const source = {
    active: {getPokemonCard: () => card('Stoutland BCR')}
  };
  Object.defineProperty(source, 'hand', {
    get() { throw Error('Source hidden hand must remain unread'); }
  });
  Object.defineProperty(source, 'deck', {
    get() { throw Error('Source hidden deck must remain unread'); }
  });
  return {players: sourceSeat === 0 ? [source, owner] : [owner, source],
    owner, source};
}

test('first owner snapshot uses only actual owner inventory and public Active', () => {
  for (const seat of [0, 1]) {
    const {players, owner} = fixture(seat, 0);
    const initial = owner.hand.cards.slice();
    const view = opponentOwnerResourceSnapshot({players}, seat, TYPES);
    assert.equal(view.ownerSeat, 1 - seat);
    assert.equal(view.sourcePublicActive, 'Stoutland BCR');
    assert.deepEqual(view.ownerHandSupporters, ["Lillie's Determination M1L"]);
    assert.deepEqual(view.ownerHandItems, ['Battle VIP Pass FST']);
    assert.deepEqual(view.ownerDiscardSupporters, ["Boss's Orders PAL"]);
    assert.equal(view.ownerSupporterTurn, 0);
    assert.deepEqual(view.ownerBench, ['Tapu Lele-GX GRI']);
    assert.deepEqual(owner.hand.cards, initial);
  }
});

test('snapshot keeps spent quota and no hand Supporter as distinct evidence', () => {
  const {players, owner} = fixture(1, 1);
  owner.hand.cards.shift();
  const view = opponentOwnerResourceSnapshot({players}, 1, TYPES);
  assert.equal(view.ownerSupporterTurn, 1);
  assert.deepEqual(view.ownerHandSupporters, []);
  assert.deepEqual(view.ownerHandItems, ['Battle VIP Pass FST']);
  assert.equal(view.ownerHandPrintings.length, 2);
});
