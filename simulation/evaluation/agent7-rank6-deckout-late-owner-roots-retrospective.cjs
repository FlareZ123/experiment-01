'use strict';

const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {writeAtomicLocked}=
  require('./agent20-frozen-rank6-canary-v1.cjs');
const {withLateOwnerRootPhysicalAudit,VERSION}=
  require('../twinleaf/agent7-late-owner-root-physical-audit.cjs');

const root=path.resolve(__dirname,'../..');
const REG='results/aichi-2026/registrations/agent7-lillie-pass-rank6-prospective-20261102.json';
const PROFILE=path.join(__dirname,'agent20-frozen-rank6-canary-v1.json');
const OUTPUT=path.join(root,'agent7-rank6-deckout-late-owner-roots-retrospective.json');
const EXACT_LEDGER=Object.freeze({
  '6:71:A:champion-reference':
    '5d6dece97c6f8f90b51c41805741fd4229b035cbbc027b1643e0fad738f47e8f',
  '6:71:A:new-moon-lockbreaker-v1':
    'd0f8f0c4d5df72810739dd32ddfe5b209bdcde87064d0787b7c4f09013db7eb8'
});

/** Retrospective read-only inspection of the previous rank-6 deckout seed. */
function run(){
  const registration=JSON.parse(fs.readFileSync(path.join(root,REG)));
  const frozen=JSON.parse(fs.readFileSync(PROFILE));
  const trials=registration.trials.filter(t=>t.seed===1855410067);
  assert.equal(trials.length,2);
  const observed=withLateOwnerRootPhysicalAudit(()=>runDevelopment({
    ...frozen.policyOptions,registeredTrials:trials,registeredFrameName:REG
  }),trials,{minTurn:16,deckThreshold:8});
  assert.equal(observed.result.rows.length,2);
  const summaries=observed.result.rows.map((r,i)=>{
    const audit=observed.audit.rows[i];
    assert.equal(r.trial.id,audit.trialId);
    assert.equal(r.rootActionLedgerSha256,EXACT_LEDGER[r.trial.id],
      'Read-only audit must preserve entire historical native root ledger');
    const events=audit.lateRootEvents;
    const eventsHoldingLillie=events.filter(e=>e.heldLillieCount>0);
    return {
      trialId:r.trial.id,
      sourceSeat:r.sourceSeat,candidateSeat:r.candidateSeat,
      sourceDealFingerprint:r.sourceDealFingerprint,
      fullPhysicalDealFingerprint:r.fullPhysicalDealFingerprint,
      rootLedgerSha256:r.rootActionLedgerSha256,
      exactOriginalNativeRootsReplayed:true,
      nativeWinner:r.winner,nativeEndReason:r.endReason,
      finalPrizeCounts:r.finalPrizes,
      lateCandidateNativeRootCount:audit.observedOwnerRoots,
      lateCandidatePassRootCount:events.filter(e=>
        e.actionKind==='PassTurnAction').length,
      lateCandidateOwnerRootsWithHeldLillie:eventsHoldingLillie.length,
      lateOwnerLillieContexts:eventsHoldingLillie.map(e=>({
        storeOrdinal:e.storeOrdinal,globalTurn:e.globalTurn,
        actionKind:e.actionKind,ownerDeckCount:e.ownerDeckCount,
        ownerHandCount:e.ownerHandCount,
        supporterTurn:e.supporterTurn,
        heldLillieCount:e.heldLillieCount
      })),
      firstRealDeckZeroDispatch:audit.candidateDeckZeroFirstDispatch,
      lastObservedLateCandidateOwnerRoot:events.at(-1)??null,
      physicalOwnerRootAudit:audit,
      paperEligibleRescueProven:false,
      completeGameQualified:false
    };
  });
  const output={
    schema:VERSION,
    evidenceClass:'already-observed-physical-seed read-only late-root posthoc audit',
    registration:REG,
    frozenProfileSha256:createHash('sha256')
      .update(fs.readFileSync(PROFILE)).digest('hex'),
    pinnedVendor:registration.pinnedTwinleafRevision,
    auditCodeSha256:createHash('sha256').update(fs.readFileSync(
      path.resolve(__dirname,'../twinleaf/agent7-late-owner-root-physical-audit.cjs')
    )).digest('hex'),
    realNativeGameCount:observed.audit.realGameCount,
    originalActionsChanged:false,
    outcomes:summaries,
    competitiveQualifiedGames:0,
    limitations:'Owner-private hands are observed only for the candidate and for genuine owner roots; opportunity is not paper payability. Previous physical seed cannot measure strength or demonstrate a reversal.'
  };
  writeAtomicLocked(OUTPUT,JSON.stringify(output,null,2)+'\n');
  return output;
}

if(require.main===module){
  const x=run();
  console.log(JSON.stringify({
    schema:x.schema,
    exactHistoricalNativeReplays:x.outcomes.length,
    cases:x.outcomes.map(r=>({
      id:r.trialId,roots:r.lateCandidateNativeRootCount,
      latePasses:r.lateCandidatePassRootCount,
      heldLillieRoots:r.lateCandidateOwnerRootsWithHeldLillie,
      firstDeckZero:r.firstRealDeckZeroDispatch,
      lastRoot:r.lastObservedLateCandidateOwnerRoot?.actionKind??null
    })),
    competitiveQualifiedGames:0
  }));
}
module.exports={run};
