'use strict';
const assert=require('node:assert/strict');
const {choose}=require('./agent36-rank15-hood-horror-direct-model.cjs');

/**
 * Exact source-temporal calculation with actual first-turn Item searches.
 * Gengar must be the chosen opening Active. Before the opponent's Item
 * lock, an opening Adventure Bag finds Hood if one remains available;
 * an opening Fog Crystal finds Basic Psychic Energy if no Psychic-providing
 * Energy is held. Both cards are removed from the post-Prize deck before
 * the candidate's second ordinary turn draw. Arven can search Hood on T2.
 * All other opening actions and opportunity costs are intentionally omitted.
 * @param {{hoodCopies:number,arvenCopies:number}} copies
 * @returns {object} Exact counts as strings, probabilities as numbers.
 */
function prelockItemPolicyModel({hoodCopies,arvenCopies}){
  for(const n of [hoodCopies,arvenCopies])
    assert.ok(Number.isInteger(n)&&n>=0&&n<=4);
  // Gengar, other Basics, Hood, Adventure Bag, Arven, Fog Crystal,
  // Basic Psychic, Telepathic Psychic, and all unclassified other cards.
  const caps=[1,16,hoodCopies,1,arvenCopies,4,3,3,32-hoodCopies-arvenCopies];
  assert.equal(caps.reduce((n,v)=>n+v,0),60);
  const scale=47n*46n*45n;
  const validSeven=choose(60,7)-choose(43,7);
  const denominator=validSeven*choose(53,6)*scale;
  let eligibleEnergy=0n,direct=0n,viaArven=0n;
  const hand=Array(caps.length).fill(0);

  /** @param {number} idx @param {number} left @param {bigint} weight */
  function initialHand(idx,left,weight){
    if(idx===caps.length){
      if(left!==0||hand[0]!==1)return;
      const rem=caps.map((v,i)=>v-hand[i]);
      const otherRem=53-rem[2]-rem[4]-rem[6]-rem[7];
      for(let pH=0;pH<=Math.min(rem[2],6);pH++)
      for(let pA=0;pA<=Math.min(rem[4],6-pH);pA++)
      for(let pE=0;pE<=Math.min(rem[6],6-pH-pA);pE++)
      for(let pS=0;pS<=Math.min(rem[7],6-pH-pA-pE);pS++){
        const pO=6-pH-pA-pE-pS;
        if(pO>otherRem)continue;
        const pw=choose(rem[2],pH)*choose(rem[4],pA)*
          choose(rem[6],pE)*choose(rem[7],pS)*choose(otherRem,pO);
        if(pw===0n)continue;
        let hood=rem[2]-pH;
        const arven=rem[4]-pA;
        let basicEnergy=rem[6]-pE;
        const specialEnergy=rem[7]-pS;
        const other=47-hood-arven-basicEnergy-specialEnergy;
        let heldHood=hand[2]>0;
        let heldEnergy=hand[6]+hand[7]>0;
        let searches=0;
        if(!heldHood&&hand[3]>0&&hood>0){
          heldHood=true;hood--;searches++;
        }
        if(!heldEnergy&&hand[5]>0&&basicEnergy>0){
          heldEnergy=true;basicEnergy--;searches++;
        }
        const drawSize=47-searches;
        assert.equal(hood+arven+basicEnergy+specialEnergy+other,drawSize);
        const weightDraw=weight*pw*(scale/BigInt(drawSize));
        const categories=[hood,arven,basicEnergy,specialEnergy,other];
        for(let i=0;i<categories.length;i++){
          if(categories[i]===0)continue;
          if(!(heldEnergy||i===2||i===3))continue;
          const w=weightDraw*BigInt(categories[i]);
          eligibleEnergy+=w;
          if(heldHood||i===0)direct+=w;
          else if((hand[4]>0||i===1)&&hood>0)viaArven+=w;
        }
      }
      return;
    }
    const low=idx===0?1:0;
    const high=idx===0?1:Math.min(left,caps[idx]);
    for(let n=low;n<=high;n++){
      hand[idx]=n;
      initialHand(idx+1,left-n,weight*choose(caps[idx],n));
    }
  }
  initialHand(0,7,1n);
  const probability=n=>Number(n)/Number(denominator);
  return {
    schema:'agent36-rank15-hood-horror-prelock-item-policy-v1',
    hoodCopies,arvenCopies,
    denominator:String(denominator),
    favorable:String(direct+viaArven),
    directOrBagHood:String(direct),arvenToHood:String(viaArven),
    gengarEnergy:String(eligibleEnergy),
    jointProbability:probability(direct+viaArven),
    directOrBagProbability:probability(direct),
    arvenProbability:probability(viaArven),
    baselineProbability:probability(eligibleEnergy),
    legalOpeningProbability:Number(validSeven)/Number(choose(60,7))
  };
}
module.exports={prelockItemPolicyModel};
