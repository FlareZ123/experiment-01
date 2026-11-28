'use strict';
/**
 * Read-only, post-self-KO Bench gate for Dusknoir Cursed Blast(13 counters)
 * -> Lillie's Clefairy ex Full Moon Rondo(20+20 per combined Bench occupant)
 * versus 230-HP Iron Thorns ex. No hidden deck/Prize access or game-policy hooks.
 * All projected post-Blast Basics must be certified from actor-owned actual hand
 * or a specific pending/native Telepathic Psychic Energy search offer.
 *
 * Source damage/HP, rule effects, Ability/attack legality, Energy and Bench
 * constraints are arguments to be certified by the *native actor frontier*.
 */
const integer=n=>Number.isSafeInteger(n)&&n>=0;
const yesno=x=>typeof x==='boolean';
const unsupported=reason=>({status:'unsupported',reason});
const blocked=(reason,details={})=>({status:'blocked',reason,...details});

function assessRondoAfterBlast(v){
  if(!v||typeof v!=='object')return unsupported('MISSING_VIEW');
  const p=v.public, o=v.own, a=v.action;
  if(!p||!o||!a||![
      p.sourceHp,p.sourceDamage,p.sourceBenchCount,
      p.sourcePrizesRemaining,o.benchBeforeBlast,o.benchCapacity,
      a.postBlastBasicsFromHand,a.postBlastBasicsFromTpe,
      a.fullMoonAttackEnergyAvailable,a.fullMoonAttackLegal,
      a.cursedBlastAbilityLegal,a.cursedBlastAffectsTarget,
      a.wondrousCostResolved,a.stadiumProtectionCertified,
      a.reactivesResolved,a.gxUsed
    ].every(x=>typeof x==='number'||typeof x==='boolean') ||
    ![
      p.sourceHp,p.sourceDamage,p.sourceBenchCount,
      p.sourcePrizesRemaining,o.benchBeforeBlast,o.benchCapacity,
      a.postBlastBasicsFromHand,a.postBlastBasicsFromTpe
    ].every(integer) ||
    ![
      a.fullMoonAttackEnergyAvailable,a.fullMoonAttackLegal,
      a.cursedBlastAbilityLegal,a.cursedBlastAffectsTarget,
      a.wondrousCostResolved,a.stadiumProtectionCertified,
      a.reactivesResolved,a.gxUsed
    ].every(yesno))return unsupported('ACTOR_FIELDS_UNCERTIFIED');

  if(p.sourceHp!==230||p.sourceDamage>=p.sourceHp||
     p.sourceBenchCount>5||o.benchCapacity<5||
     o.benchBeforeBlast<1||o.benchBeforeBlast>o.benchCapacity||
     p.sourcePrizesRemaining<1||p.sourcePrizesRemaining>6)
    return unsupported('INVALID_PUBLIC_STATE');
  if(p.sourcePrizesRemaining===1)return blocked('OPPONENT_FINAL_PRIZE_FROM_SELF_KO');
  if(!a.reactivesResolved)return blocked('UNMODELED_REACTIVE_EFFECTS');
  if(!a.cursedBlastAbilityLegal||!a.cursedBlastAffectsTarget)
    return blocked('CURSED_BLAST_UNAVAILABLE');
  if(!a.fullMoonAttackLegal||!a.fullMoonAttackEnergyAvailable)
    return blocked('RONDO_ATTACK_NOT_READY');
  if(!a.wondrousCostResolved)return blocked('STADIUM_COST_UNRESOLVED');
  const postBlastBench=o.benchBeforeBlast-1;
  // Do not credit drawn/Prized/TPE-target Pokémon unless the caller provides
  // *certified* action opportunities and actual deck-source offers.
  const availableSlots=o.benchCapacity-postBlastBench;
  const desiredAdds=a.postBlastBasicsFromHand+a.postBlastBasicsFromTpe;
  if(desiredAdds>availableSlots)return blocked('INSUFFICIENT_BENCH_CAPACITY');
  const atAttack=postBlastBench+desiredAdds+p.sourceBenchCount;
  const rondo=20+20*atAttack;
  const remaining=p.sourceHp-p.sourceDamage;
  const total=p.sourceDamage+130+rondo;
  if(total<230)return blocked('POST_BLAST_BENCH_DAMAGE_SHORT',
    {benchAtAttack:atAttack,rondo,total,needBench:Math.max(0,
      Math.ceil((remaining-130-20)/20)),shortBy:230-total});
  return {
    status:'candidate',reason:'POST_KO_BENCH_REPLENISHMENT_230_KO',
    benchBeforeBlast:o.benchBeforeBlast,
    postBlastOwnBench:postBlastBench,
    refillCount:desiredAdds,
    benchAtAttack:atAttack,
    projectedRondoDamage:rondo,
    projectedTotalDamage:total,
    opponentPrizesAfterOwnSelfKO:p.sourcePrizesRemaining-1,
    firstAction:{type:'use-ability',ability:'Cursed Blast',source:'Benched Dusknoir'},
    continuation:[
      ...(a.postBlastBasicsFromHand?[{type:'bench-from-hand',
         count:a.postBlastBasicsFromHand}]:[]),
      ...(a.postBlastBasicsFromTpe?[{type:'attach-TPE-and-search-Basics',
         count:a.postBlastBasicsFromTpe}]:[]),
      {type:'attack',name:'Full Moon Rondo'}
    ],
    revalidateEveryContinuation:true,
    evidence:'conditional public-action availability only; no native game or win rate'
  };
}

