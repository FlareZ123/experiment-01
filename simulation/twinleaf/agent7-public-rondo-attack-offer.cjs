'use strict';

const assert=require('node:assert/strict');
const {publicSpecialAttackPayable}=
  require('./agent17-public-context-special-energy.cjs');

const VERSION='agent7-rondo-owner-public-bench-offer-v1';

/**
 * Exact printed Full Moon Rondo 20 + 20 per occupied Bench slot.
 * Both boards and the card text are public. This is a printed attack
 * estimate only: Weakness, protections, modifier effects and genuine Store
 * attack legality require separate evidence.
 *
 * @param {object} view Detached actor-only observation.
 * @param {object} catalog Public printing metadata for attached Energy.
 * @returns {{kind:'attack',attackName:string,printedDamage:number,
 *   estimatedDamage:number,benchOccupants:number,damageEstimateScope:string,
 *   reason:string}|null}
 */
function offerPublicRondo(view,catalog){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic, active=own?.active;
  if(active?.printing!=="Lillie's Clefairy ex JTG"||
     !Array.isArray(active.attacks)||
     !Array.isArray(active.energies)||
     !Array.isArray(own.bench)||
     !Array.isArray(view.opponentPublic?.bench)||
     view.globalTurn<=1||
     own.publicTurnRestrictions?.attackLockTurnsRemaining>0||
     active.publicRestrictions?.cannotAttackNextTurn===true||
     active.publicRestrictions?.blockedAttackNameNextTurn==='Full Moon Rondo'||
     active.publicRestrictions?.blockedAttackNameUntilLeavesActive==='Full Moon Rondo'||
     active.publicRestrictions?.cannotUseAttacksNextTurn?.includes('Full Moon Rondo')||
     (active.publicRestrictions?.onlyAllowedAttackNameNextTurn&&
       active.publicRestrictions.onlyAllowedAttackNameNextTurn!=='Full Moon Rondo')||
     active.specialConditions?.some(s=>s===catalog.specialConditions?.ASLEEP||
       s===catalog.specialConditions?.PARALYZED))return null;
  const attack=active.attacks.find(a=>a.name==='Full Moon Rondo');
  if(!attack||attack.damage!==20||!Array.isArray(attack.cost)||
     typeof attack.text!=='string'||
     !/this attack does 20 more damage for each benched pok[eé]mon\s*\(both yours and your opponent's\)/i
       .test(attack.text.replace(/\s+/g,' '))||
     !publicSpecialAttackPayable(view,catalog,active,attack))return null;
  const benchOccupants=own.bench.filter(Boolean).length+
    view.opponentPublic.bench.filter(Boolean).length;
  return {kind:'attack',attackName:'Full Moon Rondo',printedDamage:20,
    estimatedDamage:20+20*benchOccupants,benchOccupants,
    damageEstimateScope:'exact-JTG56-printed-combined-bench-only',
    reason:'owner-visible-payable-printed-rondo-dynamic-damage'};
}

/**
 * Coarse, owner-visible access-state census. A source rank's zero attack
 * offers is otherwise ambiguous between no Clefairy, wrong Active position,
 * and an unfunded Active attacker. These are root observations, not games.
 * @param {object} view Detached owner-root observation.
 * @param {object} catalog Public card catalog.
 * @returns {string} An intentionally disjoint readiness category.
 */
function publicRondoReadiness(view,catalog){
  const own=view?.ownPublic;
  if(view?.decisionKind!=='owner-root'||!own||
     !Array.isArray(own.bench))return 'unobserved';
  if(own.active?.printing==="Lillie's Clefairy ex JTG"){
    if(offerPublicRondo(view,catalog))return 'active-payable';
    if(!Array.isArray(own.active.energies)||
       own.active.energies.length<2)return 'active-fewer-than-two-energy-cards';
    return 'active-payability-or-rule-blocked';
  }
  return own.bench.some(p=>p?.printing==="Lillie's Clefairy ex JTG")?
    'benched-not-active':'not-in-play';
}

module.exports={VERSION,offerPublicRondo,publicRondoReadiness};
