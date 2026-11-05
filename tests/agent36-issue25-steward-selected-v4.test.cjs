'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {SELECTED_OUTER_TO_INNER}=
  require('../simulation/evaluation/agent36-issue25-selected-v0.cjs');
const {VERSION,withStewardOwnerPromptFrontier,
  runStewardSelectedIssue25V4}=
  require('../simulation/evaluation/agent36-issue25-steward-selected-v4.cjs');

/** @returns {Record<string,Function>} */
function noOpOuterLayers(){
  return Object.fromEntries(SELECTED_OUTER_TO_INNER.slice(0,-1)
    .map(name=>[name,next=>({result:next(),audit:{name}})]));
}

test('selected attacks wrap Capture, both audit effects remain separate',()=>{
  const order=[];
  const selected=withStewardOwnerPromptFrontier(
    ()=>{order.push('runner');return 7;},{
      attacks:next=>{
        order.push('attacks-enter');
        const result=next();
        order.push('attacks-exit');
        return {result,audit:{attackOwnerPromptCount:3}};
      },
      capture:next=>{
        order.push('capture-enter');
        const result=next();
        order.push('capture-exit');
        return {result,audit:{acceptedOwnerSearches:1}};
      }
    });
  assert.equal(selected.result,7);
  assert.deepEqual(order,[
    'attacks-enter','capture-enter','runner',
    'capture-exit','attacks-exit'
  ]);
  assert.equal(selected.audit.attackOwnerPromptCount,3);
  assert.equal(selected.audit.sourceIndependentCaptureEnergySearch
    .acceptedOwnerSearches,1);
  assert.equal(selected.audit.competitiveGamesQualified,0);
});

test('executing selected closure fixes both-seat options and retains all eight arms',()=>{
  let actual=null;
  const selected=runStewardSelectedIssue25V4({
    layers:noOpOuterLayers(),
    attackLayer:next=>({result:next(),audit:{
      sourceIndependentCaptureEnergySearch:{acceptedOwnerSearches:0}
    }}),
    runner:options=>{
      actual=options;
      return {
        sourceIndependentCommonPolicyOptIn:
          options.sourceIndependentCommonPolicy,
        bilateralSpecialEnergyRootOptIn:options.bilateralSpecialEnergyRoot,
        nativeAcceptedTargetsOptIn:options.nativeAcceptedTargets,
        rows:options.registeredTrials.map(trial=>({
          trial,sourceSeat:trial.candidateSlot==='A'?1:0,
          candidateSeat:trial.candidateSlot==='A'?0:1,
          status:'development-only',rootActionLedger:[],
          bilateralSpecialEnergyProfile:{mode:options.bilateralSpecialEnergyRoot?'both':'disabled'},
          sourceDealFingerprint:'source-'+trial.id,
          fullPhysicalDealFingerprint:'full-'+trial.id
        }))
      };
    }
  });
  assert.equal(actual.actorOnlyComposition,true);
  assert.equal(actual.sourceIndependentCommonPolicy,true);
  assert.equal(actual.bilateralSpecialEnergyRoot,true);
  assert.equal(actual.nativeAcceptedTargets,true);
  assert.equal(actual.nativeRootActionLimit,48);
  assert.equal(actual.registeredTrials.length,8);
  assert.equal(selected.manifest.version,VERSION);
  assert.equal(selected.manifest.actualCommonRunnerOptIn,true);
  assert.equal(selected.diagnostic.completeRegisteredAttemptReconciliation,true);
  assert.equal(selected.diagnostic.selectedNativeAttempts.length,8);
  assert.deepEqual(selected.diagnostic.observedSourceSeatCrossTab,{
    '6':[0,1],'11':[0,1]
  });
  assert.equal(selected.diagnostic.actualBilateralEnergyOptIn,true);
  assert.equal(selected.diagnostic.actualNativeTargetWitnessOptIn,true);
  assert.equal(selected.manifest.releaseQualified,false);
  assert.equal(selected.diagnostic.competitiveGamesQualified,0);
  assert.ok(selected.manifest.resolvedSourceAndPolicyHashes.every(x=>
    /^[0-9a-f]{64}$/.test(x.sha256)));
});

test('missing native attempt keeps the selected release failed',()=>{
  const selected=runStewardSelectedIssue25V4({
    layers:noOpOuterLayers(),
    attackLayer:next=>({result:next(),audit:{}}),
    runner:options=>({
      sourceIndependentCommonPolicyOptIn:true,
      rows:options.registeredTrials.slice(1).map(trial=>({
        trial,status:'engine-error'
      }))
    })
  });
  assert.equal(selected.diagnostic.selectedNativeAttempts.length,7);
  assert.equal(selected.diagnostic.completeRegisteredAttemptReconciliation,false);
  assert.equal(selected.diagnostic.developmentalQualificationVerdict,
    'FAIL-missing-or-duplicate-registration');
  assert.equal(selected.manifest.releaseQualified,false);
});
