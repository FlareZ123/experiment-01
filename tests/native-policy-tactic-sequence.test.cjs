'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {observeNativePolicyTacticSequence:observe}=
  require('../simulation/twinleaf/native-policy-tactic-sequence.cjs');
const {recordPolicyRandomTape,replayPolicyRandomTape}=
  require('../simulation/twinleaf/native-policy-random-tape.cjs');

class NamedAction {}
class EarlyTactic {
  useTactic(){Math.random();return undefined;}
}
class LateTactic {
  useTactic(){Math.random();Math.random();return new NamedAction();}
}

test('native tactic observation preserves ordered real RNG tape and class actions',()=>{
  const a=new EarlyTactic(),b=new LateTactic();
  const originalA=a.useTactic,originalB=b.useTactic,rand=Math.random;
  const sink={steps:[],rngCalls:0};
  try{
    Math.random=()=>0.375;
    const recorded=observe({tactics:[a,b]},()=>recordPolicyRandomTape(
      ()=>a.useTactic()??b.useTactic()),sink);
    assert.ok(recorded.result instanceof NamedAction);
    assert.deepEqual(recorded.tape,[0.375,0.375,0.375]);
    assert.equal(sink.rngCalls,3);
    assert.deepEqual(sink.steps.map(s=>({
      tactic:s.tactic,draws:s.rngDraws,actionType:s.actionType
    })),[
      {tactic:'EarlyTactic',draws:1,actionType:null},
      {tactic:'LateTactic',draws:2,actionType:'NamedAction'}
    ]);
    assert.strictEqual(a.useTactic,originalA);
    assert.strictEqual(b.useTactic,originalB);
    assert.equal(Math.random(),0.375);
  }finally{Math.random=rand;}
});

test('swallowed true RNG overread remains a parity veto with traced branch',()=>{
  class CatchTactic {
    useTactic() {
      Math.random();
      try{Math.random();}catch(error){
        assert.match(error.message,/exhausted/);
      }
      return new NamedAction();
    }
  }
  const tactic=new CatchTactic(),original=tactic.useTactic;
  const prior=Math.random,sink={steps:[],rngCalls:0};
  assert.throws(()=>replayPolicyRandomTape([0.25],()=>observe(
    {tactics:[tactic]},()=>tactic.useTactic(),sink)),/exhaustion was swallowed/);
  assert.equal(sink.rngCalls,2);
  assert.deepEqual(sink.steps.map(s=>[s.tactic,s.rngStart,s.rngEnd]),
    [['CatchTactic',0,2]]);
  assert.strictEqual(tactic.useTactic,original);
  assert.strictEqual(Math.random,prior);
});

test('throwing original tactic restores its instance method and global RNG',()=>{
  class ThrowTactic { useTactic(){Math.random();throw Error('native rejection');} }
  const tactic=new ThrowTactic(),original=tactic.useTactic;
  const prior=Math.random,sink={steps:[],rngCalls:0};
  assert.throws(()=>observe({tactics:[tactic]},()=>tactic.useTactic(),sink),
    /native rejection/);
  assert.equal(sink.rngCalls,1);
  assert.equal(sink.steps[0].threw,true);
  assert.equal(sink.steps[0].actionType,null);
  assert.strictEqual(tactic.useTactic,original);
  assert.strictEqual(Math.random,prior);
});
