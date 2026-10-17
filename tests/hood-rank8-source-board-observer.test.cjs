'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withRank8BoardObserver}=require('../simulation/twinleaf/hood-rank8-source-board-observer.cjs');
const {condense}=require('../simulation/twinleaf/hood-rank8-source-board-audit.cjs');

class AddPlayerAction {}
class AttackAction {
  constructor(clientId,name) {this.clientId=clientId;this.name=name;}
}

/** @param {string} name @param {number} damage */
function slot(name,damage=0) {
  return {getPokemonCard:()=>({name,attacks:[]}),
    damage,energies:{cards:[]},tools:[]};
}
function player(id,name,damage=0) {
  return {id,active:slot(name,damage),bench:[],stadium:{cards:[]},
    hand:{cards:[{name:'Darkness Energy',fullName:'Darkness Energy SVE'}]},
    discard:{cards:[]},prizes:Array.from({length:6},()=>({cards:[{}]}))};
}

test('tracks only real Store and preserves original dispatch implementation',()=>{
  class FakeStore {
    constructor() {
      this.state={turn:5,phase:2,activePlayer:0,prompts:[],
        players:[player(101,'Mega Absol ex'),player(202,'Shadow Rider Calyrex VMAX',60)]};
    }
    dispatch(action) {
      if(action instanceof AttackAction) this.state.turn+=1;
      return this.state.turn;
    }
  }
  const original=FakeStore.prototype.dispatch;
  const main=new FakeStore(), speculative=new FakeStore();
  const sample=withRank8BoardObserver(FakeStore,()=>{
    main.dispatch(new AddPlayerAction());
    speculative.dispatch(new AttackAction(101,'Terminal Period'));
    return main.dispatch(new AttackAction(101,'Terminal Period'));
  });
  assert.equal(sample.result,6);
  assert.equal(sample.liveDispatches,2);
  assert.equal(sample.records.length,1);
  assert.equal(sample.records[0].action,'AttackAction');
  assert.equal(sample.records[0].before.turn,5);
  assert.equal(sample.records[0].after.turn,6);
  assert.equal(sample.records[0].before.actingHand[0],'Darkness Energy SVE');
  assert.equal(FakeStore.prototype.dispatch,original);
  const event=condense(sample.records[0]);
  assert.equal(event.opponentActiveExactly60,true);
  assert.equal(event.visibleBefore.actor.active.name,'Mega Absol ex');
  assert.equal(event.visibleBefore.other.active.name,'Shadow Rider Calyrex VMAX');
  assert.equal(event.attackBefore.name,'Mega Absol ex');
  assert.equal(event.targetBefore.damage,60);
});

test('restores dispatch when a source match throws',()=>{
  class FakeStore {
    constructor() {this.state={players:[]};}
    dispatch() {throw Error('original test failure');}
  }
  const original=FakeStore.prototype.dispatch;
  assert.throws(()=>withRank8BoardObserver(FakeStore,()=>{
    new FakeStore().dispatch(new AddPlayerAction());
  }),/original test failure/);
  assert.equal(FakeStore.prototype.dispatch,original);
});
