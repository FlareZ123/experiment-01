'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {installCopycatMultiAttackHistory}=
  require('./copycat-multiattack-history.cjs');
const {copycatPublicEventReceipt}=
  require('./agent47-copycat-v3-receipt-bridge.cjs');
const {validatePublicEventReceipt}=
  require('../evaluation/2026-11/agent49-policy-protocol.cjs');
const {AttackAction}=
  require('../../vendor/twinleaf/ptcg-server/output/game/store/actions/game-actions');

function person(id,card){
  const pokemon=card;
  return {id,active:{getPokemonCard:()=>pokemon},
    bench:[],movedToActiveThisTurn:[],marker:{hasMarker:()=>false},
    // Native marker may remain stale across an opponent's extra turn.
    pokemonKnockedOutDuringOpponentsLastTurn:true,
    pokemonKnockedOutByAttackDuringOpponentsLastTurn:true};
}
function target(cardName,fullName,attack){
  return {name:cardName,fullName,attacks:[attack],powers:[]};
}
function stage(seat,attack){
  const mimikyu=target('Mimikyu','Mimikyu GRI',
    {name:'Copycat',cost:['Colorless','Colorless'],damage:0});
  const regidrago=target('Regidrago VSTAR','Regidrago VSTAR SIT',attack);
  const players=[null,null];
  players[seat]=person(seat===0?'A':'B',mimikyu);
  players[1-seat]=person(seat===0?'B':'A',regidrago);
  const state={turn:2,activePlayer:1-seat,players};
  const store={state,dispatch(action){
    assert.ok(action instanceof AttackAction||
      action?.kind==='end-turn-without-attack');
    state.turn++;
    state.activePlayer=action?.nextSeat??seat;
    return state;
  }};
  const original=store.dispatch;
  const tracker=installCopycatMultiAttackHistory(store);
  return {state,store,tracker,original,
    opponent:players[1-seat],owner:players[seat]};
}
function protocolView(state,seat){
  const active=state.players[seat].active.getPokemonCard();
  return {actorSeat:seat,globalTurn:state.turn,
    ownPublic:{active:{
      name:active.name,printing:active.fullName,attacks:active.attacks
    },bench:[]}};
}
for(const seat of [0,1]){
  test('seat '+seat+' full Store observer → v3 Copycat receipt → strict protocol Apex passes',()=>{
    const x=stage(seat,{name:'Apex Dragon',copycatAttack:true,
      text:'Choose an attack from one Dragon Pokémon in your discard pile.'});
    try{
      x.store.dispatch(new AttackAction(x.opponent.id,'Apex Dragon'));
      const receipt=copycatPublicEventReceipt(x.state,seat,x.tracker);
      const view=protocolView(x.state,seat);
      assert.equal(receipt.opponentLastTurnTurn,2);
      assert.equal(receipt.opponentLastTurnAttacks.length,1);
      assert.equal(receipt.opponentCopycatChoices.length,1);
      assert.deepEqual(receipt.opponentCopycatChoices,
        [receipt.opponentLastTurnAttacks[0]]);
      assert.equal(receipt.mimikyuCopycatCompatible,true);
      assert.equal(receipt.opponentCopycatChoices[0].copycatAttack,true);
      // Deliberately do not elevate the pinned stale KO Boolean into a fact.
      assert.deepEqual(receipt.priorOpponentTurnKO,{any:null,byAttack:null});
      assert.doesNotThrow(()=>validatePublicEventReceipt(receipt,view));
    }finally{x.tracker.restore();}
    assert.strictEqual(x.store.dispatch,x.original);
  });
  test('seat '+seat+' printed native missing-flag GX is excluded across all three layers',()=>{
    const x=stage(seat,{name:'Pale Moon-GX',
      text:"(You can't use more than 1 GX attack in a game.)"});
    try{
      x.store.dispatch(new AttackAction(x.opponent.id,'Pale Moon-GX'));
      const receipt=copycatPublicEventReceipt(x.state,seat,x.tracker);
      assert.equal(receipt.opponentLastTurnAttacks[0].gxAttack,true);
      assert.deepEqual(receipt.opponentCopycatChoices,[]);
      assert.equal(receipt.mimikyuCopycatCompatible,false);
      assert.doesNotThrow(()=>validatePublicEventReceipt(
        receipt,protocolView(x.state,seat)));
    }finally{x.tracker.restore();}
  });
  test('seat '+seat+' no-KO opponent extra turn supersedes earlier Apex history',()=>{
    const x=stage(seat,{name:'Apex Dragon',copycatAttack:true});
    try{
      // Opponent's turn 2 uses copied Timeless and earns an extra turn.
      x.store.dispatch(new AttackAction(x.opponent.id,'Apex Dragon'),1-seat);
      // Opponent's turn 3 finishes without an attack; its turn 2 Apex
      // must no longer be the previous opponent-owned turn on our turn 4.
      x.store.dispatch({kind:'end-turn-without-attack',nextSeat:seat});
      assert.equal(x.state.turn,4);
      const receipt=copycatPublicEventReceipt(x.state,seat,x.tracker);
      assert.equal(receipt.opponentLastTurnTurn,3);
      assert.deepEqual(receipt.opponentLastTurnAttacks,[]);
      assert.deepEqual(receipt.opponentCopycatChoices,[]);
      assert.equal(receipt.mimikyuCopycatCompatible,false);
      assert.doesNotThrow(()=>validatePublicEventReceipt(
        receipt,protocolView(x.state,seat)));
    }finally{x.tracker.restore();}
  });
  test('seat '+seat+' actor extra turn retains latest opponent Apex before t+2',()=>{
    const x=stage(seat,{name:'Apex Dragon',copycatAttack:true});
    try{
      x.store.dispatch(new AttackAction(x.opponent.id,'Apex Dragon'));
      // Current actor t3 consumes a GX and takes an extra actor-owned turn
      // t4; the *last opponent-owned* turn is still t2, not globalTurn-1.
      x.store.dispatch({kind:'end-turn-without-attack',nextSeat:seat});
      assert.equal(x.state.turn,4);
      const receipt=copycatPublicEventReceipt(x.state,seat,x.tracker);
      assert.equal(receipt.opponentLastTurnTurn,2);
      assert.equal(receipt.opponentCopycatChoices.length,1);
      assert.equal(receipt.mimikyuCopycatCompatible,true);
      assert.doesNotThrow(()=>validatePublicEventReceipt(
        receipt,protocolView(x.state,seat)));
    }finally{x.tracker.restore();}
  });
}
test('unavailable source history is unknown, never fabricated as Mimikyu compatibility',()=>{
  const x=stage(0,{name:'Apex Dragon',copycatAttack:true});
  x.state.activePlayer=0;
  try{
    const receipt=copycatPublicEventReceipt(x.state,0,x.tracker);
    assert.equal(receipt.opponentLastTurnTurn,null);
    assert.equal(receipt.opponentLastTurnAttacks,null);
    assert.equal(receipt.opponentCopycatChoices,null);
    assert.equal(receipt.mimikyuCopycatCompatible,null);
    assert.doesNotThrow(()=>validatePublicEventReceipt(
      receipt,protocolView(x.state,0)));
  }finally{x.tracker.restore();}
});
