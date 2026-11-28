'use strict';
const assert=require('node:assert/strict');
const {fairyZoneNoSelfKoPriority:gate}=require('../../results/als/new-moon-fairyzone-no-selfko-priority-gate.cjs');
const offer=(name,stage,damage)=>({name,attackerStage:stage,preWeaknessBaseDamage:damage,
 sourceToken:name,nativeLegalNow:true,energyPaidNow:true,gxNativeAllowed:true});
const base=()=>({public:{targetIsDragon:true,psychicWeaknessX2Certified:true,
 preventBasicAttackDamage:false,otherAttackEffectsCertified:true,
 totalHp:280,remainingHp:280,postWeaknessDamageReduction:0},
 own:{gxAlreadyUsed:true},combat:{offers:[
  offer('Shadow Bind','Stage2',150),
  offer('Night Watch','Basic',150),
  offer('Full Moon Rondo','Basic',140),
  offer('Miraculous Duo-GX','Basic',200)]}});
let n=0;function test(s,status,reason){
 const v=gate(s);assert.equal(v.status,status);if(reason)assert.equal(v.reason,reason);
 n++;return v;}
let x=test(base(),'priority-no-self-ko');
assert.equal(x.firstAction.name,'Full Moon Rondo');
assert.equal(x.preventDusknoirCursedBlastThisRoot,true);
let b=base();b.public.preventBasicAttackDamage=true;
x=test(b,'priority-no-self-ko');assert.equal(x.firstAction.name,'Shadow Bind');
b=base();b.public.preventBasicAttackDamage=true;b.combat.offers=b.combat.offers.filter(x=>x.attackerStage==='Basic');
test(b,'blocked','NO_CERTIFIED_NO_SELF_KO_DRAGON_FINISHER');
b=base();b.public.totalHp=b.public.remainingHp=370;
b.combat.offers=[offer('Eon Blade','Basic',200),offer('Miraculous Duo-GX','Basic',200)];
x=test(b,'priority-no-self-ko');assert.equal(x.firstAction.name,'Eon Blade');
b=base();b.public.totalHp=b.public.remainingHp=370;
b.combat.offers=[offer('Miraculous Duo-GX','Basic',200)];
test(b,'blocked','NO_CERTIFIED_NO_SELF_KO_DRAGON_FINISHER');
b=base();b.public.totalHp=b.public.remainingHp=370;b.own.gxAlreadyUsed=false;
b.combat.offers=[offer('Miraculous Duo-GX','Basic',200)];
test(b,'priority-no-self-ko');
b=base();b.public.psychicWeaknessX2Certified=false;
test(b,'blocked','FAIRY_ZONE_NOT_ACTUALLY_APPLYING');
b=base();b.public.targetIsDragon=false;
test(b,'blocked','FAIRY_ZONE_NOT_ACTUALLY_APPLYING');
b=base();b.public.otherAttackEffectsCertified=false;
test(b,'blocked','OTHER_DAMAGE_EFFECTS_NOT_RECONCILED');
b=base();b.public.postWeaknessDamageReduction=30;
b.combat.offers=[offer('Full Moon Rondo','Basic',140)];
test(b,'blocked','NO_CERTIFIED_NO_SELF_KO_DRAGON_FINISHER');
b=base();b.public.remainingHp=250;b.public.postWeaknessDamageReduction=30;
b.combat.offers=[offer('Full Moon Rondo','Basic',140)];
x=test(b,'priority-no-self-ko');assert.equal(x.projected.projectedFinalDamage,250);
b=base();b.combat.offers.forEach(x=>x.nativeLegalNow=false);
test(b,'blocked','NO_CERTIFIED_NO_SELF_KO_DRAGON_FINISHER');
b=base();b.combat.offers.forEach(x=>x.energyPaidNow=false);
test(b,'blocked','NO_CERTIFIED_NO_SELF_KO_DRAGON_FINISHER');
b=base();b.combat.offers[0].attackerStage='Basic';
test(b,'unsupported','MISSING_OR_CONFLICTING_ACTOR_FACTS');
b=base();b.combat.offers=[offer('Phantom Dive','Stage2',200)];
test(b,'unsupported','MISSING_OR_CONFLICTING_ACTOR_FACTS');
b=base();b.public.postWeaknessDamageReduction=-1;
test(b,'unsupported','MISSING_OR_CONFLICTING_ACTOR_FACTS');
b=base();b.public.remainingHp=290;
test(b,'unsupported','MISSING_OR_CONFLICTING_ACTOR_FACTS');
b=base();b.combat.offers=[];
test(b,'blocked','NO_CERTIFIED_NO_SELF_KO_DRAGON_FINISHER');
b=base();b.combat.offers=[offer('Full Moon Rondo','Basic',120)];
test(b,'blocked','NO_CERTIFIED_NO_SELF_KO_DRAGON_FINISHER');
b=base();b.combat.offers=[offer('Full Moon Rondo','Basic',140)];b.public.preventBasicAttackDamage=true;
test(b,'blocked','NO_CERTIFIED_NO_SELF_KO_DRAGON_FINISHER');
assert.equal(n,20);
console.log('Fairy Zone no-selfKO priority: '+n+' synthetic contracts passed');
