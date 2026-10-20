'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {createOwnerK1DeckMembership}=
  require('../simulation/twinleaf/owner-k1-deck-membership.cjs');

class ChooseCardsPrompt{
  constructor(playerId,cards,id=17){
    this.playerId=playerId;this.cards=cards;this.id=id;
    this.result=undefined;
  }
}
const printing=fullName=>({fullName});
const owner=()=>({
  id:101,deck:{cards:[
    printing('Double Colorless Energy SUM'),
    printing('Float Stone BKT'),
    printing('Float Stone BKT'),
    printing('Garbodor BKP')
  ]},prizes:[{cards:[printing('hidden!')]}]
});

test('no own deck or Prize contents inspected until actual owner search',()=>{
  const knowledge=createOwnerK1DeckMembership();
  const initial=knowledge.snapshot();
  assert.equal(initial.exactMembershipKnown,false);
  assert.equal(initial.knownDeckSize,null);
  const inaccessible=knowledge.lookup('Thunder Mountain LOT');
  assert.deepEqual(inaccessible,{status:'unknown',knownCopies:null,epoch:0});
  assert.equal(knowledge.requirementStatus([
    {printing:'Thunder Mountain LOT',count:1}
  ]).status,'unknown');
});

test('one native owner search learns complete K1 absent/duplicate printings',()=>{
  const subject=owner(),k=createOwnerK1DeckMembership();
  const observed=k.observeSearch({
    owner:subject,prompt:new ChooseCardsPrompt(101,subject.deck),rootOrdinal:15
  });
  assert.equal(observed.exactMembershipKnown,true);
  assert.equal(observed.knownDeckSize,4);
  assert.equal(k.lookup('Thunder Mountain LOT').status,'absent');
  assert.equal(k.lookup('Float Stone BKT').knownCopies,2);
  assert.equal(k.requirementStatus([
    {printing:'Thunder Mountain LOT',count:1}
  ]).status,'impossible');
  assert.equal(k.requirementStatus([
    {printing:'Double Colorless Energy SUM',count:1}
  ]).status,'physically-available');
  assert.equal(k.requirementStatus([
    {printing:'Float Stone BKT',count:1},
    {printing:'Float Stone BKT',count:2}
  ]).missing[0].needed,3);
  assert.equal(k.snapshot().knownDeckSize,4);
});

test('only authenticated known transfers change membership; unknown ingress invalidates',()=>{
  const subject=owner(),k=createOwnerK1DeckMembership();
  k.observeSearch({
    owner:subject,prompt:new ChooseCardsPrompt(101,subject.deck),rootOrdinal:15
  });
  k.observeKnownDeckTransfer({
    removed:['Float Stone BKT','Garbodor BKP'],
    added:['Double Colorless Energy SUM'],rootOrdinal:20
  });
  assert.equal(k.lookup('Float Stone BKT').knownCopies,1);
  assert.equal(k.lookup('Garbodor BKP').status,'absent');
  assert.equal(k.lookup('Double Colorless Energy SUM').knownCopies,2);
  const stale=k.invalidate('unknown-Prize-redeal');
  assert.equal(stale.exactMembershipKnown,false);
  assert.equal(k.lookup('Garbodor BKP').status,'unknown');
  assert.equal(k.requirementStatus([
    {printing:'Garbodor BKP',count:1}
  ]).status,'unknown');
});

test('inconsistent visible transfer fails closed and permits re-search',()=>{
  const subject=owner(),k=createOwnerK1DeckMembership();
  k.observeSearch({owner:subject,prompt:new ChooseCardsPrompt(101,subject.deck),
    rootOrdinal:15});
  const mismatch=k.observeKnownDeckTransfer({
    removed:['Thunder Mountain LOT'],rootOrdinal:20
  });
  assert.equal(mismatch.exactMembershipKnown,false);
  assert.equal(mismatch.invalidationReason,
    'inconsistent-owner-observed-card-transfer');
  subject.deck.cards.push(printing('Thunder Mountain LOT'));
  k.observeSearch({owner:subject,
    prompt:new ChooseCardsPrompt(101,subject.deck,18),rootOrdinal:21});
  assert.equal(k.lookup('Thunder Mountain LOT').status,'present');
});

test('opp search, off-deck zone and answered prompt never create K1',()=>{
  const subject=owner(),k=createOwnerK1DeckMembership();
  assert.throws(()=>k.observeSearch({
    owner:subject,prompt:new ChooseCardsPrompt(202,subject.deck),rootOrdinal:2
  }),/Opponent deck search/);
  assert.throws(()=>k.observeSearch({
    owner:subject,prompt:new ChooseCardsPrompt(101,{cards:subject.deck.cards}),
    rootOrdinal:2
  }),/exact owner deck object/);
  const answered=new ChooseCardsPrompt(101,subject.deck);
  answered.result=[];
  assert.throws(()=>k.observeSearch({
    owner:subject,prompt:answered,rootOrdinal:2
  }),/actually have access/);
  assert.equal(k.lookup('Float Stone BKT').status,'unknown');
});

test('repeat native prompt and out-of-order root provenance rejected',()=>{
  const subject=owner(),k=createOwnerK1DeckMembership();
  k.observeSearch({owner:subject,prompt:new ChooseCardsPrompt(101,subject.deck,17),
    rootOrdinal:15});
  assert.throws(()=>k.observeSearch({
    owner:subject,prompt:new ChooseCardsPrompt(101,subject.deck,17),
    rootOrdinal:15
  }),/Reused search prompt identity/);
  assert.throws(()=>k.observeKnownDeckTransfer({
    removed:[],rootOrdinal:14
  }));
  assert.equal(k.lookup('Float Stone BKT').knownCopies,2);
});
