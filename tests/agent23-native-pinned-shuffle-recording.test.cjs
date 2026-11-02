'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {BotArbiter}=require(
  '../vendor/twinleaf/ptcg-server/output/game/bots/bot-arbiter');
const {recordPolicyRandomTape,replayPolicyRandomTape}=
  require('../simulation/twinleaf/native-policy-random-tape.cjs');
const {observeNativeArbiterShuffles}=require(
  '../simulation/twinleaf/agent23-native-arbiter-shuffle-observer.cjs');

test('pinned native 41-card RANDOM shuffle emits precisely 41 recorded draws',()=>{
  const original=Math.random;
  const arbiter=new BotArbiter({shuffleMode:2,flipMode:2});
  const deck={cards:Array.from({length:41},(_,i)=>i)};
  const source={traceShuffleRandomCalls:true};
  const replay={traceShuffleRandomCalls:true};
  try{
    Math.random=()=>0.25;
    const genuine=observeNativeArbiterShuffles(
      ()=>recordPolicyRandomTape(()=>arbiter.shuffle(deck)),source);
    assert.equal(genuine.tape.length,41);
    assert.deepEqual(genuine.tape,Array(41).fill(0.25));
    assert.equal(source.arbiterShuffles[0].deckLength,41);
    assert.equal(source.arbiterShuffles[0].actualShuffleRngCalls,41);
    assert.equal(source.arbiterShuffles[0].randomFunctionName,
      'nativePolicyTapeSampler');
    const reconstructed=replayPolicyRandomTape(genuine.tape,()=>
      observeNativeArbiterShuffles(()=>arbiter.shuffle(deck),replay));
    assert.equal(reconstructed.consumed,41);
    assert.equal(replay.arbiterShuffles[0].actualShuffleRngCalls,41);
    assert.equal(replay.arbiterShuffles[0].implementationSha256,
      source.arbiterShuffles[0].implementationSha256);
    assert.deepEqual(reconstructed.result,genuine.result);
    assert.equal(Math.random(),0.25);
  }finally{Math.random=original;}
});

test('genuine headless FairBotHooks produce 40 draws for 41-card shuffle and restore native',()=>{
  const simulatorModule=require(
    '../vendor/twinleaf/ptcg-server/output/game/bots/simulator');
  const {installFairBotHooks}=require(
    '../simulation/twinleaf/headless.cjs');
  const upstreamShuffle=BotArbiter.prototype.shuffle;
  const upstreamSimulator=simulatorModule.Simulator;
  const random=Math.random;
  let undo;
  try{
    Math.random=()=>0.25;
    undo=installFairBotHooks();
    assert.notStrictEqual(BotArbiter.prototype.shuffle,upstreamShuffle);
    assert.notStrictEqual(simulatorModule.Simulator,upstreamSimulator);
    const active={traceShuffleRandomCalls:true};
    const cards={cards:Array.from({length:41},(_,i)=>i)};
    const arbiter=new BotArbiter({shuffleMode:2});
    const observed=observeNativeArbiterShuffles(
      ()=>recordPolicyRandomTape(()=>arbiter.shuffle(cards)),active);
    assert.equal(observed.tape.length,40);
    assert.equal(active.arbiterShuffles[0].actualShuffleRngCalls,40);
    assert.equal(active.arbiterShuffles[0].deckLength,41);
  }finally{
    if(undo)undo();
    Math.random=random;
  }
  assert.strictEqual(BotArbiter.prototype.shuffle,upstreamShuffle);
  assert.strictEqual(simulatorModule.Simulator,upstreamSimulator);
});
