'use strict';
const {choose}=require('./redeal-posterior.cjs');
/** @param {{deck:string[],oldPrizes:string[],target:string,drawCount:number}} input */
function afterRedealDrawProbability(input){
 const {deck,oldPrizes,target,drawCount}=input;
 const N=deck.length,n=oldPrizes.length;
 if(!Number.isInteger(drawCount)||drawCount<0||drawCount>N||n>N)throw new RangeError('Invalid draw count');
 const k=deck.filter(x=>x===target).length,r=oldPrizes.filter(x=>x===target).length;
 const x=Math.min(drawCount,N-n),y=drawCount-x;
 const denominator=choose(N,x)*choose(n,y);
 const miss=choose(N-k,x)*choose(n-r,y);
 return {numerator:(denominator-miss).toString(),denominator:denominator.toString(),probability:Number(denominator-miss)/Number(denominator)};
}
module.exports={afterRedealDrawProbability};
