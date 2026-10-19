'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseProtectedShadowRider,withEarlyShadowRiderHood}=
  require('../simulation/twinleaf/early-shadow-rider-hood.cjs');
const {protectedDoorOpportunity,withProtectedUnderworldDoor}=
  require('../simulation/twinleaf/protected-underworld-door.cjs');

/** @param {string} name @param {string[]} [tools] */
function zone(name,tools=[]) {
  return {getPokemonCard:()=>name?{name,fullName:name+' TEST'}:null,
    tools:tools.map(name=>({name,fullName:name+' TEST'}))};
}
/** @returns {object} Own-hand and public opponent fixture. */
function fixture() {
  return {
    own:{active:zone('Shadow Rider Calyrex V'),
      bench:[zone('Shadow Rider Calyrex VMAX'),
        zone('Shadow Rider Calyrex V')],
      hand:{cards:[{name:'Stealthy Hood'},{name:'Psychic Energy'}]}},
    opponent:{active:zone('Iron Thorns ex'),bench:[zone('Garbodor')]},
    state:{activePlayer:1,phase:2,prompts:[]}
  };
}
test('live Active Thorns chooses untooled Benched VMAX, never Active',()=>{
  const x=fixture();
  assert.deepEqual(chooseProtectedShadowRider(x.own,x.opponent,'initialization'),
    {slot:'BENCH',index:0,pokemon:'Shadow Rider Calyrex VMAX TEST'});
});
test('active switch off Thorns ends owner-only response',()=>{
  const x=fixture();
  x.opponent.active=zone('Iron Thorns ex');
  x.opponent.bench=[zone('Garbodor',['Float Stone'])];
  assert.deepEqual(chooseProtectedShadowRider(x.own,x.opponent),
    {slot:'BENCH',index:0,pokemon:'Shadow Rider Calyrex VMAX TEST'});
  x.opponent.active=zone('Trubbish');
  x.opponent.bench=[zone('Iron Thorns ex')];
  assert.equal(chooseProtectedShadowRider(x.own,x.opponent,'initialization'),null);
});
test('full Bench tools, absent Hood and missing psychic fail closed',()=>{
  const x=fixture();
  x.own.bench[0].tools=[{name:'Float Stone'}];
  assert.deepEqual(chooseProtectedShadowRider(x.own,x.opponent,'initialization'),
    {slot:'BENCH',index:1,pokemon:'Shadow Rider Calyrex V TEST'});
  x.own.bench[1].tools=[{name:'Forest Seal Stone'}];
  assert.equal(chooseProtectedShadowRider(x.own,x.opponent,'initialization'),null);
  x.own.bench[0].tools=[{name:'Stealthy Hood'}];
  assert.deepEqual(protectedDoorOpportunity(x.state,x.own,x.opponent,1,2,'initialization'),
    {index:0,printing:'Shadow Rider Calyrex VMAX TEST'});
  x.own.hand.cards=[{name:'Stealthy Hood'}];
  assert.equal(protectedDoorOpportunity(x.state,x.own,x.opponent,1,2,'initialization'),null);
});
test('protected Door requires Active Thorns and an attached Hood on Benched VMAX',()=>{
  const x=fixture();
  x.own.bench[0].tools=[{name:'Stealthy Hood'}];
  assert.deepEqual(protectedDoorOpportunity(x.state,x.own,x.opponent,1,2,'initialization'),
    {index:0,printing:'Shadow Rider Calyrex VMAX TEST'});
  x.opponent.active=zone('Iron Thorns ex');
  x.state.activePlayer=0;
  assert.equal(protectedDoorOpportunity(x.state,x.own,x.opponent,1,2,'initialization'),null);
  x.state.activePlayer=1;
  x.opponent.active=zone('Garbodor',['Float Stone']);
  assert.equal(protectedDoorOpportunity(x.state,x.own,x.opponent,1,2,'initialization'),null);
  assert.deepEqual(protectedDoorOpportunity(x.state,x.own,x.opponent,1,2),
    {index:0,printing:'Shadow Rider Calyrex VMAX TEST'});
});
test('both wrappers reject invalid lockKind before requiring the compiled Store',()=>{
  assert.throws(()=>withEarlyShadowRiderHood(1,()=>{}, {lockKind:'unknown'}),
    /Unknown source lock/);
  assert.throws(()=>withProtectedUnderworldDoor(1,()=>{}, {lockKind:'unknown'}),
    /Unknown source lock/);
});
