'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  blowerOpportunity,BLOWER,GARBODOR
}=require('../simulation/twinleaf/newmoon-garbotoxin-blower-autonomy.cjs');

function slot(fullName,tools=[]){
  return {tools,getPokemonCard:()=>({fullName})};
}

function fixture(){
  const state={activePlayer:1,phase:7,prompts:[]};
  const own={
    active:slot('Unown AOR'),
    bench:[slot('Mewtwo & Mew-GX')],
    hand:{cards:[{fullName:BLOWER}]}
  };
  const opponent={
    active:slot('Tapu Lele-GX'),
    bench:[slot(GARBODOR,[{name:'Float Stone BKT'}])]
  };
  Object.defineProperty(opponent,'hand',{
    get(){throw new Error('opponent hidden hand must not be read');}
  });
  return {state,own,opponent};
}

test('candidate seat 1 can use Field Blower with Unown Active and Benched Mewtwo when allowed',()=>{
  const {state,own,opponent}=fixture();
  assert.equal(blowerOpportunity(state,own,opponent,1,7,true),true);
});

test('default Mewtwo Active restriction remains in force without allowAnyActiveBlower',()=>{
  const {state,own,opponent}=fixture();
  assert.equal(blowerOpportunity(state,own,opponent,1,7,false),false);
});

test('source seat 0 cannot take the candidate seat 1 opportunity',()=>{
  const {state,own,opponent}=fixture();
  assert.equal(blowerOpportunity(state,own,opponent,0,7,true),false);
});

test('unresolved prompts prevent autonomous Field Blower use',()=>{
  const {state,own,opponent}=fixture();
  state.prompts=[{result:undefined}];
  assert.equal(blowerOpportunity(state,own,opponent,1,7,true),false);
});

test('the opportunity requires a publicly visible Tool-bearing Garbodor',()=>{
  const {state,own,opponent}=fixture();
  opponent.bench=[];
  assert.equal(blowerOpportunity(state,own,opponent,1,7,true),false);
});

test('candidate Field Blower screening never reads the opponent hidden hand',()=>{
  const {state,own,opponent}=fixture();
  assert.doesNotThrow(()=>blowerOpportunity(state,own,opponent,1,7,true));
});
