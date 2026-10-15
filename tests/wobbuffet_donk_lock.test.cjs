'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('../simulation/twinleaf/headless.cjs');

const output = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
const load = name => require(path.join(output, name));
const {Store} = load('game/store/store');
const {Player} = load('game/store/state/player');
const {PokemonCardList} = load('game/store/state/pokemon-card-list');
const {PowerEffect} = load('game/store/effects/game-effects');
const {IS_ABILITY_BLOCKED} = load('game/store/prefabs/prefabs');

/**
 * Staged board with enemy Wobbuffet as Active and Meloetta in the player's
 * Active Spot. The purpose is to evaluate Bide Barricade suppression using
 * the pinned engine's genuine Store and card effects, independent of AI.
 * @returns {object}
 */
function board() {
  const cards = initializeCards();
  const store = new Store({onStateChange() {}});
  const state = store.state;
  const player = new Player(), opponent = new Player();
  player.id = 101; player.name = 'Meloetta';
  opponent.id = 202; opponent.name = 'Defender';
  state.players = [player, opponent];
  state.activePlayer = 0;
  state.turn = 1;

  const meloetta = cards.getCardByName('Meloetta ex SV11B');
  const exeggcute = cards.getCardByName('Exeggcute PLF');
  const tapuKoko = cards.getCardByName('Tapu Koko Prism Star TEU');
  const wobbuffet = cards.getCardByName('Wobbuffet PHF');
  assert.ok(meloetta && exeggcute && tapuKoko && wobbuffet);
  player.active.cards.push(meloetta);
  player.discard.cards.push(exeggcute);
  const benchSlot = new PokemonCardList();
  benchSlot.cards.push(tapuKoko);
  player.bench.push(benchSlot);
  opponent.active.cards.push(wobbuffet);
  return {store, state, player, opponent, meloetta, exeggcute, tapuKoko, wobbuffet};
}

test('Active Wobbuffet blocks Exeggcute Propagation even from discard', () => {
  const f = board();
  assert.equal(IS_ABILITY_BLOCKED(f.store, f.state, f.player, f.exeggcute), true);
  const use = new PowerEffect(f.player, f.exeggcute.powers[0], f.exeggcute);
  assert.throws(() => f.store.reduceEffect(f.state, use),
    {message: 'BLOCKED_BY_ABILITY'});
  assert.equal(f.player.discard.cards.includes(f.exeggcute), true);
  assert.equal(f.player.hand.cards.includes(f.exeggcute), false);
});

test('Bide Barricade leaves Psychic Meloetta Ability unsuppressed', () => {
  const f = board();
  assert.equal(IS_ABILITY_BLOCKED(f.store, f.state, f.player, f.meloetta), false);
});

test('Active Wobbuffet blocks Lightning Tapu Koko Prism Star on Bench', () => {
  const f = board();
  assert.equal(IS_ABILITY_BLOCKED(f.store, f.state, f.player, f.tapuKoko), true);
});

test('After Wobbuffet moves off Active, Exeggcute may propagate', () => {
  const f = board();
  f.opponent.active.cards.pop();
  const benchSlot = new PokemonCardList();
  benchSlot.cards.push(f.wobbuffet);
  f.opponent.bench.push(benchSlot);
  assert.equal(IS_ABILITY_BLOCKED(f.store, f.state, f.player, f.exeggcute), false);
  assert.equal(IS_ABILITY_BLOCKED(f.store, f.state, f.player, f.tapuKoko), false);
  assert.equal(f.store.reduceEffect(f.state,
    new PowerEffect(f.player, f.exeggcute.powers[0], f.exeggcute)), f.state);
  assert.equal(f.player.hand.cards.includes(f.exeggcute), true);
  assert.equal(f.player.discard.cards.includes(f.exeggcute), false);
});
