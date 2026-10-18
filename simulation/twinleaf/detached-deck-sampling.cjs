'use strict';

const assert = require('node:assert/strict');
const {canonicalUnseenCards} = require('./canonical-unseen-cards.cjs');
const {selectUnobservedPrizeSlots} = require('./partial-prize-slots.cjs');

/** Collect all reachable mutable object identities without invoking getters. */
function reachableObjects(root) {
  const seen = new Set();
  const pending = [root];
  while (pending.length) {
    const value = pending.pop();
    if (value === null || typeof value !== 'object' || seen.has(value)) continue;
    seen.add(value);
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
  return seen;
}

/**
 * Prevent original mutable objects from surviving as own references or as
 * prototype ancestors. Pinned vendor deepClone uses Object.create(source),
 * so examining enumerable properties alone can miss a live State alias.
 */
function assertNoLiveObjects(root,forbidden,message) {
  for(const object of reachableObjects(root)) {
    assert.equal(forbidden.has(object),false,message);
    let prototype=Object.getPrototypeOf(object);
    const visited=new Set();
    while(prototype!==null&&!visited.has(prototype)) {
      assert.equal(forbidden.has(prototype),false,
        message+' through inherited prototype');
      visited.add(prototype);
      prototype=Object.getPrototypeOf(prototype);
    }
  }
}

/**
 * Score one proposed action against independent full-state and action copies.
 * The supplied clone must detach every reachable mutable State object, not
 * merely Card instances and the surrounding deck/board arrays. Detached
 * index-based actions are regenerated for each hypothetical world.
 *
 * This is a research diagnostic requiring K1, unknown suffix order and action
 * references that remain valid against a cloned state (e.g. index actions).
 * A fully known but position-unlocated Prize multiset can be shuffled within
 * the still-unobserved Prize slots, separately from the deck suffix. A
 * positional observation ledger can preserve any known slots. This requires
 * authenticated complete Prize composition and unknown residual positions; mere K1
 * deck-membership knowledge does not prove that Prize positions were shuffled.
 * A known top prefix may be protected only when its observed order is verified.
 * K0 prize-inclusive deals are supported only under an explicit assertion
 * that none of those Prize identities have yet been observed. Opponent zones
 * and general gameplay knowledge tracking remain outside this diagnostic.
 *
 * @param {object} state Live source state.
 * @param {number} playerId Acting player id.
 * @param {object} action Hypothetical index-based action.
 * @param {number} passTurnScore Existing tactic threshold.
 * @param {Function} evaluator Pinned tactic evaluator.
 * @param {object} receiver Original `this` for evaluator.
 * @param {(state:object)=>object} cloneState Complete detached-state clone.
 * @param {{seed:number,samples:number,permutation:(n:number,rng:Function)=>number[],random:(seed:number)=>Function,isCard:(value:object)=>boolean,knownTopCount?:number,knownTopVerified?:boolean,sampleUnknownPrizes?:boolean,prizesUnobservedVerified?:boolean,observedPrizeSlots?:Array<{prizeIndex:number,cardIndex:number,fullName:string}>,prizeObservationLedgerComplete?:boolean,deckPrizePartitionUnknownVerified?:boolean,shuffleKnownPrizePositions?:boolean,prizeCompositionKnownVerified?:boolean,prizePositionsUnobservedVerified?:boolean}} opts
 * @returns {number|undefined} Average of valid sampled outcomes.
 */
function evaluateDetachedDeckSamples(state, playerId, action, passTurnScore,
  evaluator, receiver, cloneState, opts) {
  assert.equal(typeof cloneState, 'function');
  assert.ok(Number.isSafeInteger(opts.samples) && opts.samples > 0,
    'Detached sampling requires a positive integer sample count');
  assert.equal(typeof opts.isCard, 'function');
  const knownTopCount=opts.knownTopCount??0;
  assert.ok(Number.isSafeInteger(knownTopCount)&&knownTopCount>=0,
    'Known-top count must be a nonnegative safe integer');
  assert.ok(knownTopCount===0||opts.knownTopVerified===true,
    'Preserving top cards requires verified observed prefix order');
  const sampleUnknownPrizes=opts.sampleUnknownPrizes===true;
  const shuffleKnownPrizePositions=opts.shuffleKnownPrizePositions===true;
  assert.ok(!(sampleUnknownPrizes&&shuffleKnownPrizePositions),
    'Unknown-membership and known-composition Prize samplers are exclusive');
  if(shuffleKnownPrizePositions) {
    assert.ok(opts.prizeCompositionKnownVerified===true &&
      opts.prizePositionsUnobservedVerified===true,
      'Known Prize composition and unknown positions require verified observations');
  }
  const observedPrizeSlots=opts.observedPrizeSlots??[];
  assert.ok(Array.isArray(observedPrizeSlots),'Observed Prize slots must be an array');
  assert.ok(sampleUnknownPrizes||shuffleKnownPrizePositions||
    observedPrizeSlots.length===0,
    'Observed Prize slots require Prize sampling');
  assert.ok(!shuffleKnownPrizePositions||observedPrizeSlots.length===0||
    opts.prizeObservationLedgerComplete===true,
    'Known Prize positions require a complete observation ledger');
  if(sampleUnknownPrizes&&observedPrizeSlots.length>0) {
    assert.ok(opts.prizeObservationLedgerComplete===true &&
      opts.prizesUnobservedVerified!==true &&
      opts.deckPrizePartitionUnknownVerified===true,
      'Partially observed Prizes require a verified complete observation ledger and unknown deck/Prize partition');
  } else {
    assert.ok(!sampleUnknownPrizes||opts.prizesUnobservedVerified===true||
      opts.prizeObservationLedgerComplete===true,
      'Sampling hidden Prizes requires verified absence of Prize observations or complete empty ledger');
  }
  const srcPlayer=state.players.find(p=>p.id===playerId);
  assert.ok(srcPlayer,'Detached sampling requires an acting player in the source State');
  const sourceObjects=reachableObjects(state);
  // Actions containing references into the original State cannot safely be
  // replayed against a detached State using index-based semantics.
  assertNoLiveObjects(action,sourceObjects,
    'Detached sampler action must not reference live State objects');
  const actionObjects=reachableObjects(action);
  let total=0;
  for(let sample=0;sample<opts.samples;sample+=1) {
    const detached=cloneState(state);
    assert.notStrictEqual(detached,state,
      'Full-state sample clone must be detached from live State');
    const player=detached.players.find(p=>p.id===playerId);
    assert.ok(player,'Sampled State lost acting player');
    assert.notStrictEqual(player,srcPlayer,'Sampled Player must be detached');
    assertNoLiveObjects(detached,sourceObjects,
      'Sampler clone retained a live Card reference or live State object');
    const detachedAction=cloneState(action);
    assertNoLiveObjects(detachedAction,actionObjects,
      'Detached action clone retained a live action or State object');
    assertNoLiveObjects(detachedAction,sourceObjects,
      'Detached action clone retained a live action or State object');
    const deck=player.deck.cards;
    assert.notStrictEqual(deck,srcPlayer.deck.cards,
      'Sampler clone must detach the acting player deck array');
    for(let i=0;i<deck.length;i+=1){
      assert.notStrictEqual(deck[i],srcPlayer.deck.cards[i],
        'Sampler clone must detach Card objects, not just deck arrays');
    }
    assert.ok(knownTopCount<=deck.length,
      'Known-top prefix exceeds deck length');
    const hiddenPrizePositions=sampleUnknownPrizes ?
      selectUnobservedPrizeSlots(player.prizes,observedPrizeSlots) : [];
    const unknownDeckCount=deck.length-knownTopCount;
    const knownPrizeSlots=shuffleKnownPrizePositions ?
      selectUnobservedPrizeSlots(player.prizes,observedPrizeSlots) : [];
    if(shuffleKnownPrizePositions) {
      for(const slot of knownPrizeSlots){
        assert.ok(player.prizes[slot.prizeIndex].isSecret===true,
          'Unobserved Prize positions must be face down');
      }
    }
    const canonical=canonicalUnseenCards([
      ...deck.slice(knownTopCount),
      ...hiddenPrizePositions.map(slot=>slot.card)
    ]);
    const seed=(opts.seed ^ Math.imul(state.turn+1,0x9e3779b9) ^
      Math.imul(playerId,0x85ebca6b) ^ Math.imul(sample+1,0xc2b2ae35))>>>0;
    const shuffled=opts.permutation(canonical.length,opts.random(seed));
    const sampled=shuffled.map(index=>canonical[index]);
    deck.splice(knownTopCount,unknownDeckCount,
      ...sampled.slice(0,unknownDeckCount));
    hiddenPrizePositions.forEach((slot,index)=>{
      player.prizes[slot.prizeIndex].cards[slot.cardIndex]=
        sampled[unknownDeckCount+index];
    });
    // Reassign only Prize positions. Known K1 deck/Prize membership stays fixed.
    // A distinct deterministic seed prevents deck-order sampling from
    // consuming Prize-position randomness and vice versa.
    if(shuffleKnownPrizePositions) {
      const cards=canonicalUnseenCards(knownPrizeSlots.map(slot=>slot.card));
      const order=opts.permutation(cards.length,
        opts.random((seed^0xa5f57b2d)>>>0));
      knownPrizeSlots.forEach((slot,index)=>{
        player.prizes[slot.prizeIndex].cards[slot.cardIndex]=cards[order[index]];
      });
    }
    const score=evaluator.call(receiver,detached,playerId,detachedAction,passTurnScore);
    // A mean conditional on successful hidden-world simulations can
    // overvalue actions that cannot be scored in other possible worlds.
    // Abstain rather than omit unsuccessful determinizations.
    if(score===undefined) return undefined;
    assert.ok(Number.isFinite(score),
      'Detached evaluator must return a finite score or undefined');
    total+=score;
  }
  return total/opts.samples;
}
module.exports={evaluateDetachedDeckSamples};
