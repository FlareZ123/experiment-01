'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withOrdinalBotFingerprint}=require('../simulation/twinleaf/rank10-turn28-bot-fingerprint.cjs');
class AddPlayerAction{}
class RetreatAction{}
class Store{constructor(state){this.state=state;}dispatch(){return this.state;}}
class Bot{constructor(client){this.client=client;}decodeNextAction(state){state.calls++;return new RetreatAction();}}
const state=()=>({turn:28,activePlayer:1,players:[{id:101},{id:202}],calls:0});
const fingerprint=x=>({digest:JSON.stringify(x),nodes:1});
test('records mutation at exact root ordinal and restores hooks',()=>{
 const oldStore=Store.prototype.dispatch,oldBot=Bot.prototype.decodeNextAction;
 const store=new Store(state()),bot=new Bot({id:202});
 const out=withOrdinalBotFingerprint(Store,Bot,()=>{
  store.dispatch(new AddPlayerAction()); return bot.decodeNextAction(store.state);
 },{rootActionOrdinal:1,turn:28,seat:1,fingerprint});
 assert.ok(out.result instanceof RetreatAction);
 assert.equal(out.observations.length,1);
 assert.equal(out.observations[0].graphMutatedDuringBotChoice,true);
 assert.equal(out.observations[0].rootActionOrdinal,1);
 assert.equal(Store.prototype.dispatch,oldStore);
 assert.equal(Bot.prototype.decodeNextAction,oldBot);
});
test('wrong root ordinal does not capture an unrelated decision',()=>{
 const store=new Store(state()),bot=new Bot({id:202});
 const out=withOrdinalBotFingerprint(Store,Bot,()=>{
  store.dispatch(new AddPlayerAction());return bot.decodeNextAction(store.state);
 },{rootActionOrdinal:2,turn:28,seat:1,fingerprint});
 assert.equal(out.observations.length,0);
 assert.ok(out.result instanceof RetreatAction);
 assert.equal(store.state.calls,1);
});
