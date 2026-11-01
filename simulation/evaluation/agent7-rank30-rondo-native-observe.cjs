'use strict';
const assert=require('node:assert/strict');
const {scheduledArms}=require('./agent25-nine-omitted-archetypes-source-readiness.cjs');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {compareNativeSameRootObservation}=
  require('../../scripts/agent7-same-root-native-parity.cjs');
const profile=require('./agent41-frozen-bilateral-development-v2.json');
const VERSION='agent7-retrospective-rank30-rondo-readonly-native-v1';

function runRank30RondoReadOnly(){
 const trials=scheduledArms().filter(x=>x.rank===30);
 assert.equal(trials.length,4);
 const options={...profile.policyOptions,registeredTrials:trials,
  registeredFrameName:VERSION,
  allowAdditionalOriginalSourceRanks:true,actorOnlyComposition:true,
  nativeAcceptedTargets:true,mandatoryOptionFallback:true,
  // The frozen v2 profile selects native Tool, Supporter and same-root
  // choices. This pair observes, so disable their dependent action flags
  // identically in both controls before enabling read-only root telemetry.
  sameRootProposalChoice:false,sameRootChoiceApply:false,
  sameRootProbeAll:false,losslessNativeRootJoin:false,
  nativeToolAttachRoot:false,registeredToolEnergyCeiling:false,
  nativePlumeriaChoice:false,nativeZeroCostDenialChoice:false,
  teamFlareGruntDenialRoot:false,actorPlumeriaAfterPass:false};
 const control=runDevelopment(options);
 const observed=runDevelopment({...options,
  sameRootProposalChoice:true,sameRootProbeAll:true,
  sameRootChoiceApply:false});
 const parity=compareNativeSameRootObservation(control,observed);
 const byTrial=observed.rows.map(row=>{
  const audit=row.actorOnlyDecisionCoverage.detailedComponentAudits.root.sameRootProposalChoice;
  return {id:row.trial.id,sourceSeat:row.sourceSeat,
   sourceDealFingerprint:row.sourceDealFingerprint,
   sourceRondoOffers:audit.rondoOffersBySeat?.[row.sourceSeat]??0,
   candidateRondoOffers:audit.rondoOffersBySeat?.[row.candidateSeat]??0,
   sourceRondoReadiness:audit.rondoReadinessBySeat?.[row.sourceSeat]??{},
   sourceRondoBenchContext:audit.rondoBenchedBySeat?.[row.sourceSeat]??null,
   sourceRondoPsychicSetup:audit.rondoPatchBySeat?.[row.sourceSeat]??null,
   ownerRoots:audit.ownerRoots,selectorErrorRoots:audit.selectorErrorRoots,
   status:row.status??(row.finished?'untimed-engine-terminal':'censored')};
 });
 return {version:VERSION,control,observed,parity,byTrial,
  totalPublicRondoOffers:byTrial.reduce((n,x)=>n+x.sourceRondoOffers,0),
  totalOwnerRootReadiness:byTrial.reduce((out,x)=>{
    for(const [key,n] of Object.entries(x.sourceRondoReadiness))
      out[key]=(out[key]??0)+n;
    return out;
  },{}),
  competitivelyQualifiedGames:0,
  caveat:'Retrospective same-seed original Store read-only opportunities; no win inference'};
}
if(require.main===module){
 const report=runRank30RondoReadOnly();
 process.stdout.write(JSON.stringify(report)+'\n');
 process.stderr.write('RANK30_RONDO_PUBLIC_NATIVE_READONLY '+
  JSON.stringify({version:report.version,parity:report.parity.samePhysicalDeals,
   totalPublicRondoOffers:report.totalPublicRondoOffers,
   totalOwnerRootReadiness:report.totalOwnerRootReadiness,
   byTrial:report.byTrial,competitiveQualifiedGames:0})+'\n');
}
module.exports={VERSION,runRank30RondoReadOnly};
