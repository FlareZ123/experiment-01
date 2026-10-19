'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {inspectSecretBoxCategories}=require('../simulation/twinleaf/rank8-secretbox-owner-category-audit.cjs');

function fixture(present,accept=(cards)=>cards.length<=4){
  const all=present.map((name,i)=>({name,fullName:name+' '+i}));
  const owner={deck:{cards:all}};
  const prompt={cards:owner.deck,
    validate:cards=>cards.every(c=>all.includes(c)) && accept(cards)};
  return {owner,prompt,state:{}};
}
test('legitimate four-category owner prompt chooses printed supporter and Tool',()=>{
  const {owner,prompt,state}=fixture(['Quick Ball','Temple of Sinnoh',
    'Crispin','Muscle Band','Roxanne']);
  const result=inspectSecretBoxCategories(prompt,owner,state);
  assert.deepEqual(result.selectedNames,
    ['Quick Ball','Muscle Band','Crispin','Temple of Sinnoh']);
  assert.equal(result.acceptedExtraCategories,2);
  assert.equal(result.allSelectedNativeValidated,true);
});
test('unprized category absence is reported and baseline kept',()=>{
  const {owner,prompt,state}=fixture(['Quick Ball','Temple of Sinnoh']);
  const result=inspectSecretBoxCategories(prompt,owner,state);
  assert.deepEqual(result.availableSupporterNames,[]);
  assert.deepEqual(result.availableToolNames,[]);
  assert.deepEqual(result.selectedNames,['Quick Ball','Temple of Sinnoh']);
  assert.equal(result.acceptedExtraCategories,0);
});
test('native prompt rejection of extra cards cannot be bypassed',()=>{
  const {owner,prompt,state}=fixture(['Quick Ball','Temple of Sinnoh',
    'Guzma','Forest Seal Stone'],cards=>cards.length<=2);
  const result=inspectSecretBoxCategories(prompt,owner,state);
  assert.equal(result.examinedSelections.length,3);
  assert.equal(result.acceptedExtraCategories,0);
  assert.ok(result.examinedSelections.every(r=>!r.accepted));
});
test('if combined extra categories are disallowed preserve a valid single',()=>{
  const {owner,prompt,state}=fixture(['Quick Ball','Temple of Sinnoh',
    'Guzma','Forest Seal Stone'],cards=>cards.length<=3);
  const result=inspectSecretBoxCategories(prompt,owner,state);
  assert.equal(result.acceptedExtraCategories,1);
  assert.equal(result.selectedNames.includes('Guzma'),true);
});
test('refuse an observer that is not the genuine owner-deck prompt',()=>{
  const {owner,prompt,state}=fixture(['Quick Ball','Temple of Sinnoh']);
  assert.throws(()=>inspectSecretBoxCategories({...prompt,cards:{cards:[]}},
    owner,state),/Owner search boundary/);
});
