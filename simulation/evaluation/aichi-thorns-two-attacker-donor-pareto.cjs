'use strict';

const {choose,THUNDER,WONDROUS,analyzeAichiThornsDonorOptions}=
  require('./aichi-thorns-physical-energy-donor-census.cjs');

const VERSION='aichi-thorns-two-attacker-energy-donor-pareto-v1';

/**
 * Compare the printed-cost viability of the current Active and one own
 * Benched Iron Thorns ex after moving each possible physical Active Energy.
 * No tactical preference is assigned between attackers. Output is a
 * two-objective resource frontier, not a complete card-play policy.
 *
 * @param {string[]} active Attached Energy physical names, in copy order.
 * @param {string[]} bench Attached Energy physical names, in copy order.
 * @param {string[]} stadiums Current public Stadium (none or one).
 * @param {(cards:string[],stadiums:string[])=>boolean|null} canPay
 * @returns {object}
 */
function twoAttackerDonorPareto(active,bench,stadiums,canPay){
  if(!Array.isArray(active)||active.length<1||
      !Array.isArray(bench)||!Array.isArray(stadiums)||
      !active.every(x=>typeof x==='string')||
      !bench.every(x=>typeof x==='string')||
      typeof canPay!=='function')
    throw new Error('INVALID_TWO_ATTACKER_INPUT');
  const paid=(energy)=>{
    const v=canPay(energy,stadiums);
    if(typeof v!=='boolean')throw new Error('UNKNOWN_PRINTED_COST');
    return v;
  };
  const activeInitiallyPayable=paid(active);
  const benchInitiallyPayable=paid(bench);
  const candidates=active.map((donorName,donorIndex)=>{
    const sourceAfter=active.filter((_,i)=>i!==donorIndex);
    const recipientAfter=[...bench,donorName];
    return {
      donorName,donorIndex,sourceAfter,recipientAfter,
      activeCostPayable:paid(sourceAfter),
      benchCostPayable:paid(recipientAfter)
    };
  });
  const someActivePayable=candidates.some(c=>c.activeCostPayable);
  const someBenchPayable=candidates.some(c=>c.benchCostPayable);
  const someBothPayable=candidates.some(c=>
    c.activeCostPayable&&c.benchCostPayable);
  const nonDominatedFundingConflict=activeInitiallyPayable&&
    someActivePayable&&someBenchPayable&&!someBothPayable;
  return {
    activeInitiallyPayable,benchInitiallyPayable,
    someActivePayable,someBenchPayable,someBothPayable,
    nonDominatedFundingConflict,candidates,
    independentPaperGameLegalityVerified:false,
    competitiveWinInference:false
  };
}

/**
 * Enumerate every physically distinct Active3/Bench1 Energy allocation
 * over each source's exact eight original physical Energy card copies.
 * The counts are allocations, not realistic board occurrence rates.
 * @param {object} field Authenticated Aichi original-60 roster.
 * @param {(cards:string[],stadiums:string[])=>boolean|null} canPay
 * @returns {object}
 */
function originalThornsTwoAttackerCensus(field,canPay){
  const source=analyzeAichiThornsDonorOptions(field,canPay);
  const rosters=source.rosters.map(row=>{
    const physical=row.energy.flatMap(x=>Array(x.count).fill(x.name));
    const strata=[];
    for(const stadiums of [[],[THUNDER],[WONDROUS]]){
      const counts={
        physicalAllocations:0,activeInitiallyPayable:0,
        nonDominatedFundingConflict:0,someBothPayable:0,
        anyActivePreservingDonor:0,anyBenchPayableAfterDonor:0,
        neitherViableFundingChoice:0
      };
      const examples=[];
      for(let a=0;a<physical.length;a++)
        for(let b=a+1;b<physical.length;b++)
          for(let c=b+1;c<physical.length;c++){
            const activeIndices=[a,b,c];
            const active=activeIndices.map(i=>physical[i]);
            for(let d=0;d<physical.length;d++){
              if(activeIndices.includes(d))continue;
              const bench=[physical[d]];
              counts.physicalAllocations++;
              const frontier=twoAttackerDonorPareto(
                active,bench,stadiums,canPay);
              if(!frontier.activeInitiallyPayable)continue;
              counts.activeInitiallyPayable++;
              if(frontier.someActivePayable)
                counts.anyActivePreservingDonor++;
              if(frontier.someBenchPayable)
                counts.anyBenchPayableAfterDonor++;
              if(frontier.someBothPayable)
                counts.someBothPayable++;
              if(!frontier.someActivePayable&&!frontier.someBenchPayable)
                counts.neitherViableFundingChoice++;
              if(frontier.nonDominatedFundingConflict){
                counts.nonDominatedFundingConflict++;
                if(examples.length<2)examples.push({
                  activeEnergy:active,benchEnergy:bench,
                  candidates:frontier.candidates.map(x=>({
                    moved:x.donorName,
                    activePayable:x.activeCostPayable,
                    benchPayable:x.benchCostPayable
                  }))
                });
              }
            }
          }
      const expected=choose(8,3)*choose(5,1);
      if(counts.physicalAllocations!==expected)
        throw new Error('TWO_ATTACKER_ALLOCATION_PARTITION_FAILED');
      strata.push({stadiums,counts,examples});
    }
    return {rank:row.rank,player:row.player,
      eightPhysicalEnergyCopies:row.energy,strata};
  });
  return {
    version:VERSION,
    activeEnergyCount:3,benchEnergyCount:1,
    bothPokemonAssumedIronThornsEx:true,
    recipientBenchExistsAssumed:true,
    selectedDonorMovesExactlyOnePhysicalEnergy:true,
    samePublicStadiumAndNoOtherCostEffects:true,
    physicalAllocationWeightsUniformForCombinatorics:true,
    actualBoardFrequencyOrGameplayUnknown:true,
    competitiveQualifiedGames:0,rosters
  };
}

if(require.main===module){
  const field=require('../../results/aichi-2026/full-decklists.json');
  const {canPayVoltCost}=require('./agent45-volt-cyclone-donor-debt.cjs');
  process.stdout.write(JSON.stringify(
    originalThornsTwoAttackerCensus(field,canPayVoltCost),null,2)+'\n');
}

module.exports={VERSION,twoAttackerDonorPareto,originalThornsTwoAttackerCensus};
