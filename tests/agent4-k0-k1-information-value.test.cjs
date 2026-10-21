'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {k0ToK1InformationValue}=
  require('../simulation/twinleaf/k0-k1-information-value.cjs');

const plan=(id,requires,availableUtility,missingUtility=0,resourceCost=0)=>
  ({id,requires,availableUtility,missingUtility,resourceCost});
const model=(unknownPool,unknownPrizeCount,plans,searchCost=0)=>
  k0ToK1InformationValue({unknownPool,unknownPrizeCount,plans,searchCost,
    uniformUnknownAllocation:true});

test('one singleton: exact rational value and search-cost threshold',()=>{
  const pool=['Thunder',...Array.from({length:52},(_,i)=>'Other '+i)];
  const result=model(pool,6,[plan('Stadium setup',['Thunder'],12,-8),
    plan('Fallback',[],5,5)]);
  assert.equal(result.denominator,'22957480');
  assert.equal(result.defaultK0Plan,'Stadium setup');
  assert.equal(result.grossInformationUtility,78/53);
  assert.equal(result.expectedUtilityWithoutInformation,516/53);
  assert.equal(result.expectedUtilityWithInformation,594/53);
  assert.ok(model(pool,6,[plan('Stadium setup',['Thunder'],12,-8),
    plan('Fallback',[],5,5)],2).netInformationUtility<0);
});

test('two jointly required singletons yield non-additive information',()=>{
  const result=model(['A','B','C','D'],1,[
    plan('Dual combo',['A','B'],10,0),plan('Safe',[],4,4)],1);
  assert.equal(result.withoutInformationNumerator,'20');
  assert.equal(result.withInformationNumerator,'28');
  assert.equal(result.grossInformationNumerator,'8');
  assert.equal(result.netInformationNumerator,'4');
});

test('one forced plan means information is worth zero within this menu',()=>{
  const result=model(['A','B','C','D'],2,[plan('Forced',['A'],3,-7)]);
  assert.equal(result.grossInformationNumerator,'0');
});

test('one Prize cannot exhaust two identical physical target copies',()=>{
  const result=model(['A','A','C','D'],1,[
    plan('Use available A',['A'],9,-10),plan('Safe',[],3,3)]);
  assert.equal(result.grossInformationNumerator,'0');
  assert.equal(result.expectedUtilityWithoutInformation,9);
});

test('unjustified Prize prior and unknown target are rejected',()=>{
  assert.throws(()=>k0ToK1InformationValue({unknownPool:['A'],
    unknownPrizeCount:1,searchCost:0,plans:[plan('x',['A'],1)]}));
  assert.throws(()=>model(['A'],1,[plan('x',['B'],1)]));
  assert.throws(()=>model(['A'],1,[plan('x',['A','A'],1)]));
});

/** Independent exact enumeration of small physical Prize subsets. */
function brute(pool,p,plans){
  const worlds=[];
  function enumerate(start,chosen){
    if(chosen.length===p){worlds.push([...chosen]);return;}
    for(let i=start;i<pool.length;i++){
      chosen.push(i);enumerate(i+1,chosen);chosen.pop();
    }
  }
  enumerate(0,[]);
  const sums=plans.map(()=>0n);
  let after=0n;
  for(const world of worlds){
    const surviving=pool.filter((_,i)=>!world.includes(i));
    const values=plans.map(q=>BigInt((q.requires.every(target=>
      surviving.includes(target))?q.availableUtility:q.missingUtility)-q.resourceCost));
    for(let i=0;i<values.length;i++)sums[i]+=values[i];
    after+=values.reduce((a,b)=>a>b?a:b);
  }
  const before=sums.reduce((a,b)=>a>b?a:b);
  return {before,after,denominator:BigInt(worlds.length)};
}

test('exact grouped hypergeometric sum equals brute force in 240 small worlds',()=>{
  let seed=19403;
  const next=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;};
  const names=['A','B','C','D'];
  for(let t=0;t<240;t++){
    const size=3+next()%5;
    const pool=Array.from({length:size},()=>names[next()%names.length]);
    const p=next()%Math.min(size+1,7);
    const targets=[...new Set(pool)];
    const options=Array.from({length:1+next()%3},(_,i)=>{
      const req=targets.filter(()=>next()%3===0);
      return plan('P'+i,req,Number(next()%17)-5,
        Number(next()%11)-6,Number(next()%4));
    });
    const actual=model(pool,p,options);
    const expected=brute(pool,p,options);
    assert.equal(actual.denominator,expected.denominator.toString());
    assert.equal(actual.withoutInformationNumerator,expected.before.toString());
    assert.equal(actual.withInformationNumerator,expected.after.toString());
  }
});
