"use strict";

const test = require('node:test');
const assert = require('node:assert/strict');
const {withGuard, VERSION} = require('../simulation/twinleaf/agent1-ghala-paper-payment-guard.cjs');

class ResolvePromptAction {
  constructor(id, result) { this.id = id; this.result = result; }
}
class CommitPaymentAction {}
class FakeStore {
  /** @param {{seat?:0|1, prism?:boolean, redirect?:boolean, deferred?:boolean}} [options] */
  constructor({seat = 0, prism = false, redirect = true, deferred = false} = {}) {
    this.cards = [
      {fullName:'Plumeria BUS',tags:[]},
      {fullName: prism ? 'Wondrous Labyrinth Prism Star TEU' : 'Guzma BUS',
        tags:prism ? ['PRISM_STAR'] : []}
    ];
    this.owner = {id:'owner',hand:{cards:[...this.cards]},
      discard:{cards:[]},lostzone:{cards:[]}};
    const other = {id:'other',hand:{cards:[]},discard:{cards:[]},lostzone:{cards:[]}};
    this.state = {players:seat===0?[this.owner,other]:[other,this.owner],
      prompts:[{id:17,sourceCard:{fullName:'Guzma & Hala CEC'},
        playerId:'owner',message:'CHOOSE_CARD_TO_DISCARD',
        cards:{cards:[...this.cards]},options:{min:2,max:2},result:undefined}]};
    this.redirect = redirect;
    this.deferred = deferred;
    this.pending = null;
  }
  transfer(cards) {
    for (const card of cards) {
      const index = this.owner.hand.cards.indexOf(card);
      if(index === -1) continue;
      this.owner.hand.cards.splice(index,1);
      const lost = this.redirect && card.tags.includes('PRISM_STAR');
      this.owner[lost ? 'lostzone' : 'discard'].cards.push(card);
    }
  }
  dispatch(action) {
    if (action.constructor.name === 'ResolvePromptAction') {
      this.state.prompts[0].result = action.result;
      if (this.deferred) this.pending = action.result;
      else this.transfer(action.result);
    } else if (action.constructor.name === 'CommitPaymentAction') {
      this.transfer(this.pending);
      this.pending = null;
    }
    return 'native-ok';
  }
}
const deps = {Store:FakeStore, prismStarTag:'PRISM_STAR'};

test('real physical ordinary and Prism Star payments settle in both seats', () => {
  for(const seat of [0,1]) for(const prism of [false,true]) {
    const {audit} = withGuard(() => {
      const store = new FakeStore({seat,prism});
      return store.dispatch(new ResolvePromptAction(17,store.cards));
    },deps);
    assert.equal(audit.version,VERSION);
    assert.equal(audit.observedPayments,1);
    assert.equal(audit.acceptedPayments,1);
    assert.equal(audit.settledPhysicalPayments,1);
    assert.equal(audit.unresolvedPhysicalPayments,0);
    assert.equal(audit.physicalPaymentReceipts[0].ownerSeat,seat);
    assert.equal(audit.physicalPaymentReceipts[0].physicallyPaidTwo,true);
    assert.deepEqual(audit.physicalPaymentReceipts[0].cardCustody.map(x=>x.actualDestination),
      ['discard',prism?'lostzone':'discard']);
    assert.equal(audit.paperQualifiedGames,0);
  }
});

test('native acceptance with misrouted Prism is not a paper payment',()=>{
  const {audit} = withGuard(()=>{
    const store = new FakeStore({prism:true,redirect:false});
    return store.dispatch(new ResolvePromptAction(17,store.cards));
  },deps);
  assert.equal(audit.acceptedPayments,1);
  assert.equal(audit.settledPhysicalPayments,0);
  assert.equal(audit.unresolvedPhysicalPayments,1);
  assert.deepEqual(audit.physicalPaymentReceipts[0].cardCustody.map(x=>x.paidCorrectly),
    [true,false]);
});

test('delayed paper payment stays unresolved until real physical movement',()=>{
  const {audit} = withGuard(()=>{
    const store = new FakeStore({prism:true,deferred:true});
    store.dispatch(new ResolvePromptAction(17,store.cards));
    store.dispatch(new CommitPaymentAction());
  },deps);
  assert.equal(audit.acceptedPayments,1);
  assert.equal(audit.settledPhysicalPayments,1);
  assert.equal(audit.physicalPaymentReceipts[0].paymentSettledAfter,'CommitPaymentAction');
});

test('duplicated physical card pre-Store rejected without mutation',()=>{
  const prior=Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch');
  assert.throws(()=>withGuard(()=>{
    const store = new FakeStore();
    return store.dispatch(new ResolvePromptAction(17,[store.cards[0],store.cards[0]]));
  },deps),/PAPER_GHALA_INVALID_TWO_OTHER_CARD_PAYMENT/);
  assert.deepEqual(Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch'),prior);
});
