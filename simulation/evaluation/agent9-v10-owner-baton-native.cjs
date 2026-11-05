'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {run,writeLocked}=
  require('./agent5-rank6-paid-dce-thunder-volt-v10.cjs');
const {withSourceAfterDceThunderVolt}=
  require('../twinleaf/agent5-source-paid-dce-thunder-volt.cjs');
const {withOwnerDceBatonObserver,VERSION:OBSERVER_VERSION}=
  require('../twinleaf/agent9-v10-dce-baton-observer.cjs');

const VERSION='agent9-passive-owner-dce-baton-v10-original-native-v1';
const TARGETS=new Set([
  '6:101:B:champion-reference',
  '6:101:B:new-moon-lockbreaker-v1'
]);

/**
 * Exact frozen original v9-vs-v10 controlled native experiment plus a
 * passive owner-only turn4/6 readout. The original v10 action stream should
 * be unchanged, and positive roots remain the historical originals.
 * @param {{runner?:Function,sourceHook?:Function,observer?:Function}} [deps]
 * @returns {object} Failure-inclusive, noncompetitive source-opportunity rows.
 */
function runBatonAudit(deps={}){
  const original=deps.runner??run;
  const source=deps.sourceHook??withSourceAfterDceThunderVolt;
  const observer=deps.observer??withOwnerDceBatonObserver;
  const complete=original({
    hook:(execute,{trialId})=>{
      let observed=null;
      try{
        const witnessed=source(()=>{
          observed=observer(execute,{trialId});
          return observed.result;
        },{trialId});
        return {result:witnessed.result,audit:{
          ...witnessed.audit,batonObserver:observed?.audit??null
        }};
      }catch(error){
        if(error&&typeof error==='object')
          error.agent9BatonCompositeAudit={
            source:error.agent5AfterDceThunderVoltAudit??null,
            passive:observed?.audit??error.agent9BatonObserverAudit??null
          };
        throw error;
      }
    }
  });
  assert.equal(complete.rows.length,8);
  const rows=complete.rows.map(row=>{
    const expected=TARGETS.has(row.id);
    const baton=row.nativeSourceOwnerLineAudit?.batonObserver??null;
    return {
      id:row.id,sourceSeat:row.sourceSeat,
      baselineStatus:row.originalDisposition,
      treatmentStatus:row.treatmentDisposition,
      sameFullPhysicalDeal:row.sameOriginalAndCandidateFullPhysicalDeal,
      baselineMatchesPreregistration:
        row.baselineTargetMatchesFrozenRegistration,
      acceptedPrefixThroughDce:row.unchangedSourceAcceptedPrefixThroughDce,
      controlRootCount:row.baselineRootCount,
      treatmentRootCount:row.treatmentRootCount,
      unchangedSixNegativeRootTape:row.fullNonTargetPublicTapeUnchanged,
      sourceAttackDeclarations:
        row.treatmentSourceAttackCount,
      sourceAttackSettle:(row.treatmentSourceAttackSettlement?.attacks??[])
        .map(a=>({
          ordinal:a.actionOrdinal,name:a.attackName,
          promptSettled:a.settledPromptChain,
          nextOpponentRoot:a.nextSourceRoot,
          opponentSameEpoch:a.nextSourceSameEpochProven
        })),
      originalPostDceRoots:row.originalAfterDceRoots,
      treatmentPostDceRoots:row.counterfactualAfterDceRoots,
      nativeDceMoves:row.nativeSourceOwnerLineAudit?.
        nativeSettledMandatoryEnergyMoves??null,
      passiveObservation:baton,
      expectsPassiveObservation:expected,
      competitivelyQualified:false
    };
  });
  const positive=rows.filter(row=>row.expectsPassiveObservation);
  assert.equal(positive.length,2);
  assert.ok(rows.every(row=>row.sameFullPhysicalDeal));
  assert.ok(rows.filter(row=>!row.expectsPassiveObservation)
    .every(row=>row.unchangedSixNegativeRootTape===true));
  assert.ok(positive.every(row=>
    row.baselineMatchesPreregistration===true&&
    row.acceptedPrefixThroughDce===true&&
    row.nativeDceMoves===1&&
    row.passiveObservation?.sourceTurn2VoltDeclarations===1&&
    row.passiveObservation?.changedAnyAction===false));
  return {
    version:VERSION,observerVersion:OBSERVER_VERSION,
    originalCompiledV10:
      'CI42106359764-artifact13453110356',
    fixedSourceOriginalTrialCount:8,
    targetTreatmentCount:2,
    historicalOriginal48RootCapRetained:true,
    allBaselineAndTreatmentPhysicalDealsMatched:true,
    sixNonTargetRootTapesPreserved:true,
    positivePostDceOwnerDecisions:
      positive.map(row=>({id:row.id,
        observations:row.passiveObservation?.records??[],
        sourceNativePasses:row.passiveObservation?.nativePasses??null,
        nativeSupporterQuotaMutations:row.passiveObservation?.
          nativeSupporterQuotaMutationObservations??null})),
    rows,competitivelyQualifiedGames:0,
    fullPaperLegalityCertified:false,estimatedWinRate:null,
    limitations:[
      'Retrospective two registered physical source games; not held-out',
      'Observer never changes original v10 source action policy',
      'A held Supporter is not a certified chosen, paid, or optimal action',
      'No revised 25-minute clock or adversarially certified opponent'
    ]
  };
}

if(require.main===module){
  try{
    const out=runBatonAudit();
    const output=process.env.AGENT9_BATON_DIR;
    assert.ok(output,'AGENT9_BATON_DIR is required for archived native output');
    const name=path.join(output,'agent9-v10-owner-baton-native.json');
    writeLocked(name,out);
    process.stdout.write(JSON.stringify({
      version:VERSION,rows:out.rows.length,
      activeTargetRecords:out.positivePostDceOwnerDecisions.map(x=>({
        id:x.id,observations:x.observations,
        sourceNativePasses:x.sourceNativePasses,
        nativeSupporterQuotaMutations:x.nativeSupporterQuotaMutations
      })),
      allDealsMatched:out.allBaselineAndTreatmentPhysicalDealsMatched,
      competitivelyQualifiedGames:0
    })+'\n');
  }catch(error){
    process.stdout.write(JSON.stringify({
      version:VERSION,error:String(error?.stack??error).slice(0,6000),
      competitivelyQualifiedGames:0
    })+'\n');
    process.exitCode=1;
  }
}
module.exports={VERSION,TARGETS,runBatonAudit};
