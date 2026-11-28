'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,publicEventReceipt}=
  require('./agent8-public-event-receipt.cjs');

const emptySlot=()=>({getPokemonCard:()=>undefined});
function state(turn=4,seat=1){
  const makePlayer=id=>({
    id,active:emptySlot(),bench:[],movedToActiveThisTurn:[],
    marker:{hasMarker:()=>false}
  });
  return {turn,activePlayer:seat,players:[makePlayer('A'),makePlayer('B')]};
}
const event=(turn,byAttack=true)=>({
  turn,victimPlayerId:'B',attackerPlayerId:'A',byAttack
});

test('receipt version advertises the KO event-turn contract',()=>{
  assert.equal(VERSION,'agent8-public-event-receipt-v4-ko-turn-stamped');
});

test('legacy native KO booleans are unknown without Store event history',()=>{
  const receipt=publicEventReceipt(state(),1);
  assert.deepEqual(receipt.priorOpponentTurnKO,
    {turn:null,any:null,byAttack:null});
});

test('fresh opponent-turn KO events produce a stamped positive summary',()=>{
  const receipt=publicEventReceipt(state(4),1,null,null,[event(3,true)],3);
  assert.deepEqual(receipt.priorOpponentTurnKO,
    {turn:3,any:true,byAttack:true});
});

test('known-empty preceding turn is false, not unknown',()=>{
  const receipt=publicEventReceipt(state(4),1,null,null,[],3);
  assert.deepEqual(receipt.priorOpponentTurnKO,
    {turn:3,any:false,byAttack:false});
});

test('a stale turn-2 event cannot satisfy actor turn 4',()=>{
  const receipt=publicEventReceipt(state(4),1,null,null,[event(2,true)],2);
  assert.deepEqual(receipt.priorOpponentTurnKO,
    {turn:null,any:null,byAttack:null});
});

test('unknown attack classification does not erase a known KO',()=>{
  const receipt=publicEventReceipt(state(4),1,null,null,[event(3,null)],3);
  assert.deepEqual(receipt.priorOpponentTurnKO,
    {turn:3,any:true,byAttack:null});
});

test('event rows must belong to the receipt owner and opponent',()=>{
  assert.throws(()=>publicEventReceipt(state(4),1,null,null,[{
    turn:3,victimPlayerId:'A',attackerPlayerId:'B',byAttack:true
  }],3));
});

test('turn one cannot claim a preceding opponent KO',()=>{
  const receipt=publicEventReceipt(state(1),1,null,null,[],0);
  assert.deepEqual(receipt.priorOpponentTurnKO,
    {turn:null,any:null,byAttack:null});
});
