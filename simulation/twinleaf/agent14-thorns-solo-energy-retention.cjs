'use strict';

const VERSION='agent14-solo-thorns-energy-retention-v3-stadium-path';

/**
 * A bounded, owner-information-only reason to defer *optional* Benching.
 *
 * When a sole Iron Thorns ex can immediately use Volt Cyclone with exactly
 * one Double Colorless Energy, or visibly holds a complete same-turn Thunder\n * Mountain plus Double Colorless setup, Benching another Basic introduces a real
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
     !Array.isArray(active.energies))return false;
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
  const {publicSpecialAttackPayable}=require('./agent17-public-context-special-energy.cjs');
  const resources=view.ownTurnResources;
  const stadiums=[...(own.stadium??[]),...(view.opponentPublic?.stadium??[])];
  const existing=stadiums.find(p=>p.startsWith('Thunder Mountain Prism Star '));
  const heldThunder=view.ownHand?.find(p=>p.startsWith('Thunder Mountain Prism Star '));
  const playableThunder=!existing&&heldThunder&&
    resources?.stadiumPlayLocked===false&&
    resources.stadiumPlayedTurn!==view.globalTurn;
  const thunder=existing||(playableThunder?heldThunder:null);
  if(!thunder)return false;
  const afterStadium={...view,ownPublic:{...own,stadium:[thunder]}};
  // Solo attached DCE may already pay Volt, or a visible unspent Stadium
  // play can enable it before the first attack this turn.
  if(active.energies.length===1&&
     active.energies[0].startsWith('Double Colorless Energy ')){
    return publicSpecialAttackPayable(afterStadium,catalog,active,volt);
  }
  // Alternatively, hold a complete owner-hand DCE plus Thunder path. No
  // own-deck or Prize identities are assumed, and native Store is final.
  if(active.energies.length!==0||!Array.isArray(view.ownHand)||
     resources?.energyPlayLocked!==false||
     resources.specialEnergyPlayLocked!==false||
     resources.energyPlayedTurn===view.globalTurn)return false;
  const heldDce=view.ownHand.find(p=>p.startsWith('Double Colorless Energy '));
  if(!heldDce||!catalog.specialEnergies?.has(heldDce))return false;
  return publicSpecialAttackPayable(afterStadium,catalog,
    {...active,energies:[heldDce]},volt);
}

module.exports={VERSION,holdSoloThornsBench};
