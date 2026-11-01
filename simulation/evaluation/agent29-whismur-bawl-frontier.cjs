'use strict';
const assert=require('node:assert/strict');

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k){
  assert.ok(Number.isSafeInteger(n)&&Number.isSafeInteger(k));
  if(k<0||k>n)return 0n;
  let result=1n;
  for(let i=1;i<=Math.min(k,n-k);i++)
    result=result*BigInt(n-i+1)/BigInt(i);
  return result;
}

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a,b){
  while(b){const next=a%b;a=b;b=next;}
  return a;
}

/** @param {bigint} value @param {bigint} denominator */
function fraction(value,denominator){
  const d=gcd(value,denominator);
  return {numerator:String(value/d),denominator:String(denominator/d),
    probability:Number(value)/Number(denominator)};
}

/**
 * Generate initial-seven compositions over fixed categorical counts.
 * @param {number[]} capacity
 * @param {number} left
 * @param {number} i
 * @param {number[]} prefix
 */
function* hands(capacity,left,i=0,prefix=[]){
  if(i===capacity.length-1){
    if(left>=0&&left<=capacity[i])yield [...prefix,left];
    return;
  }
  for(let n=0;n<=Math.min(left,capacity[i]);n++)
    yield* hands(capacity,left-n,i+1,[...prefix,n]);
}

/**
 * Exact single-natural-draw access for one Whismur CES and Latias ex SSP
 * alongside four Battle VIP Pass and six Energy cards. The hypothetical
 * list replaces one nonbasic, non-Energy slot of the original 60.
 * It preserves 17 original Basic Pokemon, including one Latias.
 *
 * This assumes the actor goes second, no opponent interference, a legal
 * initial seven, and functional Latias free retreat. A drawn VIP can
 * search one Whismur plus Latias when they are outside Prize cards.
 * The six random Prize cards are exchangeable with the natural draw;
 * C(52-k,6)/C(52,6) handles k missing singletons after drawing.
 *
 * @param {number} eligibleEnergyCount 3 Basic Psychic or all 6 Energy.
 * @returns {object} Exact fractions and numerical opportunities.
 */
function exactBawlAccess(eligibleEnergyCount=6){
  assert.ok(Number.isInteger(eligibleEnergyCount)&&
    eligibleEnergyCount>=0&&eligibleEnergyCount<=6);
  const capacity=[1,1,4,eligibleEnergyCount,16,38-eligibleEnergyCount];
  const amounts={initialWhismur:0n,drawnWhismurLatias:0n,vipRoute:0n};
  const prizeChoices=choose(52,6);
  for(const h of hands(capacity,7)){
    if(h[0]+h[1]+h[4]===0)continue;
    const ways=h.reduce((a,n,i)=>a*choose(capacity[i],n),1n);
    for(let draw=0;draw<6;draw++){
      const count=capacity[draw]-h[draw];
      if(count===0||h[3]+Number(draw===3)===0)continue;
      let key,missing=0;
      if(h[0]>0)key='initialWhismur';
      else if(draw===0&&h[1]>0)key='drawnWhismurLatias';
      else if(h[2]>0||draw===2){
        key='vipRoute';
        missing=Number(h[0]===0&&draw!==0)+
          Number(h[1]===0&&draw!==1);
      }else continue;
      amounts[key]+=ways*BigInt(count)*choose(52-missing,6);
    }
  }
  const denominator=(choose(60,7)-choose(42,7))*53n*prizeChoices;
  const union=Object.values(amounts).reduce((a,b)=>a+b,0n);
  return {
    schema:'agent29-whismur-bawl-unimpeded-opening-v1',
    registeredCandidateSource:'results/als/new-moon-lockbreak-english-proxy-60.json',
    baselineOtherBasics:17,physicalEnergies:6,vipPasses:4,
    eligibleEnergyCount,conditionalLegalOpening:true,
    mustGoSecond:true,competitiveQualifiedGames:0,
    initialWhismur:fraction(amounts.initialWhismur,denominator),
    drawnWhismurLatias:fraction(amounts.drawnWhismurLatias,denominator),
    vipRoute:fraction(amounts.vipRoute,denominator),
    unionOpportunity:fraction(union,denominator)
  };
}

module.exports={choose,exactBawlAccess};
