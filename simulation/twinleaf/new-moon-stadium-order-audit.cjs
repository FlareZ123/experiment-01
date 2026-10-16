'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} part */
const engine = part => require(path.join(output, part));

/**
 * Run a pair of actual PlayCardAction sequences that end on the same
 * Pokémon/Stadium identities, while preserving the chronological sequence.
 *
 * @param {{stadium: 'Silent Lab PRC'|'Path to the Peak CRE',
 *          order:'stadium-first'|'lunatone-first', solrock?:boolean}} request
 */
function probeOrder(request) {
  const manager = initializeCards();
  let nextId = 1;
  /** @param {string} fullName */
  const card = fullName => {
    const found = manager.getCardByName(fullName);
    assert.ok(found, 'Pinned source card missing: ' + fullName);
    found.id = nextId++;
    return found;
  };

  const {Store} = engine('game/store/store');
  const {Player} = engine('game/store/state/player');
  const {PokemonCardList} = engine('game/store/state/pokemon-card-list');
  const {GamePhase} = engine('game/store/state/state');
  const {Format} = engine('game/store/card/card-types');
  const {CheckPokemonPowersEffect} = engine('game/store/effects/check-effects');
  const {PlayCardAction, PlayerType, SlotType} =
    engine('game/store/actions/play-card-action');
  const {IS_ABILITY_BLOCKED, IS_STADIUM_EFFECT_BLOCKED} =
    engine('game/store/prefabs/prefabs');

  const store = new Store({onStateChange() {}});
  const state = store.state;
  const a = new Player(), b = new Player();
  a.id = 101; a.name = 'New Moon candidate';
  b.id = 202; b.name = 'Published field adversary';
  state.players = [a, b];
  state.activePlayer = 0;
  state.turn = 4;
  state.phase = GamePhase.PLAYER_TURN;
  state.gameSettings.format = Format.EXPANDED;

  const mew = card('Mewtwo & Mew-GX UNM');
  const luna = card('Lunatone OBF');
  const lab = card(request.stadium);
  a.active.cards.push(mew);
  b.active.cards.push(card('Pidgey MEW'));
  if (request.solrock !== false) {
    const rock = new PokemonCardList();
    rock.cards.push(card('Solrock OBF'));
    a.bench.push(rock);
  } else {
    a.bench.push(new PokemonCardList());
  }
  a.bench.push(new PokemonCardList());
  a.hand.cards.push(luna, lab);
  const bench = {player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index:1};
  const board = {player: PlayerType.ANY, slot: SlotType.BOARD, index:0};

  /** @param {any} selected @param {any} location */
  const play = (selected, location) => {
    const index = a.hand.cards.indexOf(selected);
    assert.ok(index >= 0, 'Required card absent from hand');
    store.dispatch(new PlayCardAction(a.id,index,location));
  };

  if (request.order === 'stadium-first') {
    play(lab,board);
    play(luna,bench);
  } else {
    play(luna,bench);
    play(lab,board);
  }
  const powerNames = pokemon => {
    const effect = new CheckPokemonPowersEffect(a,pokemon);
    store.reduceEffect(state,effect);
    return effect.powers.map(power=>power.name);
  };
  return {
    ...request,
    stadium: request.stadium,
    sourceVersion:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    finalStadium:a.stadium.cards.map(c=>c.fullName),
    lunatoneInPlay:a.bench[1].getPokemonCard()===luna,
    lunaPowers:powerNames(luna),
    mewPowers:powerNames(mew),
    lunaBlocked:IS_ABILITY_BLOCKED(store,state,a,luna,luna.powers[0]),
    mewBlocked:IS_ABILITY_BLOCKED(store,state,a,mew,mew.powers[0]),
    mewStadiumEffectBlocked:IS_STADIUM_EFFECT_BLOCKED(store,state,a,a.active)
  };
}

function audit() {
  const cases = [
    {stadium:'Silent Lab PRC',order:'stadium-first'},
    {stadium:'Silent Lab PRC',order:'lunatone-first'},
    {stadium:'Silent Lab PRC',order:'lunatone-first',solrock:false},
    {stadium:'Path to the Peak CRE',order:'lunatone-first'},
    {stadium:'Path to the Peak CRE',order:'lunatone-first',solrock:false}
  ];
  const rows = cases.map(probeOrder);
  return {
    engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    interpretation:'Engine probes; independently check against official Japanese Q&A.',
    sourceOrderExpectation:{
      silentLabFirstLunatoneBlocked:true,
      newMoonFirstSilentLabLunatoneBlocked:false,
      newMoonFirstSilentLabPerfectionBlocked:false
    },
    rows
  };
}

if (require.main === module) console.log(JSON.stringify(audit(),null,2));
module.exports = {probeOrder,audit};
