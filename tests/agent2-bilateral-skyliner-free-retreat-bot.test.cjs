'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withBilateralSkylinerFreeRetreat:withRetreat}=require(
 '../simulation/twinleaf/agent2-bilateral-skyliner-free-retreat-bot.cjs');

function harness(cost){
  class PassTurnAction {}
  class RetreatAction{
    constructor(playerId,benchIndex){
      this.playerId=playerId;this.benchIndex=benchIndex;
    }
  }
  class Ai{
    decodeNextAction(){return new PassTurnAction();}
  }
  class CheckRetreatCostEffect{constructor(){this.cost=[9,9,9];}}
  class Store{
    constructor(){this.state=null;}
    reduceEffect(state,effect){effect.cost=[...cost];}
  }
  const state={turn:12,activePlayer:1,
    players:[{id:100},{id:200}],prompts:[],
    actorViews:[0,1].map(seat=>({decisionKind:'owner-root',seat,
      ownPublic:{active:{printing:'Synthetic Active'}},
      opponentPublic:{active:{printing:'Opponent Active'}}}))};
  const pick=()=>({kind:'skyliner-free-retreat',benchIndex:2,
    attackName:'Night Watch'});
  return {Ai,PassTurnAction,RetreatAction,CheckRetreatCostEffect,Store,
    state,pick};
}
test('native zero fee creates actual typed retreat and restores bot prototype',()=>{
  const h=harness([]);
  const original=h.Ai.prototype.decodeNextAction;
  const observed=withRetreat(()=>{
    const ai=new h.Ai();
    return ai.decodeNextAction(h.state);
  },{SimpleTacticsAi:h.Ai,RetreatAction:h.RetreatAction,
    Store:h.Store,CheckRetreatCostEffect:h.CheckRetreatCostEffect,
    catalog:{},observe:(state,seat)=>state.actorViews[seat],choose:h.pick});
  assert.ok(observed.result instanceof h.RetreatAction);
  assert.equal(observed.result.playerId,200);
  assert.equal(observed.result.benchIndex,2);
  assert.deepEqual(observed.audit.originalPassesBySeat,[0,1]);
  assert.deepEqual(observed.audit.nativeZeroCostBySeat,[0,1]);
  assert.deepEqual(observed.audit.typedRetreatProposalsBySeat,[0,1]);
  assert.strictEqual(h.Ai.prototype.decodeNextAction,original);
});
test('native nonzero fee vetoes actor proposal without rewriting original Pass',()=>{
  const h=harness([9]);
  const original=h.Ai.prototype.decodeNextAction;
  const observed=withRetreat(()=>new h.Ai().decodeNextAction(h.state),{
    SimpleTacticsAi:h.Ai,RetreatAction:h.RetreatAction,
    Store:h.Store,CheckRetreatCostEffect:h.CheckRetreatCostEffect,
    catalog:{},observe:(state,seat)=>state.actorViews[seat],choose:h.pick
  });
  assert.ok(observed.result instanceof h.PassTurnAction);
  assert.deepEqual(observed.audit.nativeNonzeroCostVetoBySeat,[0,1]);
  assert.strictEqual(h.Ai.prototype.decodeNextAction,original);
});
test('first turn cannot be rewritten',()=>{
  const h=harness([]);h.state.turn=1;
  const observed=withRetreat(()=>new h.Ai().decodeNextAction(h.state),{
    SimpleTacticsAi:h.Ai,RetreatAction:h.RetreatAction,
    Store:h.Store,CheckRetreatCostEffect:h.CheckRetreatCostEffect,
    catalog:{},observe:(state,seat)=>state.actorViews[seat],choose:h.pick
  });
  assert.ok(observed.result instanceof h.PassTurnAction);
  assert.deepEqual(observed.audit.originalPassesBySeat,[0,0]);
});
test('both physical seats use same hook without rank checks',()=>{
  const h=harness([]),states=[0,1].map(seat=>({...h.state,
    activePlayer:seat}));
  const observed=withRetreat(()=>{
    const ai=new h.Ai();
    return states.map(s=>ai.decodeNextAction(s));
  },{SimpleTacticsAi:h.Ai,RetreatAction:h.RetreatAction,
    Store:h.Store,CheckRetreatCostEffect:h.CheckRetreatCostEffect,
    catalog:{},observe:(state,seat)=>state.actorViews[seat],choose:h.pick});
  assert.ok(observed.result.every(x=>x instanceof h.RetreatAction));
  assert.deepEqual(observed.audit.typedRetreatProposalsBySeat,[1,1]);
});
