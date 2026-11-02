'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {CORE}=require(
  '../simulation/evaluation/agent34-rank9-newmoon-lastbench-owner-location.cjs');
const {withOriginalKlefkiRetreatToCore}=
  require('../simulation/evaluation/agent34-rank9-klefki-paid-retreat-to-core-native.cjs');
class AddPlayerAction{}
class AttackAction{
  constructor(clientId,name){Object.assign(this,{clientId,name});}
}
class RetreatAction{
  constructor(clientId,benchIndex){Object.assign(this,{clientId,benchIndex});}
}
const pokemon=name=>({fullName:name});
const pos=(name,energy)=>({
  cards:[pokemon(name)],energies:{cards:energy?[pokemon('Psychic Energy MEE')]:[]},
  getPokemonCard(){return this.cards[0]??null;}
});
class Store{
  constructor(activeEnergy=true,withCore=true,turn=21){
    this.state={turn,prompts:[],players:[{
      id:7,active:pos('Klefki SVI',activeEnergy),
      bench:[pos(withCore?CORE:'Duskull VIV',true)],
      retreatedTurn:0
    },{id:9}]};
  }
  dispatch(action){
    if(action instanceof RetreatAction){
      const owner=this.state.players[0];
      if(owner.active.energies.cards.length===0)
        throw Error('native needs Retreat Energy');
      owner.active.energies.cards.pop();
      const old=owner.active;
      owner.active=owner.bench[action.benchIndex];
      owner.bench[action.benchIndex]=old;
      owner.retreatedTurn=this.state.turn;
    }
    return 'native-accepted';
  }
}
test('one source Action root becomes actual native paid Retreat',()=>{
  const store=new Store(),prior=Store.prototype.dispatch;
  const got=withOriginalKlefkiRetreatToCore(()=>{
    store.dispatch(new AddPlayerAction());
    store.dispatch(new AttackAction(7,'Joust'));
    return 1;
  },{Store,RetreatAction});
  assert.equal(got.result,1);
  assert.equal(got.audit.nativeAccepted,1);
  assert.equal(got.audit.events[0].activeAfter,CORE);
  assert.deepEqual(got.audit.events[0].activeEnergyAfter,
    ['Psychic Energy MEE']);
  assert.equal(store.state.players[0].bench[0].energies.cards.length,0);
  assert.strictEqual(Store.prototype.dispatch,prior);
});
test('original action untouched without a funded Bench attacker',()=>{
  const store=new Store(true,false),prior=Store.prototype.dispatch;
  const got=withOriginalKlefkiRetreatToCore(()=>{
    store.dispatch(new AddPlayerAction());
    store.dispatch(new AttackAction(7,'Joust'));
  },{Store,RetreatAction});
  assert.equal(got.audit.nativeAccepted,0);
  assert.equal(store.state.players[0].active.getPokemonCard().fullName,
    'Klefki SVI');
  assert.strictEqual(Store.prototype.dispatch,prior);
});
test('unfunded Active cannot trigger a speculative native retreat',()=>{
  const store=new Store(false,true),prior=Store.prototype.dispatch;
  const got=withOriginalKlefkiRetreatToCore(()=>{
    store.dispatch(new AddPlayerAction());
    store.dispatch(new AttackAction(7,'Joust'));
  },{Store,RetreatAction});
  assert.equal(got.audit.eligibleNativeReplacements,0);
  assert.strictEqual(Store.prototype.dispatch,prior);
});
