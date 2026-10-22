'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withAcceptedEnergyPromptPublicWitness,VERSION}=
  require('../simulation/twinleaf/accepted-energy-prompt-public-witness.cjs');

class AddPlayerAction {}
class ResolvePromptAction {constructor(result){this.result=result;}}
class AttachEnergyPrompt {
  constructor(id,owner){this.id=id;this.playerId=owner;this.result=undefined;}
}
class OtherPrompt {
  constructor(id,owner){this.id=id;this.playerId=owner;this.result=undefined;}
}
function slot(name){return {
  pokemon:{fullName:name},energies:{cards:[]},tools:[],
  getPokemonCard(){return this.pokemon;}
};}
class FakeStore {
  constructor(target=0,promptClass=AttachEnergyPrompt){
    const p=(id,name)=>({id,active:slot(name),
      bench:[slot('Crobat V'),slot('Mega Absol ex')]});
    this.target=target;
    this.state={phase:3,turn:53,players:[
      p(100,'Squawkabilly ex'),p(200,'Mewtwo & Mew-GX')],
      prompts:[new promptClass(135,100)]};
  }
  dispatch(action){
    if(action instanceof ResolvePromptAction){
      const prompt=this.state.prompts[0];
      prompt.result=true;
      if(prompt instanceof AttachEnergyPrompt){
        const to=this.state.players[0].bench[this.target];
        to.energies.cards.push(
          {fullName:'Darkness Energy'},{fullName:'Darkness Energy'});
      }
    }
  }
}
/** @param {number} target @param {Function} [promptClass] */
function run(target,promptClass){
  return withAcceptedEnergyPromptPublicWitness(()=>{
    const store=new FakeStore(target,promptClass);
    store.dispatch(new AddPlayerAction());
    store.dispatch(new ResolvePromptAction([{secret:'never store me'}]));
    return {rootActionLedger:[{action:'AttackAction',attack:'Motivate'},
      {action:'ResolvePromptAction'}]};
  },{Store:FakeStore});
}

test('equal root labels, different native prompt Energy recipients become visible',()=>{
  const a=run(0),b=run(1);
  assert.deepEqual(a.result.rootActionLedger,b.result.rootActionLedger);
  assert.equal(a.audit.schema,VERSION);
  assert.equal(a.audit.acceptedEnergyPromptResolutions,1);
  assert.equal(b.audit.acceptedEnergyPromptResolutions,1);
  assert.notEqual(a.audit.sha256,b.audit.sha256);
  assert.deepEqual(a.audit.events[0].publicChanges.map(x=>x.index),[0]);
  assert.deepEqual(b.audit.events[0].publicChanges.map(x=>x.index),[1]);
  assert.equal(a.audit.events[0].promptId,135);
  assert.equal(a.audit.events[0].playerSlot,0);
  assert.equal(a.audit.acceptedPromptTargetsFullyCertified,false);
  for(const evidence of [a.audit,b.audit])
    assert.equal(JSON.stringify(evidence).includes('never store me'),false);
});

test('other native prompt types are omitted and Store method restored',()=>{
  const original=Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch');
  const trial=run(0,OtherPrompt);
  assert.equal(trial.audit.acceptedEnergyPromptResolutions,0);
  assert.deepEqual(
    Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch'),original);
});

test('later native exception retains partial accepted public prompt evidence',()=>{
  const original=Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch');
  assert.throws(()=>withAcceptedEnergyPromptPublicWitness(()=>{
    const store=new FakeStore();
    store.dispatch(new AddPlayerAction());
    store.dispatch(new ResolvePromptAction([]));
    throw new Error('subsequent Store failure');
  },{Store:FakeStore}),error=>{
    assert.equal(
      error.acceptedEnergyPromptPublicEvidence.acceptedEnergyPromptResolutions,1);
    assert.equal(
      error.acceptedEnergyPromptPublicEvidence.competitiveGameQualified,false);
    return true;
  });
  assert.deepEqual(
    Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch'),original);
});

test('settlement with no immediate board change is explicitly unobserved',()=>{
  class DelayedStore extends FakeStore {
    dispatch(action){
      if(action instanceof ResolvePromptAction)
        this.state.prompts[0].result=true;
    }
  }
  const trial=withAcceptedEnergyPromptPublicWitness(()=>{
    const store=new DelayedStore();
    store.dispatch(new AddPlayerAction());
    store.dispatch(new ResolvePromptAction([]));
  },{Store:DelayedStore});
  assert.equal(trial.audit.publicDeltaUnobserved,1);
  assert.equal(trial.audit.publiclyChangedResolutions,0);
});
