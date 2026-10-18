'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {protectedDoorOpportunity,withProtectedUnderworldDoor}=
  require('../simulation/twinleaf/protected-underworld-door.cjs');

function zone(name,tools=[]) {
  return {getPokemonCard:()=>name?{name,fullName:name+' CRE'}:null,
    tools:tools.map(name=>({name,fullName:name+' UNB'}))};
}
function fixture() {
  return {
    state:{activePlayer:1,phase:2,prompts:[]},
    own:{active:zone('Radiant Eternatus'),
      bench:[zone('Shadow Rider Calyrex VMAX',['Stealthy Hood']),
        zone('Shadow Rider Calyrex VMAX')],
      hand:{cards:[{name:'Psychic Energy'}]}},
    opponent:{active:zone('Mega Absol ex'),
      bench:[zone('Garbodor',['Float Stone'])]}
  };
}

test('finds only a protected Benched VMAX with held Psychic against public equipped Garbodor',()=>{
  const x=fixture();
  assert.deepEqual(protectedDoorOpportunity(x.state,x.own,x.opponent,1,2),
    {index:0,printing:'Shadow Rider Calyrex VMAX CRE'});
});
test('other players turn, wrong phase or pending prompt cannot consume Ability',()=>{
  const x=fixture();
  x.state.activePlayer=0;
  assert.equal(protectedDoorOpportunity(x.state,x.own,x.opponent,1,2),null);
  x.state.activePlayer=1;
  assert.equal(protectedDoorOpportunity(x.state,x.own,x.opponent,1,3),null);
  x.state.prompts=[{result:undefined}];
  assert.equal(protectedDoorOpportunity(x.state,x.own,x.opponent,1,2),null);
});
test('refuses absent hand Psychic, untooled Garbodor or unavailable Hood target',()=>{
  const x=fixture();
  x.own.hand.cards=[];
  assert.equal(protectedDoorOpportunity(x.state,x.own,x.opponent,1,2),null);
  x.own.hand.cards=[{name:'Psychic Energy'}];
  x.opponent.bench[0].tools=[];
  assert.equal(protectedDoorOpportunity(x.state,x.own,x.opponent,1,2),null);
  x.opponent.bench[0].tools=[{name:'Float Stone'}];
  x.own.bench[0].tools=[];
  assert.equal(protectedDoorOpportunity(x.state,x.own,x.opponent,1,2),null);
});
test('rejects malformed seat before accessing compiled engine',()=>{
  assert.throws(()=>withProtectedUnderworldDoor(3,()=>{}),/physical seat/);
});
