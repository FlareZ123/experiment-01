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

test('completed physical payment remains credited if cards legitimately move zones later',()=>{
  const f=fixture();
  f.owner.hand.cards.shift();
  f.state.prompts.push(new ChooseCardsPrompt(50,f.owner));
  const audit=withDowsingMachinePaperPaymentGuard(()=>{
    f.store.dispatch(new ResolvePromptAction(50,[f.one,f.two]));
    assert.deepEqual(f.owner.discard.cards,[f.one,f.two]);
    f.owner.discard.cards.splice(0,1);
    f.owner.hand.cards.push(f.one);
  },{Store:FakeStore}).audit;
  assert.equal(audit.settledPhysicalPayments,1);
  assert.equal(audit.unsettledPhysicalPayments,0);
});

test('raw Store acceptance without actual card payment stays physically unverified',()=>{
  class UnpaidStore extends FakeStore {
    dispatch(action) {
      this.nativeCalls++;
      const prompt=this.state.prompts.find(p=>p.id===action.id);
      if(prompt)prompt.result=action.result;
      return true;
    }
  }
  const f=fixture();
  f.owner.hand.cards.shift();
  f.state.prompts.push(new ChooseCardsPrompt(51,f.owner));
  const audit=withDowsingMachinePaperPaymentGuard(()=>{
    const store=new UnpaidStore(f.state);
    return store.dispatch(new ResolvePromptAction(51,[f.one,f.two]));
  },{Store:UnpaidStore}).audit;
  assert.equal(audit.acceptedPayments,1);
  assert.equal(audit.settledPhysicalPayments,0);
  assert.equal(audit.unsettledPhysicalPayments,0);
  assert.equal(audit.unresolvedPhysicalPayments,1);
});

class DelayedPaymentStore extends FakeStore {
  dispatch(action) {
    this.nativeCalls++;
    if(action?.constructor?.name!=='ResolvePromptAction')return true;
    const prompt=this.state.prompts.find(p=>p.id===action.id);
    prompt.result=action.result;
    const owner=this.state.players.find(p=>p.id===prompt.playerId);
    if(prompt.message==='CHOOSE_CARD_TO_DISCARD'){
      this.state.stagedPayment=action.result;
      const recovery=new ChooseCardsPrompt(61,owner);
      recovery.message='CHOOSE_CARD_TO_HAND';
      recovery.cards=owner.discard;
      recovery.options={min:1,max:1};
      this.state.prompts.push(recovery);
    }else if(prompt.message==='CHOOSE_CARD_TO_HAND' &&
             action.result.length===1){
      for(const card of this.state.stagedPayment){
        owner.hand.cards.splice(owner.hand.cards.indexOf(card),1);
        owner.discard.cards.push(card);
      }
      const target=action.result[0];
      owner.discard.cards.splice(owner.discard.cards.indexOf(target),1);
      owner.hand.cards.push(target);
    }
    return true;
  }
}

test('pinned-style delayed payment settles on target retrieval prompt, not the payment prompt',()=>{
  const f=fixture(),target={fullName:'Battle VIP Pass FST'};
  f.owner.hand.cards.shift();
  f.owner.discard.cards.push(target);
  f.state.prompts.push(new ChooseCardsPrompt(60,f.owner));
  const audit=withDowsingMachinePaperPaymentGuard(()=>{
    const store=new DelayedPaymentStore(f.state);
    store.dispatch(new ResolvePromptAction(60,[f.one,f.two]));
    // Native original Dowsing still holds both cards in hand here.
    assert.deepEqual(f.owner.hand.cards,[f.one,f.two]);
    assert.equal(f.owner.discard.cards.includes(f.one),false);
    store.dispatch(new ResolvePromptAction(61,[target]));
    // Later recovery is allowed: settlement is anchored to its actual step.
    f.owner.discard.cards.splice(0,1);
    f.owner.hand.cards.push(f.one);
  },{Store:DelayedPaymentStore}).audit;
  assert.equal(audit.acceptedPayments,1);
  assert.equal(audit.settledPhysicalPayments,1);
  assert.equal(audit.unsettledPhysicalPayments,0);
  assert.equal(audit.unresolvedPhysicalPayments,0);
  assert.equal(audit.sourceStampedPayments[0].closureDispatchType,'ResolvePromptAction');
  assert.equal(audit.sourceStampedPayments[0].closureReason,'EXACT_PHYSICAL_COST_TRANSFER');
});

test('native target cancellation closes submitted Dowsing with unpaid paper cost',()=>{
  const f=fixture(),target={fullName:'Battle VIP Pass FST'};
  f.owner.hand.cards.shift();
  f.owner.discard.cards.push(target);
  f.state.prompts.push(new ChooseCardsPrompt(60,f.owner));
  const audit=withDowsingMachinePaperPaymentGuard(()=>{
    const store=new DelayedPaymentStore(f.state);
    store.dispatch(new ResolvePromptAction(60,[f.one,f.two]));
    store.dispatch(new ResolvePromptAction(61,[]));
  },{Store:DelayedPaymentStore}).audit;
  assert.equal(audit.acceptedPayments,1);
  assert.equal(audit.settledPhysicalPayments,0);
  assert.equal(audit.unsettledPhysicalPayments,1);
  assert.equal(audit.unresolvedPhysicalPayments,0);
  assert.equal(audit.sourceStampedPayments[0].closureReason,
    'RECOVERY_CLOSED_WITHOUT_PHYSICAL_COST');
  assert.deepEqual(f.owner.hand.cards,[f.one,f.two]);
});

class AddPlayerAction {}

test('scoped v4 guard ignores auxiliary Store actions and fails closed on two registered trials',()=>{
  const original=FakeStore.prototype.dispatch;
  const first=fixture(),auxiliary=fixture(),second=fixture();
  for(const group of [first,auxiliary,second])
    group.owner.hand.cards.splice(2,1);
  let trial='rank26-source-seat-0';
  const observed=withDowsingMachinePaperPaymentGuard(()=>{
    // Before the physical registered AddPlayerAction, even a matching
    // printed source root in a cloned Store is excluded from this gate.
    assert.equal(auxiliary.store.dispatch(
      new PlayCardAction(auxiliary.owner.id,0)),true);
    first.store.dispatch(new AddPlayerAction());
    assert.throws(()=>first.store.dispatch(
      new PlayCardAction(first.owner.id,0)),
    /PAPER_ROOT_INVALID:DOWSING_NEEDS_TWO_OTHER_HAND_CARDS/);
    // An auxiliary clone remains out of scope after live registration.
    assert.equal(auxiliary.store.dispatch(
      new PlayCardAction(auxiliary.owner.id,0)),true);
    trial='rank26-source-seat-1';
    second.store.dispatch(new AddPlayerAction());
    assert.throws(()=>second.store.dispatch(
      new PlayCardAction(second.owner.id,0)),
    /PAPER_ROOT_INVALID:DOWSING_NEEDS_TWO_OTHER_HAND_CARDS/);
  },{Store:FakeStore,requireLiveStore:true,currentTrialId:()=>trial});
  assert.equal(observed.audit.liveStoreRequired,true);
  assert.equal(observed.audit.liveSourceTrialCount,2);
  assert.equal(observed.audit.excludedAuxiliaryDispatches,2);
  assert.equal(observed.audit.inspectedRoots,2);
  assert.equal(observed.audit.invalidRoots,2);
  assert.equal(auxiliary.store.nativeCalls,2);
  assert.equal(first.store.nativeCalls,1);
  assert.equal(second.store.nativeCalls,1);
  assert.strictEqual(FakeStore.prototype.dispatch,original);
});
