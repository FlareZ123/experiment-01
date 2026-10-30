'use strict';
const assert=require('node:assert/strict');

const VERSION='agent40-owner-public-bus-dual-position-v1';
const BUS='Vileplume BUS';
const AOR='Vileplume AOR';
const BUNNELBY='Bunnelby PRC';

/**
 * Use one owner-visible Basic Energy attachment to make an immediate,
 * ordinary paid retreat into Active BUS Vileplume affordable, or retreat if
 * it is already affordable. AOR Vileplume must already exist on the Bench.
 *
 * Only proposes into a currently Basic Active opponent: BUS's printed
 * Disgusting Pollen applies to Basic Pokémon attacks only while BUS is
 * Active, so a merely Benched BUS is not a finished two-lock board.
 * This action family deliberately leaves unknown Energy modifiers, unusual
 * multi-type providers, and tactical success to the actual native Store.
 *
 * @param {object} view Deeply detached acting owner's observation.
 * @param {object} catalog Immutable printed/public card metadata.
 * @returns {object|null} Existing basic-attach or paid-retreat intent.
 */
function choosePublicBusPositionTransition(view,catalog){
  assert.equal(view.decisionKind,'owner-root');
  const own=view.ownPublic,active=own?.active,
    res=view.ownTurnResources,other=view.opponentPublic;
  if(!active||active.printing!==BUNNELBY||
      !Array.isArray(own.bench)||
      !Array.isArray(active.energies)||
      !Array.isArray(active.printed?.retreatCost)||
      active.printed.retreatCost.length!==2||
      !Number.isSafeInteger(res?.retreatedTurn)||
      res.retreatedTurn===view.globalTurn||
      active.publicRestrictions?.cannotRetreatNextTurn===true||
      active.publicRestrictions?.cannotRetreatWhileActive===true||
      active.specialConditions?.some(x=>
        x===catalog.specialConditions?.ASLEEP||
        x===catalog.specialConditions?.PARALYZED)||
      other?.active?.printed?.stage!==catalog.stages?.BASIC)return null;
  const target=own.bench.findIndex(p=>p?.printing===BUS);
  if(target<0||!own.bench.some(p=>p?.printing===AOR))return null;
  // Fail closed on unmodeled retreat cost change from a Tool or Field.
  if(active.tools?.length>0||
      (own.stadium??[]).some(p=>p.startsWith('Team Aqua\'s Secret Base '))||
      (other.stadium??[]).some(p=>p.startsWith('Team Aqua\'s Secret Base ')))
    return null;
  if(active.energies.some(e=>!catalog.basicEnergies?.has(e)))
    return null;
  if(active.energies.length>=2)
    return {kind:'paid-retreat',benchIndex:target,
      printing:own.bench[target].printing,retreatCostUnits:2,
      reason:'promote-active-bus-with-aor-item-lock'};
  if(active.energies.length!==1||
     res?.energyPlayedTurn===view.globalTurn||
     res?.energyPlayLocked===true||
     own.publicTurnRestrictions?.energyPlayLocked===true)return null;
  const handIndex=view.ownHand.findIndex(p=>
    catalog.basicEnergies?.has(p));
  if(handIndex<0)return null;
  return {kind:'attach-basic-energy',handIndex,
    printing:view.ownHand[handIndex],slot:'active',index:0,
    reason:'fund-public-bus-lock-retreat'};
}

module.exports={VERSION,choosePublicBusPositionTransition};
