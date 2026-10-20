'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withOwnerDeckSearchWitness}=require(
  '../simulation/twinleaf/owner-deck-search-witness.cjs');

class AddPlayerAction {}
class TickAction {}
class OpenOwnSearch {}
class OpenOpponentSearch {}
class ChooseCardsPrompt {
  constructor(player,cards,id){
    this.player=player;this.cards=cards;this.id=id;this.result=undefined;
  }
}
function fixture(){
  let hiddenReads=0;
  const owner={supporter:{cards:[{name:'Fog Crystal'}]}};
  Object.defineProperty(owner,'deck',{value:{},writable:true});
  Object.defineProperty(owner.deck,'cards',{get(){hiddenReads++;return [
    {fullName:'Mewtwo & Mew-GX UNM'},
    {fullName:'Other Card FST'}];}});
  const opponent={supporter:{cards:[]},deck:{cards:[{fullName:'Secret'}]}};
  class Store {
    constructor(){this.state={turn:2,players:[opponent,owner],prompts:[]};}
    dispatch(action){
      if(action instanceof OpenOwnSearch)this.state.prompts=[
        new ChooseCardsPrompt(owner,owner.deck,77)];
      if(action instanceof OpenOpponentSearch)this.state.prompts=[
        new ChooseCardsPrompt(opponent,opponent.deck,78)];
    }
  }
  return {Store,hiddenReads:()=>hiddenReads};
}

test('reads private owner deck only at actual legal owner search, exactly once',()=>{
  const {Store,hiddenReads}=fixture();
  const descriptor=Store.prototype.dispatch;
  const {events}=withOwnerDeckSearchWitness(Store,1,
    ['Mewtwo & Mew-GX UNM','Unseen Payload'],()=>{
      const store=new Store();
      store.dispatch(new AddPlayerAction());
      store.dispatch(new TickAction());
      assert.equal(hiddenReads(),0);
      store.dispatch(new OpenOwnSearch());
      store.dispatch(new TickAction());
    });
  assert.strictEqual(Store.prototype.dispatch,descriptor);
  assert.equal(events.length,1);
  assert.equal(hiddenReads(),1);
  assert.equal(events[0].rootActionOrdinal,3);
  assert.deepEqual(events[0].targetCounts,{
    'Mewtwo & Mew-GX UNM':1,'Unseen Payload':0});
  assert.deepEqual(events[0].stagedCardNames,['Fog Crystal']);
});

test('opponent search never authorizes inspecting an owner hidden deck',()=>{
  const {Store,hiddenReads}=fixture();
  const {events}=withOwnerDeckSearchWitness(Store,1,
    ['Mewtwo & Mew-GX UNM'],()=>{
      const store=new Store();
      store.dispatch(new AddPlayerAction());
      store.dispatch(new OpenOpponentSearch());
    });
  assert.equal(events.length,0);
  assert.equal(hiddenReads(),0);
});

test('reversible hook restores exactly even when source execution throws',()=>{
  const {Store}=fixture(),base=Store.prototype.dispatch;
  assert.throws(()=>withOwnerDeckSearchWitness(Store,1,[],()=>{
    throw new Error('native source failure');
  }),/native source failure/);
  assert.strictEqual(Store.prototype.dispatch,base);
});

test('optional knowledge handoff fires only at an authenticated owner search',()=>{
  const {Store,hiddenReads}=fixture(),events=[];
  withOwnerDeckSearchWitness(Store,1,['Mewtwo & Mew-GX UNM'],()=>{
    const store=new Store();
    store.dispatch(new AddPlayerAction());
    store.dispatch(new OpenOpponentSearch());
    store.dispatch(new OpenOwnSearch());
    store.dispatch(new TickAction());
  },({owner,prompt,rootOrdinal,globalTurn})=>{
    assert.strictEqual(prompt.cards,owner.deck);
    assert.strictEqual(prompt.player,owner);
    assert.equal(prompt.result,undefined);
    assert.equal(rootOrdinal,3);
    events.push({turn:globalTurn,printings:prompt.cards.cards.map(c=>c.fullName)});
  });
  assert.equal(hiddenReads(),2);
  assert.deepEqual(events,[{turn:2,printings:[
    'Mewtwo & Mew-GX UNM','Other Card FST'
  ]}]);
});

test('knowledge hook failure restores native dispatch descriptor',()=>{
  const {Store}=fixture(),base=Store.prototype.dispatch;
  assert.throws(()=>withOwnerDeckSearchWitness(Store,1,[],()=>{
    const store=new Store();
    store.dispatch(new AddPlayerAction());
    store.dispatch(new OpenOwnSearch());
  },()=>{throw new Error('knowledge observer failed');}),
  /knowledge observer failed/);
  assert.strictEqual(Store.prototype.dispatch,base);
});
