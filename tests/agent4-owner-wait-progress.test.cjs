'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseWaitProgress,withOwnerWaitProgress:wait}=require('../simulation/twinleaf/agent4-owner-wait-progress.cjs');
const {CODE,withNativeRawStateFallbackQuarantine:guard}=require('../simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');
class AddPlayerAction{}
class ResolvePromptAction{constructor(id,result){this.id=id;this.result=result;}}
class WaitPrompt{
  constructor(id,playerId){this.id=id;this.playerId=playerId;this.result=undefined;this.duration=500;}
  validate(value){return value===null;}
}
class OtherPrompt{constructor(id,playerId){this.id=id;this.playerId=playerId;this.result=undefined;}}
class Store{
  constructor(state){this.state=state;}
  dispatch(action){
    if(action instanceof ResolvePromptAction)this.state.prompts[0].result=action.result;
    return this.state;
  }
}
class Bot{
  constructor(id){this.client={id};this.nativeReads=0;}
  decodeNextAction(state){this.nativeReads++;return state.private;}
}
const deps={
  SimpleTacticsAi:Bot,Store,ResolvePromptAction,
  validate(state,action){
    assert.equal(state.prompts[0].id,action.id);
    assert.equal(state.prompts[0].validate(action.result),true);
  }
};
function setup(seat,type='Wait',secret=['hidden']){
  const id=seat===0?'zero':'one';
  const prompt=type==='Wait'?new WaitPrompt(7,id):new OtherPrompt(7,id);
  const store=new Store({players:[{id:'zero'},{id:'one'}],
    phase:8,turn:1,private:[...secret],prompts:[prompt]});
  return {store,bot:new Bot(id)};
}
test('pure wait is a null mechanical response',()=>{
  assert.deepEqual(chooseWaitProgress({kind:'WaitPrompt'}),{kind:'wait-progress',answer:null});
  assert.throws(()=>chooseWaitProgress({kind:'Other'}),{name:'AssertionError'});
});
test('both owners settle actual mock Store waits independently of hidden order',()=>{
  for(const seat of [0,1])for(const order of [['A','B'],['B','A']]){
    const {store,bot}=setup(seat,'Wait',order);
    const o=wait(()=>{
      store.dispatch(new AddPlayerAction());
      const action=bot.decodeNextAction(store.state);
      store.dispatch(action);
      return action.result;
    },deps);
    assert.equal(o.result,null);
    assert.equal(o.audit.accepted,1);
    assert.equal(o.audit.bySeat[seat],1);
    assert.equal(bot.nativeReads,0);
  }
});
test('unsupported prompt goes to outer quarantine without reading private cards',()=>{
  const {store,bot}=setup(1,'Other');
  assert.throws(()=>guard(()=>wait(()=>{
    store.dispatch(new AddPlayerAction());
    bot.decodeNextAction(store.state);
  },deps),{SimpleTacticsAi:Bot}),error=>{
    assert.equal(error.code,CODE);
    assert.equal(error.ownerWaitProgressAudit.selected,0);
    assert.equal(bot.nativeReads,0);
    return true;
  });
});
