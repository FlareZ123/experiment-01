'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  runStewardInnermostPrizeV5
}=require('../simulation/evaluation/agent36-issue25-steward-innermost-prize-v5.cjs');
const {
  runAgent45Issue25VipV6,VERSION
}=require('../simulation/evaluation/agent45-issue25-native-vip-continuation-v6.cjs');
const {writeReceipt}=
  require('../simulation/evaluation/agent1-issue25-v4-public-receipt.cjs');

test('original eight v5/v6 native same physical deal, unqualified VIP prompt diagnostic',()=>{
  const original=runStewardInnermostPrizeV5();
  const variant=runAgent45Issue25VipV6();
  const before=original.diagnostic.selectedNativeAttempts;
  const after=variant.diagnostic.selectedNativeAttempts;
  const firstById=new Map(before.map(row=>[row.id,row]));
  const joined=after.map(row=>{
    const a=firstById.get(row.id);
    return {
      id:row.id,
      sourceSeat:row.sourceSeat,
      controlStatus:a?.status??null,
      variantStatus:row.status,
      originalNativeRoots:a?.rootCount??null,
      variantNativeRoots:row.rootCount,
      actualSourcePhysicalDealMatched:Boolean(
        a?.sourcePhysicalDealFingerprint&&
        a.sourcePhysicalDealFingerprint===row.sourcePhysicalDealFingerprint
      ),
      actualEntirePhysicalDealMatched:Boolean(
        a?.fullPhysicalDealFingerprint&&
        a.fullPhysicalDealFingerprint===row.fullPhysicalDealFingerprint
      ),
      sourceAttackSettlements:row.sourceAttackCount,
      competitivelyQualifiedGame:false
    };
  });
  const nativeAudits=variant.diagnostic.nativeVipOwnerPromptAttemptAudits;
  const summary=nativeAudits.reduce((out,entry)=>{
    const a=entry?.audit;
    out.actualPrintedVipRoots+=(a?.observedPrintedVipRoots??0);
    out.sourceStampedOwnerPrompts+=(a?.sourceStampedOwnerPrompts??0);
    out.ownerSearchProposals+=(a?.ownerSearchProposals??0);
    out.nativeSettledOwnerPrompts+=(a?.nativeSettledOwnerPrompts??0);
    out.physicalDeckToBenchSettlements+=
      (a?.physicalDeckToBenchSettlements??0);
    out.unsettledNativeReturns+=(a?.unsettledNativeReturns??0);
    out.missingAudit+=Number(!a);
    return out;
  },{
    actualPrintedVipRoots:0,sourceStampedOwnerPrompts:0,
    ownerSearchProposals:0,nativeSettledOwnerPrompts:0,
    physicalDeckToBenchSettlements:0,
    unsettledNativeReturns:0,missingAudit:0
  });
  const artifactDir=process.env.ISSUE25_AGENT45_NATIVE_VIP_V6_DIR;
  const archives=artifactDir?{
    control:writeReceipt(original,artifactDir,{
      prefix:'agent45-issue25-v5-control',
      policyEntryPoint:original.manifest.policyEntryPoint
    }),
    variant:writeReceipt(variant,artifactDir,{
      prefix:'agent45-issue25-v6-native-vip',
      policyEntryPoint:variant.manifest.policyEntryPoint
    })
  }:null;
  const receipt={
    schema:VERSION,
    actualPinnedTwinleafCommit:variant.manifest.observedTwinleafGitCommit,
    actualSourceHashes:variant.manifest.resolvedSourceAndPolicyHashes,
    originalRegisteredTrialIds:variant.diagnostic.registered,
    actualPairingSummary:joined,
    allEightWithinSameCandidateInitialDealsMatched:joined.every(row=>
      row.actualSourcePhysicalDealMatched&&
      row.actualEntirePhysicalDealMatched),
    sourceSpecificNativeVipPromptSummary:summary,
    publicNativeVipAudits:nativeAudits.map(row=>({
      status:row.status,
      observedPrintedVipRoots:row.audit?.observedPrintedVipRoots??null,
      sourceStampedOwnerPrompts:row.audit?.sourceStampedOwnerPrompts??null,
      nativeSettledOwnerPrompts:row.audit?.nativeSettledOwnerPrompts??null,
      physicalDeckToBenchSettlements:
        row.audit?.physicalDeckToBenchSettlements??null,
      boundedPublicEvents:row.audit?.boundedPublicEvents??[]
    })),
    completeRawArchives:archives,
    qualifiedGames:0,
    verdict:'DEVELOPMENT_ONLY-no-competitive-wins-inferred'
  };
  console.log('AGENT45_ISSUE25_NATIVE_VIP_V6',JSON.stringify(receipt));
  assert.equal(before.length,8);
  assert.equal(after.length,8);
  assert.equal(new Set(after.map(row=>row.id)).size,8);
  assert.equal(joined.every(row=>firstById.has(row.id)),true);
  assert.equal(receipt.allEightWithinSameCandidateInitialDealsMatched,true);
  assert.equal(nativeAudits.length,8);
  assert.equal(variant.diagnostic.completeRegisteredAttemptReconciliation,true);
  assert.equal(variant.manifest.releaseQualified,false);
  assert.equal(variant.diagnostic.competitiveGamesQualified,0);
});
