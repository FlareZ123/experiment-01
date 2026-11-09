'use strict';

const VERSION='agent17-owner-pale-moon-gx-anti-pass-v1';
const ATTACK='Pale Moon-GX';
const PRINTING='Trevenant & Dusknoir-GX SMP';

/**
 * Propose the source-printed Pale Moon-GX only when a presently Active
 * Trevenant & Dusknoir-GX has two actual Psychic Energy cards, enough for
 * the exact [Psychic,Colorless] base cost. All viability beyond this
 * visible sufficient-cost case belongs to the native Store.
 *
 * @param {object} view Detached actor-owner and public-board observation.
 * @param {{specialConditions:object}} catalog Public native printed status numbers.
 * @returns {object|null} Existing actor 'attack' intent or null.
 */
function choosePaleMoonGX(view,catalog){
  if(view?.decisionKind!=='owner-root'||
     !view.ownPublic?.active||
     view.ownPublic.active.printing!==PRINTING||
     !Array.isArray(view.ownPublic.active.attacks)||
     !view.ownPublic.active.attacks.some(x=>x.name===ATTACK)||
     !view.opponentPublic?.active||
     view.ownPublic.publicTurnRestrictions?.gxUsed===true||
     (view.ownPublic.publicTurnRestrictions?.attackLockTurnsRemaining??0)>0||
     view.ownPublic.active.publicRestrictions?.cannotAttackNextTurn===true||
     view.ownPublic.active.publicRestrictions?.cannotUseAttacksNextTurn?.includes(ATTACK)||
     view.ownPublic.active.publicRestrictions?.blockedAttackNameNextTurn===ATTACK||
     view.ownPublic.active.publicRestrictions?.blockedAttackNameUntilLeavesActive===ATTACK||
     (view.ownPublic.active.publicRestrictions?.onlyAllowedAttackNameNextTurn&&
      view.ownPublic.active.publicRestrictions.onlyAllowedAttackNameNextTurn!==ATTACK)||
     view.ownPublic.active.specialConditions?.some(x=>
       x===catalog?.specialConditions?.ASLEEP||
       x===catalog?.specialConditions?.PARALYZED))return null;
  const energy=view.ownPublic.active.energies;
  if(!Array.isArray(energy))return null;
  const basicPsychic=energy.filter(x=>typeof x==='string'&&
    x.startsWith('Psychic Energy ')).length;
  if(basicPsychic<2)return null;
  return {
    kind:'attack',attackName:ATTACK,source:VERSION,
    backedByPrintedEnergy:basicPsychic,
    opponentActivePrinting:view.opponentPublic.active.printing
  };
}
module.exports={VERSION,ATTACK,PRINTING,choosePaleMoonGX};
