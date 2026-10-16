'use strict';
const {choose}=require('./redeal-posterior.cjs');
const {splitKnownTop}=require('./known-top-redeal.cjs');
/**
 * Exact target Prize posterior after paper redeal with remembered deck top.
 * Unknown suffix must be a known card multiset in unknown uniform order.
 * @param {{knownTop:string[],unknownSuffix:string[],oldPrizes:string[],
 *   target:string,uniformUnknownSuffix:boolean}} input
 */
function knownTopRedealPosterior(input){
 if(input?.uniformUnknownSuffix!==true)throw new Error('Uniform unknown suffix required');
 const {knownTop,unknownSuffix,oldPrizes,target}=input;
 const p=splitKnownTop(knownTop,unknownSuffix,oldPrizes.length);
 const known=p.newPrizePrefix.filter(x=>x===target).length;
 const k=unknownSuffix.filter(x=>x===target).length;
 const n=p.unknownNewPrizeCount,N=unknownSuffix.length;
 const denominator=choose(N,n),distribution=[];
 for(let j=0;j<=Math.min(k,n);j++){
  const numerator=choose(k,j)*choose(N-k,n-j);
  if(numerator)distribution.push({targetCopies:known+j,
   numerator:numerator.toString(),denominator:denominator.toString(),
   probability:Number(numerator)/Number(denominator)});
 }
 const zero=known?0n:choose(N-k,n);
 return {knownNewPrizeCount:p.newPrizePrefix.length,
  unknownNewPrizeCount:n,knownDrawTop:p.remainingKnownTop,
  distribution,anyTargetProbability:Number(denominator-zero)/Number(denominator)};
}
module.exports={knownTopRedealPosterior};
