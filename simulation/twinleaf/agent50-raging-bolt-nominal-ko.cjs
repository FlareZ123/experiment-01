'use strict';
const assert=require('node:assert/strict');

const VERSION='agent50-raging-bolt-public-basic-energy-nominal-ko-v1';
const NOMINAL_DAMAGE_PER_BASIC=70;

/**
 * Identify a printing-locked, owner-visible potential Bellowing Thunder KO.
 * Card text permits discarding Basic Energy cards from ANY of our Pokémon.
 * Special Energy cards (including Double Dragon Energy) cannot supply the
 * 70-damage increments. No opponent hand, Prize, or hidden deck is examined.
 *
 * A nominal threshold is NOT a native or paper KO guarantee: effects, HP
 * modifiers, Weakness/Resistance, prompt choices, and changing game state
 * must still be resolved. This is a default-off decision hypothesis.
 *
 * @param {object} view Detached authenticated actor root observation.
 * @param {object[]} payable Native-cost-filtered printed attacks.
 * @param {{basicEnergies:Set<string>}} catalog Public printed-energy types.
 * @returns {{attackName:string,requiredBasic:number,availableBasic:number,
 *   nominalDamage:number,reason:string}|null}
 */
function chooseRagingBoltNominalKo(view,payable,catalog){
  assert.equal(view.decisionKind,'owner-root');
  assert.ok(Array.isArray(payable));
  assert.ok(catalog.basicEnergies instanceof Set);
  const own=view.ownPublic,active=own?.active;
  const defender=view.opponentPublic?.active;
  if(active?.printing!=='Raging Bolt ex TEF'||!defender||
     payable[0]?.name!=='Burst Roar'||payable.length<2||
     !Number.isSafeInteger(defender.hp)||defender.hp<=0||
     !Number.isSafeInteger(defender.damage)||defender.damage<0)return null;
  const thunder=payable.find(attack=>attack.name==='Bellowing Thunder');
  if(!thunder)return null;
  const remaining=defender.hp-defender.damage;
  if(remaining<=0)return null;
  const slots=[active,...(own.bench??[])].filter(Boolean);
  if(!slots.every(slot=>Array.isArray(slot.energies)))return null;
  const availableBasic=slots.reduce((count,slot)=>
    count+slot.energies.filter(name=>catalog.basicEnergies.has(name)).length,0);
  const requiredBasic=Math.ceil(remaining/NOMINAL_DAMAGE_PER_BASIC);
  if(requiredBasic>availableBasic)return null;
  return {
    attackName:'Bellowing Thunder',requiredBasic,availableBasic,
    nominalDamage:requiredBasic*NOMINAL_DAMAGE_PER_BASIC,
    reason:'Public Basic Energy cards cover the printed nominal KO threshold'
  };
}

module.exports={VERSION,NOMINAL_DAMAGE_PER_BASIC,chooseRagingBoltNominalKo};
