'use strict';

const {strictK0Belief}=require('./strict-k0-unknown.cjs');

/**
 * Identify a physical printing in a zone visible to its owner. This is only
 * used on already-public/owner-visible cards, never on a deck or face-down
 * Prize card.
 * @param {object} card
 * @returns {string}
 */
function visiblePrinting(card) {
  if(typeof card?.fullName!=='string'||card.fullName.length===0)
    throw new TypeError('An observed owner-zone card lacks its printing');
  return card.fullName;
}

/**
 * Extract exactly the owner's hand and own-zone card objects. Player.playZone
 * aliases Player.supporter in the pinned engine and must not be counted twice.
 * No opponent-state or concealed-deck/prize identities are used.
 *
 * @param {object} owner Pinned Player or a structurally equivalent fixture.
 * @returns {{printings:string[],zoneCounts:Record<string,number>}}
 */
function observedOwnerZones(owner) {
  const groups=[
    ['hand',owner.hand],['discard',owner.discard],
    ['lostzone',owner.lostzone],['stadium',owner.stadium],
    ['supporter',owner.supporter],['active',owner.active]
  ];
  if(!Array.isArray(owner.bench))
    throw new TypeError('Pinned Player bench is unavailable');
  for(let i=0;i<owner.bench.length;i++)
    groups.push(['bench'+i,owner.bench[i]]);
  const printings=[];
  const zoneCounts={};
  for(const [zone,list] of groups) {
    if(!Array.isArray(list?.cards))
      throw new TypeError('Missing owner-observable zone '+zone);
    zoneCounts[zone]=list.cards.length;
    for(const card of list.cards)printings.push(visiblePrinting(card));
    // Pinned PokemonCardList.tools is a separate canonical physical zone.
    // Energy indexed by slot.energies is already in slot.cards: count once.
    if((zone==='active'||zone.startsWith('bench'))&&list.tools!==undefined){
      if(!Array.isArray(list.tools))
        throw new TypeError('Malformed owner Tool zone '+zone);
      if(list.tools.length)zoneCounts[zone+'Tools']=list.tools.length;
      for(const tool of list.tools)printings.push(visiblePrinting(tool));
    }
  }
  return {printings:printings.sort(),zoneCounts};
}

/**
 * Exact owner-K0 unknown physical pool from a registered inventory and
 * observed/owner-visible card zones. Never examine owner.deck.cards entries,
 * owner.prizes[*].cards entries, opponents, or other concealed identities.
 *
 * Caller MUST certify the player's first actual deck search has not happened.
 * Cards known from a previously revealed but still physically concealed
 * deck/Prize position are explicit caller-authenticated inputs, not inspected.
 * A nonexchangeable known deck-order prefix must be modeled separately before
 * interpreting this pool as uniformly mixed.
 *
 * @param {{
 *   owner:object,registered:string[],deckUnsearched:true,
 *   observedDeckPrintings?:string[],observedPrizePrintings?:string[],
 *   knowledgeEpoch?:{snapshot:()=>object}
 * }} input
 * @returns {{
 *   pool:string[],deckCount:number,prizeCount:number,
 *   fullDeckCount:number,fullPrizeCount:number,
 *   visibleZonePrintings:string[],zoneCounts:Record<string,number>,
 *   observedDeckPrintings:string[],observedPrizePrintings:string[]
 * }}
 */
function ownerK0ObservableInventory(input) {
  if(input?.deckUnsearched!==true)
    throw new Error('K0 requires explicit owner first-search provenance');
  if(input.knowledgeEpoch!==undefined) {
    if(typeof input.knowledgeEpoch?.snapshot!=='function')
      throw new TypeError('Authenticated owner knowledge epoch required');
    const epoch=input.knowledgeEpoch.snapshot();
    if(!epoch||[epoch.liveSearches,epoch.fullPrizeReviews,
      epoch.hiddenPrizeRedeals].some(value=>
      !Number.isSafeInteger(value)||value<0))
      throw new TypeError('Invalid owner knowledge epoch snapshot');
    if(epoch.exactMembership===true||epoch.liveSearches>0||
      epoch.fullPrizeReviews>0||epoch.hiddenPrizeRedeals>0)
      throw new Error('K0 first-search claim contradicted by owner epoch');
  }
  const {owner,registered}=input;
  if(!Array.isArray(registered)||registered.length<1||
    registered.length>60||!registered.every(
      name=>typeof name==='string'&&name.length>0))
    throw new TypeError('Owner registered physical printing list required');
  if(!Array.isArray(owner?.deck?.cards)||
    !Array.isArray(owner?.prizes))
    throw new TypeError('Pinned owner deck/prize shape required');
  const observedDeck=input.observedDeckPrintings??[];
  const observedPrizes=input.observedPrizePrintings??[];
  if(!Array.isArray(observedDeck)||!Array.isArray(observedPrizes)||
    ![...observedDeck,...observedPrizes].every(name=>
      typeof name==='string'&&name.length>0))
    throw new TypeError('Explicit already-known printing arrays required');
  const fullDeckCount=owner.deck.cards.length;
  const fullPrizeCount=owner.prizes.reduce((n,slot)=>{
    if(!Array.isArray(slot?.cards))
      throw new TypeError('Pinned owner Prize card slot missing');
    return n+slot.cards.length;
  },0);
  if(observedDeck.length>fullDeckCount||
    observedPrizes.length>fullPrizeCount)
    throw new Error('Declared already-known cards exceed physical hidden zones');
  const {printings,zoneCounts}=observedOwnerZones(owner);
  const belief=strictK0Belief({
    registered,
    known:[...printings,...observedDeck,...observedPrizes],
    deckCount:fullDeckCount-observedDeck.length,
    unseenPrizeCount:fullPrizeCount-observedPrizes.length
  });
  return {
    pool:belief.pool,
    deckCount:belief.deckCount,
    prizeCount:belief.prizeCount,
    fullDeckCount,fullPrizeCount,
    visibleZonePrintings:printings,
    zoneCounts,
    observedDeckPrintings:[...observedDeck],
    observedPrizePrintings:[...observedPrizes]
  };
}

module.exports={visiblePrinting,observedOwnerZones,ownerK0ObservableInventory};
