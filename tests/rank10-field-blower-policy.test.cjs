'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseFieldBlowerSourceAction}=
  require('../simulation/twinleaf/rank10-field-blower-policy.cjs');

function fakeState() {
  const bench=Array.from({length:5},(_,i)=>({
    getPokemonCard(){return i<3?{name:'Established Basic'}:undefined;}
  }));
  const champion={id:202,bench,hand:{cards:[
    {fullName:'Field Blower GRI'},
    {fullName:'Shadow Rider Calyrex V CRE'},
    {fullName:'Shadow Rider Calyrex V CRE'}]},
    supporter:{cards:[]},stadium:{cards:[]}};
  const opponent={id:101,stadium:{cards:[{fullName:'Parallel City BKT'}]}};
  return {turn:55,phase:2,activePlayer:1,prompts:[],players:[opponent,champion]};
}

test('source locked turn55 yields precise live Stadium removal',()=>{
  const s=fakeState();
  assert.deepEqual(chooseFieldBlowerSourceAction(s,s.players[1]),
    {kind:'remove-parallel-city',handIndex:0});
});

test('after Stadium removal the fourth Bench slot can be filled',()=>{
  const s=fakeState();s.players[0].stadium.cards=[];
  assert.deepEqual(chooseFieldBlowerSourceAction(s,s.players[1]),
    {kind:'bench-shadow-rider',handIndex:1});
  s.players[1].bench[3].getPokemonCard=()=>({name:'occupied'});
  assert.equal(chooseFieldBlowerSourceAction(s,s.players[1]),null);
});

test('other turns, seats, pending prompts and missing resources are ignored',()=>{
  const variants=[
    s=>{s.turn=53;},s=>{s.activePlayer=0;},s=>{s.phase=7;},
    s=>{s.players[1].id=203;},s=>{s.prompts.push({result:undefined});},
    s=>{s.players[1].hand.cards.splice(1);},
    s=>{s.players[1].bench[2].getPokemonCard=()=>undefined;}
  ];
  for(const edit of variants) {
    const s=fakeState();edit(s);
    assert.equal(chooseFieldBlowerSourceAction(s,s.players[1]),null);
  }
});

test('opponent hidden hand and deck are never accessed',()=>{
  const s=fakeState();
  for(const field of ['hand','deck']) {
    Object.defineProperty(s.players[0],field,{get(){
      throw new Error('Opposing hidden zone accessed');
    }});
  }
  assert.equal(chooseFieldBlowerSourceAction(s,s.players[1]).kind,
    'remove-parallel-city');
});
