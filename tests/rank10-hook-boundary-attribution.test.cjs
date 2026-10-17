'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {auditRank10HookBoundaries} =
  require('../simulation/twinleaf/rank10-hook-boundary-attribution.cjs');

function fixture() {
  const trace = Array.from({length:350}, (_, step) => ({
    step,action:'PlayCardAction',before:{phase:2},
    continuityDigestBefore:'in-'+step,continuityDigestAfter:'out-'+step
  }));
  const gaps = [
    [88,89,'PassTurnAction','pre-dispatch-pass-clear'],
    [177,178,'ResolvePromptAction','post-dispatch-copy-restore'],
    [205,206,'ResolvePromptAction','post-dispatch-copy-restore'],
    [215,216,'PassTurnAction','pre-dispatch-pass-clear'],
    [221,222,'PassTurnAction','pre-dispatch-pass-clear']
  ];
  const firstChanges = gaps.map(([prior,next,nextAction,kind]) => {
    const prev = trace[prior];
    prev.action = kind === 'post-dispatch-copy-restore'
      ? 'ResolvePromptAction' : 'PlayCardAction';
    trace[next].action = nextAction;
    if (kind === 'post-dispatch-copy-restore') {
      prev.pendingPrompt = {kind:'ChooseAttackPrompt'};
      trace[next].pendingPrompt = {kind:'WaitPrompt'};
      prev.attackChoice = {schema:'choose-attack-reference-v1',
        selection:{attackName:'Kaiser Tackle',printing:'Koraidon ex TEF',attackIndex:1}};
    }
    return {
      afterActionOrdinal:prior,beforeActionOrdinal:next,
      nextAction,
      previousHash:prev.continuityDigestAfter,
      currentHash:trace[next].continuityDigestBefore,
      cardHistoryMismatch:null,
      changedLeafPaths:kind === 'pre-dispatch-pass-clear'
        ? ['$.zones.previousAttack.length','$.zones.previousAttack[0]']
        : ['$.zones.previousAttack[0].attack'],
      firstMismatch:kind === 'pre-dispatch-pass-clear'
        ? {path:'$.zones.previousAttack.length',before:2,after:1}
        : {path:'$.zones.previousAttack[0].attack',before:'Kaiser Tackle',
          after:'Apex Dragon'}
    };
  });
  const archive = {schema:'rank10-source-branch-live-dispatch-v1',
    trial:{seed:4246551499,candidatePhysicalSeat:1},
    sourceReplayMechanicsVerified:false,qualifiedForCompetitiveInference:false,
    control:{fullLiveDispatchTrace:trace}};
  const continuity = {schema:'agent1-rank10-continuity-v1',
    qualifiedForCompetitiveInference:false,
    findings:[{mode:'post-super-reconciled',seed:4246551499,
      liveDispatches:350,stateChangesBetweenActions:5,
      policyMutations:[],firstChanges}]};
  return {archive,continuity};
}

test('five independently matched source action boundaries',()=>{
  const {archive,continuity}=fixture();
  assert.deepEqual(auditRank10HookBoundaries(archive,continuity)
    .map(x=>[x.prior,x.next,x.kind]),[
    [88,89,'pre-dispatch-pass-clear'],
    [177,178,'post-dispatch-copy-restore'],
    [205,206,'post-dispatch-copy-restore'],
    [215,216,'pre-dispatch-pass-clear'],
    [221,222,'pre-dispatch-pass-clear']
  ]);
});

test('state hash disagreement fails closed',()=>{
  const {archive,continuity}=fixture();
  archive.control.fullLiveDispatchTrace[177].continuityDigestAfter='changed';
  assert.throws(()=>auditRank10HookBoundaries(archive,continuity));
});

test('wrong prompt, payload, timing or history restoration fails closed',()=>{
  for(const mutate of [
    x=>{x.archive.control.fullLiveDispatchTrace[177].pendingPrompt.kind='ChooseCardsPrompt';},
    x=>{x.archive.control.fullLiveDispatchTrace[205].attackChoice.selection.attackName='Timeless-GX';},
    x=>{x.continuity.findings[0].firstChanges[1].beforeActionOrdinal=179;},
    x=>{x.continuity.findings[0].firstChanges[1].firstMismatch.after='Copycat';}
  ]) {
    const x=fixture();
    mutate(x);
    assert.throws(()=>auditRank10HookBoundaries(x.archive,x.continuity));
  }
});

test('a second simultaneous hidden-zone change cannot hide behind the expected first mismatch',()=>{
  const fixtureWithLeak=fixture();
  fixtureWithLeak.continuity.findings[0].firstChanges[1].changedLeafPaths.push(
    '$.zones.players[0].deck[3]');
  assert.throws(()=>auditRank10HookBoundaries(
    fixtureWithLeak.archive,fixtureWithLeak.continuity),
    /Additional between-dispatch changes/);
});

test('extra gaps, card changes, policy mutations and improper labels are rejected',()=>{
  for(const mutate of [
    x=>{x.continuity.findings[0].stateChangesBetweenActions=6;},
    x=>{x.continuity.findings[0].firstChanges[0].cardHistoryMismatch={path:'$.cardHistory'};},
    x=>{x.continuity.findings[0].policyMutations.push({turn:27});},
    x=>{x.archive.qualifiedForCompetitiveInference=true;}
  ]) {
    const x=fixture();
    mutate(x);
    assert.throws(()=>auditRank10HookBoundaries(x.archive,x.continuity));
  }
});
