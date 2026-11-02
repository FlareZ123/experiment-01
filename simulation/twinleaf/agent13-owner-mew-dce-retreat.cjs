'use strict';
const assert=require('node:assert/strict');

const VERSION='agent13-owner-public-mew-genesect-dce-retreat-v1';
const GENESECT='Genesect V FST';
const MEW='Mew VMAX FST';
const DCE='Double Colorless Energy SUM';

/**
 * Development-only owner-visible Mew VMAX attacking transition.
 *
 * Its exact public proof is an unready Active Genesect V with a single
 * Double Colorless Energy, and a Benched Mew VMAX already funded by DCE.
 * Retreating Genesect into the Bench both pays its printed two-colorless
 * Retreat Cost and exposes the Genesect attack as a copy donor for Mew.
 * Native Store still adjudicates effects, payment prompts and actual attacks.
 *
 * @param {object} view Authenticated detached owner observation.
 * @param {object} catalog Public Special Conditions enum catalog.
 * @returns {{kind:'paid-retreat',benchIndex:number,printing:string,
 *   attackName:string,retreatCostUnits:2,reason:string}|null}
 */
function chooseOwnerMewDceRetreat(view,catalog){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic;
  const active=own?.active;
  const resources=view.ownTurnResources;
  if(!active||view.globalTurn===1||
    active.printing!==GENESECT||
    !Array.isArray(active.energies)||
    active.energies.length!==1||
    active.energies[0]!==DCE||
    !Array.isArray(active.printed?.retreatCost)||
    active.printed.retreatCost.length!==2||
    !Array.isArray(own.bench)||
    !Number.isSafeInteger(resources?.retreatedTurn)||
    resources.retreatedTurn===view.globalTurn||
    own.publicTurnRestrictions?.attackLockTurnsRemaining>0||
    active.publicRestrictions?.cannotRetreatNextTurn===true||
    active.publicRestrictions?.cannotRetreatWhileActive===true||
    active.specialConditions?.some(s=>
      s===catalog.specialConditions.ASLEEP||
      s===catalog.specialConditions.PARALYZED))return null;
  const index=own.bench.findIndex(slot=>
    slot?.printing===MEW&&
    Array.isArray(slot.energies)&&slot.energies.includes(DCE)&&
    slot.attacks?.some(a=>a.name==='Cross Fusion Strike'&&
      Array.isArray(a.cost)&&a.cost.length===2)&&
    slot.publicRestrictions?.cannotAttackNextTurn!==true&&
    slot.publicRestrictions?.blockedAttackNameNextTurn!=='Cross Fusion Strike'&&
    slot.publicRestrictions?.blockedAttackNameUntilLeavesActive!=='Cross Fusion Strike'&&
    !(slot.publicRestrictions?.cannotUseAttacksNextTurn??[])
      .includes('Cross Fusion Strike')&&
    (!slot.publicRestrictions?.onlyAllowedAttackNameNextTurn||
      slot.publicRestrictions.onlyAllowedAttackNameNextTurn==='Cross Fusion Strike')
  );
  return index<0?null:{
    kind:'paid-retreat',benchIndex:index,printing:MEW,
    attackName:'Cross Fusion Strike',retreatCostUnits:2,
    reason:'owner-public-genesect-dce-into-funded-mew-copy-donor'
  };
}
module.exports={VERSION,GENESECT,MEW,DCE,chooseOwnerMewDceRetreat};
