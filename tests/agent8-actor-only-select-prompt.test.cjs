'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,actorSelectPromptInput,chooseActorSelectPrompt,
  withActorOnlySelectPrompt}=
  require('../simulation/twinleaf/agent8-actor-only-select-prompt.cjs');

class SelectPrompt {
  constructor(playerId,id=19,values=['Yes','No'],allowCancel=false){
    this.playerId=playerId;
    this.id=id;
    this.values=values;
    this.result=undefined;
    this.message='CHOOSE_OPTION';
    this.options={allowCancel,defaultValue:1};
  }
  validate(){return true;}
}
class ResolvePromptAction {
  constructor(id,result){this.id=id;this.result=result;}
}
class AddPlayerAction {}
class Store {
  constructor(state){this.state=state;this.received=[];}
  dispatch(action) {
    this.received.push(action);
    if(action instanceof AddPlayerAction)return true;
    const target=this.state.prompts.find(p=>p.id===action.id && p.result===undefined);
    if(!target)throw new Error('No native owner prompt');
    target.result=action.result;
    return 'accepted';
  }
}
class SimpleTacticsAi {
  constructor(id){this.client={id};}
  decodeNextAction(){return 'UNQUALIFIED_GENERIC';}
}
const actor=(seat,turn=3)=>Object.freeze({
  decisionKind:'owner-prompt',actorSeat:seat,
  globalTurn:turn,ownHand:Object.freeze(['Own Energy PUBLIC'])
});

test('pure detached SelectPrompt includes offered choices and no concealed zones',()=>{
  const state={
    turn:3,players:[{id:101},{id:202}],
    prompts:[new SelectPrompt(202,19,['Discard Fire','Discard Lightning'])],
    forbiddenOpponentCards:['NEVER_EXPORT_ME']
  };
  const input=actorSelectPromptInput(state,1,(_,seat)=>actor(seat));
  assert.deepEqual(input.prompt,{
    kind:'SelectPrompt',id:19,message:'CHOOSE_OPTION',
    values:['Discard Fire','Discard Lightning'],
    defaultValue:1,allowCancel:false
  });
  assert.equal(JSON.stringify(input).includes('NEVER_EXPORT_ME'),false);
  assert.ok(Object.isFrozen(input));
  assert.ok(Object.isFrozen(input.prompt.values));
  assert.strictEqual(actorSelectPromptInput(state,0,(_,seat)=>actor(seat)),null);
});

test('pure policy chooses legal explicit default or first offered index',()=>{
  const input={actor:actor(0),prompt:{
    kind:'SelectPrompt',id:2,values:['A','B'],defaultValue:1,
    allowCancel:false
  }};
  assert.deepEqual(chooseActorSelectPrompt(input),{
    kind:'resolve-select',optionIndex:1
  });
  input.prompt.defaultValue=9;
  assert.deepEqual(chooseActorSelectPrompt(input),{
    kind:'resolve-select',optionIndex:0
  });
  input.prompt.values=[];
  input.prompt.allowCancel=true;
  assert.deepEqual(chooseActorSelectPrompt(input),{
    kind:'resolve-select',optionIndex:null
  });
  input.prompt.allowCancel=false;
  assert.throws(()=>chooseActorSelectPrompt(input),/no offered option/);
});

