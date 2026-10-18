'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {installHeadlessTelepathRootAudit} = require('../simulation/twinleaf/telepath-headless-root-audit.cjs');
class AttachEnergyEffect { constructor(player, energyCard) { this.player=player; this.energyCard=energyCard; } }
class Store { constructor(handler) {this.handler=handler;} dispatch(action) {return this.reduceEffect(action.state,action.effect);} reduceEffect(state) {return state;} }
class Simulator {onStateChange() {}}
const zone = (...cards) => ({cards});
function player() {return {deck:zone(),hand:zone(),discard:zone(),lostzone:zone(),active:zone(),bench:[]};}
test('root-only observer sees deck origin, excludes simulator and restores', () => {
 const a=player(),b=player(),energy={fullName:'Telepath [P] Energy M3'};a.deck.cards.push(energy);
 const state={players:[a,b],turn:2};const root=new Store({onStateChange(){}}),spec=new Store(new Simulator());
 const original=Store.prototype.dispatch, oldReduce=Store.prototype.reduceEffect;
 const observer=installHeadlessTelepathRootAudit({Store,AttachEnergyEffect});
 const action={state,effect:new AttachEnergyEffect(a,energy)};
 spec.dispatch(action);root.dispatch(action);spec.dispatch(action);
 assert.equal(observer.events.length,1);
 assert.deepEqual(observer.events[0].sourceZonesAtReducerEntry,['seat0.deck']);
 assert.equal(observer.events[0].playerSeat,0);
 observer.restore();
 assert.equal(Store.prototype.dispatch,original);
 assert.equal(Store.prototype.reduceEffect,oldReduce);
});
