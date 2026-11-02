'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');

const PIN = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/** @param {string} file @returns {object} */
function engine(file) {
  return require(path.join(output, file));
}

/**
 * One deliberately staged board-only passive lock fixture. This does not
 * execute Boost Shake, resolve payments, or create an authentic game.
 * @param {{muk:boolean,thorns:boolean,mukActive:boolean}} choice
 * @param {object} manager Pinned card manager with actual native classes
 * @returns {object}
 */
function probe(choice, manager) {
  const { Store } = engine('game/store/store');
  const { State, GamePhase } = engine('game/store/state/state');
  const { Player } = engine('game/store/state/player');
  const { PokemonCardList } = engine('game/store/state/pokemon-card-list');
  const { CheckPokemonPowersEffect } = engine('game/store/effects/check-effects');
  const { GameSettings } = engine('game/core/game-settings');
  const { IS_ABILITY_BLOCKED } = engine('game/store/prefabs/prefabs');

  const get = (name) => {
    const card = manager.getCardByName(name);
    assert.ok(card, 'Missing real native printing: ' + name);
    return card;
  };
  const candidate = new Player();
  candidate.id = 1431;
  const source = new Player();
  source.id = 1432;
  const thorns = choice.thorns ? get('Iron Thorns ex TWM') : null;
  if (thorns) source.active.cards.push(thorns);
  else source.active.cards.push(get('Alolan Grimer SUM'));

  const vstar = get('Regidrago VSTAR SIT');
  const regidragoStack = new PokemonCardList();
  regidragoStack.cards.push(get('Regidrago V SIT'), vstar);
  regidragoStack.pokemonPlayedTurn = 1;
  if (choice.mukActive) {
    candidate.bench.push(regidragoStack);
  } else {
    candidate.active.cards.push(...regidragoStack.cards);
    candidate.active.pokemonPlayedTurn = 1;
  }

  const muk = choice.muk ? get('Alolan Muk SUM') : null;
  if (muk) {
    const mukStack = new PokemonCardList();
    mukStack.cards.push(get('Alolan Grimer SUM'), muk);
    mukStack.pokemonPlayedTurn = 1;
    if (choice.mukActive) {
      candidate.active.cards.push(...mukStack.cards);
      candidate.active.pokemonPlayedTurn = 1;
    } else {
      candidate.bench.push(mukStack);
    }
  }
  const latias = get('Latias ex SSP');
  const latiasSlot = new PokemonCardList();
  latiasSlot.cards.push(latias);
  candidate.bench.push(latiasSlot);

  const store = new Store({ onStateChange() {} });
  const state = new State();
  const settings = new GameSettings();
  state.gameSettings = settings;
  state.rules = settings.rules;
  state.phase = GamePhase.PLAYER_TURN;
  state.turn = 3;
  state.activePlayer = 0;
  state.players = [candidate, source];
  store.state = state;

  /** @param {object} player @param {object} pokemon */
  const visible = (player, pokemon) => {
    const effect = new CheckPokemonPowersEffect(player, pokemon);
    store.reduceEffect(state, effect);
    return effect.powers.map((power) => power.name);
  };
  /** @param {object} player @param {object} pokemon @param {string} name */
  const blocked = (player, pokemon, name) => {
    const power = (pokemon.powers || []).find((p) => p.name === name);
    return power ? Boolean(IS_ABILITY_BLOCKED(store, state, player, pokemon, power)) : null;
  };
  return {
    ...choice,
    mukFullName: muk ? muk.fullName : null,
    mukStage: muk ? muk.stage : null,
    mukHasRuleBox: muk ? (typeof muk.hasRuleBox === 'function' ? muk.hasRuleBox() : null) : null,
    sourceThornsPowerVisible: thorns ? visible(source, thorns).includes('Initialization') : null,
    sourceThornsPowerBlocked: thorns ? blocked(source, thorns, 'Initialization') : null,
    candidateVstarPowerVisible: visible(candidate, vstar).includes('Legacy Star'),
    candidateVstarPowerBlocked: blocked(candidate, vstar, 'Legacy Star'),
    candidateLatiasPowerVisible: visible(candidate, latias).includes('Skyliner'),
    candidateLatiasPowerBlocked: blocked(candidate, latias, 'Skyliner'),
    candidateMukPowerVisible: muk ? visible(candidate, muk).includes('Power of Alchemy') : null,
    sourceActive: source.active.getPokemonCard()?.fullName || null,
    candidateActive: candidate.active.getPokemonCard()?.fullName || null,
    candidateBenched: candidate.bench.map((slot) => slot.getPokemonCard()?.fullName || null)
  };
}

/** @returns {object} */
function run() {
  const manager = initializeCards();
  const required = [
    'Alolan Grimer SUM', 'Alolan Muk SUM', 'Iron Thorns ex TWM',
    'Regidrago V SIT', 'Regidrago VSTAR SIT', 'Latias ex SSP'
  ];
  const missing = required.filter((name) => !manager.getCardByName(name));
  if (missing.length) {
    return {
      schema: 'agent43-muk-thorns-pinned-board-matrix-v1',
      engineCommit: PIN,
      status: 'PINNED_NATIVE_CARD_NOT_IMPLEMENTED',
      missing,
      boardOnly: true,
      competitiveGameQualified: false
    };
  }
  const choices = [
    { muk: false, thorns: false, mukActive: false },
    { muk: false, thorns: true, mukActive: false },
    { muk: true, thorns: false, mukActive: false },
    { muk: true, thorns: true, mukActive: false },
    { muk: true, thorns: true, mukActive: true }
  ];
  const rows = choices.map((choice) => probe(choice, manager));
  const expected = [
    { thorns: null, vstar: true, latias: true },
    { thorns: true, vstar: false, latias: false },
    { thorns: null, vstar: true, latias: false },
    { thorns: false, vstar: true, latias: false },
    { thorns: false, vstar: true, latias: false }
  ];
  const discrepancies = rows.flatMap((row, index) => {
    const want = expected[index];
    const parts = [
      ['sourceThornsPowerVisible', want.thorns],
      ['candidateVstarPowerVisible', want.vstar],
      ['candidateLatiasPowerVisible', want.latias]
    ];
    return parts.filter(([field, value]) => row[field] !== value)
      .map(([field, value]) => ({ index, field, expected: value, observed: row[field] }));
  });
  return {
    schema: 'agent43-muk-thorns-pinned-board-matrix-v1',
    engineCommit: PIN,
    status: discrepancies.length ? 'NATIVE_BOARD_PAPER_EXPECTATION_MISMATCH' : 'NATIVE_BOARD_PREDICATES_MATCH',
    rows,
    discrepancies,
    boardOnly: true,
    noActualBoostShake: true,
    noOriginalSourcePhysicalPayment: true,
    fullDeckPolicyCertified: false,
    competitiveGameQualified: false
  };
}

if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = { PIN, probe, run };
