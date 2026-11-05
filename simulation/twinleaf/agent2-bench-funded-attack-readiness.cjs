'use strict';

const assert=require('node:assert/strict');
const {paysWithBasics}=
  require('./agent7-actor-free-retreat-frontier.cjs');
const {classifyOwnerMultiBasicRetreatPass,STEPS}=
  require('./agent2-multi-basic-retreat-pass-cascade.cjs');
const VERSION='agent2-owner-public-bench-printed-attack-readiness-v1';

/**
 * Noninterventional owner-visible Bench attack nominal cost readiness.
 * Every printed attack is inspected regardless of damage mode.
 * @param {object} view Frozen owner-only native Pass observation.
 * @param {object} catalog Public printing metadata.
 * @returns {object} Non-strategic attack-cost receipt.
 */
function classifyOwnerBenchPrintedAttackReadiness(view,catalog){
  assert.equal(view?.decisionKind,'owner-root');
  const pass=classifyOwnerMultiBasicRetreatPass(view,catalog);
  const ready=[];
  for(const [index,slot] of (view.ownPublic?.bench??[]).entries()){
    if(!slot||!Array.isArray(slot.energies))continue;
    for(const attack of slot.attacks??[]){
      if(!paysWithBasics(slot,attack,catalog))continue;
      const dynamic=attack.damageCalculation!==null&&
        attack.damageCalculation!==undefined;
      const fixedPositive=!dynamic&&
        Number.isSafeInteger(attack.damage)&&attack.damage>0;
      const nonGx=attack.gxAttack!==true;
      const clear=slot.publicRestrictions?.cannotAttackNextTurn!==true&&
        slot.publicRestrictions?.blockedAttackNameNextTurn!==attack.name&&
        slot.publicRestrictions?.blockedAttackNameUntilLeavesActive!==
          attack.name&&
        !slot.publicRestrictions?.cannotUseAttacksNextTurn?.includes(
          attack.name)&&
        !(slot.specialConditions??[]).some(x=>
          x===catalog.specialConditions?.ASLEEP||
          x===catalog.specialConditions?.PARALYZED);
      ready.push({benchIndex:index,printing:slot.printing??null,
        attackName:attack.name,dynamic,fixedPositive,nonGx,clear,
        knownBasicCards:slot.energies.length});
    }
  }
  const available=ready.some(a=>a.clear);
  return {
    schema:VERSION,actorSeat:view.actorSeat,globalTurn:view.globalTurn,
    count:ready.length,
    anyPrinted:ready.length>0,
    anyNonGx:ready.some(a=>a.nonGx),
    anyFixedPositive:ready.some(a=>a.fixedPositive&&a.nonGx&&a.clear),
    anyDynamicOrZero:ready.some(a=>a.dynamic||!a.fixedPositive),
    anyClear:available,
    printedExactBasicFee:pass.stages[STEPS[1]]&&pass.stages[STEPS[2]],
    firstThreeGatesAndBench:pass.cumulative[STEPS[2]]&&available,
    firstFourGatesAndBench:pass.cumulative[STEPS[3]]&&available,
    ownerDeckDeficit:pass.stages[STEPS[3]],
    afterHypotheticalRetreat:'UNOBSERVED',
    fundedAttacks:ready
  };
}
module.exports={VERSION,classifyOwnerBenchPrintedAttackReadiness};
