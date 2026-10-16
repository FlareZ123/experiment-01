'use strict';

const path = require('node:path');
const { initializeCards } = require('./headless.cjs');
const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} file */
const load = file => require(path.join(root, file));

/**
 * Build fresh state for each probe because real Ability use moves Exeggcute.
 * @param {'active'|'bench'} wobbuffetLocation
 * @param {'discard'|'hand'} eggLocation
 * @returns {any}
 */
function board(wobbuffetLocation, eggLocation) {
  const cards = initializeCards();
  const { Store } = load('game/store/store');
  const { Player } = load('game/store/state/player');
  const { PokemonCardList } = load('game/store/state/pokemon-card-list');
  const store = new Store({ onStateChange() {} });
  const state = store.state;
  const own = new Player();
  const opp = new Player();
  own.id = 101;
  opp.id = 202;
  own.name = 'Research';
  opp.name = 'Wobbuffet';
  state.players = [own, opp];
  state.activePlayer = 0;
  state.turn = 2;
  const egg = cards.getCardByName('Exeggcute PLF');
  const wob = cards.getCardByName('Wobbuffet PHF');
  const psy = cards.getCardByName('Meloetta ex SV11B');
  own.active.cards.push(psy);
  own[eggLocation].cards.push(egg);
  if (wobbuffetLocation === 'active') {
    opp.active.cards.push(wob);
  } else {
    const slot = new PokemonCardList();
    slot.cards.push(wob);
    opp.bench.push(slot);
  }
  return { store, state, own, opp, egg, wob };
}

/** @param {'active'|'bench'} wobLocation @param {'discard'|'hand'} eggLocation */
function probe(wobLocation, eggLocation) {
  const { IS_ABILITY_BLOCKED } = load('game/store/prefabs/prefabs');
  const { PowerEffect } = load('game/store/effects/game-effects');
  const fixture = board(wobLocation, eggLocation);
  const a = IS_ABILITY_BLOCKED(fixture.store, fixture.state, fixture.own, fixture.egg);
  const fixtureB = board(wobLocation, eggLocation);
  const b = IS_ABILITY_BLOCKED(fixtureB.store, fixtureB.state, fixtureB.own,
    fixtureB.egg, fixtureB.egg.powers[0]);
  const fixtureC = board(wobLocation, eggLocation);
  let error = null;
  try {
    fixtureC.store.reduceEffect(fixtureC.state, new PowerEffect(
      fixtureC.own, fixtureC.egg.powers[0], fixtureC.egg));
  } catch (e) {
    error = e.message;
  }
  return {wobLocation, eggLocation, stubBlocked:a, truePowerStubBlocked:b,
    directError:error,
    eggNowInHand:fixtureC.own.hand.cards.includes(fixtureC.egg),
    eggNowInDiscard:fixtureC.own.discard.cards.includes(fixtureC.egg)};
}

function inspect() {
  const rows = [];
  for (const w of ['active', 'bench']) {
    for (const e of ['discard', 'hand']) rows.push(probe(w, e));
  }
  return rows;
}

if (require.main === module) console.log(JSON.stringify(inspect(), null, 2));
module.exports = { board, probe, inspect };
