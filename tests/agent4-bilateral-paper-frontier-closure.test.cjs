'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {registeredNativeSeatDecks}=
  require('../simulation/evaluation/agent41-bilateral-v2-development.cjs');

/** @param {string} name @returns {string[]} */
const sixty=name=>Array.from({length:60},(_,i)=>name+' '+i);

test('registered owner-paper decks follow genuine two-seat candidate placement',()=>{
  const candidate=sixty('candidate'),original=sixty('source');
  const prepared=new Map([['fixed', {plan:{
    candidate:{cards:candidate},
    opponents:[{rank:5,cards:original}]
  }}]]);
  const a=registeredNativeSeatDecks({
    candidateId:'fixed',rank:5,candidateSlot:'A'
  },prepared);
  const b=registeredNativeSeatDecks({
    candidateId:'fixed',rank:5,candidateSlot:'B'
  },prepared);
  assert.deepEqual(a,[candidate,original]);
  assert.deepEqual(b,[original,candidate]);
  assert.notEqual(a[0],candidate);
  assert.notEqual(b[0],original);
  a[0][0]='only local copy changed';
  assert.equal(candidate[0],'candidate 0');
  assert.equal(original[0],'source 0');
});

test('missing or malformed original source is a hard failure',()=>{
  const prepared=new Map([['fixed',{plan:{
    candidate:{cards:sixty('candidate')},
    opponents:[{rank:5,cards:sixty('source').slice(1)}]
  }}]]);
  assert.throws(()=>registeredNativeSeatDecks({
    candidateId:'fixed',rank:5,candidateSlot:'A'
  },prepared),{name:'AssertionError'});
  assert.throws(()=>registeredNativeSeatDecks({
    candidateId:'fixed',rank:11,candidateSlot:'B'
  },prepared),{name:'AssertionError'});
  assert.throws(()=>registeredNativeSeatDecks({
    candidateId:'fixed',rank:5,candidateSlot:'other'
  },prepared),{name:'AssertionError'});
});

test('current bilateral code binds chosen frontier to existing negative-only observer',()=>{
  const source=fs.readFileSync(path.join(__dirname,
    '../simulation/evaluation/agent41-bilateral-v2-development.cjs'),'utf8');
  assert.match(source,/ownerGenericTrainerFrontier,nativeOwnerTrainerFallback,/);
  assert.match(source,/ownerPaperNecessity:ownerGenericTrainerFrontier,/);
  assert.match(source,/ownerTrainerRegisteredSixties:registeredNativeSeatDecks\(\s*trial,prepared\)/);
  assert.equal(source.includes('ownerPaperNecessity=false,'),false);
});
