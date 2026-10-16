'use strict';

const assert = require('node:assert/strict');
const {canonicalUnseenCards} = require('./canonical-unseen-cards.cjs');

/** Discover card instances across reachable state, without invoking getters. */
function reachableCards(root, isCard) {
  const cards = new Set();
  const seen = new WeakSet();
  const pending = [root];
  while (pending.length) {
    const value = pending.pop();
    if (value === null || typeof value !== 'object' || seen.has(value)) continue;
    seen.add(value);
    if (isCard(value)) cards.add(value);
    if (value instanceof Map) {
      for (const [key, item] of value) pending.push(key, item);
    } else if (value instanceof Set) {
      for (const item of value) pending.push(item);
    } else {
      for (const key of Reflect.ownKeys(value)) {
        const descriptor = Object.getOwnPropertyDescriptor(value,key);
        if (descriptor && Object.hasOwn(descriptor,'value')) pending.push(descriptor.value);
      }
    }
  }
  return cards;
}

/**
 * Score one proposed action against independent full-state copies. No array
 * in the real state is ever rearranged. The supplied clone must detach every
 * mutable Card instance, not merely copy the surrounding deck/board arrays.
 *
 * This is a research diagnostic requiring K1, unknown deck order and action
 * references that remain valid against a cloned state (e.g. index actions).
 * It is not a policy for unknown opponent zones or K0 information sets.
 *
 * @param {object} state Live source state.
 * @param {number} playerId Acting player id.
 * @param {object} action Hypothetical index-based action.
 * @param {number} passTurnScore Existing tactic threshold.
 * @param {Function} evaluator Pinned tactic evaluator.
 * @param {object} receiver Original `this` for evaluator.
 * @param {(state:object)=>object} cloneState Complete detached-state clone.
 * @param {{seed:number,samples:number,permutation:(n:number,rng:Function)=>number[],random:(seed:number)=>Function,isCard:(value:object)=>boolean}} opts
 * @returns {number|undefined} Average of valid sampled outcomes.
 */
function evaluateDetachedDeckSamples(state, playerId, action, passTurnScore,
  evaluator, receiver, cloneState, opts) {
  assert.equal(typeof cloneState, 'function');
  assert.equal(typeof opts.isCard, 'function');
  const srcPlayer=state.players.find(p=>p.id===playerId);
  if (!srcPlayer) return evaluator.call(receiver,state,playerId,action,passTurnScore);
  const sourceCards=reachableCards(state,opts.isCard);
  let total=0;
  let accepted=0;
  for(let sample=0;sample<opts.samples;sample+=1) {
    const detached=cloneState(state);
    assert.notStrictEqual(detached,state,
      'Full-state sample clone must be detached from live State');
    const player=detached.players.find(p=>p.id===playerId);
    assert.ok(player,'Sampled State lost acting player');
    assert.notStrictEqual(player,srcPlayer,'Sampled Player must be detached');
    for (const card of reachableCards(detached,opts.isCard)) {
      assert.equal(sourceCards.has(card),false,
        'Sampler clone retained a live Card reference outside or inside the deck');
    }
    const deck=player.deck.cards;
    assert.notStrictEqual(deck,srcPlayer.deck.cards,
      'Sampler clone must detach the acting player deck array');
    for(let i=0;i<deck.length;i+=1){
      assert.notStrictEqual(deck[i],srcPlayer.deck.cards[i],
        'Sampler clone must detach Card objects, not just deck arrays');
    }
    const canonical=canonicalUnseenCards(deck);
    const seed=(opts.seed ^ Math.imul(state.turn+1,0x9e3779b9) ^
      Math.imul(playerId,0x85ebca6b) ^ Math.imul(sample+1,0xc2b2ae35))>>>0;
    const shuffled=opts.permutation(canonical.length,opts.random(seed));
    deck.splice(0,deck.length,...shuffled.map(index=>canonical[index]));
    const score=evaluator.call(receiver,detached,playerId,action,passTurnScore);
    if(score!==undefined){total+=score;accepted+=1;}
  }
  return accepted?total/accepted:undefined;
}
module.exports={evaluateDetachedDeckSamples};
