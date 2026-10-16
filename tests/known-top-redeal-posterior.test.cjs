'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {knownTopRedealPosterior}=require('../simulation/twinleaf/known-top-redeal-posterior.cjs');
const base={oldPrizes:Array(6).fill('Old'),target:'X',uniformUnknownSuffix:true};
test('remembered target in Prize replacement prefix is certain',()=>{
 const r=knownTopRedealPosterior({...base,knownTop:['X'],unknownSuffix:Array(45).fill('O')});
 assert.equal(r.anyTargetProbability,1);
 assert.deepEqual(r.distribution.map(x=>x.targetCopies),[1]);
});
test('known non-target prefix reduces uniform unknown replacement count',()=>{
 const r=knownTopRedealPosterior({...base,knownTop:['O'],
  unknownSuffix:['X',...Array(44).fill('O')]});
 assert.equal(r.anyTargetProbability,5/45);
 assert.equal(r.knownNewPrizeCount,1);
 assert.equal(r.unknownNewPrizeCount,5);
});
test('known cards below replacement prefix remain known at new deck top',()=>{
 const r=knownTopRedealPosterior({...base,knownTop:['A','B','C','D','E','F','X'],
  unknownSuffix:Array(39).fill('O')});
 assert.equal(r.anyTargetProbability,0);
 assert.deepEqual(r.knownDrawTop,['X']);
});
