'use strict';

const assert=require('node:assert/strict');
const {runIssue25V8WithOwnerAbilityPolicy}=
  require('./agent36-issue25-v8-owner-ability-policy.cjs');
const {runV8BilateralPerfectionRoot}=
  require('./agent24-v8-bilateral-perfection-root-native.cjs');

const VERSION='agent24-original-v8-perfection-paid-root-paired-development-v1';

/**
 * First different real Store action. Equal shared prefixes are compared by
 * exact native action metadata; post-divergence policy effect is causal only
 * on the same initial physical deal, not tournament performance.
 *
 * @param {object[]} a Base native root ledger.
 * @param {object[]} b Opt-in native root ledger.
 * @returns {{ordinal:number|null,baseline:object|null,treatment:object|null}}
 */
function firstRootDivergence(a,b){
  assert.ok(Array.isArray(a)&&Array.isArray(b));
  for(let ordinal=0;ordinal<Math.max(a.length,b.length);ordinal++){
    const before=a[ordinal]??null,after=b[ordinal]??null;
    if(JSON.stringify(before)!==JSON.stringify(after))
      return {ordinal,baseline:before,treatment:after};
  }
  return {ordinal:null,baseline:null,treatment:null};
}

/**
 * Pair the exact frozen original-source physical deals and two fixed 60s,
 * with no search over seeds. Both policies run fully, with native prompts.
 *
 * @param {{baselineRunner?:Function,treatmentRunner?:Function}} [deps]
 * @returns {object}
 */
function runV8PerfectionPair(deps={}){
  const baseline=(deps.baselineRunner??runIssue25V8WithOwnerAbilityPolicy)();
  const treatment=(deps.treatmentRunner??runV8BilateralPerfectionRoot)();
  const baselineRows=baseline.rawDevelopment?.rows??[];
  const treatedRows=treatment.trialSummaries??[];
  const baseOutcomes=new Map(
    (baseline.diagnostic.actualAttemptRows??[]).map(x=>[x.id,x]));
  const treatedOutcomes=new Map(
    (treatment.diagnostic.actualAttemptRows??[]).map(x=>[x.id,x]));
  assert.equal(baselineRows.length,8);
  assert.equal(treatedRows.length,8);
  assert.equal(baseOutcomes.size,8);
  assert.equal(treatedOutcomes.size,8);
  const treatedById=new Map(treatedRows.map(x=>[x.id,x]));
  const pairs=baselineRows.map(base=>{
    const id=base.trial?.id??base.id;
    const treated=treatedById.get(id);
    const a=baseOutcomes.get(id),b=treatedOutcomes.get(id);
    assert.ok(treated&&a&&b,'all registered original-source arms required');
    assert.equal(a.fullPhysicalDealFingerprint,b.fullPhysicalDealFingerprint,
      'same original physical shuffle, Prize deal and both decks required');
    assert.equal(a.sourceDealFingerprint,b.sourceDealFingerprint);
    assert.equal(a.sourceSeat,b.sourceSeat);
    assert.equal(a.candidateSeat,b.candidateSeat);
    const divergence=firstRootDivergence(base.rootActionLedger,
      treated.rootActionLedger);
    return {
      trial:id,sourceSeat:a.sourceSeat,candidateSeat:a.candidateSeat,
      samePhysicalDeal:true,
      firstDifferentStoreRoot:divergence,
      control:{rootActions:a.rootActionCount,finished:a.finished,
        status:a.status,remainingPrizes:a.finalPrizes,winner:a.winner},
      paidPerfection:{rootActions:b.rootActionCount,finished:b.finished,
        status:b.status,remainingPrizes:b.finalPrizes,winner:b.winner,
        ownerPerfectionIntents:
          treated.actorRoot?.typedIntentCounts?.perfection??0,
        nativeCopiedAttackMenus:treated.actorChooseAttack?.menus??0,
        nativeCopiedAttackAccepted:treated.actorChooseAttack?.accepted??0,
        copiedAttackChoices:treated.actorChooseAttack?.selections??[]}
    };
  });
  return {
    version:VERSION,source:'exact frozen original rank6,11,1,3 eight-arm v8',
    calibration:'retrospective same physical seed, no unseen trials',
    control:'selected v8 actor policy plus existing Telepath and Ability owners',
    treatment:'same native runner with paid Perfection enabled on both seats',
    gamesCompared:8,
    pairs,releaseQualified:false,competitiveGamesQualified:0
  };
}

if(require.main===module){
  const report=runV8PerfectionPair();
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
}

module.exports={VERSION,firstRootDivergence,runV8PerfectionPair};
