'use strict';

const assert=require('node:assert/strict');
const {energySupply,evaluateAttachedCost}=
  require('./agent10-conditional-special-energy-cost.cjs');

const VERSION='agent10-original-raichu-electro-rain-energy-count-v1';
const ELECTRO_RAIN_DAMAGE_PER_LIGHTNING_UNIT=30;

/**
 * Exact *printed Energy-unit* contribution to Alolan Raichu UNM 57's Electro
 * Rain optional discard. A card that supplies 3 Lightning units counts as
 * three choices even though it is one physical Energy card. This does not
 * model effects preventing attack damage or native targeting prompts.
 *
 * Japan official TCG Q&A explicitly rules that one Counter Energy discarded
 * while behind in Prizes produces two Electro Rain target selections:
 * https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%82%A2%E3%83%AD%E3%83%BC%E3%83%A9%E3%83%A9%E3%82%A4%E3%83%81%E3%83%A5%E3%82%A6&regulation_faq_main_item1=all
 *
 * @param {string} printing Exact full Energy printing on Raichu.
 * @param {object} context Public Prize/recipient/Temple state.
 * @returns {number|null} Null for unsupported Special printings.
 */
function discardableLightningUnits(printing,context){
  const supply=energySupply(printing,context);
  if(supply===null)return null;
  return supply.allowed==='*'||supply.allowed.includes('Lightning')?
    supply.capacity:0;
}

/**
 * @param {string[]} attached Exact face-up Energy printings on Alolan Raichu.
 * @param {object} context Public target conditions.
 * @param {number[]} [selectedIndices] Energy *cards* chosen to discard;
 *   defaults to all attached cards that currently supply Lightning.
 * @returns {{cardsDiscarded:number,lightningUnitsDiscarded:number,
 *   selectionCount:number,rawDamageCapacity:number,
 *   attackCostPayable:boolean}|null}
 */
function electroRainDiscardCapacity(attached,context,selectedIndices){
  assert.ok(Array.isArray(attached));
  const hasKnownCost=evaluateAttachedCost(['Lightning'],attached,context);
  if(hasKnownCost===null)return null;
  const eligible=attached.map(printing=>discardableLightningUnits(
    printing,context));
  if(eligible.some(units=>units===null))return null;
  const indices=selectedIndices??eligible
    .map((units,i)=>units>0?i:null).filter(index=>index!==null);
  assert.ok(Array.isArray(indices));
  assert.equal(new Set(indices).size,indices.length,
    'The same physical card cannot be discarded twice');
  let total=0;
  for(const index of indices){
    assert.ok(Number.isInteger(index)&&index>=0&&index<attached.length);
    assert.ok(eligible[index]>0,
      'Only Energy currently providing Lightning may be discarded');
    total+=eligible[index];
  }
  return {cardsDiscarded:indices.length,lightningUnitsDiscarded:total,
    selectionCount:total,
    rawDamageCapacity:total*ELECTRO_RAIN_DAMAGE_PER_LIGHTNING_UNIT,
    attackCostPayable:hasKnownCost.payable};
}

/**
 * Source-card upper bound for the TWO original Aichi Raichu/Electrode source
 * lists with four of each of Reversal PAL, Counter CIN and Unit LPM UPR.
 * Optimistically assumes every physical card is available and accelerated,
 * all Reversal/Counter conditions are true, and no other game effect applies.
 * @param {object} context Public favorable/unfavorable state.
 * @param {number} [maxPhysicalCards] Zero-or-greater physical Energy budget.
 * @returns {object}
 */
function sourceRaichuBestEnergyBudget(context,maxPhysicalCards=12){
  assert.ok(Number.isSafeInteger(maxPhysicalCards)&&maxPhysicalCards>=0);
  const originals=[
    ...Array(4).fill('Reversal Energy PAL'),
    ...Array(4).fill('Counter Energy CIN'),
    ...Array(4).fill('Unit Energy LPM UPR')
  ];
  const ordered=originals.map(printing=>({
    printing,units:discardableLightningUnits(printing,context)
  }));
  assert.ok(ordered.every(x=>x.units!==null));
  ordered.sort((a,b)=>b.units-a.units||
    a.printing.localeCompare(b.printing));
  const selected=ordered.filter(x=>x.units>0).slice(0,maxPhysicalCards);
  const total=selected.reduce((sum,x)=>sum+x.units,0);
  return {cardBudget:maxPhysicalCards,chosenCards:selected.length,
    lightningUnits:total,rawDamageCapacity:total*30,
    names:selected.map(x=>x.printing)};
}

module.exports={VERSION,ELECTRO_RAIN_DAMAGE_PER_LIGHTNING_UNIT,
  discardableLightningUnits,electroRainDiscardCapacity,
  sourceRaichuBestEnergyBudget};
