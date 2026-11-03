'use strict';

const assert=require('node:assert/strict');
const {paysWithBasics}=require('./agent7-actor-free-retreat-frontier.cjs');

const VERSION='agent31-shadow-rider-funded-bench-floatstone-v1';
const VMAX='Shadow Rider Calyrex VMAX CRE';
const TOOL='Float Stone BKT';
const ATTACK='Max Geist';

/**
 * Propose a two-root Float Stone → retreat line when the Active Shadow Rider
 * VMAX has already received some Energy but remains unable to pay Max Geist,
 * while a Benched VMAX can pay it. The existing zero-Energy mobility policy
 * deliberately excludes this state. This function observes only an owner-root
 * hand and public board; it never examines concealed cards or calls a reducer.
 *
 * This is a conditional opportunity, not a proof of current retreat legality
 * or a guarantee that the chosen attack will resolve. Store dispatch and a
 * separate paper-fidelity guard must validate the physical actions.
 *
 * @param {object} view Authenticated detached acting-owner root observation.
 * @param {object} catalog Public card/condition type catalog.
 * @returns {object|null} Existing native-neutral Tool or Retreat intent.
 */
function chooseFundedShadowRiderFloatStone(view,catalog){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic,r=view.ownTurnResources;
  const active=own?.active;
  if(view.globalTurn<=1||!active||active.printing!==VMAX||!r||
      !Array.isArray(own.bench)||
      !Number.isSafeInteger(r.retreatedTurn)||
      r.retreatedTurn===view.globalTurn||
      own.publicTurnRestrictions?.attackLockTurnsRemaining>0)return null;
  const restrictions=active.publicRestrictions??{};
  if(restrictions.cannotRetreatNextTurn===true||
      restrictions.cannotRetreatWhileActive===true||
      (active.specialConditions??[]).some(status=>
        status===catalog.specialConditions?.ASLEEP||
        status===catalog.specialConditions?.PARALYZED))return null;
  const costs=active.printed?.retreatCost;
  if(!Array.isArray(costs)||costs.length===0||
      !Array.isArray(active.energies)||active.energies.length===0||
      active.energies.length>=3||
      !active.energies.every(p=>
        catalog.basicEnergies?.has(p)&&p.startsWith('Psychic Energy ')))
    return null;
  const activeMaxGeist=active.attacks?.find(a=>
    a.name===ATTACK&&a.gxAttack!==true&&
    Array.isArray(a.cost)&&a.cost.length===3&&
    a.cost.every(t=>t===catalog.colorlessEnergyType));
  if(!activeMaxGeist||paysWithBasics(active,activeMaxGeist,catalog))
    return null;
  const funded=own.bench.flatMap((slot,index)=>{
    if(slot?.printing!==VMAX||
        slot.publicRestrictions?.cannotAttackNextTurn===true||
        slot.publicRestrictions?.blockedAttackNameNextTurn===ATTACK||
        slot.publicRestrictions?.blockedAttackNameUntilLeavesActive===ATTACK||
        slot.publicRestrictions?.cannotUseAttacksNextTurn?.includes(ATTACK)||
        (slot.publicRestrictions?.onlyAllowedAttackNameNextTurn&&
          slot.publicRestrictions.onlyAllowedAttackNameNextTurn!==ATTACK))
      return [];
    const move=slot.attacks?.find(a=>
      a.name===ATTACK&&a.gxAttack!==true&&
      Array.isArray(a.cost)&&a.cost.length===3&&
      a.cost.every(t=>t===catalog.colorlessEnergyType));
    return move&&paysWithBasics(slot,move,catalog)?[{slot,index}]:[];
  });
  if(funded.length===0)return null;
  // Prefer the least-damaged already-funded VMAX; no hidden information.
  funded.sort((a,b)=>a.slot.damage-b.slot.damage||a.index-b.index);
  const target=funded[0];
  const stadium=[...(own.stadium??[]),
    ...(view.opponentPublic?.stadium??[])];
  if(stadium.some(p=>p.startsWith('Jamming Tower '))||
      view.opponentPublic?.active?.tools?.some(p=>
        p.startsWith('Tool Jammer ')))return null;
  if(active.tools?.includes(TOOL)){
    return {kind:'retreat-emergency-floatstone',
      benchIndex:target.index,printing:target.slot.printing,
      targetAttackName:ATTACK,source:VERSION};
  }
  if(!Array.isArray(active.tools)||active.tools.length>0||
      r.toolPlayLocked===true||
      own.publicTurnRestrictions?.toolPlayLocked===true)return null;
  const handIndex=view.ownHand.indexOf(TOOL);
  if(handIndex<0)return null;
  return {kind:'attach-emergency-floatstone',handIndex,
    benchIndex:target.index,printing:target.slot.printing,
    targetAttackName:ATTACK,source:VERSION};
}

module.exports={VERSION,chooseFundedShadowRiderFloatStone};
