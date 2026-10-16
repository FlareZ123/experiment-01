'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');
const { installRadiantGateLockHook } = require('./radiant-gate-lock-hook.cjs');

/**
 * Conditional mid-turn Store effect, not a playable opening:
 * Wobbuffet PHF Active or Benched versus opponent Active Iron Thorns ex TWM,
 * with or without Canceling Cologne on opponent's Active.
 *
 * @param {boolean} wobbuffetActive
 * @param {boolean} colognePlayed
 */
function probeThornsWobbuffet(wobbuffetActive, colognePlayed) {
  const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
  const engine = name => require(path.join(output, name));
  const { Store } = engine('game/store/store');
  const { State, GamePhase } = engine('game/store/state/state');
  const { Player } = engine('game/store/state/player');
  const { PokemonCardList } = engine('game/store/state/pokemon-card-list');
  const { PlayPokemonEffect, TrainerEffect } = engine('game/store/effects/play-card-effects');
  const { CheckPokemonPowersEffect } = engine('game/store/effects/check-effects');
  const { ConfirmPrompt } = engine('game/store/prompts/confirm-prompt');
  const { GameSettings } = engine('game/core/game-settings');

  const cards = initializeCards();
  const get = name => {
    const card = cards.getCardByName(name);
    assert.ok(card, 'Missing pinned printing ' + name);
    return card;
  };
  const ours = new Player();
  ours.id = 171;
  const theirs = new Player();
  theirs.id = 172;
  const thorns = get('Iron Thorns ex TWM');
  theirs.active.cards.push(thorns);
  const wobbuffet = get('Wobbuffet PHF');
  const shadow = get('Shadow Rider Calyrex V CRE');
  if (wobbuffetActive) {
    ours.active.cards.push(wobbuffet);
  } else {
    ours.active.cards.push(shadow);
    const wobbuffetBench = new PokemonCardList();
    wobbuffetBench.cards.push(wobbuffet);
    ours.bench.push(wobbuffetBench);
  }
  const vmax = get('Shadow Rider Calyrex VMAX CRE');
  const vmaxBench = new PokemonCardList();
  vmaxBench.cards.push(vmax);
  ours.bench.push(vmaxBench);
  const gateTarget = new PokemonCardList();
  ours.bench.push(gateTarget, new PokemonCardList(), new PokemonCardList());
  const radiant = get('Radiant Eternatus CRZ');
  ours.hand.cards.push(radiant);
  ours.deck.cards.push(
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
  state.players = [ours, theirs];
  store.state = state;

  if (colognePlayed) {
    const cologne = get('Canceling Cologne ASR');
    ours.supporter.cards.push(cologne);
    store.reduceEffect(state, new TrainerEffect(ours, cologne));
  }
  const thornsPowers = new CheckPokemonPowersEffect(theirs, thorns);
  store.reduceEffect(state, thornsPowers);
  const initializationVisible = thornsPowers.powers.some(power => power.name === 'Initialization');
  const vmaxPowers = new CheckPokemonPowersEffect(ours, vmax);
  store.reduceEffect(state, vmaxPowers);
  const underworldDoorVisible = vmaxPowers.powers.some(power => power.name === 'Underworld Door');
  store.reduceEffect(state, new PlayPokemonEffect(ours, radiant, gateTarget));
  return {
    wobbuffetActive,
    colognePlayed,
    initializationVisible,
    underworldDoorVisible,
    gatePrompt: state.prompts.some(p => p instanceof ConfirmPrompt && p.result === undefined),
    radiantBenched: gateTarget.cards.includes(radiant),
  };
}

function inspectThornsWobbuffetMatrix() {
  const configurations = [[true, false], [true, true], [false, false], [false, true]];
  const run = () => configurations.map(([active, cologne]) => probeThornsWobbuffet(active, cologne));
  const upstream = run();
  const restore = installRadiantGateLockHook();
  try {
    const corrected = run();
    assert.deepEqual(corrected.map(x => x.initializationVisible),
      [false, false, true, false]);
    assert.deepEqual(corrected.map(x => x.gatePrompt),
      [false, false, false, true]);
    assert.deepEqual(corrected.map(x => x.underworldDoorVisible),
      [true, true, false, true]);
    assert.ok(corrected.every(x => x.radiantBenched));
    return { upstream, corrected };
  } finally {
    restore();
  }
}

if (require.main === module) console.log(JSON.stringify(inspectThornsWobbuffetMatrix(), null, 2));
module.exports = { probeThornsWobbuffet, inspectThornsWobbuffetMatrix };
