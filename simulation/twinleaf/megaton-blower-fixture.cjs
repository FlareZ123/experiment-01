'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');

/**
 * Run a constructed legal-target state for Megaton Blower's attached card
 * removal, independent of the match bot. Any research fix must be
 * injected separately; the pinned vendor module is left unchanged.
 *
 * @returns {{toolCounts:number[],specialEnergyCount:number,stadiumCount:number,opponentDiscard:string[],playerDiscard:string[]}}
 */
function probeMegaton() {
  const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
  const engine = name => require(path.join(root, name));
  const { Store } = engine('game/store/store');
  const { State } = engine('game/store/state/state');
  const { Player } = engine('game/store/state/player');
  const { PokemonCardList } = engine('game/store/state/pokemon-card-list');
  const { TrainerEffect } = engine('game/store/effects/play-card-effects');

  const manager = initializeCards();
  const card = name => {
    const result = manager.getCardByName(name);
    assert.ok(result, 'Missing pinned fixture card ' + name);
    return result;
  };
  const p0 = new Player();
  p0.id = 101;
  p0.active.cards.push(card('Iron Thorns ex TWM'));
  const megaton = card('Megaton Blower SSP');
  p0.supporter.cards.push(megaton);
  p0.stadium.cards.push(card('Sky Field ROS'));
  p0.active.tools.push(card('Tool Jammer BST'));

  const p1 = new Player();
  p1.id = 202;
  p1.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  p1.active.tools.push(card('Stealthy Hood UNB'));
  const bench = new PokemonCardList();
  bench.cards.push(card('Shadow Rider Calyrex V CRE'), card('Shadow Rider Calyrex VMAX CRE'));
  bench.tools.push(card('Stealthy Hood UNB'));
  const speedEnergy = card('Speed Lightning Energy RCL');
  bench.cards.push(speedEnergy);
  bench.energies.cards.push(speedEnergy);
  p1.bench.push(bench);

  const state = new State();
  state.players = [p0, p1];
  const store = new Store({ onStateChange() {} });
  store.state = state;
  store.reduceEffect(state, new TrainerEffect(p0, megaton));

  return {
    toolCounts: [p1.active.tools.length, p1.bench[0].tools.length],
    specialEnergyCount: p1.active.energies.cards.length + p1.bench[0].energies.cards.length,
    stadiumCount: p0.stadium.cards.length,
    opponentDiscard: p1.discard.cards.map(c => c.name).sort(),
    playerDiscard: p0.discard.cards.map(c => c.name).sort(),
    ownToolStillAttached: p0.active.tools.some(c => c.name === 'Tool Jammer')
  };
}

if (require.main === module) {
  const upstream = probeMegaton();
  assert.deepEqual(upstream.toolCounts, [1, 1],
    'Pinned upstream no-tool-removal defect appears changed, review the hook necessity.');
  assert.equal(upstream.specialEnergyCount, 0);
  assert.equal(upstream.stadiumCount, 0);
  assert.equal(upstream.ownToolStillAttached, true);
  console.log(JSON.stringify({
    kind: 'megaton-blower-source-implementation-reproduction',
    pinnedEngine: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    upstream,
    warning: 'Upstream omitted both opponent Tools; compatibility hook required.'
  }, null, 2));
}
module.exports = { probeMegaton };
