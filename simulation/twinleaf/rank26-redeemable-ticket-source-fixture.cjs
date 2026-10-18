'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { fixture } = require('./rank26-pump-source-conserved-fixture.cjs');

const OUTPUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const engine = name => require(path.join(OUTPUT, name));

/**
 * Find one existing physical source card by its printed name.
 * This fixture only manipulates the originally prepared hand, deck and Prizes.
 * @param {object} player
 * @param {string} name
 * @returns {{list: object, index: number, card: object}}
 */
function locate(player, name) {
  const zones = [player.hand, player.deck, ...player.prizes];
  for (const list of zones) {
    const index = list.cards.findIndex(card => card.name === name);
    if (index >= 0) return { list, index, card: list.cards[index] };
  }
  throw new Error('Missing original registered card: ' + name);
}

/**
 * Move a card into an intended location by exchanging existing instances.
 * Preserves each card's ID, print and source inventory.
 * @param {object} player
 * @param {string} name
 * @param {object} destination
 * @param {number} index
 */
function exchange(player, name, destination, index) {
  const source = locate(player, name);
  const displaced = destination.cards[index];
  assert.ok(displaced, 'The replacement position must hold a physical card');
  source.list.cards[source.index] = displaced;
  destination.cards[index] = source.card;
}

/**
 * All source-owned cards; no overlapping deck/hand/Prize copies allowed.
 * @param {object} player
 * @returns {object[]}
 */
function physicalCards(player) {
  return [
    ...player.active.cards,
    ...player.bench.flatMap(slot => slot.cards),
    ...player.stadium.cards,
    ...player.hand.cards,
    ...player.prizes.flatMap(slot => slot.cards),
    ...player.deck.cards,
    ...player.discard.cards
  ];
}

/**
 * Source-60-conserved staged Deal, with unique DCE in a face-down Prize
 * and real printed Redeemable Ticket in the hand. This is deliberately
 * a synthetic prepared state, not a randomized first-turn opportunity.
 * @param {0|1} seat
 */
function runSeat(seat) {
  const f = fixture(seat);
  const own = f.own;
  exchange(own, 'Double Colorless Energy', own.prizes[0], 0);
  exchange(own, 'Redeemable Ticket', own.hand, 0);
  assert.equal(own.prizes[0].cards[0].name, 'Double Colorless Energy');
  assert.equal(own.hand.cards[0].name, 'Redeemable Ticket');

  const before = physicalCards(own);
  assert.equal(before.length, 60);
  assert.equal(new Set(before.map(card => card.id)).size, 60);
  const originalPrizes = own.prizes.flatMap(zone => zone.cards);
  const oldPrizeIds = originalPrizes.map(card => card.id).sort((a,b) => a-b);
  const oldDeckTopIds = own.deck.cards.slice(-6)
    .map(card => card.id).sort((a,b) => a-b);
  const oldDeckCount = own.deck.cards.length;
  const dceId = own.prizes[0].cards[0].id;
  const ticketId = own.hand.cards[0].id;

  const { PlayCardAction, PlayerType, SlotType } =
    engine('game/store/actions/play-card-action');
  const { GamePhase } = engine('game/store/state/state');
  const item = new PlayCardAction(own.id, 0, {
    player: PlayerType.ANY, slot: SlotType.BOARD, index: 0
  });
  assert.equal(f.state.phase, GamePhase.PLAYER_TURN);
  assert.equal(f.state.activePlayer, seat);
  f.store.dispatch(item);

  const after = physicalCards(own);
  assert.equal(after.length, 60);
  assert.equal(new Set(after.map(card => card.id)).size, 60);
  assert.deepEqual(
    after.map(card => card.id).sort((a,b) => a-b),
    before.map(card => card.id).sort((a,b) => a-b),
    'Registered physical card identities must be conserved'
  );
  const newPrizes = own.prizes.flatMap(zone => zone.cards);
  assert.equal(newPrizes.length, 6);
  assert.deepEqual(newPrizes.map(card => card.id).sort((a,b) => a-b),
    oldDeckTopIds, 'New Prizes must be the old top six deck cards');
  assert.deepEqual(own.deck.cards.slice(0,6)
    .map(card => card.id).sort((a,b) => a-b),
    oldPrizeIds, 'Original shuffled Prizes must be at deck bottom');
  assert.equal(own.deck.cards.length, oldDeckCount);
  assert.ok(own.deck.cards.slice(0,6).some(card => card.id === dceId));
  assert.equal(own.prizes.flatMap(zone => zone.cards)
    .some(card => card.id === dceId), false);
  assert.equal(own.discard.cards.filter(card => card.id === ticketId).length, 1);
  assert.equal(own.hand.cards.some(card => card.id === ticketId), false);
  assert.equal(f.state.phase, GamePhase.PLAYER_TURN);

  return {
    sourceSeat: seat,
    sourceCardCountBefore: before.length,
    sourceCardCountAfter: after.length,
    uniqueSourceCardIds: 60,
    realStorePlayCardAction: true,
    playedTicketPrint: 'Redeemable Ticket JTG 156',
    movedDceFromPrizesToDeckBottom: true,
    replacementPrizesMatchOldTopDeck: true,
    oldAndNewPrizeCount: [originalPrizes.length, newPrizes.length],
    prizeCountUnchanged: own.getPrizeLeft() === 6,
    attackExecuted: false,
    originalRandomDeal: false,
    competitivelyQualified: false
  };
}

/** @returns {object} */
function run() {
  return {
    schema: 'rank26-redeemable-ticket-live-store-source-60-v1',
    pinnedTwinleaf: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    stagedSourceCards: true,
    samples: [runSeat(0), runSeat(1)],
    note: 'Prepared 60-card-conserved test, not a random source deal or player policy'
  };
}
if (require.main === module) process.stdout.write(JSON.stringify(run(), null, 2) + '\n');
module.exports = { locate, exchange, physicalCards, runSeat, run };
