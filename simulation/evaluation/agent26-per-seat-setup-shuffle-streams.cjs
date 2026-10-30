'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {seededRandom,deckPermutation} = require('../twinleaf/headless.cjs');

const BASE=path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output');
const SALTS=Object.freeze([0x243f6a88,0x85a308d3]);

/**
 * Experimental setup-only coupling: shuffle each player's deck using a
 * separate deterministic per-seat stream. This does NOT edit the upstream
 * reducer, affect ordinary game action selection or certify paper rules.
 * A candidate's extra redraw cannot consume the source's shuffle RNG words.
 * Source bonus draws caused by differing opponent mulligans remain legal
 * effects and are not suppressed.
 *
 * Scoped around a synchronous Store match with finally restoration. The
 * headless host may still consume its own default shuffle random variates;
 * only the actual native ResolvePromptAction's permutation is replaced.
 *
 * @param {Function} Store Actual pinned Store class.
 * @param {number} seed Registered nonnegative 32-bit setup seed.
 * @param {() => object} work Synchronous setup capture.
 * @returns {{result:object,shuffleTape:object[]}}
 */
function withPerSeatSetupShuffleStreams(Store,seed,work){
  assert.equal(typeof Store?.prototype?.dispatch,'function');
  assert.ok(Number.isSafeInteger(seed)&&seed>=0&&seed<=0xffffffff);
  assert.equal(typeof work,'function');
  const {ShuffleDeckPrompt}=require(path.join(BASE,
    'game/store/prompts/shuffle-prompt'));
  const {ResolvePromptAction}=require(path.join(BASE,
    'game/store/actions/resolve-prompt-action'));
  const randoms=SALTS.map(salt=>seededRandom((seed^salt)>>>0));
  const counts=[0,0];
  const tape=[];
  const original=Store.prototype.dispatch;
  Store.prototype.dispatch=function perSeatShuffle(action){
    const state=this.state;
    if(action instanceof ResolvePromptAction &&
      state?.turn===0 && Array.isArray(state.prompts) &&
      Array.isArray(state.players)){
      const prompt=state.prompts.find(p=>p?.id===action.id &&
        p.result===undefined);
      if(prompt instanceof ShuffleDeckPrompt){
        const ownerId=prompt.getPerspectivePlayerId();
        const seat=state.players.findIndex(p=>p.id===ownerId);
        assert.ok(seat===0||seat===1,'Native shuffle has no owner seat');
        const n=state.players[seat].deck.cards.length;
        const permutation=deckPermutation(n,randoms[seat]);
        counts[seat]++;
        tape.push({
          seat,shuffleOrdinal:counts[seat],deckSize:n,
          permutationSha256:createHash('sha256')
            .update(JSON.stringify(permutation)).digest('hex')
        });
        return original.call(this,
          new ResolvePromptAction(action.id,permutation,action.log));
      }
    }
    return original.call(this,action);
  };
  try{
    const result=work();
    return {result,shuffleTape:tape};
  }finally{
    Store.prototype.dispatch=original;
  }
}
module.exports={withPerSeatSetupShuffleStreams,SALTS};
