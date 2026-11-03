'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const {withSourceBoxPaymentObserver,POSITIVE_INDICES}=
  require('../simulation/evaluation/agent4-rank8-legacy-box-v11-paper-native.cjs');

class AddPlayerAction{}
class ResolvePromptAction{
  constructor(id,result){this.id=id;this.result=result;}
}
class ChooseCardsPrompt{
  constructor(id,owner,message='CHOOSE_CARD_TO_DISCARD'){
    this.id=id;this.result=undefined;this.playerId=owner.id;
    this.cards=owner.hand;
    this.sourceCard={fullName:'Secret Box TWM'};
    this.message=message;
  }
}
class Store{
  constructor(players){this.state={players,prompts:[]};this.calls=0;}
  dispatch(action){
    this.calls++;
    if(action instanceof AddPlayerAction)return true;
    const p=this.state.prompts.find(x=>
      x.id===action.id&&x.result===undefined);
    if(p){
      p.result=action.result;
      if(this.applyPhysicalPayment&&p.message==='CHOOSE_CARD_TO_DISCARD'){
        const owner=this.state.players.find(x=>x.id===p.playerId);
        for(const card of action.result){
          const index=owner.hand.cards.indexOf(card);
          if(index>=0){owner.hand.cards.splice(index,1);owner.discard.cards.push(card);}
        }
      }
    }
    return true;
  }
}
function fixture(){
  const players=[0,1].map(id=>({id,hand:{cards:[]},discard:{cards:[]}}));
  const store=new Store(players);
  return {players,store};
}
test('three retrospective source opportunities are fixed and independent of new outcomes',()=>{
  assert.deepEqual([...POSITIVE_INDICES],[683,694,756]);
});
test('read-only source payment observer sees original native zero payment without veto',()=>{
  for(const seat of [0,1]){
    const {store,players}=fixture();
    const source=players[seat];
    const prompt=new ChooseCardsPrompt(10,source);
    store.state.prompts.push(prompt);
    const before=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
    const observed=withSourceBoxPaymentObserver(Store,seat,()=>{
      store.dispatch(new AddPlayerAction());
      return store.dispatch(new ResolvePromptAction(10,[]));
    });
    assert.equal(observed.result,true);
    assert.equal(prompt.result.length,0);
    assert.equal(observed.audit.liveStores,1);
    assert.equal(observed.audit.sourceOwnedPrompts,1);
    assert.equal(observed.audit.paperInvalidNativeAccepted,1);
    assert.equal(observed.audit.sourceAccepted,1);
    assert.equal(observed.audit.observations[0].paperNegativeReason,
      'SECRET_BOX_REQUIRES_EXACTLY_THREE_OTHER_CARDS');
    assert.deepEqual(Object.getOwnPropertyDescriptor(
      Store.prototype,'dispatch'),before);
  }
});
test('physical valid 3-card payment observed, unrelated search and other player remain separate',()=>{
  const {store,players}=fixture(),source=players[1];
  const trio=[{name:'secret 1'},{name:'secret 2'},{name:'secret 3'}];
  source.hand.cards.push(...trio);
  const p=new ChooseCardsPrompt(11,source);
  const s=new ChooseCardsPrompt(12,source,'CHOOSE_CARD_TO_HAND');
  store.state.prompts.push(p,s);
  const observed=withSourceBoxPaymentObserver(Store,1,()=>{
    store.dispatch(new AddPlayerAction());
    store.dispatch(new ResolvePromptAction(12,[]));
    return store.dispatch(new ResolvePromptAction(11,trio));
  });
  assert.equal(observed.result,true);
  assert.equal(observed.audit.sourceOwnedPrompts,1);
  assert.equal(observed.audit.otherPrompts,0);
  assert.equal(observed.audit.sourceAccepted,1);
  assert.equal(observed.audit.paperInvalidNativeAccepted,0);
  assert.equal(observed.audit.observations[0].physicalPaymentValid,true);
  assert.equal(JSON.stringify(observed.audit).includes('secret 1'),false);
});
test('foreign prompt zones and auxiliary clones are ignored',()=>{
  const {store,players}=fixture(),source=players[0];
  source.hand.cards.push({},{},{});
  const aux=new Store(players);
  const p=new ChooseCardsPrompt(33,source);
  aux.state.prompts.push(p);
  const observed=withSourceBoxPaymentObserver(Store,0,()=>{
    store.dispatch(new AddPlayerAction());
    aux.dispatch(new ResolvePromptAction(33,[]));
  });
  assert.equal(observed.audit.sourceOwnedPrompts,0);
  assert.equal(observed.audit.paperInvalidNativeAccepted,0);
});
test('native Store hook restored when underlying game throws',()=>{
  const before=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.throws(()=>withSourceBoxPaymentObserver(Store,0,()=>{
    throw Error('expected simulated native abort');
  }),/expected simulated native abort/);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    Store.prototype,'dispatch'),before);
});

test('physical three-card transfer is counted only when all three cards move to owner discard',()=>{
  for(const seat of [0,1]){
    const {store,players}=fixture();
    const trio=Array.from({length:3},(_,i)=>({id:i+1}));
    const source=players[seat];
    source.hand.cards.push(...trio);
    store.applyPhysicalPayment=true;
    store.state.prompts.push(new ChooseCardsPrompt(16,source));
    const observed=withSourceBoxPaymentObserver(Store,seat,()=>{
      store.dispatch(new AddPlayerAction());
      return store.dispatch(new ResolvePromptAction(16,trio));
    });
    assert.equal(observed.audit.paidPhysicalThreeCardReceipts,1);
    assert.equal(observed.audit.unverifiedPhysicalCustody,0);
    assert.equal(observed.audit.observations[0].paidPhysicalCards,3);
    assert.equal(observed.audit.observations[0].physicalCustodyStatus,
      'PAID_THREE_PHYSICAL_CARDS');
    assert.equal(source.hand.cards.length,0);
    assert.equal(source.discard.cards.length,3);
  }
});

test('accepted resolution without a physical transfer remains unverified',()=>{
  const {store,players}=fixture();
  const trio=[{id:1},{id:2},{id:3}];
  players[0].hand.cards.push(...trio);
  store.state.prompts.push(new ChooseCardsPrompt(18,players[0]));
  const observed=withSourceBoxPaymentObserver(Store,0,()=>{
    store.dispatch(new AddPlayerAction());
    store.dispatch(new ResolvePromptAction(18,trio));
  });
  assert.equal(observed.audit.sourceAccepted,1);
  assert.equal(observed.audit.paidPhysicalThreeCardReceipts,0);
  assert.equal(observed.audit.unverifiedPhysicalCustody,1);
  assert.equal(observed.audit.observations[0].physicalCustodyStatus,'UNVERIFIED');
});
