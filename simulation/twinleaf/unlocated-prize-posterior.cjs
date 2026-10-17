'use strict';

const {choose}=require('./redeal-posterior.cjs');

/**
 * Exact conditional Prize-count distribution when the player remembers card
 * identities in face-down Prizes but no longer knows the positional mapping.
 *
 * The unknown pool contains every indistinguishable card copy in the
 * exchangeable deck suffix and unlocated Prize slots. Previous observations
 * expressed as count intervals constrain the multiset of Prizes. Physical
 * Prize positions must NOT also be removed from the pool unless that card and
 * position are separately known and intentionally excluded from this model.
 *
 * This is finite-population counting, not a turn simulator. A caller must
 * separately prove that the residual allocations are uniformly unknown.
 *
 * @param {{
 *   unknownPool:string[],
 *   unknownPrizeCount:number,
 *   targetName:string,
 *   observedPrizeBounds?:Record<string,{min:number,max?:number}>,
 *   uniformUnknownAllocation:true
 * }} observation
 */
function unlocatedPrizePosterior(observation){
  if(observation?.uniformUnknownAllocation!==true)
    throw new Error('Uniform conditional hidden allocation must be established');
  const {unknownPool,unknownPrizeCount,targetName}=observation;
  if(!Array.isArray(unknownPool) ||
      !unknownPool.every(s=>typeof s==='string'&&s.length>0) ||
      !Number.isSafeInteger(unknownPrizeCount)||unknownPrizeCount<0||
      unknownPrizeCount>unknownPool.length||
      typeof targetName!=='string'||targetName.length===0)
    throw new TypeError('Invalid unknown card multiset, Prize count or target');
  const counts=new Map();
  for(const name of unknownPool)counts.set(name,(counts.get(name)||0)+1);
  if(!counts.has(targetName))counts.set(targetName,0);
  const bounds=observation.observedPrizeBounds??{};
  if(bounds===null||typeof bounds!=='object'||Array.isArray(bounds))
    throw new TypeError('Prize observation bounds must be a name-keyed object');
  const normalized=new Map();
  let totalRequired=0;
  for(const name of Object.keys(bounds)){
    const bound=bounds[name];
    const total=counts.get(name)??0;
    if(!bound||typeof bound!=='object'||Array.isArray(bound)||
        !Number.isSafeInteger(bound.min)||bound.min<0||
        !Number.isSafeInteger(bound.max??total)||
        (bound.max??total)<bound.min||(bound.max??total)>total)
      throw new RangeError('Inconsistent observed Prize bounds: '+name);
    normalized.set(name,{min:bound.min,max:bound.max??total});
    totalRequired+=bound.min;
  }
  if(totalRequired>unknownPrizeCount)
    throw new RangeError('Observed minimum Prize identities exceed Prize slots');

  const P=unknownPrizeCount;
  let ways=Array(P+1).fill(0n);
  ways[0]=1n;
  for(const [name,n] of [...counts].sort((a,b)=>a[0].localeCompare(b[0]))){
    if(name===targetName)continue;
    const bound=normalized.get(name)??{min:0,max:n};
    const next=Array(P+1).fill(0n);
    for(let used=0;used<=P;used++){
      if(ways[used]===0n)continue;
      for(let taken=bound.min;taken<=Math.min(bound.max,P-used);taken++){
        next[used+taken]+=ways[used]*choose(n,taken);
      }
    }
    ways=next;
  }
  const targetCopies=counts.get(targetName);
  const {min,max}=normalized.get(targetName)??{min:0,max:targetCopies};
  const distribution=[];
  let denominator=0n;
  let sumPrizeCopies=0n;
  let anyPrize=0n;
  let nextDeckCopies=0n;
  for(let taken=min;taken<=Math.min(max,P);taken++){
    const numerator=choose(targetCopies,taken)*ways[P-taken];
    if(numerator===0n)continue;
    denominator+=numerator;
    sumPrizeCopies+=BigInt(taken)*numerator;
    nextDeckCopies+=BigInt(targetCopies-taken)*numerator;
    if(taken>0)anyPrize+=numerator;
    distribution.push({copies:taken,numerator:numerator.toString()});
  }
  if(denominator===0n)
    throw new RangeError('No physical Prize allocation satisfies observations');

  const remainingDeckCount=unknownPool.length-P;
  return {
    unknownCardCount:unknownPool.length,unknownPrizeCount:P,
    remainingDeckCount,targetName,targetCopies,
    conditionedPhysicalAssignments:denominator.toString(),
    distribution:distribution.map(row=>({
      ...row,denominator:denominator.toString(),
      probability:Number(BigInt(row.numerator))/Number(denominator)
    })),
    anyPrizeProbability:Number(anyPrize)/Number(denominator),
    expectedCopiesPrized:Number(sumPrizeCopies)/Number(denominator),
    nextUnknownDeckProbability:remainingDeckCount>0 ?
      Number(nextDeckCopies)/Number(denominator*BigInt(remainingDeckCount)) : null,
    exactNextUnknownDeckNumerator:nextDeckCopies.toString(),
    exactNextUnknownDeckDenominator:remainingDeckCount>0 ?
      (denominator*BigInt(remainingDeckCount)).toString() : null
  };
}
module.exports={unlocatedPrizePosterior};
