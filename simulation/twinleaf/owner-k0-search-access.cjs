'use strict';

const {choose}=require('./redeal-posterior.cjs');

/**
 * Require a K0 inventory assembled from actor-owned/observed physical zones,
 * and a separate affirmative uniform allocation premise.
 *
 * @param {object} input
 * @returns {object}
 */
function validBelief(input) {
  if(input?.uniformUnknownAllocation!==true)
    throw new Error('Uniform unknown Prize allocation must be substantiated');
  const belief=input.inventory;
  if(!belief||!Array.isArray(belief.pool)||
      !belief.pool.every(x=>typeof x==='string'&&x.length>0)||
      !Array.isArray(belief.observedDeckPrintings)||
      !belief.observedDeckPrintings.every(x=>
        typeof x==='string'&&x.length>0)||
      !Number.isSafeInteger(belief.deckCount)||
      !Number.isSafeInteger(belief.prizeCount)||
      belief.deckCount<0||belief.prizeCount<0||
      belief.pool.length!==belief.deckCount+belief.prizeCount||
      belief.pool.length>60)
    throw new TypeError('Complete owner K0 inventory required');
  return belief;
}

/** @param {string[]} names */
function targetSet(names) {
  if(!Array.isArray(names)||names.length<1||
      !names.every(x=>typeof x==='string'&&x.length>0)||
      new Set(names).size!==names.length)
    throw new TypeError('Nonempty, unique target printing names required');
  return new Set(names);
}

/**
 * Probability of accessing at least minRequired eligible physical cards in
 * the owner's own deck before any actual owner deck search. A copied card
 * already known to be physically in the deck counts deterministically.
 *
 * @param {{inventory:object,eligiblePrintings:string[],
 *   minRequired:number,uniformUnknownAllocation:true}} input
 * @returns {object} Exact rational and real-valued expectation.
 */
function k0TargetCountAccess(input) {
  const belief=validBelief(input),eligible=targetSet(input.eligiblePrintings);
  const R=input.minRequired;
  if(!Number.isSafeInteger(R)||R<1||R>60)
    throw new TypeError('minRequired must be a positive integer <=60');
  const N=belief.pool.length,P=belief.prizeCount,D=belief.deckCount;
  const K=belief.pool.filter(x=>eligible.has(x)).length;
  const held=belief.observedDeckPrintings.filter(x=>eligible.has(x)).length;
  const denominator=choose(N,P);
  const distribution=[];
  let success=0n;
  for(let prized=Math.max(0,P-(N-K));prized<=Math.min(K,P);prized++){
    const numerator=choose(K,prized)*choose(N-K,P-prized);
    const deckCopies=held+K-prized;
    distribution.push({
      deckCopies,unknownPrizedCopies:prized,
      exactNumerator:numerator.toString(),
      probability:Number(numerator)/Number(denominator)
    });
    if(deckCopies>=R)success+=numerator;
  }
  return {
    probabilityAtLeastRequired:Number(success)/Number(denominator),
    exactSuccessNumerator:success.toString(),
    exactDenominator:denominator.toString(),
    expectedDeckCopies:held+(N?K*D/N:0),
    knownDeckEligible:held,
    unknownEligible:K,
    unknownDeckCount:D,unknownPrizeCount:P,
    minRequired:R,distribution
  };
}

/**
 * Simultaneous probability that the deck contains at least one eligible card
 * from EACH required, pairwise disjoint target group. Example: both Perfection
 * GX attack donors must be accessible at a deck-search opportunity.
 *
 * @param {{inventory:object,targetGroups:Array<{key:string,printings:string[]}>,
 *   uniformUnknownAllocation:true}} input
 * @returns {object} Exact inclusion-exclusion value, each group status.
 */
function k0AllGroupsAccess(input) {
  const belief=validBelief(input),groups=input.targetGroups;
  if(!Array.isArray(groups)||groups.length<1||groups.length>8)
    throw new TypeError('Expect 1 to 8 disjoint target groups');
  const claimed=new Set(),keys=new Set();
  const groupStats=groups.map(group=>{
    if(typeof group?.key!=='string'||!group.key||keys.has(group.key))
      throw new TypeError('Distinct nonempty target group keys required');
    keys.add(group.key);
    const names=targetSet(group.printings);
    for(const name of names){
      if(claimed.has(name))
        throw new TypeError('Target groups must be disjoint by printing');
      claimed.add(name);
    }
    const knownDeck=belief.observedDeckPrintings.filter(name=>
      names.has(name)).length;
    const unknown=belief.pool.filter(name=>names.has(name)).length;
    return {key:group.key,knownDeck,unknown};
  });
  const unsatisfied=groupStats.filter(group=>group.knownDeck===0);
  const N=belief.pool.length,P=belief.prizeCount;
  const denominator=choose(N,P);
  let numerator=0n;
  const terms=1<<unsatisfied.length;
  for(let mask=0;mask<terms;mask++){
    let total=0,parity=0;
    for(let i=0;i<unsatisfied.length;i++){
      if(mask&(1<<i)){total+=unsatisfied[i].unknown;parity++;}
    }
    const ways=total<=P?choose(N-total,P-total):0n;
    numerator+=parity%2===0?ways:-ways;
  }
  if(numerator<0n||numerator>denominator)
    throw new Error('Owner K0 group access calculation is inconsistent');
  return {
    probabilityAllGroups:Number(numerator)/Number(denominator),
    exactSuccessNumerator:numerator.toString(),
    exactDenominator:denominator.toString(),
    groups:groupStats,
    unknownDeckCount:belief.deckCount,unknownPrizeCount:P
  };
}

module.exports={k0TargetCountAccess,k0AllGroupsAccess};
