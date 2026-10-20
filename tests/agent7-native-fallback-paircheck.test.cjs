'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {
  gameplayProjection,assertNativeGenericFallbackNoninterference
}=require('../scripts/agent7-native-fallback-paircheck.cjs');

function buildPair(){
  const rows=[0,1,2,3].map(i=>({
    trial:{id:'trial-'+i},
    status:'native-complete',
    sourceDealFingerprint:'same-source-deal-'+Math.floor(i/2),
    sourceSeat:i%2,candidateSeat:1-(i%2),
    sourceAudit:{completed:i%2===0},
    finalPrizes:[6-i,4],winner:i%2,finished:i!==2,
    actionCount:18+i,rootActionLedgerSha256:'root-'+i,
    qualifiesForCompetitiveInference:false,
    actorOnlyPolicyVersion:'original-v1',
    actorOnlyDecisionCoverage:{},
  }));
  const generic=(row,i)=>({
    genericFallbackAttributionOptIn:true,
    nativeDecisionCounts:{
      nativeGenericDecoderCalls:3,lastChanceGenericPromptFallbacks:3,
      actorRootsAccepted:8,actorRootsRejected:0,
      nativeGenericDecoderBySeat:{
        0:{'owner-prompt':2,'owner-root-or-setup':0,
          'out-of-turn':0,'foreign-prompt':0},
        1:{'owner-prompt':1,'owner-root-or-setup':0,
          'out-of-turn':0,'foreign-prompt':0}
      },
      nativeGenericPromptBySeat:{0:{WaitPrompt:2},1:{ChooseCardsPrompt:1}}
    },
    detailedComponentAudits:{genericFallback:{
      gameStoresSeen:1,unknownActorDelegations:0,failedGenericDecodes:0
    }}
  });
  const base={attempted:4,actorOnlyCompositionOptIn:true,
    actorNativeFallbackAttributionOptIn:false,
    actorOnlyCompositionVersion:'original-v1',competitiveQualifiedGames:0,
    sourcePairs:[{sameSourcePhysicalDeal:true}],rows};
  const withObserver=structuredClone(base);
  withObserver.actorNativeFallbackAttributionOptIn=true;
  withObserver.actorOnlyCompositionVersion='observer-v1';
  withObserver.rows.forEach((r,i)=>{
    r.actorOnlyPolicyVersion='observer-v1';
    r.actorOnlyDecisionCoverage=generic(r,i);
  });
  return {base,withObserver};
}

test('identical source-dealt four arms pass while opt-in audit differs',()=>{
  const {base,withObserver}=buildPair();
  const result=assertNativeGenericFallbackNoninterference(base,withObserver);
  assert.equal(result.gameplayIdentical,true);
  assert.equal(result.pairedArms,4);
  assert.equal(result.nativeGenericFallbacks,12);
  assert.equal(result.nativeGenericFallbacksBySeat[0],8);
  assert.equal(result.nativeGenericFallbacksBySeat[1],4);
  assert.equal(result.actorRootsAccepted,32);
  assert.deepEqual(gameplayProjection(base),gameplayProjection(withObserver));
});

test('gameplay variation in hidden winner, action ledger or source deal vetoes',()=>{
  for(const field of ['winner','rootActionLedgerSha256','sourceDealFingerprint']){
    const {base,withObserver}=buildPair();
    withObserver.rows[2][field]='changed';
    assert.throws(()=>assertNativeGenericFallbackNoninterference(base,withObserver),
      /Read-only fallback observer changed/);
  }
});

test('missing one arm and missing one seat fail closed',()=>{
  {
    const {base,withObserver}=buildPair();
    withObserver.rows.pop();
    assert.throws(()=>assertNativeGenericFallbackNoninterference(base,withObserver));
  }
  {
    const {base,withObserver}=buildPair();
    delete withObserver.rows[1].actorOnlyDecisionCoverage.nativeDecisionCounts
      .nativeGenericDecoderBySeat[1];
    assert.throws(()=>assertNativeGenericFallbackNoninterference(base,withObserver));
  }
});

test('misattributed prompt class and deepest-native fallback discrepancy veto',()=>{
  {
    const {base,withObserver}=buildPair();
    withObserver.rows[0].actorOnlyDecisionCoverage.nativeDecisionCounts
      .nativeGenericPromptBySeat[0].WaitPrompt=1;
    assert.throws(()=>assertNativeGenericFallbackNoninterference(base,withObserver),
      /Owner prompt classes/);
  }
  {
    const {base,withObserver}=buildPair();
    withObserver.rows[0].actorOnlyDecisionCoverage.nativeDecisionCounts
      .nativeGenericDecoderCalls=4;
    assert.throws(()=>assertNativeGenericFallbackNoninterference(base,withObserver),
      /deepest original fallback/);
  }
});
