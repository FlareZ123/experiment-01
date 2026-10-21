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


test('per-candidate score trace preserves finite scoring and exact RNG without identity leakage',()=>{
  class ScoredAction {constructor(handIndex){this.handIndex=handIndex;}}
  class ScoredTactic {
    evaluateAction(_state,_id,action){
      Math.random();
      return action.handIndex+10;
    }
    useTactic(){
      const action=new ScoredAction(4);
      this.evaluateAction({},101,action);
      return action;
    }
  }
  const tactic=new ScoredTactic(),evalMethod=tactic.evaluateAction;
  const useMethod=tactic.useTactic,prior=Math.random;
  const actual={steps:[],rngCalls:0};
  const replayObservation={steps:[],rngCalls:0};
  try{
    Math.random=()=>0.375;
    const recorded=observe({tactics:[tactic]},
      ()=>recordPolicyRandomTape(()=>tactic.useTactic()),actual);
    assert.deepEqual(recorded.tape,[0.375]);
    assert.deepEqual(actual.evaluations,[{
      tactic:'ScoredTactic',actionType:'ScoredAction',handIndex:4,
      rngStart:0,rngEnd:1,rngDraws:1,
      finiteScore:true,score:14,undefinedScore:false,threw:false
    }]);
    const copy=new ScoredTactic();
    const replay=replayPolicyRandomTape(recorded.tape,()=>observe(
      {tactics:[copy]},()=>copy.useTactic(),replayObservation));
    assert.equal(replay.consumed,1);
    assert.deepEqual(replayObservation.evaluations,actual.evaluations);
    assert.strictEqual(tactic.evaluateAction,evalMethod);
    assert.strictEqual(tactic.useTactic,useMethod);
    assert.equal(Math.random(),0.375);
  }finally{Math.random=prior;}
});

test('swallowed RNG overread is localized to the exact score candidate',()=>{
  class Candidate {
    constructor(){this.handIndex=2;}
  }
  class OverreadTactic {
    evaluateAction(){
      Math.random();
      try{Math.random();}catch(error){
        assert.match(error.message,/exhausted/);
      }
      return undefined;
    }
    useTactic(){
      this.evaluateAction({},101,new Candidate());
      return undefined;
    }
  }
  const tactic=new OverreadTactic(),prior=Math.random;
  const original=tactic.evaluateAction,observation={steps:[],rngCalls:0};
  assert.throws(()=>replayPolicyRandomTape([0.2],()=>observe(
    {tactics:[tactic]},()=>tactic.useTactic(),observation)),
  /exhaustion was swallowed/);
  assert.deepEqual(observation.evaluations,[{
    tactic:'OverreadTactic',actionType:'Candidate',handIndex:2,
    rngStart:0,rngEnd:2,rngDraws:2,
    finiteScore:false,score:null,undefinedScore:true,threw:false
  }]);
  assert.strictEqual(tactic.evaluateAction,original);
  assert.strictEqual(Math.random,prior);
});

test('read-only speculative RNG site trace preserves genuine tape and restores Math.random',()=>{
  class CardAction{constructor(){this.handIndex=0;}}
  class CandidateTactic{
    evaluateAction(){
      Math.random();
      Math.random();
      return 8;
    }
    useTactic(){return this.evaluateAction({},101,new CardAction());}
  }
  const tactic=new CandidateTactic(),original=tactic.evaluateAction,
    previous=Math.random,sink={steps:[],rngCalls:0,traceEngineRandomSites:true};
  try{
    Math.random=()=>0.2;
    const recorded=observe({tactics:[tactic]},()=>recordPolicyRandomTape(
      ()=>tactic.useTactic()),sink);
    assert.deepEqual(recorded.tape,[0.2,0.2]);
    assert.equal(sink.rngCalls,2);
    assert.equal(sink.evaluations.length,1);
    assert.deepEqual(sink.evaluations[0].rngSites,['unlocated','unlocated']);
    assert.equal(sink.evaluations[0].finiteScore,true);
    assert.strictEqual(tactic.evaluateAction,original);
    assert.equal(Math.random(),0.2);
  }finally{Math.random=previous;}
});
