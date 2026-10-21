'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath */
const compiled = modulePath => require(path.join(output, modulePath));

/**
 * Examine actual pinned-Store stats and Ability discovery using printed
 * Guard Energy, Temple, a Hooded VMAX and a Tool-Garbodor source board.
 * This is an injected midgame observation, not an attack or complete game.
 *
 * @param {{guard:boolean,temple:boolean,hood:boolean,garbodor:boolean}} options
 * @returns {object}
 */
function inspectStats(options) {
  const manager = initializeCards();
  let cardId = 0;
  /** @param {string} name */
  const getCard = name => {
    const result = manager.getCardByName(name);
    assert.ok(result, 'Missing pinned card: ' + name);
    result.id = ++cardId;
    return result;
  };
  const {Store} = compiled('game/store/store');
  const {State, GamePhase} = compiled('game/store/state/state');
  const {Player} = compiled('game/store/state/player');
  const {PokemonCardList} = compiled('game/store/state/pokemon-card-list');
  const {CheckPokemonStatsEffect, CheckPokemonPowersEffect} =
    compiled('game/store/effects/check-effects');

  const source = new Player();
  source.id = 101;
  source.active.cards.push(getCard('Mega Absol ex M1L'));

  const candidate = new Player();
  candidate.id = 202;
  const vmax = getCard('Shadow Rider Calyrex VMAX CRE');
  candidate.active.cards.push(getCard('Shadow Rider Calyrex V CRE'), vmax);

  if (options.guard) {
    const guard = getCard('Weakness Guard Energy UNM');
    candidate.active.cards.push(guard);
    candidate.active.energies.cards.push(guard);
  }
  if (options.hood) {
    const hood = getCard('Stealthy Hood UNB');
    candidate.active.cards.push(hood);
    candidate.active.tools.push(hood);
  }
  if (options.garbodor) {
    const garbo = new PokemonCardList();
    garbo.cards.push(getCard('Garbodor LTR'));
    const stone = getCard('Float Stone BKT');
    garbo.cards.push(stone);
    garbo.tools.push(stone);
    source.bench.push(garbo);
  }
  if (options.temple) {
    source.stadium.cards.push(getCard('Temple of Sinnoh ASR'));
  }
  const state = new State();
  state.phase = GamePhase.PLAYER_TURN;
  state.turn = 5;
  state.activePlayer = 0;
  state.players = [source, candidate];
  const store = new Store({onStateChange() {}});
  store.state = state;

  const stat = new CheckPokemonStatsEffect(candidate.active);
  store.reduceEffect(state, stat);
  const power = new CheckPokemonPowersEffect(candidate, vmax);
  store.reduceEffect(state, power);

  return {
    options,
    active: candidate.active.getPokemonCard().fullName,
    sourceActive: source.active.getPokemonCard().fullName,
    attachedEnergy: candidate.active.energies.cards.map(c => c.fullName),
    tool: candidate.active.tools.map(c => c.fullName),
    stadium: source.stadium.cards.map(c => c.fullName),
    opposingToolGarbodor: source.bench.map(slot => ({
      name: slot.getPokemonCard().name,
      tools: slot.tools.map(c => c.name)
    })),
    weakness: stat.weakness,
    hasUnderworldDoor: power.powers.some(p => p.name === 'Underworld Door')
  };
}

/** @returns {object} */
function run() {
  const cases = [
    {guard:false,temple:false,hood:false,garbodor:false},
    {guard:true,temple:false,hood:false,garbodor:false},
    {guard:true,temple:true,hood:false,garbodor:false},
    {guard:false,temple:false,hood:true,garbodor:true},
    {guard:true,temple:false,hood:true,garbodor:true},
    {guard:true,temple:true,hood:true,garbodor:true}
  ].map(inspectStats);

  const names = [
    'No Guard, no Temple',
    'Guard, no Temple',
    'Guard and Temple',
    'Hood + equipped Garbodor, no Guard',
    'Hood + Guard + equipped Garbodor',
    'Hood + Guard + Temple + equipped Garbodor'
  ];
  for (let i = 0; i < cases.length; i += 1) {
    const row = cases[i];
    assert.equal(
      row.weakness.length,
      row.options.guard && !row.options.temple ? 0 : 1,
      'Unexpected weakness contract: ' + names[i]
    );
    if (row.options.garbodor && row.options.hood) {
      assert.equal(row.hasUnderworldDoor,true,
        'Hood should preserve the VMAX Ability through equipped Garbotoxin: '+names[i]);
    }
  }
  assert.equal(cases[3].weakness.length,1);
  assert.equal(cases[4].weakness.length,0);
  assert.equal(cases[5].weakness.length,1);

  return {
    schema:'agent15-hood-guard-temple-pinned-stats-v1',
    pinnedTwinleaf:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    sourcePrinting:'Mega Absol ex MEG 86',
    targetPrinting:'Shadow Rider Calyrex VMAX CRE 75',
    guardPrinting:'Weakness Guard Energy UNM 213',
    templePrinting:'Temple of Sinnoh ASR 155',
    kind:'injected printed-effect stats and Ability-discovery matrix',
    cases: cases.map((row,index)=>({...row,name:names[index]})),
    allAssertionsPassed:true,
    qualifiedCompetitiveGames:0,
    note:'No native AttackAction, combat damage, legal attachment sequence, source deal, timed match or win-rate inference.'
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(run(), null, 2) + '\n');
}
module.exports = {inspectStats, run};
