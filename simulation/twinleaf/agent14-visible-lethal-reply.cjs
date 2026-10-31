'use strict';

const VERSION='agent14-visible-lethal-reply-v1';
const {publicSpecialAttackPayable}=
  require('./agent17-public-context-special-energy.cjs');

/** @param {number|string|null} damage @returns {number|null} */
function fixedDamage(damage){
  if(typeof damage==='number'&&Number.isSafeInteger(damage)&&damage>=0)
    return damage;
  if(typeof damage==='string'&&/^[0-9]+$/.test(damage))
    return Number(damage);
  return null;
}

/**
 * One-sided, conservative safety signal for an otherwise optional solo Thorns.
 * Require visible opponent Active to survive the printed 140 Volt Cyclone,
 * and already have a payable fixed-damage reply meeting own remaining HP.
 * This is only a public lower-bound tactical indicator: no opponent hand,
 * future attachments, hidden Prizes or policy assumptions enter the test.
 * Static cost matching does not prove future native attack eligibility.
 *
 * @param {object} view Detached actor owner observation.
 * @param {object} catalog Public printed-card metadata.
 * @returns {object|null} Evidence of publicly *plausible* lethal reply.
 */
function visibleLethalReply(view,catalog){
  if(view?.decisionKind!=='owner-root')return null;
  const own=view.ownPublic?.active,opp=view.opponentPublic?.active;
  if(!own||!opp||own.name!=='Iron Thorns ex')return null;
  if(!Number.isFinite(own.hp)||!Number.isFinite(own.damage)||
     !Number.isFinite(opp.hp)||!Number.isFinite(opp.damage))return null;
  const remaining=own.hp-own.damage;
  const defenderRemaining=opp.hp-opp.damage;
  if(remaining<=0||defenderRemaining<=0)return null;
  // If the opponent is known Lightning-weak, printed Volt could double.
  // Effects, Resistance, Tools and other modifiers are outside this model.
  const weakness=opp.printed?.weakness?.some(w=>
    w.type===catalog.basicEnergyTypes?.Lightning);
  const nominalVolt=weakness?280:140;
  if(defenderRemaining<=nominalVolt)return null;
  const opponentView={...view,
    ownPublic:view.opponentPublic,opponentPublic:view.ownPublic};
  for(const attack of opp.attacks??[]){
    if(attack.gxAttack===true||attack.name?.endsWith('-GX'))continue;
    const damage=fixedDamage(attack.damage);
    if(damage===null||damage<remaining)continue;
    if(!publicSpecialAttackPayable(opponentView,catalog,opp,attack))continue;
    return {
      version:VERSION,opponentPrinting:opp.printing,
      attackName:attack.name,printedDamage:damage,
      ownRemainingHp:remaining,opponentRemainingHp:defenderRemaining,
      nominalVoltDamage:nominalVolt,
      confidence:'public-numeric-payability-only',
      nativeFutureAttackAccepted:'unverified',
      opponentResponsePolicy:'unverified'
    };
  }
  return null;
}

module.exports={VERSION,fixedDamage,visibleLethalReply};
