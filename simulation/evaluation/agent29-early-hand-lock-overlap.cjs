'use strict';
const assert=require('node:assert/strict');
const {choose}=require('./agent29-whismur-bawl-frontier.cjs');

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a,b){
  while(b!==0n){const next=a%b;a=b;b=next;}
  return a;
}

/** @param {bigint} numerator @param {bigint} denominator */
function fraction(numerator,denominator){
  const common=gcd(numerator,denominator);
  return {numerator:String(numerator/common),
    denominator:String(denominator/common),
    probability:Number(numerator)/Number(denominator)};
}

/** @param {number[]} capacity @param {number} left @param {number} index @param {number[]} prefix */
function* openings(capacity,left,index=0,prefix=[]){
  if(index===capacity.length-1){
    if(left>=0&&left<=capacity[index])yield [...prefix,left];
    return;
  }
  for(let k=0;k<=Math.min(left,capacity[index]);k++)
    yield* openings(capacity,left-k,index+1,[...prefix,k]);
}

/**
 * Compare printed early turn-one denial opportunities on the original
 * New Moon 60 (Gengar & Mimikyu-GX Horror House-GX) to a hypothetical
 * 60 with one nonbasic Trainer replaced by Whismur CES (Bawl).
 *
 * Only 1 or 2 single-copy attackers are allowed. Both cost one Energy:
 * Gengar requires Psychic, Whismur requires Colorless. All six Energy
 * in the proposed sixty provide Psychic; an eligible count of three
 * excludes Telepathic for an explicit attachment opportunity-cost test.
 * Four VIP, one Latias and 15 other Basic cards are unchanged.
 *
 * Native play, GX availability/contestation, opponent locks and policy
 * are not established. Results are conditional on going second, having
 * a Basic-valid opening seven, six random Prizes and one ordinary draw.
 *
 * @param {{attackerKinds?:1|2,eligibleEnergyCount?:number}} [options]
 * @returns {object} Exact, disjoint combinatorial opportunity.
 */
function exactEarlyLockOverlap({attackerKinds=1,eligibleEnergyCount=6}={}){
  assert.ok(attackerKinds===1||attackerKinds===2);
  assert.ok(Number.isInteger(eligibleEnergyCount)&&
    eligibleEnergyCount>=0&&eligibleEnergyCount<=6);
  // [potential attacking Basics, Latias, VIP, Energy, other Basics, other]
  const capacity=[attackerKinds,1,4,eligibleEnergyCount,15,
    60-attackerKinds-1-4-eligibleEnergyCount-15];
  const parts={attackerInOpening:0n,
    attackerFirstDrawWithLatias:0n,vipLatiasFallback:0n};
  for(const h of openings(capacity,7)){
    if(h[0]+h[1]+h[4]===0)continue;
    const handWays=h.reduce((p,k,i)=>p*choose(capacity[i],k),1n);
    for(let draw=0;draw<capacity.length;draw++){
      const remaining=capacity[draw]-h[draw];
      if(remaining===0||h[3]+Number(draw===3)===0)continue;
      let kind,goodPrizes;
      if(h[0]>0){
        kind='attackerInOpening';
        goodPrizes=choose(52,6);
      }else if(draw===0&&h[1]>0){
        kind='attackerFirstDrawWithLatias';
        goodPrizes=choose(52,6);
      }else if(h[2]>0||draw===2){
        kind='vipLatiasFallback';
        const latiasUnseen=Number(h[1]===0&&draw!==1);
        const attackerSeen=h[0]+Number(draw===0)>0;
        const allLatiasAvailable=choose(52-latiasUnseen,6);
        goodPrizes=attackerSeen?allLatiasAvailable:
          allLatiasAvailable-
          choose(52-latiasUnseen-attackerKinds,6-attackerKinds);
      }else continue;
      parts[kind]+=handWays*BigInt(remaining)*goodPrizes;
    }
  }
  const totalBasics=15+1+attackerKinds;
  const denominator=
    (choose(60,7)-choose(60-totalBasics,7))*53n*choose(52,6);
  const sum=Object.values(parts).reduce((a,b)=>a+b,0n);
  return {
    schema:'agent29-gengar-whismur-overlap-unimpeded-firstturn-v1',
    sourceCandidate:'results/als/new-moon-lockbreak-english-proxy-60.json',
    attackerKinds,
    role:attackerKinds===1?'original-gengar-horror-house-gx':
      'hypothetical-gengar-or-whismur-firstturn',
    physicalDeckSize:60,basicCount:totalBasics,
    eligibleEnergyCount,
    sourceOriginalOtherBasics:15,latiasCopies:1,vipCopies:4,
    goSecondRequired:true,conditionalOnBasicValidOpening:true,
    competitiveQualifiedGames:0,
    attackerInOpening:fraction(parts.attackerInOpening,denominator),
    attackerFirstDrawWithLatias:
      fraction(parts.attackerFirstDrawWithLatias,denominator),
    vipLatiasFallback:fraction(parts.vipLatiasFallback,denominator),
    unionOpportunity:fraction(sum,denominator)
  };
}

module.exports={exactEarlyLockOverlap};
