'use strict';
const assert=require('node:assert/strict');
const {choose,INDICES}=require('./agent5-adp-switch-first8-exact.cjs');
const SCALE=420n;
/**
 * Exact physical-card first-eight source-access screen, averaged over a uniformly
 * shuffled seven-card hand's ordered Basic positions. The first physically
 * eligible Basic policy differs from a deliberate prioritize-ADP policy.
 * The entire screen remains optimistic about costs, Bench and opponent.
 * @param {number[]} counts Nine source categories in the fixed v2 card inventory.
 * @param {{openingHandSize?:number,prizeCount?:number}} [options]
 * @returns {object}
 */
function compareFirstBasicSelection(counts,options={}){
  assert.ok(Array.isArray(counts)&&counts.length===9);
  assert.ok(counts.every(n=>Number.isSafeInteger(n)&&n>=0));
  const n=counts.reduce((a,b)=>a+b,0);
  const handSize=options.openingHandSize??7;
  const prizeCount=options.prizeCount??6;
  assert.ok(handSize>=1&&handSize<=7&&prizeCount>=0&&
    n>=handSize+prizeCount+1);
  const {adp:A,otherBasic:B,switch:S,tagCall:T,quickBall:Q,
    ultraBall:U,guzmaHala:G,doubleDragon:D}=INDICES;
  const denom=(choose(n,handSize)-choose(n-counts[A]-counts[B],handSize)) *
    BigInt(n-handSize)*choose(n-handSize-1,prizeCount);
  const totals={denominatorScaled:denom*SCALE,
    priorityAdpStartsScaled:0n,greedyAdpStartsScaled:0n,
    priorityAdpEnergyScaled:0n,greedyAdpEnergyScaled:0n,
    priorityAllEnergyScaled:0n,greedyAllEnergyScaled:0n,
    greedyRescueHeldAdpScaled:0n,greedyRescueSearchedAdpScaled:0n};
  const hand=Array(counts.length).fill(0);
  function countHand(weight){
    const basicCount=hand[A]+hand[B];
    if(!basicCount)return;
    const fractionAdp=BigInt(hand[A])*SCALE/BigInt(basicCount);
    const fractionOther=SCALE-fractionAdp;
    const prizeWays=choose(n-handSize-1,prizeCount);
    const firstDrawMultiplicities=BigInt(n-handSize);
    if(hand[A]){
      totals.priorityAdpStartsScaled+=weight*firstDrawMultiplicities*prizeWays*SCALE;
      totals.greedyAdpStartsScaled+=weight*firstDrawMultiplicities*prizeWays*fractionAdp;
    }
    const rest=counts.map((count,i)=>count-hand[i]);
    for(let drawn=0;drawn<counts.length;drawn++){
      const draws=rest[drawn];if(!draws)continue;
      const seen=[...hand];seen[drawn]++;
      const after=[...rest];after[drawn]--;
      const otherPrizePool=n-handSize-1-after[A]-after[G]-after[D];
      for(let pa=0;pa<=Math.min(after[A],prizeCount);pa++){
        for(let pg=0;pg<=Math.min(after[G],prizeCount-pa);pg++){
          for(let pd=0;pd<=Math.min(after[D],prizeCount-pa-pg);pd++){
            const po=prizeCount-pa-pg-pd;
            if(po>otherPrizePool)continue;
            const ways=weight*BigInt(draws)*choose(after[A],pa)*
              choose(after[G],pg)*choose(after[D],pd)*
              choose(otherPrizePool,po);
            const accessDde=seen[D]>0||(
              after[D]>pd&&(seen[G]>0||
              (seen[T]>0&&after[G]>pg)));
            if(!accessDde)continue;
            const canFindAdp=seen[A]>0||(
              after[A]>pa&&
                (seen[T]>0||seen[Q]>0||seen[U]>0));
            const switched=seen[S]>0;
            if(hand[A]){
              totals.priorityAdpEnergyScaled+=ways*SCALE;
              totals.greedyAdpEnergyScaled+=ways*fractionAdp;
              totals.priorityAllEnergyScaled+=ways*SCALE;
              totals.greedyAllEnergyScaled+=ways*fractionAdp;
              if(switched){
                totals.greedyAllEnergyScaled+=ways*fractionOther;
                totals.greedyRescueHeldAdpScaled+=ways*fractionOther;
              }
            }else if(switched&&canFindAdp){
              totals.priorityAllEnergyScaled+=ways*SCALE;
              totals.greedyAllEnergyScaled+=ways*SCALE;
              totals.greedyRescueSearchedAdpScaled+=ways*SCALE;
            }
          }
        }
      }
    }
  }
  function visit(i,left,w){
    if(i===counts.length){if(left===0)countHand(w);return;}
    for(let k=0;k<=Math.min(counts[i],left);k++){
      hand[i]=k;
      visit(i+1,left-k,w*choose(counts[i],k));
    }
  }
  visit(0,handSize,1n);
  return totals;
}
module.exports={SCALE,compareFirstBasicSelection};
if(require.main===module){
 const r=compareFirstBasicSelection([2,5,2,4,3,4,3,4,33]);
 console.log(JSON.stringify(Object.fromEntries(Object.entries(r).map(([k,v])=>
  [k,{count:v.toString(),percent:k==='denominatorScaled'?null:
    100*Number(v)/Number(r.denominatorScaled)}])),null,2));
}
