'use strict';

const assert=require('node:assert/strict');

const MAX=60;
const chooseTable=Array.from({length:MAX+1},()=>Array(8).fill(0n));
for(let n=0;n<=MAX;n++){
  chooseTable[n][0]=1n;
  for(let k=1;k<=Math.min(7,n);k++)
    chooseTable[n][k]=chooseTable[n-1][k-1]+chooseTable[n-1][k];
}
/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k){
  if(!Number.isInteger(n)||!Number.isInteger(k)||n<0||n>MAX||k<0||k>7||k>n)return 0n;
  return chooseTable[n][k];
}
/**
 * Exact, narrowly defined direct-start opportunity model.
 * Gengar & Mimikyu-GX is in the opening seven and chosen Active at setup.
 * One Psychic-providing Energy is present by the second turn's ordinary draw.
 * Hood is held by that draw; alternatively, Arven is held and a Hood remains
 * in the deck at that time. No Item searches or extra draws are simulated.
 * The one-draw-first enumeration is distributionally equivalent to setting
 * six uniform Prizes first when no search happens before that draw.
 *
 * @param {{hoodCopies:number,arvenCopies:number}} options
 * @returns {object} Exact counts as strings, plus derived probabilities.
 */
function directOpeningModel({hoodCopies,arvenCopies}){
  for(const n of [hoodCopies,arvenCopies])
    assert.ok(Number.isInteger(n)&&n>=0&&n<=4);
  // 1 Gengar; 16 other Basics; 6 Psychic-providing Energy;
  // h Hood and a Arven added by replacing otherwise irrelevant filler.
  const caps=[1,16,hoodCopies,arvenCopies,6,37-hoodCopies-arvenCopies];
  assert.equal(caps.reduce((n,v)=>n+v,0),60);
  const validSeven=choose(60,7)-choose(43,7);
  const denominator=validSeven*53n*choose(52,6);
  let eligibleEnergy=0n,direct=0n,viaArven=0n;
  const hand=Array(6).fill(0);
  /** @param {number} index @param {number} remaining @param {bigint} weight */
  function recurse(index,remaining,weight){
    if(index===caps.length){
      if(remaining!==0||hand[0]!==1)return;
      for(let drawn=0;drawn<caps.length;drawn++){
        const count=caps[drawn]-hand[drawn];
        if(count===0)continue;
        const finalEnergy=hand[4]+Number(drawn===4);
        if(finalEnergy===0)continue;
        const w=weight*BigInt(count);
        const allPrizeWays=choose(52,6);
        eligibleEnergy+=w*allPrizeWays;
        const finalHood=hand[2]+Number(drawn===2);
        const finalArven=hand[3]+Number(drawn===3);
        if(finalHood>0)direct+=w*allPrizeWays;
        else if(finalArven>0&&hoodCopies>0){
          const remainingHood=hoodCopies-finalHood;
          viaArven+=w*(allPrizeWays-
            choose(52-remainingHood,6-remainingHood));
        }
      }
      return;
    }
    for(let n=0;n<=Math.min(remaining,caps[index]);n++){
      hand[index]=n;
      recurse(index+1,remaining-n,weight*choose(caps[index],n));
    }
  }
  recurse(0,7,1n);
  const favorable=direct+viaArven;
  const asProbability=num=>Number(num)/Number(denominator);
  return {
    schema:'agent36-rank15-hood-horror-direct-opening-v1',
    hoodCopies,arvenCopies,
    denominator:String(denominator),favorable:String(favorable),
    directHood:String(direct),arvenToHood:String(viaArven),
    gengarEnergy:String(eligibleEnergy),
    jointProbability:asProbability(favorable),
    directProbability:asProbability(direct),
    arvenProbability:asProbability(viaArven),
    baselineProbability:asProbability(eligibleEnergy),
    legalOpeningProbability:Number(validSeven)/Number(choose(60,7))
  };
}
module.exports={choose,directOpeningModel};
