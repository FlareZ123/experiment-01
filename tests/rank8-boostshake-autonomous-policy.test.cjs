'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {inspectBoostShakeWindow}=
  require('../simulation/twinleaf/rank8-boostshake-autonomous-policy.cjs');

/** @param {string|null} name @param {string[]} [tools] */
function slot(name,tools=[]) {
  return {getPokemonCard:()=>name?{name}:null,
    tools:tools.map(name=>({name}))};
}
function state() {
  return {hand:{cards:['Boost Shake','Dark Patch','VS Seeker','Iono',
    'Secret Box','Float Stone'].map(name=>({name}))},
  bench:[slot('Mega Absol ex'),slot('Tapu Koko'),slot('Dedenne-GX'),
    slot('Mega Absol ex'),slot(null)]};
}
test('source-dealt six-card hand has a seed-independent, owner-visible lock route',()=>{
  const own=state();
  const found=inspectBoostShakeWindow(own);
  assert.equal(found.eligible,true);
  assert.deepEqual(found.discardNames,['Dark Patch','VS Seeker','Iono']);
});
test('do not spend scarce cards when full Bench, existing lock or core absent',()=>{
  const own=state();
  own.bench[4]=slot('Trubbish');
  assert.equal(inspectBoostShakeWindow(own).eligible,false);
  own.bench[4]=slot(null);
  own.bench[0]=slot('Garbodor',['Float Stone']);
  assert.equal(inspectBoostShakeWindow(own).eligible,false);
  own.bench[0]=slot('Mega Absol ex');
  own.hand.cards=own.hand.cards.filter(c=>c.name!=='Boost Shake');
  assert.equal(inspectBoostShakeWindow(own).eligible,false);
});
test('require explicit designated disposables without hidden-deck inspection',()=>{
  const own=state();
  own.hand.cards=own.hand.cards.filter(c=>!['Iono','Dark Patch'].includes(c.name));
  assert.equal(inspectBoostShakeWindow(own).eligible,false);
  own.hand.cards.push({name:'Darkness Energy'}, {name:'Battle Compressor'});
  assert.deepEqual(inspectBoostShakeWindow(own).discardNames,
    ['VS Seeker','Darkness Energy','Battle Compressor']);
});
