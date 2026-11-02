'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const profile=require('./agent41-frozen-bilateral-development-v2.json');
const {run:runControl,treatmentOptions}=
  require('./agent10-rank9-known-dead-attack-counterfactual.cjs');
const {scheduledArms}=
  require('./agent10-original-rank9-absol-electrode-development.cjs');
const {VERSION:POLICY_VERSION}=
  require('../twinleaf/agent10-flexible-paid-retreat-frontier.cjs');
const VERSION='agent10-flexible-public-retreat-bilateral-four-deal-native-v1';

function run(){
  const trials=scheduledArms();
  assert.equal(trials.length,4);
  const control=runControl();
  const {assertPinnedNativeStore}=
    require('./agent41-frozen-bilateral-development-v1.cjs');
  assertPinnedNativeStore(path.resolve(__dirname,'../..'),profile);
  const old={};
  for(const [k,v] of Object.entries(profile.injectedResearchEnvironment)){
    old[k]=process.env[k];process.env[k]=v;
  }
  let treatment;
  try{
    treatment=require('./agent41-bilateral-v2-development.cjs')
      .runDevelopment({
        ...treatmentOptions(),
        actorFlexiblePaidRetreatRoot:true,
        registeredFrameName:VERSION
      });
  }finally{
    for(const [k,v] of Object.entries(old)){
      if(v===undefined)delete process.env[k];
      else process.env[k]=v;
    }
  }
  function toRetreats(row){
    return (row?.rootActionLedger??[]).filter(x=>
      x.action==='RetreatAction').map(x=>({
        actionOrdinal:x.actionOrdinal,globalTurn:x.turnBefore,
        playerSlot:x.playerSlot,ownerRootOrdinal:x.actorPolicyDecisionOrdinal
      }));
  }
  const pairs=trials.map((trial,i)=>{
    const b=control.rows?.[i],t=treatment.rows?.[i];
    assert.equal(b?.trial?.id,trial.id);
    assert.equal(t?.trial?.id,trial.id);
    const before=b?.rootActionLedger??[],after=t?.rootActionLedger??[];
    const min=Math.min(before.length,after.length);
    let firstDifference=min;
    for(let n=0;n<min;n++){
      if(JSON.stringify(before[n])!==JSON.stringify(after[n])){
        firstDifference=n;break;
      }
    }
    if(firstDifference===min&&before.length===after.length)
      firstDifference=null;
    return {
      id:trial.id,seed:trial.seed,
      physicalSourceDealIdentical:b.sourceDealFingerprint===
        t.sourceDealFingerprint,
      fullTwoPlayerDealIdentical:b.fullPhysicalDealFingerprint===
        t.fullPhysicalDealFingerprint,
      baselineRootSha256:b.rootActionLedgerSha256,
      treatmentRootSha256:t.rootActionLedgerSha256,
      firstDifferentRootIndex:firstDifference,
      baselineRetreatRoots:toRetreats(b),
      treatmentRetreatRoots:toRetreats(t),
      baselineNative:{finished:b.finished,winner:b.winner,
        actionCount:b.actionCount,endReason:b.endReason},
      treatmentNative:{finished:t.finished,winner:t.winner,
        actionCount:t.actionCount,endReason:t.endReason},
      beforeSourceAttackSettlement:b.sourceAttackSettlement??null,
      afterSourceAttackSettlement:t.sourceAttackSettlement??null,
      beforeCandidateAttackSettlement:b.candidateAttackSettlement??null,
      afterCandidateAttackSettlement:t.candidateAttackSettlement??null,
      treatmentPhysicalIntegrity:t.physicalZoneQualification??null,
      qualifiesForCompetitiveInference:false
    };
  });
  return {
    version:VERSION,policyVersion:POLICY_VERSION,
    head:process.env.GITHUB_SHA??null,
    vendorPin:profile.pinnedVendorRevision,
    symmetricOptIn:true,sourceDeckSixtyUnchanged:true,
    candidateDeckSixtiesUnchanged:true,originalTrialCount:trials.length,
    controlsComplete:control.complete,
    treatmentAttempted:treatment.attempted,
    physicalDealsMatched:pairs.every(x=>
      x.physicalSourceDealIdentical&&x.fullTwoPlayerDealIdentical),
    nativeDispositionCounts:treatment.statuses??null,
    pairs,competitiveQualifiedGames:0,
    caveat:'Retrospectively chosen four source-rank9 deals. Opt-in identical actor-only public selector on both physical seats, native cards/prompts and original 60s fixed. No competent opponent, official clock, comprehensive paper legality or independent field sample.'
  };
}
if(require.main===module){
  const result=run();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(!result.physicalDealsMatched||result.treatmentAttempted!==4||
     !result.controlsComplete)process.exitCode=1;
}
module.exports={VERSION,run};
