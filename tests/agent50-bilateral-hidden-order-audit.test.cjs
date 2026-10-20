'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  candidateDevelopmentTarget,comparisonProjection,auditDevelopmentArm,
  nativeTacticSequenceComparison
}=require('../simulation/evaluation/agent50-bilateral-hidden-order-audit.cjs');

const rank6={
  id:'6:0:A:champion-reference',rank:6,candidateSlot:'A',
  candidateId:'champion-reference',seed:407516727
};
const rank11={
  id:'11:2:B:new-moon-lockbreaker-v1',rank:11,candidateSlot:'B',
  candidateId:'new-moon-lockbreaker-v1',seed:623585882
};

function successfulRow(trial) {
  return {
    trial,policyVersion:'frozen-common-v0',
    rootActionLedgerSha256:'a'.repeat(64),
    sourceDealFingerprint:'b'.repeat(64),
    sourceFirstOwnHandSha256:'c'.repeat(64),
    verifiedFirstTurn:true,
    actualStarterSeat:trial.candidateSlot==='A'?0:1,
    sourceActuallyFirst:false,
    actionCount:62,turns:6,finished:false,winner:null,
    endReason:'action-cap',finalPrizes:[6,6],
    attackDeclarations:{source:1,candidate:0},
    settledPublicAttackCount:1
  };
}
function event(override={}) {
  return {
    baselineActionMatchedActual:true,liveStatePreserved:true,
    actionSensitiveToHiddenDeckOrder:false,
    tacticScoreComparison:{equalScoreTraces:true},
    physicalOrder:{type:'PassTurnAction'},
    reversedOrder:{type:'PassTurnAction'},
    originalSourceAction:{type:'PassTurnAction'},
    deckCards:30,
    knownDeckMembershipVerified:false,
    knownDeckTopOrderVerified:false,
    ...override
  };
}
function run(trial,overrides={}) {
  let calls=0;
  const execute=()=>{
    calls++;
    const source=successfulRow(trial);
    if(calls===2) Object.assign(source,overrides.probedRow||{});
    return source;
  };
  const probe=(_Bot,work,_clone,target)=>{
    assert.deepEqual({turn:target.turn,seat:target.seat},
      candidateDevelopmentTarget(trial));
    return {result:work(),events:overrides.events??[event()]};
  };
  const output=auditDevelopmentArm(trial,execute,probe,
    function Stub(){},state=>state,()=>()=>0.5);
  assert.equal(calls,2);
  return output;
}


test('native policy score replay first divergent tactic is preserved in packet',()=>{
  const source={steps:[
    {tactic:'A',rngStart:0,rngEnd:2,rngDraws:2,actionType:'PlayCardAction',threw:false},
    {tactic:'B',rngStart:2,rngEnd:4,rngDraws:2,actionType:null,threw:false}
  ],rngCalls:4};
  const replay={steps:[
    {...source.steps[0]},
    {tactic:'B',rngStart:2,rngEnd:5,rngDraws:3,actionType:null,threw:true}
  ],rngCalls:5};
  const cmp=nativeTacticSequenceComparison(source,replay);
  assert.equal(cmp.sourceCalls,2);
  assert.equal(cmp.replayCalls,2);
  assert.equal(cmp.sameSteps,false);
  assert.equal(cmp.firstDivergence.stepIndex,1);
  assert.equal(cmp.firstDivergence.source.rngDraws,2);
  assert.equal(cmp.firstDivergence.replay.rngDraws,3);
  assert.equal(cmp.firstDivergence.replay.threw,true);
  assert.equal(cmp.sourceRngCalls,4);
  assert.equal(cmp.replayRngCalls,5);
  const archived=run(rank6,{events:[event({
    nativeTacticSource:source,nativeTacticReplay:replay,
    nativeSameWorldTape:{sameWorldDecisionParityQualified:false}
  })]});
  assert.equal(archived.classification,'authentic-tape-same-world-parity-veto');
  assert.equal(archived.diagnostic.nativeTacticComparison.firstDivergence.stepIndex,1);
  assert.deepEqual(archived.diagnostic.nativeTacticSource,source);
  assert.deepEqual(archived.diagnostic.nativeTacticReplay,replay);
  assert.equal(archived.competitiveGameQualified,false);
});

