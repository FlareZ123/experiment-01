'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withNativeEvolutionOpportunityAudit,VERSION}=
  require('../simulation/twinleaf/agent1-native-evolution-opportunity-audit.cjs');

class AddPlayerAction{}
class PassTurnAction{constructor(id){this.id=id;}}
class FakeStore{
  constructor(){
    this.state={
      phase:2,turn:3,activePlayer:0,prompts:[],
      players:[{id:10},{id:20}]
    };
    this.actions=[];
  }
  dispatch(action){
    this.actions.push(action.constructor.name);
    if(action instanceof PassTurnAction)this.state.turn++;
    return this.state;
  }
}

/** @returns {object} Detached owner information only. */
const ownView=()=>({
  decisionKind:'owner-root',
  ownHand:['Shadow Rider Calyrex VMAX CRE'],
  ownPublic:{
    active:{printing:'Trubbish FST'},
    deckCount:31
  }
});
const offer=()=>({
  kind:'evolve-pokemon',printing:'Shadow Rider Calyrex VMAX CRE',
  from:'Shadow Rider Calyrex V CRE',slot:'bench',index:0
});
const deps={
  Store:FakeStore,PassTurnAction,
  GamePhase:{PLAYER_TURN:2},
  catalog:{},
  observe:ownView,choose:offer
};

test('accepted real owner Pass is recorded without changing submitted action',()=>{
  const old=FakeStore.prototype.dispatch;
  const x=withNativeEvolutionOpportunityAudit(()=>{
    const store=new FakeStore();
    store.dispatch(new AddPlayerAction());
    const result=store.dispatch(new PassTurnAction(10));
    return {result,actions:store.actions};
  },deps);
  assert.strictEqual(FakeStore.prototype.dispatch,old);
  assert.equal(x.audit.version,VERSION);
  assert.equal(x.audit.actualGamesSeen,1);
  assert.equal(x.audit.realPassRoots,1);
  assert.equal(x.audit.eligiblePassRoots,1);
  assert.deepEqual(x.result.actions,['AddPlayerAction','PassTurnAction']);
  assert.equal(x.result.result.turn,4);
  assert.equal(x.audit.storedWitnesses[0].evolutionPrinting,
    'Shadow Rider Calyrex VMAX CRE');
  assert.equal(x.audit.qualification.counterfactualNativeLegal,false);
});

test('opponent, setup, pending prompt and non-live stores do not create witnesses',()=>{
  const x=withNativeEvolutionOpportunityAudit(()=>{
    const store=new FakeStore();
    store.dispatch(new AddPlayerAction());
    store.dispatch(new PassTurnAction(20));
    store.state.phase=1;
    store.dispatch(new PassTurnAction(10));
    store.state.phase=2;
    store.state.prompts=[{result:undefined}];
    store.dispatch(new PassTurnAction(10));
    const clone=new FakeStore();
    clone.dispatch(new PassTurnAction(10));
    return store.actions.length;
  },deps);
  assert.equal(x.audit.eligiblePassRoots,0);
  assert.equal(x.audit.realPassRoots,0);
});

test('ineligible visible evolution is reported as ordinary accepted Pass',()=>{
  const x=withNativeEvolutionOpportunityAudit(()=>{
    const store=new FakeStore();
    store.dispatch(new AddPlayerAction());
    store.dispatch(new PassTurnAction(10));
    return true;
  },{...deps,choose:()=>null});
  assert.equal(x.audit.realPassRoots,1);
  assert.equal(x.audit.decisionsConsidered,1);
  assert.equal(x.audit.eligiblePassRoots,0);
});

test('prototype restoration survives an executed workload exception',()=>{
  const old=FakeStore.prototype.dispatch;
  assert.throws(()=>withNativeEvolutionOpportunityAudit(()=>{
    const store=new FakeStore();store.dispatch(new AddPlayerAction());
    throw Error('Intentional test failure');
  },deps),/Intentional test failure/);
  assert.strictEqual(FakeStore.prototype.dispatch,old);
});
