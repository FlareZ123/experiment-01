'use strict';
const assert=require('node:assert/strict');

const VERSION='agent40-owner-public-bus-dual-position-v2-jet-switch';
const BUS='Vileplume BUS';
const AOR='Vileplume AOR';
const BUNNELBY='Bunnelby PRC';

/**
 * Select an owner-visible route to promote BUS Vileplume Active while the
 * AOR Item-lock partner occupies the Bench. The cost-free ordinary retreat
 * from two attached Basic Energy is preferred. A held Jet Energy is next
 * because its Bench attachment switches BUS directly even if Bunnelby cannot
 * retreat normally; otherwise one held Basic can fund the ordinary retreat.
 *
 * Only proposes against a public opponent Basic Active. BUS's Disgusting
 * Pollen affects attacks from the opponent's Basic Pokemon only while BUS
 * is Active. These are actor information-set candidates; native Store
 * acceptance and actual Ability denial must be witnessed separately.
 *
 * @param {object} view Detached acting owner's real-root observation.
 * @param {object} catalog Public immutable printed card metadata.
 * @returns {object|null} Existing typed Special/Basic attach or retreat root.
 */
function choosePublicBusPositionTransition(view,catalog){
  assert.equal(view.decisionKind,'owner-root');
  const own=view.ownPublic,active=own?.active,
    res=view.ownTurnResources,other=view.opponentPublic;
  if(!active||active.printing!==BUNNELBY||
      !Array.isArray(own.bench)||
      !Array.isArray(active.energies)||
      other?.active?.printed?.stage!==catalog.stages?.BASIC)return null;
  const target=own.bench.findIndex(p=>p?.printing===BUS);
  if(target<0||!own.bench.some(p=>p?.printing===AOR))return null;
  const energyOpen=res?.energyPlayedTurn!==view.globalTurn&&
    res?.energyPlayLocked!==true&&
    own.publicTurnRestrictions?.energyPlayLocked!==true;
  const normalRetreatAllowed=Number.isSafeInteger(res?.retreatedTurn)&&
    res.retreatedTurn!==view.globalTurn&&
    active.publicRestrictions?.cannotRetreatNextTurn!==true&&
    active.publicRestrictions?.cannotRetreatWhileActive!==true&&
    !active.specialConditions?.some(x=>
      x===catalog.specialConditions?.ASLEEP||
      x===catalog.specialConditions?.PARALYZED)&&
    active.printed?.retreatCost?.length===2&&
    (active.tools??[]).length===0&&
    ![...(own.stadium??[]),...(other.stadium??[])]
      .some(p=>p.startsWith("Team Aqua's Secret Base "));
  const basicOnly=active.energies.every(e=>catalog.basicEnergies?.has(e));
  // A ready ordinary retreat conserves Jet Energy and attachment quota.
  if(normalRetreatAllowed&&basicOnly&&active.energies.length>=2)
    return {kind:'paid-retreat',benchIndex:target,
      printing:own.bench[target].printing,retreatCostUnits:2,
      reason:'promote-active-bus-with-aor-item-lock'};
  // The only source of a mandatory Jet promotion is a held Jet to a
  // Benched Pokemon. Retreat-preventing status does not prevent switching.
  if(energyOpen&&res?.specialEnergyPlayLocked!==true&&
      own.publicTurnRestrictions?.specialEnergyPlayLocked!==true&&
      ![...(own.stadium??[]),...(other.stadium??[])]
        .some(p=>p.startsWith('Temple of Sinnoh '))){
    const jetIndex=view.ownHand.findIndex(p=>p.startsWith('Jet Energy ')&&
      catalog.specialEnergies?.has(p));
    if(jetIndex>=0)
      return {kind:'attach-special-energy',handIndex:jetIndex,
        printing:view.ownHand[jetIndex],slot:'bench',index:target,
        reason:'jet-promote-active-bus-with-aor-item-lock'};
  }
  if(!normalRetreatAllowed||!basicOnly||active.energies.length!==1||
      !energyOpen)return null;
  const handIndex=view.ownHand.findIndex(p=>catalog.basicEnergies?.has(p));
  if(handIndex<0)return null;
  return {kind:'attach-basic-energy',handIndex,
    printing:view.ownHand[handIndex],slot:'active',index:0,
    reason:'fund-public-bus-lock-retreat'};
}
module.exports={VERSION,choosePublicBusPositionTransition};
