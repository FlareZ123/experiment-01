'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {SELECTED_OUTER_TO_INNER}=
  require('../simulation/evaluation/agent36-issue25-selected-v0.cjs');
const {
  VERSION,ROOT_LIMIT,ROOT_FLAG,registeredTrials,
  withCommonOwnerThornsRoot,runStewardCommonV6
}=require('../simulation/evaluation/agent36-issue25-common-v6.cjs');

/** @returns {Record<string,Function>} */
function inertLayers(){
  return Object.fromEntries(SELECTED_OUTER_TO_INNER.slice(0,-1)
    .map(name=>[name,next=>({result:next(),audit:{name}})]));
}

test('new original trial registration fixes eight distinct both-seat native arms',()=>{
  const rows=registeredTrials();
  assert.equal(rows.length,8);
  assert.equal(new Set(rows.map(row=>row.id)).size,8);
  assert.equal(new Set(rows.map(row=>row.seed)).size,4);
  assert.deepEqual([...new Set(rows.map(row=>row.rank))],[6,11]);
  assert.equal(ROOT_LIMIT,96);
});

test('scoped same-policy owner-root opt-in restores inherited env on result and error',()=>{
  const env={[ROOT_FLAG]:'false'};
  assert.equal(withCommonOwnerThornsRoot(()=>{
    assert.equal(env[ROOT_FLAG],'true');return 17;
  },{env}),17);
  assert.equal(env[ROOT_FLAG],'false');
  assert.throws(()=>withCommonOwnerThornsRoot(()=>{
    throw Error('source test');
  },{env}),/source test/);
  assert.equal(env[ROOT_FLAG],'false');
  const empty={};
  assert.equal(withCommonOwnerThornsRoot(()=>{
    assert.equal(empty[ROOT_FLAG],'true');return 2;
  },{env:empty}),2);
  assert.equal(Object.hasOwn(empty,ROOT_FLAG),false);
});

test('v6 selected closure is source-independent and actually passes 96 to native boundary',()=>{
  const env={};
  let sent=null,attackInstalled=false,promptInstalled=false;
  const selected=runStewardCommonV6({
    env,layers:inertLayers(),
    attackLayer:next=>{
      attackInstalled=true;
      return {result:next(),audit:{sourceIndependentCaptureEnergySearch:{
        acceptedOwnerSearches:0
      }}};
    },
    innerLayer:next=>{
      promptInstalled=true;
      return {result:next(),audit:{nativeMatchCalls:8}};
    },
    runner:options=>{
      assert.equal(env[ROOT_FLAG],'true');
      sent=options;
      return {
        sourceIndependentCommonPolicyOptIn:options.sourceIndependentCommonPolicy,
        bilateralSpecialEnergyRootOptIn:options.bilateralSpecialEnergyRoot,
        nativeAcceptedTargetsOptIn:options.nativeAcceptedTargets,
        rows:options.registeredTrials.map(trial=>({
          trial,
          sourceSeat:trial.candidateSlot==='A'?1:0,
          candidateSeat:trial.candidateSlot==='A'?0:1,
          status:'native-cap-96',
          rootActionLedger:Array.from({length:96},(_,i)=>({
            actionOrdinal:i+1
          })),
          sourceDealFingerprint:'source'+trial.id,
          fullPhysicalDealFingerprint:'full'+trial.id,
          sourceAttackSettlement:{attacks:[]}
        }))
      };
    }
  });
  assert.equal(sent.actorOnlyComposition,true);
  assert.equal(sent.sourceIndependentCommonPolicy,true);
  assert.equal(sent.bilateralSpecialEnergyRoot,true);
  assert.equal(sent.nativeAcceptedTargets,true);
  assert.equal(sent.nativeRootActionLimit,96);
  assert.equal(sent.registeredTrials.length,8);
  assert.equal(sent.registeredFrameName,
    'agent36-issue25-prospective-common-v6-96root-v1');
  assert.equal(attackInstalled,true);
  assert.equal(promptInstalled,true);
  assert.equal(Object.hasOwn(env,ROOT_FLAG),false);
  assert.equal(selected.manifest.version,VERSION);
  assert.equal(selected.manifest.nativeRootActionLimit,96);
  assert.equal(selected.diagnostic.registeredReconciliation.exactUniqueMatch,true);
  assert.equal(selected.diagnostic.actualNativeAttempts.length,8);
  assert.equal(selected.diagnostic.actualNativeAttempts
    .every(row=>row.rootCount===96&&row.paperQualified===false),true);
  assert.equal(selected.manifest.releaseQualified,false);
  assert.equal(selected.diagnostic.competitiveGamesQualified,0);
  assert.ok(selected.manifest.resolvedSourceAndPolicyHashes
    .every(x=>/^[a-f0-9]{64}$/.test(x.sha256)));
});

test('missing native attempt is retained as a release failure',()=>{
  const selected=runStewardCommonV6({
    env:{},layers:inertLayers(),
    attackLayer:next=>({result:next(),audit:{}}),
    innerLayer:next=>({result:next(),audit:{}}),
    runner:options=>({
      sourceIndependentCommonPolicyOptIn:true,
      rows:options.registeredTrials.slice(1).map(trial=>({
        trial,status:'engine-error'
      }))
    })
  });
  assert.equal(selected.diagnostic.registeredReconciliation.exactUniqueMatch,false);
  assert.equal(selected.diagnostic.actualNativeAttempts.length,7);
  assert.equal(selected.manifest.releaseQualified,false);
});
