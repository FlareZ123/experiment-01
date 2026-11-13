'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  createStoreDecklistBindingReceipt
}=require('../../simulation/evaluation/2026-11/agent36-flittle-store-decklist-binding.cjs');
const {
  FLITTLE,PSYCHIC
}=require('../../simulation/twinleaf/2026-11/agent36-flittle-mcts-root-provider.cjs');

const ENGINE_PIN='0123456789abcdef0123456789abcdef01234567';
const candidateDecklist={id:'flittle-pilot-candidate-v1',
  cards:[FLITTLE,...Array(59).fill(PSYCHIC)]};
const opponentDecklist={id:'flittle-pilot-opponent-v1',
  cards:[FLITTLE,...Array(59).fill(PSYCHIC)]};

function card(fullName) {
  return {fullName,name:fullName,hp:30,cardType:['PSYCHIC'],
    retreat:[],weakness:[],resistance:[],attacks:[],powers:[]};
}
function emptySlot() {
  return {cards:[],energies:{cards:[]},tools:[],damage:0,
    specialConditions:[],getPokemonCard(){return null;}};
}
function makePlayer(id,prefix) {
  const pokemon=card(FLITTLE);
  const activeEnergy=card(PSYCHIC);
  const handEnergy=card(PSYCHIC);
  const prizeCards=Array.from({length:6},()=>card(PSYCHIC));
  const deckCards=Array.from({length:51},()=>card(PSYCHIC));
  const active={
    cards:[pokemon,activeEnergy],
    energies:{cards:[activeEnergy]},
    tools:[],damage:0,pokemonPlayedTurn:0,specialConditions:[],
    getPokemonCard(){return pokemon;}
  };
  return {
    id,name:prefix,active,bench:Array.from({length:5},emptySlot),
    deck:{cards:deckCards},hand:{cards:[handEnergy]},
    prizes:prizeCards.map(value=>({cards:[value]})),
    discard:{cards:[]},lostzone:{cards:[]},
    stadium:{cards:[]},supporter:{cards:[]},
    supporterTurn:0,energyPlayedTurn:1
  };
}
function makeStore(candidateSeat=1) {
  const state={
    phase:'PLAYER_TURN',turn:2,activePlayer:candidateSeat,
    winner:null,gameSettings:{},rules:{attackFirstTurn:false},
    prompts:[],players:[makePlayer(101,'seat-0'),makePlayer(202,'seat-1')]
  };
  return {state};
}
function input(store,candidateSeat=1) {
  const deckA=candidateSeat===0?candidateDecklist.cards:opponentDecklist.cards;
  const deckB=candidateSeat===0?opponentDecklist.cards:candidateDecklist.cards;
  return {
    store,deckA,deckB,candidateSeat,candidateDecklist,opponentDecklist,
    enginePin:ENGINE_PIN
  };
}

test('trusted Store preflight binds both physical 60s and emits only digests/counts',()=>{
  const store=makeStore(1);
  const receipt=createStoreDecklistBindingReceipt(input(store,1));
  assert.equal(receipt.verified,true);
  assert.equal(receipt.source,'trusted-native-store-preflight');
  assert.equal(receipt.candidateSeat,1);
  assert.equal(receipt.opponentSeat,0);
  assert.deepEqual(receipt.checkedPhysicalSeats,[0,1]);
  assert.equal(receipt.zoneCountsBySeat[0].totalCards,60);
  assert.equal(receipt.zoneCountsBySeat[1].totalCards,60);
  assert.equal(receipt.zoneCountsBySeat[0].zoneCounts.active,2);
  assert.equal(receipt.zoneCountsBySeat[0].zoneCounts.hand,1);
  assert.equal(receipt.zoneCountsBySeat[0].zoneCounts.prizes,6);
  assert.equal(receipt.zoneCountsBySeat[0].zoneCounts.deck,51);
  assert.equal(receipt.zoneCountsBySeat[0].zoneCounts.activeTools,0);
  assert.equal(receipt.zoneCountsBySeat[0].zoneCounts.benchTools,0);
  assert.match(receipt.storeStateSha256,/^[0-9a-f]{64}$/);
  assert.match(receipt.fullStateSnapshotSha256,/^[0-9a-f]{64}$/);
  const originalStoreDigest=receipt.storeStateSha256;
  const moved=store.state.players[0].deck.cards.pop();
  store.state.players[0].hand.cards.push(moved);
  const relocated=createStoreDecklistBindingReceipt(input(store,1));
  assert.notEqual(relocated.storeStateSha256,originalStoreDigest,
    'Full Store digest must bind physical zone placement, not only the printed 60');
  const serialized=JSON.stringify(receipt);
  assert.equal(serialized.includes(FLITTLE),false);
  assert.equal(serialized.includes(PSYCHIC),false);
  assert.equal(serialized.includes('cards'),false);
  assert.equal(serialized.includes('zones'),false);
  assert.equal(createStoreDecklistBindingReceipt(input(store,1)).storeStateSha256,
    receipt.storeStateSha256);
});

test('trusted Store preflight binds the opposite candidate physical seat',()=>{
  const store=makeStore(0);
  const receipt=createStoreDecklistBindingReceipt(input(store,0));
  const swapped=createStoreDecklistBindingReceipt(input(store,1));
  assert.equal(receipt.candidateSeat,0);
  assert.equal(receipt.seatBindings[0].role,'candidate');
  assert.equal(receipt.seatBindings[1].role,'opponent');
  assert.notEqual(receipt.storeStateSha256,swapped.storeStateSha256,
    'Swapping candidate physical seat must change the Store binding digest');
});

test('trusted Store preflight rejects missing cards and duplicated physical objects',()=>{
  const missing=makeStore();
  missing.state.players[0].deck.cards.pop();
  assert.throws(()=>createStoreDecklistBindingReceipt(input(missing)),
    /exactly 60 physical cards/);

  const duplicate=makeStore();
  duplicate.state.players[0].hand.cards[0]=duplicate.state.players[0].deck.cards[0];
  assert.throws(()=>createStoreDecklistBindingReceipt(input(duplicate)),
    /appears in more than one native zone/);
});

test('trusted Store preflight rejects an unknown printing and a detached Store snapshot',()=>{
  const unknown=makeStore();
  unknown.state.players[0].deck.cards[0].fullName='Unknown card';
  assert.throws(()=>createStoreDecklistBindingReceipt(input(unknown)),
    /differ from its registered printed 60/);

  const detached=makeStore();
  assert.throws(()=>createStoreDecklistBindingReceipt({
    ...input(detached),state:{...detached.state}
  }),/actual live Store.state object/);
});
