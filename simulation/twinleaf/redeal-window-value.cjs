'use strict';

const {choose} = require('./redeal-posterior.cjs');

/**
 * Exact best-card reward from a top-window reveal after a Prize-card redeal.
 * Known old Prizes become an independently shuffled bottom block. New Prizes
 * consume the former deck top without shuffling it. The remaining former-deck
 * unknown multiset was uniformly ordered before the redeal.
 *
 * The caller must know the former Prize multiset (K1), have established the
 * priors explicitly and verify no intervening reshuffle or card movement.
 *
 * @param {{knownFormerTop:string[],unknownFormerDeck:string[],
 * oldPrizes:string[],window:number,rewardByName:Record<string,number>,
 * missValue:number,uniformUnknownFormerOrder:true,
 * uniformReturnedBottomOrder:true,noShuffleSinceRedeal:true}} input
 * @returns {{expectedValue:number,knownBest:number,unknownFormerExposed:number,
 * returnedBottomExposed:number,newPrizeUnknownCount:number,thresholds:Array<
 * {reward:number,numerator:string,denominator:string,probability:number}>}}
 */
function expectedRedealWindowValue(input) {
  if(input?.uniformUnknownFormerOrder!==true ||
    input?.uniformReturnedBottomOrder!==true ||
    input?.noShuffleSinceRedeal!==true) {
    throw new Error('Explicit uniform block and no-reshuffle assumptions required');
  }
  const {knownFormerTop,unknownFormerDeck,oldPrizes,window,
    rewardByName,missValue}=input;
  if(![knownFormerTop,unknownFormerDeck,oldPrizes].every(Array.isArray) ||
    ![...knownFormerTop,...unknownFormerDeck,...oldPrizes]
      .every(value=>typeof value==='string'&&value.length>0)) {
    throw new TypeError('Expected known physical card-name multisets');
  }
  if(!Number.isSafeInteger(window)||window<0 ||
    oldPrizes.length>knownFormerTop.length+unknownFormerDeck.length) {
    throw new RangeError('Invalid window or replacement Prize capacity');
  }
  if(rewardByName===null||typeof rewardByName!=='object'||
    Array.isArray(rewardByName)||!Number.isFinite(missValue)||
    !Object.values(rewardByName).every(Number.isFinite)) {
    throw new TypeError('Expected finite reward values');
  }
  const getReward=name=>Object.hasOwn(rewardByName,name)?
    rewardByName[name]:missValue;
  const nPrize=oldPrizes.length;
  const remainingKnown=knownFormerTop.slice(nPrize);
  const newPrizeUnknownCount=Math.max(0,nPrize-knownFormerTop.length);
  const unknownFormerRemain=unknownFormerDeck.length-newPrizeUnknownCount;
  const effectiveWindow=Math.min(window,
    knownFormerTop.length+unknownFormerDeck.length);
  const knownSeen=remainingKnown.slice(0,effectiveWindow);
  const unknownFormerExposed=Math.min(unknownFormerRemain,
    Math.max(0,effectiveWindow-knownSeen.length));
  const returnedBottomExposed=Math.max(0,
    effectiveWindow-knownSeen.length-unknownFormerExposed);
  const knownBest=knownSeen.reduce((best,name)=>
    Math.max(best,getReward(name)),missValue);
  const tiers=[...new Set([...unknownFormerDeck,...oldPrizes]
    .map(getReward).filter(value=>value>knownBest))].sort((a,b)=>a-b);
  const denominator=choose(unknownFormerDeck.length,unknownFormerExposed)*
    choose(oldPrizes.length,returnedBottomExposed);
  const thresholds=[];
  let expectedValue=knownBest,previous=knownBest;
  for(const reward of tiers) {
    const formerHits=unknownFormerDeck.filter(name=>getReward(name)>=reward).length;
    const bottomHits=oldPrizes.filter(name=>getReward(name)>=reward).length;
    const noHit=choose(unknownFormerDeck.length-formerHits,unknownFormerExposed)*
      choose(oldPrizes.length-bottomHits,returnedBottomExposed);
    const numerator=denominator-noHit;
    const probability=Number(numerator)/Number(denominator);
    expectedValue+=(reward-previous)*probability;
    thresholds.push({reward,numerator:numerator.toString(),
      denominator:denominator.toString(),probability});
    previous=reward;
  }
  return {expectedValue,knownBest,unknownFormerExposed,returnedBottomExposed,
    newPrizeUnknownCount,thresholds};
}

module.exports={expectedRedealWindowValue};
