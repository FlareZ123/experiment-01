'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath */
const load = modulePath => require(path.join(output, modulePath));

/**
 * Execute an actual pinned Store action from Lele Bench entry through Ranger
 * and unlocked Switch. The prior Budew effect is staged by its real reducer.
 * @param {{initialization?:boolean,rangerPrized?:boolean,
 *   supporterSpent?:boolean,forcedLeleActive?:boolean}} options
 */
function probeRangerLine(options = {}) {
  const cards = initializeCards();
  let nextId = 1;
  /** @param {string} name */
  const card = name => {
    const found = cards.getCardByName(name);
    assert.ok(found, 'Pinned card unavailable: ' + name);
    found.id = nextId++;
    return found;
  };
  const {Store} = load('game/store/store');
  const {GamePhase} = load('game/store/state/state');
  const {Player} = load('game/store/state/player');
  const {CardList} = load('game/store/state/card-list');
  const {PokemonCardList} = load('game/store/state/pokemon-card-list');
  const {Format} = load('game/store/card/card-types');
  const {AttackEffect} = load('game/store/effects/game-effects');
  const {PlayCardAction, PlayerType, SlotType} =
    load('game/store/actions/play-card-action');
  const {ResolvePromptAction} =
    load('game/store/actions/resolve-prompt-action');
  const store = new Store({onStateChange() {}});
  const state = store.state;
  state.phase = GamePhase.PLAYER_TURN;
  state.turn = 4;
  state.activePlayer = 1;
  state.gameSettings.format = Format.EXPANDED;

  const attacker = new Player(), defender = new Player();
  attacker.id = 101; attacker.name = 'Budew lock';
  defender.id = 202; defender.name = 'Shadow Rider Ranger response';
  state.players = [attacker, defender];
  const budew = card('Budew ASC');
  attacker.active.cards.push(options.initialization ?
    card('Iron Thorns ex TWM') : budew);
  defender.active.cards.push(options.forcedLeleActive ?
    card('Tapu Lele-GX GRI') : card('Shadow Rider Calyrex V CRE'));
  defender.bench.push(new PokemonCardList());
