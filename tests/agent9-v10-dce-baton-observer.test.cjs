'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {classifyOwnerDceBaton,withOwnerDceBatonObserver,
  GUZMA,SEEKER,DCE,THORNS,THUNDER}=
  require('../simulation/twinleaf/agent9-v10-dce-baton-observer.cjs');

/** @param {object} [change] @returns {object} */
function view(change={}){
  const v={
    decisionKind:'owner-root',actorSeat:0,globalTurn:4,
    ownHand:[GUZMA],
    ownPublic:{
      active:{printing:THORNS,energies:[]},
      bench:[{printing:THORNS,energies:[DCE]},null,null,null,null],
      stadium:[THUNDER],discard:[],
      publicTurnRestrictions:{supporterPlayLocked:false,
        itemPlayLocked:false,attackLockTurnsRemaining:0}
    },
    opponentPublic:{bench:[{printing:'Rotom V LOR'},null],stadium:[]},
    ownTurnResources:{supporterPlayedTurn:0,supporterPlayLocked:false,
      itemPlayLocked:false}
  };
  return {...v,...change};
}

test('paper-conditional direct and VS Seeker alternatives are classified independently',()=>{
  const direct=classifyOwnerDceBaton(view());
  assert.equal(direct.directlyOfferableGuzmaBaton,true);
  assert.equal(direct.possibleVsSeekerGuzmaBaton,false);
  assert.equal(direct.fundedBench[0].index,0);
  const via=classifyOwnerDceBaton(view({
    ownHand:[SEEKER],ownPublic:{...view().ownPublic,discard:[GUZMA]}
  }));
  assert.equal(via.directlyOfferableGuzmaBaton,false);
  assert.equal(via.possibleVsSeekerGuzmaBaton,true);
  assert.equal(via.discardGuzma,1);
});

test('paper-conditional vetoes require target, Stadium, quota, and legal controls',()=>{
  const base=view();
  const tests=[
    {opponentPublic:{bench:[],stadium:[]}},
    {ownPublic:{...base.ownPublic,stadium:[]}},
    {ownTurnResources:{...base.ownTurnResources,supporterPlayedTurn:1}},
    {ownPublic:{...base.ownPublic,
      publicTurnRestrictions:{...base.ownPublic.publicTurnRestrictions,
        attackLockTurnsRemaining:1}}},
    {ownPublic:{...base.ownPublic,bench:[null,null,null]}},
    {ownPublic:{...base.ownPublic,active:{printing:THORNS,energies:[DCE]}}}
  ];
  for(const changed of tests){
    const result=classifyOwnerDceBaton(view(changed));
    assert.equal(result.directlyOfferableGuzmaBaton,false,JSON.stringify(changed));
  }
}

/** @returns {object} */
function fixture(){
  class AddPlayerAction{}
  class AttackAction{constructor(clientId,name){this.clientId=clientId;this.name=name;}}
  class PassTurnAction{constructor(clientId){this.clientId=clientId;}}
  class SimpleTacticsAi{
    constructor(id){this.client={id};}
    decodeNextAction(state){
      if(this.client.id===101&&state.turn===4)
        state.players[0].supporterTurn=4;
      return new PassTurnAction(this.client.id);
    }
  }
  const state={turn:2,activePlayer:0,prompts:[],players:[
    {id:101,supporterTurn:0},
    {id:102,get hand(){throw new Error('OPPONENT_HIDDEN_HAND_READ');},
      get deck(){throw new Error('OPPONENT_HIDDEN_DECK_READ');}}
  ]};
  class Store{
    constructor(){this.state=state;this.actions=[];}
    dispatch(action){this.actions.push(action);return this.state;}
  }
  return {AddPlayerAction,AttackAction,PassTurnAction,
    SimpleTacticsAi,Store,state};
}

test('passive owner turn4 record observes source Volt and native quota mutation without editing action',()=>{
  const f=fixture(),s=new f.Store(),ai=new f.SimpleTacticsAi(101);
  const other=new f.SimpleTacticsAi(102);
  const oldStore=f.Store.prototype.dispatch;
  const oldAi=f.SimpleTacticsAi.prototype.decodeNextAction;
  const x=withOwnerDceBatonObserver(()=>{
    s.dispatch(new f.AddPlayerAction());
    const earlier=ai.decodeNextAction(f.state);
    assert.equal(earlier.constructor.name,'PassTurnAction');
    s.dispatch(new f.AttackAction(101,'Volt Cyclone'));
    f.state.turn=4;
    const ghost=other.decodeNextAction(f.state);
    assert.equal(ghost.constructor.name,'PassTurnAction');
    const actual=ai.decodeNextAction(f.state);
    assert.equal(actual.constructor.name,'PassTurnAction');
    assert.equal(f.state.players[0].supporterTurn,4);
    return 99;
  },{trialId:'source-test',Store:f.Store,SimpleTacticsAi:f.SimpleTacticsAi,
    observe:()=>view()});
  assert.equal(x.result,99);
  assert.equal(x.audit.liveStores,1);
  assert.equal(x.audit.sourceTurn2VoltDeclarations,1);
  assert.equal(x.audit.sourcePostVoltDecisionObservations,1);
  assert.equal(x.audit.directGuzmaCandidates,1);
  assert.equal(x.audit.nativePasses,1);
  assert.equal(x.audit.nativeSupporterQuotaMutationObservations,1);
  assert.deepEqual(x.audit.records[0].sourceOwnerHand,[GUZMA]);
  assert.equal(x.audit.records[0].nativeProposalChangedSupporterQuota,true);
  assert.equal(x.audit.changedAnyAction,false);
  assert.strictEqual(f.Store.prototype.dispatch,oldStore);
  assert.strictEqual(f.SimpleTacticsAi.prototype.decodeNextAction,oldAi);
});

test('no preceding paid source attack produces no post-Volt records',()=>{
  const f=fixture(),store=new f.Store(),ai=new f.SimpleTacticsAi(101);
  const x=withOwnerDceBatonObserver(()=>{
    store.dispatch(new f.AddPlayerAction());
    f.state.turn=4;
    return ai.decodeNextAction(f.state).constructor.name;
  },{Store:f.Store,SimpleTacticsAi:f.SimpleTacticsAi,observe:()=>view()});
  assert.equal(x.result,'PassTurnAction');
  assert.equal(x.audit.records.length,0);
});

test('native exception preserves audit and restores both originals',()=>{
  const f=fixture();
  const storePrior=f.Store.prototype.dispatch;
  const aiPrior=f.SimpleTacticsAi.prototype.decodeNextAction;
  assert.throws(()=>withOwnerDceBatonObserver(()=>{
    const store=new f.Store();
    store.dispatch(new f.AddPlayerAction());
    store.dispatch(new f.AttackAction(101,'Volt Cyclone'));
    throw new Error('NATIVE_TEST_ABORT');
  },{Store:f.Store,SimpleTacticsAi:f.SimpleTacticsAi,
    observe:()=>view()}),error=>{
    assert.match(error.message,/NATIVE_TEST_ABORT/);
    assert.equal(error.agent9BatonObserverAudit.sourceTurn2VoltDeclarations,1);
    return true;
  });
  assert.strictEqual(f.Store.prototype.dispatch,storePrior);
  assert.strictEqual(f.SimpleTacticsAi.prototype.decodeNextAction,aiPrior);
});
