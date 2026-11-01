'use strict';
const assert=require('node:assert/strict');
const {publicSpecialAttackPayable}=
  require('./agent17-public-context-special-energy.cjs');

const VERSION='agent41-public-positive-attack-same-root-offer-v2-movement-receipt';

/**
 * Independent owner-root public attack proposal. It observes a currently
 * payable printed positive-damage attack even when a preceding nonterminal
 * Bench, Trainer, or Energy option would otherwise win a first-return chain.
 *
 * Never inspect a concealed zone. This is an offer only, not a certificate
 * of native action playability, final damage, knockout, or game value.
 * When the trusted actor view carries a public movement receipt for the exact
 * PFL #84 Mega Lopunny, compare its two known printed damage packets before
 * offering an attack. This opt-in ranking excludes defensive effects.
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
  // Only the native M2 alias for source PFL #84 has the Gale Thrust movement
  // bonus in this bounded policy. An absent/unknown public event receipt must
  // retain the historical first-payable offer, so frozen development profiles
  // and unsupported cards never gain fabricated effective-damage knowledge.
  const receipt=view.publicEventReceipt;
  const movement=active.printing==='Mega Lopunny ex M2'&&
    receipt?.actorSeat===view.actorSeat&&
    receipt?.turn===view.globalTurn&&
    receipt?.ownerActive?.printing===active.printing&&
    typeof receipt.ownerActive.movedFromBenchToActiveThisTurn==='boolean'?
      receipt.ownerActive.movedFromBenchToActiveThisTurn:null;
  const eligible=[];
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
    const estimatedDamage=movement===null?null:
      attack.name==='Gale Thrust'&&attack.damage===60?
        attack.damage+(movement?170:0):
      attack.name==='Spiky Hopper'&&attack.damage===160?
        attack.damage:null;
    eligible.push({kind:'attack',attackName:attack.name,
      printedDamage:attack.damage,
      ...(estimatedDamage===null?{}:{estimatedDamage,
        damageEstimateScope:'exact-PFL84-public-movement-only'}),
      reason:estimatedDamage===null?
        'printed-positive-damage-payable-public-board':
        'printed-positive-damage-with-public-movement-receipt'});
  }
  if(movement!==null){
    // A subset of payable attacks can be recognized precisely. Do not
    // prefer an unknown-damage attack over a known one, and never claim that
    // a raw attack estimate includes opponent defense or attack effects.
    const ranked=eligible.filter(o=>o.estimatedDamage!==undefined)
      .sort((a,b)=>b.estimatedDamage-a.estimatedDamage);
    if(ranked.length>0)return ranked[0];
  }
  return eligible[0]??null;
}
module.exports={VERSION,choosePayablePrintedAttackOffer};
