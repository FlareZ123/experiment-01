'use strict';
const assert=require('node:assert/strict');
const {publicSpecialAttackPayable}=
  require('./agent17-public-context-special-energy.cjs');

const VERSION='agent41-public-positive-attack-same-root-offer-v1';

/**
 * Independent owner-root public attack proposal. It observes a currently
 * payable printed positive-damage attack even when a preceding nonterminal
 * Bench, Trainer, or Energy option would otherwise win a first-return chain.
 *
 * Never inspect a concealed zone. This is an offer only, not a certificate
 * of native action playability, final damage, knockout, or game value.
 *
 * @param {object} view Authenticated detached owner actor observation.
 * @param {object} catalog Exact public printing and type metadata.
 * @returns {{kind:'attack',attackName:string,printedDamage:number,
 *   reason:string}|null}
 */
function choosePayablePrintedAttackOffer(view,catalog){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic,active=own?.active;
  if(!active||!Array.isArray(active.attacks)||!Array.isArray(active.energies))
    return null;
  const lock=own.publicTurnRestrictions??{};
  const restrictions=active.publicRestrictions??{};
  if(lock.attackLockTurnsRemaining>0||
     restrictions.cannotAttackNextTurn===true||
     active.specialConditions?.some(s=>
       s===catalog.specialConditions?.ASLEEP||
       s===catalog.specialConditions?.PARALYZED))
    return null;
  for(const attack of active.attacks){
    if(typeof attack.name!=='string'||!attack.name||
       !Number.isSafeInteger(attack.damage)||attack.damage<=0||
       attack.damageCalculation!==undefined&&
         attack.damageCalculation!==null||
       !Array.isArray(attack.cost)||
       view.globalTurn<=1&&attack.canUseOnFirstTurn!==true||
       attack.gxAttack===true||attack.name.endsWith('-GX')||
       restrictions.blockedAttackNameNextTurn===attack.name||
       restrictions.blockedAttackNameUntilLeavesActive===attack.name||
       restrictions.cannotUseAttacksNextTurn?.includes(attack.name)||
       restrictions.onlyAllowedAttackNameNextTurn&&
         restrictions.onlyAllowedAttackNameNextTurn!==attack.name)
      continue;
    if(!publicSpecialAttackPayable(view,catalog,active,attack))continue;
    return {kind:'attack',attackName:attack.name,
      printedDamage:attack.damage,
      reason:'printed-positive-damage-payable-public-board'};
  }
  return null;
}
module.exports={VERSION,choosePayablePrintedAttackOffer};
