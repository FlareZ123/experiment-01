'use strict';
const assert=require('node:assert/strict');

const TOTAL=60;
const BASICS=13;
const ENERGY_PER_FAMILY=4;
const OTHER=TOTAL-BASICS-3*ENERGY_PER_FAMILY;
const PRIZES=6;
const INITIAL_HAND=7;
const ANALYZED_ATTACHMENTS=[5,10,12];

/** Exact binomial coefficient, including impossible draws as zero. @param {number} n @param {number} k @returns {bigint} */
function choose(n,k){
  assert.ok(Number.isSafeInteger(n)&&Number.isSafeInteger(k)&&n>=0);
  if(k<0||k>n)return 0n;
  const t=Math.min(k,n-k);
  let answer=1n;
  for(let i=1;i<=t;i++){
    answer=answer*BigInt(n-t+i)/BigInt(i);
  }
  return answer;
}

/**
 * Maximize active Lightning Energy units when choosing exactly n physical
 * Special Energy from the available R (3 units), C (2), and U (1).
 * @param {number} r Reversal Energy available outside Prizes
 * @param {number} c Counter Energy available outside Prizes
 * @param {number} u Unit Energy LPM available outside Prizes
 * @param {number} n Physical card attachment count
 * @returns {number|null} Absent if fewer than n physical cards remain
 */
function maxUnits(r,c,u,n){
  let maximum=null;
  for(let usedR=0;usedR<=r;usedR++){
    for(let usedC=0;usedC<=c;usedC++){
      const usedU=n-usedR-usedC;
      if(usedU<0||usedU>u)continue;
      const score=3*usedR+2*usedC+usedU;
      maximum=maximum===null?score:Math.max(maximum,score);
    }
  }
  return maximum;
}

/**
 * Exact conditional Prize distribution after rejection-sampling a seven-card
 * starting hand until at least one Basic appears, then setting six Prizes.
 * Each possible Prize composition is weighted by its count of permutations
 * multiplied by the number of valid seven-card initial hands in the other 54.
 * This is equivalent by exchangeability to the official setup sequence.
 *
 * No initial draw search, bonus draw, Prize recovery, attack availability,
 * Energy discard cost, support policy or game strength is modeled.
 *
 * @returns {object}
 */
function analyze(){
  const hist=new Map(ANALYZED_ATTACHMENTS.map(n=>[n,new Map()]));
  let denominator=0n;
  const allSevenFromRemaining=choose(TOTAL-PRIZES,INITIAL_HAND);
  for(let prizeR=0;prizeR<=4;prizeR++){
    for(let prizeC=0;prizeC<=4;prizeC++){
      for(let prizeU=0;prizeU<=4;prizeU++){
        for(let prizeBasic=0;prizeBasic<=PRIZES;prizeBasic++){
          const prizeOther=PRIZES-prizeR-prizeC-prizeU-prizeBasic;
          if(prizeOther<0||prizeOther>OTHER)continue;
          const physicalSixWays=
            choose(4,prizeR)*choose(4,prizeC)*choose(4,prizeU)*
            choose(BASICS,prizeBasic)*choose(OTHER,prizeOther);
          const validSevenWays=allSevenFromRemaining-
            choose(TOTAL-PRIZES-(BASICS-prizeBasic),INITIAL_HAND);
          const weight=physicalSixWays*validSevenWays;
          denominator+=weight;
          for(const n of ANALYZED_ATTACHMENTS){
            const max=maxUnits(4-prizeR,4-prizeC,4-prizeU,n);
            const row=hist.get(n);
            row.set(max,(row.get(max)??0n)+weight);
          }
        }
      }
    }
  }
  // Cross-derive total by conditioning a uniformly random legal seven
  // and then drawing an arbitrary six Prizes from the remaining 53.
  const expectedTotal=
    (choose(TOTAL,INITIAL_HAND)-choose(TOTAL-BASICS,INITIAL_HAND))*
    choose(TOTAL-INITIAL_HAND,PRIZES);
  assert.equal(denominator,expectedTotal);
  const rows={};
  for(const n of ANALYZED_ATTACHMENTS){
    const h=hist.get(n);
    assert.equal([...h.values()].reduce((a,b)=>a+b,0n),denominator);
    const max=Math.max(...[...h.keys()].filter(Number.isInteger));
    const definedWeight=[...h].reduce((s,[units,w])=>
      s+(units===null?0n:w),0n);
    rows[n]={
      maxUnits:max,
      maxNominalDamage:max*30,
      maxUnitProbability: Number(h.get(max))/Number(denominator),
      enoughEnergyProbability: Number(definedWeight)/Number(denominator),
      conditionalMeanMaxUnits:[...h].reduce((s,[units,w])=>
        s+(units===null?0:units*Number(w)),0)/Number(definedWeight),
      frequencyByUnits:Object.fromEntries([...h].sort(([a],[b])=>
        (a??-1)-(b??-1)).map(([units,w])=>[
        units===null?'unavailable':String(units),
        {numerator:w.toString(),probability:Number(w)/Number(denominator)}
      ]))
    };
  }
  return {
    schema:'agent43-exact-legal-seven-prize-energy-only-ceiling-v1',
    physicalDeck:60,eligibleBasics:BASICS,prizeCount:PRIZES,
    energyCaps:{reversal:4,counter:4,unitLpm:4},
    exactValidSevenPrizeWays:denominator.toString(),
    results:rows,
    caveat:'Prize-only resource ceiling; no physical setup line, recovery, actual attachment, special-energy suppression or wins'
  };
}

if(require.main===module){
  console.log(JSON.stringify(analyze(),null,2));
}
module.exports={choose,maxUnits,analyze};
