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
  const {CardList} = engine('game/store/state/card-list');
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
    rock.cards.push(card('Solrock CES'));
    a.bench.push(rock);
  } else {
    a.bench.push(new PokemonCardList());
  }
  a.bench.push(new PokemonCardList());
  a.hand.cards.push(luna, lab);
  for (const player of state.players) {
    player.deck.cards.push(card('Psychic Energy SVE'), card('Psychic Energy SVE'));
    for (let i = 0; i < 6; i++) {
      const prize = new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  const bench = {player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index:1};
  const board = {player: PlayerType.ANY, slot: SlotType.BOARD, index:0};

  /** @param {any} selected @param {any} location */
  const play = (selected, location) => {
    const index = a.hand.cards.indexOf(selected);
    assert.ok(index >= 0, 'Required ' + selected.fullName +
      ' absent from hand after ' + request.order + ': ' +
      JSON.stringify({cards:a.hand.cards.map(x => x.fullName),
        phase:state.phase,prompts:state.prompts.map(x => x.constructor.name)}));
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

/**
 * Exact same staged card-play action pairs under a reversible hook, checking
 * historical order against the official Japanese card-ruling expectation.
 * @returns {object}
 */
function auditWithOfficialOrderHook() {
  const {installNewMoonSilentLabOrderHook} =
    require('./new-moon-silent-lab-order-hook.cjs');
  const baseline = audit();
  const restore = installNewMoonSilentLabOrderHook();
  let corrected;
  try {
    corrected = audit();
  } finally {
    restore();
  }
  assert.equal(baseline.rows[0].lunaBlocked,false,
    'Pinned baseline should reproduce Lab-first bug');
  assert.equal(corrected.rows[0].lunaBlocked,true,
    'Earlier Silent Lab must prevent New Moon at Bench entry');
  assert.equal(corrected.rows[0].mewBlocked,true,
    'Earlier Silent Lab must suppress Perfection too');
  assert.equal(corrected.rows[1].lunaBlocked,false,
    'New Moon established before Lab must remain functional');
  assert.equal(corrected.rows[1].mewBlocked,false,
    'Protected Perfection must remain available after later Lab');
  assert.equal(corrected.rows[2].lunaBlocked,true,
    'No Solrock is a negative control');
  assert.equal(corrected.rows[3].mewBlocked,false,
    'Path-to-the-Peak protection must survive correction');
  assert.equal(corrected.rows[4].mewBlocked,true,
    'Absent Solrock must leave Perfection exposed under Path');
  return {
    source:'Official Japanese Silent Lab + New Moon ordering Q&A',
    baseline,
    corrected,
    status:'Every staged action-order guard passed under reversible hook',
    qualification:'This does not validate full-game policy, setup, re-entry, or all lock effects'
  };
}

if (require.main === module) console.log(JSON.stringify(auditWithOfficialOrderHook(),null,2));
module.exports = {probeOrder,audit,auditWithOfficialOrderHook};

