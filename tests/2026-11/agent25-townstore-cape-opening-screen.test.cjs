'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {COUNT,choose,prizeSuccessCount,screen}=
  require('../../scripts/2026-11/agent25-townstore-cape-opening-screen.cjs');
const original=require('../../results/aichi-2026/2026-11/agent25-cape-sentinel-v1.json');
const variant=require('../../results/aichi-2026/2026-11/agent25-townstore-cape-sentinel-v1.json');

test('category partition, combinations, and no-Prize singleton controls',()=>{
  assert.equal(COUNT.reduce((a,b)=>a+b,0),60);
  assert.equal(choose(60,8),2558620845n);
  assert.equal(choose(52,6),20358520n);
  assert.equal(choose(0,0),1n);
  assert.equal(choose(3,4),0n);
  const drawn=Array(COUNT.length).fill(0);
  assert.equal(prizeSuccessCount(drawn,[6]),choose(51,6));
  assert.equal(prizeSuccessCount(drawn,[6,7]),choose(50,6));
  drawn[6]=1;
  assert.equal(prizeSuccessCount(drawn,[6]),choose(52,6));
});

test('exact Town Store first-eight joint resource screen beats Cape-held Artazon screen',()=>{
  const r=screen();
  assert.ok(Math.abs(r.reference.fraction-0.8614093191286998)<1e-10);
  assert.ok(Math.abs(r.artazonHeldCape.conditionalPercent-1.8089393625853906)<1e-8);
  assert.ok(Math.abs(r.townFetchedCape.conditionalPercent-4.576323655901286)<1e-8);
  assert.ok(Math.abs(r.townToArtazonRatio-2.5298380645333887)<1e-8);
  assert.ok(r.configurationsExamined>100);
  assert.ok(r.limitations.includes('No full-game matches or independently qualified wins'));
});

test('fixed original and challenger 60s differ by exactly one real Stadium printing',()=>{
  const expand=deck=>deck.cards.flatMap(c=>Array(c.count).fill(
    c.category+'|'+c.name+'|'+c.printing.set+'|'+c.printing.number)).sort();
  const a=expand(original),b=expand(variant);
  assert.equal(a.length,60);
  assert.equal(b.length,60);
  assert.deepEqual(a.filter(card=>!b.includes(card)),
    ['Trainer|Temple of Sinnoh|ASR|155']);
  assert.deepEqual(b.filter(card=>!a.includes(card)),
    ['Trainer|Town Store|OBF|196']);
});
