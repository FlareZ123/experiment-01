'use strict';
const assert=require('node:assert/strict');
const VERSION='agent26-underworld-immediate-max-geist-payability-v1';
const VMAX='Shadow Rider Calyrex VMAX CRE';
const ATTACK='Max Geist';
const PSYCHIC_PREFIX='Psychic Energy ';
/** @param {string[]} stadiums @returns {number|null} */
function stadiumAttackCostModifier(stadiums){
  if(!Array.isArray(stadiums)||stadiums.length>1)return null;
  const name=stadiums[0]??'';
  if(name==='Dimension Valley'||name.startsWith('Dimension Valley '))return -1;
  if(name==='Wondrous Labyrinth'||name.startsWith('Wondrous Labyrinth '))return 1;
  // Pokémon League Headquarters taxes Basic Pokémon, not a VMAX.
  // Nighttime Mine taxes Tera Pokémon, not Shadow Rider Calyrex VMAX.
  return 0;
}
/**
 * A narrow replacement for the broad v1 manual-Active-priority proposal.
 * It diverts the one held Psychic contested with Underworld Door only when
 * that attachment changes the Active Shadow Rider VMAX from unable to use
 * printed Max Geist to able to use it this turn.
 *
 * Inputs are limited to the actor's hand, public boards, and public/current
 * turn restrictions. The native Store remains the final legality authority.
 * The caller must invoke this only after its genuine Underworld Door source
 * and Benched Psychic recipient have been authenticated.
 *
 * @param {object} view Detached authentic acting-owner root observation.
 * @param {object} catalog Public printed card catalog and native type enums.
 * @returns {object|null} Typed manual attachment proposal or abstention.
 */
function chooseUnderworldImmediateMaxGeistPayability(view,catalog){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic,resources=view.ownTurnResources,active=own?.active;
  const colorless=catalog.colorlessEnergyType;
  if(active?.printing!==VMAX||!resources||
      !Number.isSafeInteger(view.globalTurn)||view.globalTurn<=1||
      !Number.isInteger(colorless)||!Array.isArray(active.printed?.types)||
      resources.energyPlayLocked===true||
      resources.energyPlayedTurn===view.globalTurn)return null;
  const playerRestrictions=own.publicTurnRestrictions??{};
  if(playerRestrictions.attackLockTurnsRemaining>0)return null;
  const activeRestrictions=active.publicRestrictions??{};
  if(activeRestrictions.cannotAttackNextTurn===true||
      (active.specialConditions??[]).some(s=>
        s===catalog.specialConditions?.ASLEEP||
        s===catalog.specialConditions?.PARALYZED))return null;
  const prohibited=activeRestrictions.cannotUseAttacksNextTurn??[];
  if(prohibited.includes(ATTACK)||
      activeRestrictions.blockedAttackNameNextTurn===ATTACK||
      activeRestrictions.blockedAttackNameUntilLeavesActive===ATTACK||
      (activeRestrictions.onlyAllowedAttackNameNextTurn!==null&&
       activeRestrictions.onlyAllowedAttackNameNextTurn!==undefined&&
       activeRestrictions.onlyAllowedAttackNameNextTurn!==ATTACK))return null;
  const maxGeist=active.attacks?.find(a=>a.name===ATTACK&&a.gxAttack!==true&&
    Array.isArray(a.cost)&&a.cost.length===3&&a.cost.every(unit=>unit===colorless));
  if(!maxGeist||!Array.isArray(active.energies)||
      !active.energies.every(p=>catalog.basicEnergies?.has(p)===true&&
        p.startsWith(PSYCHIC_PREFIX)))return null;
  const held=view.ownHand.flatMap((printing,handIndex)=>
    catalog.basicEnergies?.has(printing)===true&&printing.startsWith(PSYCHIC_PREFIX)?
      [{handIndex,printing}]:[]);
  if(held.length!==1)return null;
  const stadiums=[...(own.stadium??[]),...(view.opponentPublic?.stadium??[])];
  const stadiumModifier=stadiumAttackCostModifier(stadiums);
  if(stadiumModifier===null)return null;
  const attackCostIncreaseNextTurn=activeRestrictions.attackCostIncreaseNextTurn??0;
  const attackCostIncreaseWhileActive=activeRestrictions.attackCostIncreaseWhileActive??0;
  if(!Number.isSafeInteger(attackCostIncreaseNextTurn)||
      !Number.isSafeInteger(attackCostIncreaseWhileActive))return null;
  const ignoreTypes=playerRestrictions.ignoreAttackCostCardTypes??[];
  if(playerRestrictions.ignoreAttackCostTurnsRemaining>0&&
      ignoreTypes.some(type=>active.printed.types.includes(type)))return null;
  const effectiveCost=3+stadiumModifier+
    attackCostIncreaseNextTurn+attackCostIncreaseWhileActive;
  if(!Number.isSafeInteger(effectiveCost)||effectiveCost<=0)return null;
  const before=active.energies.length,after=before+1;
  if(before>=effectiveCost||after!==effectiveCost)return null;
  const maxEnergy=playerRestrictions.attackMaxEnergy;
  const maxEnergyTurns=playerRestrictions.attackMaxEnergyTurnsRemaining??0;
  if(Number.isSafeInteger(maxEnergy)&&maxEnergyTurns>0&&after<=maxEnergy)return null;
  return {
    kind:'attach-basic-energy',handIndex:held[0].handIndex,
    printing:held[0].printing,slot:'active',index:0,attackName:ATTACK,
    gapBefore:effectiveCost-before,gapAfter:effectiveCost-after,
    effectiveAttackCost:effectiveCost,printedAttackCost:3,
    stadiumAttackCostModifier:stadiumModifier,
    attackCostIncreaseNextTurn,attackCostIncreaseWhileActive,
    crossesImmediateAttackThreshold:true,underworldActiveFundingThresholdV2:true,
    singleHeldPsychicContestedByUnderworld:true,sourceAbility:'Underworld Door',
    source:VERSION,printedTarget:VMAX,paperPhysicalEffectUnconfirmed:true
  };
}
module.exports={VERSION,stadiumAttackCostModifier,chooseUnderworldImmediateMaxGeistPayability};
