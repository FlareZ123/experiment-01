'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {PRINTING, dowsingPaymentNegative,
  withDowsingMachinePaperPaymentGuard} =
  require('../simulation/twinleaf/agent36-dowsing-paper-payment-guard.cjs');

class ResolvePromptAction {
  constructor(id,result) { this.id=id; this.result=result; }
}
class PlayCardAction {
  constructor(id,handIndex) { this.id=id; this.handIndex=handIndex; }
}
class ChooseCardsPrompt {
  constructor(id,owner) {
    this.id=id;
    this.playerId=owner.id;
    this.sourceCard={fullName:PRINTING};
    this.message='CHOOSE_CARD_TO_DISCARD';
    this.options={min:2,max:2};
    this.cards=owner.hand;
  }
  validate(result) {
    return Array.isArray(result)&&result.length===2;
  }
}
class FakeStore {
  constructor(state) {this.state=state;this.nativeCalls=0;}
  dispatch(action) {
    this.nativeCalls++;
    if(action.constructor.name==='ResolvePromptAction') {
      const prompt=this.state.prompts.find(p=>p.id===action.id);
      prompt.result=action.result;
      const owner=this.state.players.find(p=>p.id===prompt.playerId);
      for(const card of action.result) {
        owner.hand.cards.splice(owner.hand.cards.indexOf(card),1);
        owner.discard.cards.push(card);
      }
    }
    return true;
  }
}
/** @returns {{state:object,owner:object,machine:object,one:object,two:object,store:FakeStore}} */
function fixture() {
  const machine={fullName:PRINTING};
  const one={fullName:'Lightning Energy MEE'};
  const two={fullName:'Double Colorless Energy SUM'};
  const owner={id:8,hand:{cards:[machine,one,two]},discard:{cards:[]}};
  const state={players:[owner],prompts:[]};
  const store=new FakeStore(state);
  return {state,owner,machine,one,two,store};
}

test('one-card, empty, duplicate and physically foreign payments fail independent of validator',()=>{
  for(const answer of [[],[{}],null]) {
    const {owner}=fixture(),prompt=new ChooseCardsPrompt(7,owner);
    assert.match(dowsingPaymentNegative(prompt,answer,owner),
      /EXACTLY_TWO/);
  }
  const {owner,one,two}=fixture(),prompt=new ChooseCardsPrompt(9,owner);
  prompt.validate=()=>true;
  assert.match(dowsingPaymentNegative(prompt,[one,one],owner),/DISTINCT/);
  assert.match(dowsingPaymentNegative(prompt,[one,{}],owner),/NOT_IN_OWNER/);
  assert.equal(dowsingPaymentNegative(prompt,[one,two],owner),null);
});

test('underpaid prompt is vetoed before native Store, then legal physical pair settles and restores dispatch',()=>{
  const previous=FakeStore.prototype.dispatch;
  const f=fixture();
  f.owner.hand.cards.splice(0,1);
  f.state.prompts.push(new ChooseCardsPrompt(10,f.owner));
  const r=withDowsingMachinePaperPaymentGuard(()=>{
    assert.throws(()=>f.store.dispatch(new ResolvePromptAction(10,[f.one])),
      /PAPER_PROMPT_INVALID:DOWSING_REQUIRES_EXACTLY_TWO_CARDS/);
    assert.equal(f.store.nativeCalls,0);
    return f.store.dispatch(new ResolvePromptAction(10,[f.one,f.two]));
  },{Store:FakeStore});
  assert.equal(r.result,true);
  assert.equal(r.audit.inspectedPayments,2);
  assert.equal(r.audit.invalidPayments,1);
  assert.equal(r.audit.acceptedPayments,1);
  assert.equal(r.audit.settledPhysicalPayments,1);
  assert.equal(r.audit.unsettledPhysicalPayments,0);
  assert.strictEqual(FakeStore.prototype.dispatch,previous);
});

test('source Dowsing root is vetoed when fewer than two OTHER hand cards exist',()=>{
  const previous=FakeStore.prototype.dispatch;
  const f=fixture();
  f.owner.hand.cards.splice(2,1);
  const audit=withDowsingMachinePaperPaymentGuard(()=>{
    assert.throws(()=>f.store.dispatch(new PlayCardAction(f.owner.id,0)),
      /PAPER_ROOT_INVALID:DOWSING_NEEDS_TWO_OTHER_HAND_CARDS/);
    assert.equal(f.store.nativeCalls,0);
    f.owner.hand.cards.push(f.two);
    return f.store.dispatch(new PlayCardAction(f.owner.id,0));
  },{Store:FakeStore}).audit;
  assert.equal(audit.inspectedRoots,2);
  assert.equal(audit.invalidRoots,1);
  assert.equal(f.store.nativeCalls,1);
  assert.strictEqual(FakeStore.prototype.dispatch,previous);
});

test('source target-search and different-printing prompts do not inherit payment veto',()=>{
  const f=fixture();
  const prompt=new ChooseCardsPrompt(30,f.owner);
  prompt.message='CHOOSE_CARD_TO_HAND';
  f.state.prompts.push(prompt);
  const audit=withDowsingMachinePaperPaymentGuard(()=>{
    f.store.dispatch(new ResolvePromptAction(30,[]));
    return true;
  },{Store:FakeStore}).audit;
  assert.equal(audit.inspectedPayments,0);
  assert.equal(audit.acceptedPayments,0);
});

test('unknown source prompt structure does not become a false positive paper certificate',()=>{
  const {owner,one,two}=fixture();
  const p=new ChooseCardsPrompt(40,owner);
  p.options={min:1,max:2};
  assert.equal(dowsingPaymentNegative(p,[one,two],owner),
    'DOWSING_UNEXPECTED_PAYMENT_PROMPT');
});
