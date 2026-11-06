'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');
const { planAichi } = require('../evaluation/aichi-pilot.cjs');
const sentinel = require('../../results/aichi-2026/candidate-sentinel-lopunny-vileplume-v1.json');

const VERSION = 'agent40-rank7-wobbuffet-sentinel-hood-store-v1';
const PIN = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const OUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} file */
const native = file => require(path.join(OUT, file));

/**
 * A conditional, actual Store stage with both authentic printed 60-card lists.
 * Staging an evolved Vileplume is NOT a demonstration that Sentinel established
 * it by normal play. Opponent owns exact original rank7 Wobbuffet and Nest Ball.
 *
 * @param {{seat:0|1,wobbuffetActive:boolean,hood:boolean}} params
 * @returns {object}
 */
function stage(params) {
  const { seat, wobbuffetActive, hood } = params;
  const options = {
    allowEquivalentBasicEnergies: true,
    allowBasicEnergyMirrorPrintings: true,
    allowJapanesePromoHooks: true
  };
  const [candidate, original] = [
    planAichi(sentinel, options).candidate.cards,
    planAichi(7, options).candidate.cards
  ];
  assert.equal(candidate?.length, 60);
  assert.equal(original?.length, 60);
  const manager = initializeCards();
  /**
   * @param {string[]} names
   * @param {number} prefix
   * @returns {object[]}
   */
  function makeStock(names, prefix) {
    return names.map((name, index) => {
      const card = manager.getCardByName(name);
      assert.ok(card, 'Unresolved original printing ' + name);
      card.id = prefix + index;
      return card;
    });
  }
  const stockCandidate = makeStock(candidate, 410000);
  const stockOriginal = makeStock(original, 420000);
  /**
   * @param {object[]} stock
   * @param {string} name
   * @returns {object}
   */
  function take(stock, name) {
    const index = stock.findIndex(card => card.fullName === name);
    assert.ok(index >= 0, 'Missing printed ' + name);
    return stock.splice(index, 1)[0];
  }
  const { State, GamePhase } = native('game/store/state/state');
  const { GameSettings } = native('game/core/game-settings');
  const { Player } = native('game/store/state/player');
  const { PokemonCardList } = native('game/store/state/pokemon-card-list');
  const { CardList } = native('game/store/state/card-list');
  const { Store } = native('game/store/store');
  const { Format } = native('game/store/card/card-types');

  const candidatePlayer = new Player();
  const originalPlayer = new Player();
  candidatePlayer.id = 401;
  originalPlayer.id = 407;
  candidatePlayer.name = 'Sentinel v1 staged owner';
  originalPlayer.name = 'authentic original rank7 staged owner';

  candidatePlayer.active.cards.push(take(stockCandidate, 'Bunnelby PRC'));
  const evolved = new PokemonCardList();
  for (const name of ['Oddish UNB', 'Gloom UNB', 'Vileplume AOR']) {
    evolved.cards.push(take(stockCandidate, name));
  }
  evolved.pokemonPlayedTurn = 1;
  if (hood) evolved.tools.push(take(stockCandidate, 'Stealthy Hood UNB'));
  candidatePlayer.bench.push(evolved);
  candidatePlayer.stadium.cards.push(take(stockCandidate, 'Artazon PAL'));

  const wobbuffet = take(stockOriginal, 'Wobbuffet PHF');
  const mimikyu = take(stockOriginal, 'Mimikyu PAL');
  originalPlayer.active.cards.push(wobbuffetActive ? wobbuffet : mimikyu);
  const originalBench = new PokemonCardList();
  originalBench.cards.push(wobbuffetActive ? mimikyu : wobbuffet);
  originalPlayer.bench.push(originalBench);
  const nest = take(stockOriginal, 'Nest Ball SVI');
  originalPlayer.hand.cards.push(nest);

  // Six distinct real Prize cards and a real remaining deck for each player.
  // Stock order is preserved and no opponent hand/deck information drives a
  // policy choice; this is a deliberately staged adversarial test.
  function finish(player, stock) {
    for (let i = 0; i < 6; i++) {
      const prize = new CardList();
      prize.cards.push(stock.shift());
      player.prizes.push(prize);
    }
    player.deck.cards.push(...stock);
  }
  finish(candidatePlayer, stockCandidate);
  finish(originalPlayer, stockOriginal);
  assert.ok(originalPlayer.deck.cards.some(card =>
    ['Wobbuffet PHF', 'Snorlax PGO', 'Regirock XYP'].includes(card.fullName)),
  'Native Nest Ball must have a genuine eligible original Basic target');

  const state = new State();
  const settings = new GameSettings();
  state.gameSettings = settings;
  state.rules = settings.rules;
  state.phase = GamePhase.PLAYER_TURN;
  state.turn = 4;
  state.activePlayer = seat;
  state.players = seat === 0 ?
    [originalPlayer, candidatePlayer] : [candidatePlayer, originalPlayer];
  state.gameSettings.format = Format.EXPANDED;
  const store = new Store({ onStateChange() {} });
  store.state = state;

  /**
   * @param {object} player
   * @returns {number}
   */
  function occupied(player) {
    return player.active.cards.length +
      player.bench.reduce((sum, slot) => sum + slot.cards.length +
        slot.tools.length + slot.energies.cards.length, 0) +
      player.hand.cards.length + player.deck.cards.length +
      player.discard.cards.length + player.lostzone.cards.length +
      player.prizes.reduce((sum, slot) => sum + slot.cards.length, 0) +
      player.stadium.cards.length;
  }
  assert.equal(occupied(candidatePlayer), 60);
  assert.equal(occupied(originalPlayer), 60);
  return { state, store, originalPlayer, candidatePlayer, evolved, nest, seat };
}

