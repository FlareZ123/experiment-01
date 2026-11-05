'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {
  withNativeTagThenGuzmaHalaInsideSelectedV5
}=require('./agent45-issue25-ghala-followup-v8.cjs');
const {
  withNativeHalaAfterActualTagCall
}=require('../twinleaf/agent45-owner-ghala-after-tagcall.cjs');
const {
  withSelectedFundedStadium
}=require('../twinleaf/agent7-funded-stadium-selected-native.cjs');
const {runAgent45GuzmaHalaRelaxedV9}=
  require('./agent45-issue25-ghala-relaxed-v9.cjs');
const {hashRegisteredFile}=
  require('./agent36-issue25-selected-v0.cjs');

const VERSION='agent18-real-owner-funded-stadium-after-v9-ghala-v10-retro';
const HASH_PATHS=Object.freeze([
  'results/aichi-2026/registrations/agent18-v10-after-paid-dce-funded-stadium-20261105.json',
  'simulation/evaluation/agent18-v10-owner-funded-stadium.cjs',
  'tests/agent18-v10-owner-funded-stadium.test.cjs',
  'tests/agent18-v10-owner-funded-stadium.native.test.cjs',
  'simulation/twinleaf/agent7-funded-stadium-selected-native.cjs',
  'simulation/twinleaf/agent7-funded-stadium-attack-planner.cjs'
]);

/**
 * Use the actual pinned compiled native Store, original SimpleTacticsAi and
 * printed card catalog. No deck/Prize sampling or policy RNG is involved.
 * @returns {object} Existing Agent7 verified Stadium layer dependencies.
 */
function nativeFundedStadiumRefs(){
  const {initializeCards}=require('../twinleaf/headless.cjs');
  const {trainerPrintCatalog}=
    require('../twinleaf/agent5-generic-owner-trainer-opportunity.cjs');
  const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const load=name=>require(path.join(root,name));
  const manager=initializeCards();
  const {Store}=load('game/store/store');
  const {SimpleTacticsAi}=load('simple-bot/simple-tactics-ai');
  const {GamePhase}=load('game/store/state/state');
  const {PlayCardAction,PlayerType,SlotType}=
    load('game/store/actions/play-card-action');
  const {TrainerCard}=load('game/store/card/trainer-card');
  const {TrainerType,Stage,CardType,SpecialCondition}=
    load('game/store/card/card-types');
  const catalog=trainerPrintCatalog(manager.getAllCards(),{
    TrainerCard,TrainerType
  });
  return {Store,SimpleTacticsAi,GamePhase,PlayCardAction,
    PlayerType,SlotType,Stage,CardType,SpecialCondition,catalog};
}

/**
 * Add only the pre-existing source-independent, owner-observation-gated
 * funded Stadium selected root after genuine Tag Call + genuinely paid G&H.
 * Native actual original eight request, actor ownership, hand and Store
 * actions are never altered before the owner-visible Stadium preflight.
 *
 * @template T
 * @param {()=>T} next Historical selected v5 run.
 * @param {{nativeRefs?:Function,stadiumLayer?:Function,halaLayer?:Function,
 *   compositionLayer?:Function}} [deps] Unit seams.
 * @returns {{result:T,audit:object}}
 */
function withOwnerFundedStadiumAfterNativeV9(next,deps={}){
  assert.equal(typeof next,'function');
  const compose=deps.compositionLayer??
    withNativeTagThenGuzmaHalaInsideSelectedV5;
  const hala=deps.halaLayer??withNativeHalaAfterActualTagCall;
  const stadium=deps.stadiumLayer??withSelectedFundedStadium;
  const buildRefs=deps.nativeRefs??nativeFundedStadiumRefs;
  for(const method of [compose,hala,stadium,buildRefs])
    assert.equal(typeof method,'function');
  const attempts=[];
  function halaWithFundedStadium(ownSixties,execute,options){
    let halaAudit=null;
    try{
      const selected=stadium(()=>{
        const paid=hala(ownSixties,execute,options);
        halaAudit=paid.audit;
        return paid.result;
      },buildRefs());
      attempts.push({
        status:'returned-unqualified',fundedStadiumAudit:selected.audit
      });
      return {result:selected.result,audit:{
        ...halaAudit,readOnlyOwnerFundedStadiumAudit:selected.audit
      }};
    }catch(error){
      attempts.push({
        status:'engine-aborted-unqualified',
        fundedStadiumAudit:error?.agent7FundedAudit??null
      });
      throw error;
    }
  }
  const selected=compose(next,{
    halaOptions:{maxDiscardPenalty:Number.POSITIVE_INFINITY},
    halaLayer:halaWithFundedStadium
  });
  assert.equal(selected.audit.actualNativeMatchCalls,attempts.length);
  return {result:selected.result,audit:{
    ...selected.audit,fundedStadiumAttempts:attempts,
    sourceIndependentPaidV9PlusOneOwnerFundedStadium:true,
    originalV9NativeOtherActionsUnchangedUntilSelectedRoot:true,
    competitiveGamesQualified:0
  }};
}

/**
 * Matched retrospective native same-eight development, opt-in only.
 * No result is a competitive field game without complete separately
 * validated paper rules and terminal outcomes.
 *
 * @param {{innerLayer?:Function,runner?:Function}} [deps] Unit seams.
 * @returns {{manifest:object,diagnostic:object,rawDevelopment:object|null}}
 */
function runAgent18FundedStadiumV10(deps={}){
  const observed=runAgent45GuzmaHalaRelaxedV9({
    ...deps,
    innerLayer:deps.innerLayer??withOwnerFundedStadiumAfterNativeV9
  });
  const inner=observed.diagnostic.innerNativeOwnerPromptAudit??{};
  const attempts=inner.fundedStadiumAttempts??[];
  const source=observed.diagnostic.registered??[];
  assert.equal(source.length,8);
  assert.equal(attempts.length,source.length);
  return {
    manifest:{
      ...observed.manifest,
      version:VERSION,policyEntryPoint:HASH_PATHS[1],
      nativeSourceAndCandidateSixtiesUnchanged:true,
      historicalNativeRootCap:48,
      singleAddedTreatment:'one owner-visible funded Stadium root on either actual seat if original bot Passes',
      originalNativeGuzmaHalaPaymentFeasibilityHeuristic:'infinity as parent v9',
      sourceIndependentBothOwners:true,
      releaseQualified:false,competitiveGamesQualified:0,
      resolvedSourceAndPolicyHashes:[
        ...observed.manifest.resolvedSourceAndPolicyHashes,
        ...HASH_PATHS.map(hashRegisteredFile)
      ]
    },
    diagnostic:{
      ...observed.diagnostic,schema:VERSION,
      fundedStadiumAttempts:attempts.map((row,i)=>({
        id:source[i],...row
      })),
      selectedNativeFundedStadiumAttempts:attempts.length,
      competitiveGamesQualified:0,
      verdict:'FAIL-retrospective-native-stadium-opportunity-only'
    },
    rawDevelopment:observed.rawDevelopment
  };
}

module.exports={
  VERSION,HASH_PATHS,nativeFundedStadiumRefs,
  withOwnerFundedStadiumAfterNativeV9,runAgent18FundedStadiumV10
};
