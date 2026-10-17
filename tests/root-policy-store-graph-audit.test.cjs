'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withRootPolicyStoreGraphAudit}=
  require('../simulation/twinleaf/root-policy-store-graph-audit.cjs');
class AddPlayerAction {}
class PassTurnAction {}
class Store {
  constructor() {
    this.state={turn:3,players:[{cannotPlayToolCards:false}],logs:[]};
    this.handler={};
  }
  dispatch(action) {return action.constructor.name;}
}
class Bot {
  constructor(update=()=>{}) {this.update=update;}
  decodeNextAction(state) {this.update(state);return new PassTurnAction();}
}
function withProbe(update,side=()=>{}) {
  const live=new Store(),other=new Store(),bot=new Bot(update);
  const report=withRootPolicyStoreGraphAudit(Store,Bot,()=>{
    live.dispatch(new AddPlayerAction());
    bot.decodeNextAction(live.state);
    side(live,other,bot);
    return live.state.players[0].cannotPlayToolCards;
  });
  return {report,live,other,bot};
}
test('detects a live Store effect-field mutation beyond zone projection',()=>{
  const originalStore=Store.prototype.dispatch;
  const originalDecode=Bot.prototype.decodeNextAction;
  const {report}=withProbe(s=>{s.players[0].cannotPlayToolCards=true;});
  assert.equal(report.result,true);
  assert.equal(report.rootPolicyCalls,1);
  assert.equal(report.changes.length,1);
  assert.equal(typeof report.changes[0].firstDifference.path,'string');
  assert.equal(report.qualifiedForCompetitiveInference,false);
  assert.equal(Store.prototype.dispatch,originalStore);
  assert.equal(Bot.prototype.decodeNextAction,originalDecode);
});
test('speculative board changes are excluded from live Store mutation census',()=>{
  const {report}=withProbe(()=>{},(live,other,bot)=>{
    bot.update=s=>{s.players[0].cannotPlayToolCards=true;};
    bot.decodeNextAction(other.state);
  });
  assert.equal(report.rootPolicyCalls,1);
  assert.equal(report.otherPolicyCalls,1);
  assert.equal(report.changes.length,0);
});
test('restores method descriptors after a throwing policy',()=>{
  const originalStore=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  const originalDecode=Object.getOwnPropertyDescriptor(Bot.prototype,'decodeNextAction');
  assert.throws(()=>withProbe(()=>{throw new Error('simulated bot crash');}),/simulated bot crash/);
  assert.deepEqual(Object.getOwnPropertyDescriptor(Store.prototype,'dispatch'),originalStore);
  assert.deepEqual(Object.getOwnPropertyDescriptor(Bot.prototype,'decodeNextAction'),originalDecode);
});
