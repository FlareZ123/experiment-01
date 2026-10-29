'use strict';

const assert=require('node:assert/strict');
const {chooseHeldGuzmaMobility}=
  require('./agent2-held-guzma-mobility-frontier.cjs');

const VERSION='agent43-registered-basic-supply-guzma-research-v1';
const ENERGY_PRINT=/\bEnergy [A-Z0-9]{2,6}(?: \d+)?$/;

/**
 * Verify a registered, complete physical 60 whose printed Energy cards are
 * all ordinary one-unit Basic Energy. An unknown Energy makes this diagnostic
 * unsupported; the caller must not silently assume its type or value.
 *
 * @param {string[]} ownRegistered60 Exact known owner's card printing names.
 * @param {object} catalog Public typed card metadata.
 * @returns {Map<number,number>|null}
 */
function registeredBasicEnergySupply(ownRegistered60,catalog){
  if(!Array.isArray(ownRegistered60)||
     ownRegistered60.length!==60)return null;
  const counts=new Map();
  for(const printing of ownRegistered60){
    if(typeof printing!=='string')return null;
    if(!ENERGY_PRINT.test(printing))continue;
    if(!catalog.basicEnergies.has(printing))return null;
    const name=Object.keys(catalog.basicEnergyTypes).find(
      type=>printing.startsWith(type+' Energy '));
    if(!name)return null;
    const type=catalog.basicEnergyTypes[name];
    counts.set(type,(counts.get(type)??0)+1);
  }
  return counts;
}

/**
 * A strictly conditional upper bound assuming only the registered deck's
 * ordinary Basic Energy can provide printed attack cost colors. It excludes
 * game states with unknown attached Energy and explicitly makes no claim
 * about Abilities, Stadiums, attacks or other alternate cost transformations.
 *
 * @param {object} pokemon Detached public Pokémon, Active or Bench.
 * @param {Map<number,number>} supply 60-card registered Basic Energy counts.
 * @param {object} catalog Typed public energy catalog.
 * @returns {object} No native references; includes excluded printed attacks.
 */
function filterBasicSupplyUnfundableAttacks(pokemon,supply,catalog){
  if(!pokemon)return {pokemon:null,excluded:[]};
  const excluded=[];
  const attacks=(pokemon.attacks??[]).filter(attack=>{
    if(!Array.isArray(attack.cost))return true;
    const required=new Map();
    for(const type of attack.cost){
      if(type===catalog.colorlessEnergyType)continue;
      required.set(type,(required.get(type)??0)+1);
    }
    const missing=[...required.entries()]
      .filter(([type,need])=>(supply.get(type)??0)<need)
      .map(([type,need])=>({type,required:need,
        registeredBasicEnergyCount:supply.get(type)??0}));
    if(!missing.length)return true;
    excluded.push({name:attack.name,missing});
    return false;
  });
  return {pokemon:{...pokemon,attacks},excluded};
}

/**
 * Research-only opt-in extension of the conservative owner Guzma selector.
 * Compares the same original view and native-independent printed cost policy
 * after pruning Basic-Energy-supply-impossible attacks on BOTH Active and Bench.
 * The registered owner 60 is player-known deck construction information, not
 * any hidden opponent zone. The original selector still enforces Supporter,
 * active, Energy, lock, damage and opposing Bench prerequisites.
 *
 * @param {object} view Detached actor-only own hand and public board.
 * @param {object} catalog Public printed card metadata.
 * @param {string[]} ownRegistered60 Own exact printed 60, never opponent's list.
 * @returns {object} Development signal, never a Store legality certificate.
 */
function basicSupplyAwareGuzmaComparison(view,catalog,ownRegistered60){
  assert.equal(view.decisionKind,'owner-root');
  const original=chooseHeldGuzmaMobility(view,catalog);
  const supply=registeredBasicEnergySupply(ownRegistered60,catalog);
  if(!supply)return {version:VERSION,status:'unknown-energy-supply',
    original,adjusted:null,excludedActive:[],excludedBench:[]};
  const slots=[view.ownPublic?.active,
    ...(view.ownPublic?.bench??[])].filter(Boolean);
  if(slots.some(slot=>(slot.energies??[]).some(energy=>
      !catalog.basicEnergies.has(energy)))){
    return {version:VERSION,status:'unknown-attached-energy',
      original,adjusted:null,excludedActive:[],excludedBench:[]};
  }
  const active=filterBasicSupplyUnfundableAttacks(
    view.ownPublic.active,supply,catalog);
  const bench=(view.ownPublic.bench??[]).map(x=>
    filterBasicSupplyUnfundableAttacks(x,supply,catalog));
  const projected={...view,ownPublic:{...view.ownPublic,
    active:active.pokemon,bench:bench.map(x=>x.pokemon)}};
  const adjusted=chooseHeldGuzmaMobility(projected,catalog);
  return {
    version:VERSION,
    status:'basic-only-printed-energy-model',
    supply:[...supply.entries()].map(([type,count])=>({type,count})),
    original,adjusted,excludedActive:active.excluded,
    excludedBench:bench.map((x,index)=>({index,attacks:x.excluded}))
      .filter(x=>x.attacks.length>0),
    competitiveQualified:false
  };
}

module.exports={VERSION,registeredBasicEnergySupply,
  filterBasicSupplyUnfundableAttacks,basicSupplyAwareGuzmaComparison};
