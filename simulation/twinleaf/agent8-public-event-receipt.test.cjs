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
  assert.equal(VERSION,'agent47-public-event-receipt-v5-opponent-owned-ko');
});

test('legacy native KO booleans are unknown without Store event history',()=>{
  const receipt=publicEventReceipt(state(),1);
  assert.deepEqual(receipt.priorOpponentTurnKO,
    {turn:null,any:null,byAttack:null});
});

test('fresh opponent-turn KO events produce a stamped positive summary',()=>{
  const receipt=publicEventReceipt(state(4),1,null,null,[event(3,true)],3,3);
  assert.deepEqual(receipt.priorOpponentTurnKO,
    {turn:3,any:true,byAttack:true});
});

test('known-empty preceding turn is false, not unknown',()=>{
  const receipt=publicEventReceipt(state(4),1,null,null,[],3,3);
  assert.deepEqual(receipt.priorOpponentTurnKO,
    {turn:3,any:false,byAttack:false});
});

test('a stale turn-2 event cannot satisfy actor turn 4',()=>{
  const receipt=publicEventReceipt(state(4),1,null,null,[event(2,true)],2,3);
  assert.deepEqual(receipt.priorOpponentTurnKO,
    {turn:null,any:null,byAttack:null});
});

test('unknown attack classification does not erase a known KO',()=>{
  const receipt=publicEventReceipt(state(4),1,null,null,[event(3,null)],3,3);
  assert.deepEqual(receipt.priorOpponentTurnKO,
    {turn:3,any:true,byAttack:null});
});

test('event rows must belong to the receipt owner and opponent',()=>{
  assert.throws(()=>publicEventReceipt(state(4),1,null,null,[{
    turn:3,victimPlayerId:'A',attackerPlayerId:'B',byAttack:true
  }],3,3));
});

test('turn one cannot claim a preceding opponent KO',()=>{
  const receipt=publicEventReceipt(state(1),1,null,null,[],0);
  assert.deepEqual(receipt.priorOpponentTurnKO,
    {turn:null,any:null,byAttack:null});
});

test('actor consecutive turn accepts earlier certified opponent KO',()=>{
  const receipt=publicEventReceipt(state(4),1,null,null,[event(2,true)],2,2);
  assert.equal(receipt.opponentLastTurnTurn,2);
  assert.equal(receipt.opponentLastTurnOwnerCertified,true);
  assert.deepEqual(receipt.priorOpponentTurnKO,
    {turn:2,any:true,byAttack:true});
});

test('opponent consecutive no-KO turn supersedes prior KO',()=>{
  const receipt=publicEventReceipt(state(4),1,null,null,[],3,3);
  assert.deepEqual(receipt.priorOpponentTurnKO,
    {turn:3,any:false,byAttack:false});
});

test('same KO stamp without separately authenticated owner turn is unknown',()=>{
  const receipt=publicEventReceipt(state(4),1,null,null,[event(3,true)],3);
  assert.deepEqual(receipt.priorOpponentTurnKO,
    {turn:null,any:null,byAttack:null});
  assert.equal(receipt.opponentLastTurnOwnerCertified,false);
});

test('KO freshness is independent of opponent attack tracker availability',()=>{
  const receipt=publicEventReceipt(state(4),1,null,null,[],3,3);
  assert.equal(receipt.opponentLastTurnTurn,3);
  assert.equal(receipt.opponentLastTurnAttacks,null);
  assert.deepEqual(receipt.priorOpponentTurnKO,
    {turn:3,any:false,byAttack:false});
});

test('known stale attack history cannot override certified owner-turn stamp',()=>{
  const row={turn:2,playerId:'A',sourceCardFullName:'Regidrago VSTAR SIT',
    attackName:'Apex Dragon',gxAttack:false,copycatAttack:true};
  assert.throws(()=>publicEventReceipt(state(4),1,[row],2,[],3,3),
    /Attack snapshot must match/);
});
