'use strict';
const assert = require('node:assert/strict');
const VERSION = 'agent4-immediate-funded-hood-deck-budget-v1';
const MINIMUM_DECK_CARDS = 5;

/**
 * Qualify an existing, genuine physically held Stealthy Hood target for a
 * source with a payable Underworld Door immediately afterward.
 * Require enough public deck cards for two draws and at least one later draw
 * even if another VMAX uses Door, subject to other game effects.
 *
 * The predicate intentionally never promises the Door action will resolve:
 * the genuine Store still adjudicates Power, targets, turn markers and
 * attached-energy movement. It reads only the acting owner's hand and
 * public own-deck count. It does not inspect opponent concealed resources.
 *
 * @param {object} actorView Detached current acting owner's observation.
 * @param {{basicEnergies:Set<string>}} catalog Public printed card catalog.
 * @param {{kind:string,printing:string,slot:string,index:number}|null} intent
 * @returns {{eligible:boolean,reason:string}}
 */
function immediateHoodFunding(actorView, catalog, intent) {
  if (intent?.kind!=='attach-tool-candidate'||
      intent.printing!=='Stealthy Hood UNB'||
      intent.slot!=='bench')
    return {eligible:false,reason:'no-held-hood-tool-intent'};
  if(actorView?.decisionKind!=='owner-root' ||
     !Array.isArray(actorView.ownHand) ||
     !(catalog?.basicEnergies instanceof Set))
    return {eligible:false,reason:'no-authenticated-owner-hand-catalog'};
  const deckCount=actorView.ownPublic?.deckCount;
  if(!Number.isSafeInteger(deckCount) ||
     deckCount<MINIMUM_DECK_CARDS)
    return {eligible:false,reason:'no-verified-five-card-deck-reserve'};
  if(!actorView.ownHand.some(card =>
    typeof card==='string' &&
    card.startsWith('Psychic Energy ') &&
    catalog.basicEnergies.has(card)))
    return {eligible:false,reason:'no-currently-held-basic-psychic'};
  return {eligible:true,reason:'held-psychic-and-deck-reserve'};
}

/**
 * Scope a default-off compatibility switch around one synchronous native
 * contest. The original shared root selector remains unchanged by default.
 *
 * @template T
 * @param {()=>T} work
 * @returns {T}
 */
function withImmediateFundedHoodOnly(work) {
  assert.equal(typeof work,'function');
  const before=process.env.AGENT4_IMMEDIATE_PSYCHIC_HOOD_DEV;
  process.env.AGENT4_IMMEDIATE_PSYCHIC_HOOD_DEV='true';
  try{return work();}
  finally{
    if(before===undefined)delete process.env.AGENT4_IMMEDIATE_PSYCHIC_HOOD_DEV;
    else process.env.AGENT4_IMMEDIATE_PSYCHIC_HOOD_DEV=before;
  }
}
module.exports={
  VERSION,MINIMUM_DECK_CARDS,immediateHoodFunding,
  withImmediateFundedHoodOnly
};
