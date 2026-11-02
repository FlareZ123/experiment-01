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
