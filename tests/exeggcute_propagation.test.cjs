'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('../simulation/twinleaf/headless.cjs');

const output = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
const {Player} = require(path.join(output, 'game/store/state/player'));
const {State} = require(path.join(output, 'game/store/state/state'));
const {PowerEffect, MoveCardsEffect} =
  require(path.join(output, 'game/store/effects/game-effects'));
const {DiscardToHandEffect} =
  require(path.join(output, 'game/store/effects/play-card-effects'));

/**
 * Isolated test of Exeggcute's discard-to-hand reducer. Each use gets its own
 * PowerEffect. Actual turn/Ability availability must additionally be checked
 * in the live game, including other card effects that can suppress Abilities.
 *
 * @param {boolean} blockDiscardToHand
 * @returns {object}
 */
function fixture(blockDiscardToHand = false) {
  const cards = initializeCards();
  const exeggcute = cards.getCardByName('Exeggcute PLF');
  const player = new Player();
  player.id = 101;
  player.name = 'Meloetta';
  const state = new State();
  state.players = [player];
  player.discard.cards.push(exeggcute);
  const effects = [];
  const store = {
    /** @param {object} current @param {object} effect */
    reduceEffect(current, effect) {
      effects.push(effect.constructor.name);
      if (effect instanceof DiscardToHandEffect && blockDiscardToHand) {
        effect.preventDefault = true;
      }
      if (effect instanceof MoveCardsEffect) {
        for (const card of effect.cards) {
          effect.source.moveCardTo(card, effect.destination);
        }
      }
      return current;
    }
  };
  /** @returns {void} */
  const activate = () => {
    exeggcute.reduceEffect(store, state,
      new PowerEffect(player, exeggcute.powers[0], exeggcute));
  };
  return {player, exeggcute, store, effects, activate};
}

test('Propagation can retrieve an Exeggcute each time it re-enters the discard', () => {
  const f = fixture();
  f.activate();
  assert.equal(f.player.hand.cards.includes(f.exeggcute), true);
  assert.equal(f.player.discard.cards.includes(f.exeggcute), false);
  f.player.hand.moveCardTo(f.exeggcute, f.player.discard);
  f.activate();
  assert.equal(f.player.hand.cards.includes(f.exeggcute), true);
  assert.equal(f.player.discard.cards.includes(f.exeggcute), false);
  assert.equal(f.effects.filter(e => e === 'MoveCardsEffect').length, 2);
});

test('Propagation fails if the Pokémon is not actually in discard', () => {
  const f = fixture();
  f.player.discard.moveCardTo(f.exeggcute, f.player.hand);
  assert.throws(f.activate, {message: 'CANNOT_USE_POWER'});
});

test('A blocked discard-to-hand effect prevents Propagation from moving card', () => {
  const f = fixture(true);
  f.activate();
  assert.equal(f.player.discard.cards.includes(f.exeggcute), true);
  assert.equal(f.player.hand.cards.length, 0);
  assert.equal(f.effects.includes('MoveCardsEffect'), false);
});
