'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {withRank10SourceKoraidonFork}=require('../simulation/twinleaf/rank10-koraidon-source-attack-fork.cjs');
class AddPlayerAction {}
class PassTurnAction {constructor(clientId){this.clientId=clientId;}}
class AttackAction {constructor(clientId,name){this.clientId=clientId;this.name=name;}}
class Store {constructor(state){this.state=state;}dispatch(action){return action;}}
class Bot {constructor(){this.client={id:202};}decodeNextAction(){return new PassTurnAction(202);}}
const state=()=>({phase:2,turn:5,activePlayer:0,winner:-1,
  players:[{id:202,active:{getPokemonCard:()=>({fullName:'Koraidon ex TEF'}),
    energies:{cards:[{fullName:'Double Dragon Energy ROS'}]}}}]});
const types={Store,Bot,AttackAction};

test('single root Store source pass becomes printed Koraidon attack',()=>{
  const input=state(),store=new Store(input),bot=new Bot();
  const originalStore=Store.prototype.dispatch,originalBot=Bot.prototype.decodeNextAction;
  const result=withRank10SourceKoraidonFork(types,()=>{
    store.dispatch(new AddPlayerAction());
    return bot.decodeNextAction(input);
  },{forceAttack:true});
  assert.equal(result.result.name,'Retribution Strike');
  assert.equal(result.result.clientId,202);
  assert.equal(result.sourceDecisions.length,1);
  assert.equal(result.sourceDecisions[0].originalAction,'PassTurnAction');
  assert.equal(Store.prototype.dispatch,originalStore);
  assert.equal(Bot.prototype.decodeNextAction,originalBot);
});

test('read-only control uses identical source selection without forcing an attack',()=>{
  const input=state(),store=new Store(input),bot=new Bot();
  const control=withRank10SourceKoraidonFork(types,()=>{
    store.dispatch(new AddPlayerAction());return bot.decodeNextAction(input);
  },{forceAttack:false});
  const intervention=withRank10SourceKoraidonFork(types,()=>{
    store.dispatch(new AddPlayerAction());return bot.decodeNextAction(input);
  },{forceAttack:true});
  assert.equal(control.result.constructor.name,'PassTurnAction');
  assert.equal(control.sourceDecisions[0].stateDigest,intervention.sourceDecisions[0].stateDigest);
  assert.equal(control.sourceDecisions[0].selectedAttack,null);
  assert.equal(intervention.sourceDecisions[0].selectedAttack,'Retribution Strike');
});

test('unrelated stores are never affected',()=>{
  const input=state(),store=new Store(input),bot=new Bot();
  const report=withRank10SourceKoraidonFork(types,()=>{
    store.dispatch(new AddPlayerAction());
    return bot.decodeNextAction({...input});
  },{forceAttack:true});
  assert.equal(report.result.constructor.name,'PassTurnAction');
  assert.equal(report.sourceDecisions.length,0);
});
