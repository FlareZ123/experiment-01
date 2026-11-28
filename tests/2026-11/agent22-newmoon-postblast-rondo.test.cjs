'use strict';
const assert=require('node:assert/strict');
const {assessRondoAfterBlast}=
 require('../../results/als/new-moon-thorns-postblast-rondo-actor-gate.cjs');
let checks=0;
function base(){
 return {
  public:{sourceHp:230,sourceDamage:0,sourceBenchCount:1,sourcePrizesRemaining:4},
  own:{benchBeforeBlast:3,benchCapacity:5},
  action:{postBlastBasicsFromHand:0,postBlastBasicsFromTpe:0,
   fullMoonAttackEnergyAvailable:true,fullMoonAttackLegal:true,
   cursedBlastAbilityLegal:true,cursedBlastAffectsTarget:true,
   wondrousCostResolved:true,stadiumProtectionCertified:true,
   reactivesResolved:true,gxUsed:true}
 };
}
function check(s,status,reason){
 const r=assessRondoAfterBlast(s);
 assert.equal(r.status,status);
 if(reason)assert.equal(r.reason,reason);
 checks++;return r;
}
let x=check(base(),'blocked','POST_BLAST_BENCH_DAMAGE_SHORT');
assert.equal(x.benchAtAttack,3);
assert.equal(x.rondo,80);
assert.equal(x.total,210);
assert.equal(x.shortBy,20);
x=base();x.action.postBlastBasicsFromTpe=1;
x=check(x,'candidate');assert.equal(x.benchAtAttack,4);
assert.equal(x.projectedRondoDamage,100);
assert.equal(x.projectedTotalDamage,230);
assert.deepEqual(x.continuation.map(z=>z.type),['attach-TPE-and-search-Basics','attack']);
x=base();x.public.sourceBenchCount=0;x.action.postBlastBasicsFromTpe=2;
x=check(x,'candidate');assert.equal(x.benchAtAttack,4);
x=base();x.public.sourceBenchCount=0;x.action.postBlastBasicsFromHand=2;
x=check(x,'candidate');assert.equal(x.benchAtAttack,4);
x=base();x.public.sourceBenchCount=0;x.own.benchBeforeBlast=5;
x=check(x,'candidate');assert.equal(x.refillCount,0);
x=base();x.public.sourceBenchCount=0;x.own.benchBeforeBlast=4;
x=check(x,'blocked','POST_BLAST_BENCH_DAMAGE_SHORT');
assert.equal(x.rondo,80);
x=base();x.public.sourceBenchCount=0;x.own.benchBeforeBlast=4;
x.action.postBlastBasicsFromTpe=1;
x=check(x,'candidate');assert.equal(x.projectedTotalDamage,230);
x=base();x.own.benchBeforeBlast=3;x.action.postBlastBasicsFromHand=4;
check(x,'blocked','INSUFFICIENT_BENCH_CAPACITY');
x=base();x.public.sourcePrizesRemaining=1;
check(x,'blocked','OPPONENT_FINAL_PRIZE_FROM_SELF_KO');
x=base();x.action.gxUsed=true;
check(x,'blocked','POST_BLAST_BENCH_DAMAGE_SHORT'); // GX irrelevant
x=base();x.action.reactivesResolved=false;
check(x,'blocked','UNMODELED_REACTIVE_EFFECTS');
x=base();x.action.cursedBlastAbilityLegal=false;
check(x,'blocked','CURSED_BLAST_UNAVAILABLE');
x=base();x.action.cursedBlastAffectsTarget=false;
check(x,'blocked','CURSED_BLAST_UNAVAILABLE');
x=base();x.action.fullMoonAttackLegal=false;
check(x,'blocked','RONDO_ATTACK_NOT_READY');
x=base();x.action.fullMoonAttackEnergyAvailable=false;
check(x,'blocked','RONDO_ATTACK_NOT_READY');
x=base();x.action.wondrousCostResolved=false;
check(x,'blocked','STADIUM_COST_UNRESOLVED');
x=base();delete x.action.postBlastBasicsFromTpe;
check(x,'unsupported','ACTOR_FIELDS_UNCERTIFIED');
x=base();x.public.sourceHp=280;
check(x,'unsupported','INVALID_PUBLIC_STATE');
x=base();x.public.sourceBenchCount=6;
check(x,'unsupported','INVALID_PUBLIC_STATE');
x=base();x.own.benchBeforeBlast=0;
check(x,'unsupported','INVALID_PUBLIC_STATE');
x=base();x.public.sourceDamage=50;
x=check(x,'candidate'); // Prior 50 damage means 130+80 is lethal despite only 3 Bench
x=base();x.public.sourceDamage=100;
check(x,'blocked','CURSED_BLAST_ALONE_ALREADY_KOS_TARGET');
assert.equal(checks,22);
console.log('agent22 post-Blast Rondo actor gate: '+checks+' synthetic cases passed');
