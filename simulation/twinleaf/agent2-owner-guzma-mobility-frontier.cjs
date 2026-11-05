'use strict';

/**
 * Side-independent, owner-only option generator for Guzma mobility rescue.
 * It compares printed Colorless one-Energy access and basic retreat geometry.
 * A proposal is NOT a paper-legality assertion, payment, chosen action,
 * optimal strategy or native Store acceptance. It omits many effects.
 */

const COLORLESS=9;

/** @param {object|null} pokemon @returns {object|null} */
function nominalOneEnergyColorless(pokemon){
  if(!pokemon||!Array.isArray(pokemon.energies)||
     !Array.isArray(pokemon.attacks)||pokemon.energies.length<1)
    return null;
  if(pokemon.publicRestrictions?.cannotAttackNextTurn===true)
    return null;
  for(const attack of pokemon.attacks){
    if(attack.cost?.length===1&&attack.cost[0]===COLORLESS&&
       !pokemon.publicRestrictions?.cannotUseAttacksNextTurn?.includes(
         attack.name)&&
       pokemon.publicRestrictions?.blockedAttackNameNextTurn!==attack.name&&
       pokemon.publicRestrictions?.blockedAttackNameUntilLeavesActive!==
         attack.name){
      return {attackName:attack.name};
    }
  }
  return null;
}

/** @param {object|null} pokemon @returns {number|null} */
function nominalRetreatDeficit(pokemon){
  if(!pokemon||!Array.isArray(pokemon.energies))return null;
  const cost=pokemon.printed?.retreatCost?.length;
  if(!Number.isInteger(cost))return null;
  return Math.max(0,cost-pokemon.energies.length);
}

/**
 * Conservative owner-visible Guzma option, intended for an owner who is
 * stuck behind an Active which lacks a nominal Colorless 1-energy attack
 * and has a funded Colorless-1 attacker on the Bench.
 *
 * @param {object} o Deeply detached actorObservation(state,seat).
 * @returns {object|null} Pure option, with indexes in visible owner lists.
 */
function ownerGuzmaMobilityOption(o){
  if(o?.decisionKind!=='owner-root'||o.globalTurn<=1||
     o.ownTurnResources?.supporterPlayedTurn!==0||
     o.ownTurnResources?.supporterPlayLocked===true||
     o.ownPublic?.publicTurnRestrictions?.attackLockTurnsRemaining>0||
     o.ownPublic?.publicTurnRestrictions?.supporterPlayLocked===true)
    return null;
  const hand=o.ownHand??[];
  const handIndex=hand.findIndex(p=>p==='Guzma BUS');
  if(handIndex<0)return null;
  const active=o.ownPublic?.active;
  if(!active||nominalRetreatDeficit(active)===null||
     nominalRetreatDeficit(active)===0||
     nominalOneEnergyColorless(active))return null;
  const bench=(o.ownPublic?.bench??[]).map((p,index)=>({
    pokemon:p,index,attack:nominalOneEnergyColorless(p)
  })).filter(x=>x.pokemon&&x.attack);
  if(!bench.length)return null;
  const opponents=(o.opponentPublic?.bench??[]).map((p,index)=>({
    pokemon:p,index,deficit:nominalRetreatDeficit(p)
  })).filter(x=>x.pokemon);
  if(!opponents.length)return null;
  opponents.sort((a,b)=>(b.deficit??0)-(a.deficit??0)||
    a.pokemon.energies.length-b.pokemon.energies.length||a.index-b.index);
  const ours=bench[0],theirs=opponents[0];
  return Object.freeze({
    kind:'paper-unqualified-guzma-rescue-option',
    handIndex,ownerBenchIndex:ours.index,
    opponentBenchIndex:theirs.index,
    ownerPrinting:ours.pokemon.printing,
    opponentPrinting:theirs.pokemon.printing,
    nominalAttackName:ours.attack.attackName,
    activePrinting:active.printing,
    activeNominalRetreatDeficit:nominalRetreatDeficit(active),
    opponentNominalRetreatDeficit:theirs.deficit,
    actorSeat:o.actorSeat
  });
}

module.exports={COLORLESS,nominalOneEnergyColorless,
  nominalRetreatDeficit,ownerGuzmaMobilityOption};
