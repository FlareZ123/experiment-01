'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {createHash}=require('node:crypto');
const {PLANS,compareFourCampaigns}=
  require('../simulation/evaluation/agent3-issue25-v8-four-campaign-root-replay.cjs');
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const IDs=Array.from({length:8},(_,i)=>'test-'+i);
function fixture(){
  return PLANS.map(({label,mode},index)=>({
    label,mode,
    witness:{
      registeredNativeTrialLabelWitnessSelected:true,
      exactNativeStoreRootsRecorded:8,
      firstOwnerSetupInputsObserved:16,
      privateFingerprintSessionId:'a'.repeat(32),
      events:IDs.flatMap((id,n)=>[0,1].map(seat=>({
        registeredNativeTrialId:id,physicalOwnerSeat:seat,
        nativeStoreOrdinal:n+1,
        opaquePhysicalPrechoiceInputHmacSha256:hash('cards-'+id+'-'+seat),
        opaquePreRunRequestHmacSha256:hash('request-'+id)
      })))
    },
    receipt:{
      registration:{expectedIds:IDs,exactJoinedByTrialId:true},
      provenance:{observedTwinleafCommit:'a'.repeat(40),
        observedRepositoryCommit:'b'.repeat(40)},
      actuallyExecutingManifest:{
        nightWatchPrivateSeedCommitmentSha256:'c'.repeat(64)
      },
      attempts:IDs.map((id,n)=>{
        const actions=[{action:'PassTurnAction',actionOrdinal:0,
          playerSlot:n%2,turnBefore:3,turnAfter:4}];
        if(index===2&&n===0)actions[0]={
          action:'PlayCardAction',actionOrdinal:0,
          playerSlot:n%2,turnBefore:3,turnAfter:3};
        return {id,actualRawTrialId:id,status:'returned-unqualified',
          publicRootActions:actions,publicRootActionCount:actions.length,
          publicRootActionsTruncated:false,
          publicRootLedgerSha256Computed:hash(actions),
          publicRootLedgerDigestConsistent:true,
          sourceDealFingerprint:hash('deal-'+id),actualFirstPlayer:0};
      })
    }
  }));
}
test('four campaign control and HMAC parity',()=>{
  const panel=compareFourCampaigns(fixture());
  assert.equal(panel.matchingOwnerPrechoiceComparisons,48);
  assert.equal(panel.matchingNativeRequestComparisons,48);
  assert.equal(panel.controlLedgerRowsEqual,8);
  assert.equal(panel.controlSourceDealDigestRowsEqual,8);
  assert.equal(panel.sameNightWatchEntropyCommitment,true);
  assert.equal(panel.controlReplayVerdict,'PASS-registered-bounded-A-A-A-control-replay');
  assert.equal(panel.rows[0].protectedVsOriginalRootDifference,true);
  assert.equal(panel.causalTreatmentAttribution,'UNRESOLVED');
  assert.equal(panel.nativePaperGamesQualified,0);
});
test('control ledger divergence is explicitly a failure',()=>{
  const data=fixture(),r=data[3].receipt.attempts[2];
  r.status='engine-error';
  r.publicRootActions[0].action='AttackAction';
  r.publicRootLedgerSha256Computed=hash(r.publicRootActions);
  const out=compareFourCampaigns(data);
  assert.equal(out.controlLedgerRowsUnequal,1);
  assert.equal(out.controlReplayVerdict,'FAIL-repeated-control-divergence');
});
test('changed prechoice request or different HMAC session blocks causal parity',()=>{
  const data=fixture();
  data[2].witness.events[5].opaquePhysicalPrechoiceInputHmacSha256=hash('other');
  data[2].witness.events[6].opaquePreRunRequestHmacSha256=hash('options');
  assert.equal(compareFourCampaigns(data).controlReplayVerdict,
    'UNRESOLVED-input-or-epoch-mismatch');
  data[2].witness.privateFingerprintSessionId='f'.repeat(32);
  assert.equal(compareFourCampaigns(data).samePrivateHmacSession,false);
});
test('missing action provenance is unresolved and duplicate owner events fail',()=>{
  const data=fixture();
  data[1].receipt.attempts[3].publicRootLedgerSha256Computed=hash('stale');
  assert.equal(compareFourCampaigns(data).controlLedgerRowsIncomplete,1);
  const duplicate=fixture();
  duplicate[2].witness.events[15]={...duplicate[2].witness.events[0]};
  assert.throws(()=>compareFourCampaigns(duplicate));
});
test('trial links survive Store ordinal reordering; missing attempts fail',()=>{
  const data=fixture();
  for(const event of data[3].witness.events)
    event.nativeStoreOrdinal=9-event.nativeStoreOrdinal;
  assert.equal(compareFourCampaigns(data).controlLedgerRowsEqual,8);
  data[1].receipt.attempts.pop();
  assert.throws(()=>compareFourCampaigns(data));
});

test('shared prechoice and requests cannot hide independent Night Watch entropy',()=>{
  const data=fixture();
  data[3].receipt.actuallyExecutingManifest
    .nightWatchPrivateSeedCommitmentSha256='d'.repeat(64);
  const out=compareFourCampaigns(data);
  assert.equal(out.sameNightWatchEntropyCommitment,false);
  assert.equal(out.controlReplayVerdict,
    'UNRESOLVED-input-or-epoch-mismatch');
});

test('silent source-deal movement in repeated baseline is a control failure',()=>{
  const data=fixture();
  data[1].receipt.attempts[4].sourceDealFingerprint=hash('different-source-deal');
  const out=compareFourCampaigns(data);
  assert.equal(out.controlLedgerRowsEqual,8);
  assert.equal(out.controlSourceDealDigestRowsUnequalOrUnavailable,1);
  assert.equal(out.controlReplayVerdict,'FAIL-repeated-control-divergence');
});
