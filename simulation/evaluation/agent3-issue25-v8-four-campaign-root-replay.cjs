'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');

const VERSION='agent3-issue25-v8-registered-four-campaign-root-replay-v1';
const PLANS=Object.freeze([
  {label:'control-original',mode:'baseline'},
  {label:'control-repeated',mode:'baseline'},
  {label:'protected-opening',mode:'protected'},
  {label:'control-final',mode:'baseline'}
]);
const sha=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

/**
 * Compare actual prechoice private-input HMAC and public Store root ledgers
 * across a *single-process* A/A/B/A registration. Every original attempt
 * survives, including decoder errors and action caps.
 *
 * All four campaigns must be executed under one process-private HMAC key.
 * No concealed card identity or private HMAC is included in the output.
 *
 * @param {{label:string,mode:'baseline'|'protected',
 *   receipt:object,witness:object}[]} campaigns
 * @returns {object} Public failure-inclusive comparison.
 */
function compareFourCampaigns(campaigns){
  assert.ok(Array.isArray(campaigns)&&campaigns.length===4);
  assert.deepEqual(campaigns.map(c=>({label:c.label,mode:c.mode})),PLANS);
  const expected=campaigns[0].receipt.registration.expectedIds;
  assert.ok(Array.isArray(expected)&&expected.length===8);
  assert.equal(new Set(expected).size,8);
  const all=new Set(expected);
  const prepared=campaigns.map(campaign=>{
    const {receipt,witness}=campaign;
    assert.ok(receipt&&witness);
    assert.deepEqual(receipt.registration.expectedIds,expected);
    assert.equal(receipt.registration.exactJoinedByTrialId,true);
    assert.equal(witness.registeredNativeTrialLabelWitnessSelected,true);
    assert.equal(witness.exactNativeStoreRootsRecorded,8);
    assert.equal(witness.firstOwnerSetupInputsObserved,16);
    assert.ok(Array.isArray(witness.events)&&witness.events.length===16);
    assert.match(witness.privateFingerprintSessionId,/^[0-9a-f]{32}$/);
    const owner=new Map(),ordinals=new Map();
    for(const event of witness.events){
      assert.ok(all.has(event.registeredNativeTrialId));
      assert.ok(event.physicalOwnerSeat===0||event.physicalOwnerSeat===1);
      assert.ok(Number.isSafeInteger(event.nativeStoreOrdinal)&&
        event.nativeStoreOrdinal>=1&&event.nativeStoreOrdinal<=8);
      assert.match(event.opaquePhysicalPrechoiceInputHmacSha256,/^[0-9a-f]{64}$/);
      assert.match(event.opaquePreRunRequestHmacSha256,/^[0-9a-f]{64}$/);
      const key=event.registeredNativeTrialId+':'+event.physicalOwnerSeat;
      assert.ok(!owner.has(key),'Duplicate native trial/owner prechoice');
      owner.set(key,event);
      const ordinal=ordinals.get(event.registeredNativeTrialId);
      if(ordinal!==undefined)assert.equal(ordinal,event.nativeStoreOrdinal);
      else ordinals.set(event.registeredNativeTrialId,event.nativeStoreOrdinal);
    }
    assert.equal(owner.size,16);
    assert.equal(ordinals.size,8);
    assert.equal(new Set(ordinals.values()).size,8);
    assert.ok(Array.isArray(receipt.attempts)&&receipt.attempts.length===8);
    const attempts=new Map();
    for(const row of receipt.attempts){
      assert.ok(all.has(row.id)&&!attempts.has(row.id));
      assert.equal(row.actualRawTrialId,row.id);
      assert.ok(typeof row.status==='string');
      const actions=row.publicRootActions;
      // Error receipts with missing action histories stay explicitly unknown.
      const complete=Array.isArray(actions)&&
        row.publicRootActionsTruncated===false&&
        row.publicRootActionCount===actions.length&&
        row.publicRootLedgerSha256Computed===sha(actions)&&
        row.publicRootLedgerDigestConsistent!==false;
      attempts.set(row.id,{
        status:row.status,
        actions:complete?actions:null,
        rootsComplete:complete,
        sha256:complete?row.publicRootLedgerSha256Computed:null,
        rootCount:complete?actions.length:null,
        sourceDealFingerprint:row.sourceDealFingerprint??null,
        actualFirstPlayer:row.actualFirstPlayer??null,
        nativeFailureRecorded:row.status==='engine-error',
        nativeAbortActionOrdinal:row.abortActionOrdinal??null
      });
    }
    assert.equal(attempts.size,8);
    return {
      ...campaign,owner,attempts,
      vendorPin:receipt.provenance?.observedTwinleafCommit??null,
      researchPin:receipt.provenance?.observedRepositoryCommit??null
    };
  });
  const sessions=prepared.map(c=>c.witness.privateFingerprintSessionId);
  const samePrivateSession=sessions.every(session=>session===sessions[0]);
  const sameObservedVendorPin=prepared[0].vendorPin!==null&&
    prepared.every(c=>c.vendorPin===prepared[0].vendorPin);
  const sameObservedResearchPin=prepared[0].researchPin!==null&&
    prepared.every(c=>c.researchPin===prepared[0].researchPin);
  const triplets=[],rows=[];
  let equalPrivateInputs=0,equalRequests=0,unequalPrivateInputs=0,
    unequalRequests=0,missingPublicControlRootRows=0,
    equalControlLedgers=0,unequalControlLedgers=0;
  for(const id of expected){
    const pairs=[0,1].map(seat=>{
      const key=id+':'+seat;
      const four=prepared.map(c=>c.owner.get(key));
      const samePrivate=four.every(e=>
        e.opaquePhysicalPrechoiceInputHmacSha256===
        four[0].opaquePhysicalPrechoiceInputHmacSha256);
      const sameRequest=four.every(e=>
        e.opaquePreRunRequestHmacSha256===
        four[0].opaquePreRunRequestHmacSha256);
      for(let i=1;i<four.length;i++){
        if(four[i].opaquePhysicalPrechoiceInputHmacSha256===
            four[0].opaquePhysicalPrechoiceInputHmacSha256)
          equalPrivateInputs++;else unequalPrivateInputs++;
        if(four[i].opaquePreRunRequestHmacSha256===
            four[0].opaquePreRunRequestHmacSha256)
          equalRequests++;else unequalRequests++;
      }
      return {seat,allFourPhysicalPrechoiceIdentical:samePrivate,
        allFourNativeRequestsIdentical:sameRequest};
    });
    const [a,a2,b,a3]=prepared.map(c=>c.attempts.get(id));
    const controls=[a,a2,a3];
    const rootsPresent=controls.every(c=>c.rootsComplete);
    if(!rootsPresent)missingPublicControlRootRows++;
    const identical=rootsPresent&&
      controls.every(c=>c.status===a.status&&c.sha256===a.sha256&&
        c.rootCount===a.rootCount);
    const unequal=rootsPresent&&!identical;
    if(identical)equalControlLedgers++;
    if(unequal)unequalControlLedgers++;
    const sameControlsSourcePhysical=controls.every(c=>
      c.sourceDealFingerprint!==null&&
      c.sourceDealFingerprint===a.sourceDealFingerprint);
    const changedProtected= a.rootsComplete&&b.rootsComplete&&
      (a.status!==b.status||a.sha256!==b.sha256);
    const changedAt=()=>{
      if(!a.rootsComplete||!b.rootsComplete)return null;
      const length=Math.max(a.actions.length,b.actions.length);
      for(let n=0;n<length;n++){
        if(sha(a.actions[n]??null)!==sha(b.actions[n]??null))
          return {ordinal:n,
            baseline:a.actions[n]?{
              action:a.actions[n].action,playerSlot:a.actions[n].playerSlot,
              turn:a.actions[n].turnBefore}:null,
            protected:b.actions[n]?{
              action:b.actions[n].action,playerSlot:b.actions[n].playerSlot,
              turn:b.actions[n].turnBefore}:null};
      }
      return null;
    };
    rows.push({
      id,sourceRank:Number(id.split(':')[0]),privateOwnerPairs:pairs,
      controlStatuses:controls.map(c=>c.status),
      protectedStatus:b.status,
      controlPublicRootSha256:controls.map(c=>c.sha256),
      protectedPublicRootSha256:b.sha256,
      allThreeControlLedgersComplete:rootsPresent,
      allThreeControlRootLedgersAndDispositionsEqual:identical,
      allThreeControlPhysicalSourceDigestsEqual:sameControlsSourcePhysical,
      protectedVsOriginalRootDifference:
        a.rootsComplete&&b.rootsComplete?changedProtected:'UNRESOLVED',
      firstProtectedRootDifference:changedAt(),
      nativeErrorPresent:[a,a2,b,a3].some(c=>c.nativeFailureRecorded),
      allFourRootLedgersComplete:[a,a2,b,a3].every(c=>c.rootsComplete),
      // The original experiment remains censored and player-uncertified.
      qualifiedCompetitiveGame:false
    });
    triplets.push(pairs);
  }
  const allInputsEqual=samePrivateSession&&
    unequalPrivateInputs===0&&unequalRequests===0&&
    sameObservedVendorPin&&sameObservedResearchPin;
  const controlVerdict=!allInputsEqual?'UNRESOLVED-input-or-epoch-mismatch':
    missingPublicControlRootRows?'UNRESOLVED-missing-public-root-ledger':
    unequalControlLedgers?'FAIL-repeated-control-divergence':
    'PASS-registered-A-A-A-control-replay';
  return {
    schema:VERSION,
    design:PLANS,
    registeredTrials:expected,
    campaignCount:4,totalNativeRegisteredAttempts:32,
    eachCampaignTrialCount:8,
    samePrivateHmacSession:samePrivateSession,
    sameObservedVendorPin,sameObservedResearchPin,
    ownerPairwiseComparisons:48,
    matchingOwnerPrechoiceComparisons:equalPrivateInputs,
    mismatchingOwnerPrechoiceComparisons:unequalPrivateInputs,
    matchingNativeRequestComparisons:equalRequests,
    mismatchingNativeRequestComparisons:unequalRequests,
    controlLedgerRowsEqual:equalControlLedgers,
    controlLedgerRowsUnequal:unequalControlLedgers,
    controlLedgerRowsIncomplete:missingPublicControlRootRows,
    controlReplayVerdict:controlVerdict,
    causalNonTreatmentClosureCertified:false,
    causalTreatmentAttribution:'UNRESOLVED',
    all32OriginalSourceDecksPresent:false,
    nativePaperGamesQualified:0,
    establishedFieldWinRate:null,
    rows
  };
}

/**
 * Run the actual selected native v8 observer and repeated controls in one
 * Node process, so private HMAC comparisons share the same secret.
 * @returns {object}
 */
function runFourNativeCampaigns(){
  const {runPrechoiceCustodyV8}=
    require('./agent1-issue25-prechoice-input-custody-v8.cjs');
  const {buildReceipt}=
    require('./agent1-issue25-v4-public-receipt.cjs');
  const campaigns=PLANS.map(plan=>{
    const execution=runPrechoiceCustodyV8(plan.mode);
    const receipt=buildReceipt(execution,{
      policyEntryPoint:
        'simulation/evaluation/agent1-issue25-prechoice-input-custody-v8.cjs'
    });
    return {...plan,receipt,
      witness:execution.diagnostic.actualNativePrechoicePhysicalInputs};
  });
  return compareFourCampaigns(campaigns);
}

module.exports={VERSION,PLANS,compareFourCampaigns,runFourNativeCampaigns};
