'use strict';

const assert=require('node:assert/strict');

const VERSION='supplemental-external-mee-basic-energy-public-printings-v1';
const SOURCES=Object.freeze([
  'https://bulbapedia.bulbagarden.net/wiki/MEE_Basic_Energies_(TCG)',
  'https://arcatcg.com/sets/mee'
]);

/*
 * External provenance, deliberately separate from the repository's bundled
 * English card database. Sources independently identify the MEE release
 * as Basic Energy-only, with Grass, Fire, Water, Lightning, Psychic, Fighting,
 * Darkness and Metal printings. Aichi source manifest uses the abbreviated
 * energy name ("Darkness Energy MEE"), whereas external listings prefix
 * "Basic". This permits only public Basic Energy subtype inference.
 */
const TYPES=Object.freeze([
  'Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'
]);

/**
 * Add only the independently corroborated public Basic Energy metadata.
 * Never alter an existing database identity if it conflicts.
 * An extra visible source does not establish exact deck search/Prizes.
 *
 * @param {Map<string,{variants:object[]}>} index Unmodified public index.
 * @returns {Map<string,{variants:object[]}>}
 */
function withVerifiedMEEBasicEnergyPrintings(index){
  assert.ok(index instanceof Map);
  const result=new Map(index);
  for(const type of TYPES){
    const printing=type+' Energy MEE';
    const proposed={variants:[{supertype:'Energy',subtypes:['Basic'],
      hp:null,provenance:'externally-verified-mee-basic-only'}]};
    const prior=result.get(printing);
    assert.ok(!prior||prior.variants?.every(v=>
      v.supertype==='Energy'&&v.subtypes?.includes('Basic')),
    'Conflicting registered MEE public type: refuse external override');
    if(!prior)result.set(printing,proposed);
  }
  return result;
}
module.exports={VERSION,SOURCES,TYPES,withVerifiedMEEBasicEnergyPrintings};