test('matching, truncated, or absent native tactic telemetry is unambiguous',()=>{
  const source={steps:[{tactic:'A',rngStart:0,rngEnd:1,
    rngDraws:1,actionType:'AttackAction',threw:false}],rngCalls:1};
  assert.equal(nativeTacticSequenceComparison(source,structuredClone(source)).sameSteps,true);
  const truncated=nativeTacticSequenceComparison(source,{steps:[],rngCalls:0});
  assert.equal(truncated.sameSteps,false);
  assert.equal(truncated.firstDivergence.stepIndex,0);
  assert.equal(truncated.firstDivergence.replay,null);
  assert.equal(nativeTacticSequenceComparison(source,null),null);
});

test('the two authentic development streams target the next candidate turn',()=>{
  assert.deepEqual(candidateDevelopmentTarget(rank6),{turn:3,seat:0});
  assert.deepEqual(candidateDevelopmentTarget(rank11),{turn:3,seat:1});
  assert.throws(()=>candidateDevelopmentTarget({
    rank:11,candidateSlot:'A'
  }),/Historical fixture/);
  assert.throws(()=>candidateDevelopmentTarget({
    rank:25,candidateSlot:'B'
  }),/hard-rank/);
});

test('stable replay and a matched decision yields an unqualified diagnostic',()=>{
  const row=run(rank6);
  assert.equal(row.samePlayback,true);
  assert.equal(row.noninterferenceVerified,true);
  assert.equal(row.classification,'no-sensitivity-on-tested-root');
  assert.equal(row.comparisonQualified,true);
  assert.equal(row.competitiveGameQualified,false);
  assert.equal(row.diagnostic.knownDeckTopOrderVerified,false);
  assert.equal(row.diagnostic.knownDeckMembershipVerified,false);
});

test('a genuine fresh-world action flip remains a diagnostic only',()=>{
  const row=run(rank11,{events:[event({
    actionSensitiveToHiddenDeckOrder:true,
    reversedOrder:{type:'PlayCardAction'}
  })]});
  assert.equal(row.classification,'hidden-order-action-sensitivity-observed');
  assert.equal(row.comparisonQualified,true);
  assert.equal(row.competitiveGameQualified,false);
  assert.equal(row.noninterferenceVerified,true);
});

test('score-only sensitivity is distinct from action choice',()=>{
  const row=run(rank6,{events:[event({
    tacticScoreComparison:{equalScoreTraces:false}
  })]});
  assert.equal(row.classification,'hidden-order-score-sensitivity-only');
});

test('equal empty generic-score traces remain an untested scoring boundary',()=>{
  const row=run(rank6,{events:[event({
    tacticScoreComparison:{
      equalScoreTraces:true,
      physicalEvaluations:0,counterfactualEvaluations:0,
      physicalScoreSummary:{finiteScores:0},
      counterfactualScoreSummary:{finiteScores:0}
    }
  })]});
  assert.equal(row.noninterferenceVerified,true);
  assert.equal(row.diagnostic.bothWorldsFiniteScoring,false);
  assert.equal(row.classification,
    'no-generic-tactic-evaluations-on-tested-root');
  assert.equal(row.competitiveGameQualified,false);
});

test('paired finite tactic valuations establish scorer exposure only',()=>{
  const row=run(rank11,{events:[event({
    tacticScoreComparison:{
      equalScoreTraces:true,
      physicalEvaluations:2,counterfactualEvaluations:2,
      physicalScoreSummary:{finiteScores:1},
      counterfactualScoreSummary:{finiteScores:1}
    }
  })]});
  assert.equal(row.diagnostic.bothWorldsFiniteScoring,true);
  assert.equal(row.classification,'no-sensitivity-on-tested-root');
  assert.equal(row.competitiveGameQualified,false);
});

