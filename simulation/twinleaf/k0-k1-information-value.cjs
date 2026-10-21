'use strict';

const assert = require('node:assert/strict');
const {choose} = require('./redeal-posterior.cjs');

/**
 * Exact, optimistic value of learning which unresolved own cards are Prized.
 * Treats the selected plans as remaining executable with no timing change
 * after costed full-deck information. This is a planning upper bound for a
 * provided finite plan menu, not a game-winning policy or action legality.
 *
 * @param {{unknownPool:string[],unknownPrizeCount:number,
 *   uniformUnknownAllocation:true,searchCost:number,plans:Array<{
 *     id:string,requires:string[],availableUtility:number,
 *     missingUtility:number,resourceCost:number}>}} input
 * @returns {object} Exact integer-fraction evidence and diagnostics.
 */
function k0ToK1InformationValue(input) {
  assert.equal(input?.uniformUnknownAllocation,true,
    'Require an explicitly justified uniform K0 Prize allocation');
  const {unknownPool,unknownPrizeCount,searchCost,plans}=input;
  assert.ok(Array.isArray(unknownPool) &&
    unknownPool.every(name=>typeof name==='string'&&name.length>0));
  assert.ok(Number.isSafeInteger(unknownPrizeCount) &&
    unknownPrizeCount>=0 && unknownPrizeCount<=6 &&
    unknownPrizeCount<=unknownPool.length && unknownPool.length<=60);
  assert.ok(Number.isSafeInteger(searchCost) && searchCost>=0);
  assert.ok(Array.isArray(plans) && plans.length>0);
  const ids=new Set();
  for(const plan of plans){
    assert.ok(typeof plan.id==='string'&&plan.id.length>0&&!ids.has(plan.id));
    ids.add(plan.id);
    assert.ok(Array.isArray(plan.requires)&&
      plan.requires.every(name=>typeof name==='string'&&name.length>0));
    assert.equal(new Set(plan.requires).size,plan.requires.length,
      'Repeated required names must be modeled as counts, not duplicate flags');
    for(const key of ['availableUtility','missingUtility','resourceCost']){
      assert.ok(Number.isSafeInteger(plan[key]),'Plan utilities must be integers');
    }
  }
  const named=new Set(unknownPool);
  const tracked=[...new Set(plans.flatMap(p=>p.requires))].sort();
  assert.ok(tracked.length<=4,
    'Only bounded four-printing information menus are modeled');
  for(const name of tracked)assert.ok(named.has(name),
    'Every tested unknown target must occur in the unresolved inventory');
  const counts=tracked.map(name=>unknownPool.filter(c=>c===name).length);
  const other=unknownPool.length-counts.reduce((s,n)=>s+n,0);
  const denominator=choose(unknownPool.length,unknownPrizeCount);
  const expectedByPlan=plans.map(()=>0n);
  let after=0n,states=0,covered=0n;
  const visit=(index,picked,weight,prized)=>{
    if(index===tracked.length){
      const remaining=unknownPrizeCount-picked;
      if(remaining<0||remaining>other)return;
      const w=weight*choose(other,remaining);
      if(w===0n)return;
      covered+=w;states++;
      let maximum=null;
      for(let j=0;j<plans.length;j++){
        const plan=plans[j];
        const meets=plan.requires.every(name=>{
          const at=tracked.indexOf(name);
          return counts[at]-prized[at]>0;
        });
        const utility=BigInt(meets ? plan.availableUtility :
          plan.missingUtility)-BigInt(plan.resourceCost);
        expectedByPlan[j]+=utility*w;
        if(maximum===null||utility>maximum)maximum=utility;
      }
      after+=maximum*w;
      return;
    }
    const count=counts[index];
    for(let n=0;n<=Math.min(count,unknownPrizeCount-picked);n++){
      prized[index]=n;
      visit(index+1,picked+n,weight*choose(count,n),prized);
    }
  };
  visit(0,0,1n,[]);
  assert.equal(covered,denominator,
    'Tracked/other Prize partition must cover every initial allocation');
  const before=expectedByPlan.reduce((a,b)=>a>b?a:b);
  const value=after-before;
  assert.ok(value>=0n,'Perfect information must not reduce optimal menu value');
  const net=value-BigInt(searchCost)*denominator;
  const decimal=n=>Number(n)/Number(denominator);
  return Object.freeze({
    unknownCount:unknownPool.length,unknownPrizeCount,
    trackedPrintings:tracked,nonemptyPrizeOutcomes:states,
    denominator:denominator.toString(),
    withoutInformationNumerator:before.toString(),
    withInformationNumerator:after.toString(),
    grossInformationNumerator:value.toString(),
    netInformationNumerator:net.toString(),
    grossInformationUtility:decimal(value),
    netInformationUtility:decimal(net),
    expectedUtilityWithoutInformation:decimal(before),
    expectedUtilityWithInformation:decimal(after),
    defaultK0Plan:plans[expectedByPlan.findIndex(x=>x===before)].id,
    interpretation:'Finite specified-plan perfect-information potential only; excludes real timing, action legality, support contention and opponent response'
  });
}

module.exports={k0ToK1InformationValue};
