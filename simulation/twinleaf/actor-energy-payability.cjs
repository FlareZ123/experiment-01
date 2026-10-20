'use strict';

const assert=require('node:assert/strict');
const TYPES=Object.freeze(['G','R','W','L','P','F','D','M','Y','C']);
const BASIC=Object.freeze({Grass:'G',Fire:'R',Water:'W',Lightning:'L',Psychic:'P',Fighting:'F',Darkness:'D',Metal:'M',Fairy:'Y'});
const ANY=TYPES;
const UNIT_SETS=Object.freeze({
  'Unit Energy GrassFireWater':['G','R','W'],
  'Unit Energy LightningPsychicMetal':['L','P','M'],
  'Unit Energy FightingDarknessFairy':['F','D','Y']
});
/** @param {string} printing @param {string} name @returns {boolean} */
const named=(printing,name)=>printing.startsWith(name+' ');

/**
 * Expand a documented Energy printing into independently selectable Energy
 * units. Each unit is an array of types it could pay; C means only Colorless.
 * Return null for unsupported cards, so a caller cannot mistake omitted rules
 * for a positive or negative proof. This models printed attachment values,
 * excluding global cost modifiers, special-condition locks and suppressed text.
 * @param {string} printing Full engine printing.
 * @param {{isBasic:boolean,isEvolution:boolean,isDragon:boolean,
 *   hasRuleBox:boolean,behindOnPrizes:boolean}} context Public board/Prize facts.
 * @returns {string[][]|null}
 */
function energyUnits(printing,context){
  assert.equal(typeof printing,'string');
  for(const [name,symbol] of Object.entries(BASIC)){
    if(named(printing,name+' Energy'))return [[symbol]];
  }
  if(named(printing,'Double Colorless Energy'))return [['C'],['C']];
  if(named(printing,'Double Dragon Energy'))return context.isDragon?[ANY,ANY]:null;
  if(named(printing,'Prism Energy'))return [context.isBasic?ANY:['C']];
  if(named(printing,'Aurora Energy')||named(printing,'Rainbow Energy')||
     named(printing,'Legacy Energy'))return [ANY];
  if(named(printing,'Reversal Energy'))return context.isEvolution&&
      !context.hasRuleBox&&context.behindOnPrizes?[ANY,ANY,ANY]:[['C']];
  if(named(printing,'Ignition Energy'))return context.isEvolution?
    [['C'],['C'],['C']]:[['C']];
  for(const [name,types] of Object.entries(UNIT_SETS)){
    if(named(printing,name))return [types];
  }
  return null;
}

/**
 * Exact matching of required colored symbols against distinct physical Energy
 * units. All unused units can pay remaining Colorless symbols, including units
 * with a fixed colored type. Enumerating flexible units avoids greedy mistakes.
 * @param {string[]} cost Printed cost symbols, including C.
 * @param {string[][]} units One independently usable unit per array entry.
 * @returns {boolean}
 */
function canPaySymbols(cost,units){
  assert.ok(Array.isArray(cost)&&Array.isArray(units));
  assert.ok(cost.every(s=>TYPES.includes(s)));
  assert.ok(units.every(u=>Array.isArray(u)&&u.length>0&&
    u.every(s=>TYPES.includes(s))));
  if(units.length<cost.length)return false;
  const required=cost.filter(s=>s!=='C');
  required.sort((a,b)=>
    units.filter(u=>u.includes(a)).length-units.filter(u=>u.includes(b)).length);
  const used=new Set();
  function match(index){
    if(index===required.length)return true;
    for(let i=0;i<units.length;i++){
      if(used.has(i)||!units[i].includes(required[index]))continue;
      used.add(i);
      if(match(index+1))return true;
      used.delete(i);
    }
    return false;
  }
  return match(0);
}

/**
 * Conservative tri-state readiness for an already-attached Energy inventory.
 * True only establishes sufficient printed Energy under supplied public facts;
 * actual attack permission belongs to the live engine after all effects.
 * @param {string[]} cost Printed attack cost.
 * @param {string[]} printings Attached Energy printing names.
 * @param {object} context Public context for conditional Special Energy.
 * @returns {{payable:boolean|null,unknownPrintings:string[],
 *   modeledUnits:number,scope:string}}
 */
function printedEnergyPayability(cost,printings,context){
  assert.ok(Array.isArray(printings));
  const units=[],unknownPrintings=[];
  for(const printing of printings){
    const resolved=energyUnits(printing,context);
    if(resolved===null)unknownPrintings.push(printing);
    else units.push(...resolved);
  }
  const knownEnough=canPaySymbols(cost,units);
  return {
    payable:knownEnough?true:unknownPrintings.length?null:false,
    unknownPrintings,modeledUnits:units.length,
    scope:'Printed attached Energy only; live Store must check effects and attack legality'
  };
}

module.exports={TYPES,energyUnits,canPaySymbols,printedEnergyPayability};
