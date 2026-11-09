'use strict';

const assert=require('node:assert/strict');

const VERSION='agent20-owner-visible-gengar-horror-house-tempo-v1';
const GENGAR='Gengar & Mimikyu-GX TEU';
const LATIAS='Latias ex SSP';
const LELE='Tapu Lele-GX GRI';
const HORROR='Horror House-GX';

/**
 * Advance a printed one-Psychic GX lock from a stranded Tapu Lele.
 * The entire input is the acting player's detached owner observation and
 * public native card catalog; neither player's hidden deck/Prize identity
 * nor the opposing hand is inspected. Actual Store dispatch remains final.
 *
 * @param {object} view Detached owner-root observation.
 * @param {object} catalog Public native printing and type catalog.
 * @returns {object|null} Native actor-root intent, or no intervention.
 */
function chooseGengarHorrorHouseTempo(view,catalog){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic??{},active=own.active;
  const r=view.ownTurnResources??{},restrictions=own.publicTurnRestrictions??{};
  if(!active||!Array.isArray(own.bench)||view.globalTurn===1||
     restrictions.gxUsed===true||
     restrictions.cannotUseGXAttacks===true||
     restrictions.attackLockTurnsRemaining>0)return null;

  const isGengar=p=>p?.printing===GENGAR&&
    p.attacks?.some(attack=>attack.name===HORROR&&
      attack.gxAttack===true&&Array.isArray(attack.cost)&&
      attack.cost.length===1&&
      attack.cost[0]===catalog.basicEnergyTypes?.Psychic);
  const isReady=p=>p?.energies?.some(printing=>
    printing.startsWith('Psychic Energy '))===true;
  const blocked=p=>p?.publicRestrictions?.cannotAttackNextTurn===true||
    p?.publicRestrictions?.cannotUseAttacksNextTurn?.includes(HORROR)||
    p?.publicRestrictions?.blockedAttackNameNextTurn===HORROR||
    p?.publicRestrictions?.blockedAttackNameUntilLeavesActive===HORROR||
    (p?.publicRestrictions?.onlyAllowedAttackNameNextTurn&&
      p.publicRestrictions.onlyAllowedAttackNameNextTurn!==HORROR)||
    p?.specialConditions?.some(s=>
      s===catalog.specialConditions?.ASLEEP||
      s===catalog.specialConditions?.PARALYZED);
  if(isGengar(active)){
    if(isReady(active)&&!blocked(active)){
      return {kind:'attack',attackName:HORROR,
        source:VERSION,stage:'funded-gx-lock'};
    }
    return null;
  }

  // Scope the staged opportunity to a stranded exact-printing setup Active.
  if(active.printing!==LELE)return null;
  const benchIndex=own.bench.findIndex(isGengar);
  if(benchIndex<0)return null;
  const gengar=own.bench[benchIndex];
  if(blocked(gengar))return null;

  const skyliner=own.bench.some(p=>p?.printing===LATIAS&&
    p.abilities?.includes('Skyliner'))||
    (active.printing===LATIAS&&active.abilities?.includes('Skyliner'));
  if(isReady(gengar)){
    if(!skyliner||
       r.retreatedTurn===view.globalTurn||
       active.publicRestrictions?.cannotRetreatNextTurn===true||
       active.publicRestrictions?.cannotRetreatWhileActive===true||
       active.specialConditions?.some(s=>
         s===catalog.specialConditions?.ASLEEP||
         s===catalog.specialConditions?.PARALYZED))return null;
    return {kind:'paid-retreat',benchIndex,
      printing:GENGAR,attackName:HORROR,
      source:VERSION,stage:'skyliner-zero-cost-promotion'};
  }

  if(r.energyPlayLocked===true||
     restrictions.energyPlayLocked===true||
     r.energyPlayedTurn===view.globalTurn)return null;
  const handIndex=view.ownHand?.findIndex(p=>
    catalog.basicEnergies?.has(p)===true&&
    p.startsWith('Psychic Energy '))??-1;
  if(handIndex<0)return null;
  return {kind:'attach-basic-energy',slot:'bench',index:benchIndex,
    handIndex,printing:view.ownHand[handIndex],source:VERSION,
    stage:'fund-one-psychic-horror-house'};
}

module.exports={VERSION,GENGAR,LATIAS,LELE,HORROR,
  chooseGengarHorrorHouseTempo};
