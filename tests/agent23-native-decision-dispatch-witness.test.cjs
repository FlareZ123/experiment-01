'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {actionIdentity,withNativeDecisionDispatchWitness}=
  require('../simulation/twinleaf/agent23-native-decision-dispatch-witness.cjs');
class AddPlayerAction {}
class PlayCardAction{
  constructor(handIndex,target){this.handIndex=handIndex;this.target=target;}
}
function fixture(mutate=false,reject=false){
  const state={turn:2,activePlayer:0,
    players:[{id:1},{id:2}],prompts:[]};
  class Store{
    constructor(){this.state=state;}
    dispatch(action){
      if(reject&&action instanceof PlayCardAction)throw Error('refused');
      return action;
    }
  }
  class SimpleTacticsAi{
    constructor(){this.client={id:1};}
    decodeNextAction(){return new PlayCardAction(0,{player:0,slot:0,index:1});}
  }
  const store=new Store(),bot=new SimpleTacticsAi();
  const run=()=>{
    store.dispatch(new AddPlayerAction());
    const action=bot.decodeNextAction(state);
    if(mutate)action.target.index=2;
    return store.dispatch(action);
  };
  return {Store,SimpleTacticsAi,run};
}
const codecs={
  captureAction:action=>({type:action.constructor.name,
    handIndex:action.handIndex,target:action.target}),
  capturePromptAction:()=>null
};
test('same card with different target has different digest',()=>{
  const a=actionIdentity(new PlayCardAction(0,{index:1}),{prompts:[]},codecs);
  const b=actionIdentity(new PlayCardAction(0,{index:2}),{prompts:[]},codecs);
  assert.equal(a.status,'captured');
  assert.notEqual(a.sha256,b.sha256);
});
test('original policy action reference and value reach real dispatch',()=>{
  const f=fixture();
  const prior=f.Store.prototype.dispatch;
  const r=withNativeDecisionDispatchWitness(f.run,{...f,...codecs});
  assert.equal(r.audit.matchedObjectDispatches,1);
  assert.equal(r.audit.boundedRecords[0].unchangedPortableInput,true);
  assert.equal(r.audit.verifiedUnchangedInputs,1);
  assert.equal(r.audit.unsupportedInputComparisons,0);
  assert.equal(r.audit.changedChoiceToDispatch,0);
  assert.equal(r.audit.boundedRecords[0].dispatchReturnedWithoutThrow,true);
  assert.strictEqual(f.Store.prototype.dispatch,prior);
});
test('mutation between decision and dispatch invalidates exact input',()=>{
  const f=fixture(true);
  const r=withNativeDecisionDispatchWitness(f.run,{...f,...codecs});
  assert.equal(r.audit.changedChoiceToDispatch,1);
  assert.equal(r.audit.unsupportedInputComparisons,0);
  assert.equal(r.audit.verifiedUnchangedInputs,0);
  assert.equal(r.audit.boundedRecords[0].unchangedPortableInput,false);
});
test('rejection preserves evidence and restores native hooks',()=>{
  const f=fixture(false,true),prior=f.Store.prototype.dispatch;
  let failure;
  try{withNativeDecisionDispatchWitness(f.run,{...f,...codecs});}
  catch(error){failure=error;}
  assert.match(failure.message,/refused/);
  assert.equal(failure.nativeDecisionDispatchEvidence.rejectedMatchedDispatches,1);
  assert.strictEqual(f.Store.prototype.dispatch,prior);
});
test('existing typed codec distinguishes native input targets',()=>{
  const {captureAction}=require('../simulation/twinleaf/source-action-value-codec.cjs');
  const left=actionIdentity(new PlayCardAction(1,{index:1}),{prompts:[]},
    {...codecs,captureAction});
  const right=actionIdentity(new PlayCardAction(1,{index:2}),{prompts:[]},
    {...codecs,captureAction});
  assert.equal(left.status,'captured');
  assert.notEqual(left.sha256,right.sha256);
});
test('unsupported nested engine class objects fail closed',()=>{
  const {captureAction}=require('../simulation/twinleaf/source-action-value-codec.cjs');
  const action=new PlayCardAction(0,{nested:new PlayCardAction(1,{})});
  assert.equal(actionIdentity(action,{prompts:[]},
    {...codecs,captureAction}).status,'unsupported');
});

