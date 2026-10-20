'use strict';

const {choose} = require('./redeal-posterior.cjs');
const {strictK0Unknown} = require('./strict-k0-unknown.cjs');

/**
 * Exact conditional distribution for a category in an unrevealed opponent hand.
 * The caller MUST derive the unknown pool from a legitimately known roster
 * minus genuinely observed cards, and justify exchangeability. This function
 * deliberately accepts counts only, never a live opponent State or Card.
 *
 * @param {{unseenCategoryCount:number,unseenOtherCount:number,
 *   unknownHandCount:number,knownHandCategoryCount:number,
 *   unitEffect:number,threshold:number,
 *   uniformUnknownHandAllocation:true}} input
 * @returns {{distribution:Array<{categoryCount:number,totalCategoryCount:number,
 *   effect:number,numerator:string,denominator:string,probability:number}>,
 *   expectedCategoryCount:number,expectedEffect:number,
 *   thresholdNumerator:string,thresholdDenominator:string,
 *   probabilityAtLeastThreshold:number,unknownPoolCount:number,
 *   unknownHandCount:number,assumption:string}}
 */
function unseenHandCategoryPosterior(input) {
  if (input?.uniformUnknownHandAllocation !== true) {
    throw new Error('Uniform hidden hand allocation must be justified');
  }
  const {
    unseenCategoryCount:T, unseenOtherCount:F, unknownHandCount:h,
    knownHandCategoryCount:k, unitEffect:u, threshold:threshold
  } = input;
  if (![T,F,h,k,u,threshold].every(Number.isSafeInteger) ||
      [T,F,h,k,u,threshold].some(n=>n<0) ||
      T+F+k>60 || h>T+F ||
      !Number.isSafeInteger(u*(k+Math.min(h,T)))) {
    throw new RangeError('Invalid observable counts, effect or threshold');
  }
  const N=T+F;
  const denominator=choose(N,h);
  let tail=0n;
  let weighted=0n;
  const distribution=[];
  for (let x=Math.max(0,h-F); x<=Math.min(h,T); x++) {
    const count=choose(T,x)*choose(F,h-x);
    const total=k+x;
    const effect=u*total;
    if (effect>=threshold) tail+=count;
    weighted+=count*BigInt(total);
    distribution.push({
      categoryCount:x, totalCategoryCount:total, effect,
      numerator:count.toString(), denominator:denominator.toString(),
      probability:Number(count)/Number(denominator)
    });
  }
  const expectedCategoryCount=Number(weighted)/Number(denominator);
  return {
    distribution,
    expectedCategoryCount,
    expectedEffect:u*expectedCategoryCount,
    thresholdNumerator:tail.toString(),
    thresholdDenominator:denominator.toString(),
    probabilityAtLeastThreshold:Number(tail)/Number(denominator),
    unknownPoolCount:N,
    unknownHandCount:h,
    assumption:'Exchangeable unknown hand slots given a player-observable, known opponent card multiset'
  };
}

/**
 * Derive a forecast pool from opponent PUBLIC cards and public zone counts.
 * The full roster must independently be known to the ACTOR. In an ordinary
 * closed-list paper match this prerequisite may be false.
 *
 * This function never reads the identities of the opponent's hand, deck or
 * face-down Prizes. It counts attached Tools as separate physical cards and
 * does not double-count the Energy secondary index.
 *
 * @param {{opponent:object,registeredPrintings:string[],
 *   categoryPrintings:string[],fullRosterKnownToActor:true,
 *   opponentHandIdentityUnobserved:true}} input
 * @returns {{unseenCategoryCount:number,unseenOtherCount:number,
 *   unknownHandCount:number,knownHandCategoryCount:0,
 *   hiddenDeckCount:number,hiddenPrizeCount:number,
 *   publicPrintings:string[]}}
 */
function opponentObservableCategoryCounts(input) {
  if (input?.fullRosterKnownToActor!==true ||
      input?.opponentHandIdentityUnobserved!==true) {
    throw new Error('Actor roster knowledge and unknown hand must be authenticated');
  }
  const {opponent,registeredPrintings,categoryPrintings}=input;
  if (!Array.isArray(registeredPrintings)||registeredPrintings.length!==60||
      !registeredPrintings.every(n=>typeof n==='string'&&n.length>0)||
      !Array.isArray(categoryPrintings)||
      !categoryPrintings.every(n=>typeof n==='string'&&n.length>0)) {
    throw new TypeError('Known exact 60 and category printing names required');
  }
  const classification=new Set(categoryPrintings);
  if (classification.size!==categoryPrintings.length ||
      categoryPrintings.some(n=>!registeredPrintings.includes(n))) {
    throw new Error('Category names must be unique roster printings');
  }
  if (!Array.isArray(opponent?.bench)||!Array.isArray(opponent?.hand?.cards)||
      !Array.isArray(opponent?.deck?.cards)||!Array.isArray(opponent?.prizes)) {
    throw new TypeError('Pinned public opponent zone/count structure required');
  }
  const publicPrintings=[];
  const add=(list,label)=>{
    if(!Array.isArray(list))throw new TypeError('Missing public '+label+' list');
    for(const card of list){
      if(typeof card?.fullName!=='string'||card.fullName.length===0)
        throw new TypeError('Invalid visible printing in '+label);
      publicPrintings.push(card.fullName);
    }
  };
  for(const name of ['discard','lostzone','stadium','supporter']) {
    add(opponent[name]?.cards,name);
  }
  for(const [name,slot] of [['active',opponent.active],
    ...opponent.bench.map((slot,index)=>['bench'+index,slot])]) {
    add(slot?.cards,name);
    if(slot.tools!==undefined)add(slot.tools,name+'Tools');
  }
  const hiddenDeckCount=opponent.deck.cards.length;
  const hiddenPrizeCount=opponent.prizes.reduce((n,slot)=>{
    if(!Array.isArray(slot?.cards))throw new TypeError('Invalid hidden Prize count zone');
    return n+slot.cards.length;
  },0);
  const unknownHandCount=opponent.hand.cards.length;
  const unseen=strictK0Unknown(registeredPrintings,publicPrintings);
  if(unseen.length!==unknownHandCount+hiddenDeckCount+hiddenPrizeCount) {
    throw new Error('Public roster and concealed zone counts do not reconcile');
  }
  const unseenCategoryCount=unseen.filter(n=>classification.has(n)).length;
  return {
    unseenCategoryCount, unseenOtherCount:unseen.length-unseenCategoryCount,
    unknownHandCount,knownHandCategoryCount:0,
    hiddenDeckCount,hiddenPrizeCount,
    publicPrintings:publicPrintings.sort()
  };
}

module.exports={unseenHandCategoryPosterior,opponentObservableCategoryCounts};
