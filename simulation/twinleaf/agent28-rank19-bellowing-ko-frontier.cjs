'use strict';

const assert=require('node:assert/strict');

const VERSION='agent28-rank19-raging-bolt-printed-bellowing-potential-ko-v1';
const PRINTING='Raging Bolt ex TEF';

/**
 * A narrowly scoped owner-information-safe response to an original Aichi
 * rank-19 Raging Bolt root, where generic first-printed-attack priority
 * selects Burst Roar even though Bellowing Thunder may immediately KO.
 *
 * Call only with attack candidates already declared payable by the common
 * chooser's public-cost gate. This returns a potential tactical improvement;
 * native effect prevention, damage reduction, Prize rules, the opportunity
 * cost of discarded Energy and future turns remain outside this model.
 *
 * @param {object} view Authenticated detached actor root observation.
 * @param {object} catalog Public native printed-card catalog.
 * @param {object[]} payable Already-cost-checked printed attacks.
 * @returns {{attackName:string,reason:string,rawDamage:number,
 *   remainingHp:number,availableBasicEnergyCards:number}|null}
 */
function choosePrintedBellowingPotentialKnockout(view,catalog,payable){
  assert.equal(view.decisionKind,'owner-root');
  assert.ok(Array.isArray(payable));
  if(view.ownPublic?.active?.printing!==PRINTING||
      payable.length<2||payable[0].name!=='Burst Roar')return null;
  const attack=payable.find(a=>a.name==='Bellowing Thunder'&&
    a.damage===70&&a.damageCalculation==='x');
  if(!attack)return null;
  const opponent=view.opponentPublic?.active;
  if(!opponent||!Number.isSafeInteger(opponent.hp)||
      !Number.isSafeInteger(opponent.damage))return null;
  const remainingHp=opponent.hp-opponent.damage;
  if(remainingHp<=0)return null;

  // Only physically attached public Basic *cards*, not generated Energy
  // units or Special Energy, may be discarded for Bellowing Thunder.
  // An Energy on a Bench Pokémon is a legal target of this attack.
  const own=view.ownPublic;
  const slots=[own.active,...(own.bench??[])].filter(Boolean);
  const availableBasicEnergyCards=slots.reduce((sum,slot)=>sum+
    (slot.energies??[]).filter(name=>
      catalog.basicEnergies?.has(name)===true).length,0);
  const rawDamage=70*availableBasicEnergyCards;
  if(rawDamage<remainingHp||availableBasicEnergyCards===0)return null;
  return {
    attackName:'Bellowing Thunder',
    reason:'printed Basic-card discard packet crosses public Active HP',
    rawDamage,remainingHp,availableBasicEnergyCards
  };
}

module.exports={VERSION,PRINTING,choosePrintedBellowingPotentialKnockout};
