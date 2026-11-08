'use strict';

const {trials,setupEvidence}=
  require('./agent32-fresh-early-vip-perfection.cjs');
const {runNativeBatch,summarizeRow}=
  require('./agent32-fresh-perfection-field.cjs');
const registration=require(
  '../../results/aichi-2026/registrations/agent32-fresh-early-vip-perfection-20261108.json');

const VERSION='agent32-retrospective-third-arm-vip-donor-only-v1';

/**
 * A NEW third opt-in policy arm on the previously disclosed frozen sixteen
 * deals, with no retested old controls. Remove competing Energy recipient
 * and bench-funding root flags while preserving true owner-only first-turn
 * Battle VIP and native Perfection. This is retrospective diagnosis, never a
 * fresh prospective win-rate sample.
 *
 * @param {{runner?:Function}} [deps]
 * @returns {object}
 */
function runVipOnlyThirdArm(deps={}){
  const registrationRows=trials();
  const native=runNativeBatch(true,deps.runner,{
    registeredTrials:registrationRows,
    registeredFrameName:registration.schema,
    nativeRootActionLimit:registration.rootLimit,
    vipAfterPass:true,vipPreferMewtwoDonor:true
  });
  const controls=native.selected.rawDevelopment.rows;
  const games=controls.map(row=>summarizeRow(row,true));
  const vip=controls.map(setupEvidence);
  const total=field=>vip.reduce((n,v)=>n+(v[field]??0),0);
  const summary={
    expectedFrozenGames:registration.physicalDealGroups,
    returnedNativeGames:games.length,
    nativeTerminalGames:games.filter(r=>r.status==='native-terminal').length,
    rootCaps:games.filter(r=>r.status==='root-cap').length,
    engineErrors:games.filter(r=>r.status==='engine-error').length,
    realAcceptedFirstTurnVipItems:total('nativeVipItemAccepted'),
    realSettledOwnerDeckVipSearches:total('ownerDeckVipSearchAccepted'),
    realVipPhysicalBenchPlacements:total('nativePhysicalVipBenchConfirmed'),
    preferredPhysicalMewtwoDonorPairSearches:
      total('preferredMewtwoDonorPairSearches'),
    paidPerfectionRootIntents:total('paidPerfectionIntents'),
    pendingVipPrompts:total('vipUnresolvedPrompts'),
    competitivelyQualifiedGames:0
  };
  return {
    version:VERSION,
    preregistration:registration.schema,
    originalHistoricalControlArchive:{
      actionsRun:42535963768,artifactId:13639382854,
      originalBaseline:'Perfection-only control',
      testedCombined:'VIP plus early recipient and Bench funding'
    },
    policy:'same Perfection-only native control plus first-turn owner VIP and owner authorized Mewtwo/donor pair, WITHOUT Energy recipient or Bench funding',
    allOriginalPrintedSixtiesUnchanged:true,
    exactPhysicalRegistrationsUnchanged:true,
    explicitRetrospectiveThirdArm:true,
    summary,games,vip,
    releaseQualified:false,competitivelyQualifiedGames:0
  };
}

if(require.main===module){
  const result=runVipOnlyThirdArm();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(result.summary.engineErrors>0||
    result.summary.returnedNativeGames!==registration.physicalDealGroups)
    process.exitCode=1;
}

module.exports={VERSION,runVipOnlyThirdArm};
