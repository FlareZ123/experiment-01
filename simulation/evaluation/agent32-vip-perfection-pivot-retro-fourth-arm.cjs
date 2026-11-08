'use strict';

const reg=require(
  '../../results/aichi-2026/registrations/agent32-fresh-early-vip-perfection-20261108.json');
const {trials,setupEvidence}=
  require('./agent32-fresh-early-vip-perfection.cjs');
const {runNativeBatch,summarizeRow}=
  require('./agent32-fresh-perfection-field.cjs');

const VERSION='agent32-vip-plus-proven-perfection-pivot-retro-fourth-arm-v1';

/**
 * Compare with the three archived policy arms on the exact same original
 * physical source deals. This opts into Agent35's previously native-proven
 * two-step Benched Mewtwo funding plus one-unit paid Retreat plan.
 * No historical output is overwritten, and this is RETROSPECTIVE.
 *
 * @param {{runner?:Function}} [deps]
 */
function run(deps={}){
  const original=trials();
  const batch=runNativeBatch(true,deps.runner,{
    registeredTrials:original,
    registeredFrameName:reg.schema,
    nativeRootActionLimit:reg.rootLimit,
    vipAfterPass:true,vipPreferMewtwoDonor:true,
    perfectionTransition:true
  });
  const raw=batch.selected.rawDevelopment.rows;
  const games=raw.map(x=>summarizeRow(x,true));
  const setup=raw.map(setupEvidence);
  const movement=raw.map(row=>{
    const intents=row.actorOnlyDecisionCoverage?.detailedComponentAudits
      ?.root?.ownerRootIntents??[];
    const planned=intents.filter(x=>
      x.intent?.plan==='agent35-known-donor-benched-perfection-transition-v1');
    const roots=row.rootActionLedger??[];
    const actualRetreats=roots.filter(x=>x.action==='RetreatAction');
    return {trial:row.trial?.id??row.id,
      proposedPaidPerfectionPivots:planned.filter(x=>
        x.intent?.kind==='paid-retreat').length,
      proposedPsychicFunding:planned.filter(x=>
        x.intent?.kind==='attach-basic-energy').length,
      acceptedRetreatRoots:actualRetreats.length,
      nativeRetreats:actualRetreats,
      paidCopiedAttackRoots:row.actorOnlyDecisionCoverage
        ?.detailedComponentAudits?.root?.typedIntentCounts?.perfection??0
    };
  });
  const sum=(v,k)=>v.reduce((n,x)=>n+(x[k]??0),0);
  const summary={
    originalPhysicalGroups:original.length,
    actualNativeGames:games.length,
    terminals:games.filter(x=>x.status==='native-terminal').length,
    caps:games.filter(x=>x.status==='root-cap').length,
    nativeErrors:games.filter(x=>x.status==='engine-error').length,
    realVipItems:sum(setup,'nativeVipItemAccepted'),
    actualVipBenchSettlements:sum(setup,'nativePhysicalVipBenchConfirmed'),
    chosenMewtwoGengarPairs:sum(setup,'preferredMewtwoDonorPairSearches'),
    nativePerfectionRootIntents:sum(movement,'paidCopiedAttackRoots'),
    proposedPerfectionTransitionFunding:sum(movement,'proposedPsychicFunding'),
    proposedFundedMewtwoRetreats:sum(movement,'proposedPaidPerfectionPivots'),
    nativeRetreatActions:sum(movement,'acceptedRetreatRoots'),
    eligibleCompetitiveGameCount:0
  };
  return {
    version:VERSION,studyClass:'retrospective-fourth-arm',
    sourceOriginalRanks:reg.sourceRanks,printedSixtiesUnchanged:true,
    pinnedNativeEngine:reg.enginePin,
    originalSourceDealRegistration:reg.schema,
    engineNativeRootCap:reg.rootLimit,
    policy:'VIP-only plus Agent35 previously native-proven Perfection transition root on BOTH actual seats',
    priorUnchangedArms:{
      originalControl:42535963768,
      combinedFunding:42535963768,
      vipOnly:42536579458
    },
    summary,setup,movement,games,
    competitiveGamesQualified:0,
    releaseQualified:false
  };
}

if(require.main===module){
  const report=run();
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
  if(report.summary.actualNativeGames!==reg.physicalDealGroups||
    report.summary.nativeErrors>0)process.exitCode=1;
}

module.exports={VERSION,run};
