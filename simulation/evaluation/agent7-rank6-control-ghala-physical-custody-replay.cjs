'use strict';

const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {writeAtomicLocked}=require('./agent20-frozen-rank6-canary-v1.cjs');
const {withGuzmaHalaOwnerZoneLineage,VERSION}=
  require('../twinleaf/agent7-ghala-owner-zone-lineage.cjs');
const ROOT=path.resolve(__dirname,'../..');
const REG='results/aichi-2026/registrations/agent7-lillie-pass-rank6-prospective-20261102.json';
const OUT=path.join(ROOT,'agent7-rank6-ghala-source-owner-zone-selected-control-audit.json');
const expectedRootSHA={
 '6:70:A:champion-reference':'bd8a3ad02937841fc7a820743708b425184442fb80d23efb7092e8d7ad6f8323e',
 '6:70:A:new-moon-lockbreaker-v1':'b3c4dc704342bf04802986fc56c48114b2b277b119465d00060921584df2c82d6',
};

/** Retrospectively observe enhanced G&H payment in all eight already run control source deals. */
function run(){
  const registration=JSON.parse(fs.readFileSync(path.join(ROOT,REG)));
  const profile=JSON.parse(fs.readFileSync(
    path.join(__dirname,'agent20-frozen-rank6-canary-v1.json')));
  const trials=registration.trials;
  const selected=withGuzmaHalaOwnerZoneLineage(()=>runDevelopment({
    ...profile.policyOptions,registeredTrials:trials,registeredFrameName:REG
  }),{liveOnly:true});
  const rows=selected.result.rows;
  assert.deepEqual(rows.map(r=>r.trial.id),trials.map(t=>t.id));
  assert.equal(rows.length,8);
  const summaries=rows.map((r,i)=>{
    const sourceSeat=r.sourceSeat;
    const actualPaymentEvents=selected.audit.events.filter(e=>e.gameOrdinal===i);
    const sourceRoots=r.rootActionLedger.filter(x=>
      x.playerSlot===sourceSeat && x.action==='PlayCardAction' &&
      String(x.card??'').startsWith('Guzma & Hala'));
    const enhancedSource=actualPaymentEvents.filter(e=>e.ownerSeat===sourceSeat);
    return {
      trialId:r.trial.id,seed:r.trial.seed,candidateSeat:r.candidateSeat,
      sourceSeat,sourcePhysicalDealFingerprint:r.sourceDealFingerprint,
      sourceNativeEndReason:r.endReason,sourceNativeWinner:r.winner,
      nativeDecisionLedgerSha256:r.rootActionLedgerSha256,
      sourceGuzmaHalaRootCount:sourceRoots.length,
      sourceGuzmaHalaRoots:sourceRoots.map(e=>({
        ordinal:e.actionOrdinal,turn:e.turnBefore,card:e.card
      })),
      enhancedPaymentPrompts:enhancedSource.length,
      nativePhysicalTwoCardPayments:enhancedSource.filter(e=>
        e.paperTwoCardZoneWitness).length,
      nativeUnverifiedPaymentPrompts:enhancedSource.filter(e=>
        !e.paperTwoCardZoneWitness).length,
      sourcePaymentEvents:enhancedSource.map(e=>({
        seat:e.ownerSeat,turn:e.globalTurnBefore,
        paymentDispatchOrdinal:e.storeDispatchOrdinal,
        requestedCount:e.requestedCount,
        distinctSelected:e.distinctSelected,
        sourceOwnedPrintings:e.selectedPrintings,
        nativeDispatchCompleted:e.nativeDispatchCompleted,
        physicallyMovedToDiscard:e.actualSelectedCardMovementToDiscard,
        positiveTwoCardZoneWitness:e.paperTwoCardZoneWitness,
        handBefore:e.handCountBefore,handAfter:e.ownerHandCountAfter,
        discardBefore:e.discardCountBefore,discardAfter:e.ownerDiscardCountAfter,
        nativeError:e.nativeError
      }))
    };
  });
  const output={
    schema:VERSION,
    scope:'read-only retrospective original rank6 source-hand payment coverage for eight registered native control games; no game paper certification',
    registration:REG,originalFrozenProfile:profile.schema,
    originalFrozenProfileSha256:createHash('sha256').update(
      fs.readFileSync(path.join(__dirname,'agent20-frozen-rank6-canary-v1.json')))
      .digest('hex'),
    pinnedVendor:registration.pinnedTwinleafRevision,
    observedNativeGames:selected.audit.observedPaymentPrompts,
    observedLiveStores:summaries.length,
    sourceGuzmaHalaRootTotal:summaries.reduce((n,r)=>n+r.sourceGuzmaHalaRootCount,0),
    sourceEnhancedPromptTotal:summaries.reduce((n,r)=>n+r.enhancedPaymentPrompts,0),
    sourceTwoCardPhysicalPaymentWitnesses:summaries.reduce((n,r)=>n+r.nativePhysicalTwoCardPayments,0),
    sourceUnverifiedEnhancedPrompts:summaries.reduce((n,r)=>n+r.nativeUnverifiedPaymentPrompts,0),
    rows:summaries,
    competitiveQualifiedGames:0,
    noObserverFeedsActorDecisions:true,
    note:'No observed enhanced-payment prompt does not establish the printed base-mode search or all card lines were legal. A Prism Star payment replacement can leave hand for Lost Zone, requiring separate custody classification.'
  };
  writeAtomicLocked(OUT,JSON.stringify(output,null,2)+'\n');
  return output;
}
if(require.main===module){
  const x=run();
  console.log(JSON.stringify({
    rootCount:x.sourceGuzmaHalaRootTotal,
    sourceEnhancedPrompts:x.sourceEnhancedPromptTotal,
    physicalTwoCard:x.sourceTwoCardPhysicalPaymentWitnesses,
    unverified:x.sourceUnverifiedEnhancedPrompts,
    rows:x.rows.map(r=>({
      trialId:r.trialId,root:r.sourceGuzmaHalaRootCount,
      enhanced:r.enhancedPaymentPrompts,paid:r.nativePhysicalTwoCardPayments,
      names:r.sourcePaymentEvents.map(e=>e.sourceOwnedPrintings)
    })),
    competitiveQualifiedGames:0
  }));
}
module.exports={run};