test('scalar prompt result preserves exact native input and prompt kind',()=>{
  class ResolvePromptAction{
    constructor(id,result){this.id=id;this.result=result;}
  }
  class SelectPrompt{constructor(){this.id=5;this.result=undefined;}}
  const prompt=new SelectPrompt();
  const state={prompts:[prompt]};
  const {captureAction}=require('../simulation/twinleaf/source-action-value-codec.cjs');
  const first=actionIdentity(new ResolvePromptAction(5,1),state,{
    captureAction,capturePromptAction:()=>null
  });
  const second=actionIdentity(new ResolvePromptAction(5,2),state,{
    captureAction,capturePromptAction:()=>null
  });
  assert.equal(first.status,'captured');
  assert.equal(first.transport,'prompt-typed-values');
  assert.notEqual(first.sha256,second.sha256);
  assert.equal(actionIdentity(new ResolvePromptAction(4,1),state,{
    captureAction,capturePromptAction:()=>null
  }).status,'unsupported');
  assert.equal(actionIdentity(new ResolvePromptAction(5,1),{prompts:[]},{
    captureAction,capturePromptAction:()=>null
  }).status,'unsupported');
});

test('unsupported prompt input is unverified, not evidence of mutation',()=>{
  const f=fixture();
  f.run=()=> {
    const store=new f.Store();
    store.dispatch(new (class AddPlayerAction {})());
    const bot=new f.SimpleTacticsAi();
    const selected=bot.decodeNextAction(store.state);
    return store.dispatch(selected);
  };
  const r=withNativeDecisionDispatchWitness(f.run,{...f,
    captureAction:()=>{throw new TypeError('unsupported prompt');},
    capturePromptAction:()=>null});
  assert.equal(r.audit.unsupportedProposalInputs,1);
  assert.equal(r.audit.unsupportedInputComparisons,1);
  assert.equal(r.audit.changedChoiceToDispatch,0);
  assert.equal(r.audit.verifiedUnchangedInputs,0);
  assert.equal(r.audit.matchedObjectDispatches,1);
});

test('unexpected inner Store method overwrite still restores both native hooks',()=>{
  const f=fixture();
  const beforeDispatch=f.Store.prototype.dispatch;
  const beforeDecode=f.SimpleTacticsAi.prototype.decodeNextAction;
  assert.throws(()=>withNativeDecisionDispatchWitness(()=>{
    f.Store.prototype.dispatch=function displacedNativeDispatch(){};
  },{...f,...codecs}),/Nested policy hook ownership changed/);
  assert.strictEqual(f.Store.prototype.dispatch,beforeDispatch);
  assert.strictEqual(f.SimpleTacticsAi.prototype.decodeNextAction,beforeDecode);
});

test('one genuine owner action binds exact selected input to its native RNG tape',()=>{
  const f=fixture();
  f.SimpleTacticsAi.prototype.decodeNextAction=function randomTarget(){
    const roll=Math.random();
    return new PlayCardAction(0,{player:0,index:roll<0.5?1:2});
  };
  const savedRandom=Math.random;
  const witnessed=withNativeDecisionDispatchWitness(f.run,{
    ...f,...codecs,tapeOrdinal:1
  });
  assert.strictEqual(Math.random,savedRandom);
  assert.equal(witnessed.audit.originalLiveDecisions,1);
  assert.equal(witnessed.audit.nativePolicyTapes.length,1);
  const tape=witnessed.audit.nativePolicyTapes[0];
  assert.equal(tape.ordinal,1);
  assert.equal(tape.status,'original-live-decision');
  assert.equal(tape.values.length,1);
  assert.equal(tape.unchangedPortableInput,true);
  assert.equal(tape.dispatchReturnedWithoutThrow,true);
  assert.equal(tape.selectedAction.sha256,tape.dispatchAction.sha256);
  const {replayPolicyRandomTape,digest}=
    require('../simulation/twinleaf/native-policy-random-tape.cjs');
  assert.equal(tape.sha256,digest(tape.values));
  const replay=replayPolicyRandomTape(tape.values,()=>Math.random());
  assert.equal(replay.result,tape.values[0]);
  assert.equal(replay.consumed,1);
  assert.equal(witnessed.audit.sameWorldDecisionReplayQualified,false);
});

test('native RNG recorder stays off when not requested or ordinal is absent',()=>{
  const f=fixture();
  const noTape=withNativeDecisionDispatchWitness(f.run,{...f,...codecs});
  const missed=withNativeDecisionDispatchWitness(f.run,{
    ...f,...codecs,tapeOrdinal:2
  });
  assert.deepEqual(noTape.audit.nativePolicyTapes,[]);
  assert.deepEqual(missed.audit.nativePolicyTapes,[]);
  assert.equal(noTape.audit.verifiedUnchangedInputs,1);
  assert.equal(missed.audit.verifiedUnchangedInputs,1);
});
