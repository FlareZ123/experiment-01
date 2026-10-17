'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {installOneDecisionCloneFork}=
  require('../simulation/twinleaf/one-decision-clone-fork.cjs');

test('scopes a single bot call and restores original method',()=>{
  class Bot { decodeNextAction(state){ return state.turn; } }
  const old=Bot.prototype.decodeNextAction;
  let installs=0,restores=0;
  const hook=installOneDecisionCloneFork(Bot,2,()=>{
    installs++;return ()=>{restores++;};
  });
  try {
    assert.equal(new Bot().decodeNextAction({turn:1}),1);
    assert.equal(new Bot().decodeNextAction({turn:2}),2);
    assert.equal(new Bot().decodeNextAction({turn:3}),3);
    assert.equal(installs,1);
    assert.equal(restores,1);
    assert.equal(hook.report.calls,3);
  } finally {hook.restore();}
  assert.strictEqual(Bot.prototype.decodeNextAction,old);
});
