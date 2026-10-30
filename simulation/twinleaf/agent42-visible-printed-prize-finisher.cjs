'use strict';

const assert=require('node:assert/strict');
const {visiblePrintedProfile}=
  require('./agent10-original-printing-energy-flags.cjs');

const VERSION='agent42-visible-printed-prize-finisher-v1';

/**
 * Owner-observation-only warning: an already selected fixed-damage attack
 * might take the final 1, 2 or 3 Prize cards from the currently Active
 * opponent. Never inspect hidden opponent state, assume the target can be
 * Knocked Out, or assert that this action is the best available action.
 *
 * @param {object} view Authenticated detached owner actor observation.
 * @param {{kind:string,attackName?:string}} first Selected payable root.
 * @param {object} catalog Canonical public printed-card profile index.
 * @returns {{protect:boolean,reason:string,award?:number,
 *   opponentPrinting?:string,printedDamage?:number,
 *   opponentRemainingHp?:number}}
 */
function potentialPrintedPrizeFinisher(view,first,catalog){
  assert.equal(view.decisionKind,'owner-root');
  if(first?.kind!=='attack')
    return {protect:false,reason:'not-attack-root'};
  const own=view.ownPublic;
  const remaining=own?.prizeCount;
  if(!Number.isInteger(remaining)||remaining<1)
    return {protect:false,reason:'unknown-or-terminal-owner-prizes'};
  const target=view.opponentPublic?.active;
  const printing=target?.printing;
  const index=catalog?.publicPokemonProfileIndex;
  if(!(index instanceof Map)||typeof printing!=='string')
    return {protect:false,reason:'unknown-public-prize-profile'};
  const profile=visiblePrintedProfile(index,printing);
  const award=profile?.prizesOnKnockout;
  if(!Number.isInteger(award)||award<1||award>3)
    return {protect:false,reason:'unknown-printed-knockout-award'};
  if(remaining>award)
    return {protect:false,reason:'printed-award-not-yet-terminal'};
  if(target.energies?.some(e=>e.startsWith('Legacy Energy '))||
     target.tools?.some(t=>t.startsWith('Life Dew ')))
    return {protect:false,reason:'visible-prize-reduction-unmodeled'};
  const attack=own.active?.attacks?.find(a=>a.name===first.attackName);
  const hp=target.hp-target.damage;
  if(!attack||!Number.isSafeInteger(attack.damage)||
     attack.damageCalculation!==undefined&&attack.damageCalculation!==null||
     !Number.isSafeInteger(hp)||hp<=0||attack.damage<hp)
    return {protect:false,reason:'unverified-fixed-damage-threshold'};
  return {protect:true,reason:'potential-printed-prize-finishing-attack',
    award,opponentPrinting:printing,printedDamage:attack.damage,
    opponentRemainingHp:hp};
}

module.exports={VERSION,potentialPrintedPrizeFinisher};
