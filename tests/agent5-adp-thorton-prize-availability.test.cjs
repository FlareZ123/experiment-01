'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const original=require('../results/aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v1.json');
const {choose,availability,VERSION}=
  require('../simulation/evaluation/agent5-adp-thorton-prize-availability.cjs');

/** @param {number} actual @param {number} expected */
function close(actual,expected){
  assert.ok(Math.abs(actual-expected)<1e-12,actual+' != '+expected);
}

test('exact BigInt binomial edge cases and no invented cards',()=>{
  assert.equal(choose(60,6),50063860n);
  assert.equal(choose(60,0),1n);
  assert.equal(choose(6,7),0n);
  assert.throws(()=>choose(-1,2),RangeError);
});

test('full registered 60 yields exactly conditional original-prize gate',()=>{
  const r=availability();
  assert.equal(r.version,VERSION);
  assert.equal(r.startingBasicCount,7);
  assert.equal(r.coreRequired.length,6);
  assert.ok(BigInt(r.validDealPairs)>0n);
  assert.ok(BigInt(r.allCorePairs)>0n);
  assert.ok(BigInt(r.allCorePairs)<BigInt(r.validDealPairs));
  close(r.coreUnprizedFraction,0.8914309022096687);
  close(r.coreAndCapeUnprizedFraction,0.7994542679885778);
  assert.equal(r.claimsGameWin,false);
});

test('adding a second Wild Blaze in the sole VS Seeker slot tests only prize risk',()=>{
  const rows=original.cards.map(x=>({...x})).filter(x=>x.id!=='xy4-109');
  const payload=rows.find(x=>x.id==='xy2-69');
  payload.count=2;
  assert.equal(rows.reduce((n,c)=>n+c.count,0),60);
  const r=availability(rows);
  close(r.coreUnprizedFraction,0.9834075364307595);
  close(r.coreAndCapeUnprizedFraction,0.8833897659996958);
  assert.ok(r.coreUnprizedFraction>availability().coreUnprizedFraction);
  assert.equal(r.claimsGameWin,false);
});

test('reject non-60 and absent Basic openings rather than manufacturing probabilities',()=>{
  assert.throws(()=>availability(original.cards.map(c=>({...c,count:c.count+1}))),
    /true 60-card/);
  const rows=original.cards.map(c=>({...c}));
  rows.find(c=>c.id==='sm12-156').count=0;
  rows.find(c=>c.id==='swsh12-135').count=0;
  rows.find(c=>c.id==='sm2-60').count=0;
  rows.find(c=>c.id==='swsh3-104').count=0;
  rows.find(c=>c.id==='swsh12pt5-152').count+=7;
  assert.equal(rows.reduce((n,c)=>n+c.count,0),60);
  assert.throws(()=>availability(rows),/No legal seven-card Basic opener/);
});
