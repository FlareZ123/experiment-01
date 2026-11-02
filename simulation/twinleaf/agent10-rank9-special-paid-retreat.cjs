'use strict';
const assert=require('node:assert/strict');
const {publicSpecialAttackPayable}=
  require('./agent17-public-context-special-energy.cjs');

const VERSION='agent10-rank9-physical-special-paid-retreat-v1';

/**
 * Narrow owner-public, default-off rank-9 source counterfactual.
 * Returning an intent is not an assertion that a native RetreatAction
 * or its required Energy-payment prompt will settle successfully.
 * @param {object} view Detached owner-only actor observation
 * @param {object} catalog Public static printing catalog
 * @returns {object|null} Native-compatible paid-retreat intent
 */
function chooseRank9SpecialPaidRetreat(view,catalog){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic,active=own?.active;
  const r=view.ownTurnResources;
  if(active?.printing!=='Electrode-GX CES'||
     view.globalTurn<=1||
     !Number.isSafeInteger(r?.retreatedTurn)||
     r.retreatedTurn===view.globalTurn||
     !Array.isArray(active.printed?.retreatCost)||
     active.printed.retreatCost.length!==1||
     !Array.isArray(active.energies)||
     active.energies.length===0||
     !active.energies.every(x=>typeof x==='string')||
     active.publicRestrictions?.cannotRetreatNextTurn===true||
     active.publicRestrictions?.cannotRetreatWhileActive===true||
     active.specialConditions?.some(x=>
       x===catalog.specialConditions?.ASLEEP||
       x===catalog.specialConditions?.PARALYZED)||
     own.publicTurnRestrictions?.attackLockTurnsRemaining>0)
    return null;

  // The source line already has a funded attacker stranded on Bench.
  // Prefer a funded 200-damage pivot over Electrode's printed
  // Electro Ball (50); avoid displacing a payable 200+ Active attack.
  if((active.attacks??[]).some(a=>
      a.gxAttack!==true&&a.damage>=200&&
      publicSpecialAttackPayable(view,catalog,active,a)))return null;

  for(let index=0;index<(own.bench??[]).length;index++){
    const p=own.bench[index];
    if(p?.printing!=='Mega Absol ex M1L'||
       p.printed?.stage!==catalog.stages?.BASIC||
       !p.printed?.types?.includes(catalog.basicEnergyTypes?.Darkness)||
       p.publicRestrictions?.cannotAttackNextTurn===true||
       p.specialConditions?.some(x=>
         x===catalog.specialConditions?.ASLEEP||
         x===catalog.specialConditions?.PARALYZED))continue;
    const a=p.attacks?.find(x=>
      x.name==='Claw of Darkness'&&x.damage===200&&
      x.gxAttack!==true&&Array.isArray(x.cost)&&
      x.cost.length===3&&
      x.cost.filter(y=>y===catalog.basicEnergyTypes.Darkness).length===2&&
      x.cost.includes(catalog.colorlessEnergyType));
    if(!a||!publicSpecialAttackPayable(view,catalog,p,a))continue;
    return {
      kind:'paid-retreat',benchIndex:index,
      printing:p.printing,attackName:a.name,
      baseDamage:a.damage,retreatCostUnits:1,
      planFamily:VERSION,
      actualNativeRetreatAndPaymentVerified:false,
      actualAttackAndOpponentReplyVerified:false
    };
  }
  return null;
}
module.exports={VERSION,chooseRank9SpecialPaidRetreat};
