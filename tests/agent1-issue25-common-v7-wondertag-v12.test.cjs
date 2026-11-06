'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {
  VERSION,withInnermostOwnerWonderTagV12,nativePrintedSettlement,
  runAgent1InnermostWonderTagV12
}=require('../simulation/evaluation/agent1-issue25-common-v7-wondertag-v12.cjs');
const {PREFIX}=require('../simulation/twinleaf/agent1-wondertag-registered-actor-witness.cjs');
const {registeredTrials}=
  require('../simulation/evaluation/agent36-issue25-common-v6.cjs');

function matchFixture(){
  const events=[];
  const id=registeredTrials()[4].id;
  const original=request=>{
    events.push('native:'+request.label);
    return 'real Store result';
  };
  const headless={runMatch:original};
  const owner=next=>{
    events.push('owner:start');
    const result=next();
    events.push('owner:finish');
    return {result,audit:{realPrizePolicy:true}};
  };
  const wonder=(next,opts)=>{
    events.push('Wonder:start');
    assert.equal(opts.selectSupporterIndex({
      choices:[{name:'A'},{name:'B'}]}),0);
    const result=next();
    events.push('Wonder:finish');
    return {result,audit:{selectedSupporters:1}};
  };
  const shuffle=(next,opts)=>{
    events.push('shuffle:start');
    assert.equal(opts.getCurrentTrialId(),id);
    const result=next();
    events.push('shuffle:finish');
    return {result,audit:{validShuffleCallbacksCompleted:1}};
  };
  return {events,id,original,headless,owner,wonder,shuffle};
}

test('per-game Wonder Tag handler installs strictly after canonical selector',()=>{
  const x=matchFixture();
  const out=withInnermostOwnerWonderTagV12(()=>{
    x.events.push('canonical-root-installed');
    return x.headless.runMatch({label:PREFIX+x.id});
  },x);
  assert.equal(out.result,'real Store result');
  assert.strictEqual(x.headless.runMatch,x.original);
  assert.equal(out.audit.nativeMatches.length,1);
  assert.equal(out.audit.nativeMatches[0].id,x.id);
  assert.equal(out.audit.nativeMatches[0].ownerWonderTag.selectedSupporters,1);
  assert.equal(out.audit.inheritedOwnerPrizeAndPokemon.realPrizePolicy,true);
  assert.deepEqual(x.events,[
    'owner:start','canonical-root-installed','shuffle:start',
    'Wonder:start','native:'+PREFIX+x.id,'Wonder:finish',
    'shuffle:finish','owner:finish'
  ]);
});

test('every native error is retained and original runMatch restored',()=>{
  const x=matchFixture();
  x.headless.runMatch=()=>{
    const e=new Error('physical Store error');
    e.agent8WonderTagAudit={confirmOffers:1,confirmed:0};
    throw e;
  };
  const before=x.headless.runMatch;
  assert.throws(()=>withInnermostOwnerWonderTagV12(()=>
    x.headless.runMatch({label:PREFIX+x.id}),x),/physical Store error/);
  assert.strictEqual(x.headless.runMatch,before);
});

function receipt(override={}){
  const id='11:202:A:champion-reference',seat=0;
  const owner={
    confirmOffers:1,confirmed:1,searchOffers:1,
    selectedSupporters:1,emptySearches:0,
    settledSupporterTransfers:1,nativeAccepted:2,
    nativeRejected:0,nativeUnsettled:0,
    nativeCustodyFailures:0,nativeMissingSearchFollowup:0
  };
  const shuffle={
    nativeTrialAttributionAvailable:true,
    shufflePromptsOffered:1,validShuffleCallbacksCompleted:1,
    shuffleCallbacksFailed:0,invalidNativeShufflePermutations:0,
    missingRegisteredTrialIds:0,ownerReassignedPrompts:0,
    allOfferedShufflesCompleted:true,
    offeredTrialSeats:[{id,seat}],completedTrialSeats:[{id,seat}],
    bySeat:{0:1,1:0}
  };
  return {id,ownerWonderTag:{...owner,...override.ownerWonderTag},
    nativeOwnerShuffle:{...shuffle,...override.nativeOwnerShuffle}};
}

test('only real paid, trial-linked owner Shuffle completion certifies',()=>{
  const x=receipt();
  assert.equal(nativePrintedSettlement(x),true);
  assert.equal(nativePrintedSettlement(receipt({
    ownerWonderTag:{selectedSupporters:0}})),false);
  assert.equal(nativePrintedSettlement(receipt({
    nativeOwnerShuffle:{completedTrialSeats:[{
      id:'11:203:B:champion-reference',seat:0
    }]}})),false);
  assert.equal(nativePrintedSettlement(receipt({
    nativeOwnerShuffle:{allOfferedShufflesCompleted:false}})),false);
  assert.equal(nativePrintedSettlement(receipt({
    ownerWonderTag:{settledSupporterTransfers:0}})),false);
  assert.equal(nativePrintedSettlement(receipt({
    nativeOwnerShuffle:{shuffleCallbacksFailed:1}})),false);
});

test('eight real source slots remain in report without imputing unobserved victories',()=>{
  const reg=registeredTrials();
  const matches=reg.map(x=>({
    id:x.id,status:'returned-unqualified',
    ownerWonderTag:{confirmOffers:0,confirmed:0,selectedSupporters:0,
      settledSupporterTransfers:0,searchOffers:0},
    nativeOwnerShuffle:{shufflePromptsOffered:0,
      validShuffleCallbacksCompleted:0,bySeat:{0:0,1:0}}
  }));
  matches[4]={...matches[4],...receipt({})};
  const layer=()=>({result:null,audit:{nativeMatches:matches}});
  const base=options=>{
    assert.strictEqual(options.baseOwnerPromptLayer,layer);
    return {
      manifest:{nativeRootActionLimit:96,
        resolvedSourceAndPolicyHashes:[]},
      diagnostic:{
        innerNativeOwnerPromptAudit:{
          preexistingPrizeAndPromotion:{nativeMatches:matches}},
        actualNativeAttempts:reg.map(x=>({
          id:x.id,sourceSeat:x.candidateSlot==='A'?1:0,
          status:'returned-unqualified',rootCount:96
        }))
      },rawDevelopment:{rows:[]}
    };
  };
  const r=runAgent1InnermostWonderTagV12({base,ownerLayer:layer});
  assert.equal(r.manifest.version,VERSION);
  assert.equal(r.diagnostic.registeredNativeSettledRowCount,1);
  assert.equal(r.diagnostic.nativePerMatchWonderTag.length,8);
  assert.equal(r.diagnostic.nativePerMatchWonderTag[4].contenderCompletedShuffles,1);
  assert.equal(r.diagnostic.nativePerMatchWonderTag[4].sourceCompletedShuffles,0);
  assert.equal(r.diagnostic.estimatedWinRate,null);
  assert.equal(r.diagnostic.competitiveGamesQualified,0);
});
