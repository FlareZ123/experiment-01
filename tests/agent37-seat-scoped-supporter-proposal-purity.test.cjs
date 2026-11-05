'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {withSeatScopedSupporterPurity}=
  require('../simulation/twinleaf/agent37-seat-scoped-supporter-proposal-purity.cjs');

const GamePhase={PLAYER_TURN:2};
const TrainerType={SUPPORTER:'supporter'};
class TrainerCard {
  constructor(name){this.fullName=name;this.trainerType=TrainerType.SUPPORTER;}
}
class PlayCardAction {
  constructor(clientId,handIndex){this.clientId=clientId;this.handIndex=handIndex;}
}
class AddPlayerAction {constructor(player){this.player=player;}}
class Store {
  constructor(){
    this.state={players:[],turn:12,activePlayer:0,
      phase:GamePhase.PLAYER_TURN,prompts:[]};
  }
  dispatch(action){
    if(action instanceof AddPlayerAction){
      this.state.players.push(action.player);
      return this.state;
    }
    if(action instanceof PlayCardAction){
      const player=this.state.players[this.state.activePlayer];
      assert.equal(player.supporterTurn,0,'Only real unspent Supporter allowed');
      player.supporterTurn=1;
      return this.state;
    }
    return this.state;
  }
}
class PlaySupporterTactic {
  useTactic(state,player){
    if(player.supporterTurn>0)return undefined;
    player.supporterTurn=state.turn;
    return new PlayCardAction(player.id,0);
  }
}
const deps={Store,PlaySupporterTactic,PlayCardAction,TrainerCard,
  TrainerType,GamePhase};
const player=id=>({id,supporterTurn:0,
  hand:{cards:[new TrainerCard('Guzma BUS')]}});
function fixture(){
  const store=new Store();
  store.dispatch(new AddPlayerAction(player(101)));
  store.dispatch(new AddPlayerAction(player(102)));
  return store;
}

for(const seat of [0,1]){
  test('Correct exactly physical seat '+seat+' and count live Store only',()=>{
    const a=withSeatScopedSupporterPurity(()=>{
      const store=fixture();
      store.state.activePlayer=seat;
      const owner=store.state.players[seat];
      const action=new PlaySupporterTactic().useTactic(store.state,owner);
      assert.equal(owner.supporterTurn,0);
      assert.ok(action instanceof PlayCardAction);
      const simulator=new Store();
      simulator.state={...store.state,players:store.state.players.map(x=>({
        ...x,hand:{cards:[...x.hand.cards]}
      }))};
      simulator.dispatch(action);
      assert.equal(owner.supporterTurn,0);
      store.dispatch(action);
      assert.equal(owner.supporterTurn,1);
      return true;
    },{...deps,correctSeats:[seat]});
    assert.equal(a.result,true);
    assert.equal(a.audit.quotaCorrections,1);
    assert.equal(a.audit.realStoreAccepted,1);
    assert.equal(a.audit.realStoreRejected,0);
    assert.deepEqual(a.audit.correctSeats,[seat]);
    assert.equal(a.audit.selected[0].seat,seat);
    assert.equal(a.audit.selected[0].storeQuotaAfter,1);
  });
  test('Seat '+seat+' remains native with other seat selected',()=>{
    const a=withSeatScopedSupporterPurity(()=>{
      const store=fixture();
      store.state.activePlayer=seat;
      const owner=store.state.players[seat];
      const proposed=new PlaySupporterTactic().useTactic(store.state,owner);
      assert.ok(proposed instanceof PlayCardAction);
      assert.equal(owner.supporterTurn,12);
      return true;
    },{...deps,correctSeats:[1-seat]});
    assert.equal(a.audit.quotaCorrections,0);
    assert.equal(a.audit.realStoreAccepted,0);
  });
}
test('Preexisting spent quota is preserved',()=>{
  const a=withSeatScopedSupporterPurity(()=>{
    const store=fixture();
    const p=store.state.players[0];
    p.supporterTurn=1;
    assert.equal(new PlaySupporterTactic().useTactic(store.state,p),undefined);
    assert.equal(p.supporterTurn,1);
    return true;
  },{...deps,correctSeats:[0,1]});
  assert.equal(a.audit.quotaCorrections,0);
});
test('A failing execution restores both prototype descriptors',()=>{
  const tactic=Object.getOwnPropertyDescriptor(PlaySupporterTactic.prototype,'useTactic');
  const store=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.throws(()=>withSeatScopedSupporterPurity(()=>{
    throw new Error('intentional fixture failure');
  },{...deps,correctSeats:[0]}),/intentional fixture failure/);
  assert.deepEqual(Object.getOwnPropertyDescriptor(PlaySupporterTactic.prototype,'useTactic'),tactic);
  assert.deepEqual(Object.getOwnPropertyDescriptor(Store.prototype,'dispatch'),store);
});
