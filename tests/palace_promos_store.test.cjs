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

test("Pinned Palace Book actual Item action draws three and ends its player's turn", () => {
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
  // The engine defers the between-turn sequence through a WaitPrompt.
  // The played Item is intentionally staged until that prompt is resolved.
  assert.ok(f.a.supporter.cards.includes(palaceBook),
    'Palace Book remains staged while its end-of-turn prompt is pending');
  const {ResolvePromptAction} =
    engine('game/store/actions/resolve-prompt-action');
  let resolved = 0;
  for (; resolved < 8; resolved++) {
    const pending = f.state.prompts.find(prompt => prompt.result === undefined);
    if (!pending) break;
    assert.equal(pending.constructor.name, 'WaitPrompt',
      'Only normal turn transition prompts are expected');
    assert.equal(pending.validate(null, f.state), true);
    f.store.dispatch(new ResolvePromptAction(pending.id, null));
  }
  assert.ok(resolved > 0 && resolved < 8,
    'Palace Book turn transition must complete under bounded prompt resolution');
  assert.ok(f.a.discard.cards.includes(palaceBook),
    'Used Item must reach discard at turn completion');
  assert.ok(!f.a.supporter.cards.includes(palaceBook),
    'Item must not remain in Supporter staging zone');
  assert.equal(f.state.activePlayer, 1,
    'Palace Book turn must pass control to the opponent');
  assert.equal(f.state.phase, f.GamePhase.PLAYER_TURN,
    'Prompt completion should reach the next normal player turn');
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


test('Palace Book Item cannot bypass opponent Vileplume Item lock', () => {
  const f = board();
  const {PokemonCardList} = engine('game/store/state/pokemon-card-list');
  const {PlayCardAction, PlayerType, SlotType} =
    engine('game/store/actions/play-card-action');
  const vileplumeLine = new PokemonCardList();
  vileplumeLine.cards.push(
    f.card('Oddish UNB'),
    f.card('Gloom UNB'),
    f.card('Vileplume AOR')
  );
  f.b.bench.push(vileplumeLine);
  const palaceBook = f.card('Palace Book SMP');
  f.a.hand.cards.push(palaceBook);
  const beforeDeck = f.a.deck.cards.length;
  assert.throws(() => f.store.dispatch(new PlayCardAction(f.a.id, 0, {
    player: PlayerType.ANY, slot: SlotType.BOARD, index: 0
  })), 'Vileplume should forbid the Palace Book Item');
  assert.equal(f.a.deck.cards.length, beforeDeck);
  assert.ok(f.a.hand.cards.includes(palaceBook));
  assert.equal(f.state.activePlayer, 0);
  assert.equal(f.state.phase, f.GamePhase.PLAYER_TURN);
});

test('Jamming Tower suppresses Active Palace Belt extra turn-start draw', () => {
  const f = board();
  const {DrawCardForTurnEffect} =
    engine('game/store/effects/game-phase-effects');
  f.a.active.tools.push(f.card('Palace Belt BWP'));
  f.b.stadium.cards.push(f.card('Jamming Tower TWM'));
  const effect = new DrawCardForTurnEffect(f.a);
  f.store.reduceEffect(f.state, effect);
  assert.equal(effect.drawCount, 1,
    'Jamming Tower must suppress the attached Tool effect');
});
