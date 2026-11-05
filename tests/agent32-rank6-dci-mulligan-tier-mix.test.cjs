'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const m=require('../simulation/evaluation/agent32-rank6-dci-mulligan-tier-mix.cjs');
const prior=require('../simulation/twinleaf/rank6-expanded-opening-coverage.cjs');
const close=(a,b,tol=1e-11)=>assert.ok(Math.abs(a-b)<tol,`${a} vs ${b}`);
const total=row=>m.PATHS.reduce((sum,key)=>sum+row[key],0);
test('first-eight tier probabilities reproduce independent October BigInt frontier',()=>{
  for(const permitted of m.TIERS){
    const groups={thorns:4,thunder:1,dce:1,guzmaHala:2,tagCall:2,
      discards:permitted,other:50-permitted};
    const expected=prior.exactExpandedOpening(groups).total.decimal;
    close(total(m.stratum(permitted,0)),expected,2e-12);
  }
});
test('all tier probabilities remain monotone within either fixed contender',()=>{
  for(const basics of [7,14]){
    const rows=m.TIERS.map(s=>m.evaluate(s,basics));
    assert.ok(rows.every((r,i)=>i===0||r.lower>rows[i-1].lower));
    assert.ok(rows.every(r=>r.upper-r.lower===r.tail||
      Math.abs((r.upper-r.lower)-r.tail)<1e-16));
  }
});
test('seven basic contender grants the opponent more tier-censored source access',()=>{
  for(const s of m.TIERS){
    const a=m.evaluate(s,7),b=m.evaluate(s,14);
    assert.ok(a.lower>b.upper);
    assert.ok(a.byPath.heldGuzmaHala+b.byPath.viaTagCall>0);
  }
});
test('middle discard tier has largest seven-vs-fourteen opening gap',()=>{
  const gaps=m.TIERS.map(s=>m.evaluate(s,7).lower-m.evaluate(s,14).lower);
  assert.equal(gaps.indexOf(Math.max(...gaps)),2);
  close(gaps[2],0.015141572971349,2e-7);
});
test('source print and all five tiers remain fixed',()=>{
  const x=m.main();
  assert.equal(x.rows.length,5);
  assert.equal(x.originalSourceDecks??29,29);
  assert.equal(x.competitiveGamesQualified,0);
  assert.equal(x.baselineSourceGroups.thorns,4);
  assert.equal(x.baselineSourceGroups.discards,7);
});
test('invalid physical source bonus and Basic counts are rejected',()=>{
  assert.throws(()=>m.stratum(51,0));
  assert.throws(()=>m.stratum(0,47));
  assert.throws(()=>m.evaluate(7,0));
  assert.throws(()=>m.evaluate(7,14,47));
});
