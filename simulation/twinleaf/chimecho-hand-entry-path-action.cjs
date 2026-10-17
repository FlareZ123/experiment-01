'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} moduleName */
const load = moduleName => require(path.join(output, moduleName));

/**
 * Test the real pinned Store PlayCardAction after applying the printed
 * Chimecho CIN Bell of Silence player-level lock through its own reducer.
 * Stadium and lock are crossed without modifying any upstream source.
 *
 * @param {{lock:boolean,path:boolean,withAbility:boolean}} options
 * @returns {{options:object,locked:boolean,accepted:boolean,benchEntry:boolean,
 *   handRetained:boolean,error:string|null,pendingPrompts:string[]}}
 */
function probeChimechoHandEntry(options) {
  const cards = initializeCards();
  let nextId = 1;
  /** @param {string} fullName */
  const card = fullName => {
    const found = cards.getCardByName(fullName);
    assert.ok(found, 'Missing pinned exact printing: ' + fullName);
    found.id = nextId++;
    return found;
  };
  const { Store } = load('game/store/store');
  const { GamePhase } = load('game/store/state/state');
  const { Player } = load('game/store/state/player');
  const { PokemonCardList } = load('game/store/state/pokemon-card-list');
  const { CardList } = load('game/store/state/card-list');
  const { Format } = load('game/store/card/card-types');
  const { AttackEffect } = load('game/store/effects/game-effects');
  const { PlayCardAction, PlayerType, SlotType } =
    load('game/store/actions/play-card-action');

  const attacker = new Player();
  attacker.id = 101;
  attacker.name = 'Chimecho attacker';
  const defender = new Player();
  defender.id = 202;
  defender.name = 'Ability hand entry target';

  const store = new Store({onStateChange() {}});
  const state = store.state;
  state.players = [attacker, defender];
  state.phase = GamePhase.PLAYER_TURN;
  state.activePlayer = 1;
  state.turn = 4;
  state.gameSettings.format = Format.EXPANDED;

  const chimecho = card('Chimecho CIN');
  attacker.active.cards.push(chimecho);
  defender.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  defender.bench.push(new PokemonCardList());
  if (options.path) attacker.stadium.cards.push(card('Path to the Peak CRE'));

  for (const player of [attacker, defender]) {
    player.deck.cards.push(card('Psychic Energy SVE'), card('Psychic Energy SVE'));
    for (let i = 0; i < 6; i += 1) {
      const prize = new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }

  const incoming = card(options.withAbility
    ? 'Tapu Lele-GX GRI'
    : 'Shadow Rider Calyrex V CRE');
  defender.hand.cards.push(incoming);

  if (options.lock) {
    chimecho.reduceEffect(store, state,
      new AttackEffect(attacker, defender, chimecho.attacks[0]));
  }
  assert.equal(defender.cannotPlayPokemonWithAbilities, options.lock);

  let error = null;
  try {
    store.dispatch(new PlayCardAction(defender.id, 0, {
      player: PlayerType.BOTTOM_PLAYER,
      slot: SlotType.BENCH,
      index: 0
    }));
  } catch (caught) {
    error = caught.message;
  }

  return {
    options,
    locked: defender.cannotPlayPokemonWithAbilities,
    accepted: error === null,
    benchEntry: defender.bench[0].getPokemonCard() === incoming,
    handRetained: defender.hand.cards.includes(incoming),
    error,
    pendingPrompts: state.prompts
      .filter(prompt => prompt.result === undefined)
      .map(prompt => prompt.constructor.name)
  };
}

/** @returns {object} Tested two-by-two-by-two condition matrix. */
function testChimechoHandEntry() {
  const results = [];
  for (const lock of [false, true]) {
    for (const path of [false, true]) {
      for (const withAbility of [false, true]) {
        const row = probeChimechoHandEntry({lock, path, withAbility});
        const shouldBlock = lock && withAbility;
        assert.equal(row.accepted, !shouldBlock, JSON.stringify(row));
        assert.equal(row.benchEntry, !shouldBlock, JSON.stringify(row));
        assert.equal(row.handRetained, shouldBlock, JSON.stringify(row));
        results.push(row);
      }
    }
  }
  return {
    engine: 'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    card: 'Chimecho CIN 43 Bell of Silence',
    stadium: 'Path to the Peak CRE',
    evidence: 'Staged actual PlayCardAction and authentic attack-origin lock reducer',
    limitation: 'No match replay, attack announcement or discard-entry Ability case',
    results
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(testChimechoHandEntry(), null, 2) + '\n');
}

module.exports = { probeChimechoHandEntry, testChimechoHandEntry };
