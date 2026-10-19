'use strict';

const {choose}=require('./redeal-posterior.cjs');

/**
 * Exact expected value of the best prompted deck-discard selection before
 * observing which physical cards are in the deck versus unknown Prizes.
 *
 * An actor must construct unknownPool exclusively from legitimate public/own
 * observations, generally strictK0Belief, and separately substantiate the
 * uniform unknown Prize allocation assumption. The actual hidden deck/Prize
 * identities must never be passed to this function.
 *
 * A positive utility favours discarding the card. A negative utility records
 * resource loss. Forced minimum discards can therefore have negative value.
 * Utilities are integer units supplied by the caller, not learned win rates.
 *
 * @param {{unknownPool:string[],unknownPrizeCount:number,minDiscards:number,
 *   maxDiscards:number,utilityByPrinting:Record<string,number>,
 *   fallbackUtility:number,uniformUnknownAllocation:true}} input
 * @returns {{expectedNetUtility:number,exactNetNumerator:string,
 *   exactDenominator:string,expectedPositiveUtility:number,
 *   expectedForcedCost:number,expectedDiscards:number,
 *   expectedPositiveDiscards:number,probabilityNoPositiveTarget:number,
 *   expectedSelectedCopiesByPrinting:Record<string,number>,
 *   unknownCardCount:number,unknownPrizeCount:number,deckCount:number}}
 */
function k0DiscardValueFrontier(input){
  if(input?.uniformUnknownAllocation!==true)
    throw new Error('Uniform unknown Prize allocation must be established');
  const {unknownPool,unknownPrizeCount:P,minDiscards:min,
    maxDiscards:max,utilityByPrinting:utilities,fallbackUtility:fallback}=input;
  if(!Array.isArray(unknownPool)||unknownPool.length>60||
      !unknownPool.every(name=>typeof name==='string'&&name.length>0)||
      !Number.isSafeInteger(P)||P<0||P>unknownPool.length||
      !Number.isSafeInteger(min)||min<1||
      !Number.isSafeInteger(max)||max<min||
      max>unknownPool.length-P||
      !utilities||typeof utilities!=='object'||Array.isArray(utilities)||
      !Number.isSafeInteger(fallback)||
      !Object.values(utilities).every(Number.isSafeInteger))
    throw new TypeError('Invalid owner-unknown pool, discard limits or integer utilities');

  const ranked=unknownPool.map((name,index)=>({
    name,index,value:Object.hasOwn(utilities,name)?utilities[name]:fallback
  })).sort((a,b)=>b.value-a.value||a.name.localeCompare(b.name)||a.index-b.index);
  const N=ranked.length,denominator=choose(N,P);
  let total=0n,positive=0n,forced=0n;
  let selectedNumerator=0n,positiveSelectedNumerator=0n;
  const selectedCopies=new Map();
  for(let i=0;i<N;i++){
    const {name,value}=ranked[i];
    const cap=value>0?max:min;
    let includedWays=0n;
    for(let previousPrized=0;previousPrized<=Math.min(i,P);previousPrized++){
      if(i-previousPrized>=cap)continue;
      includedWays+=choose(i,previousPrized)*
        choose(N-i-1,P-previousPrized);
    }
    const weight=BigInt(value)*includedWays;
    total+=weight;
    if(value>0){positive+=weight;positiveSelectedNumerator+=includedWays;}
    if(value<0)forced+=weight;
    selectedNumerator+=includedWays;
    selectedCopies.set(name,(selectedCopies.get(name)??0n)+includedWays);
  }
  const numberPositive=ranked.filter(card=>card.value>0).length;
  const noPositiveWays=P>=numberPositive?
    choose(N-numberPositive,P-numberPositive):0n;
  const asNumber=n=>Number(n)/Number(denominator);
  return {
    expectedNetUtility:asNumber(total),
    exactNetNumerator:total.toString(),
    exactDenominator:denominator.toString(),
    expectedPositiveUtility:asNumber(positive),
    expectedForcedCost:asNumber(forced),
    expectedDiscards:asNumber(selectedNumerator),
    expectedPositiveDiscards:asNumber(positiveSelectedNumerator),
    probabilityNoPositiveTarget:asNumber(noPositiveWays),
    expectedSelectedCopiesByPrinting:Object.fromEntries(
      [...selectedCopies].sort((a,b)=>a[0].localeCompare(b[0]))
        .map(([name,n])=>[name,asNumber(n)])),
    unknownCardCount:N,unknownPrizeCount:P,deckCount:N-P
  };
}

module.exports={k0DiscardValueFrontier};
