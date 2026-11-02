'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const {withSourceSecretBoxPhysicalPaymentCustody}=
  require('../simulation/evaluation/agent44-secretbox-payment-custody.cjs');

class AddPlayerAction{}
class ResolvePromptAction{
  constructor(id,result){this.id=id;this.result=result;}
}
class ChooseCardsPrompt{
  constructor(id,owner,offered){
    this.id=id;this.playerId=owner.id;this.result=undefined;
    this.sourceCard={fullName:'Secret Box TWM'};
    this.message='CHOOSE_CARD_TO_DISCARD';
    this.cards={cards:offered};
  }
}
/** @param {0|1} seat */
function fixture(seat=0){
  const cards=['Psychic Energy SVE','Grass Energy MEE',
    'Fire Energy MEE','Battle VIP Pass FST'].map(fullName=>({fullName}));
  const players=[{id:101},{id:202}].map(p=>({...p,
    hand:{cards:[]},discard:{cards:[]}}));
  players[seat].hand.cards.push(...cards);
  const prompt=new ChooseCardsPrompt(7,players[seat],cards);
  class Store{
    constructor(){this.state={players,turn:seat+1,prompts:[prompt]};}
    dispatch(action){
      if(action instanceof AddPlayerAction)return true;
      if(action instanceof ResolvePromptAction){
        const owner=this.state.players[seat];
        for(const card of action.result){
          const index=owner.hand.cards.indexOf(card);
          if(index>=0)owner.hand.cards.splice(index,1);
          owner.discard.cards.push(card);
        }
        prompt.result=action.result;
        return true;
      }
      throw Error('Unknown test action');
    }
  }
  return {cards,prompt,Store,owner:players[seat]};
}

test('both real physical seats: accepted three owner-hand objects become discard objects',()=>{
  for(const seat of [0,1]){
    const f=fixture(seat);
    const before=Object.getOwnPropertyDescriptor(f.Store.prototype,'dispatch');
    const witness=withSourceSecretBoxPhysicalPaymentCustody(()=>{
      const store=new f.Store();
      store.dispatch(new AddPlayerAction());
      return store.dispatch(new ResolvePromptAction(7,f.cards.slice(0,3)));
    },{Store:f.Store,sourceSeat:seat});
    assert.equal(witness.result,true);
    assert.equal(witness.audit.acceptedPayments,1);
    assert.equal(witness.audit.physicalPaidPayments,1);
    assert.equal(witness.audit.paperInvalidPayments,0);
    assert.equal(witness.audit.allObservedAcceptedPaymentsPaperPaid,true);
    assert.deepEqual(witness.audit.receipts[0].paymentPrintings,
      f.cards.slice(0,3).map(card=>card.fullName));
    assert.equal(witness.audit.receipts[0].beforeHandCount,4);
    assert.equal(witness.audit.receipts[0].afterHandCount,1);
    assert.equal(witness.audit.receipts[0].afterDiscardCount,3);
    assert.strictEqual(f.Store.prototype.dispatch,before.value);
  }
});

test('Store-accepted empty payment is independently flagged as paper-invalid',()=>{
  const f=fixture();
  const witness=withSourceSecretBoxPhysicalPaymentCustody(()=>{
    const store=new f.Store();
    store.dispatch(new AddPlayerAction());
    store.dispatch(new ResolvePromptAction(7,[]));
  },{Store:f.Store,sourceSeat:0});
  assert.equal(witness.audit.acceptedPayments,1);
  assert.equal(witness.audit.paperInvalidPayments,1);
  assert.equal(witness.audit.physicalPaidPayments,0);
  assert.equal(witness.audit.receipts[0].proposedPhysicalCardCount,0);
  assert.equal(witness.audit.allObservedAcceptedPaymentsPaperPaid,false);
});

test('identity-equal printing without physical owner-hand reference is invalid',()=>{
  const f=fixture();
  const phantom={fullName:f.cards[0].fullName};
  const witness=withSourceSecretBoxPhysicalPaymentCustody(()=>{
    const store=new f.Store();
    store.dispatch(new AddPlayerAction());
    store.dispatch(new ResolvePromptAction(7,[phantom,...f.cards.slice(1,3)]));
  },{Store:f.Store,sourceSeat:0});
  assert.equal(witness.audit.paperInvalidPayments,1);
  assert.equal(witness.audit.receipts[0].exactThreeDistinctOfferedOwnerHandCards,false);
});

test('other physical player payment is excluded when source seat is fixed',()=>{
  const f=fixture(1);
  const witness=withSourceSecretBoxPhysicalPaymentCustody(()=>{
    const store=new f.Store();
    store.dispatch(new AddPlayerAction());
    store.dispatch(new ResolvePromptAction(7,f.cards.slice(0,3)));
  },{Store:f.Store,sourceSeat:0});
  assert.equal(witness.audit.inspectedPayments,0);
  assert.equal(witness.audit.receipts.length,0);
});

test('underlying Store failure propagates with exact descriptor restoration',()=>{
  const f=fixture();
  const previous=Object.getOwnPropertyDescriptor(f.Store.prototype,'dispatch');
  assert.throws(()=>withSourceSecretBoxPhysicalPaymentCustody(()=>{
    const store=new f.Store();
    store.dispatch(new AddPlayerAction());
    throw Error('native trial rejected');
  },{Store:f.Store,sourceSeat:0}),/native trial rejected/);
  assert.deepEqual(Object.getOwnPropertyDescriptor(f.Store.prototype,'dispatch'),previous);
});
