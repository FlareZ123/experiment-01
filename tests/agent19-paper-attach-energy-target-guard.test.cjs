'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {sameTarget,withPaperAttachEnergyBlockedTo}=
  require('../simulation/twinleaf/agent19-paper-attach-energy-target-guard.cjs');

class AttachEnergyPrompt{
  constructor(id,blockedTo){
    this.id=id;this.result=undefined;this.options={blockedTo};
  }
}
class ResolvePromptAction{
  constructor(id,result){this.id=id;this.result=result;}
}
class FakeStore{
  constructor(prompt){
    this.state={prompts:[prompt]};
    this.nativeDispatches=[];
  }
  dispatch(action){
    this.nativeDispatches.push(action);
    return 'native-accepted';
  }
}
const crobat={player:0,slot:1,index:2};
const genesect={player:0,slot:1,index:0};
const dce={id:47,name:'Double Colorless Energy'};
const assign=to=>({card:dce,to});

test('paper blocked-to guard rejects illegal attachment before native dispatch',()=>{
  const store=new FakeStore(new AttachEnergyPrompt(55,[crobat]));
  const result=withPaperAttachEnergyBlockedTo(()=>{
    assert.throws(()=>store.dispatch(
      new ResolvePromptAction(55,[assign(crobat)])),
    {code:'PAPER_ATTACH_ENERGY_BLOCKED_TO'});
    assert.equal(store.nativeDispatches.length,0);
    assert.equal(store.dispatch(new ResolvePromptAction(
      55,[assign(genesect)])),'native-accepted');
    return 'done';
  },{Store:FakeStore});
  assert.equal(result.result,'done');
  assert.deepEqual(result.audit,{
    version:'agent19-paper-attach-energy-blocked-to-v1',
    inspected:2,rejected:1,nativeAccepted:1,
    correctedNativeGameQualified:false});
  assert.equal(FakeStore.prototype.dispatch.name,'dispatch');
});

test('target equality uses all three physical coordinates',()=>{
  assert.equal(sameTarget(crobat,{...crobat}),true);
  assert.equal(sameTarget(crobat,{...crobat,index:1}),false);
  assert.equal(sameTarget(crobat,{...crobat,player:1}),false);
  assert.equal(sameTarget(crobat,{...crobat,slot:2}),false);
});

test('unrelated actions and absent or resolved prompts pass through unchanged',()=>{
  const store=new FakeStore(new AttachEnergyPrompt(55,[crobat]));
  store.state.prompts[0].result=[];
  const result=withPaperAttachEnergyBlockedTo(()=>[
    store.dispatch(new ResolvePromptAction(55,[assign(crobat)])),
    store.dispatch({constructor:{name:'PassTurnAction'}})
  ],{Store:FakeStore});
  assert.deepEqual(result.result,['native-accepted','native-accepted']);
  assert.equal(result.audit.inspected,0);
  assert.equal(result.audit.nativeAccepted,1);
  assert.equal(store.nativeDispatches.length,2);
});

test('prototype restored on throw, without mutation of vendor class',()=>{
  const previous=FakeStore.prototype.dispatch;
  assert.throws(()=>withPaperAttachEnergyBlockedTo(()=>{
    throw Error('simulated test error');
  },{Store:FakeStore}),/simulated test error/);
  assert.strictEqual(FakeStore.prototype.dispatch,previous);
});