/**
 * Dragon Regidrago VSTAR 280HP fallback with Fairy Zone: Dusk Cursed Blast130,
 * then (after losing Dusknoir's Bench slot) Clefairy Rondo [P][C] multiplied
 * by the certified Psychic Weakness x2. Live source Covert Flight Basic-only
 * damage prevention makes this line impossible; source final Prize makes the
 * self-KO fatal. This is not a natural-turn availability or win-rate model.
 */
function assessDragonRondoAfterBlast(v){
 if(!v||!v.public||!v.own||!v.action)
  return unsupported('MISSING_VIEW');
 const p=v.public,o=v.own,a=v.action;
 if(![p.sourceHp,p.sourceDamage,p.sourceBenchCount,p.sourcePrizesRemaining,
       o.benchBeforeBlast,o.benchCapacity,
       a.postBlastBasicsFromHand,a.postBlastBasicsFromTpe].every(integer)||
    ![p.dragonType,p.fairyZoneWeaknessX2,p.basicAttackDamagePrevented,
       a.abilityCursedBlastLegal,a.abilityCountersActuallyPlaced,
       a.fullMoonRondoAttackLegalAfterRefill,a.attackEnergyPaidAfterRefill,
       a.benchRefillCertified,a.otherEffectsResolved].every(yesno))
   return unsupported('UNCERTIFIED_DRAGON_OR_ACTOR_FACTS');
 if(p.sourceHp!==280||p.sourceDamage>=p.sourceHp||
    p.sourceBenchCount>5||p.sourcePrizesRemaining<1||
    p.sourcePrizesRemaining>6||o.benchBeforeBlast<1||
    o.benchBeforeBlast>o.benchCapacity||o.benchCapacity<3)
   return unsupported('INVALID_DRAGON_BOARD');
 if(p.sourcePrizesRemaining===1)
   return blocked('SOURCE_FINAL_PRIZE_ON_DUSK_SELF_KO');
 if(!p.dragonType||!p.fairyZoneWeaknessX2)
   return blocked('NO_ACTUAL_DRAGON_PSYCHIC_WEAKNESS');
 if(p.basicAttackDamagePrevented)
   return blocked('COVERT_FLIGHT_PREVENTS_BASIC_RONDO_DAMAGE');
 if(!a.otherEffectsResolved)
   return blocked('UNCERTIFIED_OTHER_DAMAGE_EFFECTS');
 if(!a.abilityCursedBlastLegal||!a.abilityCountersActuallyPlaced)
   return blocked('DUSK_CURSED_BLAST_NOT_AVAILABLE');
 if(!a.fullMoonRondoAttackLegalAfterRefill||!a.attackEnergyPaidAfterRefill)
   return blocked('POST_BLAST_RONDO_NOT_PAID_OR_LEGAL');
 if(!a.benchRefillCertified)
   return blocked('BENCH_REFILL_NOT_ACTOR_CERTIFIED');
 const postOwn=o.benchBeforeBlast-1;
 const adds=a.postBlastBasicsFromHand+a.postBlastBasicsFromTpe;
 if(postOwn+adds>o.benchCapacity)
   return blocked('INSUFFICIENT_POST_KO_BENCH_CAPACITY');
 const combined=postOwn+adds+p.sourceBenchCount;
 const base=20+20*combined;
 const doubled=2*base;
 const final=p.sourceDamage+130+doubled;
 if(final<280)return blocked('PSYCHIC_X2_RONDO_TOO_SMALL',{
   combinedBenchAtAttack:combined,rondoBase:base,rondoAfterWeakness:doubled,
   totalDamage:final,damageShortBy:280-final
 });
 return {
  status:'candidate',reason:'POST_KO_THREE_BENCH_130_PLUS_PSYCHIC_X2_RONDO',
  sourceRemainingPrizesAfterSelfKO:p.sourcePrizesRemaining-1,
  combinedBenchAtAttack:combined,rondoBase:base,rondoAfterWeakness:doubled,
  projectedTotalDamage:final,
  firstAction:{type:'use-ability',name:'Cursed Blast',source:'Benched Dusknoir'},
  continuation:[...(a.postBlastBasicsFromHand?[{type:'bench-from-hand',count:a.postBlastBasicsFromHand}]:[]),
    ...(a.postBlastBasicsFromTpe?[{type:'attach-TPE-and-search',count:a.postBlastBasicsFromTpe}]:[]),
    {type:'attack',name:'Full Moon Rondo'}],
  priority:'Use only if no actor-certified non-self-KO one-hit is legal now',
  revalidateEveryNativeTransition:true,
  evidence:'exact arithmetic and source effect declarations; no native game'
 };
}
module.exports={assessRondoAfterBlast,assessDragonRondoAfterBlast};

