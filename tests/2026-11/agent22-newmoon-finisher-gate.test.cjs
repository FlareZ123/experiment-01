'use strict';
const assert = require('node:assert/strict');
const {analyzeDusknoirFinisher} =
  require('../../results/als/new-moon-dusknoir-actor-finisher-gate.cjs');
let passed=0;
function base(hp=280,damage=0,prize=2) {
  return {
    own:{prizesRemaining:6,supporterUsed:false,supporterLocked:false,
      aceTrainerInHand:true,gxAttackUsed:false,
      bench:[{printId:'sv6pt5-20',abilityReady:true}]},
    opponent:{prizesRemaining:6,active:{hp,damage,prizeValue:prize}},
    combat:{abilityCanActivate:true,abilityWillPlaceCounters:true,
      reactiveEffectsAccountedFor:true,attackOffers:[
        {name:'Night Watch',projectedDamage:150,legal:true,hasCorrectSource:true,
          gxAllowed:true,source:'Perfection'},
        {name:'Miraculous Duo-GX',projectedDamage:200,legal:true,
          hasCorrectSource:true,gxAllowed:true,source:'printed'}
      ]}
  };
}
function check(s,status,reason) {
  const o=analyzeDusknoirFinisher(s);
  assert.equal(o.status,status);
  if (reason) assert.equal(o.reason,reason);
  passed++;
  return o;
}
let x=check(base(),'candidate');
assert.equal(x.conditionalContinuation[0].name,'Ace Trainer');
assert.equal(x.conditionalContinuation[1].name,'Night Watch');
assert.equal(x.projected.conditionalHandAfterAceAndNightWatchIfThreeDrawn,1);
assert.equal(x.projected.ownPrizesAfterAttack,4);
x=check(base(330,0,3),'candidate');
assert.equal(x.conditionalContinuation[1].name,'Miraculous Duo-GX');
assert.equal(x.projected.ownPrizesAfterAttack,3);
assert.equal(x.projected.conditionalHandAfterAceAndNightWatchIfThreeDrawn,null);
x=base(230,0,2);x.combat.attackOffers[0].legal=false;
x=check(x,'candidate');assert.equal(x.conditionalContinuation[1].name,'Miraculous Duo-GX');
x=base();x.opponent.prizesRemaining=1;check(x,'blocked','SELF_KO_CONCEDES_FINAL_PRIZE');
x=base();x.combat.abilityCanActivate=false;check(x,'blocked','ABILITY_UNAVAILABLE_OR_LOCKED');
x=base();x.combat.abilityWillPlaceCounters=false;check(x,'blocked','ABILITY_COUNTERS_PREVENTED');
x=base();x.own.bench[0].abilityReady=false;check(x,'blocked','NO_READY_BENCHED_DUSKNOIR');
x=base(280,180,2);check(x,'blocked','ABILITY_ALONE_CAN_KO_TARGET');
x=base(280,150,2);check(x,'blocked','ABILITY_ALONE_CAN_KO_TARGET');
x=base(330,0,3);x.own.gxAttackUsed=true;check(x,'blocked','BLAST_PLUS_ATTACK_NOT_LETHAL');
x=base(370,0,3);check(x,'blocked','BLAST_PLUS_ATTACK_NOT_LETHAL');
x=base();x.combat.attackOffers[0].projectedDamage=280;check(x,'blocked','ATTACK_ALONE_ALREADY_KOS');
x=base();x.own.aceTrainerInHand=false;x=check(x,'candidate');
assert.equal(x.conditionalContinuation.length,1);
assert.equal(x.projected.aceTrainerCanFollow,false);
x=base();x.own.supporterUsed=true;x=check(x,'candidate');
assert.equal(x.conditionalContinuation.length,1);
x=base();x.own.supporterLocked=true;x=check(x,'candidate');
assert.equal(x.conditionalContinuation.length,1);
x=base();x.opponent.prizesRemaining=5;x.own.prizesRemaining=4;x=check(x,'candidate');
assert.equal(x.conditionalContinuation.length,1);
x=base();x.combat.reactiveEffectsAccountedFor=false;
check(x,'blocked','UNMODELED_REACTIVE_EFFECT');
x=base();delete x.combat.abilityWillPlaceCounters;
check(x,'unsupported','UNVERIFIED_ACTOR_VISIBLE_FIELDS');
x=base();x.combat.attackOffers[0].legal=false;x.combat.attackOffers[1].legal=false;
check(x,'blocked','NO_CERTIFIED_PAID_ATTACK');
assert.equal(passed,19);
console.log('agent22-newmoon-finisher-gate.test: '+passed+' contract cases passed');
