'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');
const { installToolJammerHook } = require('./tool-jammer-hook.cjs');

/**
 * Evolution is performed from hand in a synthetic turn-3 state with Hood
 * already attached to Shadow Rider Calyrex V. We test the game's actual
 * PlayPokemonEffect and Ability discovery, with opponent Active Iron Thorns.
 *
 * @param {{hood:boolean,active:boolean,jammer:boolean}} options
 * @returns {{evolved:boolean,hoodPreserved:boolean,underworldVisible:boolean}}
 */
function probeProtectedEvolution(options) {
  const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
  const engine = name => require(path.join(root, name));
  const { Store } = engine('game/store/store');
  const { State } = engine('game/store/state/state');
  const { Player } = engine('game/store/state/player');
  const { PokemonCardList } = engine('game/store/state/pokemon-card-list');
  const { PlayPokemonEffect } = engine('game/store/effects/play-card-effects');
  const { CheckPokemonPowersEffect } = engine('game/store/effects/check-effects');

  const manager = initializeCards();
  const get = name => {
    const value = manager.getCardByName(name);
    assert.ok(value, 'Missing pinned printing ' + name);
    return value;
  };

  const ironPlayer = new Player();
  ironPlayer.id = 101;
  ironPlayer.active.cards.push(get('Iron Thorns ex TWM'));
  if (options.jammer) ironPlayer.active.tools.push(get('Tool Jammer BST'));

  const shadowPlayer = new Player();
  shadowPlayer.id = 202;
  const target = new PokemonCardList();
  target.cards.push(get('Shadow Rider Calyrex V CRE'));
  if (options.hood) target.tools.push(get('Stealthy Hood UNB'));
  if (options.active) {
    shadowPlayer.active = target;
    const spare = new PokemonCardList();
    spare.cards.push(get('Shadow Rider Calyrex V CRE'));
    shadowPlayer.bench.push(spare);
  } else {
    shadowPlayer.active.cards.push(get('Shadow Rider Calyrex V CRE'));
    shadowPlayer.bench.push(target);
  }

  const vmax = get('Shadow Rider Calyrex VMAX CRE');
  shadowPlayer.hand.cards.push(vmax);
  const state = new State();
  state.turn = 3;
  state.players = [ironPlayer, shadowPlayer];
  const store = new Store({onStateChange() {}});
  store.state = state;

  store.reduceEffect(state, new PlayPokemonEffect(shadowPlayer, vmax, target));
  const powerCheck = new CheckPokemonPowersEffect(shadowPlayer, vmax);
  store.reduceEffect(state, powerCheck);
  return {
    evolved: target.getPokemonCard() === vmax && !shadowPlayer.hand.cards.includes(vmax),
    hoodPreserved: target.tools.some(c => c.name === 'Stealthy Hood'),
    underworldVisible: powerCheck.powers.some(p => p.name === 'Underworld Door')
  };
}

/** @returns {object[]} Full evolution transitions under all critical positions. */
function runFixture() {
  const cases = [
    {hood:true,active:false,jammer:true,underworldVisible:true},
    {hood:true,active:true,jammer:true,underworldVisible:false},
    {hood:false,active:false,jammer:false,underworldVisible:false}
  ];
  const restore = installToolJammerHook();
  try {
    return cases.map(row => {
      const observed = probeProtectedEvolution(row);
      assert.equal(observed.evolved, true, JSON.stringify(row));
      assert.equal(observed.hoodPreserved, row.hood, JSON.stringify(row));
      assert.equal(observed.underworldVisible, row.underworldVisible, JSON.stringify(row));
      return {...row,observed};
    });
  } finally {
    restore();
  }
}

if (require.main === module) {
  console.log(JSON.stringify({
    kind: 'stealthy-hood-preservation-through-legal-v-to-vmax-evolution',
    engine: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    cases: runFixture()
  }, null, 2));
}

module.exports = {probeProtectedEvolution,runFixture};
