'use strict';

/**
 * Source-only paper setup calculation, not an attachment or game certificate.
 * Optional source mulligan draws are assumed to be taken in full.
 */
const VERSION='agent32-bilateral-source-special-energy-exposure-v1';

const SPECIAL_ONLY_ORIGINALS=Object.freeze([
  {rank:4,basicPokemon:13,specialEnergy:12},
  {rank:5,basicPokemon:11,specialEnergy:4},
  {rank:6,basicPokemon:4,specialEnergy:8},
  {rank:7,basicPokemon:12,specialEnergy:4},
  {rank:17,basicPokemon:13,specialEnergy:12},
  {rank:24,basicPokemon:4,specialEnergy:8},
  {rank:29,basicPokemon:4,specialEnergy:8}
]);

/**
 * @param {number} n
 * @param {number} k
 * @returns {number}
 */
function choose(n,k){
  if(k<0||k>n)return 0;
  let out=1;
  for(let i=1;i<=Math.min(k,n-k);i++)out=out*(n-i+1)/i;
  return Math.round(out);
}

/**
 * Conditional no-Energy probability after the accepted seven-card hand.
 * The six randomly assigned Prizes leave the marginal draw distribution
 * unchanged when their identities are not conditioned upon.
 * @param {number} energy Source special-Energy copies.
 * @param {number} draws Optional bonus draws and ordinary first-turn draw.
 * @returns {number}
 */
function noEnergyAdditionalDraws(energy,draws){
  if(draws>53-energy)return 0;
  let probability=1;
  for(let i=0;i<draws;i++)probability*=(53-energy-i)/(53-i);
  return probability;
}

/**
 * Conditional exact bilateral mulligan calculation, with a negligible
 * formally bounded tail for physically impossible 47+ bonus offers.
 * Neither side's decisions or opponent effects are simulated.
 *
 * @param {{sourceBasics:number,sourceSpecialEnergy:number,
 *   contenderBasics:number,ordinaryDraw?:0|1}} config
 * @returns {object}
 */
function sourceSpecialEnergyExposure(config){
  const {sourceBasics,sourceSpecialEnergy,contenderBasics,
    ordinaryDraw=0}=config;
  for(const n of [sourceBasics,sourceSpecialEnergy,contenderBasics]){
    if(!Number.isSafeInteger(n)||n<1||n>60)
      throw new RangeError('Card counts must be integers from 1 to 60');
  }
  if(sourceBasics+sourceSpecialEnergy>60)
    throw new RangeError('Source Basics and Energy are disjoint physical cards');
  if(ordinaryDraw!==0&&ordinaryDraw!==1)
    throw new RangeError('The model admits zero or one ordinary first-turn draw');

  const total=choose(60,7);
  const qs=choose(60-sourceBasics,7)/total;
  const qc=choose(60-contenderBasics,7)/total;
  const validSource=total-choose(60-sourceBasics,7);
  const noEnergySeven=choose(60-sourceSpecialEnergy,7)-
    choose(60-sourceSpecialEnergy-sourceBasics,7);
  const noEnergyGivenValidSeven=noEnergySeven/validSource;
  const probabilityBonusAtLeastOne=qc*(1-qs)/(1-qs*qc);
  const expectedBonusOffers=probabilityBonusAtLeastOne/(1-qc);

  let noEnergyMass=(1-probabilityBonusAtLeastOne)*
    noEnergyAdditionalDraws(sourceSpecialEnergy,ordinaryDraw);
  for(let bonus=1;bonus<=46;bonus++){
    const pm=probabilityBonusAtLeastOne*(1-qc)*qc**(bonus-1);
    noEnergyMass+=pm*noEnergyAdditionalDraws(
      sourceSpecialEnergy,bonus+ordinaryDraw);
  }
  noEnergyMass*=noEnergyGivenValidSeven;
  const censoredTailUpper=probabilityBonusAtLeastOne*qc**46;
  return {
    version:VERSION,
    sourceBasics,sourceSpecialEnergy,contenderBasics,ordinaryDraw,
    probabilitySourceMulligan:qs,probabilityContenderMulligan:qc,
    probabilityBonusAtLeastOne,expectedBonusOffers,
    energyAccessLower:1-noEnergyMass-censoredTailUpper,
    energyAccessUpper:1-noEnergyMass,censoredTailUpper
  };
}

module.exports={VERSION,SPECIAL_ONLY_ORIGINALS,choose,
  noEnergyAdditionalDraws,sourceSpecialEnergyExposure};
