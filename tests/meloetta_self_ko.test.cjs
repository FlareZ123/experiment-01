'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('../simulation/twinleaf/headless.cjs');

const base = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
const engine = name => require(path.join(base, name));
const {Store} = engine('game/store/store');
const {Player} = engine('game/store/state/player');
const {CardList} = engine('game/store/state/card-list');
const {PokemonCardList} = engine('game/store/state/pokemon-card-list');
const {GamePhase, GameWinner} = engine('game/store/state/state');
const {checkState} = engine('game/store/effect-reducers/check-effect');
const {GameSettings} = engine('game/core/game-settings');

/**
 * A legal-board-shaped state where one of the player's Benched 30 HP
 * Exeggcute is knocked out by damage counters. Opponent has a single
 * Prize left, so this standalone KO should end the game in opponent's
 * favour. The state is deliberately staged, not a played-game trace.
 *
 * @returns {{store: object,state:object,player:object,opponent:object}}
 */
function stagedSelfKnockOut() {
  const cards = initializeCards();
  const store = new Store({onStateChange() {}});
  const state = store.state;
  const settings = new GameSettings();
  state.gameSettings = settings;
  state.rules = settings.rules;
  state.phase = GamePhase.PLAYER_TURN;
  state.turn = 3;

  const player = new Player();
  player.name = 'Meloetta';
  player.id = 101;
  player.active.cards.push(cards.getCardByName('Meloetta ex SV11B'));
  const exeggcuteSlot = new PokemonCardList();
  const exeggcute = cards.getCardByName('Exeggcute PLF');
  exeggcuteSlot.cards.push(exeggcute);
  exeggcuteSlot.damage = 30;
  player.bench.push(exeggcuteSlot);

  const opponent = new Player();
  opponent.name = 'Defender';
  opponent.id = 202;
  opponent.active.cards.push(cards.getCardByName('Meloetta ex SV11B'));

  /** @returns {CardList} */
  function prize() {
    const result = new CardList();
    result.cards.push(cards.getCardByName('Exeggcute PLF'));
    return result;
  }
  player.prizes = Array.from({length: 6}, prize);
  opponent.prizes = [prize()];
  state.players = [player, opponent];
  state.activePlayer = 0;
  return {store, state, player, opponent};
}

test('own Benched Exeggcute KO awards the opposing player the last Prize', () => {
  const {store, state, player, opponent} = stagedSelfKnockOut();
  checkState(store, state);
  assert.equal(player.bench[0].cards.length, 0,
    'Exeggcute should be discarded from its Bench slot');
  assert.equal(opponent.getPrizeLeft(), 0,
    'Opponent takes a Prize for your own Pokémon KO');
  assert.equal(state.phase, GamePhase.FINISHED);
  assert.equal(state.winner, GameWinner.PLAYER_2);
});
