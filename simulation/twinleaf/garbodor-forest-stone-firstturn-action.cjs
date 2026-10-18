'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const engine = name => require(path.join(output, name));

/**
 * Staged actual Store first-turn Tool attachment and Boost Shake evolution.
 * @param {'Forest Seal Stone SIT'|'Float Stone BKT'|null} toolName
 * @param {'Garbodor BKP'|'Garbodor LTR'} evolvedName
 * @returns {object}
 */
function runCase(toolName, evolvedName) {
  const manager = initializeCards();
  let id = 1;
  /** @param {string} name */
  const card = name => {
    const c = manager.getCardByName(name);
    assert.ok(c, 'Unavailable pinned card: ' + name);
    c.id = id++;
    return c;
  };
  const {Store} = engine('game/store/store');
  const {Player} = engine('game/store/state/player');
  const {CardList} = engine('game/store/state/card-list');
  const {PokemonCardList} = engine('game/store/state/pokemon-card-list');
  const {GamePhase} = engine('game/store/state/state');
  const {Format} = engine('game/store/card/card-types');
  const {PlayCardAction,PlayerType,SlotType} =
    engine('game/store/actions/play-card-action');
  const {ResolvePromptAction} = engine('game/store/actions/resolve-prompt-action');
  const {CheckPokemonPowersEffect} = engine('game/store/effects/check-effects');
  const store = new Store({onStateChange() {}});
  const state = store.state;
  const a = new Player(), b = new Player();
  a.id = 101; b.id = 202;
  state.players = [a, b];
  state.turn = 1;
  state.activePlayer = 0;
  state.phase = GamePhase.PLAYER_TURN;
  state.gameSettings.format = Format.EXPANDED;
  a.active.cards.push(card('Mega Absol ex MEG'));
  b.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  const vmax = card('Shadow Rider Calyrex VMAX CRE');
  const benchVmax = new PokemonCardList();
  benchVmax.cards.push(card('Shadow Rider Calyrex V CRE'), vmax);
  b.bench.push(benchVmax);
  const trash = new PokemonCardList();
  const trubbish = card('Trubbish BKP');
  trash.cards.push(trubbish);
  a.bench.push(trash);
  for (const p of state.players) {
    p.prizes = Array.from({length: 6}, () => {
      const prize = new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      return prize;
    });
    for (let i = 0; i < 12; i++) p.deck.cards.push(card('Psychic Energy SVE'));
  }
  const evolved = card(evolvedName);
  a.deck.cards.push(evolved);
  const shake = card('Boost Shake EVS');
  a.hand.cards.push(shake);
  const tool = toolName ? card(toolName) : null;
  if (tool) a.hand.cards.push(tool);
  const available = (player, pokemon) => {
    const check = new CheckPokemonPowersEffect(player, pokemon);
    store.reduceEffect(state, check);
    return check.powers.map(p => p.name);
  };
  const before = available(b, vmax);
  assert.ok(before.includes('Underworld Door'), 'Baseline Power missing');
  const pending = () => state.prompts.find(p => p.result === undefined);
  const play = (selected, target) => {
    const handIndex = a.hand.cards.indexOf(selected);
    assert.ok(handIndex >= 0);
    store.dispatch(new PlayCardAction(a.id, handIndex, target));
  };
  if (tool) {
    play(tool, {player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index: 0});
    assert.equal(trash.tools.includes(tool), true, 'Tool not on Trubbish');
    assert.equal(available(a, trubbish).includes('Star Alchemy'), false,
      'Forest Stone must not grant VSTAR Power to non-V Pokémon');
    assert.equal(pending(), undefined);
  }
// __CONTINUATION__
