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
module.exports={assessRondoAfterBlast};
