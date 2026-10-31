'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {conditionalJointHold,originalThornsSupporterOverlap}=
  require('../scripts/agent4-contested-supporter-firstdraw.cjs');

/** Small independent enumeration of actual distinct physical locations. */
function combinations(items,k){
  if(k===0)return [[]];
  if(k>items.length)return [];
  return items.flatMap((head,index)=>
    combinations(items.slice(index+1),k-1).map(tail=>[head,...tail]));
}

function exhaustive({total,basic,first,second,opening,draws}){
  const cards=Array.from({length:total},(_,i)=>
    i<basic?'B':i<basic+first?'P':
      i<basic+first+second?'F':'O');
  const positions=Array.from({length:total},(_,i)=>i);
  let count=0,denominator=0;
  for(const setup of combinations(positions,opening)){
    if(!setup.some(i=>cards[i]==='B'))continue;
    const rest=positions.filter(i=>!setup.includes(i));
    for(const future of combinations(rest,draws)){
      denominator++;
      const held=[...setup,...future].map(i=>cards[i]);
      if(held.includes('P')&&held.includes('F'))count++;
    }
  }
  return {count,denominator};
}

test('all 3 original source 60s carry 4 Thorns, 4 Plumeria and 2 Team Flare',()=>{
  const results=originalThornsSupporterOverlap();
  assert.deepEqual(results.rows.map(x=>x.rank),[6,24,29]);
  for(const row of results.rows){
    assert.deepEqual(row.copies,{basic:4,plumeria:4,flare:2});
    assert.equal(row.source60,60);
    assert.equal(row.firstSeven.numerator,'612457');
    assert.equal(row.firstSeven.denominator,'9643095');
    assert.equal(row.sevenPlusOne.numerator,'820454');
    assert.equal(row.sevenPlusOne.denominator,'9643095');
    assert.equal(row.sevenPlusTwo.numerator,'64225443');
    assert.equal(row.sevenPlusTwo.denominator,'590585996');
    assert.equal(row.sevenPlusOne.simultaneousSupporterPlayPermitted,false);
  }
  assert.equal(results.qualifications.matchupGameWinRateUnverified,true);
});

test('basic-valid seven plus one or two ordinary draws has exact expected numerical opportunity',()=>{
  const row=originalThornsSupporterOverlap().rows[0];
  assert.ok(Math.abs(row.firstSeven.probability-0.06351249261777468)<1e-12);
  assert.ok(Math.abs(row.sevenPlusOne.probability-0.08508201982869608)<1e-12);
  assert.ok(Math.abs(row.sevenPlusTwo.probability-0.1087486723948666)<1e-12);
});

test('physical-label exhaustive enumeration matches all small disjoint pools',()=>{
  let checked=0;
  for(const basic of [1,2])
  for(const first of [1,2])
  for(const second of [1,2])
  for(const draws of [0,1,2]){
    const spec={total:8,basic,first,second,opening:3,draws};
    const formula=conditionalJointHold(spec), brute=exhaustive(spec);
    assert.ok(brute.denominator>0);
    assert.equal(BigInt(formula.numerator)*BigInt(brute.denominator),
      BigInt(formula.denominator)*BigInt(brute.count),
      JSON.stringify(spec));
    checked++;
  }
  assert.equal(checked,24);
});

test('zero event remains an exact zero fraction',()=>{
  const r=conditionalJointHold({
    total:6,basic:1,first:1,second:1,opening:1,draws:0
  });
  assert.deepEqual([r.numerator,r.denominator],['0','1']);
});

test('one future card cannot fill two absent named types',()=>{
  const spec={total:7,basic:1,first:1,second:1,opening:1,draws:1};
  const r=conditionalJointHold(spec);
  assert.equal(r.numerator,'0');
  const brute=exhaustive(spec);
  assert.equal(brute.count,0);
});
