'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {
  gameplayProjection,preexistingActorAudit,
  assertNativeGenericFallbackNoninterference
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
  const originalAudit={
    version:'original-v1',
    genericFallbackAttributionOptIn:false,
    selectedHandlerPriority:['ChooseAttackPrompt','ActorOnlyRoot'],
    componentVersions:{root:'root-v1',fog:'fog-v1'},
    nativeDecisionCounts:{
      lastChanceGenericPromptFallbacks:3,
      actorRootsAccepted:8,
      actorRootsRejected:0
    },
    overlappingDelegationObservations:{lastChanceRoot:3},
    detailedComponentAudits:{
      root:{acceptedActorRoots:8,rootTrace:['action-A']},
      fog:{accepted:0}
    },
    qualification:{competitiveGames:0}
  };
  rows.forEach(r=>r.actorOnlyDecisionCoverage=structuredClone(originalAudit));
  const generic=(row,i)=>({
    ...structuredClone(originalAudit),
    version:'observer-v1',
    genericFallbackAttributionOptIn:true,
    componentVersions:{...originalAudit.componentVersions,
      genericFallback:'native-fallback-v1'},
    nativeDecisionCounts:{
      ...originalAudit.nativeDecisionCounts,
      nativeGenericDecoderCalls:3,
      nativeGenericDecoderBySeat:{
        0:{'owner-prompt':2,'owner-root-or-setup':0,
          'out-of-turn':0,'foreign-prompt':0},
        1:{'owner-prompt':1,'owner-root-or-setup':0,
          'out-of-turn':0,'foreign-prompt':0}
      },
      nativeGenericPromptBySeat:{0:{WaitPrompt:2},1:{ChooseCardsPrompt:1}},
      nativeDistinctOwnerPromptObjects:3,
      nativeDistinctOwnerPromptBySeat:{0:2,1:1},
      nativeDistinctOwnerPromptTypesBySeat:{
        0:{WaitPrompt:2},1:{ChooseCardsPrompt:1}
      }
    },
    detailedComponentAudits:{...structuredClone(originalAudit.detailedComponentAudits),
      genericFallback:{
        gameStoresSeen:1,unknownActorDelegations:0,failedGenericDecodes:0,
        distinctOwnerPromptObjects:3
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
      .nativeGenericPromptBySeat[0].WaitPrompt=3;
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

test('preexisting actor root acceptance, selection and individual prompt audit changes veto',()=>{
  for(const mutate of [
    audit=>{audit.nativeDecisionCounts.actorRootsAccepted++;},
    audit=>{audit.nativeDecisionCounts.actorRootsRejected++;},
    audit=>{audit.detailedComponentAudits.root.rootTrace[0]='other-action';},
    audit=>{audit.selectedHandlerPriority.reverse();}
  ]){
    const {base,withObserver}=buildPair();
    mutate(withObserver.rows[2].actorOnlyDecisionCoverage);
    assert.throws(()=>assertNativeGenericFallbackNoninterference(base,withObserver),
      /existing root\/prompt decision audit/);
  }
});

test('intentional instrument-only keys do not change original decision projection',()=>{
  const {base,withObserver}=buildPair();
  const before=base.rows[0].actorOnlyDecisionCoverage;
  const observed=withObserver.rows[0].actorOnlyDecisionCoverage;
  assert.deepEqual(preexistingActorAudit(observed),preexistingActorAudit(before));
  assert.notDeepEqual(observed,before);
});
