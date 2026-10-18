'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {ownPosition, withSourceDdeAttachmentTrace} =
  require('../simulation/twinleaf/dde-v4-first-seat-source-root-target.cjs');

class AddPlayerAction {}
class PlayCardAction {
  constructor(id, handIndex, target) {
    Object.assign(this, {id, handIndex, target});
  }
}
class RetreatAction {
  constructor(id) { this.id = id; }
}
class PassTurnAction {
  constructor(id) { this.id = id; }
}

function slot(name, energy = []) {
  return {
    pokemon: {fullName: name},
    getPokemonCard() { return this.pokemon; },
    energies: {cards: energy.map(fullName => ({fullName}))}
  };
}
function fixture() {
  const owner = {
    id: 101,
    hand: {cards: [{fullName: 'Double Dragon Energy ROS'}]},
    active: slot('Regidrago V SIT'),
    bench: [slot('Koraidon ex TEF')]
  };
  class Store {
    constructor() { this.state = {turn: 21, players: [owner]}; }
    dispatch(action) {
      if (action.constructor.name === 'PlayCardAction') {
        owner.active.energies.cards.push(owner.hand.cards.splice(action.handIndex, 1)[0]);
      }
      if (action.constructor.name === 'RetreatAction') {
        const previous = owner.active;
        owner.active = owner.bench[0];
        owner.bench[0] = previous;
      }
      return true;
    }
  }
  return {Store, owner, store: new Store()};
}

test('source Store observer sees actual DDE placement and later retreat', () => {
  const {Store, store} = fixture();
  const previous = Object.getOwnPropertyDescriptor(Store.prototype, 'dispatch');
  const result = withSourceDdeAttachmentTrace(Store, () => {
    store.dispatch(new AddPlayerAction());
    store.dispatch(new PlayCardAction(101, 0, {player: 0, slot: 0, index: 0}));
    store.dispatch(new RetreatAction(101));
    store.dispatch(new PassTurnAction(101));
    return 'done';
  });
  assert.equal(result.result, 'done');
  assert.equal(result.records.length, 1);
  const record = result.records[0];
  assert.equal(record.rootStep, 1);
  assert.equal(record.before.playedPrinting, 'Double Dragon Energy ROS');
  assert.deepEqual(record.before.active.energy, []);
  assert.deepEqual(record.after.active.energy, ['Double Dragon Energy ROS']);
  assert.equal(record.followingRootActions.length, 2);
  assert.equal(record.followingRootActions[0].action, 'RetreatAction');
  assert.deepEqual(record.followingRootActions[0].afterOwnPosition.bench[0].energy,
    ['Double Dragon Energy ROS']);
  assert.equal(Object.getOwnPropertyDescriptor(Store.prototype, 'dispatch').value,
    previous.value);
});

test('observer restores the Store dispatch on error', () => {
  const {Store, store} = fixture();
  const original = Store.prototype.dispatch;
  assert.throws(() => withSourceDdeAttachmentTrace(Store, () => {
    store.dispatch(new AddPlayerAction());
    throw new Error('abort');
  }), /abort/);
  assert.strictEqual(Store.prototype.dispatch, original);
});

test('ownPosition reads only the acting player own public position', () => {
  const {store} = fixture();
  const a = ownPosition(store.state, 101);
  assert.equal(a.active.pokemon, 'Regidrago V SIT');
  assert.equal(a.bench[0].pokemon, 'Koraidon ex TEF');
  assert.equal(a.turn, 21);
});
