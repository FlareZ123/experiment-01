'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {captureInitialPhysicalOwners,inspectPhysicalCardZones,
  fixedDeckCountAnomalies}=
  require('../simulation/twinleaf/physical-card-ledger.cjs');

/** @param {object[]} [cards] @returns {{cards:object[]}} */
function zone(cards=[]){return {cards};}
/** @returns {object} Minimal native player-zone shape, 60 unique original cards. */
function player(seat){
  const deck=Array.from({length:60},(_,n)=>({name:'same-print',
    originalSeat:seat,index:n}));
  return {id:seat+17,deck:zone(deck),hand:zone(),discard:zone(),
    lostzone:zone(),stadium:zone(),supporter:zone(),
    active:{cards:[],energies:zone()},bench:[],
    prizes:[zone(),zone()]};
}
function setup(){
  const players=[player(0),player(1)];
  const state={players,prompts:[]};
  const ownership=captureInitialPhysicalOwners(state);
  return {state,ownership,a:players[0],b:players[1]};
}

test('capture exactly 120 distinct original physical references',()=>{
  const {state,ownership}=setup();
  assert.equal(ownership.size,120);
  const receipt=inspectPhysicalCardZones(state,ownership);
  assert.deepEqual(receipt.canonicalCounts,[60,60]);
  assert.deepEqual(receipt.originalOwnerCustody.missingOriginalCounts,[0,0]);
  assert.equal(receipt.originalOwnerCustody.displacedOriginalReferences.length,0);
  assert.equal(receipt.originalOwnerCustody.unregisteredOriginalReferences.length,0);
});

test('detect cross-owner physical swap even with 60 cards in both decks',()=>{
  const {state,ownership,a,b}=setup();
  const first=a.deck.cards.pop(),second=b.deck.cards.pop();
  a.deck.cards.push(second);
  b.deck.cards.push(first);
  const ledger=inspectPhysicalCardZones(state,ownership);
  assert.deepEqual(fixedDeckCountAnomalies(ledger),[]);
  assert.deepEqual(ledger.originalOwnerCustody.missingOriginalCounts,[0,0]);
  assert.equal(ledger.originalOwnerCustody.displacedOriginalReferences.length,2);
});

test('detect exact-print clone replacing a physical original without count change',()=>{
  const {state,ownership,a}=setup();
  const original=a.deck.cards[0];
  a.deck.cards[0]={...original};
  const ledger=inspectPhysicalCardZones(state,ownership);
  assert.deepEqual(fixedDeckCountAnomalies(ledger),[]);
  assert.deepEqual(ledger.originalOwnerCustody.missingOriginalCounts,[1,0]);
  assert.equal(ledger.originalOwnerCustody.unregisteredOriginalReferences.length,1);
});

test('legal intra-owner zone movement and attached Energy index preserve custody',()=>{
  const {state,ownership,a}=setup();
  const original=a.deck.cards.pop();
  a.active.cards.push(original);
  a.active.energies.cards.push(original);
  const next=a.deck.cards.pop();
  a.prizes[0].cards.push(next);
  const ledger=inspectPhysicalCardZones(state,ownership);
  assert.deepEqual(ledger.canonicalCounts,[60,60]);
  assert.deepEqual(ledger.energyWithoutPhysicalCard,[]);
  assert.deepEqual(ledger.originalOwnerCustody.missingOriginalCounts,[0,0]);
  assert.equal(ledger.originalOwnerCustody.displacedOriginalReferences.length,0);
});

test('owner-index detection keeps prompt-stranded original distinct from new clone',()=>{
  const {state,ownership,a}=setup();
  const original=a.deck.cards.pop();
  state.prompts=[{playerId:a.id,cardList:zone([original]),
    result:undefined}];
  const ledger=inspectPhysicalCardZones(state,ownership);
  assert.deepEqual(ledger.transientPromptCustody,[1,0]);
  assert.deepEqual(ledger.originalOwnerCustody.missingOriginalCounts,[1,0]);
  assert.deepEqual(fixedDeckCountAnomalies(ledger),[
    {seat:0,observed:59,expected:60}]);
  state.prompts[0].result=[];
  const after=inspectPhysicalCardZones(state,ownership);
  assert.deepEqual(after.transientPromptCustody,[0,0]);
  assert.deepEqual(after.originalOwnerCustody.missingOriginalCounts,[1,0]);
});

test('shared physical card between original decks rejected at capture time',()=>{
  const a=player(0),b=player(1);
  b.deck.cards[1]=a.deck.cards[17];
  assert.throws(()=>captureInitialPhysicalOwners({players:[a,b]}),
    /shared between decks/);
});

test('incomplete original printed deck rejected before any game action',()=>{
  const a=player(0),b=player(1);
  b.deck.cards.pop();
  assert.throws(()=>captureInitialPhysicalOwners({players:[a,b]}),
    /complete original decks|required.*60|Pre-setup/);
});
