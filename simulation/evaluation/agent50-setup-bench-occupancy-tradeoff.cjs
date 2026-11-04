'use strict';

const assert=require('node:assert/strict');
const {choose}=require('./agent1-prize-failure-budget.cjs');
const {
  originalFieldBenchTriggerExposure
}=require('./agent50-opening-bench-trigger-exposure.cjs');
const {
  structuralCandidateBenchTriggerExposure
}=require('./agent50-structural-candidate-opening-exposure.cjs');

const VERSION='agent50-setup-bench-occupancy-tradeoff-v1';

/**
 * Exact distribution of physical setup Bench capacity under two predeclared
 * deterministic initial-cardinality policies.
 *
 * GREEDY: pick all eligible Basic Pokémon (up to native maximum), first
 * selected Active, all others Benched. PROTECTED: pick first eligible
 * non-in-turn-entry Basic as Active when possible, then only ordinary Basics
 * for Bench, leaving recognized in-turn hand-to-Bench supports in hand.
 *
 * This conditions on a valid seven-card opening and integrates every
 * hypergeometric hand class, including all-Basic hands with max6 truncation.
 * It stops at setup. A subsequent turn may bench held cards, and any actual
 * donk risk or Ability value is unmeasured here.
 *
 * @param {number} basics Physical eligible Basic count.
 * @param {number} entrySupportBasics Subset with known in-turn Bench Ability.
 * @param {{deckSize?:number,handSize?:number,maxSelected?:number}} [config]
 * @returns {object} BigInt exact numerators and decimal probabilities.
 */
function openingBenchOccupancyTradeoff(basics,entrySupportBasics,config={}){
  const deckSize=config.deckSize??60;
  const handSize=config.handSize??7;
  const maxSelected=config.maxSelected??6;
  assert.ok(Number.isSafeInteger(deckSize)&&deckSize>=handSize);
  assert.ok(Number.isSafeInteger(handSize)&&handSize>=1);
  assert.ok(Number.isSafeInteger(maxSelected)&&maxSelected>=1);
  assert.ok(Number.isSafeInteger(basics)&&basics>=1&&basics<=deckSize);
  assert.ok(Number.isSafeInteger(entrySupportBasics)&&
    entrySupportBasics>=0&&entrySupportBasics<=basics);
  const ordinary=basics-entrySupportBasics;
  const nonBasic=deckSize-basics;
  const valid=choose(deckSize,handSize)-choose(nonBasic,handSize);
  const sum={
    greedyAnyBench:0n,protectedAnyBench:0n,
    additionalSoloActiveUnderProtection:0n,
    greedyBenchSlots:0n,protectedBenchSlots:0n,
    avoidableTriggerAndProtectedSolo:0n,
    avoidableTriggerAndProtectedBench:0n,
    sevenBasicOpenings:0n
  };
  let accounted=0n;
  for(let t=0;t<=Math.min(entrySupportBasics,handSize);t++){
    for(let r=0;r<=Math.min(ordinary,handSize-t);r++){
      const totalBasics=t+r;
      if(totalBasics===0)continue;
      const filler=handSize-totalBasics;
      const weight=choose(entrySupportBasics,t)*choose(ordinary,r)*
        choose(nonBasic,filler);
      if(weight===0n)continue;
      accounted+=weight;
      const greedyBench=Math.min(totalBasics-1,maxSelected-1);
      const protectedBench=Math.min(Math.max(r-1,0),maxSelected-1);
      assert.ok(protectedBench<=greedyBench);
      if(greedyBench>0)sum.greedyAnyBench+=weight;
      if(protectedBench>0)sum.protectedAnyBench+=weight;
      if(greedyBench>0&&protectedBench===0)
        sum.additionalSoloActiveUnderProtection+=weight;
      sum.greedyBenchSlots+=weight*BigInt(greedyBench);
      sum.protectedBenchSlots+=weight*BigInt(protectedBench);
      // These two categories use precisely the same conservative
      // <=maxSelected event as original trigger-consumption census.
      if(t>=1&&r>=1&&totalBasics<=maxSelected){
        if(protectedBench===0)
          sum.avoidableTriggerAndProtectedSolo+=weight;
        else
          sum.avoidableTriggerAndProtectedBench+=weight;
      }
      if(totalBasics===handSize)sum.sevenBasicOpenings+=weight;
    }
  }
  assert.equal(accounted,valid);
  assert.ok(sum.protectedAnyBench<=sum.greedyAnyBench);
  assert.ok(sum.protectedBenchSlots<=sum.greedyBenchSlots);
  const probability=key=>Number(sum[key])/Number(valid);
  return {
    basics,entrySupportBasics,maxSelected,deckSize,handSize,
    validOpeningCount:valid,
    numerators:sum,
    greedyAnyBench:probability('greedyAnyBench'),
    protectedAnyBench:probability('protectedAnyBench'),
    extraSoloActiveSetupProbability:
      probability('additionalSoloActiveUnderProtection'),
    greedyExpectedSetupBenchSlots:probability('greedyBenchSlots'),
    protectedExpectedSetupBenchSlots:probability('protectedBenchSlots'),
    expectedBenchSlotsPreservedByGreedy:
      Number(sum.greedyBenchSlots-sum.protectedBenchSlots)/Number(valid),
    avoidableTriggerProtectedSoloProbability:
      probability('avoidableTriggerAndProtectedSolo'),
    avoidableTriggerProtectedBenchProbability:
      probability('avoidableTriggerAndProtectedBench'),
    sevenBasicGivenValid:probability('sevenBasicOpenings')
  };
}

/**
 * Both source families retain exact original printed identity; any missing
 * source printer, unresolved promo text, or missing top-32 rank remains
 * unverified rather than silently corrected.
 *
 * @param {string} [root]
 * @returns {object}
 */
function originalAndCandidateOccupancy(root){
  const originals=originalFieldBenchTriggerExposure(root);
  const structural=structuralCandidateBenchTriggerExposure(root);
  const originalRows=originals.rows.map(r=>({
    rank:r.rank,archetype:r.archetype,
    ...openingBenchOccupancyTradeoff(r.basics,r.knownTurnBenchTriggerBasics)
  }));
  const candidateRows=structural.rows.map(r=>({
    name:r.name,
    ...openingBenchOccupancyTradeoff(r.basics,r.triggers)
  }));
  const means={};
  const keys=[
    'greedyAnyBench','protectedAnyBench',
    'extraSoloActiveSetupProbability',
    'greedyExpectedSetupBenchSlots',
    'protectedExpectedSetupBenchSlots',
    'expectedBenchSlotsPreservedByGreedy',
    'avoidableTriggerProtectedSoloProbability',
    'avoidableTriggerProtectedBenchProbability'
  ];
  for(const key of keys)
    means[key]=originalRows.reduce((s,r)=>s+r[key],0)/originalRows.length;
  assert.equal(originalRows.length,29);
  assert.equal(candidateRows.length,4);
  assert.ok(Math.abs(means.avoidableTriggerProtectedSoloProbability+
    means.avoidableTriggerProtectedBenchProbability-
    originals.equalRankMeanAvoidableOpportunity)<1e-12);
  return {
    version:VERSION,originalKnownRanks:originalRows.length,
    originalUnknownRanks:[23,25,28],
    structuralCandidates:candidateRows.length,
    originalEqualRankMeans:means,
    originalRows,candidateRows,
    modelScope:'physical seven-card valid opening only',
    selectedPolicyChanged:false,
    competitiveQualifiedGames:0
  };
}

module.exports={VERSION,openingBenchOccupancyTradeoff,
  originalAndCandidateOccupancy};
