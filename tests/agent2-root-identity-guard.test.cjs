'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {createActualRootIdentityGuard}=require(
  '../simulation/twinleaf/agent2-root-identity-guard.cjs');
const {withBilateralMultiBasicPaidRetreat}=require(
  '../simulation/twinleaf/agent2-bilateral-multi-basic-retreat-bot.cjs');

class PassTurnAction{constructor(clientId){this.clientId=clientId;}}
class RetreatAction{
  constructor(clientId,benchIndex){
    this.clientId=clientId;
    this.benchIndex=benchIndex;
  }
}
class SimpleTacticsAi{
  decodeNextAction(state){
    return new PassTurnAction(state.players[state.activePlayer].id);
  }
}
const view=()=>({decisionKind:'owner-root',globalTurn:12,
  ownPublic:{active:{printing:'test active'},deckCount:8},
  opponentPublic:{active:{printing:'test target'},deckCount:28}});
const choose=()=>({kind:'paid-retreat',benchIndex:0,retreatCostUnits:2});
const state=()=>({turn:12,activePlayer:0,
  players:[{id:101},{id:202}],prompts:[]});
function run(root,work){
  return withBilateralMultiBasicPaidRetreat(work,{
    SimpleTacticsAi,RetreatAction,observe:view,choose,catalog:{},
    isActualRoot:root.isActualRoot
  });
}

test('unregistered owner Pass stays Pass, without accidental offer or audit',()=>{
  const guard=createActualRootIdentityGuard();
  const bot=new SimpleTacticsAi(),s=state();
  const r=run(guard,()=>bot.decodeNextAction(s));
  assert.equal(r.result.constructor.name,'PassTurnAction');
  assert.deepEqual(r.audit.originalPassesBySeat,[0,0]);
  assert.deepEqual(r.audit.rejectedNonRootPassesBySeat,[1,0]);
  assert.deepEqual(r.audit.chosenTypedRetreatsBySeat,[0,0]);
  assert.equal(guard.audit.acceptedChecks,0);
});

test('registered physical owner decisions for both seats alone may retreat',()=>{
  const guard=createActualRootIdentityGuard(),s=state();
  const realStore={state:s},registered=[new SimpleTacticsAi(),new SimpleTacticsAi()];
  const req=guard.attach({seed:17});
  req.onRootStoreCreated(realStore);
  req.onRootAgentsCreated(registered);
  const out=run(guard,()=>{
    const actions=[];
    const speculativeBot=new SimpleTacticsAi();
    actions.push(speculativeBot.decodeNextAction(s));
    actions.push(registered[0].decodeNextAction({...s}));
    actions.push(registered[0].decodeNextAction(s));
    s.activePlayer=1;
    actions.push(registered[1].decodeNextAction(s));
    actions.push(registered[0].decodeNextAction(s));
    return actions;
  });
  assert.deepEqual(out.result.map(x=>x.constructor.name),
    ['PassTurnAction','PassTurnAction','RetreatAction',
      'RetreatAction','PassTurnAction']);
  assert.deepEqual(out.audit.originalPassesBySeat,[1,1]);
  assert.deepEqual(out.audit.rejectedNonRootPassesBySeat,[2,1]);
  assert.deepEqual(out.audit.chosenTypedRetreatsBySeat,[1,1]);
  assert.equal(guard.audit.acceptedChecks,2);
  assert.equal(guard.audit.rejectedChecks,3);
});

test('a speculative Store sharing state object does not confer bot identity',()=>{
  const guard=createActualRootIdentityGuard(),s=state();
  const bots=[new SimpleTacticsAi(),new SimpleTacticsAi()];
  const rootStore={state:s};
  const req=guard.attach({});
  req.onRootStoreCreated(rootStore);
  req.onRootAgentsCreated(bots);
  const copiedState={...s},foreignBot=new SimpleTacticsAi();
  assert.equal(guard.isActualRoot(foreignBot,s,0),false);
  assert.equal(guard.isActualRoot(bots[0],copiedState,0),false);
  assert.equal(guard.isActualRoot(bots[1],s,0),false);
  assert.equal(guard.isActualRoot(bots[0],s,0),true);
});

test('new game Store registration invalidates prior bot registrations',()=>{
  const guard=createActualRootIdentityGuard(),s=state();
  const bots=[new SimpleTacticsAi(),new SimpleTacticsAi()];
  const req=guard.attach({});
  req.onRootStoreCreated({state:s});
  req.onRootAgentsCreated(bots);
  assert.equal(guard.isActualRoot(bots[0],s,0),true);
  const replacement=state();
  req.onRootStoreCreated({state:replacement});
  assert.equal(guard.isActualRoot(bots[0],replacement,0),false);
  req.onRootAgentsCreated([new SimpleTacticsAi(),new SimpleTacticsAi()]);
  assert.equal(guard.isActualRoot(bots[0],replacement,0),false);
});

test('existing observer callbacks compose without reading private fields',()=>{
  const calls=[],s=state(),bots=[new SimpleTacticsAi(),new SimpleTacticsAi()];
  const guard=createActualRootIdentityGuard();
  const req=guard.attach({label:'keep',onRootStoreCreated:()=>calls.push('store'),
    onRootAgentsCreated:()=>calls.push('agents')});
  assert.equal(req.label,'keep');
  req.onRootStoreCreated({state:s});
  req.onRootAgentsCreated(bots);
  assert.deepEqual(calls,['store','agents']);
  assert.equal(guard.isActualRoot(bots[1],s,1),true);
  assert.equal(guard.audit.rootStoreRegistrations,1);
  assert.equal(guard.audit.rootAgentRegistrations,1);
});

test('invalid registration order fails closed',()=>{
  const guard=createActualRootIdentityGuard();
  assert.throws(()=>guard.attach({}).onRootAgentsCreated([{},{}]),
    /Store must be registered/);
  assert.throws(()=>guard.attach({onRootStoreCreated:true}),
    /function/);
  assert.throws(()=>guard.attach({onRootAgentsCreated:42}),
    /function/);
});

test('baseline wrapper remains default-off and accepts historical pure Pass',()=>{
  const s=state(),bot=new SimpleTacticsAi();
  const r=withBilateralMultiBasicPaidRetreat(()=>bot.decodeNextAction(s),{
    SimpleTacticsAi,RetreatAction,observe:view,choose,catalog:{}
  });
  assert.equal(r.result.constructor.name,'RetreatAction');
  assert.equal(r.audit.rootIdentityGuardEnabled,false);
  assert.deepEqual(r.audit.rejectedNonRootPassesBySeat,[0,0]);
});
