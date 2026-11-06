'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {SELECTED_OUTER_TO_INNER}=
  require('../simulation/evaluation/agent36-issue25-selected-v0.cjs');
const {
  VERSION,withOwnerVoltAcrossNativeMatches,runStewardCommonVoltV7
}=require('../simulation/evaluation/agent36-issue25-common-v7.cjs');

/** @returns {Record<string,Function>} */
function inertLayers(){
  return Object.fromEntries(SELECTED_OUTER_TO_INNER.slice(0,-1)
    .map(name=>[name,next=>({result:next(),audit:{name}})]));
}
test('real per-match patch is reversible for both seats and audit counts',()=>{
  const headless={runMatch:request=>request.label};
  const prior=headless.runMatch;
  const applied=withOwnerVoltAcrossNativeMatches(()=>[
    headless.runMatch({label:'seat0'}),
    headless.runMatch({label:'seat1'})
  ],{
    headless,
    voltLayer:next=>({result:next(),audit:{ownerPromptChoices:1}})
  });
  assert.deepEqual(applied.result,['seat0','seat1']);
  assert.strictEqual(headless.runMatch,prior);
  assert.equal(applied.audit.nativeMatchCount,2);
  assert.deepEqual(applied.audit.attempts.map(x=>x.label),
    ['seat0','seat1']);
  assert.equal(applied.audit.attempts
    .reduce((n,x)=>n+x.volt.ownerPromptChoices,0),2);
});
test('native per-match patch restores on decoder errors',()=>{
  const headless={runMatch:()=>{throw Error('native decoder aborted');}};
  const prior=headless.runMatch;
  assert.throws(()=>withOwnerVoltAcrossNativeMatches(()=>
    headless.runMatch({label:'bad'}),
  {headless,voltLayer:next=>next()}),/native decoder aborted/);
  assert.strictEqual(headless.runMatch,prior);
});
test('v7 retains eight exact historical v6 IDs, 96 actions and equal owner layers',()=>{
  const headless={runMatch:request=>request.label};
  let sent=null;
  const selected=runStewardCommonVoltV7({
    env:{},headless,layers:inertLayers(),
    attackLayer:next=>({result:next(),audit:{}}),
    baseOwnerPromptLayer:next=>({result:next(),audit:{nativeMatchCalls:8}}),
    voltLayer:next=>({result:next(),audit:{ownerPromptChoices:1}}),
    runner:options=>{
      sent=options;
      return {
        sourceIndependentCommonPolicyOptIn:true,
        rows:options.registeredTrials.map(trial=>({
          trial,sourceSeat:trial.candidateSlot==='A'?1:0,
          candidateSeat:trial.candidateSlot==='A'?0:1,
          status:'development-only',
          rootActionLedger:[],
          sourceDealFingerprint:'same-native-source-'+trial.id,
          fullPhysicalDealFingerprint:'same-entire-deal-'+trial.id,
          audit:headless.runMatch({label:trial.id})
        }))
      };
    }
  });
  assert.equal(sent.nativeRootActionLimit,96);
  assert.equal(sent.actorOnlyComposition,true);
  assert.equal(sent.sourceIndependentCommonPolicy,true);
  assert.equal(sent.bilateralSpecialEnergyRoot,true);
  assert.equal(sent.registeredTrials.length,8);
  assert.equal(selected.manifest.version,VERSION);
  assert.equal(selected.manifest.releaseQualified,false);
  assert.equal(selected.diagnostic.registeredReconciliation.exactUniqueMatch,true);
  assert.equal(selected.diagnostic.ownerVoltMatchAudit.nativeMatchCount,8);
  assert.equal(selected.diagnostic.ownerVoltSelectedPromptCount,8);
  assert.equal(selected.diagnostic.competitiveGamesQualified,0);
  assert.ok(selected.manifest.resolvedSourceAndPolicyHashes
    .every(x=>/^[0-9a-f]{64}$/.test(x.sha256)));
});
