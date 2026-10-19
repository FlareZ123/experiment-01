'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {eligibleGarbodorTarget}=
  require('../simulation/twinleaf/rank11-garbodor-tool-maintenance-policy.cjs');

const SLOT={BOARD:0,ACTIVE:1,BENCH:2};
const PLAYER={ANY:0,TOP_PLAYER:1,BOTTOM_PLAYER:2};

/**
 * Models only the acting player's hand and public Pokémon zones. An attempt
 * to access an opponent-hidden or an owner-unsearched zone must throw.
 * @returns {{state:object,action:object}}
 */
function makeState() {
  const source={
    id:101,
    hand:{cards:[{name:'Float Stone',fullName:'Float Stone BKT'}]},
    active:{getPokemonCard:()=>({name:'Mega Absol ex'}),
      energies:{cards:[{name:'Darkness Energy'}]}},
    bench:[
      {getPokemonCard:()=>({name:'Garbodor'}),tools:[]},
      {getPokemonCard:()=>({name:'Crobat V'}),tools:[]}
    ]
  };
  const opponent={
    id:202,
    active:{getPokemonCard:()=>({name:'Mewtwo & Mew-GX'})}
  };
  for(const player of [source,opponent]) {
    Object.defineProperty(player,'deck',{get(){throw new Error('Hidden deck access');}});
    Object.defineProperty(player,'prizes',{get(){throw new Error('Hidden Prize access');}});
  }
  Object.defineProperty(opponent,'hand',{get(){throw new Error('Opponent-hand oracle');}});
  const state={activePlayer:0,prompts:[],players:[source,opponent]};
  const action={type:'PLAY_CARD_ACTION',id:101,handIndex:0,
    target:{player:PLAYER.BOTTOM_PLAYER,slot:SLOT.ACTIVE,index:0}};
  return {state,action};
}

/** @param {object} state @param {object} action @param {0|1} [seat] */
function eligible(state,action,seat=0) {
  return eligibleGarbodorTarget(state,action,seat,SLOT,PLAYER);
}

test('only source-own-hand legal Float Stone target is redirected',()=>{
  const {state,action}=makeState();
  assert.equal(eligible(state,action),0);
  assert.equal(action.target.slot,SLOT.ACTIVE,
    'Pure selection does not mutate bot choice');
  assert.deepEqual(state.players[0].bench[0].tools,[]);
});

test('accepted action must target current owner Active, from owner hand',()=>{
  const {state,action}=makeState();
  const wrongPlayer={...action,target:{...action.target,player:PLAYER.TOP_PLAYER}};
  assert.equal(eligible(state,wrongPlayer),-1);
  const wrongSlot={...action,target:{...action.target,slot:SLOT.BENCH}};
  assert.equal(eligible(state,wrongSlot),-1);
  const wrongCard={...action,handIndex:1};
  assert.equal(eligible(state,wrongCard),-1);
  const wrongType={...action,type:'ATTACK_ACTION'};
  assert.equal(eligible(state,wrongType),-1);
});

test('a live prompt or other actor prevents source retarget',()=>{
  const {state,action}=makeState();
  state.prompts=[{result:undefined}];
  assert.equal(eligible(state,action),-1);
  state.prompts=[];
  state.activePlayer=1;
  assert.equal(eligible(state,action),-1);
});

test('must have printed target threat, underpowered Mega Absol and Tool-less Garbo',()=>{
  const {state,action}=makeState();
  state.players[0].active.getPokemonCard=()=>({name:'Oranguru V'});
  assert.equal(eligible(state,action),-1);
  state.players[0].active.getPokemonCard=()=>({name:'Mega Absol ex'});
  state.players[0].active.energies.cards.push({name:'Darkness Energy'});
  assert.equal(eligible(state,action),-1);
  state.players[0].active.energies.cards=[{name:'Double Turbo Energy'}];
  assert.equal(eligible(state,action),-1);
  state.players[0].active.energies.cards=[{name:'Darkness Energy'}];
  state.players[1].active.getPokemonCard=()=>({name:'Iron Thorns ex'});
  assert.equal(eligible(state,action),-1);
  state.players[1].active.getPokemonCard=()=>({name:'Mewtwo & Mew-GX'});
  state.players[0].bench[0].tools=[{name:'Forest Seal Stone'}];
  assert.equal(eligible(state,action),-1);
});

test('selects first available public Tool-less Garbodor slot only',()=>{
  const {state,action}=makeState();
  state.players[0].bench[0].tools=[{name:'Float Stone'}];
  state.players[0].bench[1].getPokemonCard=()=>({name:'Garbodor'});
  assert.equal(eligible(state,action),1);
  state.players[0].bench[1].tools=[{name:'Stealthy Hood'}];
  assert.equal(eligible(state,action),-1);
});

test('the same owner/public-board rule works from physical source seat B',()=>{
  const {state,action}=makeState();
  state.players.reverse();
  state.activePlayer=1;
  assert.equal(eligible(state,action,1),0);
});

test('candidate and source hidden deck/Prize contents are never read',()=>{
  const {state,action}=makeState();
  assert.doesNotThrow(()=>eligible(state,action));
  assert.equal(eligible(state,action),0);
});
