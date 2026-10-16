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
 * @param {{turn?:number, withKoko?:boolean}} [options]
 * @returns {any}
 */
function board(wobbuffetLocation, eggLocation, options = {}) {
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
  state.turn = options.turn ?? 2;
  const egg = cards.getCardByName('Exeggcute PLF');
  const wob = cards.getCardByName('Wobbuffet PHF');
  const psy = cards.getCardByName('Meloetta ex SV11B');
  own.active.cards.push(psy);
  own[eggLocation].cards.push(egg);
  if (options.withKoko === true) {
    const koko = cards.getCardByName('Tapu Koko Prism Star TEU');
    const kokoSlot = new PokemonCardList();
    kokoSlot.cards.push(koko);
    own.bench.push(kokoSlot);
  }
  if (wobbuffetLocation === 'active') {
    opp.active.cards.push(wob);
  } else {
    const slot = new PokemonCardList();
    slot.cards.push(wob);
    opp.bench.push(slot);
  }
  return { store, state, own, opp, egg, wob };
}

/** @param {'active'|'bench'} wobLocation @param {'discard'|'hand'} eggLocation @param {{turn?:number,withKoko?:boolean}} [options] */
function probe(wobLocation, eggLocation, options = {}) {
  const { IS_ABILITY_BLOCKED } = load('game/store/prefabs/prefabs');
  const { PowerEffect } = load('game/store/effects/game-effects');
  const fixture = board(wobLocation, eggLocation, options);
  const a = IS_ABILITY_BLOCKED(fixture.store, fixture.state, fixture.own, fixture.egg);
  const fixtureB = board(wobLocation, eggLocation, options);
  const b = IS_ABILITY_BLOCKED(fixtureB.store, fixtureB.state, fixtureB.own,
    fixtureB.egg, fixtureB.egg.powers[0]);
  const fixtureC = board(wobLocation, eggLocation, options);
  let error = null;
  try {
    fixtureC.store.reduceEffect(fixtureC.state, new PowerEffect(
      fixtureC.own, fixtureC.egg.powers[0], fixtureC.egg));
  } catch (e) {
    error = e.message;
  }
  const fixtureD = board(wobLocation, eggLocation, options);
  const { GamePhase } = load('game/store/state/state');
  const { UseAbilityAction } = load('game/store/actions/game-actions');
  const { PlayerType, SlotType } = load('game/store/actions/play-card-action');
  fixtureD.state.phase = GamePhase.PLAYER_TURN;
  // Give both players real, nonempty Prize zones so a successful action
  // cannot terminate the staged game for an unrelated setup omission.
  const { CardList } = load('game/store/state/card-list');
  for (const player of fixtureD.state.players) {
    for (let i = 0; i < 6; i++) {
      const prize = new CardList();
      prize.cards.push(initializeCards().getCardByName('Exeggcute PLF'));
      player.prizes.push(prize);
    }
  }
  const fromSlot = eggLocation === 'discard' ? SlotType.DISCARD : SlotType.HAND;
  let dispatchedError = null;
  try {
    fixtureD.store.dispatch(new UseAbilityAction(101, 'Propagation', {
      player: PlayerType.BOTTOM_PLAYER, slot: fromSlot, index: 0
    }));
  } catch (e) {
    dispatchedError = e.message;
  }
  const actualState = fixtureD.store.state;
  const actualOwn = actualState.players[0];
  return {wobLocation, eggLocation, turn:options.turn ?? 2, withKoko:options.withKoko===true,
    stubBlocked:a, truePowerStubBlocked:b,
    directError:error,
    dispatchedError,
    dispatchEggInHand:actualOwn.hand.cards.includes(fixtureD.egg),
    dispatchEggInDiscard:actualOwn.discard.cards.includes(fixtureD.egg),
    dispatchHandNames:actualOwn.hand.cards.map(card => card.fullName),
    dispatchDiscardNames:actualOwn.discard.cards.map(card => card.fullName),
    dispatchPhase:actualState.phase, dispatchWinner:actualState.winner,
    eggNowInHand:fixtureC.own.hand.cards.includes(fixtureC.egg),
    eggNowInDiscard:fixtureC.own.discard.cards.includes(fixtureC.egg)};
}

function inspect() {
  const rows = [];
  for (const turn of [1, 2]) {
    for (const withKoko of [false, true]) {
      rows.push(probe('active', 'discard', {turn, withKoko}));
    }
  }
  rows.push(probe('bench', 'discard', {turn:1, withKoko:true}));
  rows.push(probe('active', 'hand', {turn:1, withKoko:true}));
  return rows;
}

if (require.main === module) console.log(JSON.stringify(inspect(), null, 2));
module.exports = { board, probe, inspect };
