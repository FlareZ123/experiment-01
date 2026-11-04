'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {PUBLIC_PRECOMMITTED_SEED,runNightWatchFutureSightIssue25V3}=
  require('../simulation/evaluation/agent36-issue25-nightwatch-futuresight-v3.cjs');
const {SELECTED_OUTER_TO_INNER}=
  require('../simulation/evaluation/agent36-issue25-selected-v0.cjs');

test('selected v3 preserves original 48-root registration and only adds declared source-locked attack wrapper',()=>{
  const layers={};
  for(const key of SELECTED_OUTER_TO_INNER.slice(0,-1))
    layers[key]=next=>({result:next(),audit:{key}});
  let options;
  const output=runNightWatchFutureSightIssue25V3({
    layers,
    attackLayer:next=>({result:next(),audit:{
      envelopes:[],
      sourceStampedFutureSight:{ownerPromptSelections:1},
      sourceStampedNightWatch:{realStoreSelectedActions:1},
      printedAttackOrigins:{decisionActionsIssuedByObserver:0}
    }}),
    runner:opts=>{
      options=opts;
      return {rows:[]};
    }
  });
  assert.deepEqual(options,{actorOnlyComposition:true,nativeRootActionLimit:48});
  assert.equal(output.manifest.nightWatchOwnerHandlerInstalled,true);
  assert.equal(output.manifest.nightWatchPublicCommittedSeed,
    PUBLIC_PRECOMMITTED_SEED);
  assert.equal(output.manifest.stillUnresolvedGetLostOwnerPrompt,true);
  assert.equal(output.diagnostic.sourceStampedNightWatch?.realStoreSelectedActions,1);
  assert.equal(output.diagnostic.sourceStampedFutureSight?.ownerPromptSelections,1);
  assert.equal(output.manifest.releaseQualified,false);
  assert.equal(output.diagnostic.competitiveGamesQualified,0);
});
