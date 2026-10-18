'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {installRootTelepathAttachObserver} =
  require('../simulation/twinleaf/telepath-root-attach-observer.cjs');

class AttachEnergyEffect {
  constructor(player, energyCard) {
    this.player = player;
    this.energyCard = energyCard;
  }
}
class Store {
  reduceEffect(state) { return state; }
}
const list = (...cards) => ({cards});
function player() {
  return {
    deck: list(), hand: list(), discard: list(), lostzone: list(),
    stadium: list(), supporter: list(), active: list(),
    bench: [list()], prizes: [list(), list()]
  };
}

test('root Telepath observer attributes source and ignores speculative Stores', () => {
  const energy = {fullName: 'Telepath [P] Energy M3'};
  const a = player(), b = player();
  a.deck.cards.push(energy);
  const state = {players: [a, b]};
  const live = new Store(), speculative = new Store();
  const instrument = installRootTelepathAttachObserver(live, AttachEnergyEffect);
  const event = new AttachEnergyEffect(a, energy);
  speculative.reduceEffect(state, event);
  live.reduceEffect(state, event);
  assert.equal(instrument.events.length, 0);
  instrument.enter({actionOrdinal: 3, turn: 2, actionType: 'ResolvePromptAction'});
  speculative.reduceEffect(state, event);
  live.reduceEffect(state, event);
  instrument.leave();
  assert.deepEqual(instrument.events, [{
    actionOrdinal: 3, turn: 2, actionType: 'ResolvePromptAction',
    playerSeat: 0, sourceZonesAtReducerEntry: ['seat0.deck']
  }]);
  a.deck.cards.splice(0, 1);
  a.hand.cards.push(energy);
  live.reduceEffect(state, event);
  assert.equal(instrument.events.length, 1);
  instrument.restore();
  assert.equal(Object.hasOwn(live, 'reduceEffect'), false);
});

test('observer uses reference identity and ignores other Energy printings', () => {
  const a = player(), b = player(), energy = {fullName: 'Telepath [P] Energy M3'};
  const state = {players: [a, b]};
  a.active.cards.push(energy);
  const store = new Store();
  const recorder = installRootTelepathAttachObserver(store, AttachEnergyEffect);
  recorder.enter({actionOrdinal: 1, turn: 0, actionType: 'PlayCardAction'});
  store.reduceEffect(state, new AttachEnergyEffect(a, {fullName: 'Basic Psychic Energy'}));
  store.reduceEffect(state, new AttachEnergyEffect(a, energy));
  recorder.leave();
  assert.deepEqual(recorder.events[0].sourceZonesAtReducerEntry, ['seat0.active']);
  assert.equal(recorder.events.length, 1);
  recorder.restore();
});
