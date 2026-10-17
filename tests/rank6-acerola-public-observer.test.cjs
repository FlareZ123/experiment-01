'use strict';
const assert=require('node:assert/strict');
const {publicPokemon,publicSide}=require('../simulation/twinleaf/rank6-acerola-public-observer.cjs');
const slot={getPokemonCard:()=>({name:'Shadow Rider Calyrex V'}),damage:140,energies:{cards:[1,2]}};
assert.deepEqual(publicPokemon(slot),{name:'Shadow Rider Calyrex V',damage:140,attachedEnergyCards:2});
const state={players:[{active:slot,bench:[],prizes:[{cards:[1]}]}]};
assert.equal(publicSide(state,0).active.damage,140);
assert.equal(publicSide(state,0).prizesRemaining,1);
console.log('rank6 public Acerola projection assertions passed');

class StartAction {}
class CardAction { constructor(handIndex){this.handIndex=handIndex;} }
class ChoiceAction {}
Object.defineProperty(CardAction,'name',{value:'PlayCardAction'});
Object.defineProperty(StartAction,'name',{value:'AddPlayerAction'});
const blank={getPokemonCard:()=>({name:'Latias ex'}),damage:0,
  energies:{cards:[]}};
class MockStore {
  constructor(){
    this.state={turn:3,activePlayer:0,prompts:[],players:[
      {active:slot,bench:[blank],hand:{cards:[{name:'Acerola'}]},
        prizes:[{cards:[1]}]},{}]};
  }
  dispatch(action){
    if(action instanceof CardAction) this.state.prompts=[{result:undefined}];
    if(action instanceof ChoiceAction){
      this.state.players[0].active=blank;
      this.state.prompts[0].result=true;
    }
    return null;
  }
}
const original=MockStore.prototype.dispatch;
const real=new MockStore();
const seen=require('../simulation/twinleaf/rank6-acerola-public-observer.cjs')
  .withAcerolaPublicObserver(MockStore,()=>{
    real.dispatch(new StartAction());
    real.dispatch(new CardAction(0));
    real.dispatch(new ChoiceAction());
    return true;
  });
assert.equal(seen.result,true);
assert.equal(seen.pending,false);
assert.equal(seen.events.length,1);
assert.equal(seen.events[0].before.active.damage,140);
assert.equal(seen.events[0].after.active.damage,0);
assert.equal(MockStore.prototype.dispatch,original);
console.log('rank6 source observer wrapper assertions passed');
