'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {hasHoodedDoorWindow} =
  require('../simulation/twinleaf/rank8-hooded-door-source-reply.cjs');

/** @param {string|null} name @param {string[]} tools */
function slot(name,tools=[]) {
  return {
    getPokemonCard:()=>name?{name}:null,
    tools:tools.map(item=>({name:item}))
  };
}
function fixture() {
  return {
    own:{
      active:slot('Shadow Rider Calyrex VMAX',['Stealthy Hood']),
      bench:[slot('Shadow Rider Calyrex VMAX',['Float Stone'])],
      hand:{cards:['Battle Compressor','Night Stretcher','Field Blower']
        .map(name=>({name}))}
    },
    opponent:{
      bench:[slot('Garbodor',['Float Stone'])]
    }
  };
}
test('actual public equipped Garbodor and own-hand Hood window is recognized',()=>{
  const state=fixture();
  assert.equal(hasHoodedDoorWindow(state.own,state.opponent),true);
});
test('a VMAX without Hood is not an evidenced protected Ability source',()=>{
  const state=fixture();
  state.own.active.tools=[];
  assert.equal(hasHoodedDoorWindow(state.own,state.opponent),false);
});
test('an unequipped Garbodor is not an exposure to Garbotoxin',()=>{
  const state=fixture();
  state.opponent.bench[0].tools=[];
  assert.equal(hasHoodedDoorWindow(state.own,state.opponent),false);
});
test('held response cards and an available Benched VMAX are required',()=>{
  const state=fixture();
  state.own.hand.cards=state.own.hand.cards.filter(c=>c.name!=='Night Stretcher');
  assert.equal(hasHoodedDoorWindow(state.own,state.opponent),false);
  state.own.hand.cards.push({name:'Night Stretcher'});
  state.own.bench[0].tools=[{name:'Stealthy Hood'}];
  assert.equal(hasHoodedDoorWindow(state.own,state.opponent),false);
});
