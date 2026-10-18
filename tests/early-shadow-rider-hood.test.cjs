'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {chooseProtectedShadowRider,withEarlyShadowRiderHood} =
  require('../simulation/twinleaf/early-shadow-rider-hood.cjs');

function slot(name,toolNames=[]) {
  return {getPokemonCard:()=> name ? {name,fullName:name+' CRE'} : null,
    tools:toolNames.map(value => ({name:value,fullName:value+' GRI'}))};
}
function example() {
  return {
    own:{hand:{cards:[{name:'Stealthy Hood'}]},
      active:slot('Radiant Eternatus'),
      bench:[slot('Shadow Rider Calyrex V'),slot('Shadow Rider Calyrex VMAX'),
        slot('Tapu Lele-GX')]},
    enemy:{active:slot('Mega Absol ex'),
      bench:[slot('Garbodor',['Float Stone'])]}
  };
}

test('prefers an untooled VMAX and never Radiant Eternatus',()=>{
  const {own,enemy}=example();
  assert.deepEqual(chooseProtectedShadowRider(own,enemy),
    {slot:'BENCH',index:1,pokemon:'Shadow Rider Calyrex VMAX CRE'});
});

test('Basic V is eligible before evolving; preserves existing Tool slot',()=>{
  const {own,enemy}=example();
  own.bench[1]=slot('Shadow Rider Calyrex VMAX',['Float Stone']);
  assert.deepEqual(chooseProtectedShadowRider(own,enemy),
    {slot:'BENCH',index:0,pokemon:'Shadow Rider Calyrex V CRE'});
  own.bench[0]=slot('Shadow Rider Calyrex V',['Stealthy Hood']);
  assert.equal(chooseProtectedShadowRider(own,enemy),null);
});

test('must have live public Tool Garbodor and held Hood',()=>{
  const {own,enemy}=example();
  enemy.bench[0].tools=[];
  assert.equal(chooseProtectedShadowRider(own,enemy),null);
  enemy.bench[0].tools=[{name:'Float Stone'}];
  own.hand.cards=[];
  assert.equal(chooseProtectedShadowRider(own,enemy),null);
});

test('active target is legal if no preferable VMAX',()=>{
  const {own,enemy}=example();
  own.active=slot('Shadow Rider Calyrex V');
  own.bench=[slot('Unown')];
  assert.deepEqual(chooseProtectedShadowRider(own,enemy),
    {slot:'ACTIVE',index:0,pokemon:'Shadow Rider Calyrex V CRE'});
});

test('policy rejects malformed physical seat without loading engine',()=>{
  assert.throws(()=>withEarlyShadowRiderHood(2,()=>{}),/physical candidate seat/);
});
