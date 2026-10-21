'use strict';

const assert=require('node:assert/strict');

const VERSION='agent12-active-mega-absol-claw-upgrade-v1';
const PRINTING='Mega Absol ex M1L';
const DARKNESS_ENERGY_PREFIX='Darkness Energy ';

/**
 * Preserve a one-unit owner-visible Active upgrade when a printed conditional
 * first attack is publicly dead and one additional Basic Energy would unlock
 * a deterministic damage attack. The existing Bench-recipient algorithm
 * remains the control and is otherwise completely unchanged.
 *
 * This is an exact-printing development correction, not a general claim that
 * printed damage always dominates control effects. Every property inspected
 * belongs to the acting player's detached observation or public card text.
 *
 * @param {object} view Detached actorObservation of the current owner root.
 * @param {object} catalog Public printed-card catalog.
 * @param {object|null} baseline Existing actor-visible Basic Energy recipient.
 * @returns {object|null} Same native-neutral recipient contract as baseline.
 */
function choosePublicClawUpgrade(view,catalog,baseline){
  assert.equal(view.decisionKind,'owner-root');
  if(baseline?.slot!=='bench')return null;
  const active=view.ownPublic?.active;
  const defender=view.opponentPublic?.active;
  if(active?.printing!==PRINTING||!defender||
     !Number.isSafeInteger(defender.damage)||
     defender.damage<0||defender.damage===60)return null;
  const dark=catalog.basicEnergyTypes?.Darkness;
  const colorless=catalog.colorlessEnergyType;
  if(!Number.isSafeInteger(dark)||!Number.isSafeInteger(colorless))return null;

  // Printed source-Card identity and observable positive-damage alternative.
  const terminal=active.attacks?.find(a=>a.name==='Terminal Period');
  const claw=active.attacks?.find(a=>a.name==='Claw of Darkness');
  if(!terminal||!claw||terminal.damage!==0||claw.damage!==200||
     !Array.isArray(terminal.cost)||!Array.isArray(claw.cost)||
     terminal.cost.join(',')!==[dark,colorless].join(',')||
     claw.cost.join(',')!==[dark,dark,colorless].join(','))return null;

  const restrictions=active.publicRestrictions??{};
  if([0,2].some(x=>active.specialConditions?.includes(x))||
     restrictions.cannotAttackNextTurn===true||
     restrictions.blockedAttackNameNextTurn===claw.name||
     restrictions.blockedAttackNameUntilLeavesActive===claw.name||
     restrictions.cannotUseAttacksNextTurn?.includes(claw.name)||
     (restrictions.onlyAllowedAttackNameNextTurn&&
      restrictions.onlyAllowedAttackNameNextTurn!==claw.name)||
     view.ownPublic.publicTurnRestrictions?.attackLockTurnsRemaining>0)return null;

  // A source-specific numerical threshold with no imputed Special Energy.
  if(active.energies?.length!==2||
     !active.energies.every(printing=>
       catalog.basicEnergies.has(printing)&&
       printing.startsWith(DARKNESS_ENERGY_PREFIX)))return null;
  const handIndex=view.ownHand.findIndex(printing=>
    catalog.basicEnergies.has(printing)&&
    printing.startsWith(DARKNESS_ENERGY_PREFIX));
  if(handIndex<0)return null;

  return {
    handIndex,printing:view.ownHand[handIndex],
    slot:'active',index:0,attackName:claw.name,
    gapBefore:1,gapAfter:0,knownBasicEnergyOnly:true,
    upgradeReason:'publicly-dead-terminal-period-unlocks-claw'
  };
}

module.exports={VERSION,PRINTING,choosePublicClawUpgrade};
