'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withAcceptedTargetWitness,acceptedTargetAbortEvidence}=
  require('../simulation/twinleaf/native-accepted-target-store-observer.cjs');
const {withAcceptedEnergyPromptPublicWitness,
  acceptedEnergyPromptPublicAbortEvidence}=
  require('../simulation/twinleaf/accepted-energy-prompt-public-witness.cjs');

class AddPlayerAction {}
class PlayCardAction {
  /** @param {number} handIndex @param {object} target */
  constructor(handIndex,target){this.handIndex=handIndex;this.target=target;this.clientId=100;}
}
class ResolvePromptAction {
  /** @param {unknown} result */
  constructor(result){this.result=result;}
}
class AttachEnergyPrompt {
  constructor(){this.id=135;this.playerId=100;this.result=undefined;}
}
/** @param {string} name */
function slot(name){
  return {
    pokemon:{fullName:name},energies:{cards:[]},tools:[],
    getPokemonCard(){return this.pokemon;}
  };
}
class FakeStore {
  /** @param {number} promptBenchIndex */
  constructor(promptBenchIndex){
    this.promptBenchIndex=promptBenchIndex;
    this.state={phase:3,turn:7,players:[
      {id:100,hand:{cards:[{fullName:'Darkness Energy SVE 7'}]},
        active:slot('Garbodor BKP 57'),
        bench:[slot('Crobat V DAA 104'),slot('Mega Absol ex M2 24')]},
      {id:200,active:slot('Meloetta FST 124'),
        bench:[slot('Duskull VIV 69')]}
    ],prompts:[]};
    for(const zone of ['hand','deck','prizes']){
      Object.defineProperty(this.state.players[1],zone,{get(){
        throw Error('Observer read concealed opponent '+zone);
      }});
    }
  }
  /** @param {object} action */
  dispatch(action){
    if(action instanceof PlayCardAction){
      const card=this.state.players[0].hand.cards.shift();
      this.state.players[0].active.energies.cards.push(card);
      this.state.prompts.push(new AttachEnergyPrompt());
    }
    if(action instanceof ResolvePromptAction){
      this.state.prompts[0].result=action.result;
      this.state.players[0].bench[this.promptBenchIndex]
        .energies.cards.push({fullName:'Darkness Energy SVE 7'});
    }
  }
}
/**
 * Both native hooks must observe the same physical Store without reordering
 * the original actions or reading an opponent's hidden hand/deck/Prizes.
 * @param {number} promptBenchIndex
 * @param {boolean} [failAfterPrompt]
 */
function run(promptBenchIndex,failAfterPrompt=false){
  let energySidecar=null;
  const witnessed=withAcceptedTargetWitness(()=>{
    const resolved=withAcceptedEnergyPromptPublicWitness(()=>{
      const store=new FakeStore(promptBenchIndex);
      store.dispatch(new AddPlayerAction());
      store.dispatch(new PlayCardAction(0,{player:2,slot:1,index:0}));
      store.dispatch(new ResolvePromptAction([]));
      if(failAfterPrompt)throw Error('subsequent game exception');
      return {rootActionLedger:[{actionOrdinal:49,action:'PlayCardAction',
        playerSlot:0,turnBefore:7,card:'Darkness Energy'}]};
    },{Store:FakeStore});
    energySidecar=resolved.audit;
    return resolved.result;
  },{Store:FakeStore});
  return {root:witnessed.audit,prompt:energySidecar,
    game:witnessed.result};
}

test('nested native observers retain independently witnessed root and prompt targets',()=>{
  const original=Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch');
  const a=run(0),b=run(1);
  assert.deepEqual(a.game.rootActionLedger,b.game.rootActionLedger);
  assert.deepEqual(Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch'),original);
  assert.equal(a.root.rootOrdinalLinked,true);
  assert.equal(b.root.rootOrdinalLinked,true);
  assert.equal(a.root.events[0].rootActionOrdinal,49);
  assert.equal(a.root.observedTargetActions,1);
  assert.equal(a.prompt.acceptedEnergyPromptResolutions,1);
  assert.equal(b.prompt.acceptedEnergyPromptResolutions,1);
  assert.notEqual(a.prompt.sha256,b.prompt.sha256);
  assert.equal(a.root.sha256,b.root.sha256);
  assert.equal(a.prompt.events[0].playerSlot,0);
  assert.deepEqual(a.prompt.events[0].publicChanges.map(x=>x.index),[0]);
  assert.deepEqual(b.prompt.events[0].publicChanges.map(x=>x.index),[1]);
  assert.equal(a.prompt.acceptedPromptTargetsFullyCertified,false);
  assert.equal(JSON.stringify(a).includes('secret'),false);
});

test('dual observer aborts retain separate authentic partial receipts',()=>{
  const original=Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch');
  assert.throws(()=>run(0,true),error=>{
    const root=acceptedTargetAbortEvidence(error);
    const prompt=acceptedEnergyPromptPublicAbortEvidence(error);
    assert.equal(root.observedTargetActions,1);
    assert.equal(root.rootOrdinalLinked,false,
      'Aborted game has no terminal ledger to authenticate root number');
    assert.equal(prompt.acceptedEnergyPromptResolutions,1);
    assert.equal(prompt.publiclyChangedResolutions,1);
    return true;
  });
  assert.deepEqual(Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch'),original);
});
