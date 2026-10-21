'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {compareQuickBallPair}=require(
  '../scripts/agent8-canonical-quickball-paircheck.cjs');

function fixture(enabled){
  const root={
    quickBallRootOptIn:enabled,acceptedActorRoots:3,
    typedIntentCounts:enabled?{'play-quick-ball':1}:{},
    nativeRootAcceptances:enabled?[{
      globalTurn:8,seat:0,kind:'play-quick-ball',
      intent:{printing:'Quick Ball FST'},accepted:true,
      nativePhysicalEffect:'confirmed-public-effect'
    }]:[]
  };
  const row=id=>({
    trial:{id,rank:11,candidateId:'champion-reference',seed:123},
    sourceSeat:0,candidateSeat:1,actualStarterSeat:1,
    verifiedFirstTurn:true,sourceActuallyFirst:false,
    sourceDealFingerprint:'same-physical-source',
    sourceFirstOwnHandSha256:'same-source-hand',
    qualifiesForCompetitiveInference:false,
    actorOnlyDecisionCoverage:{detailedComponentAudits:{
      root,handDiscard:{selections:enabled?[{seat:0,turn:8}]:[]},
      ownerSearch:{boundedSelections:enabled?[
        {seat:0,turn:8,source:'own-deck'}]:[]}
    }},
    actionCount:enabled?100:97,finished:false,winner:null,
    endReason:'action-cap',finalPrizes:[6,6],
    rootActionLedgerSha256:enabled?'on':'off',
    candidateFollowupStatus:'none',error:null
  });
  return {
    schema:'canonical',sourceRegistration:'historical',
    enginePin:'a9905a76',candidatePolicy:'common',
    actorOnlyCompositionOptIn:true,
    actorOnlyOwnerSingleSearchOptIn:true,
    actorHandDiscardOptIn:true,actorChoosePokemonOptIn:false,
    actorNativeFallbackAttributionOptIn:true,
    actorOnlyCompositionVersion:'same',
    paperSupporterQuotaOptIn:true,
    mandatoryOptionFallbackBothSeats:true,
    enforceSelectOptionLegalityBothSeats:true,
    nativePressureWindowsOptIn:true,
    attempted:4,competitiveQualifiedGames:0,
    rows:['A','B','C','D'].map(row)
  };
}

test('same native trial, single flag and bounded real chain are reported',()=>{
  const result=compareQuickBallPair(fixture(false),fixture(true));
  assert.equal(result.pairedArms,4);
  assert.equal(result.observedQuickBallRootIntents,4);
  assert.equal(result.observedPhysicalSpends,4);
  assert.equal(result.observedMatchedDiscardSearches,4);
  assert.equal(result.changedRootLedgerArms,4);
  assert.equal(result.competitiveQualifiedGames,0);
  assert.equal(result.rows[0].on.endReason,'action-cap');
});

test('reject unrelated profile, physical seed, hypothetical Store effect',()=>{
  const off=fixture(false),on=fixture(true);
  on.actorHandDiscardOptIn=false;
  assert.throws(()=>compareQuickBallPair(off,on),/Unrelated policy flag drift/);
  on.actorHandDiscardOptIn=true;
  on.rows[2].sourceDealFingerprint='other';
  assert.throws(()=>compareQuickBallPair(off,on),/Original deal or starter drift/);
  on.rows[2].sourceDealFingerprint='same-physical-source';
  on.rows[1].actorOnlyDecisionCoverage.detailedComponentAudits.root
    .nativeRootAcceptances[0].nativePhysicalEffect='unverified';
  assert.throws(()=>compareQuickBallPair(off,on),/physical spend unconfirmed/);
});
