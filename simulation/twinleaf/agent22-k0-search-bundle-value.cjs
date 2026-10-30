'use strict';
const assert=require('node:assert/strict');
const {choose}=require('./redeal-posterior.cjs');

const VERSION='agent22-k0-unrestricted-search-marginal-hypergeometric-v1';

/**
 * Exact multivariate-hypergeometric expectation of a small unrestricted,
 * at-least-one-card, own-deck search with additive diminishing card rewards.
 * This is a belief calculation only, never a physical-Store card selector.
 * Its caller must establish an honestly observed K0 inventory and the
 * explicit uniform unknown Prize allocation premise.
 *
 * @param {{inventory:{pool:string[],observedDeckPrintings:string[],
 *   deckCount:number,prizeCount:number},uniformUnknownAllocation:true,
 *   ownHand:string[],weights:Record<string,number>,
 *   perCardCost:number,maxCards:number}} input
 * @returns {object}
 */
function expectedK0UnrestrictedSearchValue(input){
  assert.equal(input?.uniformUnknownAllocation,true);
  const inventory=input.inventory;
  assert.ok(inventory&&Array.isArray(inventory.pool)&&
    Array.isArray(inventory.observedDeckPrintings));
  const {pool,observedDeckPrintings,deckCount,prizeCount}=inventory;
  assert.ok([...pool,...observedDeckPrintings,...input.ownHand]
    .every(x=>typeof x==='string'&&x.length>0));
  assert.ok(Number.isInteger(deckCount)&&deckCount>=0&&
    Number.isInteger(prizeCount)&&prizeCount>=0&&prizeCount<=6&&
    pool.length===deckCount+prizeCount&&pool.length<=60);
  assert.ok(input.weights&&typeof input.weights==='object'&&
    !Array.isArray(input.weights));
  assert.ok(Object.values(input.weights).every(x=>
    Number.isFinite(x)&&x>=0));
  assert.ok(Number.isFinite(input.perCardCost)&&input.perCardCost>=0);
  assert.ok(Number.isInteger(input.maxCards)&&input.maxCards>=1&&
    input.maxCards<=3);
  assert.ok(deckCount+observedDeckPrintings.length>=1,
    'An unrestricted any-card search must have an eligible deck card');

  const groups=Object.entries(input.weights).filter(([,w])=>w>0);
  assert.ok(groups.length<=6,'At most six valued printings supported');
  const count=(cards,name)=>cards.filter(card=>card===name).length;
  const valued=groups.map(([name,weight])=>({
    name,weight,unknown:count(pool,name),
    known:count(observedDeckPrintings,name),
    held:count(input.ownHand,name)
  }));
  const unknownValued=valued.reduce((n,g)=>n+g.unknown,0);
  const unvalued=pool.length-unknownValued;
  const denominator=choose(pool.length,prizeCount);
  assert.ok(denominator>0n);
  let enumerated=0,positive=0,score=0,selected=0,totalWays=0n;
  const prized=Array(valued.length).fill(0);

  function visit(index,assigned,ways){
    if(index<valued.length){
      const g=valued[index];
      const limit=Math.min(g.unknown,prizeCount-assigned);
      for(let j=0;j<=limit;j++){
        prized[index]=j;
        visit(index+1,assigned+j,ways*choose(g.unknown,j));
      }
      return;
    }
    const multiplicity=ways*choose(unvalued,prizeCount-assigned);
    if(multiplicity===0n)return;
    totalWays+=multiplicity;enumerated++;
    const increments=[];
    for(let i=0;i<valued.length;i++){
      const g=valued[i];
      const available=g.known+g.unknown-prized[i];
      for(let j=0;j<Math.min(input.maxCards,available);j++){
        const value=g.weight/(1+g.held+j)-input.perCardCost;
        increments.push(value);
      }
    }
    const unweightedAvailable=unvalued-
      (prizeCount-assigned);
    if(unweightedAvailable>0)increments.push(-input.perCardCost);
    increments.sort((a,b)=>b-a);
    // 2026 paper rule: unrestricted any-card search takes at least one.
    // Take additional copies only when their marginal utility is positive.
    const use=[increments[0],...increments.slice(1,input.maxCards)
      .filter(v=>v>0)];
    const utility=use.reduce((n,v)=>n+v,0);
    const probability=Number(multiplicity)/Number(denominator);
    score+=probability*utility;
    selected+=probability*use.length;
    if(utility>0)positive+=probability;
  }
  visit(0,0,1n);
  assert.equal(totalWays,denominator,
    'Marginalized Prize assignments must partition the K0 sample space');
  return {version:VERSION,expectedValue:score,
    probabilityPositiveValue:positive,expectedCardsChosen:selected,
    exactPrizeAllocationsEnumerated:enumerated,
    exactDenominator:denominator.toString(),
    supportedValuedPrintings:valued.map(g=>g.name),
    explicitUniformUnknownAllocation:true,
    excludesRootActionOpportunityCosts:true};
}

module.exports={VERSION,expectedK0UnrestrictedSearchValue};
