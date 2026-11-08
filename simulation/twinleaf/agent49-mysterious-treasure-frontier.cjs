'use strict';
const assert=require('node:assert/strict');

const VERSION='agent49-mysterious-treasure-public-discard-frontier-v2';
const ITEM='Mysterious Treasure FLI';
const VIP=['Battle VIP Pass FST'];
const VS_SEEKER='VS Seeker PHF';
const RECOVERABLE_SUPPORTER='Crispin SCR';
const ALTERNATE_PAYMENT='Muscle Band XY';
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
 * @param {{preferMuscleBandPayment?:boolean}} [options] Explicit A/B choice; defaults to original Crispin line.
 * @returns {object|null}
 */
function chooseTreasureRootIntent(view,catalog,options={}){
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
  // The registered rank-13 first-turn root has two native-tested payments.
  // This opt-in preserves Crispin and VS Seeker by spending Muscle Band.
  // Restrict it to the observed owner-visible resource configuration; future
  // damage breakpoints may instead make the Band the critical resource.
  if(discardIndex<0&&options.preferMuscleBandPayment===true&&
     view.globalTurn===1&&hand.includes(RECOVERABLE_SUPPORTER)&&
     hand.includes(VS_SEEKER)){
    discardIndex=hand.findIndex((card,i)=>i!==itemIndex&&
      card===ALTERNATE_PAYMENT);
    if(discardIndex>=0)reason='preserve-crispin-and-vs-seeker';
  }
  // Regidrago's copied-attacks channel gives tactical utility to putting a
  // Dragon donor in discard. Preserve the actual Regidrago evolution pieces.
  // On the first player's first turn Crispin is not playable as a Supporter.
  // If VS Seeker is also held, discarding Crispin pays Treasure while
  // preserving the Supporter for a later turn through the printed recovery.
  if(discardIndex<0&&view.globalTurn===1&&hand.includes(VS_SEEKER)){
    discardIndex=hand.findIndex((card,i)=>i!==itemIndex&&
      card===RECOVERABLE_SUPPORTER);
    if(discardIndex>=0)reason='recoverable-supporter-via-vs-seeker';
  }
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
