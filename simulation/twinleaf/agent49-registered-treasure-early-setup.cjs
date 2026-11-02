'use strict';
const assert=require('node:assert/strict');

const VERSION='agent49-registered-treasure-early-regidrago-v-v1';
const ITEM='Mysterious Treasure FLI';
const REGIDRAGO_V=/^Regidrago V /;
const REGIDRAGO_BOARD=/^Regidrago V(?:STAR)?$/;
const VIP='Battle VIP Pass FST';

/**
 * Bound one original owner's printed 60 to its detached K0 visible state.
 * Count only publicly known exhausted/held copies. Any unaccounted copies
 * may be in the unknown deck OR unknown Prizes; this never asserts a hit.
 * @param {object} view Actor-only owner root.
 * @param {string[]} ownRegisteredSixty Exactly this actor's own 60 printings.
 * @returns {number} Possible Regidrago V copies in unobserved zones.
 */
function possibleVInUnobservedZones(view,ownRegisteredSixty){
  const own=view.ownPublic;
  const registered=ownRegisteredSixty.filter(id=>REGIDRAGO_V.test(id)).length;
  const publicBoard=[own.active,...own.bench]
    .filter(Boolean).flatMap(p=>p.printing?[p.printing]:[]);
  const known=[...view.ownHand,...own.discard,...own.lostZone,...publicBoard];
  return registered-known.filter(id=>REGIDRAGO_V.test(id)).length;
}

/**
 * Experimental early double-axis owner action:
 * discharge a strategically disposable Dragon (or expired VIP Pass) while
 * searching for a missing Regidrago V. Its printed existence is supported by
 * the player's own registered sixty; actual deck/Prize membership remains K0
 * unknown until a legally granted owner-deck search. Requires an open Bench.
 *
 * @param {object} view Detached actor observation; no native State.
 * @param {{dragonPokemonPrintings?:Set<string>}} catalog Printed card catalog.
 * @param {string[]} ownRegisteredSixty Actor's owner-provided printings.
 * @returns {object|null} Native-neutral Item root only.
 */
function chooseRegisteredTreasureEarlyIntent(view,catalog,ownRegisteredSixty){
  assert.equal(view.decisionKind,'owner-root');
  if(!Array.isArray(ownRegisteredSixty)||
     ownRegisteredSixty.length!==60||
     !ownRegisteredSixty.every(x=>typeof x==='string')||
     !(catalog?.dragonPokemonPrintings instanceof Set))return null;
  const own=view.ownPublic,hand=view.ownHand;
  const itemIndex=hand.indexOf(ITEM);
  if(itemIndex<0||hand.length<2||own.deckCount<1||
     own.publicTurnRestrictions?.itemPlayLocked===true||
     view.ownTurnResources.itemPlayLocked===true||
     !ownRegisteredSixty.includes(ITEM)||
     !ownRegisteredSixty.some(id=>REGIDRAGO_V.test(id))||
     !(own.bench??[]).includes(null)||
     [own.active,...own.bench].some(p=>p&&REGIDRAGO_BOARD.test(p.name))||
     possibleVInUnobservedZones(view,ownRegisteredSixty)<1)return null;
  let index=-1,reason=null;
  if(view.globalTurn>2){
    index=hand.findIndex((printing,i)=>i!==itemIndex&&printing===VIP);
    if(index>=0)reason='expired-vip-for-registered-regidrago-v';
  }
  if(index<0){
    const discarded=new Set(own.discard??[]);
    index=hand.findIndex((printing,i)=>i!==itemIndex&&
      catalog.dragonPokemonPrintings.has(printing)&&
      !REGIDRAGO_V.test(printing)&&
      !/^Regidrago VSTAR /.test(printing)&&
      !discarded.has(printing));
    if(index>=0)reason='dragon-donor-for-registered-regidrago-v';
  }
  if(index<0)return null;
  return {
    kind:'play-mysterious-treasure',
    handIndex:itemIndex,printing:ITEM,discardPrinting:hand[index],
    discardSourceIndex:index,reason,searchOwnerDeckOnly:true,
    targetIntent:'Regidrago V',ownerListGrounded:true,
    targetExactDeckMembershipKnown:false
  };
}
module.exports={VERSION,possibleVInUnobservedZones,
  chooseRegisteredTreasureEarlyIntent};
