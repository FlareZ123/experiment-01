'use strict';
const assert=require('node:assert/strict');

const VERSION='agent49-mysterious-treasure-public-discard-frontier-v1';
const ITEM='Mysterious Treasure FLI';
const VIP=['Battle VIP Pass FST'];
const REGIDRAGO=/^Regidrago V(?:STAR)?(?: |$)/;

/**
 * A deliberately narrow owner-visible Item proposal. Select a discard only
 * when it has concrete ALS value (Dragon attack donor -> discard with an
 * established Regidrago channel), or is dead first-turn-only Battle VIP Pass.
 *
 * Searching is a separate legal owner-deck prompt. No deck identities,
 * Prize identities, opponent hand identities, or fabricated hit probabilities
 * may determine this root intent.
 *
 * @param {object} view Frozen or mutable detached actor observation.
 * @param {{dragonPokemonPrintings?:Set<string>}} catalog Public card index.
 * @returns {object|null}
 */
function chooseTreasureRootIntent(view,catalog){
  assert.equal(view.decisionKind,'owner-root');
  const own=view.ownPublic;
  const hand=view.ownHand;
  const itemIndex=hand.indexOf(ITEM);
  const open=own.publicTurnRestrictions??{};
  if(itemIndex<0||hand.length<2||own.deckCount<1||
    open.itemPlayLocked===true||view.ownTurnResources.itemPlayLocked===true)
    return null;
  const board=[own.active,...own.bench].filter(Boolean);
  const drago=board.some(pokemon=>REGIDRAGO.test(pokemon.name));
  // The deck search itself can discover a playable target when the owner
  // legitimately views their deck. Before the search, insist on an actual
  // Regidrago V or VSTAR in play, rather than guessing hidden targets.
  if(!drago)return null;
  const alreadyDiscarded=new Set(own.discard??[]);
  let discardIndex=-1,reason=null;
  // Battle VIP Pass has finished its conditional playable window after both
  // players have completed one turn (globalTurn > 2).
  if(view.globalTurn>2){
    discardIndex=hand.findIndex((card,i)=>i!==itemIndex&&VIP.includes(card));
    if(discardIndex>=0)reason='dead-first-turn-item';
  }
  // Regidrago's copied-attacks channel gives tactical utility to putting a
  // Dragon donor in discard. Preserve the actual Regidrago evolution pieces.
  if(discardIndex<0&&catalog.dragonPokemonPrintings instanceof Set){
    discardIndex=hand.findIndex((card,i)=>i!==itemIndex&&
      catalog.dragonPokemonPrintings.has(card)&&
      !REGIDRAGO.test(card)&&!alreadyDiscarded.has(card));
    if(discardIndex>=0)reason='undiscarded-dragon-attack-donor';
  }
  if(discardIndex<0)return null;
  return {
    kind:'play-mysterious-treasure',handIndex:itemIndex,printing:ITEM,
    discardPrinting:hand[discardIndex],discardSourceIndex:discardIndex,
    reason,searchOwnerDeckOnly:true
  };
}
module.exports={VERSION,ITEM,chooseTreasureRootIntent};
