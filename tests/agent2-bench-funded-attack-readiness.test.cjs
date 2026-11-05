'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {classifyOwnerBenchPrintedAttackReadiness}=require(
 '../simulation/twinleaf/agent2-bench-funded-attack-readiness.cjs');
const P='Psychic Energy MEE';
const catalog={basicEnergies:new Set([P]),
  basicEnergyTypes:{Psychic:5},colorlessEnergyType:9,
  specialConditions:{ASLEEP:1,PARALYZED:2}};
function v(){
 return {actorSeat:0,globalTurn:33,decisionKind:'owner-root',
  ownTurnResources:{retreatedTurn:0},
  ownPublic:{deckCount:10,
   publicTurnRestrictions:{attackLockTurnsRemaining:0},
   active:{printed:{retreatCost:[9,9,9]},energies:[P,P,P],
    tools:[],specialConditions:[],publicRestrictions:{},attacks:[]},
   bench:[{printing:'Example dynamic attacker',energies:[P,P],
    publicRestrictions:{},specialConditions:[],
    attacks:[{name:'Dynamic Test',cost:[5],damage:0,
      damageCalculation:'source-specified-dynamic'}]}]},
  opponentPublic:{deckCount:20,active:{hp:80,damage:0}}};
}
test('funded dynamic attack seen even with no fixed positive base',()=>{
 const a=v(),data=classifyOwnerBenchPrintedAttackReadiness(a,catalog);
 assert.equal(data.anyPrinted,true);
 assert.equal(data.anyNonGx,true);
 assert.equal(data.anyFixedPositive,false);
 assert.equal(data.anyDynamicOrZero,true);
 assert.equal(data.firstFourGatesAndBench,true);
});
test('no unfunded or hidden-zone-dependent attack inferred',()=>{
 const a=v(),b=v();
 a.ownPublic.bench[0].energies=[];
 b.opponentSecret={hand:['secret']};
 assert.equal(classifyOwnerBenchPrintedAttackReadiness(a,catalog).anyPrinted,false);
 assert.deepEqual(classifyOwnerBenchPrintedAttackReadiness(v(),catalog),
  classifyOwnerBenchPrintedAttackReadiness(b,catalog));
});
