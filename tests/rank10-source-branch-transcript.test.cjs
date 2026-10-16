'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {checkLiveLineage, firstDifference, hash} =
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
