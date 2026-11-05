'use strict';

const assert=require('node:assert/strict');
const {paysWithBasics}=
  require('./agent7-actor-free-retreat-frontier.cjs');

const VERSION='agent2-actor-owner-multi-basic-paid-retreat-draw-race-v1';

/**
 * Nominal owner-observable opportunity: an Active with no payable
 * positive-damage attack can pay its entire printed 2+ Colorless Retreat
 * fee using *only Basic Energy*, then attack with an already funded Bench
 * attacker before a likely deck-out race. Exact payment, damage and source
 * reply remain authoritative native-Store questions.
 *
 * This planner deliberately declines cost modifiers and ambiguous payment:
 * all Active attached Energy must be known Basic and exact count must match
 * the printed fee; it does not infer payable Special Energy or Tool relief.
 * Opponent hidden cards/deck contents are never read.
 *
 * @param {object} view Frozen detached actorObservation.
 * @param {object} catalog Public printed Basic Energy/attack metadata.
 * @returns {object|null} Native-neutral owner intent or no proven offer.
 */
function chooseMultiBasicPaidRetreatInDeckRace(view,catalog){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic,foe=view.opponentPublic;
  const active=own?.active,enemy=foe?.active;
  const r=view.ownTurnResources;
  if(!active||!enemy||view.globalTurn<=1||!r||
     !Number.isSafeInteger(r.retreatedTurn)||
     r.retreatedTurn===view.globalTurn||
     (own.publicTurnRestrictions?.attackLockTurnsRemaining??0)>0||
     active.publicRestrictions?.cannotRetreatNextTurn===true||
     active.publicRestrictions?.cannotRetreatWhileActive===true||
     active.specialConditions?.some(s=>
       s===catalog.specialConditions?.ASLEEP||
       s===catalog.specialConditions?.PARALYZED))
    return null;
  const printed=active.printed?.retreatCost;
  if(!Array.isArray(printed)||printed.length<2||printed.length>4||
     printed.some(symbol=>symbol!==catalog.colorlessEnergyType)||
     !Array.isArray(active.energies)||
     active.energies.length!==printed.length||
     !active.energies.every(e=>catalog.basicEnergies.has(e))||
     (active.tools?.length??0)>0)return null;
  if(!Number.isSafeInteger(own.deckCount)||
     !Number.isSafeInteger(foe.deckCount)||
     own.deckCount<1||own.deckCount>=foe.deckCount)return null;
  if(!Number.isSafeInteger(enemy.hp)||
     !Number.isSafeInteger(enemy.damage)||
     enemy.hp<=enemy.damage)return null;
  if((active.attacks??[]).some(attack=>
    attack.gxAttack!==true&&Number.isSafeInteger(attack.damage)&&
    attack.damage>0&&paysWithBasics(active,attack,catalog)))
    return null;
  const affordable=[];
  for(let index=0;index<(own.bench??[]).length;index++){
    const slot=own.bench[index];
    if(!slot||!Array.isArray(slot.energies)||
       slot.publicRestrictions?.cannotAttackNextTurn===true||
       slot.specialConditions?.some(s=>
         s===catalog.specialConditions?.ASLEEP||
         s===catalog.specialConditions?.PARALYZED))continue;
    for(const attack of slot.attacks??[]){
      if(attack.gxAttack===true||
         !Number.isSafeInteger(attack.damage)||attack.damage<=0||
         attack.damageCalculation!==null&&
           attack.damageCalculation!==undefined||
         !paysWithBasics(slot,attack,catalog)||
         slot.publicRestrictions?.blockedAttackNameNextTurn===attack.name||
         slot.publicRestrictions?.blockedAttackNameUntilLeavesActive===
           attack.name||
         slot.publicRestrictions?.cannotUseAttacksNextTurn?.includes(
           attack.name))continue;
      const nominalTurnsToKo=Math.ceil(
        (enemy.hp-enemy.damage)/attack.damage);
      if(nominalTurnsToKo>own.deckCount)continue;
      affordable.push({
        kind:'paid-retreat',benchIndex:index,
        printing:slot.printing,attackName:attack.name,
        retreatCostUnits:printed.length,
        projectedPrintedDamage:attack.damage,
        nominalTurnsToKo,
        originalOwnDeckCount:own.deckCount,
        originalOpponentDeckCount:foe.deckCount,
        source:VERSION,paperVerified:false,
        reason:'known-basic-fee-to-funded-attack-before-own-deckout'
      });
    }
  }
  affordable.sort((a,b)=>
    a.nominalTurnsToKo-b.nominalTurnsToKo||
    b.projectedPrintedDamage-a.projectedPrintedDamage||
    a.benchIndex-b.benchIndex||
    a.attackName.localeCompare(b.attackName));
  return affordable[0]??null;
}
module.exports={VERSION,chooseMultiBasicPaidRetreatInDeckRace};