/**
 * @param {{seat:0|1,wobbuffetActive:boolean,hood:boolean}} params
 * @returns {object}
 */
function probe(params) {
  const x = stage(params);
  const { IS_ABILITY_BLOCKED } = native('game/store/prefabs/prefabs');
  const { PlayCardAction, PlayerType, SlotType } =
    native('game/store/actions/play-card-action');
  const vileplume = x.evolved.getPokemonCard();
  const power = vileplume.powers.find(p => p.name === 'Irritating Pollen');
  assert.ok(power, 'Pinned original Vileplume AOR has Irritating Pollen');
  const abilityBlocked = Boolean(IS_ABILITY_BLOCKED(
    x.store, x.state, x.candidatePlayer, vileplume, power
  ));
  const firstIndex = x.originalPlayer.hand.cards.indexOf(x.nest);
  assert.ok(firstIndex >= 0);
  let error = null;
  try {
    x.store.dispatch(new PlayCardAction(x.originalPlayer.id, firstIndex, {
      player: PlayerType.ANY, slot: SlotType.BOARD, index: 0
    }));
  } catch (thrown) {
    error = String(thrown?.message ?? thrown);
  }
  const rejectedItem = error === 'CANNOT_PLAY_THIS_CARD';
  const itemStillHeld = x.originalPlayer.hand.cards.includes(x.nest);
  const expectedBlocked = params.wobbuffetActive && !params.hood;
  const expectedItemRejected = !expectedBlocked;
  return {
    ...params, pin: PIN, version: VERSION,
    candidatePhysicalCards: 60, originalPhysicalCards: 60,
    originalPrintedItem: 'Nest Ball SVI',
    originalPrintedLock: 'Wobbuffet PHF',
    candidatePrintedLock: 'Vileplume AOR',
    candidateHood: params.hood,
    nativeVileplumeAbilityBlocked: abilityBlocked,
    nativeItemRejected: rejectedItem,
    nativeItemStillHeld: itemStillHeld,
    nativeItemError: error,
    expectedVileplumeAbilityBlocked: expectedBlocked,
    expectedItemRejected,
    paperParity: abilityBlocked === expectedBlocked &&
      rejectedItem === expectedItemRejected &&
      (rejectedItem ? itemStillHeld : !itemStillHeld),
    conditionalStagedBoard: true,
    qualifiedCompetitiveGames: 0
  };
}

/** @returns {object} */
function run() {
  const rows = [];
  for (const seat of [0, 1]) {
    for (const wobbuffetActive of [false, true]) {
      for (const hood of [false, true]) {
        rows.push(probe({ seat, wobbuffetActive, hood }));
      }
    }
  }
  return {
    version: VERSION, pin: PIN, attempted: rows.length,
    paperParityCount: rows.filter(row => row.paperParity).length,
    rows, qualifiedCompetitiveGames: 0,
    conditionedStagedBoardOnly: true, naturalSourceDeals: 0
  };
}
if (require.main === module) {
  process.stdout.write(JSON.stringify(run(), null, 2) + '\n');
}
module.exports = { VERSION, PIN, stage, probe, run };
