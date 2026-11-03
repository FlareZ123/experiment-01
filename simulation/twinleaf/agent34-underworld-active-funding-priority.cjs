'use strict';

const assert=require('node:assert/strict');

const VERSION='agent34-underworld-active-psychic-funding-priority-v1';
const VMAX='Shadow Rider Calyrex VMAX CRE';
const ABILITY='Underworld Door';
const ATTACK='Max Geist';

/**
 * A conservative, opt-in owner-only alternative to spending the hand's last
 * Basic Psychic Energy on Underworld Door's mandatory Benched recipient.
 *
 * This is considered only after the normal source-root chooser has
 * authenticated a real unspent Underworld Door source and legal-looking Bench
 * recipient. It does not certify the actual Store acceptance or attack.
 * When a Max Geist Active needs Energy, reserving the sole held Psychic for
 * its manual Active attachment can preserve attack progress.
 *
 * @param {object} view Detached authentic acting-owner root observation.
 * @param {object} catalog Public printed card catalog and native type enums.
 * @returns {object|null} A typed manual attachment proposal or abstention.
 */
function chooseUnderworldActiveFundingPriority(view,catalog){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic;
  const r=view.ownTurnResources;
  const active=own?.active;
  if(active?.printing!==VMAX||!r||
      r.energyPlayLocked===true||
      r.energyPlayedTurn===view.globalTurn||
      own.publicTurnRestrictions?.attackLockTurnsRemaining>0)return null;
  const restrictions=active.publicRestrictions??{};
  if(restrictions.cannotAttackNextTurn===true||
      restrictions.cannotAttackWhileActive===true||
      (active.specialConditions??[]).some(s=>
        s===catalog.specialConditions?.ASLEEP||
        s===catalog.specialConditions?.PARALYZED))return null;
  const colorless=catalog.colorlessEnergyType;
  const maxGeist=active.attacks?.find(a=>a.name===ATTACK&&
    a.gxAttack!==true&&Array.isArray(a.cost)&&a.cost.length===3&&
    a.cost.every(unit=>unit===colorless));
  if(!maxGeist||!Array.isArray(active.energies)||
      active.energies.length>=3||
      !active.energies.every(p=>
        catalog.basicEnergies.has(p)&&p.startsWith('Psychic Energy ')))
    return null;
  const held=view.ownHand.flatMap((printing,handIndex)=>
    catalog.basicEnergies.has(printing)&&
    printing.startsWith('Psychic Energy ')?[{handIndex,printing}]:[]);
  if(held.length!==1)return null;
  return {
    kind:'attach-basic-energy',
    handIndex:held[0].handIndex,
    printing:held[0].printing,
    slot:'active',index:0,
    attackName:ATTACK,
    gapBefore:3-active.energies.length,
    gapAfter:2-active.energies.length,
    singleHeldPsychicContestedByUnderworld:true,
    sourceAbility:ABILITY,
    printedTarget:VMAX,
    paperPhysicalEffectUnconfirmed:true
  };
}

module.exports={VERSION,chooseUnderworldActiveFundingPriority};