test('both physical owners select genuine typed indices on one Store',()=>{
  const state={turn:3,players:[{id:101},{id:202}],prompts:[]};
  const prior=SimpleTacticsAi.prototype.decodeNextAction;
  const priorDispatch=Store.prototype.dispatch;
  const observed=withActorOnlySelectPrompt(()=>{
    const store=new Store(state);
    store.dispatch(new AddPlayerAction());
    for(const [seat,id] of [[0,101],[1,202]]){
      state.prompts=[new SelectPrompt(id,seat+19,['A','B','C'])];
      const bot=new SimpleTacticsAi(id);
      const action=bot.decodeNextAction(state);
      assert.ok(action instanceof ResolvePromptAction);
      assert.equal(action.result,1);
      assert.equal(action.id,seat+19);
      assert.equal(store.dispatch(action),'accepted');
      assert.equal(state.prompts[0].result,1);
    }
    return store.received.length;
  },{Store,SimpleTacticsAi,ResolvePromptAction,
    observe:(state,seat)=>actorSelectPromptInput(state,seat,
      (_,realSeat)=>actor(realSeat))});
  assert.equal(observed.result,3);
  assert.equal(observed.audit.version,VERSION);
  assert.equal(observed.audit.selected,2);
  assert.equal(observed.audit.accepted,2);
  assert.equal(observed.audit.nativePromptPostconditionsConfirmed,2);
  assert.equal(observed.audit.nativePromptPostconditionsMissing,0);
  assert.equal(observed.audit.rejected,0);
  assert.deepEqual(observed.audit.bySeat,{0:1,1:1});
  assert.equal(observed.audit.liveStores,1);
  assert.equal(observed.audit.competitiveGameQualified,false);
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,prior);
  assert.strictEqual(Store.prototype.dispatch,priorDispatch);
});

test('off-store clone and prompt owned by the other seat remain delegated',()=>{
  const state={turn:4,players:[{id:101},{id:202}],
    prompts:[new SelectPrompt(202)]};
  const result=withActorOnlySelectPrompt(()=>{
    const store=new Store(state);
    store.dispatch(new AddPlayerAction());
    assert.equal(new SimpleTacticsAi(101).decodeNextAction(state),
      'UNQUALIFIED_GENERIC');
    assert.equal(new SimpleTacticsAi(202).decodeNextAction({...state}),
      'UNQUALIFIED_GENERIC');
    return 1;
  },{Store,SimpleTacticsAi,ResolvePromptAction,
    observe:(s,seat)=>actorSelectPromptInput(s,seat,
      (_,realSeat)=>actor(realSeat))});
  assert.equal(result.audit.selected,0);
  assert.equal(result.audit.unsupportedPromptFallbacks,0);
  assert.equal(result.audit.nonLiveFallbacks,1);
});

test('mandatory no-choice error unwinds all reversible wrappers',()=>{
  const state={turn:3,players:[{id:101},{id:202}],
    prompts:[new SelectPrompt(101,12,[])]};
  state.prompts[0].options.allowCancel=false;
  const bot=SimpleTacticsAi.prototype.decodeNextAction;
  const dispatch=Store.prototype.dispatch;
  assert.throws(()=>withActorOnlySelectPrompt(()=>{
    const store=new Store(state);
    store.dispatch(new AddPlayerAction());
    return new SimpleTacticsAi(101).decodeNextAction(state);
  },{Store,SimpleTacticsAi,ResolvePromptAction,
    observe:(s,seat)=>actorSelectPromptInput(s,seat,
      (_,realSeat)=>actor(realSeat))}),/no offered option/);
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,bot);
  assert.strictEqual(Store.prototype.dispatch,dispatch);
});

test('native Store acceptance without prompt settlement is explicitly unconfirmed',()=>{
  class NoOpStore extends Store {
    dispatch(action) {
      this.received.push(action);
      return 'accepted-but-did-not-reduce';
    }
  }
  const state={turn:6,players:[{id:101},{id:202}],
    prompts:[new SelectPrompt(101,19,['Choose A','Choose B'])]};
  const observed=withActorOnlySelectPrompt(()=>{
    const store=new NoOpStore(state);
    store.dispatch(new AddPlayerAction());
    const action=new SimpleTacticsAi(101).decodeNextAction(state);
    assert.ok(action instanceof ResolvePromptAction);
    assert.equal(store.dispatch(action),'accepted-but-did-not-reduce');
    assert.equal(state.prompts[0].result,undefined);
  },{SimpleTacticsAi,Store:NoOpStore,ResolvePromptAction,
    observe:(s,seat)=>actorSelectPromptInput(s,seat,
      (_,realSeat)=>actor(realSeat,6))});
  assert.equal(observed.audit.accepted,1);
  assert.equal(observed.audit.nativePromptPostconditionsConfirmed,0);
  assert.equal(observed.audit.nativePromptPostconditionsMissing,1);
  assert.equal(observed.audit.competitiveGameQualified,false);
});
