'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {visibleBasicBenchResponse}=
  require('../simulation/twinleaf/visible-lock-basic-bench-response.cjs');

const enums={superTrainer:2,superEnergy:3,superPokemon:1,
  item:0,supporter:1,stadium:2,tool:3,specialEnergy:1,
  basicStage:2,abilityPowerType:2,bottomPlayerType:2,benchSlotType:2};
const stadium={fullName:'Thunder Mountain Prism Star LOT',
  superType:2,trainerType:2};
const basicWithAbility={fullName:'Iron Thorns ex TWM',
  superType:1,stage:2,powers:[{powerType:2}]};
const basicWithoutAbility={fullName:'Wobbuffet PHF',
  superType:1,stage:2,powers:[]};
const handCards=[stadium,basicWithAbility,basicWithoutAbility];
const makePlayCard=(id,handIndex,target)=>
  ({type:'PLAY_CARD_ACTION',id,handIndex,target});
function fixture(){
  return {turn:3,players:[{
    id:202,cannotPlayStadiumCards:true,cannotPlayPokemonCards:false,
    cannotPlayPokemonWithAbilities:false,
    hand:{cards:[...handCards]},
    bench:Array.from({length:5},()=>({cards:[]}))
  }]};
}
const original=makePlayCard(202,0,{player:0,slot:0,index:0});

test('locked source Stadium can fall through to actual-hand Basic Bench',()=>{
  const state=fixture(),owner=state.players[0];
  const handSnapshot=[...owner.hand.cards];
  const result=visibleBasicBenchResponse(
    state,owner,original,enums,makePlayCard);
  assert.deepEqual(result,{
    action:makePlayCard(202,1,{player:2,slot:2,index:0}),
    card:'Iron Thorns ex TWM',benchSlot:0
  });
  assert.deepEqual(owner.hand.cards,handSnapshot);
  assert.equal(owner.bench.every(slot=>slot.cards.length===0),true);
});

test('Bench slots and other-player identity are authoritative',()=>{
  const state=fixture(),owner=state.players[0];
  owner.bench.forEach(slot=>slot.cards.push('occupied'));
  assert.equal(visibleBasicBenchResponse(
    state,owner,original,enums,makePlayCard),null);
  owner.bench[3].cards.length=0;
  assert.equal(visibleBasicBenchResponse(
    state,owner,{...original,id:1},enums,makePlayCard),null);
  assert.equal(visibleBasicBenchResponse(
    state,owner,original,enums,makePlayCard).benchSlot,3);
});

test('Pokémon play lock disables the Basic alternative',()=>{
  const state=fixture(),owner=state.players[0];
  owner.cannotPlayPokemonCards=true;
  assert.equal(visibleBasicBenchResponse(
    state,owner,original,enums,makePlayCard),null);
});

test('ability-bearing Basic is avoided when player Ability-play locked',()=>{
  const state=fixture(),owner=state.players[0];
  owner.cannotPlayPokemonWithAbilities=true;
  assert.equal(visibleBasicBenchResponse(
    state,owner,original,enums,makePlayCard).card,'Wobbuffet PHF');
  owner.hand.cards.pop();
  assert.equal(visibleBasicBenchResponse(
    state,owner,original,enums,makePlayCard),null);
});

test('no fallback without a real forbidden owner-hand play',()=>{
  const state=fixture(),owner=state.players[0];
  owner.cannotPlayStadiumCards=false;
  assert.equal(visibleBasicBenchResponse(
    state,owner,original,enums,makePlayCard),null);
  owner.cannotPlayStadiumCards=true;
  assert.equal(visibleBasicBenchResponse(
    state,owner,{...original,type:'ATTACK_ACTION'},enums,makePlayCard),null);
});
