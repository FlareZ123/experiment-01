'use strict';
const assert=require('node:assert/strict');
const {assessDragonRondoAfterBlast:gate}=require('../../results/als/new-moon-thorns-postblast-rondo-actor-gate.cjs');
let checks=0;
const base=()=>({
 public:{sourceHp:280,sourceDamage:0,sourceBenchCount:0,
  sourcePrizesRemaining:4,dragonType:true,fairyZoneWeaknessX2:true,
  basicAttackDamagePrevented:false},
 own:{benchBeforeBlast:3,benchCapacity:3},
 action:{postBlastBasicsFromHand:0,postBlastBasicsFromTpe:1,
  abilityCursedBlastLegal:true,abilityCountersActuallyPlaced:true,
  fullMoonRondoAttackLegalAfterRefill:true,attackEnergyPaidAfterRefill:true,
  benchRefillCertified:true,otherEffectsResolved:true}
});
function check(s,status,reason){const x=gate(s);assert.equal(x.status,status);
 if(reason)assert.equal(x.reason,reason);checks++;return x;}
let a=check(base(),'candidate');
assert.equal(a.combinedBenchAtAttack,3);
assert.equal(a.rondoBase,80);
assert.equal(a.rondoAfterWeakness,160);
assert.equal(a.projectedTotalDamage,290);
assert.equal(a.continuation[0].type,'attach-TPE-and-search');
let b=base();b.action.postBlastBasicsFromTpe=0;
a=check(b,'blocked','PSYCHIC_X2_RONDO_TOO_SMALL');
assert.equal(a.totalDamage,250);
b=base();b.public.sourceBenchCount=1;b.action.postBlastBasicsFromTpe=0;
a=check(b,'candidate');assert.equal(a.combinedBenchAtAttack,3);
b=base();b.public.basicAttackDamagePrevented=true;
check(b,'blocked','COVERT_FLIGHT_PREVENTS_BASIC_RONDO_DAMAGE');
b=base();b.public.fairyZoneWeaknessX2=false;
check(b,'blocked','NO_ACTUAL_DRAGON_PSYCHIC_WEAKNESS');
b=base();b.public.sourcePrizesRemaining=1;
check(b,'blocked','SOURCE_FINAL_PRIZE_ON_DUSK_SELF_KO');
b=base();b.action.abilityCursedBlastLegal=false;
check(b,'blocked','DUSK_CURSED_BLAST_NOT_AVAILABLE');
b=base();b.action.attackEnergyPaidAfterRefill=false;
check(b,'blocked','POST_BLAST_RONDO_NOT_PAID_OR_LEGAL');
b=base();b.action.benchRefillCertified=false;
check(b,'blocked','BENCH_REFILL_NOT_ACTOR_CERTIFIED');
b=base();b.own.benchBeforeBlast=3;b.own.benchCapacity=3;
b.action.postBlastBasicsFromTpe=2;
check(b,'blocked','INSUFFICIENT_POST_KO_BENCH_CAPACITY');
b=base();b.public.sourceDamage=30;b.action.postBlastBasicsFromTpe=0;
a=check(b,'candidate');assert.equal(a.projectedTotalDamage,280);
b=base();b.public.sourceHp=370;
check(b,'unsupported','INVALID_DRAGON_BOARD');
b=base();b.action.otherEffectsResolved=false;
check(b,'blocked','UNCERTIFIED_OTHER_DAMAGE_EFFECTS');
b=base();delete b.public.fairyZoneWeaknessX2;
check(b,'unsupported','UNCERTIFIED_DRAGON_OR_ACTOR_FACTS');
assert.equal(checks,14);
console.log('agent22 FairyZone Dragon 130+Rondo x2: '+checks+' synthetic cases passed');
