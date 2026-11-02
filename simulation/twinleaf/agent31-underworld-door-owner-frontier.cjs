'use strict';

const assert=require('node:assert/strict');

const VERSION='agent31-owner-only-underworld-door-source-root-v1';
const VMAX='Shadow Rider Calyrex VMAX CRE';
const ABILITY='Underworld Door';

/**
 * Plan one Underworld Door root from only the acting owner's detached public
 * field, private own hand, and the two explicitly authenticated used-marker
 * indicators for this owner's already face-up Pokémon.
 *
 * Missing used-marker information must abstain to avoid repeatedly choosing
 * a source whose once-per-turn power is already spent.
 *
 * @param {object} ownerView Actor-observation-contract detached owner root.
 * @param {object} catalog Actor print catalog.
 * @param {{activeUnspent?:boolean,benchUnspent?:boolean[]}} usedMarkerReceipt
 * Owner-only source markers, read at actual native Store boundary.
 * @returns {object|null} Proposed root, subject to all native paper locks.
 */
function chooseUnderworldDoorRoot(ownerView,catalog,usedMarkerReceipt={}){
  assert.equal(ownerView?.decisionKind,'owner-root');
  const own=ownerView.ownPublic;
  const typed=catalog.basicEnergyTypes?.Psychic;
  if(!Number.isInteger(typed))return null;
  const psychicEnergyInHand=ownerView.ownHand.some(printing=>
    catalog.basicEnergies?.has(printing)===true&&
    printing.startsWith('Psychic Energy '));
  if(!psychicEnergyInHand)return null;
  const targets=own.bench
    .map((slot,index)=>({
      slot,index
    })).filter(({slot})=>
      slot?.printed?.types?.includes(typed));
  if(targets.length===0)return null;
  const sources=[
    ...(own.active?[
      {slot:own.active,position:'active',benchIndex:null,
        unspent:usedMarkerReceipt.activeUnspent}
    ]:[]),
    ...own.bench.map((slot,index)=>({
      slot,position:'bench',benchIndex:index,
      unspent:usedMarkerReceipt.benchUnspent?.[index]
    }))
  ].filter(x=>
    x.slot?.printing===VMAX&&
    x.slot.abilities?.includes(ABILITY)&&x.unspent===true);
  if(sources.length===0)return null;
  // Prefer a protected Benched source; the native Store still decides
  // whether the chosen source is protected from any actual Ability lock.
  const source=sources.find(x=>x.position==='bench')??sources[0];
  // A recipient is selected only after native AttachEnergyPrompt options
  // are presented and validated; this is a source root, not a hidden
  // premature target choice.
  return {
    kind:'use-underworld-door',
    abilityName:ABILITY,
    sourcePrinting:VMAX,
    position:source.position,
    benchIndex:source.benchIndex,
    printedPsychicTargetIndices:targets.map(x=>x.index),
    sourceMarkerVerifiedUnspent:true,
    ownerHandPsychicAvailable:true,
    nativeEffectAndLocksVerified:false
  };
}

/**
 * Construct a native used-marker receipt while disclosing only the owner's
 * already face-up source positions to the pure chooser.
 * This boundary is observational, not a reducer or eligibility verdict.
 *
 * @param {object} owner Genuine current acting player's own State entry.
 * @returns {{activeUnspent:boolean,benchUnspent:boolean[]}}
 */
function ownerUnderworldMarkerReceipt(owner){
  const unspent=slot=>{
    const pokemon=slot?.getPokemonCard?.();
    return pokemon?.fullName===VMAX&&
      pokemon.powers?.some(power=>power.name===ABILITY)===true&&
      !owner.marker.hasMarker('UNDERWORLD_DOOR_MARKER',pokemon);
  };
  return {
    activeUnspent:unspent(owner.active),
    benchUnspent:owner.bench.map(unspent)
  };
}

module.exports={
  VERSION,chooseUnderworldDoorRoot,ownerUnderworldMarkerReceipt
};
