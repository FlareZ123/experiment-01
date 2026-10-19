'use strict';

const {playerPlayLockVeto}=require('./player-play-lock-veto.cjs');

/**
 * A conservative, optional non-Pass reply to a vetoed hand play: place the
 * first available Basic from the same actor's real hand into the first empty
 * Bench slot. No concealed deck/Prize/opponent-hand inspection, scoring or
 * speculation. A successful selection is only an alternative proposal; the
 * real Store remains authoritative for legality and resolution.
 *
 * This deliberately does not decide whether benching is strategically good.
 * It must be opt-in and cannot qualify a match as competitive.
 *
 * @param {object} state Actual Store state.
 * @param {object} owner Current physical acting player.
 * @param {object} rejectedAction Original locked root proposal.
 * @param {object} enums Pinned super/stage/power/card-target enum numbers.
 * @param {(id:number,handIndex:number,target:object)=>object} makePlayCard
 * @returns {{action:object,card:string,benchSlot:number}|null}
 */
function visibleBasicBenchResponse(state,owner,rejectedAction,enums,makePlayCard) {
  if (!playerPlayLockVeto(owner,rejectedAction,enums)) return null;
  if (owner.cannotPlayPokemonCards) return null;
  const benchSlot=owner.bench.findIndex(slot=>slot.cards.length===0);
  if (benchSlot<0) return null;
  const handIndex=owner.hand.cards.findIndex(card=>
    card.superType===enums.superPokemon && card.stage===enums.basicStage &&
    !(owner.cannotPlayPokemonWithAbilities &&
      card.powers.some(power=>power.powerType===enums.abilityPowerType)));
  if (handIndex<0) return null;
  const card=owner.hand.cards[handIndex];
  const target={player:enums.bottomPlayerType,slot:enums.benchSlotType,
    index:benchSlot};
  return {action:makePlayCard(owner.id,handIndex,target),
    card:card.fullName,benchSlot};
}

module.exports={visibleBasicBenchResponse};
