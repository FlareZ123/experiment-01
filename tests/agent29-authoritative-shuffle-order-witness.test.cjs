'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withAuthoritativeShuffleOrderWitness}=
  require('../simulation/twinleaf/agent29-authoritative-shuffle-order-witness.cjs');

class AddPlayerAction {}
class ResolvePromptAction {
  constructor(id,result){this.id=id;this.result=result;}
}
class ShuffleDeckPrompt {
  constructor(playerId,sourceCard){
    this.id=41;this.playerId=playerId;this.sourceCard=sourceCard;
    this.result=undefined;
  }
  getPerspectivePlayerId(){return this.playerId;}
  validate(order,state){
    const length=state.players.find(p=>p.id===this.playerId).deck.cards.length;
    const copy=order.slice().sort();
    return copy.length===length&&copy.every((x,i)=>x===i);
  }
}
class Store {
  constructor(state){this.state=state;}
  dispatch(action){
    if(action instanceof ResolvePromptAction){
      const p=this.state.prompts.find(x=>x.id===action.id);
      if(!p)return this.state;
      p.result=action.result;
      const owner=this.state.players.find(x=>x.id===p.playerId);
      const before=owner.deck.cards.slice();
      const order=action.result;
      if(Array.isArray(order)&&order.length===before.length&&
        order.slice().sort((a,b)=>a-b).every((v,i)=>v===i)){
        owner.deck.cards=order.map(index=>before[index]);
      }
    }
    return this.state;
  }
}

/** @param {0|1} seat @param {number} count */
function fixture(seat,count){
  const source={id:100+seat,deck:{cards:Array.from(
    {length:count},(_,i)=>({physical:i}))}};
  const other={id:101-seat,deck:{cards:[]}};
  const players=seat===0?[source,other]:[other,source];
  const p=new ShuffleDeckPrompt(source.id,{fullName:'Battle Compressor PHF'});
  return {store:new Store({players,prompts:[p]}),source,p};
}

test('real owner 12-card numeric shuffle is observed despite native validate rejecting it',()=>{
  for(const seat of [0,1]){
    const {store,source,p}=fixture(seat,12);
    const order=[...Array(12).keys()].reverse();
    assert.equal(p.validate(order,store.state),false,
      'native lexicographic comparator rejects valid 12-entry permutation');
    const original=Store.prototype.dispatch;
    const observed=withAuthoritativeShuffleOrderWitness(()=>{
      store.dispatch(new AddPlayerAction());
      store.dispatch(new ResolvePromptAction(p.id,order));
      return source.deck.cards[0].physical;
    },{Store,ShuffleDeckPrompt});
    assert.equal(Store.prototype.dispatch,original);
    assert.equal(observed.result,11);
    assert.equal(observed.audit.sourceStampedShuffleDispatches,1);
    assert.equal(observed.audit.numericallyValid,1);
    assert.equal(observed.audit.physicallyAppliedExpectedOrder,1);
    assert.equal(observed.audit.events[0].ownerSeat,seat);
    assert.equal(observed.audit.events[0].shuffleLength,12);
  }
});

test('invalid duplicate shuffle answer is flagged even if native Store accepts prompt',()=>{
  const {store,p,source}=fixture(0,12);
  const before=source.deck.cards.slice();
  const observed=withAuthoritativeShuffleOrderWitness(()=>{
    store.dispatch(new AddPlayerAction());
    store.dispatch(new ResolvePromptAction(p.id,Array(12).fill(0)));
    return p.result.length;
  },{Store,ShuffleDeckPrompt});
  assert.equal(observed.result,12);
  assert.deepEqual(source.deck.cards,before);
  assert.equal(observed.audit.numericallyInvalid,1);
  assert.equal(observed.audit.physicallyUnchangedAfterInvalid,1);
  assert.equal(observed.audit.physicallyAppliedExpectedOrder,0);
});

test('non-source and speculative shuffle dispatch cannot enter source audit',()=>{
  const {store,p}=fixture(0,5);
  const foreign=fixture(0,5);
  foreign.p.sourceCard={fullName:'Ultra Ball SUM'};
  const seen=withAuthoritativeShuffleOrderWitness(()=>{
    store.dispatch(new AddPlayerAction());
    foreign.store.dispatch(new ResolvePromptAction(foreign.p.id,[4,3,2,1,0]));
    p.sourceCard={fullName:'Another Trainer'};
    store.dispatch(new ResolvePromptAction(p.id,[4,3,2,1,0]));
  },{Store,ShuffleDeckPrompt});
  assert.equal(seen.audit.sourceStampedShuffleDispatches,0);
});

test('dispatch prototype restoration survives thrown Store errors',()=>{
  const {store,p}=fixture(0,3);
  const original=Store.prototype.dispatch;
  assert.throws(()=>withAuthoritativeShuffleOrderWitness(()=>{
    store.dispatch(new AddPlayerAction());
    throw Error('native error');
  },{Store,ShuffleDeckPrompt}),/native error/);
  assert.equal(Store.prototype.dispatch,original);
  assert.equal(p.result,undefined);
});
