'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const {proxyBounds,pairedDifferenceBounds}=
  require('../scripts/agent42-proxy-field-bounds.cjs');
const {run}=require('../scripts/agent42-missing-opponent-proxy-envelope.cjs');

const ranks=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,
  19,20,21,22,24,26,27,29,30,31,32];

/** @param {(rank:number)=>number} value */
function synthetic(value) {
  return Object.fromEntries(ranks.map(rank=>[rank,value(rank)]));
}

/** @param {Record<string,number>} s */
function completeGrid(s) {
  const f=run();
  const total=ranks.reduce((acc,rank)=>acc+s[rank],0);
  const scores=[];
  for(const r23 of f.regidrago.ranks)
    for(const r28 of f.regidrago.ranks)
      for(const r25 of f.raichu.ranks)
        scores.push((total+s[r23]+s[r28]+s[r25])/32);
  assert.equal(scores.length,162);
  return [Math.min(...scores),Math.max(...scores)];
}

test('proxy bounds exactly equal exhaustive 162 assignments',()=>{
  const s=synthetic(r=>0.2+(r%7)*0.1);
  const r=proxyBounds(s);
  const exhaustive=completeGrid(s);
  assert.ok(Math.abs(r.minimum-exhaustive[0])<1e-12);
  assert.ok(Math.abs(r.maximum-exhaustive[1])<1e-12);
  assert.equal(r.proxyAssignments,162);
  assert.ok(Math.abs(
    r.unboundedOriginalMaximum-r.unboundedOriginalMinimum-3/32)<1e-12);
  assert.equal(r.competitiveQualifiedGames,0);
});

test('both candidates use same missing-rank proxies for margin bounds',()=>{
  const a=synthetic(r=>0.1+(r%5)*0.1);
  const b=synthetic(r=>0.1+(r%3)*0.15);
  const diff=Object.fromEntries(ranks.map(rank=>[rank,a[rank]-b[rank]]));
  const exhaustive=completeGrid(diff);
  const actual=pairedDifferenceBounds(a,b);
  assert.ok(Math.abs(actual.lower-exhaustive[0])<1e-12);
  assert.ok(Math.abs(actual.upper-exhaustive[1])<1e-12);
  assert.equal(actual.proxyAssignments,162);
});

test('incomplete and nonfinite purported matchup score vectors fail closed',()=>{
  const scores=synthetic(()=>0.5);
  delete scores[23];
  assert.doesNotThrow(()=>proxyBounds(scores));
  delete scores[27];
  assert.throws(()=>proxyBounds(scores));
  scores[27]=NaN;
  assert.throws(()=>proxyBounds(scores));
});
