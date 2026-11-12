'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');

const native=name=>require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output',name));
const {StateUtils}=native('game/store/state-utils');
const {PlayCardAction,PlayerType,SlotType}=
  native('game/store/actions/play-card-action');
const {UseAbilityAction}=native('game/store/actions/game-actions');

function player(id){
  return {
    id,
    active:{zone:id+':active'},
    bench:[{zone:id+':bench-0'},{zone:id+':bench-1'}]
  };
}

test('pinned PlayerType targets are actor-relative for both physical seats',()=>{
  const bottom=player(101),top=player(202);
  const state={players:[bottom,top]};
  for(const actor of state.players){
    const opponent=state.players.find(p=>p.id!==actor.id);
    assert.strictEqual(StateUtils.getTarget(state,actor,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
    }),actor.active);
    assert.strictEqual(StateUtils.getTarget(state,actor,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0
    }),actor.bench[0]);
    assert.strictEqual(StateUtils.getTarget(state,actor,{
      player:PlayerType.TOP_PLAYER,slot:SlotType.ACTIVE,index:0
    }),opponent.active);
    assert.strictEqual(StateUtils.getTarget(state,actor,{
      player:PlayerType.TOP_PLAYER,slot:SlotType.BENCH,index:0
    }),opponent.bench[0]);
  }
});

test('actual PlayCardAction and UseAbilityAction own targets resolve to the acting player from either seat',()=>{
  const bottom=player(101),top=player(202);
  const state={players:[bottom,top]};
  for(const actor of state.players){
    const target={
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0
    };
    const play=new PlayCardAction(actor.id,0,target);
    const ability=new UseAbilityAction(actor.id,'Underworld Door',target);
    assert.strictEqual(StateUtils.getTarget(state,actor,play.target),
      actor.bench[0], 'PlayCardAction must target the acting owner');
    assert.strictEqual(StateUtils.getTarget(state,actor,ability.target),
      actor.bench[0], 'UseAbilityAction must target the acting owner');
  }
});

test('the former physical-seat-to-PlayerType mapping demonstrably targets the opponent for seat 1',()=>{
  const bottom=player(101),top=player(202);
  const state={players:[bottom,top]};
  const formerSeatOneTarget={
    player:PlayerType.TOP_PLAYER,slot:SlotType.BENCH,index:0
  };
  assert.strictEqual(StateUtils.getTarget(state,top,formerSeatOneTarget),
    bottom.bench[0]);
  assert.notStrictEqual(StateUtils.getTarget(state,top,formerSeatOneTarget),
    top.bench[0]);
});
