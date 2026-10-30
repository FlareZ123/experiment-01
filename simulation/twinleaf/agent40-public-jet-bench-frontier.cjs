'use strict';
const assert=require('node:assert/strict');

const VERSION='agent40-public-jet-bench-switch-v1';
const JET='Jet Energy ';

/**
 * A deliberately bounded owner-visible Jet Energy rescue. It proposes the
 * mandatory switch only when the current Active has no known payable attack
 * and a public Benched Pokémon could use a printed, positive-damage attack
 * after receiving the Colorless unit. The real Store alone establishes that
 * the Energy can be attached, that the switch occurs, and that the ensuing
 * attack is legal and useful. Current tactical damage is unmodeled.
 *
 * @param {object} view Detached actorObservation from the real acting seat.
 * @param {object} catalog Public printed card/energy metadata.
 * @param {{payable?:(view:object,catalog:object,pokemon:object,attack:object)=>boolean}} [deps]
 * @returns {object|null} Existing attach-special-energy root intent.
 */
function choosePublicJetBenchSwitch(view,catalog,deps={}){
  assert.equal(view.decisionKind,'owner-root');
  const own=view.ownPublic, quota=view.ownTurnResources;
  if(view.globalTurn<=1||!own?.active||!Array.isArray(own.bench)||
      !Array.isArray(view.ownHand)||
      own.publicTurnRestrictions?.attackLockTurnsRemaining>0||
      own.publicTurnRestrictions?.energyPlayLocked===true||
      own.publicTurnRestrictions?.specialEnergyPlayLocked===true||
      quota?.energyPlayLocked===true||quota?.specialEnergyPlayLocked===true||
      quota?.energyPlayedTurn===view.globalTurn||
      [...(own.stadium??[]),...(view.opponentPublic?.stadium??[])]
        .some(x=>x.startsWith('Temple of Sinnoh ')))return null;
  const handIndex=view.ownHand.findIndex(x=>x.startsWith(JET)&&
    catalog.specialEnergies instanceof Set&&catalog.specialEnergies.has(x));
  if(handIndex<0)return null;
  const payable=deps.payable??
    require('./agent17-public-context-special-energy.cjs')
      .publicSpecialAttackPayable;
  assert.equal(typeof payable,'function');
  const {ASLEEP,PARALYZED}=catalog.specialConditions??{};
  const usable=(pokemon,attack)=>{
    const r=pokemon.publicRestrictions??{};
    return Array.isArray(attack?.cost)&&
      !(attack.gxAttack===true||attack.name?.endsWith('-GX'))&&
      !pokemon.specialConditions?.some(x=>x===ASLEEP||x===PARALYZED)&&
      r.cannotAttackNextTurn!==true&&
      r.blockedAttackNameNextTurn!==attack.name&&
      r.blockedAttackNameUntilLeavesActive!==attack.name&&
      !r.cannotUseAttacksNextTurn?.includes(attack.name)&&
      (!r.onlyAllowedAttackNameNextTurn||
        r.onlyAllowedAttackNameNextTurn===attack.name);
  };
  // Preserve an already payable Active attack, including non-damage lock
  // attacks. Whether to replace it requires stronger tactical comparison.
  if(own.active.attacks?.some(attack=>usable(own.active,attack)&&
      payable(view,catalog,own.active,attack)))return null;
  const jet=view.ownHand[handIndex];
  for(let index=0;index<own.bench.length;index++){
    const target=own.bench[index];
    if(!target||!Array.isArray(target.energies)||
        !Array.isArray(target.attacks))continue;
    const withJet={...target,energies:[...target.energies,jet]};
    const attack=target.attacks.find(a=>
      typeof a.damage==='number'&&a.damage>0&&usable(target,a)&&
      payable(view,catalog,withJet,a));
    if(!attack)continue;
    return {kind:'attach-special-energy',printing:jet,handIndex,
      slot:'bench',index,
      reason:'jet-switch-to-public-payable-printed-damage',
      plannedAttackName:attack.name};
  }
  return null;
}
module.exports={VERSION,choosePublicJetBenchSwitch};
