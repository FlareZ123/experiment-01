'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withNativeSupporterTurnAudit}=require('../simulation/twinleaf/native-supporter-turn-audit.cjs');
const SUPPORTER=7;
class AddPlayerAction{}
class PlayCardAction{constructor(id,handIndex){this.id=id;this.handIndex=handIndex;}}
class Store{
  constructor(){this.state={turn:2,players:[{id:101,hand:{cards:[]},supporterTurn:0},{
    id:202,hand:{cards:[
      {fullName:'Cynthia & Caitlin CEC',trainerType:SUPPORTER},
      {fullName:'Sidney FST 241',trainerType:SUPPORTER},
      {fullName:'Crushing Hammer SVI',trainerType:4}
    ]},supporterTurn:0}]};}
  dispatch(action){
    if(action instanceof PlayCardAction){
      const player=this.state.players.find(p=>p.id===action.id);
      const card=player.hand.cards[action.handIndex];
      if(!card)throw new Error('Bad physical hand index');
      player.hand.cards.splice(action.handIndex,1);
    }
  }
}

test('observes accepted same-turn Supporters without modifying live game',()=>{
  const original=Store.prototype.dispatch;
  const {events,repeatPlays,result}=withNativeSupporterTurnAudit(
    Store,SUPPORTER,()=>{
      const store=new Store();
      store.dispatch(new AddPlayerAction());
      store.dispatch(new PlayCardAction(202,0));
      store.dispatch(new PlayCardAction(202,0));
      store.dispatch(new PlayCardAction(202,0));
      return store;
    }
  );
  assert.strictEqual(Store.prototype.dispatch,original);
  assert.deepEqual(events.map(x=>x.name),[
    'Cynthia & Caitlin CEC','Sidney FST 241']);
  assert.deepEqual(events.map(x=>x.count),[1,2]);
  assert.equal(repeatPlays.length,1);
  assert.equal(repeatPlays[0].seat,1);
  assert.equal(repeatPlays[0].turn,2);
  assert.equal(result.state.players[1].hand.cards.length,0);
});

test('rejected Store plays do not count and all hooks restore',()=>{
  const original=Store.prototype.dispatch;
  assert.throws(()=>withNativeSupporterTurnAudit(Store,SUPPORTER,()=>{
    const store=new Store();
    store.dispatch(new AddPlayerAction());
    store.dispatch(new PlayCardAction(202,300));
  }),/Bad physical hand index/);
  assert.strictEqual(Store.prototype.dispatch,original);
});

test('different owner turns maintain independent Supporter quotas',()=>{
  const observed=withNativeSupporterTurnAudit(Store,SUPPORTER,()=>{
    const store=new Store();
    store.dispatch(new AddPlayerAction());
    store.dispatch(new PlayCardAction(202,0));
    store.state.turn=4;
    store.dispatch(new PlayCardAction(202,0));
    return store;
  });
  assert.equal(observed.events.length,2);
  assert.equal(observed.repeatPlays.length,0);
});
