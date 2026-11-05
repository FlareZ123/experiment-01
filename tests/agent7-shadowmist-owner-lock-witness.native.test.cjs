'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const {runStewardSelectedIssue25V4}=
  require('../simulation/evaluation/agent36-issue25-steward-selected-v4.cjs');
const {withShadowMistOwnerPassWitness,summarizeShadowMistPasses}=
  require('../simulation/twinleaf/agent7-shadowmist-owner-lock-witness.cjs');

test('read-only original eight-arm Shadow Mist actual source-owner locked-Pass witness',()=>{
  const observed=withShadowMistOwnerPassWitness(()=>
    runStewardSelectedIssue25V4());
  const raw=observed.result.rawDevelopment?.rows??[];
  const result=summarizeShadowMistPasses(raw,observed.audit);
  const rank6=result.arms.find(arm=>
    arm.id==='6:100:A:champion-reference');
  assert.ok(rank6,'The historical real Shadow Mist-positive arm must be present');
  assert.equal(result.trialCount,8);
  assert.equal(result.physicalStores,8);
  assert.equal(result.competitivelyQualifiedGames,0);
  assert.deepEqual(rank6.shadowMistReplyWindows.map(w=>w.attackTurn),
    [2,4,6,8],
    'Original 48-root selected profile must preserve four real reply windows');
  assert.equal(rank6.shadowMistNextTurnSourcePasses,4);
  assert.equal(rank6.sourcePassOwnerSnapshots,rank6.acceptedSourcePasses);
  assert.ok(rank6.shadowMistReplyWindows.every(w=>
    w.sourcePassLockWitness?.seat===1 &&
    w.sourcePassLockWitness.exactHeldPrintingsArchived===false));
  console.log('AGENT7_SHADOWMIST_OWNER_LOCK_NATIVE',JSON.stringify({
    schema:result.version,
    selectedOriginalPolicy:'agent36-issue25-steward-selected-v4',
    originalRegisteredRoots:48,
    stewardReleaseQualified:observed.result.manifest.releaseQualified,
    sourceSeat1Rank6ShadowMist:rank6,
    gameStoreCount:result.physicalStores,
    allAttemptStatuses:result.arms.map(a=>({
      id:a.id,sourceSeat:a.sourceSeat,status:a.nativeDisposition,
      acceptedSourcePasses:a.acceptedSourcePasses,
      shadowMistNextTurnSourcePasses:a.shadowMistNextTurnSourcePasses
    })),
    competitiveQualifiedGames:result.competitivelyQualifiedGames,
    nativeFlagsDoNotProveOptimalOrPaperPlay:true
  }));
});
