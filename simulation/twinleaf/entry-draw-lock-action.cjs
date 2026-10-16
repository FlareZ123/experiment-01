'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');
const { installEntryDrawLockHook } = require('./entry-draw-lock-hook.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath */
const load = modulePath => require(path.join(output, modulePath));

/**
 * Actual Store actions and prompt dispatch for a Dedenne-GX or Crobat V
 * entry under opposing Active Iron Thorns; with optional Cologne action.
 * Every case begins from an intentionally staged playable midgame state.
 * @param {'Dedenne GX UNB'|'Crobat V DAA'} name
 * @param {boolean} useCologne
 * @returns {{name:string,useCologne:boolean,initializationVisible:boolean,
 *  entryPrompt:boolean,drew:number,handSize:number,benchEntry:boolean,
 *  promptCount:number,entryPower:string}}
 */
function probeEntry(name, useCologne) {
  const cards = initializeCards();
  let id = 1;
  /** @param {string} cardName */
  const card = cardName => {
    const c = cards.getCardByName(cardName);
    assert.ok(c, 'Missing pinned card: ' + cardName);
    c.id = id++;
    return c;
  };
  const { Store } = load('game/store/store');
  const { GamePhase } = load('game/store/state/state');
  const { Player } = load('game/store/state/player');
  const { CardList } = load('game/store/state/card-list');
  const { PokemonCardList } = load('game/store/state/pokemon-card-list');
  const { Format } = load('game/store/card/card-types');
  const { PlayCardAction, PlayerType, SlotType } =
    load('game/store/actions/play-card-action');
  const { ResolvePromptAction } =
    load('game/store/actions/resolve-prompt-action');
  const { CheckPokemonPowersEffect } =
    load('game/store/effects/check-effects');
  const store = new Store({ onStateChange() {} });
  const state = store.state;
  state.phase = GamePhase.PLAYER_TURN;
  state.turn = 3;
  state.activePlayer = 1;
  state.gameSettings.format = Format.EXPANDED;

  const opponent = new Player();
  opponent.id = 101;
  const iron = card('Iron Thorns ex TWM');
  opponent.active.cards.push(iron);
  const player = new Player();
  player.id = 202;
  player.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  player.bench.push(new PokemonCardList());
  state.players = [opponent, player];

  const incoming = card(name);
  const cologne = useCologne ? card('Canceling Cologne ASR') : null;
  player.hand.cards.push(incoming);
  if (cologne) player.hand.cards.push(cologne);
  for (let i = 0; i < 12; i += 1) player.deck.cards.push(card('Psychic Energy SVE'));
  opponent.deck.cards.push(card('Psychic Energy SVE'));
  for (const side of state.players) {
    for (let i = 0; i < 6; i += 1) {
      const prize = new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      side.prizes.push(prize);
    }
  }

  /** @param {any} played @param {any} target */
  function play(played, target) {
    const index = player.hand.cards.indexOf(played);
    assert.ok(index >= 0);
    store.dispatch(new PlayCardAction(player.id, index, target));
  }
  if (cologne) {
    play(cologne, {player: PlayerType.ANY, slot: SlotType.BOARD, index: 0});
  }
  const powers = new CheckPokemonPowersEffect(opponent, iron);
  store.reduceEffect(state, powers);
  const initializationVisible = powers.powers.some(p => p.name === 'Initialization');

  const originalDeck = player.deck.cards.length;
  play(incoming, {player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index: 0});
  const prompt = state.prompts.find(p => p.result === undefined);
  const entryPrompt = prompt?.constructor.name === 'ConfirmPrompt';
  if (entryPrompt) {
    store.dispatch(new ResolvePromptAction(prompt.id, true));
  }
  return {
    name, useCologne, initializationVisible, entryPrompt,
    drew: originalDeck - player.deck.cards.length,
    handSize: player.hand.cards.length,
    benchEntry: player.bench[0].getPokemonCard() === incoming,
    promptCount: state.prompts.filter(p => p.result === undefined).length,
    entryPower: incoming.powers[0].name
  };
}

/** @returns {object} Full source vs patched entry draw matrix. */
function runTest() {
  const names = ['Dedenne GX UNB', 'Crobat V DAA'];
  const unpatched = names.flatMap(name =>
    [false, true].map(useCologne => probeEntry(name, useCologne)));
  const restore = installEntryDrawLockHook();
  try {
    const corrected = names.flatMap(name =>
      [false, true].map(useCologne => probeEntry(name, useCologne)));
    for (const row of corrected) {
      assert.equal(row.benchEntry, true);
      assert.equal(row.promptCount, 0);
      assert.equal(row.initializationVisible, !row.useCologne);
      assert.equal(row.entryPrompt, row.useCologne);
      assert.equal(row.drew, row.useCologne ? 6 : 0);
    }
    return {
      kind:'bench-entry-draw-ability-lock',
      pinnedEngine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
      scope:'one actual Store entry and response on a synthetic midgame board; not match strength',
      unpatched, corrected
    };
  } finally {
    restore();
  }
}

if (require.main === module) console.log(JSON.stringify(runTest(), null, 2));
module.exports = { probeEntry, runTest };
