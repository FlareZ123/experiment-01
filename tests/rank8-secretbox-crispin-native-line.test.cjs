'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {canAttemptCrispin,selectCrispinEnergies,
  selectCrispinDarknessAttachment}=
  require('../simulation/twinleaf/rank8-secretbox-crispin-native-line.cjs');

const own=()=>({id:101,supporterTurn:0,
  hand:{cards:[{name:'Crispin'}]},
  active:{getPokemonCard:()=>({name:'Mega Absol ex'})}});
test('source owner turn7 legal-window predicate reads only own hand/board',()=>{
  const state={turn:7,activePlayer:0,prompts:[]};
  assert.equal(canAttemptCrispin(state,own()),true);
  assert.equal(canAttemptCrispin({...state,activePlayer:1},own()),false);
  assert.equal(canAttemptCrispin(state,{...own(),supporterTurn:1}),false);
  assert.equal(canAttemptCrispin({...state,prompts:[{result:undefined}]},own()),false);
});
test('actual owner native search requires distinct named Basic Energies',()=>{
  const cards=[{name:'Darkness Energy'},{name:'Lightning Energy'}];
  const player={deck:{cards}};
  const prompt={cards:player.deck,validate:chosen=>chosen.length===2};
  const result=selectCrispinEnergies(prompt,player);
  assert.equal(result.eligible,true);
  assert.deepEqual(result.cards,cards);
  const other={deck:{cards:[cards[0]]}};
  assert.equal(selectCrispinEnergies({cards:other.deck,
    validate:()=>true},other).eligible,false);
  assert.throws(()=>selectCrispinEnergies(prompt,other),/own deck/);
});
test('native attachment assigns one Darkness card to caller-supplied Active',()=>{
  const dark={name:'Darkness Energy'};
  const prompt={cardList:{cards:[dark,{name:'Lightning Energy'}]},
    validate:assignments=>assignments.length===1 &&
      assignments[0].card===dark};
  const result=selectCrispinDarknessAttachment(prompt,2,1);
  assert.equal(result.eligible,true);
  assert.deepEqual(result.assignments,[{card:dark,to:{player:2,slot:1,index:0}}]);
  assert.equal(selectCrispinDarknessAttachment({
    cardList:{cards:[]},validate:()=>true},2,1).eligible,false);
});
