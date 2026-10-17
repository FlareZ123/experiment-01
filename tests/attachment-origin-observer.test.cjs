'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {primaryLocations, withAttachmentOriginObserver} =
  require('../simulation/twinleaf/attachment-origin-observer.cjs');

/** @param {object[]} [deck] */
function player(deck=[]) {
  return {
    deck: {cards: deck}, hand: {cards: []}, discard: {cards: []},
    lostzone: {cards: []}, stadium: {cards: []}, supporter: {cards: []},
    active: {cards: [], tools: []}, bench: [{cards: [], tools: []}],
    prizes: [{cards: []}]
  };
}
class AddPlayerAction {}
class PlayCardAction {}
class AttachEnergyEffect {
  constructor(player, energyCard, target) {
    this.player = player;
    this.energyCard = energyCard;
    this.target = target;
  }
}
class Store {
  constructor(state) { this.state = state; }
  dispatch() { return this.state; }
  reduceEffect(state, effect) {
    effect.target.cards.push(effect.energyCard);
    effect.target.energies.cards.push(effect.energyCard);
    return state;
  }
}

test('physical snapshot excludes derived Energy alias but includes actual tools', () => {
  const energy = {fullName: 'Psychic Energy'};
  const tool = {fullName: 'Powerglass'};
  const owner = player();
  owner.active.cards.push(energy);
  owner.active.energies = {cards: [energy]};
  owner.active.tools.push(tool);
  assert.deepEqual(primaryLocations({players:[owner]}, energy), ['seat0.active.cards']);
  assert.deepEqual(primaryLocations({players:[owner]}, tool), ['seat0.active.tools']);
});

test('root-only before/after origin detection and exact descriptor restoration', () => {
  const telepath = {fullName:'Telepath [P] Energy M3'};
  const owner = player([telepath]);
  const target = owner.bench[0];
  target.energies = {cards: []};
  target.getPokemonCard = () => ({fullName:'Mewtwo & Mew-GX UNM'});
  const source = {players:[owner], turn: 2};
  const root = new Store(source);
  const unrelated = new Store({players:[player()],turn:0});
  const before = {
    dispatch: Object.getOwnPropertyDescriptor(Store.prototype,'dispatch'),
    reduceEffect: Object.getOwnPropertyDescriptor(Store.prototype,'reduceEffect')
  };
  const {report} = withAttachmentOriginObserver({Store,AttachEnergyEffect}, () => {
    root.dispatch(new AddPlayerAction());
    root.dispatch(new PlayCardAction());
    root.reduceEffect(source,new AttachEnergyEffect(owner,telepath,target));
    unrelated.reduceEffect(unrelated.state,
      new AttachEnergyEffect(owner,telepath,target));
  });
  assert.equal(report.totalLiveEnergyAttachEffects,1);
  assert.equal(report.events.length,1);
  const event = report.events[0];
  assert.equal(event.ordinal,2);
  assert.equal(event.action,'PlayCardAction');
  assert.equal(event.fromHand,false);
  assert.deepEqual(event.sourcePrimaryLocations,['seat0.deck']);
  assert.deepEqual(event.afterPrimaryLocations,['seat0.deck','seat0.bench0.cards']);
  assert.equal(event.targetHasPhysicalCard,true);
  assert.equal(event.targetHasAttachedEnergy,true);
  assert.equal(event.sourceRetained,true);
  assert.deepEqual(Object.getOwnPropertyDescriptor(Store.prototype,'dispatch'),before.dispatch);
  assert.deepEqual(Object.getOwnPropertyDescriptor(Store.prototype,'reduceEffect'),before.reduceEffect);
});

test('ordinary hand-origin observation marks origin correctly and restores on errors', () => {
  const energy = {fullName:'Telepath [P] Energy M3'};
  const owner = player(); owner.hand.cards.push(energy);
  const target = owner.bench[0]; target.energies = {cards:[]};
  target.getPokemonCard = () => ({fullName:'Mewtwo & Mew-GX UNM'});
  const state = {players:[owner],turn:3};
  const store = new Store(state);
  const original = Object.getOwnPropertyDescriptor(Store.prototype,'reduceEffect');
  const run = withAttachmentOriginObserver({Store,AttachEnergyEffect}, () => {
    store.dispatch(new AddPlayerAction());
    return store.reduceEffect(state,new AttachEnergyEffect(owner,energy,target));
  });
  assert.equal(run.report.events[0].fromHand,true);
  assert.deepEqual(run.report.events[0].sourcePrimaryLocations,['seat0.hand']);
  assert.equal(run.report.events[0].sourceRetained,true);
  assert.deepEqual(Object.getOwnPropertyDescriptor(Store.prototype,'reduceEffect'),original);

  assert.throws(()=>withAttachmentOriginObserver({Store,AttachEnergyEffect},()=>{
    store.dispatch(new AddPlayerAction());
    throw new Error('deliberate rollback');
  }),/deliberate rollback/);
  assert.deepEqual(Object.getOwnPropertyDescriptor(Store.prototype,'reduceEffect'),original);
});
