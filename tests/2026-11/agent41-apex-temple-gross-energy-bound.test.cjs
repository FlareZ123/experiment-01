'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  grossAttachedBasics,templeField,analyze
}=require('../../results/aichi-2026/2026-11/agent41-apex-temple-conditional-stress.cjs');

test('Double Dragon is colorless only under surviving Temple; gross Basic GGF threshold fails',()=>{
  const t=[
    [1,'attach',['Regidrago V','Double Dragon Energy']],
    [2,'attach',['Regidrago VSTAR','Double Dragon Energy']]
  ];
  assert.deepEqual(grossAttachedBasics(t),{grass:0,fire:0,hasRequiredGross:false});
});

test('gross counts all Basic attachments, including onto non-Regidrago, conservatively',()=>{
  const t=[
    [1,'attach',['Latias ex','Basic Fire Energy']],
    [1,'celestial roar',['Basic Grass Energy','Double Dragon Energy','Giratina-EX']],
    [2,'crispin',['Basic Grass Energy','Basic Fire Energy']],
    [2,'attach',['Regidrago V','Double Dragon Energy']]
  ];
  assert.deepEqual(grossAttachedBasics(t),{grass:2,fire:1,hasRequiredGross:true});
});

test('five original Aichi Top32 listings among 29 known contain 9 Temple printings',()=>{
  const f=templeField();
  assert.equal(f.originalDecksAvailable,29);
  assert.deepEqual(f.ranks.map(x=>x.rank),[3,8,11,16,22]);
  assert.equal(f.ranks.reduce((s,x)=>s+x.templeCopies,0),9);
});

test('exact fixed60 seeded Apex screen contains provably Temple-unpayable nominal Apex lines',()=>{
  const r=analyze({trials:150,seed:27112028,scenario:'clean',second:false,policy:'greedy'});
  assert.equal(r.ready,64);
  assert.equal(r.nominalApex,61);
  assert.equal(r.apexGrossRequired,4);
  assert.equal(r.apexProvablyBlocked,57);
  assert.deepEqual(r.samples[0],{
    physicalSeed:2681547797,grassAttachedAnywhere:0,fireAttachedAnywhere:0
  });
});
