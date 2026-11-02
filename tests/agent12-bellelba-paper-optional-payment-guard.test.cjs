'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {paperOptionalPaymentNegative,PRINTING,VERSION,
  withPaperBellelbaOptionalPayment}=
  require('../simulation/twinleaf/agent12-bellelba-paper-optional-payment-guard.cjs');

class ResolvePromptAction{
  constructor(id,result){this.id=id;this.result=result;}
}
class ConfirmPrompt{}
class ChooseCardsPrompt{}
class FakeStore{
  constructor(state){this.state=state;this.accepted=[];}
  dispatch(action){this.accepted.push(action);return action.result;}
}

function fixture(count=3){
  const hand={cards:Array.from({length:count},(_,i)=>({id:i+1}))};
  const owner={id:411,hand,supporter:{cards:[{fullName:PRINTING}]}};
  const prompt=Object.assign(new ChooseCardsPrompt(),{
    id:50,playerId:411,message:'CHOOSE_CARD_TO_DISCARD',
    cards:hand,options:{min:3,max:3},result:undefined});
  const store=new FakeStore({prompts:[prompt],players:[owner]});
  return {owner,prompt,store};
}

test('paper cost rejects zero through two, duplicated and alien physical references',()=>{
  const f=fixture();
  for(let n=0;n<3;n++)
    assert.equal(paperOptionalPaymentNegative(
      f.owner.hand.cards.slice(0,n),f.owner.hand,f.prompt),
      'REQUIRES_THREE_OTHER_CARDS');
  assert.equal(paperOptionalPaymentNegative(
    [f.owner.hand.cards[0],f.owner.hand.cards[0],f.owner.hand.cards[2]],
    f.owner.hand,f.prompt),'CARDS_MUST_BE_DISTINCT_PHYSICAL_OBJECTS');
  assert.equal(paperOptionalPaymentNegative(
    [f.owner.hand.cards[0],f.owner.hand.cards[1],{}],
    f.owner.hand,f.prompt),'CARDS_OUTSIDE_OWNER_HAND_OR_OFFERED_PROMPT');
  assert.equal(paperOptionalPaymentNegative(f.owner.hand.cards,
    f.owner.hand,f.prompt),null);
});

test('reversible Store guard refuses unpaid bench discard, accepts three card cost',()=>{
  const before=Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch');
  const f=fixture();
  const out=withPaperBellelbaOptionalPayment(()=>{
    for(let n=0;n<3;n++){
      assert.throws(()=>f.store.dispatch(
        new ResolvePromptAction(50,f.owner.hand.cards.slice(0,n))),
      /PAPER_BELLELBA_OPTION_PAYMENT_INVALID/);
    }
    const accepted=f.store.dispatch(
      new ResolvePromptAction(50,f.owner.hand.cards));
    assert.equal(accepted.length,3);
    return accepted;
  },{Store:FakeStore});
  assert.equal(out.audit.version,VERSION);
  assert.equal(out.audit.optionalCostReplies,4);
  assert.equal(out.audit.rejectedShortOrAlienPayments,3);
  assert.equal(out.audit.acceptedPayments,1);
  assert.equal(f.store.accepted.length,1);
  assert.deepEqual(Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch'),
    before);
});

test('cannot accept optional yes if exactly two other cards remain',()=>{
  const f=fixture(2);
  const prompt=Object.assign(new ConfirmPrompt(),{
    id:51,playerId:411,message:'WANT_TO_DISCARD_CARDS',result:undefined});
  f.store.state.prompts=[prompt];
  const out=withPaperBellelbaOptionalPayment(()=>{
    assert.throws(()=>f.store.dispatch(new ResolvePromptAction(51,true)),
      /PAPER_BELLELBA_OPTION_REQUIRES_THREE_OTHER_CARDS/);
    f.store.dispatch(new ResolvePromptAction(51,false));
    return 'choice declined';
  },{Store:FakeStore});
  assert.equal(out.audit.optionalConfirms,2);
  assert.equal(out.audit.rejectedUnaffordableConfirm,1);
  assert.equal(out.audit.qualifiedGames,0);
  assert.equal(f.store.accepted.length,1);
});
