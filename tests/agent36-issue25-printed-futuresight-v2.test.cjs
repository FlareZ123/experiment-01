'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {runFutureSightIssue25V2}=
  require('../simulation/evaluation/agent36-issue25-printed-futuresight-v2.cjs');
const {SELECTED_OUTER_TO_INNER}=
  require('../simulation/evaluation/agent36-issue25-selected-v0.cjs');

test('v2 replaces exactly one printed attack frontier while preserving v0 historical runner',()=>{
  const enters=[],layers={};
  for(const key of SELECTED_OUTER_TO_INNER.slice(0,-1))
    layers[key]=next=>{
      enters.push(key);
      return {result:next(),audit:{version:key}};
    };
  const attackLayer=next=>{
    enters.push('source-locked-frontier');
    return {result:next(),audit:{
      envelopes:[],sourceStampedFutureSight:{ownerPromptSelections:1},
      printedAttackOrigins:{decisionActionsIssuedByObserver:0}
    }};
  };
  let options=null;
  const result=runFutureSightIssue25V2({layers,attackLayer,
    runner:opts=>{
      options=opts;
      return {rows:[]};
    }});
  assert.deepEqual(options,{
    actorOnlyComposition:true,nativeRootActionLimit:48
  });
  assert.deepEqual(enters,[
    ...SELECTED_OUTER_TO_INNER.slice(0,-2),
    'source-locked-frontier'
  ]);
  assert.equal(result.manifest.noNightWatchOrGetLostActionSelected,true);
  assert.equal(result.diagnostic.sourceStampedFutureSight?.ownerPromptSelections,1);
  assert.equal(result.diagnostic.printedAttackOrigins?.decisionActionsIssuedByObserver,0);
  assert.equal(result.manifest.releaseQualified,false);
});
