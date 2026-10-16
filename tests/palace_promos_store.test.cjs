'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('../simulation/twinleaf/headless.cjs');

const root = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const engine = name => require(path.join(root, name));

/** A small real-Store board, with occupied Prize cards and usable draw piles. */
function board() {
  const cards = initializeCards();
  /** @param {string} name */
  const card = name => {
    const value = cards.getCardByName(name);
    assert.ok(value, 'Missing pinned card ' + name);
    return value;
  };
  const {Store} = engine('game/store/store');
  const {Player} = engine('game/store/state/player');
  const {CardList} = engine('game/store/state/card-list');
  const {GamePhase} = engine('game/store/state/state');
  const {Format} = engine('game/store/card/card-types');
  const store = new Store({onStateChange() {}});
  const state = store.state;
  const a = new Player();
  const b = new Player();
  a.id = 101;
  a.name = 'source-A';
  b.id = 202;
  b.name = 'source-B';
  state.players = [a, b];
  state.activePlayer = 0;
  state.phase = GamePhase.PLAYER_TURN;
  state.turn = 2;
  state.gameSettings.format = Format.EXPANDED;
  a.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  b.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  for (const player of [a, b]) {
    for (let i = 0; i < 6; i++) {
      const prize = new CardList();
      prize.cards.push(card('Psychic Energy MEE'));
      player.prizes.push(prize);
    }
    for (let i = 0; i < 12; i++) player.deck.cards.push(card('Psychic Energy MEE'));
  }
  return {store, state, a, b, card, GamePhase};
}

test('Pinned Palace Book actual Item action draws three and ends its player's turn', () => {
  const f = board();
  const {PlayCardAction, PlayerType, SlotType} =
    engine('game/store/actions/play-card-action');
  const palaceBook = f.card('Palace Book SMP');
  f.a.hand.cards.push(palaceBook);
  const before = f.a.deck.cards.length;
  f.store.dispatch(new PlayCardAction(f.a.id, 0, {
    player: PlayerType.ANY, slot: SlotType.BOARD, index: 0
  }));
  assert.equal(f.a.deck.cards.length, before - 3, 'Palace Book draw count');
  assert.equal(f.a.hand.cards.length, 3, 'Three drawn cards in hand');
  assert.ok(f.a.discard.cards.includes(palaceBook),
    'Used Item must reach discard at turn completion');
  assert.ok(!f.a.supporter.cards.includes(palaceBook),
    'Item must not remain in Supporter staging zone');
  assert.ok(f.state.activePlayer !== 0 || f.state.phase !== f.GamePhase.PLAYER_TURN,
    'Player who used Palace Book must no longer have actions this turn');
});

test('Pinned Palace Belt modifies only the Active holder next-turn draw', () => {
  const {DrawCardForTurnEffect} =
    engine('game/store/effects/game-phase-effects');
  const {PokemonCardList} = engine('game/store/state/pokemon-card-list');

  const active = board();
  active.a.active.tools.push(active.card('Palace Belt BWP'));
  const effectActive = new DrawCardForTurnEffect(active.a);
  active.store.reduceEffect(active.state, effectActive);
  assert.equal(effectActive.drawCount, 2,
    'Active Palace Belt must replace ordinary one-card draw with two');

  const benched = board();
  const slot = new PokemonCardList();
  slot.cards.push(benched.card('Shadow Rider Calyrex V CRE'));
  slot.tools.push(benched.card('Palace Belt BWP'));
  benched.a.bench.push(slot);
  const effectBench = new DrawCardForTurnEffect(benched.a);
  benched.store.reduceEffect(benched.state, effectBench);
  assert.equal(effectBench.drawCount, 1,
    'Palace Belt on the Bench must not modify the Active player draw');
});
