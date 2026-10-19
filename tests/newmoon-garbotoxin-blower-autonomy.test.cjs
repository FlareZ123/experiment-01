'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {blowerOpportunity,tooledGarbodor,MEWTWO,BLOWER,GARBODOR}=
  require('../simulation/twinleaf/newmoon-garbotoxin-blower-autonomy.cjs');

function fixture() {
  const own={
    active:{getPokemonCard:()=>({fullName:MEWTWO})},
    hand:{cards:[{fullName:BLOWER},{fullName:'Psychic Energy MEE'}]}
  };
  const slot={
    getPokemonCard:()=>({fullName:GARBODOR}),
    tools:[{name:'Float Stone'}]
  };
  const opponent={bench:[slot]};
  const state={activePlayer:1,phase:7,prompts:[]};
  return {own,slot,opponent,state};
}

test('public Tool-bearing Garbodor plus genuine own hand qualifies',()=>{
  const {own,opponent,state}=fixture();
  assert.equal(blowerOpportunity(state,own,opponent,1,7),true);
  assert.equal(tooledGarbodor(opponent).tools[0].name,'Float Stone');
});

test('a missing held Item cannot trigger a seed-independent response',()=>{
  const {own,opponent,state}=fixture();
  own.hand.cards=[];
  assert.equal(blowerOpportunity(state,own,opponent,1,7),false);
});

test('no equipped Garbodor cannot trigger',()=>{
  const {own,slot,opponent,state}=fixture();
  slot.tools.length=0;
  assert.equal(tooledGarbodor(opponent),undefined);
  assert.equal(blowerOpportunity(state,own,opponent,1,7),false);
});

test('other Active, other player turn, unrelated phase all refuse',()=>{
  const {own,opponent,state}=fixture();
  own.active.getPokemonCard=()=>({fullName:'Gengar & Mimikyu-GX TEU'});
  assert.equal(blowerOpportunity(state,own,opponent,1,7),false);
  own.active.getPokemonCard=()=>({fullName:MEWTWO});
  state.activePlayer=0;
  assert.equal(blowerOpportunity(state,own,opponent,1,7),false);
  state.activePlayer=1;
  state.phase=8;
  assert.equal(blowerOpportunity(state,own,opponent,1,7),false);
});

test('pending prompts must finish before any Item opportunity',()=>{
  const {own,opponent,state}=fixture();
  state.prompts=[{result:undefined}];
  assert.equal(blowerOpportunity(state,own,opponent,1,7),false);
});

test('same public target predicate works beyond first game turn',()=>{
  const {own,opponent,state}=fixture();
  state.turn=14;
  assert.equal(blowerOpportunity(state,own,opponent,1,7),true);
});

test('opt-in any Active allows an owner-legal public Tool response before Mewtwo setup',()=>{
  const {own,opponent,state}=fixture();
  own.active.getPokemonCard=()=>({fullName:'Duskull VIV'});
  assert.equal(blowerOpportunity(state,own,opponent,1,7),false);
  assert.equal(blowerOpportunity(state,own,opponent,1,7,true),true);
  state.prompts=[{result:undefined}];
  assert.equal(blowerOpportunity(state,own,opponent,1,7,true),false);
  state.prompts=[];
  state.activePlayer=0;
  assert.equal(blowerOpportunity(state,own,opponent,1,7,true),false);
  state.activePlayer=1;
  opponent.bench[0].tools=[];
  assert.equal(blowerOpportunity(state,own,opponent,1,7,true),false);
});


test('LTR Garbotoxin printing enables the same public Tool response',()=>{
  const {own,slot,opponent,state}=fixture();
  slot.getPokemonCard=()=>({fullName:'Garbodor LTR'});
  assert.equal(blowerOpportunity(state,own,opponent,1,7),true);
  assert.equal(tooledGarbodor(opponent),slot);
});

test('the policy selects the tooled LTR when a BKP copy is untooled',()=>{
  const {own,slot,opponent,state}=fixture();
  slot.tools=[];
  const ltr={getPokemonCard:()=>({fullName:'Garbodor LTR'}),
    tools:[{name:'Float Stone'}]};
  opponent.bench.push(ltr);
  assert.equal(blowerOpportunity(state,own,opponent,1,7),true);
  assert.equal(tooledGarbodor(opponent),ltr);
});

test('other Garbodor printings are excluded without printed Garbotoxin proof',()=>{
  const {own,slot,opponent,state}=fixture();
  slot.getPokemonCard=()=>({fullName:'Garbodor DRX'});
  assert.equal(blowerOpportunity(state,own,opponent,1,7),false);
  assert.equal(tooledGarbodor(opponent),undefined);
});


test('active Garbotoxin lock is targetable even with an empty opposing Bench',()=>{
  const {own,slot,opponent,state}=fixture();
  slot.getPokemonCard=()=>({fullName:'Garbodor LTR'});
  opponent.active=slot;
  opponent.bench=[];
  assert.equal(blowerOpportunity(state,own,opponent,1,7),true);
  assert.equal(tooledGarbodor(opponent),slot);
  slot.tools=[];
  assert.equal(blowerOpportunity(state,own,opponent,1,7),false);
});
