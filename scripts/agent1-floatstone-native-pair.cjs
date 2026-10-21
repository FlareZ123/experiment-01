'use strict';

const assert=require('node:assert/strict');
const {runDevelopment}=
  require('../simulation/evaluation/agent41-bilateral-v2-development.cjs');
const {compare}=
  require('./agent1-charged-promotion-native-pair.cjs');
const {VERSION}=require('../simulation/twinleaf/agent1-owner-float-stone-mobility.cjs');

const SETTINGS=Object.freeze({
  sourceFirstRetrospective:true,
  actorOnlyComposition:true,
  paperSupporterQuota:true
});

/** @returns {object} */
function runPair(){
  const baseline=runDevelopment({...SETTINGS,sourceFloatStoneMobility:false});
  const treatment=runDevelopment({...SETTINGS,sourceFloatStoneMobility:true});
  const pairs=compare(baseline,treatment).map((row,i)=>{
    const original=baseline.rows[i];
    const changed=treatment.rows[i];
    const audit=changed.actorOnlyDecisionCoverage?.detailedComponentAudits
      ?.root??null;
    const sourceSeat=changed.sourceSeat;
    const accepted=(audit?.nativeRootAcceptances??[]).filter(x=>
      x.seat===sourceSeat &&
      ['attach-emergency-floatstone',
        'retreat-emergency-floatstone'].includes(x.kind));
    return {
      ...row,
      actualSourceFirst:original.sourceActuallyFirst===true&&
        changed.sourceActuallyFirst===true,
      acceptedMobilityRoots:accepted.map(x=>({
        turn:x.globalTurn,kind:x.kind,accepted:x.accepted,
        publicZonesChanged:x.publicZonesChanged,
        physical:x.nativePhysicalEffect,
        error:x.error??null
      })),
      sourceMobilitySelectedRootCounts:{
        equipped:audit?.typedIntentCounts?.['attach-emergency-floatstone']??0,
        retreated:audit?.typedIntentCounts?.['retreat-emergency-floatstone']??0
      },
      candidateActorPromptSelectionsUnqualified:true,
      competitiveQualified:false
    };
  });
  return {
    schema:'agent1-source-floatstone-native-pair-v1',
    selectorVersion:VERSION,
    settings:SETTINGS,policyOnlyDifference:'source seat gains owner-hand/public-board emergency Float Stone plus retreat roots',
    baseline,treatment,pairs,
    sameFourPhysicalSourceDeals:pairs.every(p=>p.sameSourceDeal),
    sameFourActualStarters:pairs.every(p=>p.sameActualStarter),
    actualSourceFirstAll:pairs.every(p=>p.actualSourceFirst),
    historicalNonrandom:true,
    competitiveQualifiedGames:0
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(runPair(),null,2)+'\n');
module.exports={SETTINGS,runPair};
