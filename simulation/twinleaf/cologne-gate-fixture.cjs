'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');
const { installRadiantGateLockHook } = require('./radiant-gate-lock-hook.cjs');

/**
 * Probe whether one Canceling Cologne applied to an opposing Active Iron Thorns
 * makes the hand-to-Bench Radiant Eternatus Climactic Gate trigger available.
 * A post-Bench mandatory trigger is checked directly on a synthetic midgame
 * board, without claiming a complete deck-list setup probability.
 *
 * @param {boolean} useCologne Suppress opposing active Abilities this turn.
 * @returns {{useCologne:boolean,initializationVisible:boolean,gatePrompt:boolean,radiantBenched:boolean}}
 */
function probeGate(useCologne) {
  const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
  const engine = name => require(path.join(root, name));
  const { Store } = engine('game/store/store');
  const { State, GamePhase } = engine('game/store/state/state');
  const { Player } = engine('game/store/state/player');
  const { PokemonCardList } = engine('game/store/state/pokemon-card-list');
  const { PlayPokemonEffect, TrainerEffect } = engine('game/store/effects/play-card-effects');
  const { CheckPokemonPowersEffect } = engine('game/store/effects/check-effects');
  const { ConfirmPrompt } = engine('game/store/prompts/confirm-prompt');
  const { GameSettings } = engine('game/core/game-settings');

  const manager = initializeCards();
  const get = fullname => {
    const c = manager.getCardByName(fullname);
    assert.ok(c, 'Pinned card unavailable ' + fullname);
    return c;
  };
  const opponent = new Player();
  opponent.id = 101;
  const iron = get('Iron Thorns ex TWM');
  opponent.active.cards.push(iron);

  const player = new Player();
  player.id = 202;
  player.active.cards.push(get('Shadow Rider Calyrex V CRE'));
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
  state.players = [opponent, player];
  store.state = state;

  if (useCologne) {
    const cologne = get('Canceling Cologne ASR');
    player.supporter.cards.push(cologne);
    store.reduceEffect(state, new TrainerEffect(player, cologne));
  }

  const ironPowers = new CheckPokemonPowersEffect(opponent, iron);
  store.reduceEffect(state, ironPowers);
  const initializationVisible = ironPowers.powers.some(p => p.name === 'Initialization');
  store.reduceEffect(state, new PlayPokemonEffect(player, radiant, target));
  return {
    useCologne,
    initializationVisible,
    gatePrompt: state.prompts.some(p => p instanceof ConfirmPrompt && p.result === undefined),
    radiantBenched: target.cards.includes(radiant)
  };
}

/** @returns {{upstream:object,corrected:object}} Lock and Cologne controls. */
function runTest() {
  // Keep upstream observations separate from the corrective-hook contract.
  // The pinned source's actual Gate behavior must be measured before calling
  // it a defect; an earlier fixture failed because this assumption was wrong.
  const upstreamLocked = probeGate(false);
  const upstreamUnlocked = probeGate(true);
  assert.equal(upstreamLocked.initializationVisible, true);
  assert.equal(upstreamLocked.radiantBenched, true);
  assert.equal(upstreamUnlocked.initializationVisible, false);
  assert.equal(upstreamUnlocked.radiantBenched, true);

  const restore = installRadiantGateLockHook();
  try {
    const locked = probeGate(false);
    const unlocked = probeGate(true);
    assert.equal(locked.initializationVisible, true);
    assert.equal(locked.gatePrompt, false);
    assert.equal(locked.radiantBenched, true);
    assert.equal(unlocked.initializationVisible, false);
    assert.equal(unlocked.gatePrompt, true);
    assert.equal(unlocked.radiantBenched, true);
    return { upstream: { locked: upstreamLocked, unlocked: upstreamUnlocked },
      corrected: { locked, unlocked } };
  } finally {
    restore();
  }
}

if (require.main === module) {
  console.log(JSON.stringify({
    kind: 'canceling-cologne-radiant-gate-unlock',
    engine: 'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    status: 'upstream source classification and reversible Cologne/lock prompt check',
    ...runTest()
  }, null, 2));
}

module.exports = { probeGate, runTest };
