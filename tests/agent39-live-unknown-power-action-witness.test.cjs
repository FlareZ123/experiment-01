'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  VERSION,slotIdentity,withLiveUnknownPowerActionWitness
}=require('../simulation/twinleaf/agent39-live-unknown-power-action-witness.cjs');

class AddPlayerAction{
  constructor(id){this.id=id;}
}
class UseAbilityAction{
  constructor(id,abilityName,target){
    this.id=id;this.abilityName=abilityName;this.target=target;
  }
}
class FakeStore{
  constructor(){this.state={turn:8,phase:3};this.applied=[];}
  dispatch(action){
    if(action instanceof UseAbilityAction&&
      action.abilityName==='Underworld Door')throw Error('UNKNOWN_POWER');
    this.applied.push(action);
    return true;
  }
}
test('captures exact typed owner Ability rejection without changing dispatch',()=>{
  const real=new FakeStore(),clone=new FakeStore();
  const native=FakeStore.prototype.dispatch;
  const out=withLiveUnknownPowerActionWitness(()=>{
    real.dispatch(new AddPlayerAction(101));
    clone.dispatch(new UseAbilityAction(202,'Other Power',{
      player:1,slot:0,index:0
    }));
    assert.throws(()=>real.dispatch(new UseAbilityAction(101,
      'Underworld Door',{player:0,slot:1,index:0})),/UNKNOWN_POWER/);
    real.dispatch(new UseAbilityAction(101,'Energy Transport',{
      player:0,slot:1,index:1
    }));
    return 'same-native-replies';
  },{Store:FakeStore});
  assert.equal(out.result,'same-native-replies');
  assert.equal(out.audit.schema,VERSION);
  assert.equal(out.audit.liveDispatchCount,3);
  assert.equal(out.audit.auxiliaryAbilityDispatchCount,1);
  assert.equal(out.audit.abilityActions.length,2);
  assert.deepEqual(out.audit.abilityActions.map(x=>x.outcome),[
    'store-rejected','store-accepted']);
  assert.equal(out.audit.abilityActions[0].rejection,'UNKNOWN_POWER');
  assert.equal(out.audit.abilityActions[0].abilityName,'Underworld Door');
  assert.deepEqual(out.audit.abilityActions[0].target,
    {player:0,slot:1,index:0});
  assert.strictEqual(FakeStore.prototype.dispatch,native);
  assert.equal(real.applied.length,2);
  assert.equal(clone.applied.length,1);
});

test('disables positive identity assertion without genuine AddPlayerAction',()=>{
  const store=new FakeStore();
  const out=withLiveUnknownPowerActionWitness(()=>{
    assert.throws(()=>store.dispatch(new UseAbilityAction(202,
      'Underworld Door',{player:1,slot:0,index:0})),/UNKNOWN_POWER/);
  },{Store:FakeStore});
  assert.equal(out.audit.observedLiveStore,false);
  assert.equal(out.audit.abilityActions.length,0);
  assert.equal(out.audit.auxiliaryAbilityDispatchCount,1);
});

test('restores Store on exceptions and ignores non-public target fields',()=>{
  const store=new FakeStore(),original=FakeStore.prototype.dispatch;
  assert.deepEqual(slotIdentity({player:1,slot:0,index:2,hiddenCards:['x']}),
    {player:1,slot:0,index:2});
  assert.throws(()=>withLiveUnknownPowerActionWitness(()=>{
    store.dispatch(new AddPlayerAction(101));
    throw Error('outside Store');
  },{Store:FakeStore}),/outside Store/);
  assert.strictEqual(FakeStore.prototype.dispatch,original);
});

test('a second independent source game resets the genuine Store index',()=>{
  const first=new FakeStore(),second=new FakeStore();
  const out=withLiveUnknownPowerActionWitness(()=>{
    first.dispatch(new AddPlayerAction(101));
    assert.throws(()=>first.dispatch(new UseAbilityAction(101,'Underworld Door',
      {player:0,slot:1,index:2})),/UNKNOWN_POWER/);
    second.dispatch(new AddPlayerAction(101));
    assert.throws(()=>second.dispatch(new UseAbilityAction(101,'Underworld Door',
      {player:0,slot:1,index:1})),/UNKNOWN_POWER/);
  },{Store:FakeStore});
  assert.equal(out.audit.liveGameCount,2);
  assert.deepEqual(out.audit.abilityActions.map(x=>x.liveGameIndex),[0,1]);
  assert.deepEqual(out.audit.abilityActions.map(x=>x.ordinal),[2,2]);
});
