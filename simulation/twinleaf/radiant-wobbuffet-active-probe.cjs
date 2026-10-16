'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');
const { installRadiantGateLockHook } = require('./radiant-gate-lock-hook.cjs');

/**
 * Pinned-Store effect probe, not a legal full-game setup.
 * @param {boolean} wobbuffetActive
 * @returns {{wobbuffetActive:boolean,gatePrompt:boolean,radiantBenched:boolean}}
 */
function probeWobbuffetGate(wobbuffetActive) {
  const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
  const engine = name => require(path.join(root, name));
  const { Store } = engine('game/store/store');
  const { State, GamePhase } = engine('game/store/state/state');
  const { Player } = engine('game/store/state/player');
  const { PokemonCardList } = engine('game/store/state/pokemon-card-list');
  const { PlayPokemonEffect } = engine('game/store/effects/play-card-effects');
  const { ConfirmPrompt } = engine('game/store/prompts/confirm-prompt');
  const { GameSettings } = engine('game/core/game-settings');

  const manager = initializeCards();
  const get = name => {
    const card = manager.getCardByName(name);
    assert.ok(card, 'Pinned printing unavailable: ' + name);
    return card;
  };

  const player = new Player();
  player.id = 701;
  const opponent = new Player();
  opponent.id = 702;
  opponent.active.cards.push(get('Shadow Rider Calyrex V CRE'));
  const wob = get('Wobbuffet PHF');
  const shadow = get('Shadow Rider Calyrex V CRE');
  if (wobbuffetActive) {
    player.active.cards.push(wob);
  } else {
    player.active.cards.push(shadow);
    const benchedWobbuffet = new PokemonCardList();
    benchedWobbuffet.cards.push(wob);
    player.bench.push(benchedWobbuffet);
  }
  const target = new PokemonCardList();
  player.bench.push(target, new PokemonCardList(), new PokemonCardList());
  const radiant = get('Radiant Eternatus CRZ');
  player.hand.cards.push(radiant);
  player.deck.cards.push(
    get('Shadow Rider Calyrex VMAX CRE'),
    get('Shadow Rider Calyrex VMAX CRE'),
    get('Psychic Energy SVE')
  );

  const store = new Store({onStateChange() {}});
  const state = new State();
  const settings = new GameSettings();
  state.gameSettings = settings;
  state.rules = settings.rules;
  state.phase = GamePhase.WAITING_FOR_PLAYERS;
  state.turn = 3;
  state.players = [player, opponent];
  store.state = state;
  store.reduceEffect(state, new PlayPokemonEffect(player, radiant, target));
  return {
    wobbuffetActive,
    gatePrompt: state.prompts.some(p => p instanceof ConfirmPrompt && p.result === undefined),
    radiantBenched: target.cards.includes(radiant),
  };
}

function inspectWobbuffetGate() {
  const upstream = {
    active: probeWobbuffetGate(true),
    benched: probeWobbuffetGate(false),
  };
  const restore = installRadiantGateLockHook();
  try {
    const corrected = {
      active: probeWobbuffetGate(true),
      benched: probeWobbuffetGate(false),
    };
    assert.equal(corrected.active.gatePrompt, false,
      'Active Wobbuffet should suppress Dragon Radiant Eternatus Climactic Gate');
    assert.equal(corrected.benched.gatePrompt, true,
      'Bench Wobbuffet should not suppress Dragon Radiant Eternatus');
    assert.equal(corrected.active.radiantBenched, true);
    assert.equal(corrected.benched.radiantBenched, true);
    return { upstream, corrected };
  } finally {
    restore();
  }
}

if (require.main === module) console.log(JSON.stringify(inspectWobbuffetGate(), null, 2));
module.exports = { probeWobbuffetGate, inspectWobbuffetGate };
