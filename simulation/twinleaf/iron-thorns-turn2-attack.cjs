'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');
const out = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} p */
const load = p => require(path.join(out,p));

/** @param {boolean} withThunder */
function prepare(withThunder) {
  const manager = initializeCards();
  let nextId = 1;
  /** @param {string} name */
  const card = name => {
    const value = manager.getCardByName(name);
    assert.ok(value, name);
    value.id = nextId++;
    return value;
  };
  const {Store} = load('game/store/store');
  const {Player} = load('game/store/state/player');
  const {CardList} = load('game/store/state/card-list');
  const {GamePhase} = load('game/store/state/state');
  const {Format} = load('game/store/card/card-types');
  const store = new Store({onStateChange() {}});
  const state = store.state;
  state.phase = GamePhase.PLAYER_TURN;
  state.turn = 2;
  state.activePlayer = 0;
  state.gameSettings.format = Format.EXPANDED;
  const a = new Player(), b = new Player();
  a.id = 101; b.id = 202;
  state.players = [a,b];
  a.active.cards.push(card('Iron Thorns ex TWM'));
  const dce = card('Double Colorless Energy SUM');
  a.active.cards.push(dce);
  a.active.energies.cards.push(dce);
  b.active.cards.push(card('Dialga-GX UPR'));
  if (withThunder) a.stadium.cards.push(card('Thunder Mountain Prism Star LOT'));
  for (const player of [a,b]) {
    player.deck.cards.push(card('Psychic Energy SVE'));
    for (let i = 0; i < 6; i++) {
      const prize = new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  return {store,state,a,b};
}

/** Execute a real pinned AttackAction in a conditional prepared state. */
function probe() {
  const {AttackAction} = load('game/store/actions/game-actions');
  const noThunder = prepare(false);
  assert.throws(() => noThunder.store.dispatch(
    new AttackAction(101,'Volt Cyclone')));
  const thunder = prepare(true);
  assert.equal(thunder.a.bench.length,0);
  thunder.store.dispatch(new AttackAction(101,'Volt Cyclone'));
  assert.equal(thunder.b.active.damage,140);
  return {engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    noThunderRejected:true, withThunderDamage:thunder.b.active.damage,
    benchSlots:thunder.a.bench.length,
    scope:'Injected DCE and Stadium; search and bot decisions untested'};
}
if(require.main===module) console.log(JSON.stringify(probe(),null,2));
module.exports={prepare,probe};
