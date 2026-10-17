'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withTurn29DeckOrderProbe}=
 require('../simulation/twinleaf/rank10-turn29-hidden-order-policy.cjs');

class AddPlayerAction{}
class OtherAction{}
class RetreatAction{}
class PassTurnAction{}
class Store{
 constructor(){
  this.state={turn:29,activePlayer:0,
   players:[{id:101,deck:{cards:[{name:'A'},{name:'B'},{name:'C'}]}}]};
  this.actions=[];
 }
 dispatch(action){this.actions.push(action.constructor.name);return action;}
}
class Bot{
 constructor(){this.client={id:101};}
 decodeNextAction(state){
  return state.players[0].deck.cards[0].name==='A'?
   new RetreatAction():new PassTurnAction();
 }
}
const digest=s=>s.players[0].deck.cards.map(c=>c.name).join(',');
const game=()=>{
 const store=new Store(),bot=new Bot();
 store.dispatch(new AddPlayerAction());
 for(let i=1;i<231;i++)store.dispatch(new OtherAction());
 const before=store.state.players[0].deck.cards.slice();
 const action=bot.decodeNextAction(store.state);
 assert.deepEqual(store.state.players[0].deck.cards,before);
 store.dispatch(action);
 return action.constructor.name;
};
test('temporary unseen draw order can affect a demonstrably peeking policy',()=>{
 const prevStore=Store.prototype.dispatch,prevBot=Bot.prototype.decodeNextAction;
 const first=withTurn29DeckOrderProbe(Store,Bot,game,{reverse:false,digest});
 const second=withTurn29DeckOrderProbe(Store,Bot,game,{reverse:true,digest});
 assert.equal(first.result,'RetreatAction');
 assert.equal(second.result,'PassTurnAction');
 assert.equal(first.decisions[0].sourceZoneUnchanged,true);
 assert.equal(second.decisions[0].sourceZoneUnchanged,true);
 assert.equal(second.decisions[0].sourceGraphUnchanged,true);
 assert.equal(first.decisions[0].changedOrder,false);
 assert.equal(second.decisions[0].changedOrder,true);
 assert.strictEqual(Store.prototype.dispatch,prevStore);
 assert.strictEqual(Bot.prototype.decodeNextAction,prevBot);
});
