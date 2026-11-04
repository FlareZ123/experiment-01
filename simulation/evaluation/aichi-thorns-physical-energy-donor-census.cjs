'use strict';

/**
 * Exhaustive static resource-choice census over physical Energy card copies.
 * Counts combinatorial configurations, not their real-play likelihood.
 */
const VERSION = 'physical-energy-donor-option-census-v1';
const THUNDER = 'Thunder Mountain Prism Star';
const WONDROUS = 'Wondrous Labyrinth Prism Star';
const THORNS_ENERGY = new Set([
  'Speed Lightning Energy','Capture Energy','Spiky Energy',
  'Double Colorless Energy'
]);

/** @param {number} n @param {number} k @returns {number} */
function choose(n,k) {
  if(k>n||k<0)return 0;
  let out=1;
  for(let i=1;i<=k;i++)out=out*(n-i+1)/i;
  return Math.round(out);
}

/**
 * @param {string[]} physicalNames Physical card-copy list.
 * @param {(cards:string[], stadiums:string[]) => boolean|null} canPay
 * @param {string[]} stadiums
 * @param {number} subsetSize
 * @returns {object}
 */
function enumerateDonorChoices(physicalNames,canPay,stadiums,subsetSize) {
  if (!Array.isArray(physicalNames)||!physicalNames.every(x=>typeof x==='string') ||
      typeof canPay!=='function'||!Array.isArray(stadiums) ||
      !Number.isInteger(subsetSize)||subsetSize<1||subsetSize>physicalNames.length)
    throw new Error('INVALID_ENUMERATION_INPUT');
  const out={
    subsetSize,physicalCopies:physicalNames.length,stadiums:stadiums.slice(),
    totalPhysicalSubsets:choose(physicalNames.length,subsetSize),
    beforeUnpayable:0,allDonorsUnsafe:0,mixedDonorSafety:0,allDonorsSafe:0,
    payableBeforeDonation:0,qualifiedForGameInference:false
  };
  const selected=[];
  const paid=(cards)=>{
    const value=canPay(cards,stadiums);
    if(typeof value!=='boolean')throw new Error('UNMODELED_PRINTED_COST');
    return value;
  };
  function classify() {
    const subset=selected.map(i=>physicalNames[i]);
    if(!paid(subset)){out.beforeUnpayable++;return;}
    out.payableBeforeDonation++;
    let safe=0;
    for(let i=0;i<subset.length;i++){
      const remaining=subset.slice();
      remaining.splice(i,1);
      if(paid(remaining))safe++;
    }
    if(safe===0)out.allDonorsUnsafe++;
    else if(safe===subset.length)out.allDonorsSafe++;
    else out.mixedDonorSafety++;
  }
  function enumerate(start) {
    if(selected.length===subsetSize){classify();return;}
    for(let i=start;i<=physicalNames.length-(subsetSize-selected.length);i++){
      selected.push(i);
      enumerate(i+1);
      selected.pop();
    }
  }
  enumerate(0);
  const sum=out.beforeUnpayable+out.allDonorsUnsafe+
    out.mixedDonorSafety+out.allDonorsSafe;
  if(sum!==out.totalPhysicalSubsets)throw new Error('CENSUS_PARTITION_FAILED');
  return out;
}

/**
 * @param {object} field Original Aichi source manifest; no synthetic additions.
 * @param {(cards:string[],stadiums:string[])=>boolean|null} canPay
 * @returns {object}
 */
function analyzeAichiThornsDonorOptions(field,canPay) {
  const ranks=[6,24,29];
  const rosters=[];
  for(const rank of ranks) {
    const deck=field.decks.find(x=>x.rank===rank);
    if(!deck)throw new Error('MISSING_ORIGINAL_RANK_'+rank);
    const energy=deck.cards.filter(card=>card.name.endsWith(' Energy'));
    const unsupported=energy.filter(x=>!THORNS_ENERGY.has(x.name));
    if(unsupported.length)throw new Error('UNMODELED_SOURCE_ENERGY_'+rank);
    const physicalNames=energy.flatMap(card=>Array(card.count).fill(card.name));
    if(physicalNames.length!==8 || 
       deck.cards.reduce((n,card)=>n+card.count,0)!==60)
      throw new Error('SOURCE_DECK_NOT_FIXED_60_OR_8_ENERGY_'+rank);
    const strata=[];
    for(const subsetSize of [2,3,4,5]){
      for(const stadiums of [[],[THUNDER],[WONDROUS]]){
        strata.push(enumerateDonorChoices(physicalNames,canPay,stadiums,subsetSize));
      }
    }
    rosters.push({rank,player:deck.player,energy:energy.map(x=>({
      name:x.name,count:x.count})),strata});
  }
  return {
    version:VERSION,source:'original Aichi Open League 2026 printed 60s',
    treatedPhysicalEnergyCopiesPerRank:8,
    benchPresenceAssumed:true,
    equalWeightOverPhysicalEnergySubsetsOnly:true,
    retainsCurrentVisibleStadium:true,
    futureGameStateAndAttacksUnmodeled:true,
    qualifiedForGameInference:false,rosters
  };
}

if(require.main===module){
  const field=require('../../results/aichi-2026/full-decklists.json');
  const {canPayVoltCost}=require('./agent45-volt-cyclone-donor-debt.cjs');
  process.stdout.write(JSON.stringify(
    analyzeAichiThornsDonorOptions(field,canPayVoltCost),null,2)+'\n');
}
module.exports={VERSION,THUNDER,WONDROUS,choose,
  enumerateDonorChoices,analyzeAichiThornsDonorOptions};
