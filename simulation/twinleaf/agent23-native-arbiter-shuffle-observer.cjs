'use strict';

const assert=require('node:assert/strict');

/**
 * Read-only record of the deck lengths passed to native BotArbiter.shuffle.
 * Compiled pinned Twinleaf exposes its TypeScript private method as a regular
 * prototype function. This observer never reads card identities, chooses
 * shuffles or consumes RNG. The original descriptor is restored in finally.
 *
 * @template T
 * @param {()=>T} execute One genuine or detached native policy decision.
 * @param {{arbiterShuffles?:object[]}} sink External diagnostic observation.
 * @param {{BotArbiter?:Function}} [deps] Test-only constructor injection.
 * @returns {T} Unchanged original decision.
 */
function observeNativeArbiterShuffles(execute,sink,deps={}){
  assert.equal(typeof execute,'function');
  assert.ok(sink&&typeof sink==='object');
  const BotArbiter=deps.BotArbiter??
    require('../../vendor/twinleaf/ptcg-server/output/game/bots/bot-arbiter')
      .BotArbiter;
  assert.equal(typeof BotArbiter,'function');
  const proto=BotArbiter.prototype;
  const original=Object.getOwnPropertyDescriptor(proto,'shuffle');
  assert.equal(typeof original?.value,'function',
    'Pinned BotArbiter.shuffle prototype function is required');
  assert.equal(original.configurable,true);
  sink.arbiterShuffles??=[];
  assert.ok(Array.isArray(sink.arbiterShuffles));
  Object.defineProperty(proto,'shuffle',{
    ...original,
    value:function observedNativeShuffle(cards){
      assert.ok(Array.isArray(cards?.cards));
      sink.arbiterShuffles.push({
        deckLength:cards.cards.length,
        mode:this.options?.shuffleMode??null
      });
      return original.value.call(this,cards);
    }
  });
  try{return execute();}
  finally{Object.defineProperty(proto,'shuffle',original);}
}

module.exports={observeNativeArbiterShuffles};
