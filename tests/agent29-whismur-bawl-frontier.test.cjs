'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {choose,exactBawlAccess}=
  require('../simulation/evaluation/agent29-whismur-bawl-frontier.cjs');

test('integer combinations',()=>{
  assert.equal(choose(60,7),386206920n);
  assert.equal(choose(52,6),20358520n);
  assert.equal(choose(4,2),6n);
});

test('six Energy, four VIP and one Whismur exact gate',()=>{
  const r=exactBawlAccess(6);
  assert.equal(r.unionOpportunity.numerator,'83267482991');
  assert.equal(r.unionOpportunity.denominator,'350637041508');
  const total=r.initialWhismur.probability+
    r.drawnWhismurLatias.probability+r.vipRoute.probability;
  assert.ok(Math.abs(total-r.unionOpportunity.probability)<1e-13);
  assert.equal(r.competitiveQualifiedGames,0);
});

test('Basic-only card-cost sensitivity and zero-Energy negative',()=>{
  const cheap=exactBawlAccess(3),all=exactBawlAccess(6);
  assert.equal(cheap.unionOpportunity.numerator,'68528755801');
  assert.equal(cheap.unionOpportunity.denominator,'495016999776');
  assert.ok(cheap.unionOpportunity.probability<
    all.unionOpportunity.probability);
  assert.equal(exactBawlAccess(0).unionOpportunity.probability,0);
});

test('opening-seven Whismur route has an independent exact marginal',()=>{
  const r=exactBawlAccess(6);
  const all=choose(60,7);
  const numerator=(all-choose(59,7))*53n-
    (choose(54,7)-choose(53,7))*47n;
  const denominator=(all-choose(42,7))*53n;
  const direct=Number(numerator)/Number(denominator);
  assert.ok(Math.abs(direct-r.initialWhismur.probability)<1e-13);
});
