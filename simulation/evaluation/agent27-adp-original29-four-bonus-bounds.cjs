'use strict';
const assert=require('node:assert/strict');
const {loadRegisteredStartingBasicCounts,exactBonusMultiplicity}=
 require('./agent1-original-field-mulligan-bonus.cjs');
const {EVENTS}=require('./agent27-adp-conditional-bonus-counts.cjs');
const PROFILES=['mechanical','dragons','dragonsEnergy','dragonsEnergyCompressor'];
/** Exact 60-card counts for initial seven, accepted extra draws, first own draw, and six Prizes.
 * The no/one outcomes are independently registered in the prior module.
 * The two through four outcomes are checked by the generic full-60 enumerator. */
const FULL60=Object.freeze([
 EVENTS.noBonus,EVENTS.oneBonus,
 {denominator:518322297935752128000n,mechanical:237856759815088693650n,
  dragons:145950467657885626770n,dragonsEnergy:193893921157200328770n,
  dragonsEnergyCompressor:213067285862487435600n},
 {denominator:22806181109173093632000n,mechanical:11264762329340418812520n,
  dragons:7401240562560424143792n,dragonsEnergy:9685320235146079311792n,
  dragonsEnergyCompressor:10471856409802657191792n},
 {denominator:980665787694443026176000n,mechanical:515906360695127399354280n,
  dragons:360695242082394921748320n,dragonsEnergy:462293649941731682730720n,
  dragonsEnergyCompressor:492173357690862904973520n}
]);
/** Equal-source-rank, 29-opponent resource interval, conditional on Basic-valid initial seven. */
function main(){
 const originals=loadRegisteredStartingBasicCounts().originals;
 assert.equal(originals.length,29);
 const ratios=Object.fromEntries(PROFILES.map(k=>[k,FULL60.map(e=>Number(e[k])/Number(e.denominator))]));
 for(const arr of Object.values(ratios))for(let i=1;i<arr.length;i++)assert.ok(arr[i]>=arr[i-1]);
 const rows=originals.map(({rank,basics})=>{
  const exposure=exactBonusMultiplicity(7,basics,4);
  const masses=exposure.candidateOffered.map(x=>x.probability);
  const p5plus=exposure.candidateOfferTail;
  const p0=1-p5plus-masses.reduce((x,y)=>x+y,0);
  const weights=[p0,...masses];
  const axes=Object.fromEntries(PROFILES.map(k=>{
   const observed=weights.reduce((s,w,j)=>s+w*ratios[k][j],0);
   return [k,{lower:observed+p5plus*ratios[k][4],upper:observed+p5plus}];
  }));
  return {rank,basics,exactBonusMasses:masses,tailFivePlus:p5plus,pNoBonus:p0,axes};
 });
 const mean=fn=>rows.reduce((s,r)=>s+fn(r),0)/rows.length;
 return {originals:29,missing:[23,25,28],conditionalRates:ratios,
  massNoBonus:mean(r=>r.pNoBonus),
  massOneThroughFour:[0,1,2,3].map(j=>mean(r=>r.exactBonusMasses[j])),
  massFivePlus:mean(r=>r.tailFivePlus),
  axes:Object.fromEntries(PROFILES.map(k=>[k,{lower:mean(r=>r.axes[k].lower),
    upper:mean(r=>r.axes[k].upper)}])),qualifiedGames:0};
}
module.exports={FULL60,PROFILES,main};
if(require.main===module)console.log(JSON.stringify(main(),null,2));
