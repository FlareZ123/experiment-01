'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withNativeSupporterTurnAudit}=
  require('../simulation/twinleaf/native-supporter-turn-audit.cjs');

const SUPPORTER=7;
const PLAYED_SUPPORTER=123;
class AddPlayerAction{}
class PlayCardAction{
  constructor(id,handIndex){this.id=id;this.handIndex=handIndex;}
}
class Store{
  constructor(){
    this.state={turn:2,logs:[],players:[
      {id:101,name:'Alice',hand:{cards:[]},supporter:{cards:[]},
        discard:{cards:[]},supporterTurn:0},
      {id:202,name:'Bob',hand:{cards:[
        {name:'Cynthia & Caitlin',fullName:'Cynthia & Caitlin CEC',
          trainerType:SUPPORTER},
        {name:'Sidney',fullName:'Sidney FST 241',
          trainerType:SUPPORTER},
        {name:'Crushing Hammer',fullName:'Crushing Hammer SVI',
          trainerType:4}
      ]},supporter:{cards:[]},discard:{cards:[]},supporterTurn:0}
    ]};
  }
  dispatch(action){
    if(!(action instanceof PlayCardAction))return;
    const player=this.state.players.find(p=>p.id===action.id);
    const card=player.hand.cards[action.handIndex];
    if(!card)throw new Error('Bad physical hand index');
    player.hand.cards.splice(action.handIndex,1);
    player.discard.cards.push(card);
    if(card.trainerType===SUPPORTER){
      player.supporterTurn++;
      this.state.logs.push({message:PLAYED_SUPPORTER,
        params:{name:player.name,card:card.name}});
    }
  }
}
const options={playSupporterLogMessage:PLAYED_SUPPORTER};

test('two fully settled same-turn native Supporters produce a confirmed repeat',()=>{
  const original=Store.prototype.dispatch;
  const {events,repeatPlays,result,unsettledPlays}=withNativeSupporterTurnAudit(
    Store,SUPPORTER,()=>{
      const store=new Store();
      store.dispatch(new AddPlayerAction());
      store.dispatch(new PlayCardAction(202,0));
      store.dispatch(new PlayCardAction(202,0));
      store.dispatch(new PlayCardAction(202,0));
      return store;
    },options
  );
  assert.strictEqual(Store.prototype.dispatch,original);
  assert.deepEqual(events.map(x=>x.name),[
    'Cynthia & Caitlin CEC','Sidney FST 241']);
  assert.deepEqual(events.map(x=>x.settled),[true,true]);
  assert.deepEqual(events.map(x=>x.supporterTurnAfter),[1,2]);
  assert.equal(repeatPlays.length,1);
  assert.equal(repeatPlays[0].seat,1);
  assert.equal(repeatPlays[0].turn,2);
  assert.equal(repeatPlays[0].cardInHandAfter,false);
  assert.deepEqual(repeatPlays[0].cardZonesAfter,['discard']);
  assert.equal(repeatPlays[0].supporterLogMatched,true);
  assert.equal(unsettledPlays.length,0);
  assert.equal(result.state.players[1].hand.cards.length,0);
});

test('Store return alone does not prove Supporter settlement',()=>{
  class NoOpStore extends Store{dispatch(action){
    if(action instanceof PlayCardAction)return;
    return super.dispatch(action);
  }}
  const observed=withNativeSupporterTurnAudit(NoOpStore,SUPPORTER,()=>{
    const store=new NoOpStore();store.dispatch(new AddPlayerAction());
    store.dispatch(new PlayCardAction(202,0));return store;
  },options);
  assert.equal(observed.events.length,1);
  assert.equal(observed.events[0].settled,false);
  assert.equal(observed.events[0].cardInHandAfter,true);
  assert.equal(observed.repeatPlays.length,0);
  assert.equal(observed.unsettledPlays.length,1);
});

test('hand removal without quota, log or effect settlement is not a repeated Supporter',()=>{
  class IncompleteStore extends Store{dispatch(action){
    if(action instanceof PlayCardAction){
      const owner=this.state.players.find(p=>p.id===action.id);
      owner.discard.cards.push(owner.hand.cards.splice(action.handIndex,1)[0]);
      return;
    }
    return super.dispatch(action);
  }}
  const observed=withNativeSupporterTurnAudit(IncompleteStore,SUPPORTER,()=>{
    const store=new IncompleteStore();store.dispatch(new AddPlayerAction());
    store.dispatch(new PlayCardAction(202,0));
    store.dispatch(new PlayCardAction(202,0));
  },options);
  assert.deepEqual(observed.events.map(x=>x.settled),[false,false]);
  assert.equal(observed.repeatPlays.length,0);
});

test('a missing printed Supporter log vetoes an otherwise quota-settled attempt',()=>{
  class MissingLogStore extends Store{dispatch(action){
    super.dispatch(action);
    this.state.logs.length=0;
  }}
  const observed=withNativeSupporterTurnAudit(MissingLogStore,SUPPORTER,()=>{
    const store=new MissingLogStore();store.dispatch(new AddPlayerAction());
    store.dispatch(new PlayCardAction(202,0));store.dispatch(new PlayCardAction(202,0));
  },options);
  assert.equal(observed.events.every(x=>x.quotaAdvanced),true);
  assert.equal(observed.events.every(x=>x.settled===false),true);
  assert.equal(observed.repeatPlays.length,0);
});

test('rejected Store plays do not count and all hooks restore',()=>{
  const original=Store.prototype.dispatch;
  assert.throws(()=>withNativeSupporterTurnAudit(Store,SUPPORTER,()=>{
    const store=new Store();
    store.dispatch(new AddPlayerAction());
    store.dispatch(new PlayCardAction(202,300));
  },options),/Bad physical hand index/);
  assert.strictEqual(Store.prototype.dispatch,original);
});

test('different owner turns have independent Supporter quotas',()=>{
  const observed=withNativeSupporterTurnAudit(Store,SUPPORTER,()=>{
    const store=new Store();store.dispatch(new AddPlayerAction());
    store.dispatch(new PlayCardAction(202,0));
    store.state.turn=4;
    store.state.players[1].supporterTurn=0;
    store.dispatch(new PlayCardAction(202,0));
    return store;
  },options);
  assert.equal(observed.events.length,2);
  assert.equal(observed.repeatPlays.length,0);
});
