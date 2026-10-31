'use strict';

const VERSION='agent14-solo-thorns-energy-retention-v1';

/**
 * A bounded, owner-information-only reason to defer *optional* Benching.
 *
 * When a sole Iron Thorns ex can immediately use Volt Cyclone with exactly
 * one Double Colorless Energy, Benching another Basic introduces a real
 * recipient for Volt Cyclone's Energy movement. The attack can otherwise
 * leave that Energy attached to its Active attacker. This identifies a
 * resource tradeoff, not the best tactical choice; a spare Basic can protect
 * against losing when the only Active is Knocked Out.
 *
 * Printed payability is a conservative proposal; the native Store remains
 * the authority on attack legality and actual Energy movement.
 *
 * @param {object} view Detached actorObservation, never native State.
 * @param {object} catalog Public CardManager metadata.
 * @returns {boolean}
 */
function holdSoloThornsBench(view,catalog){
  if(view?.decisionKind!=='owner-root'||view.globalTurn===1)return false;
  const own=view.ownPublic;
  const active=own?.active;
  if(active?.name!=='Iron Thorns ex'||
     !Array.isArray(own.bench)||!own.bench.every(p=>p===null)||
     !Array.isArray(active.energies)||active.energies.length!==1||
     !active.energies[0].startsWith('Double Colorless Energy '))return false;
  if(own.publicTurnRestrictions?.attackLockTurnsRemaining>0||
     active.publicRestrictions?.cannotAttackNextTurn===true||
     active.publicRestrictions?.cannotUseAttacksNextTurn?.includes('Volt Cyclone')||
     active.publicRestrictions?.blockedAttackNameNextTurn==='Volt Cyclone'||
     active.publicRestrictions?.blockedAttackNameUntilLeavesActive==='Volt Cyclone'||
     (active.publicRestrictions?.onlyAllowedAttackNameNextTurn&&
       active.publicRestrictions.onlyAllowedAttackNameNextTurn!=='Volt Cyclone')||
     active.specialConditions?.some(x=>
       x===catalog.specialConditions?.ASLEEP||
       x===catalog.specialConditions?.PARALYZED))return false;
  const volt=active.attacks?.find(a=>a.name==='Volt Cyclone');
  if(!volt)return false;
  return require('./agent17-public-context-special-energy.cjs')
    .publicSpecialAttackPayable(view,catalog,active,volt);
}

module.exports={VERSION,holdSoloThornsBench};
