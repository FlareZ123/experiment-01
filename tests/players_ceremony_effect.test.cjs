'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('../simulation/twinleaf/headless.cjs');
const {registerPlayersCeremony} = require('../simulation/twinleaf/card-patches.cjs');

const output = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
const {Player} = require(path.join(output, 'game/store/state/player'));
const {State} = require(path.join(output, 'game/store/state/state'));
const {UseStadiumEffect, MoveCardsEffect} =
  require(path.join(output, 'game/store/effects/game-effects'));
const {EndTurnEffect} =
  require(path.join(output, 'game/store/effects/game-phase-effects'));

/**
 * Probe a card's research-side reducer with actual pinned engine effect and
 * CardList types. The test double implements the narrow MoveCards/EndTurn
 * contracts so these tests distinguish card text behavior from full engine
 * playability gates and turn-transition semantics.
 *
 * @param {number} deckCards
 * @returns {object}
 */
function fixture(deckCards) {
  const manager = initializeCards();
  const name = registerPlayersCeremony();
  const ceremony = manager.getCardByName(name);
  const state = new State();
  state.turn = 3;
  const player = new Player();
  player.name = 'tester';
  player.id = 101;
  const opponent = new Player();
  opponent.name = 'opponent';
  opponent.id = 202;
  state.players = [player, opponent];
  player.stadium.cards.push(ceremony);
  player.deck.cards = Array.from({length: deckCards}, (_, index) => ({name: 'filler-' + index}));
  const events = [];
  const store = {
    /** @param {object} current @param {object} effect */
    reduceEffect(current, effect) {
      if (effect instanceof MoveCardsEffect) {
        effect.source.moveTo(effect.destination, effect.count);
        events.push({effect: 'MoveCards', count: effect.count});
        return current;
      }
      if (effect instanceof EndTurnEffect) {
        events.push({effect: 'EndTurn', playerId: effect.player.id});
        return current;
      }
      throw new Error('Unexpected effect: ' + effect.constructor.name);
    },
    /** @param {object} current @param {string} message @param {object} fields */
    log(current, message, fields) {
      events.push({effect: 'Log', message, fields});
    }
  };
  return {state, player, ceremony, store, events};
}

test('Player Ceremony draws two, logs usage, consumes Stadium use and ends turn', () => {
  const f = fixture(6);
  const use = new UseStadiumEffect(f.player, f.ceremony);
  assert.equal(f.ceremony.reduceEffect(f.store, f.state, use), f.state);
  assert.equal(use.preventDefault, true);
  assert.equal(f.player.hand.cards.length, 2);
  assert.equal(f.player.deck.cards.length, 4);
  assert.equal(f.player.stadiumUsedTurn, 3);
  assert.equal(f.events[0].effect, 'MoveCards');
  assert.equal(f.events[1].effect, 'Log');
  assert.deepEqual(f.events[2], {effect: 'EndTurn', playerId: 101});
});

test('Player Ceremony applies closest available draw count with one card', () => {
  const f = fixture(1);
  f.ceremony.reduceEffect(f.store, f.state,
    new UseStadiumEffect(f.player, f.ceremony));
  assert.equal(f.player.hand.cards.length, 1);
  assert.equal(f.player.deck.cards.length, 0);
  assert.equal(f.events.at(-1).effect, 'EndTurn');
});

test('Player Ceremony cannot draw if deck is empty', () => {
  const f = fixture(0);
  const use = new UseStadiumEffect(f.player, f.ceremony);
  assert.throws(() => f.ceremony.reduceEffect(f.store, f.state, use), /CANNOT_USE_STADIUM/);
  assert.equal(f.player.hand.cards.length, 0);
  assert.equal(f.player.stadiumUsedTurn, 0);
  assert.equal(f.events.length, 0);
});

test('unused, replaced Stadium never causes a draw or turn end', () => {
  const f = fixture(4);
  f.player.stadium.cards = [];
  const use = new UseStadiumEffect(f.player, f.ceremony);
  assert.equal(f.ceremony.reduceEffect(f.store, f.state, use), f.state);
  assert.equal(use.preventDefault, false);
  assert.equal(f.player.hand.cards.length, 0);
  assert.equal(f.events.length, 0);
});
