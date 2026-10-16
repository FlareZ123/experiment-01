'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {checkLiveLineage, firstDifference, summarizeCaptureGaps, hash} =
  require('../simulation/twinleaf/rank10-source-branch-transcript.cjs');

function recorded(actions = ['PassTurnAction', 'ResolvePromptAction']) {
  const actionTrace = ['AddPlayerAction', 'AddPlayerAction', ...actions]
    .map((action, step) => ({action, step}));
  const counts = {};
  for (const action of actions) counts[action] = (counts[action] || 0) + 1;
  return {
    report:{
      captureScope:'first-AddPlayerAction-Store-instance',
      actionTrace,dispatched:actionTrace.length,
      ignoredOtherStoreDispatches:9,parametersCaptured:false,
      traceSha256:null,diagnosticTraceSha256:'diagnostic',
      captureErrors:['step 2: unsupported prompt'],
    },
    game:{actions:actions.length,actionCounts:counts}
  };
}

test('independent root action histogram agrees with live Store only', () => {
  const {report,game} = recorded();
  const result = checkLiveLineage(report,game);
  assert.equal(result.liveDispatches,4);
  assert.equal(result.excludedOtherStores,9);
  assert.equal(result.replayEligibleDigest,null);
  assert.deepEqual(result.captureFailures,['step 2: unsupported prompt']);
});

test('rejects speculative Store actions accidentally admitted to live lineage', () => {
  const {report,game} = recorded();
  report.actionTrace.push({step:4,action:'PassTurnAction'});
  report.dispatched = 5;
  assert.throws(() => checkLiveLineage(report,game));
});

test('reports exactly the first full-event divergence', () => {
  assert.equal(firstDifference([{x:1}],[{x:1}]),null);
  assert.deepEqual(firstDifference([{x:1},{x:2}],[{x:1},{x:3}]),{
    index:1,original:{x:2},alternate:{x:3}
  });
  assert.deepEqual(firstDifference([{x:1}],[]),{
    index:0,original:{x:1},alternate:null
  });
});

test('exact source identity hashing is order-sensitive', () => {
  assert.equal(hash(['A','B']),hash(['A','B']));
  assert.notEqual(hash(['A','B']),hash(['B','A']));
});

const {auditAuthenticFork} =
  require('../simulation/twinleaf/source-fork-gate.cjs');
function sourceEvent(step, turn, activePlayer, action) {
  return {step,action,before:{turn,activePlayer},after:{turn}};
}
test('accepts matching pre-fork trace and records actual opposing action', () => {
  const prefix=[sourceEvent(0,0,0,'AddPlayerAction'),
    sourceEvent(1,0,0,'AddPlayerAction'),
    sourceEvent(2,26,0,'PassTurnAction')];
  const control=[...prefix,sourceEvent(3,27,1,'PlayCardAction'),
    sourceEvent(4,27,1,'PassTurnAction'),
    sourceEvent(5,28,0,'AttackAction')];
  const changed=[...prefix,sourceEvent(3,27,1,'AttackAction'),
    sourceEvent(4,27,1,'PassTurnAction'),
    sourceEvent(5,28,0,'PlayCardAction')];
  const proof=auditAuthenticFork(control,changed,{forkTurn:27,opponentSlot:0});
  assert.equal(proof.firstDifferenceTurn,27);
  assert.equal(proof.preForkLiveDispatches,3);
  assert.equal(proof.opponentMaterialResponseObserved,true);
  assert.deepEqual(proof.opponentMaterialActions,
    [{step:5,turn:28,action:'PlayCardAction'}]);
});
test('rejects a divergent source history before declared fork turn', () => {
  const prefix=[sourceEvent(0,0,0,'AddPlayerAction'),
    sourceEvent(1,0,0,'AddPlayerAction'),
    sourceEvent(2,26,0,'PassTurnAction')];
  const changed=[...prefix.slice(0,2),
    sourceEvent(2,26,0,'PlayCardAction'),
    sourceEvent(3,27,1,'AttackAction')];
  assert.throws(()=>auditAuthenticFork([...prefix,
    sourceEvent(3,27,1,'PassTurnAction')],changed,
    {forkTurn:27,opponentSlot:0}),/pre-fork live dispatch history/);
});
test('rejects an inert alternative that changes no real dispatch', () => {
  const trace=[sourceEvent(0,0,0,'AddPlayerAction'),
    sourceEvent(1,0,0,'AddPlayerAction'),
    sourceEvent(2,26,0,'PassTurnAction'),
    sourceEvent(3,27,1,'PassTurnAction')];
  assert.throws(()=>auditAuthenticFork(trace,trace,
    {forkTurn:27,opponentSlot:0}),/no live dispatch difference/);
});
test('does not promote an opposing pass or prompt to substantive response', () => {
  const prefix=[sourceEvent(0,0,0,'AddPlayerAction'),
    sourceEvent(1,0,0,'AddPlayerAction'),
    sourceEvent(2,26,0,'PassTurnAction')];
  const control=[...prefix,sourceEvent(3,27,1,'PassTurnAction')];
  const changed=[...prefix,sourceEvent(3,27,1,'AttackAction'),
    sourceEvent(4,28,0,'ResolvePromptAction'),
    sourceEvent(5,28,0,'PassTurnAction')];
  const proof=auditAuthenticFork(control,changed,
    {forkTurn:27,opponentSlot:0});
  assert.equal(proof.opponentPostForkDispatches,2);
  assert.equal(proof.opponentMaterialResponseObserved,false);
});

test('groups genuine live recorder input gaps by path and cause', () => {
  const failures=[
    'step 0: Nonportable undefined at $.artworksMap',
    'step 1: Nonportable undefined at $.artworksMap',
    'step 2: Nonportable undefined at $.log',
    'step 6: Nested parameter at $.result[0] has non-JSON prototype Fezandipitiex',
    'step 7: Nested parameter at $.result[1] has non-JSON prototype DedenneGX',
    'step 8: Unsupported Set at $.foo'
  ];
  const gaps=summarizeCaptureGaps(failures);
  assert.equal(gaps.reduce((n,x)=>n+x.count,0),6);
  assert.deepEqual(gaps.filter(x=>x.path==='$.artworksMap')
    .map(x=>[x.category,x.count,x.firstSteps]),
    [['undefined-value',2,[0,1]]]);
  assert.deepEqual(gaps.filter(x=>x.path==='$.result[*]')
    .map(x=>[x.category,x.count,x.firstSteps]),
    [['non-json-prototype',2,[6,7]]]);
  assert.ok(gaps.some(x=>x.category==='other' &&
    x.path==='Unsupported Set at $.foo'));
});
test('capture taxonomy does not mistake live Store step count for a game count', () => {
  const failures=Array.from({length:12},(_,i)=>
    'step '+i+': Nonportable undefined at $.log');
  const gaps=summarizeCaptureGaps(failures);
  assert.equal(gaps.length,1);
  assert.equal(gaps[0].count,12);
  assert.deepEqual(gaps[0].firstSteps,[0,1,2,3,4]);
});
