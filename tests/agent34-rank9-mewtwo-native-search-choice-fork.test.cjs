'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {CORE,TARGET}=require(
  '../simulation/evaluation/agent34-rank9-newmoon-lastbench-owner-location.cjs');
const {withOwnerSearchAlternative}=require(
  '../simulation/evaluation/agent34-rank9-mewtwo-native-search-choice-fork.cjs');
const p=name=>({fullName:name});
class AddPlayerAction{}
class ResolvePromptAction{
  constructor(id,result,log){Object.assign(this,{id,result,log});}
}
class ChooseCardsPrompt{
  constructor(owner,allowCore=true){
    this.id=12;this.playerId=owner.id;this.cards=owner.deck;
    this.result=undefined;this.allowCore=allowCore;
  }
  validate(cards){
    return cards.length===1&&this.cards.cards.includes(cards[0])&&
      (this.allowCore||cards[0].fullName!==CORE);
  }
}
const slot=(name=null)=>({
  cards:name?[p(name)]:[],
  getPokemonCard(){return this.cards[0]??null;}
});
class Store{
  constructor(turn=1,allowCore=true){
    const owner={
      id:1,hand:{cards:[]},
      deck:{cards:[p(CORE),p(CORE),p(TARGET)]},
      prizes:[],discard:{cards:[]},lostzone:{cards:[]},
      active:slot('Klefki SVI'),
      bench:[slot('Unown AOR'),slot(),slot(),slot(),slot()]
    };
    this.state={turn,players:[owner,{id:2}],prompts:[
      new ChooseCardsPrompt(owner,allowCore)]};
  }
  dispatch(action){
    if(action.constructor.name==='ResolvePromptAction'){
      const owner=this.state.players[0];
      const index=owner.deck.cards.indexOf(action.result[0]);
      assert.notEqual(index,-1);
      owner.deck.cards.splice(index,1);
      owner.hand.cards.push(action.result[0]);
      this.state.prompts=[];
    }
    return 'native-accepted';
  }
}
test('native-prompt-validated one-card alternative transfers exact Mewtwo',()=>{
  const store=new Store(1),original=Store.prototype.dispatch;
  const duskull=store.state.players[0].deck.cards.find(c=>c.fullName===TARGET);
  const r=withOwnerSearchAlternative(()=>{
    store.dispatch(new AddPlayerAction());
    assert.equal(store.dispatch(new ResolvePromptAction(12,[duskull])),
      'native-accepted');
    return 77;
  },{targetTurn:1,Store});
  assert.equal(r.result,77);
  assert.equal(r.audit.nativeReplacementCount,1);
  assert.equal(r.audit.legalPhysicalTransfers,1);
  assert.equal(r.audit.events[0].selectedByUnmodifiedBot[0],TARGET);
  assert.equal(r.audit.events[0].physicallyDispatched[0],CORE);
  assert.deepEqual(store.state.players[0].hand.cards.map(c=>c.fullName),[CORE]);
  assert.strictEqual(Store.prototype.dispatch,original);
});
test('target turn mismatch leaves native original Duskull choice intact',()=>{
  const store=new Store(1),original=Store.prototype.dispatch;
  const card=store.state.players[0].deck.cards.find(c=>c.fullName===TARGET);
  const r=withOwnerSearchAlternative(()=>{
    store.dispatch(new AddPlayerAction());
    store.dispatch(new ResolvePromptAction(12,[card]));
    return null;
  },{targetTurn:23,Store});
  assert.equal(r.audit.opportunityCount,0);
  assert.deepEqual(store.state.players[0].hand.cards.map(c=>c.fullName),[TARGET]);
  assert.strictEqual(Store.prototype.dispatch,original);
});
test('native-rejected alternative defers to the original supported prompt',()=>{
  const store=new Store(23,false),original=Store.prototype.dispatch;
  const card=store.state.players[0].deck.cards.find(c=>c.fullName===TARGET);
  const r=withOwnerSearchAlternative(()=>{
    store.dispatch(new AddPlayerAction());
    store.dispatch(new ResolvePromptAction(12,[card]));
    return null;
  },{targetTurn:23,Store});
  assert.equal(r.audit.opportunityCount,1);
  assert.equal(r.audit.nativeReplacementCount,0);
  assert.equal(r.audit.events[0].alternativeNativeValidated,false);
  assert.deepEqual(store.state.players[0].hand.cards.map(c=>c.fullName),[TARGET]);
  assert.strictEqual(Store.prototype.dispatch,original);
});

test('first-turn VIP-like owner-deck selection moves source Mewtwo to Bench',()=>{
  class VipStore extends Store{
    dispatch(action){
      if(action.constructor.name==='ResolvePromptAction'){
        const owner=this.state.players[0],card=action.result[0];
        const index=owner.deck.cards.indexOf(card);
        assert.notEqual(index,-1);
        owner.deck.cards.splice(index,1);
        owner.bench.find(slot=>!slot.getPokemonCard()).cards.push(card);
        this.state.prompts=[];
      }
      return 'native-accepted';
    }
  }
  const store=new VipStore(1),prior=VipStore.prototype.dispatch;
  const card=store.state.players[0].deck.cards.find(c=>c.fullName===TARGET);
  const r=withOwnerSearchAlternative(()=>{
    store.dispatch(new AddPlayerAction());
    store.dispatch(new ResolvePromptAction(12,[card]));
    return null;
  },{targetTurn:1,Store:VipStore});
  assert.equal(r.audit.nativeReplacementCount,1);
  assert.equal(r.audit.legalPhysicalTransfers,1);
  assert.equal(r.audit.events[0].confirmedDeckToBench,true);
  assert.equal(r.audit.events[0].confirmedDeckToHand,false);
  assert.equal(store.state.players[0].bench[1].getPokemonCard().fullName,CORE);
  assert.strictEqual(VipStore.prototype.dispatch,prior);
});
