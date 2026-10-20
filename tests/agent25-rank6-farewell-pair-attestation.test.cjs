'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {attestFarewellPair}=require(
  '../simulation/evaluation/agent25-rank6-farewell-pair-attestation.cjs');

const root=(actionOrdinal,playerSlot,turnBefore,action,extra={})=>({
  actionOrdinal,playerSlot,turnBefore,turnAfter:turnBefore,action,
  pendingPrompt:null,initiatingRootActionOrdinal:null,...extra
});

function fixture() {
  const baseline={
    seed:407516727,deckHashes:['source60','candidate60'],
    verifiedByDrawLog:true,firstTurnSlot:0,
    rootActionLedger:[
      root(0,1,2,'PlayCardAction',{card:'Guzma & Hala'}),
      root(1,0,3,'PassTurnAction'),
      root(2,1,4,'PassTurnAction')
    ],abilityTrace:[]
  };
  const altered={
    ...baseline,rootActionLedger:[
      baseline.rootActionLedger[0],
      root(1,0,3,'UseAbilityAction',{ability:'Farewell Letter'}),
      root(2,0,3,'ResolvePromptAction',{
        pendingPrompt:'WaitPrompt',initiatingRootActionOrdinal:1
      }),
      root(3,0,3,'PlayCardAction',{card:'Fog Crystal'}),
      root(4,1,4,'PassTurnAction')
    ],abilityTrace:[{seat:0,turn:3,name:'Farewell Letter'}]
  };
  const options={
    seat:0,turn:3,archivedRootSha256:createHash('sha256')
      .update(JSON.stringify(baseline.rootActionLedger)).digest('hex')
  };
  return {baseline,altered,options};
}

test('a real identical prefix, original Pass and settled prompt witness qualifies the narrow root',()=>{
  const {baseline,altered,options}=fixture();
  const result=attestFarewellPair(baseline,altered,options);
  assert.equal(result.classification,
    'single-native-replacement-with-real-source-continuation');
  assert.equal(result.genuineSingleRootReplacement,true);
  assert.equal(result.nextSourceAction?.turn,4);
  assert.equal(result.postPromptZoneChangeDirectlyMeasured,false);
  assert.equal(result.competitivelyQualifiedGames,0);
});

test('falsifies a different physical game before action comparison',()=>{
  const {baseline,altered,options}=fixture();
  altered.seed++;
  const result=attestFarewellPair(baseline,altered,options);
  assert.equal(result.sourceComparable,false);
  assert.equal(result.genuineSingleRootReplacement,false);
});

test('detects an archived replay that drifted before intervention',()=>{
  const {baseline,altered,options}=fixture();
  options.archivedRootSha256='0'.repeat(64);
  const result=attestFarewellPair(baseline,altered,options);
  assert.equal(result.classification,'archived-baseline-policy-drift');
  assert.equal(result.genuineSingleRootReplacement,false);
});

test('detects earlier actual root divergence despite the same source deck',()=>{
  const {baseline,altered,options}=fixture();
  altered.rootActionLedger[0]={...altered.rootActionLedger[0],card:'Other'};
  const result=attestFarewellPair(baseline,altered,options);
  assert.equal(result.classification,'pre-intervention-action-drift');
});

test('rejects an unmatched baseline action as evidence of Farewell-over-Pass',()=>{
  const {baseline,altered,options}=fixture();
  baseline.rootActionLedger[1]={...baseline.rootActionLedger[1],action:'PlayCardAction'};
  options.archivedRootSha256=createHash('sha256')
    .update(JSON.stringify(baseline.rootActionLedger)).digest('hex');
  const result=attestFarewellPair(baseline,altered,options);
  assert.equal(result.classification,'original-choice-not-pass');
});

test('a declared Ability without its native WaitPrompt resolution remains unproved',()=>{
  const {baseline,altered,options}=fixture();
  altered.rootActionLedger[2].pendingPrompt='ChooseCardsPrompt';
  const result=attestFarewellPair(baseline,altered,options);
  assert.equal(result.classification,'farewell-prompt-unsettled');
  assert.equal(result.genuineSingleRootReplacement,false);
});

test('absence of a next source turn is retained as a separate negative',()=>{
  const {baseline,altered,options}=fixture();
  altered.rootActionLedger.splice(4);
  const result=attestFarewellPair(baseline,altered,options);
  assert.equal(result.classification,
    'single-native-replacement-no-source-continuation');
  assert.equal(result.genuineSingleRootReplacement,true);
  assert.equal(result.sourceContinued,false);
});

test('missing baseline root capture cannot become a positive witness',()=>{
  const {baseline,altered,options}=fixture();
  delete baseline.rootActionLedger;
  const result=attestFarewellPair(baseline,altered,options);
  assert.equal(result.classification,'source-deal-or-start-mismatch');
  assert.equal(result.genuineSingleRootReplacement,false);
});

test('missing deck identities cannot compare by two absent fields',()=>{
  const {baseline,altered,options}=fixture();
  delete baseline.deckHashes;
  delete altered.deckHashes;
  const result=attestFarewellPair(baseline,altered,options);
  assert.equal(result.classification,'source-deal-or-start-mismatch');
  assert.equal(result.genuineSingleRootReplacement,false);
});
