'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {
  VERSION,runProtectedWonderTagV10
}=require('../simulation/evaluation/agent1-issue25-protected-wondertag-v10.cjs');

/**
 * Preserve the full sanitized, failure-inclusive eight-pair development audit.
 * @param {object} report
 * @param {string} dir
 */
function archive(report,dir){
  fs.mkdirSync(dir,{recursive:true});
  const name='agent1-issue25-protected-wondertag-v10.json';
  const target=path.resolve(dir,name);
  const lock=target+'.lock',tmp=target+'.'+process.pid+'.tmp';
  const hashTarget=target+'.sha256',hashTmp=hashTarget+'.'+process.pid+'.tmp';
  const fd=fs.openSync(lock,'wx');
  const body=JSON.stringify(report,null,2)+'\n';
  const digest=createHash('sha256').update(body).digest('hex');
  try{
    fs.writeFileSync(tmp,body,{flag:'wx'});
    fs.renameSync(tmp,target);
    fs.writeFileSync(hashTmp,digest+'  '+name+'\n',{flag:'wx'});
    fs.renameSync(hashTmp,hashTarget);
    return {file:target,sha256:digest,bytes:Buffer.byteLength(body)};
  }finally{
    for(const p of [tmp,hashTmp])if(fs.existsSync(p))fs.unlinkSync(p);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}

test('native eight original-source same-protected-opening Wonder Tag source and contender probe, deliberately unqualified',()=>{
  const r=runProtectedWonderTagV10();
  const saved=process.env.ISSUE25_V10_RECEIPT_DIR?
    archive(r,process.env.ISSUE25_V10_RECEIPT_DIR):null;
  const summary={
    schema:r.schema,
    matchingNativeInputPairs:r.matchingGenuineOwnerPrechoiceAndRequestPairs,
    vendor:r.sameVendorPin,research:r.sameRepositoryPin,
    samePhysicalInventories:r.originalStorePrintingsMatchConfigured,
    policyStudyEligible:r.comparisonEligibleForPolicyStudy,
    ownerWonderTag:r.actualOwnerWonderTagAudit,
    registeredOwnerSearches:r.registeredWonderTagActorWitness,
    zeroShuffle:r.actualZeroSearchShuffleAudit,
    nativeShuffle:r.actualNativeShuffleCompletionAudit,
    attempts:r.rows.map(row=>({
      id:row.id,sourceSeat:row.sourceSeat,
      before:row.baselineStatus,after:row.treatmentStatus,
      beforeRoots:row.baselineRoots,afterRoots:row.treatmentRoots,
      sourcePostSetupDealSame:row.samePostSetupSourceDeal
    })),
    qualifiedGames:r.competitiveGamesQualified,
    archive:saved
  };
  console.log('AGENT1_ISSUE25_PROTECTED_WONDERTAG_V10',JSON.stringify(summary));
  assert.equal(r.schema,VERSION);
  assert.equal(r.ids.length,8);
  assert.equal(r.rows.length,8);
  assert.equal(r.matchingGenuineOwnerPrechoiceAndRequestPairs,16);
  assert.equal(r.sameVendorPin,true);
  assert.equal(r.originalStorePrintingsMatchConfigured,true);
  assert.ok(r.actualOwnerWonderTagAudit);
  assert.equal(r.actualOwnerWonderTagAudit.nativeUnsettled,0);
  assert.equal(r.actualOwnerWonderTagAudit.nativeCustodyFailures,0);
  assert.ok(r.registeredWonderTagActorWitness);
  assert.equal(r.registeredWonderTagActorWitness.authenticatedTrialAndActorSeat,true);
  assert.equal(r.registeredWonderTagActorWitness.nativeSettlementOfEveryChoiceAttested,true);
  const roles=r.registeredWonderTagActorWitness.settledRoleCensus;
  assert.ok(roles,'Native selected Supporter settlement requires registered source/contender join');
  assert.equal(roles.originalSourceSupporterTransfers+
    roles.contenderSupporterTransfers,
    r.actualOwnerWonderTagAudit.settledSupporterTransfers);
  assert.equal(roles.originalSourceSearches+roles.contenderSearches,
    r.actualOwnerWonderTagAudit.searchOffers);
  assert.equal(roles.registeredDecisions.length,
    r.actualOwnerWonderTagAudit.searchOffers);
  assert.ok(r.actualNativeShuffleCompletionAudit);
  const n=r.actualNativeShuffleCompletionAudit;
  assert.ok(n.shufflePromptsOffered>=n.shuffleCallbacksCompleted);
  assert.ok(n.outstandingShuffleCallbacks>=0);
  assert.ok(n.validShuffleCallbacksCompleted<=n.shuffleCallbacksCompleted);
  assert.ok(n.invalidNativeShufflePermutations>=0);
  if(r.registeredWonderTagActorWitness.nativeShufflePromptCompletionIndependentlyCertified){
    assert.equal(n.validShuffleCallbacksCompleted,
      r.actualOwnerWonderTagAudit.settledSupporterTransfers);
    assert.equal(n.invalidNativeShufflePermutations,0);
    assert.equal(n.exactNativeShuffleTrialAndActorJoin,true);
  }
  assert.equal(typeof r.registeredWonderTagActorWitness.nativeShufflePromptCompletionIndependentlyCertified,'boolean');
  assert.equal(r.competitiveGamesQualified,0);
  assert.equal(r.winRateClaim,null);
});
