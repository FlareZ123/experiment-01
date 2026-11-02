'use strict';
const assert=require('node:assert/strict');
const {energyUnits}=require('./actor-energy-payability.cjs');
const {publicEnergyContext,publicSpecialAttackPayable}=
  require('./agent17-public-context-special-energy.cjs');
const {projectedPrintedDamage,MIN_PROJECTED_DAMAGE}=
  require('./agent6-actor-paid-retreat-frontier.cjs');
const VERSION='agent10-owner-public-flexible-funded-paid-retreat-v1';

/**
 * Conservative single-printed-unit Retreat proposal using supported Basic
 * or Special Energy. Both native Retreat and attack remain Store decisions.
 * @param {object} view Detached player-only observation.
 * @param {object} catalog Immutable publicly indexed card printings.
 * @returns {object|null}
 */
function chooseFlexiblePaidRetreatToFundedBench(view,catalog){
  assert.equal(view.decisionKind,'owner-root');
  const own=view.ownPublic,active=own?.active,r=view.ownTurnResources;
  if(!active||view.globalTurn<=1||
     !Number.isSafeInteger(r?.retreatedTurn)||
     r.retreatedTurn===view.globalTurn||
     own.publicTurnRestrictions?.attackLockTurnsRemaining>0||
     !Array.isArray(active.printed?.retreatCost)||
     active.printed.retreatCost.length!==1||
     active.publicRestrictions?.cannotRetreatNextTurn===true||
     active.publicRestrictions?.cannotRetreatWhileActive===true||
     active.specialConditions?.some(x=>
       x===catalog.specialConditions.ASLEEP||
       x===catalog.specialConditions.PARALYZED))
    return null;
  if(!Array.isArray(active.energies)||active.energies.length===0)
    return null;
  const ctx=publicEnergyContext(view,active,catalog);
  const recognized=active.energies.map(p=>energyUnits(p,ctx));
  if(recognized.some(x=>x===null)||recognized.every(x=>x.length===0))
    return null;

  // Absent tactical opponent-response modeling, do not displace a source
  // Active Pokemon with an immediately payable positive-damage attack.
  if((active.attacks??[]).some(a=>{
    const damage=projectedPrintedDamage(view,active,a);
    return a.gxAttack!==true&&damage!==null&&damage>0&&
      publicSpecialAttackPayable(view,catalog,active,a);
  }))return null;

  const options=[];
  for(let index=0;index<(own.bench??[]).length;index++){
    const pokemon=own.bench[index];
    if(!pokemon||pokemon.publicRestrictions?.cannotAttackNextTurn===true||
       pokemon.specialConditions?.some(x=>
         x===catalog.specialConditions.ASLEEP||
         x===catalog.specialConditions.PARALYZED))continue;
    for(const attack of pokemon.attacks??[]){
      const damage=projectedPrintedDamage(view,pokemon,attack);
      if(attack.gxAttack===true||damage===null||
         damage<MIN_PROJECTED_DAMAGE||
         !publicSpecialAttackPayable(view,catalog,pokemon,attack)||
         pokemon.publicRestrictions?.blockedAttackNameNextTurn===attack.name||
         pokemon.publicRestrictions?.blockedAttackNameUntilLeavesActive===attack.name||
         pokemon.publicRestrictions?.cannotUseAttacksNextTurn?.includes(attack.name)||
         (pokemon.publicRestrictions?.onlyAllowedAttackNameNextTurn&&
          pokemon.publicRestrictions.onlyAllowedAttackNameNextTurn!==attack.name))
        continue;
      options.push({
        kind:'paid-retreat',benchIndex:index,printing:pokemon.printing,
        attackName:attack.name,baseDamage:attack.damage,
        projectedPrintedDamage:damage,retreatCostUnits:1,
        planningVersion:VERSION,realNativePaymentVerified:false
      });
    }
  }
  options.sort((a,b)=>b.projectedPrintedDamage-a.projectedPrintedDamage||
    a.benchIndex-b.benchIndex||a.attackName.localeCompare(b.attackName));
  return options[0]??null;
}
module.exports={VERSION,chooseFlexiblePaidRetreatToFundedBench};
