'use strict';
const assert=require('node:assert/strict');
const {choose,rank5,counts}=
  require('./agent13-dual-mew-prize-availability.cjs');
const [vm,v,genesect,dce]=counts;
const otherBasics=[
  ['Dedenne-GX','UNB','57'],
  ['Crobat V','DAA','104'],
  ["Lillie's Clefairy ex",'JTG','56']
].reduce((total,[name,set,number])=>{
  const print=rank5.cards.filter(c=>c.name===name&&
    c.printing.set===set&&c.printing.number===number);
  assert.equal(print.length,1,'Original rank5 Basic printing missing: '+name);
  assert.equal(print[0].count,1);
  return total+print[0].count;
},0);
const other=60-vm-v-genesect-dce-otherBasics;
assert.deepEqual([vm,v,genesect,dce,otherBasics,other],[3,4,4,4,3,42]);
/** @param {number} n @param {number} k */
function combination(n,k){return k<0||k>n?0n:choose(n,k);}
/**
 * Exact physical no-search exposure by opening 7 plus ordinary draws.
 * Six initially inaccessible Prize positions are excluded from this sample;
 * the initial 7 is conditioned on at least one of 11 Basic Pokémon.
 * No opponent mulligan bonus or card-effect search/draw is modeled.
 * @param {number} draws Number of ordinary draws from remaining deck.
 * @returns {{draws:number,favorableAssignments:bigint,allAssignments:bigint,
 *   conditionalNumerator:bigint,conditionalDenominator:bigint,percent:number}}
 */
function directDrawAccess(draws){
  assert.ok(Number.isSafeInteger(draws)&&draws>=0&&draws<=47);
  const seen=7+draws;
  let favorableAssignments=0n;
  for(let a=2;a<=v;a++)for(let b=2;b<=vm;b++)
    for(let c=1;c<=genesect;c++)for(let d=2;d<=dce;d++)
      for(let e=0;e<=otherBasics;e++){
        const f=seen-a-b-c-d-e;
        if(f<0||f>other)continue;
        const weight=choose(v,a)*choose(vm,b)*choose(genesect,c)*
          choose(dce,d)*choose(otherBasics,e)*choose(other,f);
        const basicsSeen=a+c+e;
        const validHands=choose(seen,7)-combination(seen-basicsSeen,7);
        favorableAssignments+=weight*validHands;
      }
  const allAssignments=choose(60,seen)*choose(seen,7);
  const validOpeningHands=choose(60,7)-choose(49,7);
  const conditionalNumerator=favorableAssignments*choose(60,7);
  const conditionalDenominator=allAssignments*validOpeningHands;
  return {draws,favorableAssignments,allAssignments,
    conditionalNumerator,conditionalDenominator,
    percent:100*Number(conditionalNumerator)/Number(conditionalDenominator)};
}
if(require.main===module){
  for(const draws of [0,6,10,12,15,20]){
    const r=directDrawAccess(draws);
    console.log(JSON.stringify({draws:r.draws,percent:r.percent,
      favorableAssignments:r.favorableAssignments.toString(),
      allAssignments:r.allAssignments.toString()}));
  }
}
module.exports={directDrawAccess,otherBasics,other};
