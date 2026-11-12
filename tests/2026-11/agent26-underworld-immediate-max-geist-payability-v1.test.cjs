'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,stadiumAttackCostModifier,chooseUnderworldImmediateMaxGeistPayability}=
 require('../../simulation/twinleaf/2026-11/agent26-underworld-immediate-max-geist-payability-v1.cjs');
const PSY='Psychic Energy SVE';
const C={basicEnergies:new Set([PSY]),colorlessEnergyType:9,
 specialConditions:{ASLEEP:2,PARALYZED:0}};
function view({turn=11,energyCount=0,held=[PSY],ownStadium=[],opponentStadium=[],
 activeRestrictions={},playerRestrictions={},resources={}}={}){
 return {decisionKind:'owner-root',globalTurn:turn,actorSeat:0,ownHand:held,
  ownPublic:{active:{printing:'Shadow Rider Calyrex VMAX CRE',printed:{types:[5]},
   energies:Array(energyCount).fill(PSY),
   attacks:[{name:'Max Geist',cost:[9,9,9],gxAttack:false}],specialConditions:[],
   publicRestrictions:{cannotAttackNextTurn:false,cannotUseAttacksNextTurn:[],
    blockedAttackNameNextTurn:null,blockedAttackNameUntilLeavesActive:null,
    onlyAllowedAttackNameNextTurn:null,attackCostIncreaseNextTurn:0,
    attackCostIncreaseWhileActive:0,...activeRestrictions}},
   bench:[],stadium:ownStadium,
   publicTurnRestrictions:{attackLockTurnsRemaining:0,attackMaxEnergy:null,
    attackMaxEnergyTurnsRemaining:0,ignoreAttackCostCardTypes:[],
    ignoreAttackCostTurnsRemaining:0,...playerRestrictions}},
  opponentPublic:{active:null,bench:[],stadium:opponentStadium},
  ownTurnResources:{energyPlayLocked:false,energyPlayedTurn:0,...resources}};
}
const choose=v=>chooseUnderworldImmediateMaxGeistPayability(v,C);
test('rejects broad v1 false positives when one Energy does not pay the attack',()=>{
 assert.match(VERSION,/immediate-max-geist-payability/);
 assert.equal(choose(view({energyCount:0})),null);
 assert.equal(choose(view({energyCount:1})),null);
});
test('selects only when one held Psychic makes Max Geist payable immediately',()=>{
 const r=choose(view({energyCount:2}));
 assert.equal(r.kind,'attach-basic-energy');assert.equal(r.gapBefore,1);
 assert.equal(r.gapAfter,0);assert.equal(r.effectiveAttackCost,3);
 assert.equal(r.crossesImmediateAttackThreshold,true);
 assert.equal(r.underworldActiveFundingThresholdV2,true);
 assert.equal(r.singleHeldPsychicContestedByUnderworld,true);
});
test('Dimension Valley and Wondrous Labyrinth change the exact threshold',()=>{
 assert.equal(stadiumAttackCostModifier(['Dimension Valley XY4']),-1);
 assert.equal(stadiumAttackCostModifier(['Wondrous Labyrinth ◇ TEU']),1);
 assert.equal(choose(view({energyCount:1,ownStadium:['Dimension Valley XY4']})).effectiveAttackCost,2);
 assert.equal(choose(view({energyCount:2,ownStadium:['Dimension Valley XY4']})),null);
 assert.equal(choose(view({energyCount:3,opponentStadium:['Wondrous Labyrinth ◇ TEU']})).effectiveAttackCost,4);
 assert.equal(choose(view({energyCount:2,opponentStadium:['Wondrous Labyrinth ◇ TEU']})),null);
 assert.equal(stadiumAttackCostModifier(['Dimension Valley XY4','Sky Field ROS']),null);
});
test('slot attack-cost increases are included',()=>{
 assert.equal(choose(view({energyCount:2,activeRestrictions:{attackCostIncreaseNextTurn:1}})),null);
 assert.equal(choose(view({energyCount:3,activeRestrictions:{attackCostIncreaseNextTurn:1}})).effectiveAttackCost,4);
 assert.equal(choose(view({energyCount:3,activeRestrictions:{attackCostIncreaseWhileActive:1}})).effectiveAttackCost,4);
});
test('player-wide attack-cost and energy-count locks are respected',()=>{
 assert.equal(choose(view({energyCount:0,playerRestrictions:{ignoreAttackCostCardTypes:[5],ignoreAttackCostTurnsRemaining:1}})),null);
 assert.equal(choose(view({energyCount:2,playerRestrictions:{attackMaxEnergy:3,attackMaxEnergyTurnsRemaining:1}})),null);
 assert.equal(choose(view({energyCount:2,playerRestrictions:{attackMaxEnergy:2,attackMaxEnergyTurnsRemaining:1}})).effectiveAttackCost,3);
});
test('first-turn, blocked-attack, used-attachment and status states abstain',()=>{
 assert.equal(choose(view({turn:1,energyCount:2})),null);
 assert.equal(choose(view({energyCount:2,activeRestrictions:{cannotUseAttacksNextTurn:['Max Geist']}})),null);
 assert.equal(choose(view({energyCount:2,activeRestrictions:{blockedAttackNameNextTurn:'Max Geist'}})),null);
 assert.equal(choose(view({energyCount:2,resources:{energyPlayedTurn:11}})),null);
 const asleep=view({energyCount:2});asleep.ownPublic.active.specialConditions=[2];
 assert.equal(choose(asleep),null);
});
test('only one genuine held Basic Psychic is diverted; hidden opponent hand is untouched',()=>{
 assert.equal(choose(view({energyCount:2,held:[]})),null);
 assert.equal(choose(view({energyCount:2,held:[PSY,PSY]})),null);
 assert.equal(choose(view({energyCount:2,held:['Mystery Energy PHF']})),null);
 const v=view({energyCount:2});
 Object.defineProperty(v.opponentPublic,'hand',{get(){throw Error('hidden opponent hand read');}});
 assert.ok(choose(v));
});
