'use strict';

const assert=require('node:assert/strict');

const VERSION='agent10-conditional-multitype-energy-cost-v1';
const BASIC_TYPES=Object.freeze(['Grass','Fire','Water','Lightning','Psychic',
  'Fighting','Darkness','Metal','Fairy']);
const EVERY_TYPE='*';

/**
 * One physically attached Energy card's possible one-unit contributions.
 * A multi-unit wildcard can pay several differently colored symbols.
 *
 * Important: this is an attack-cost representation only. Attachment legality,
 * Pokemon powers, Special Energy effects, Item locks and energy discards remain
 * the native Store's responsibilities.
 *
 * @typedef {{capacity:number,allowed:'*'|string[],printing:string}} EnergySupply
 * @typedef {{
 *   ownerPrizes:number,opponentPrizes:number,
 *   isEvolution:boolean,hasRuleBox:boolean,
 *   isPokemonGX:boolean,isPokemonEX:boolean,
 *   templeOfSinnoh:boolean
 * }} EnergyContext
 */

/**
 * @param {string} printing Native full printed Energy identifier.
 * @param {EnergyContext} state Owner-visible public board context.
 * @returns {EnergySupply|null} Null is unsupported and must fail closed.
 */
function energySupply(printing,state){
  assert.equal(typeof printing,'string');
  assert.ok(Number.isInteger(state.ownerPrizes)&&state.ownerPrizes>=0);
  assert.ok(Number.isInteger(state.opponentPrizes)&&state.opponentPrizes>=0);
  for(const flag of ['isEvolution','hasRuleBox','isPokemonGX',
    'isPokemonEX','templeOfSinnoh'])assert.equal(typeof state[flag],'boolean');
  const basic=BASIC_TYPES.find(type=>printing.startsWith(type+' Energy '));
  if(basic)return {capacity:1,allowed:[basic],printing};
  const temple=state.templeOfSinnoh;
  const behind=state.ownerPrizes>state.opponentPrizes;
  if(printing==='Reversal Energy PAL'){
    const works=behind&&state.isEvolution&&!state.hasRuleBox;
    return {capacity:temple?1:(works?3:1),
      allowed:temple||!works?['Colorless']:EVERY_TYPE,printing};
  }
  if(printing==='Counter Energy CIN'){
    const works=behind&&!state.isPokemonGX&&!state.isPokemonEX;
    return {capacity:temple?1:(works?2:1),
      allowed:temple||!works?['Colorless']:EVERY_TYPE,printing};
  }
  if(printing==='Unit Energy LPM UPR'){
    return {capacity:1,allowed:temple?['Colorless']:
      ['Lightning','Psychic','Metal'],printing};
  }
  if(printing==='Double Colorless Energy SUM'){
    return {capacity:temple?1:2,allowed:['Colorless'],printing};
  }
  if(printing==='Speed Lightning Energy RCL'){
    return {capacity:1,allowed:[temple?'Colorless':'Lightning'],printing};
  }
  if(printing==='Capture Energy RCL'||printing==='Spiky Energy JTG'){
    return {capacity:1,allowed:['Colorless'],printing};
  }
  if(printing==='Telepath [P] Energy M3'){
    return {capacity:1,allowed:[temple?'Colorless':'Psychic'],printing};
  }
  return null;
}

/**
 * Compute maximum matching between colored cost symbols and physical Energy
 * unit slots. Each unit may be allocated once, even if it can supply several
 * alternative types. Colorless attack costs can use any surplus unit.
 *
 * @param {string[]} cost Printed attack cost as type names.
 * @param {EnergySupply[]} supplies Exact attached physical cards.
 * @returns {{payable:boolean,coveredColored:number,
 *   neededColored:number,totalEnergyUnits:number,missingIdealUnits:number}}
 */
function matchAttackCost(cost,supplies){
  assert.ok(Array.isArray(cost)&&Array.isArray(supplies));
  for(const type of cost)assert.ok(type==='Colorless'||BASIC_TYPES.includes(type),
    'Unknown printed attack Energy type: '+type);
  const slots=[];
  for(const supply of supplies){
    assert.ok(Number.isSafeInteger(supply.capacity)&&supply.capacity>0);
    assert.ok(supply.allowed===EVERY_TYPE||Array.isArray(supply.allowed));
    for(let i=0;i<supply.capacity;i++)slots.push(supply.allowed);
  }
  const required=cost.filter(type=>type!=='Colorless');
  const assignment=Array(slots.length).fill(-1);
  const matches=(requirement,visited)=>{
    for(let index=0;index<slots.length;index++){
      const allowed=slots[index];
      if(visited[index]||!(allowed===EVERY_TYPE||
           allowed.includes(required[requirement])))continue;
      visited[index]=true;
      if(assignment[index]<0||matches(assignment[index],visited)){
        assignment[index]=requirement;
        return true;
      }
    }
    return false;
  };
  let coveredColored=0;
  for(let index=0;index<required.length;index++)
    if(matches(index,Array(slots.length).fill(false)))coveredColored++;
  const missingColored=required.length-coveredColored;
  const missingIdealUnits=Math.max(missingColored,cost.length-slots.length,0);
  return {payable:missingIdealUnits===0,coveredColored,
    neededColored:required.length,totalEnergyUnits:slots.length,
    missingIdealUnits};
}

/**
 * Evaluates actual printed energy units for one target and attached cards.
 * Null means that at least one attached Energy is not yet modelled, so the
 * result must never be interpreted as a legal attack.
 *
 * @param {string[]} cost Printed attack cost names.
 * @param {string[]} attached Exact full Energy printings.
 * @param {EnergyContext} context Owner-visible Prize and recipient attributes.
 * @returns {(ReturnType<typeof matchAttackCost> & {supplies:EnergySupply[]})|null}
 */
function evaluateAttachedCost(cost,attached,context){
  assert.ok(Array.isArray(attached));
  const supplies=attached.map(printing=>energySupply(printing,context));
  if(supplies.some(supply=>supply===null))return null;
  return {...matchAttackCost(cost,supplies),supplies};
}

module.exports={VERSION,BASIC_TYPES,EVERY_TYPE,energySupply,
  matchAttackCost,evaluateAttachedCost};
