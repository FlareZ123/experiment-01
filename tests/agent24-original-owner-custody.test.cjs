'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {
  captureInitialPhysicalOwners,inspectPhysicalCardZones,
  fixedDeckCountAnomalies,locatedOrPromptCountAnomalies
}=require('../simulation/twinleaf/physical-card-ledger.cjs');

function slot(cards=[]){
  return {cards,tools:[],energies:{cards:[]},
    getPokemonCard(){return null;}};
}
function player(cards){
  return {
    deck:{cards},hand:{cards:[]},discard:{cards:[]},
    lostzone:{cards:[]},stadium:{cards:[]},supporter:{cards:[]},
    active:slot(),bench:[slot()],prizes:[{cards:[]}]
  };
}
function setup(){
  const cards=Array.from({length:4},(_,i)=>({id:i}));
  return {cards,state:{players:[
    player(cards.slice(0,2)),player(cards.slice(2,4))
  ],prompts:[]}};
}

test('pre-setup physical owner index pins every original reference',()=>{
  const {cards,state}=setup();
  const owners=captureInitialPhysicalOwners(state,2);
  assert.equal(owners.size,4);
  assert.deepEqual(cards.map(c=>owners.get(c)),[0,0,1,1]);
  const receipt=inspectPhysicalCardZones(state,owners);
  assert.deepEqual(receipt.canonicalCounts,[2,2]);
  assert.equal(receipt.originalOwnerCustody.originalCardCount,4);
  assert.deepEqual(receipt.originalOwnerCustody.displacedOriginalReferences,[]);
  assert.deepEqual(receipt.originalOwnerCustody.unregisteredOriginalReferences,[]);
  assert.deepEqual(receipt.originalOwnerCustody.missingOriginalCounts,[0,0]);
});

test('balanced reciprocal cross-player card swap evades old 60-only census',()=>{
  const {state}=setup();
  const owners=captureInitialPhysicalOwners(state,2);
  const a=state.players[0].deck.cards;
  const b=state.players[1].deck.cards;
  [a[0],b[0]]=[b[0],a[0]];
  const receipt=inspectPhysicalCardZones(state,owners);
  assert.deepEqual(fixedDeckCountAnomalies(receipt,2),[]);
  assert.deepEqual(locatedOrPromptCountAnomalies(receipt,2),[]);
  assert.equal(receipt.referenceDuplications.length,0);
  assert.equal(receipt.originalOwnerCustody.displacedOriginalReferences.length,2);
  assert.deepEqual(receipt.originalOwnerCustody.displacedOriginalReferences
    .map(row=>[row.originalSeat,row.locatedSeat]),[[1,0],[0,1]]);
  assert.deepEqual(receipt.originalOwnerCustody.missingOriginalCounts,[0,0]);
});

test('a newly substituted reference preserves count but violates original inventory',()=>{
  const {state}=setup();
  const owners=captureInitialPhysicalOwners(state,2);
  state.players[0].deck.cards[0]={id:'cloned-printing'};
  const receipt=inspectPhysicalCardZones(state,owners);
  assert.deepEqual(fixedDeckCountAnomalies(receipt,2),[]);
  assert.equal(receipt.originalOwnerCustody.unregisteredOriginalReferences.length,1);
  assert.deepEqual(receipt.originalOwnerCustody.missingOriginalCounts,[1,0]);
});

test('same-owner card movement between zones is permitted',()=>{
  const {state}=setup();
  const owners=captureInitialPhysicalOwners(state,2);
  state.players[1].hand.cards.push(state.players[1].deck.cards.pop());
  const receipt=inspectPhysicalCardZones(state,owners);
  assert.deepEqual(receipt.originalOwnerCustody.displacedOriginalReferences,[]);
  assert.deepEqual(receipt.originalOwnerCustody.missingOriginalCounts,[0,0]);
  assert.deepEqual(fixedDeckCountAnomalies(receipt,2),[]);
});

test('duplicate initial references or incomplete initial decks fail closed',()=>{
  const {state}=setup();
  state.players[1].deck.cards[0]=state.players[0].deck.cards[0];
  assert.throws(()=>captureInitialPhysicalOwners(state,2),/shared between decks/);
  const incomplete=setup().state;
  incomplete.players[1].deck.cards.pop();
  assert.throws(()=>captureInitialPhysicalOwners(incomplete,2),
    /complete original deck/);
  assert.throws(()=>captureInitialPhysicalOwners({players:[]},2),
    /Two registered complete/);
});

test('historical no-index observer leaves old output unchanged',()=>{
  const {state}=setup();
  const receipt=inspectPhysicalCardZones(state);
  assert.equal(receipt.originalOwnerCustody,undefined);
  assert.deepEqual(fixedDeckCountAnomalies(receipt,2),[]);
});
