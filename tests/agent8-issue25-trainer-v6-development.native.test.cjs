'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {runStewardInnermostPrizeV5}=
  require('../simulation/evaluation/agent36-issue25-steward-innermost-prize-v5.cjs');
const {runIssue25NativeTrainerV6}=
  require('../simulation/evaluation/agent8-issue25-trainer-v6-development.cjs');
const {writeReceipt}=
  require('../simulation/evaluation/agent1-issue25-v4-public-receipt.cjs');

/**
 * Count only actual post-Store accepted public plays by the registered source
 * seat; never equate the action class with a paper-legal Trainer resolution.
 * @param {object} result Complete native treatment or control result.
 * @returns {Map<string,object[]>} Source-owned accepted root play envelopes.
 */
function sourceRootPlays(result){
  const sourceSeats=new Map(result.diagnostic.selectedNativeAttempts
    .map(row=>[row.id,row.sourceSeat]));
  const out=new Map();
  for(const row of result.rawDevelopment?.rows??[]){
    const id=row.trial?.id??row.id;
    assert.ok(sourceSeats.has(id));
    const seat=sourceSeats.get(id);
    const roots=row.rootActionLedger??
      row.nativeAbortEvidence?.rootActionLedger??[];
    out.set(id,roots.filter(root=>
      root.playerSlot===seat&&root.action==='PlayCardAction')
      .map(root=>({ordinal:root.actionOrdinal??null,
        turn:root.turnBefore??null,card:root.card??null,
        hasPromptAfter:root.pendingPrompt!==null&&
          root.pendingPrompt!==undefined})));
  }
  return out;
}

test('v6 native one-factor original-eight same-opening Trainer fallback',()=>{
  const control=runStewardInnermostPrizeV5();
  const treatment=runIssue25NativeTrainerV6();
  const initial=control.diagnostic.selectedNativeAttempts;
  const updated=treatment.diagnostic.selectedNativeAttempts;
  const sourceBefore=sourceRootPlays(control);
  const sourceAfter=sourceRootPlays(treatment);
  const prior=new Map(initial.map(row=>[row.id,row]));
  const pairs=updated.map(row=>{
    const same=prior.get(row.id);
    assert.ok(same,`Missing control registration ${row.id}`);
    return {
      id:row.id,
      sourceSeat:row.sourceSeat,
      controlStatus:same.status,treatmentStatus:row.status,
      controlRoots:same.rootCount,treatmentRoots:row.rootCount,
      initialSourcePhysicalDealMatched:!!same.sourcePhysicalDealFingerprint&&
        same.sourcePhysicalDealFingerprint===row.sourcePhysicalDealFingerprint,
      entireInitialPhysicalDealMatched:!!same.fullPhysicalDealFingerprint&&
        same.fullPhysicalDealFingerprint===row.fullPhysicalDealFingerprint,
      controlSourcePlayCardRoots:sourceBefore.get(row.id)??[],
      treatmentSourcePlayCardRoots:sourceAfter.get(row.id)??[],
      treatmentSourceSettledAttacks:row.sourceAttackCount??null,
      outcomeNotQualified:true
    };
  });
  const archiveDir=process.env.AGENT8_ISSUE25_TRAINER_V6_DIR;
  const artifacts=archiveDir?{
    control:writeReceipt(control,archiveDir,{
      prefix:'issue25-trainer-v6-control-v5',
      policyEntryPoint:control.manifest.policyEntryPoint}),
    treatment:writeReceipt(treatment,archiveDir,{
      prefix:'issue25-trainer-v6-treatment',
      policyEntryPoint:treatment.manifest.policyEntryPoint})
  }:null;
  const receipt={
    schema:'agent8-issue25-original-eight-generic-native-trainer-v6-native-v1',
    pinnedTwinleafGitCommit:treatment.manifest.observedTwinleafGitCommit,
    controlVersion:control.manifest.version,
    treatmentVersion:treatment.manifest.version,
    treatmentOnlyChangedRunnerOption:'nativeOwnerTrainerFallback:true',
    registeredIDs:initial.map(row=>row.id),
    pairs,
    sourceBeforePlayCardRoots:pairs.reduce((sum,row)=>
      sum+row.controlSourcePlayCardRoots.length,0),
    sourceAfterPlayCardRoots:pairs.reduce((sum,row)=>
      sum+row.treatmentSourcePlayCardRoots.length,0),
    allEightOriginalPhysicalDealsMatch:pairs.every(row=>
      row.initialSourcePhysicalDealMatched),
    allEightFullPhysicalDealsMatch:pairs.every(row=>
      row.entireInitialPhysicalDealMatched),
    rawArchiveReceipts:artifacts,
    nativeBotMayUseHiddenInformation:true,
    printedCostAndTargetPaymentVerified:false,
    sourceAttackReplyQualified:false,
    qualifiedCompetitiveGames:0,
    status:'development-only-with-all-native-errors-and-caps-retained'
  };
  console.log('AGENT8_ISSUE25_TRAINER_V6',JSON.stringify(receipt));
  assert.equal(initial.length,8);
  assert.equal(updated.length,8);
  assert.equal(new Set(updated.map(row=>row.id)).size,8);
  assert.equal(receipt.allEightOriginalPhysicalDealsMatch,true);
  assert.equal(receipt.allEightFullPhysicalDealsMatch,true);
  assert.equal(treatment.diagnostic.completeRegisteredAttemptReconciliation,true);
  assert.equal(treatment.manifest.releaseQualified,false);
  assert.equal(treatment.diagnostic.competitiveGamesQualified,0);
});
