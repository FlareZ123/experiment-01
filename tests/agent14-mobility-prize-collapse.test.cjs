'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {namedMobilityPrizeCollapse,auditPinnedSources}=
  require('../simulation/evaluation/agent14-mobility-prize-collapse.cjs');

/** Enumerate tiny unordered card subsets independently from the formula. */
function subsets(a,k){
  if(k===0)return [[]];
  const out=[];
  for(let i=0;i<=a.length-k;i++)
    for(const tail of subsets(a.slice(i+1),k-1))
      out.push([a[i],...tail]);
  return out;
}

test('legal hand and subsequent Prize allocation agree with enumeration',()=>{
  const cards=Array.from({length:10},(_,i)=>i);
  const basic=new Set([0,1,2]);
  const named=new Set([3,4]);
  let good=0,total=0;
  for(const hand of subsets(cards,3)){
    if(!hand.some(x=>basic.has(x)))continue;
    for(const prizes of subsets(cards.filter(x=>!hand.includes(x)),2)){
      total++;
      if([...named].every(x=>prizes.includes(x)))good++;
    }
  }
  const actual=namedMobilityPrizeCollapse(3,2,{
    deckSize:10,handSize:3,prizeSize:2});
  assert.equal(BigInt(actual.exactNumerator),BigInt(good));
  assert.equal(BigInt(actual.exactDenominator),BigInt(total));
});

test('all original 29 printed sources are modelled without game claims',()=>{
  const x=auditPinnedSources();
  const row=n=>x.rows.find(y=>y.rank===n);
  assert.deepEqual(x.countByCopies,
    {'1':2,'2':13,'3':7,'4':2,'5':4,'6':1});
  assert.deepEqual(x.missingSourceRanks,[23,25,28]);
  assert.equal(row(7).basicCount,12);
  assert.equal(row(31).basicCount,15);
  assert.equal(row(11).namedMobilityCount,6);
  assert.ok(Math.abs(row(7).conditionalOnValidSeven-0.100777773799)<1e-11);
  assert.ok(Math.abs(row(31).conditionalOnValidSeven-0.100586175141)<1e-11);
  assert.ok(Math.abs(x.equalWeightConditionalCollapseProbability-
    0.010945841847619497)<1e-11);
  assert.equal(x.competitiveGameQualified,false);
});
