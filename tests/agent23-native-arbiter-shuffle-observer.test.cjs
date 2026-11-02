'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {observeNativeArbiterShuffles:observe}=
  require('../simulation/twinleaf/agent23-native-arbiter-shuffle-observer.cjs');
const {recordPolicyRandomTape,replayPolicyRandomTape}=
  require('../simulation/twinleaf/native-policy-random-tape.cjs');

class MockNativeArbiter {
  constructor(){this.options={shuffleMode:2};}
  shuffle(deck){
    return deck.cards.map((_,i)=>[i,Math.random()]);
  }
}

test('read-only shuffle observer records numeric lengths and preserves exact RNG tape',()=>{
  const arbiter=new MockNativeArbiter();
  const before=Object.getOwnPropertyDescriptor(MockNativeArbiter.prototype,'shuffle');
  const sink={};
  const previous=Math.random;
  try{
    Math.random=()=>0.125;
    const done=observe(()=>recordPolicyRandomTape(
      ()=>arbiter.shuffle({cards:[{},{}]})),sink,
    {BotArbiter:MockNativeArbiter});
    assert.deepEqual(done.tape,[0.125,0.125]);
    assert.deepEqual(done.result,[[0,0.125],[1,0.125]]);
    assert.equal(sink.arbiterShuffles.length,1);
    assert.equal(sink.arbiterShuffles[0].deckLength,2);
    assert.equal(sink.arbiterShuffles[0].mode,2);
    assert.match(sink.arbiterShuffles[0].implementationSha256,/^[0-9a-f]{64}$/);
    assert.equal(sink.arbiterShuffles[0].randomFunctionName,
      'nativePolicyTapeSampler');
    assert.deepEqual(Object.getOwnPropertyDescriptor(
      MockNativeArbiter.prototype,'shuffle'),before);
    const cloneSink={};
    const replay=replayPolicyRandomTape(done.tape,()=>observe(
      ()=>arbiter.shuffle({cards:[{},{}]}),cloneSink,
      {BotArbiter:MockNativeArbiter}));
    assert.equal(replay.consumed,2);
    assert.deepEqual(cloneSink.arbiterShuffles,sink.arbiterShuffles);
  }finally{Math.random=previous;}
});

test('one extra simulated deck card visibly precedes exact RNG overread veto',()=>{
  const arbiter=new MockNativeArbiter(),original=Math.random;
  let tape;
  try{
    Math.random=()=>0.375;
    tape=recordPolicyRandomTape(()=>arbiter.shuffle({cards:[{},{}]})).tape;
  }finally{Math.random=original;}
  const sink={};
  assert.throws(()=>replayPolicyRandomTape(tape,()=>observe(
    ()=>arbiter.shuffle({cards:[{},{},{}]}),sink,
    {BotArbiter:MockNativeArbiter})),/replay exhausted/);
  assert.equal(sink.arbiterShuffles[0].deckLength,3);
  assert.equal(MockNativeArbiter.prototype.shuffle.name,'shuffle');
});

test('observer restores original native method when original throws',()=>{
  class RejectingArbiter extends MockNativeArbiter{
    shuffle(){throw Error('source rejection');}
  }
  const arbiter=new RejectingArbiter(),before=Object.getOwnPropertyDescriptor(
    RejectingArbiter.prototype,'shuffle');
  const sink={};
  assert.throws(()=>observe(
    ()=>arbiter.shuffle({cards:[{}]}),sink,
    {BotArbiter:RejectingArbiter}),/source rejection/);
  assert.equal(sink.arbiterShuffles.length,1);
  assert.equal(sink.arbiterShuffles[0].deckLength,1);
  assert.equal(sink.arbiterShuffles[0].mode,2);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    RejectingArbiter.prototype,'shuffle'),before);
});

test('opt-in inner shuffle counter forwards each genuine RNG draw unchanged',()=>{
  const arbiter=new MockNativeArbiter();
  const original=Math.random;
  const baseline=Object.getOwnPropertyDescriptor(
    MockNativeArbiter.prototype,'shuffle');
  const source={traceShuffleRandomCalls:true};
  const replay={traceShuffleRandomCalls:true};
  try {
    Math.random=()=>0.45;
    const captured=observe(()=>recordPolicyRandomTape(
      ()=>arbiter.shuffle({cards:[{},{},{}]})),source,
    {BotArbiter:MockNativeArbiter});
    assert.deepEqual(captured.tape,[0.45,0.45,0.45]);
    assert.equal(source.arbiterShuffles[0].actualShuffleRngCalls,3);
    const same=replayPolicyRandomTape(captured.tape,()=>observe(
      ()=>arbiter.shuffle({cards:[{},{},{}]}),replay,
      {BotArbiter:MockNativeArbiter}));
    assert.equal(same.consumed,3);
    assert.equal(replay.arbiterShuffles[0].actualShuffleRngCalls,3);
    assert.deepEqual(Object.getOwnPropertyDescriptor(
      MockNativeArbiter.prototype,'shuffle'),baseline);
    assert.equal(Math.random(),0.45);
  }finally{Math.random=original;}
});

test('inner shuffle counter restores global random even when shuffle rejects',()=>{
  class ExplodingShuffle extends MockNativeArbiter{
    shuffle(){Math.random();throw Error('native shuffle rejected');}
  }
  const before=Math.random,arbiter=new ExplodingShuffle();
  const sink={traceShuffleRandomCalls:true};
  assert.throws(()=>observe(()=>arbiter.shuffle({cards:[{},{}]}),
    sink,{BotArbiter:ExplodingShuffle}),/native shuffle rejected/);
  assert.equal(sink.arbiterShuffles[0].actualShuffleRngCalls,1);
  assert.strictEqual(Math.random,before);
});
