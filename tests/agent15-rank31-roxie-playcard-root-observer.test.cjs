'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {withRank31RoxiePlayCardRootObserver}=require(
  '../simulation/twinleaf/agent15-rank31-roxie-playcard-root-observer.cjs');
const Tags={POKEMON_GX:'gx',POKEMON_EX:'ex'};
class PokemonCard{
  constructor(name,tags=[]){this.fullName=name;this.tags=new Set(tags);}
  hasTag(t){return this.tags.has(t);}
}
class AddPlayerAction{}
class PlayCardAction{
  constructor(id,handIndex){this.id=id;this.handIndex=handIndex;}
}
class PassAction{}
class Store{
  constructor(cards,fail=false){
    this.state={turn:2,players:[
      {id:'reference',hand:{cards:[]}},
      {id:'source',hand:{cards}}
    ]};this.fail=fail;this.actions=[];
  }
  dispatch(action){
    this.actions.push(action.constructor.name);
    if(this.fail&&action instanceof PlayCardAction)throw Error('native-rejection');
    return this.actions.length;
  }
}
const d={Store,PokemonCard,CardTag:Tags};
test('only live source Roxie attempts are counted and no changes made',()=>{
  const original=Store.prototype.dispatch;
  const roxie={fullName:'Roxie CEC'};
  const good=new PokemonCard('Koffing CEC');
  const gx=new PokemonCard('Tapu Lele-GX GRI',[Tags.POKEMON_GX]);
  const real=new Store([roxie,good,gx]);
  const clone=new Store([roxie,gx]);
  const observed=withRank31RoxiePlayCardRootObserver(()=>{
    clone.dispatch(new PassAction());
    real.dispatch(new AddPlayerAction());
    real.dispatch(new PlayCardAction('source',0));
    real.state.players[1].hand.cards=[roxie,gx];
    real.dispatch(new PlayCardAction('source',0));
    clone.dispatch(new PlayCardAction('source',0));
    return 'unchanged';
  },d);
  assert.equal(observed.result,'unchanged');
  assert.equal(observed.audit.liveSourceRank31RoxiePlayCards,2);
  assert.equal(observed.audit.liveSourceRank31RoxieWithZeroEligiblePayment,1);
  assert.equal(observed.audit.liveRoxieStoreAccepted,2);
  assert.equal(observed.audit.auxiliaryDispatches,2);
  assert.deepEqual(observed.audit.events.map(x=>x.physicallyEligiblePaymentCount),[1,0]);
  assert.strictEqual(Store.prototype.dispatch,original);
});
test('Store abort remains losslessly observable and restores wrapper',()=>{
  const original=Store.prototype.dispatch;
  const roxie={fullName:'Roxie CEC'};
  const real=new Store([roxie],true);
  let captured;
  assert.throws(()=>withRank31RoxiePlayCardRootObserver(()=>{
    real.dispatch(new AddPlayerAction());
    real.dispatch(new PlayCardAction('source',0));
  },d),e=>{captured=e;return /native-rejection/.test(e.message)});
  assert.equal(captured.agent15RoxieRootAudit.liveRoxieStoreRejected,1);
  assert.equal(captured.agent15RoxieRootAudit.events[0].zeroPayment,true);
  assert.strictEqual(Store.prototype.dispatch,original);
});
