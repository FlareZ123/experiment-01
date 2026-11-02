'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {
  withCandidateLillieAfterPass,
  withRegisteredCandidateLilliePanel,
  VERSION
}=require('../simulation/twinleaf/agent7-prospective-candidate-lillie-after-pass.cjs');

class PassTurnAction {constructor(clientId){this.clientId=clientId;}}
class AddPlayerAction {}
class PlayCardAction {
  constructor(clientId,handIndex,target){
    this.clientId=clientId;
    this.handIndex=handIndex;
    this.target=target;
  }
}
class FakeBot {
  constructor(id){this.client={id};}
  decodeNextAction(){return new PassTurnAction(this.client.id);}
}
class FakeStore {
  constructor(activePlayer=0){
    this.state={turn:4,activePlayer,
      players:[{id:101},{id:202}],prompts:[]};
  }
  dispatch(action){return action.constructor.name;}
}
const deps={
  bot:{SimpleTacticsAi:FakeBot},
  store:{Store:FakeStore},
  actions:{PlayCardAction,PlayerType:{ANY:'any'},SlotType:{BOARD:'board'}},
  observe:(state,seat)=>({
    decisionKind:'owner-root',globalTurn:state.turn,seat,
    ownHand:["Lillie's Determination M1L"],
    ownPublic:{deckCount:44}
  }),
  chooseLillie:view=>view.ownHand?.length?{
    kind:'play-lillie-shuffle-draw',handIndex:0,
    printing:"Lillie's Determination M1L"
  }:null,
  withNativeDrawAudit:execute=>({
    result:execute(),audit:{supportRoots:1,printedDrawConfirmed:1,
      events:[{seat:0,printedDrawPostcondition:true}]}
  })
};

for(const [slot,expectedSeat] of [['A',0],['B',1]]){
  test('only registered candidate seat '+slot+' sees owner Lillie rescue',()=>{
    const trial={id:'6:70:'+slot+':champion-reference',candidateSlot:slot};
    const x=withCandidateLillieAfterPass(()=>{
      const store=new FakeStore(expectedSeat);
      store.dispatch(new AddPlayerAction());
      const candidate=new FakeBot(expectedSeat===0?101:202);
      const other=new FakeBot(expectedSeat===0?202:101);
      const chosenCandidate=candidate.decodeNextAction(store.state);
      store.dispatch(chosenCandidate);
      const chosenOther=other.decodeNextAction(store.state);
      store.dispatch(chosenOther);
      return [chosenCandidate.constructor.name,chosenOther.constructor.name];
    },trial,deps);
    assert.deepEqual(x.result,['PlayCardAction','PassTurnAction']);
    assert.equal(x.audit.schema,VERSION);
    assert.equal(x.audit.proposed,1);
    assert.equal(x.audit.accepted,1);
    assert.equal(x.audit.rejected,0);
    assert.equal(x.audit.events[0].seat,expectedSeat);
    assert.equal(x.audit.originalSourcePolicyUntouched,true);
    assert.equal(x.audit.competitiveGameQualified,false);
  });
}

test('candidate not in player turn leaves original native decision unchanged',()=>{
  const trial={id:'test',candidateSlot:'A'};
  const x=withCandidateLillieAfterPass(()=>{
    const store=new FakeStore(1);
    store.dispatch(new AddPlayerAction());
    const candidate=new FakeBot(101);
    return candidate.decodeNextAction(store.state).constructor.name;
  },trial,deps);
  assert.equal(x.result,'PassTurnAction');
  assert.equal(x.audit.proposed,0);
});

test('a live Store is necessary; speculative Bot state cannot trigger override',()=>{
  const x=withCandidateLillieAfterPass(()=>{
    const a=new FakeStore();
    a.dispatch(new AddPlayerAction());
    const bot=new FakeBot(101);
    const clone=new FakeStore();
    return bot.decodeNextAction(clone.state).constructor.name;
  },{id:'test',candidateSlot:'A'},deps);
  assert.equal(x.result,'PassTurnAction');
  assert.equal(x.audit.proposed,0);
});

test('registered root proxy maps every experiment to exactly one frozen trial',()=>{
  const root={withActorOnlyRootPolicy:(run)=>({result:run(),audit:{}})};
  const prior=Object.getOwnPropertyDescriptor(root,'withActorOnlyRootPolicy');
  const trials=[
    {id:'a',candidateSlot:'A'},
    {id:'b',candidateSlot:'B'}
  ];
  const x=withRegisteredCandidateLilliePanel(()=>{
    return trials.map(t=>root.withActorOnlyRootPolicy(
      ()=>t.id).result);
  },trials,{root,runTrial:(run,trial)=>({
    result:run(),audit:{trialId:trial.id,proposed:0,accepted:0}
  })});
  assert.deepEqual(x.result,['a','b']);
  assert.equal(x.audit.rootCompositions,2);
  assert.deepEqual(x.audit.interventions.map(y=>y.trialId),['a','b']);
  assert.deepEqual(
    Object.getOwnPropertyDescriptor(root,'withActorOnlyRootPolicy'),prior);
});

test('root proxy restores original export after real execution rejection',()=>{
  const root={withActorOnlyRootPolicy:(run)=>({result:run(),audit:{}})};
  const prior=Object.getOwnPropertyDescriptor(root,'withActorOnlyRootPolicy');
  assert.throws(()=>withRegisteredCandidateLilliePanel(()=>{
    root.withActorOnlyRootPolicy(()=>{throw Error('real failure');});
  },[{id:'a',candidateSlot:'A'}],{root,runTrial:run=>({
    result:run(),audit:{}
  })}),/real failure/);
  assert.deepEqual(
    Object.getOwnPropertyDescriptor(root,'withActorOnlyRootPolicy'),prior);
});
