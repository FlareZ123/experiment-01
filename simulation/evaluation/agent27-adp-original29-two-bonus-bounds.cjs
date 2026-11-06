'use strict';
const assert=require('node:assert/strict');
const {loadRegisteredStartingBasicCounts,exactBonusMultiplicity}=
 require('./agent1-original-field-mulligan-bonus.cjs');
const {EVENTS}=require('./agent27-adp-conditional-bonus-counts.cjs');
const PROFILES=['mechanical','dragons','dragonsEnergy','dragonsEnergyCompressor'];
const TWO_PROB={
 mechanical:237856759815088693650/518322297935752128000,
 dragons:0.2815824598693547,
 dragonsEnergy:0.3740798378333207,
 dragonsEnergyCompressor:0.41107103960419983
};
/** Equal-weight source-certified two-party offered-card bound. @returns {object} */
function main(){
 const originals=loadRegisteredStartingBasicCounts().originals;
 assert.equal(originals.length,29);
 const rows=originals.map(({rank,basics})=>{
  const x=exactBonusMultiplicity(7,basics,2);
  const p1=x.candidateOffered[0].probability,p2=x.candidateOffered[1].probability;
  const pt=x.candidateOfferTail,p0=1-p1-p2-pt;
  const axes=Object.fromEntries(PROFILES.map(k=>{
   const g0=Number(EVENTS.noBonus[k])/Number(EVENTS.noBonus.denominator);
   const g1=Number(EVENTS.oneBonus[k])/Number(EVENTS.oneBonus.denominator);
   const g2=TWO_PROB[k];
   assert.ok(g0<=g1&&g1<=g2);
   return [k,{lower:p0*g0+p1*g1+(p2+pt)*g2,
     upper:p0*g0+p1*g1+p2*g2+pt}];
  }));
  return {rank,basics,bonusTwo:p2,bonusThreePlus:pt,axes};
 });
 const mean=f=>rows.reduce((s,r)=>s+f(r),0)/rows.length;
 return {originals:29,missing:[23,25,28],
  probabilityExactlyTwo:mean(r=>r.bonusTwo),
  probabilityThreePlus:mean(r=>r.bonusThreePlus),
  axes:Object.fromEntries(PROFILES.map(k=>[k,{lower:mean(r=>r.axes[k].lower),
    upper:mean(r=>r.axes[k].upper)}])),qualifiedGames:0};
}
module.exports={main};
if(require.main===module)console.log(JSON.stringify(main()));
