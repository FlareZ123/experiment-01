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
  nativeAcceptedTargets:true,mandatoryOptionFallback:true};
 const control=runDevelopment(options);
 const observed=runDevelopment({...options,
  sameRootProposalChoice:true,sameRootProbeAll:true,
  sameRootChoiceApply:false});
 const parity=compareNativeSameRootObservation(control,observed);
 const byTrial=observed.rows.map(row=>{
  const audit=row.actorOnlyDecisionCoverage.detailedComponentAudits.root.sameRootProposalChoice;
  return {id:row.trial.id,sourceSeat:row.sourceSeat,
   sourceDealFingerprint:row.sourceDealFingerprint,
   sourceRondoOffers:audit.offerSourceCounts['public-rondo']??0,
   ownerRoots:audit.ownerRoots,selectorErrorRoots:audit.selectorErrorRoots,
   status:row.status??(row.finished?'untimed-engine-terminal':'censored')};
 });
 return {version:VERSION,control,observed,parity,byTrial,
  totalPublicRondoOffers:byTrial.reduce((n,x)=>n+x.sourceRondoOffers,0),
  competitivelyQualifiedGames:0,
  caveat:'Retrospective same-seed original Store read-only opportunities; no win inference'};
}
if(require.main===module)process.stdout.write(JSON.stringify(runRank30RondoReadOnly())+'\n');
module.exports={VERSION,runRank30RondoReadOnly};
