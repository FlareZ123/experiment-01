'use strict';

const assert=require('node:assert/strict');
const {run}=require('./agent50-sourcefirst-guzma-energy-staging-pair.cjs');
const {withSameTargetAttachEnergySelection}=
  require('../twinleaf/same-target-attach-energy-hook.cjs');

const HISTORICAL_SEEDS=Object.freeze([2584586627,17984023,1407148205,2612415444]);
const PINNED_ENGINE='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

/** @param {object} arm @returns {object} */
function armReceipt(arm){
  return {
    status:arm.abort??null,
    error:arm.error??null,
    firstSeat:arm.actualStarterSeat??null,
    sourceDeal:arm.sourceDealFingerprint??null,
    rootCount:arm.rootActionCount??null,
    settledSourceAttacks:arm.sourceSettledAttacks??null,
    settledCandidateAttacks:arm.candidateSettledAttacks??null,
    finalPrizes:arm.finalPrizes??null,
    winner:arm.winner??null,
    finished:arm.finished===true,
    endReason:arm.endReason??null
  };
}

/** @param {object} pair @returns {object} */
function pairReceipt(pair){
  assert.equal(pair.attemptedArms,2);
  assert.equal(pair.pinnedEngine,PINNED_ENGINE);
  return {
    sourceDealEqualWithinStagePair:pair.sourceDealEqual===true,
    firstRootLabelDifference:pair.firstDifference??null,
    unchangedNativeRootPrefixCount:pair.unchangedNativePrefixCount,
    noStaging:armReceipt(pair.control),
    staging:armReceipt(pair.treatment)
  };
}

/**
 * Execute original native Store controls and repaired bot selections.
 * The repair wrapper restores its resolver in finally, including on error.
 * @param {number} seed
 * @param {{nativeRun?:(seed:number)=>object,withRepair?:Function}} [deps]
 */
function compareSeed(seed,deps={}){
  assert.ok(HISTORICAL_SEEDS.includes(seed));
  const nativeRun=deps.nativeRun??run;
  const withRepair=deps.withRepair??withSameTargetAttachEnergySelection;
  const baseline=nativeRun(seed);
  const restored=withRepair(()=>nativeRun(seed));
  const repaired=restored.result;
  assert.equal(baseline.sourceSeed,seed);
  assert.equal(repaired.sourceSeed,seed);
  return {
    seed,baseline:pairReceipt(baseline),repair:pairReceipt(repaired),
    repairAudit:restored.audit,
    fullPairs:{baseline,repaired},
    crossPolicySourceDealEquality:[
      baseline.control.sourceDealFingerprint!==null &&
        baseline.control.sourceDealFingerprint===repaired.control.sourceDealFingerprint,
      baseline.treatment.sourceDealFingerprint!==null &&
        baseline.treatment.sourceDealFingerprint===repaired.treatment.sourceDealFingerprint
    ],
    crossPolicyEqualityUnverifiedIfErrors:
      baseline.control.sourceDealFingerprint===null ||
      baseline.treatment.sourceDealFingerprint===null ||
      repaired.control.sourceDealFingerprint===null ||
      repaired.treatment.sourceDealFingerprint===null
  };
}

/** @param {number[]} seeds */
function runPanel(seeds=[HISTORICAL_SEEDS[0]]){
  const records=seeds.map(seed=>compareSeed(seed));
  return {
    schema:'agent42-native-sametarget-fixed-source-repair-v1',
    registration:'results/aichi-2026/registrations/agent42-rank11-sametarget-recovery-20261022.md',
    pinnedEngine:PINNED_ENGINE,
    sourceRank:11,sourceSeat:0,candidateSeat:1,
    historicalDevelopmentOnly:true,provenCompetitiveGames:0,
    seeds,attemptedPolicyComparisons:records.length,
    attemptedStoreArms:4*records.length,
    records
  };
}

if(require.main===module){
  const panel=runPanel(process.env.AGENT42_SAMETARGET_ALL_FOUR==='true'?
    [...HISTORICAL_SEEDS]:[HISTORICAL_SEEDS[0]]);
  process.stdout.write(JSON.stringify(panel,null,2)+'\n');
}
module.exports={HISTORICAL_SEEDS,PINNED_ENGINE,armReceipt,pairReceipt,
  compareSeed,runPanel};
