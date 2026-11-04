'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {runProtectedOpeningMirroredV7,VERSION}=
  require('../simulation/evaluation/agent1-issue25-protected-opening-v7.cjs');
const {SELECTED_OUTER_TO_INNER}=
  require('../simulation/evaluation/agent36-issue25-selected-v0.cjs');

function stubLayers(order){
  const layers={};
  for(const key of SELECTED_OUTER_TO_INNER.slice(0,-1)){
    layers[key]=next=>{
      order.push(key);
      return {result:next(),audit:{name:key}};
    };
  }
  return layers;
}

test('v7 actually replaces a single owner Basic setup wrapper and leaves same eight rank-seat seeds',()=>{
  const order=[];
  let captured=null;
  const out=runProtectedOpeningMirroredV7({
    layers:stubLayers(order),
    openingLayer:next=>{
      order.push('protected-basic-opening');
      const result=next();
      return {result,audit:{
        initialAccepted:8,physicalActiveConfirmed:8,
        missingPhysicalPlacements:0,allEligibleProtectedSupportsRetained:8
      }};
    },
    attackLayer:next=>({result:next(),audit:{sourceStampedGetLost:{
      actualOwnerSelections:1
    }}}),
    runner:options=>{
      captured=options;
      return {rows:options.registeredTrials.map(trial=>({
        id:trial.id,trial,status:'mock-unqualified',
        sourceSeat:trial.candidateSlot==='A'?1:0,
        rootActionLedger:[]
      })),sourceIndependentCommonPolicyOptIn:true};
    }
  });
  assert.equal(captured.actorOnlyComposition,true);
  assert.equal(captured.nativeRootActionLimit,48);
  assert.equal(captured.sourceIndependentCommonPolicy,true);
  assert.equal(captured.registeredTrials.length,8);
  assert.deepEqual(order,[
    SELECTED_OUTER_TO_INNER[0],
    SELECTED_OUTER_TO_INNER[1],
    'protected-basic-opening',
    ...SELECTED_OUTER_TO_INNER.slice(3,-1)
  ]);
  assert.equal(out.manifest.version,VERSION);
  assert.equal(out.manifest.selectedOpening,'agent50OwnerProtectedMultiBasicStore');
  assert.equal(out.manifest.baselineOpening,'agent50AllEligibleInitialBasics');
  assert.equal(out.manifest.openedEligibleSupportRetainedNativeVerified,true);
  assert.equal(out.manifest.singlePredeclaredChange,
    'owner-only setup Basic and optional compensation Bench policy');
  assert.equal(out.manifest.originalSixtiesAndSeedsUnchanged,true);
  assert.equal(out.manifest.developmentTrialCount,8);
  assert.equal(out.diagnostic.protectedOpeningNativeSelectionCount,8);
  assert.equal(out.diagnostic.protectedOpeningNativeUnverifiedPhysicalPlacements,0);
  assert.equal(out.diagnostic.registeredAttemptReconciliation.exactUniqueMatch,true);
  assert.equal(out.manifest.releaseQualified,false);
  assert.equal(out.diagnostic.competitiveGamesQualified,0);
  assert.ok(out.manifest.resolvedSourceAndPolicyHashes.every(row=>
    /^[0-9a-f]{64}$/.test(row.sha256)));
});

test('native rejected opening cannot be suppressed into a qualified win',()=>{
  const out=runProtectedOpeningMirroredV7({
    layers:stubLayers([]),
    openingLayer:()=>{throw new Error('physical opening invalid')},
    runner:()=>{throw new Error('unreached')}
  });
  assert.equal(out.diagnostic.thrownMessage,'physical opening invalid');
  assert.equal(out.diagnostic.allRegisteredAttemptsReturned,false);
  assert.equal(out.manifest.releaseQualified,false);
  assert.equal(out.diagnostic.competitiveGamesQualified,0);
});
