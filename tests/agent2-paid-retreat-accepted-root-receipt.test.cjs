'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {createActualRootIdentityGuard}=require(
  '../simulation/twinleaf/agent2-root-identity-guard.cjs');
const {createPaidRetreatAcceptedRootReceipt}=require(
  '../simulation/twinleaf/agent2-paid-retreat-accepted-root-receipt.cjs');
const {withBilateralMultiBasicPaidRetreat}=require(
  '../simulation/twinleaf/agent2-bilateral-multi-basic-retreat-bot.cjs');

class PassTurnAction{constructor(clientId){this.clientId=clientId;}}
class RetreatAction{
  constructor(clientId,benchIndex){this.clientId=clientId;this.benchIndex=benchIndex;}
}
class SimpleTacticsAi{
  decodeNextAction(state){
    return new PassTurnAction(state.players[state.activePlayer].id);
  }
}
function state(){
  return {turn:33,activePlayer:0,players:[{id:101},{id:202}],prompts:[]};
}
function prepare(){
  const s=state(),store={state:s};
  const bots=[new SimpleTacticsAi(),new SimpleTacticsAi()];
  const guard=createActualRootIdentityGuard();
  const receipt=createPaidRetreatAcceptedRootReceipt();
  const request=guard.attach(receipt.attach({}));
  request.onRootStoreCreated(store);
  request.onRootAgentsCreated(bots);
  return {s,store,bots,guard,receipt,request};
}
function choose(f){
  return withBilateralMultiBasicPaidRetreat(
    ()=>f.bots[f.s.activePlayer].decodeNextAction(f.s),{
      SimpleTacticsAi,RetreatAction,catalog:{},
      observe:()=>({decisionKind:'owner-root',globalTurn:33,
        ownPublic:{active:{printing:'known'},deckCount:11},
        opponentPublic:{active:{printing:'known'},deckCount:20}}),
      choose:()=>({kind:'paid-retreat',benchIndex:0}),
      isActualRoot:f.guard.isActualRoot,
      onRetreatSelected:f.receipt.onRetreatSelected
    });
}

test('selected action requires actual root success rather than a fake dispatch',()=>{
  const f=prepare(),r=choose(f);
  assert.equal(r.result.constructor.name,'RetreatAction');
  assert.equal(f.receipt.audit.selectedProposals,1);
  assert.equal(f.receipt.audit.acceptedNativeProposals,0);
  f.request.onRootActionDispatched({state:f.s},r.result,155,0,33);
  f.request.onRootActionDispatched(f.store,new RetreatAction(101,0),155,0,33);
  assert.equal(f.receipt.audit.acceptedNativeProposals,0);
  f.request.onRootActionDispatched(f.store,r.result,155,0,33);
  assert.equal(f.receipt.audit.acceptedNativeProposals,1);
  assert.deepEqual(f.receipt.audit.receipts,[{
    actionOrdinal:155,actorSeat:0,turnBefore:33,actionName:'RetreatAction'
  }]);
  f.request.onRootActionDispatched(f.store,r.result,155,0,33);
  assert.equal(f.receipt.audit.acceptedNativeProposals,1);
});

test('native cross-seat mismatch invalidates join',()=>{
  const f=prepare(),r=choose(f);
  f.request.onRootActionDispatched(f.store,r.result,155,1,33);
  assert.equal(f.receipt.audit.acceptedNativeProposals,0);
  assert.equal(f.receipt.audit.invalidNativeJoins,1);
});

test('native cross-turn mismatch invalidates join',()=>{
  const f=prepare(),r=choose(f);
  f.request.onRootActionDispatched(f.store,r.result,155,0,34);
  assert.equal(f.receipt.audit.acceptedNativeProposals,0);
  assert.equal(f.receipt.audit.invalidNativeJoins,1);
});

test('new Store invalidates old proposed action',()=>{
  const f=prepare(),r=choose(f),next={state:state()};
  f.request.onRootStoreCreated(next);
  f.request.onRootAgentsCreated([new SimpleTacticsAi(),new SimpleTacticsAi()]);
  f.request.onRootActionDispatched(next,r.result,155,0,33);
  assert.equal(f.receipt.audit.acceptedNativeProposals,0);
});

test('selected bot and state must match actual registered root',()=>{
  const f=prepare(),a=new RetreatAction(101,0);
  assert.throws(()=>f.receipt.onRetreatSelected(new SimpleTacticsAi(),
    a,f.s,0),/genuine Store and bot/);
  assert.throws(()=>f.receipt.onRetreatSelected(f.bots[0],
    a,{...f.s},0),/genuine Store and bot/);
  assert.equal(f.receipt.audit.selectedProposals,0);
});

test('native dispatch callback composes with previously installed observer',()=>{
  const s=state(),store={state:s};
  const bots=[new SimpleTacticsAi(),new SimpleTacticsAi()];
  const seen=[],receipt=createPaidRetreatAcceptedRootReceipt();
  const req=receipt.attach({onRootActionDispatched:(...args)=>seen.push(args)});
  req.onRootStoreCreated(store);req.onRootAgentsCreated(bots);
  const action=new RetreatAction(101,0);
  receipt.onRetreatSelected(bots[0],action,s,0);
  req.onRootActionDispatched(store,action,5,0,33);
  assert.equal(seen.length,1);
  assert.strictEqual(seen[0][1],action);
  assert.equal(receipt.audit.acceptedNativeProposals,1);
});
