'use strict';
const assert=require('node:assert/strict');

const VERSION='agent23-volt-transfer-residual-active-funding-v1';
const ENERGY_UNITS=Object.freeze({
  'Double Colorless Energy':Object.freeze({total:2,lightning:0}),
  'Speed Lightning Energy':Object.freeze({total:1,lightning:1}),
  'Capture Energy':Object.freeze({total:1,lightning:0}),
  'Spiky Energy':Object.freeze({total:1,lightning:0})
});

/**
 * Conditional paper-card cost model for original Aichi rank6 Iron Thorns ex.
 * The original rank6 60 contains only these four Special Energy names.
 * This models the SAME Active Pokémon's next attack with no further actions,
 * after moving exactly one attached physical Energy to the owner's Bench.
 * It says nothing about attack desirability, turn survival, switching,
 * Stadium persistence, other card effects, or a native Store resolution.
 *
 * @param {string[]} attached Printed Energy card names on the Active.
 * @param {number} movedIndex Index of the physical card being transferred.
 * @param {{thunderMountainActive:boolean}} options
 * @returns {object} Residual Energy and conditional Volt Cyclone readiness.
 */
function residualActiveFunding(attached,movedIndex,options){
  assert.ok(Array.isArray(attached));
  assert.ok(Number.isInteger(movedIndex)&&movedIndex>=0&&
    movedIndex<attached.length);
  assert.equal(typeof options?.thunderMountainActive,'boolean');
  for(const name of attached)assert.ok(Object.hasOwn(ENERGY_UNITS,name),
    'Unknown attached Energy: '+name);
  const remaining=attached.filter((_,i)=>i!==movedIndex);
  const totalUnits=remaining.reduce((n,name)=>
    n+ENERGY_UNITS[name].total,0);
  const lightningUnits=remaining.reduce((n,name)=>
    n+ENERGY_UNITS[name].lightning,0);
  // Printed Volt Cyclone: Lightning + Colorless + Colorless.
  // Thunder Mountain Prism Star removes one Lightning requirement.
  const readyWithThunder=totalUnits>=2;
  const readyWithoutThunder=lightningUnits>=1&&totalUnits>=3;
  return {
    transferredName:attached[movedIndex],
    remainingNames:remaining,
    totalUnits,lightningUnits,
    readyWithThunder,readyWithoutThunder,
    nextAttackPayableUnderAssumptions:
      options.thunderMountainActive?readyWithThunder:readyWithoutThunder
  };
}

/**
 * Evaluate every transferable attached card by its physical index. A donor
 * preserving a payable next Active attack ranks ahead of one that strands it.
 * Within that class, preserve attack viability if Thunder is replaced,
 * then keep the most units on Active. Bench recipient value is unmodeled.
 *
 * @param {string[]} attached Original rank6 allowed Energy card names.
 * @param {{thunderMountainActive:boolean}} options
 * @returns {object[]} Highest-priority donor first; ties use input order.
 */
function rankVoltTransferDonors(attached,options){
  assert.ok(Array.isArray(attached));
  return attached.map((_,index)=>({index,
    ...residualActiveFunding(attached,index,options)}))
    .sort((a,b)=>
      Number(b.nextAttackPayableUnderAssumptions)-
        Number(a.nextAttackPayableUnderAssumptions)||
      Number(b.readyWithoutThunder)-Number(a.readyWithoutThunder)||
      b.totalUnits-a.totalUnits||
      b.lightningUnits-a.lightningUnits||
      a.index-b.index);
}

module.exports={VERSION,ENERGY_UNITS,residualActiveFunding,
  rankVoltTransferDonors};
