'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,readRegistration,summarize}=
  require('../../simulation/evaluation/2026-11/agent38-hood-drapion-vs-source-mew-mail-native.cjs');

test('registered one-card structural swap preserves exact 60 across 16 new source deals',()=>{
  const {r,hood,variant,registrationSha256}=readRegistration();
  assert.equal(VERSION,r.schema);
  assert.equal(registrationSha256.length,64);
  assert.equal(r.expectedNativeGames,32);
  assert.equal(new Set(r.groups.map(x=>x.seed)).size,16);
  assert.equal(hood.cards.reduce((n,c)=>n+c.count,0),60);
  assert.equal(variant.cards.reduce((n,c)=>n+c.count,0),60);
});

test('Drapion attack is counted only from accepted Store root, not deck inclusion',()=>{
  const trial={candidateSlot:'A'};
  const x=summarize({trial,rootActionLedger:[
    {playerSlot:0,action:'PlayCardAction',card:'Drapion V LOR'},
    {playerSlot:0,action:'AttackAction',attack:'Dynamic Tail'},
    {playerSlot:1,action:'AttackAction',attack:'Dynamic Tail'},
    {playerSlot:0,action:'PlayCardAction',card:'Shadow Rider Calyrex V CRE'}],
    finished:false,sourceDealFingerprint:'source',
    fullPhysicalDealFingerprint:'both',attackDeclarations:{candidate:1,source:0}});
  assert.equal(x.candidateSeat,0);
  assert.equal(x.acceptedDrapionPlayRoots.length,1);
  assert.equal(x.acceptedDrapionDynamicTailRoots.length,1);
  assert.equal(x.finished,false);
  assert.equal(x.candidateWon,null);
});
