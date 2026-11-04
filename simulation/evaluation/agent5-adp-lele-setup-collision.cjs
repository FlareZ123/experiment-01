'use strict';
const assert=require('node:assert/strict');
const {choose}=require('./agent5-adp-switch-first8-exact.cjs');
const GROUPS=Object.freeze(['adp','lele','otherBasic','doubleDragon','guzmaHala','tagCall','other']);
const COUNTS=Object.freeze([2,1,4,4,3,4,42]);
/**
 * Count initial-seven ADP/Tapu Lele-GX co-visibility and two disjoint Lele
 * Wonder Tag lines rescuing a first-eight DDE/G&H/Tag Call absence.
 * Such opportunities require deferring Lele's setup Bench placement and
 * no intervening Ability lock. Complete games remain unqualified.
 * @param {number[]} [counts]
 * @param {number} [openingSize]
 * @param {number} [prizes]
 * @returns {{denominator:bigint,coheldOpening:bigint,
 * initialLeleRescue:bigint,drawnLeleRescue:bigint}}
 */
function countCollision(counts=COUNTS,openingSize=7,prizes=6){
  assert.equal(counts.length,7);
  const n=counts.reduce((a,b)=>a+b,0);
  assert.ok(n>=openingSize+prizes+1);
  const denom=(choose(n,openingSize)-choose(n-counts[0]-counts[1]-counts[2],openingSize)) * BigInt(n-openingSize)*choose(n-openingSize-1,prizes);
  const result={denominator:denom,coheldOpening:0n,initialLeleRescue:0n,drawnLeleRescue:0n};
  const hand=counts.map(()=>0);
  function consider(weight){
    const basics=hand[0]+hand[1]+hand[2];
    if(!basics)return;
    if(hand[0]&&hand[1])result.coheldOpening+=weight * BigInt(n-openingSize)*choose(n-openingSize-1,prizes);
    if(!hand[0])return;
    for(let drawn=0;drawn<counts.length;drawn++){
      const ways=counts[drawn]-hand[drawn];
      if(!ways)continue;
      const first8=[...hand];first8[drawn]++;
      if(first8[3]||first8[4]||first8[5]||!first8[1])continue;
      const remaining=counts.map((count,i)=>count-first8[i]);
      const other=n-openingSize-1-remaining[3]-remaining[4];
      let good=0n;
      for(let pEnergy=0;pEnergy<=Math.min(prizes,remaining[3]);pEnergy++){
        if(remaining[3]===pEnergy)continue;
        for(let pSupporter=0;pSupporter<=Math.min(prizes-pEnergy,remaining[4]);pSupporter++){
          if(remaining[4]===pSupporter)continue;
          const pOther=prizes-pEnergy-pSupporter;
          good+=choose(remaining[3],pEnergy)*choose(remaining[4],pSupporter)*choose(other,pOther);
        }
      }
      if(hand[1])result.initialLeleRescue+=weight*BigInt(ways)*good;
      else if(drawn===1)result.drawnLeleRescue+=weight*BigInt(ways)*good;
    }
  }
  function visit(index,left,weight){
    if(index===counts.length){if(left===0)consider(weight);return;}
    for(let k=0;k<=Math.min(counts[index],left);k++){
      hand[index]=k;
      visit(index+1,left-k,weight*choose(counts[index],k));
    }
  }
  visit(0,openingSize,1n);
  return result;
}
module.exports={GROUPS,COUNTS,countCollision};
if(require.main===module){
const r=countCollision();
console.log(JSON.stringify(Object.fromEntries(Object.entries(r).map(([key,val])=>[key, {count:val.toString(), percent:key==='denominator'?null:100*Number(val)/Number(r.denominator)}])),null,2));
}
