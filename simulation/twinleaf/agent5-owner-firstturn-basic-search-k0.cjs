'use strict';

const assert=require('node:assert/strict');
const VERSION='agent5-owner-firstturn-basic-search-k0-v1';
const VIP='Battle VIP Pass FST';

/**
 * Build a conservative physical lower bound on Basics remaining in an
 * owner's hidden deck. Use only a KNOWN own registered 60, public printed
 * Basic identity lookup, owner's exact private hand, visible owned field,
 * public discard/Lost Zone, and an upper bound of all remaining own Prize
 * cards. Never read physical deck contents or face-down Prize identities.
 *
 * This lower bound assumes ordinary card ownership conservation. Its
 * mathematical validity is restricted to states without any effect moving an
 * own original card into the opponent's hidden zones, or unknown other zones.
 *
 * @param {object} view Frozen actorObservation at a genuine owner's root.
 * @param {string[]} ownRegisteredSixty This owner's exact printed 60.
 * @param {Set<string>} basicPrintings Public native Basic Pokémon catalog.
 * @returns {{minimumBasicStillInDeck:number,basicRegistered:number,
 *   basicVisibleOutsideDeck:number,possibleBasicPrized:number}}
 */
function guaranteedOwnDeckBasics(view,ownRegisteredSixty,basicPrintings){
  assert.equal(view?.decisionKind,'owner-root');
  assert.equal(ownRegisteredSixty?.length,60);
  assert.ok(basicPrintings instanceof Set);
  const basic=name=>basicPrintings.has(name)?1:0;
  const own=view.ownPublic;
  const visible=[
    ...view.ownHand,...own.discard,...own.lostZone,
    ...(own.resolvingSupporter??[]),
    ...[own.active,...own.bench].filter(Boolean)
      .flatMap(slot=>[
        ...(slot.evolutionPrintings??[]),...(slot.energies??[]),
        ...(slot.tools??[])
      ])
  ];
  const registered=ownRegisteredSixty.reduce((sum,name)=>sum+basic(name),0);
  const outside=visible.reduce((sum,name)=>sum+basic(name),0);
  const possiblePrized=own.prizeCount;
  return {
    minimumBasicStillInDeck:Math.max(0,registered-outside-possiblePrized),
    basicRegistered:registered,
    basicVisibleOutsideDeck:outside,
    possibleBasicPrized:possiblePrized
  };
}

/**
 * Strict *necessary and guaranteed-target* certificate for first-turn Battle
 * VIP Pass. The observed physical Item is in the owner's hand, the visible
 * board has at least one free Bench slot, no public Item lock is reported, and
 * even if every unknown Prize were Basic a target must remain in the deck.
 * This does not establish optimality, native acceptance, prompt closure or
 * opponent response.
 *
 * @param {object} view Genuine owner root with own hand + public geometry.
 * @param {string[]} ownRegisteredSixty Known own original 60.
 * @param {Set<string>} basicPrintings Pinned public Basic print catalog.
 * @returns {object|null}
 */
function certifyFirstTurnBattleVip(view,ownRegisteredSixty,basicPrintings){
  assert.equal(view?.decisionKind,'owner-root');
  if(view.globalTurn>2||view.globalTurn<1)return null;
  const index=view.ownHand.indexOf(VIP);
  if(index<0)return null;
  const own=view.ownPublic,r=view.ownTurnResources;
  if(r.itemPlayLocked===true||own.publicTurnRestrictions?.itemPlayLocked===true)
    return null;
  const emptyBench=(own.bench??[]).filter(slot=>slot===null).length;
  if(emptyBench===0||own.deckCount===0)return null;
  const basic=guaranteedOwnDeckBasics(view,ownRegisteredSixty,
    basicPrintings);
  if(basic.minimumBasicStillInDeck<1)return null;
  return {
    version:VERSION,printing:VIP,handIndex:index,
    printedFirstOwnerTurn:true,
    actualGlobalTurn:view.globalTurn,
    publicEmptyBenchSlots:emptyBench,
    ...basic,
    certified:'paper-VIP-play-conditions-and-at-least-one-hidden-Basic',
    ownershipConservationAssumed:true,
    cardSpecificStrategyProven:false,
    nativePlayOrPromptResolutionProven:false,
    competitorAlternativesEvaluated:false,
    competitiveGameQualified:false
  };
}
module.exports={
  VERSION,VIP,guaranteedOwnDeckBasics,certifyFirstTurnBattleVip
};
