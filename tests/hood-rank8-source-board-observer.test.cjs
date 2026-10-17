'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withRank8BoardObserver}=require('../simulation/twinleaf/hood-rank8-source-board-observer.cjs');
const {condense,fullToolAction,sourceTurnSevenAction}=require('../simulation/twinleaf/hood-rank8-source-board-audit.cjs');

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

test('full public Tool projection preserves unrelated Bench slots and real attachment target',()=>{
  const card=(name,toolCards=[])=>({
    name,damage:0,energyCards:[],toolCards
  });
  const empty=card('Crobat V',['Float Stone']);
  const before={board:[
    {active:empty,bench:[card('Mega Absol ex'),card('Trubbish')],
      stadium:['Temple of Sinnoh']}
  ],actingHand:['Float Stone BKT','Quick Ball FST']};
  const after={board:[
    {active:empty,bench:[card('Mega Absol ex',['Float Stone']),card('Trubbish')],
      stadium:['Temple of Sinnoh']}
  ]};
  const projection=fullToolAction({ordinal:5,turn:7,actingSeat:0,
    action:'PlayCardAction',card:'Float Stone',
    before,after,dispatchError:null});
  assert.equal(projection.card,'Float Stone');
  assert.equal(projection.boardBefore.bench.length,2);
  assert.deepEqual(projection.boardBefore.bench[0].tools,[]);
  assert.deepEqual(projection.boardAfter.bench[0].tools,['Float Stone']);
  assert.deepEqual(projection.boardAfter.active.tools,['Float Stone']);
  assert.deepEqual(projection.boardAfter.bench[1].tools,[]);
  assert.equal(projection.error,null);
  console.log('Full-Board Tool target detected:',JSON.stringify(projection));
});

test('source turn-seven actor hand and prompt chronology is read-only and complete',()=>{
  class PlayCardAction {
    constructor(clientId,handIndex) {this.clientId=clientId;this.handIndex=handIndex;}
  }
  class FakeStore {
    constructor() {
      this.state={turn:7,activePlayer:0,phase:2,prompts:[],
        players:[
          player(101,'Mega Absol ex'),player(202,'Shadow Rider Calyrex VMAX')
        ]};
      this.state.players[0].hand.cards=[{name:'Iono',fullName:'Iono PAL'},
        {name:'Float Stone',fullName:'Float Stone BKT'}];
    }
    dispatch(action) {
      if(action instanceof PlayCardAction) {
        const own=this.state.players[0];
        const discarded=own.hand.cards.splice(action.handIndex,1);
        own.discard.cards.push(...discarded);
        if(discarded[0].name==='Iono') own.hand.cards=[
          {name:'Trubbish',fullName:'Trubbish PAR'},
          {name:'Garbodor',fullName:'Garbodor LTR'}
        ];
      }
      return this.state;
    }
  }
  const store=new FakeStore();
  const original=FakeStore.prototype.dispatch;
  const observed=withRank8BoardObserver(FakeStore,()=>{
    store.dispatch(new AddPlayerAction());
    store.dispatch(new PlayCardAction(101,0));
    return store.state.turn;
  });
  assert.equal(observed.result,7);
  assert.equal(FakeStore.prototype.dispatch,original);
  assert.equal(observed.records.length,1);
  assert.equal(observed.records[0].card,'Iono');
  const summary=sourceTurnSevenAction(observed.records[0]);
  assert.deepEqual(summary.beforeHand,['Iono PAL','Float Stone BKT']);
  assert.deepEqual(summary.afterHand,['Trubbish PAR','Garbodor LTR']);
  assert.equal(summary.beforeBoard.active.name,'Mega Absol ex');
  assert.deepEqual(summary.pendingPromptsBefore,[]);
  console.log('Source turn seven hand shift:',JSON.stringify(summary));
});