test('identical chosen roots still veto divergent public effects and boards',()=>{
  const changedBoard=run(rank6,{probedRow:{
    finalBoard:{seat0:{active:'same action, different damage'}}
  }});
  assert.equal(changedBoard.control.rootActions,
    changedBoard.probed.rootActions);
  assert.equal(changedBoard.samePlayback,false);
  assert.equal(changedBoard.noninterferenceVerified,false);
  assert.equal(changedBoard.classification,
    'probe-changed-or-unverified-live-playback');
  const changedEffect=run(rank11,{probedRow:{
    sourceLinePacket:{publicAttack:{settled:'different'}}
  }});
  assert.equal(changedEffect.samePlayback,false);
  assert.equal(changedEffect.classification,
    'probe-changed-or-unverified-live-playback');
  const changedDelegated=run(rank6,{probedRow:{
    candidatePerfectionPassSamples:[{selected:'different-delegated-attack'}]
  }});
  assert.equal(changedDelegated.samePlayback,false);
  assert.equal(changedDelegated.comparisonQualified,false);
});

test('root action drift vetoes a purported information-set result',()=>{
  const row=run(rank6,{
    probedRow:{rootActionLedgerSha256:'d'.repeat(64)},
    events:[event({actionSensitiveToHiddenDeckOrder:true})]
  });
  assert.equal(row.samePlayback,false);
  assert.equal(row.noninterferenceVerified,false);
  assert.equal(row.comparisonQualified,false);
  assert.equal(row.classification,'probe-changed-or-unverified-live-playback');
});

test('missing original root ledger fails closed even with equal projections',()=>{
  const execute=()=>({...successfulRow(rank6),rootActionLedgerSha256:null});
  const probe=(_Bot,work)=>({result:work(),events:[event()]});
  const row=auditDevelopmentArm(rank6,execute,probe,
    function Stub(){},state=>state,()=>()=>0);
  assert.equal(row.samePlayback,true);
  assert.equal(row.noninterferenceVerified,false);
  assert.equal(row.comparisonQualified,false);
});

test('unobserved, ambiguous and nonmatching-owner probes never qualify',()=>{
  const none=run(rank6,{events:[]});
  assert.equal(none.classification,'no-matching-candidate-root');
  assert.equal(none.comparisonQualified,false);
  const multiple=run(rank11,{events:[event(),event()]});
  assert.equal(multiple.classification,'ambiguous-multiple-root-probes');
  assert.equal(multiple.comparisonQualified,false);
  const wrongOwner=run(rank11,{events:[event({
    baselineActionMatchedActual:false,
    actionSensitiveToHiddenDeckOrder:true
  })]});
  assert.equal(wrongOwner.classification,'fresh-bot-baseline-or-live-state-mismatch');
  assert.equal(wrongOwner.comparisonQualified,false);
});

test('diagnostic errors retain original control and do not certify wins',()=>{
  const row=auditDevelopmentArm(rank6,()=>successfulRow(rank6),
    ()=>{throw new Error('synthetic cloned-world failure');},
    function Stub(){},state=>state,()=>()=>0.1);
  assert.equal(row.classification,'probe-engine-or-audit-error');
  assert.match(row.error,/synthetic cloned-world failure/);
  assert.equal(row.control.rootActions,'a'.repeat(64));
  assert.equal(row.comparisonQualified,false);
  assert.equal(row.competitiveGameQualified,false);
});

test('control exception is retained instead of making a game result',()=>{
  const row=auditDevelopmentArm(rank11,()=>{
    throw new Error('pinned engine unavailable');
  },()=>{throw new Error('must not run');},
  function Stub(){},state=>state,()=>()=>0);
  assert.equal(row.classification,'control-engine-error');
  assert.equal(row.competitiveGameQualified,false);
});

test('comparison projection keeps actual root and end-state fields',()=>{
  const projection=comparisonProjection(successfulRow(rank11));
  assert.equal(projection.rootActions,'a'.repeat(64));
  assert.equal(projection.sourceDeal,'b'.repeat(64));
  assert.deepEqual(projection.finalPrizes,[6,6]);
  assert.equal(projection.error,null);
});

// Test nested runner-hook ownership and postgame-only detached evaluation.
require('./agent50-bilateral-postgame-root-observer.test.cjs');
