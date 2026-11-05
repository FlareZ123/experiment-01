'use strict';
const assert=require('node:assert/strict');
const {paysWithBasics}=
  require('./agent7-actor-free-retreat-frontier.cjs');
const VERSION='agent6-owner-only-printed-three-basic-reserve-recipient-v1';

/**
 * Select a funded Bench attacker from the actor's own public observation.
 * @param {object} view Detached owner-only observation.
 * @param {object} catalog Public printed card metadata.
 * @returns {object|null}
 */
function fundedBenchAttack(view,catalog){
  for(const [benchIndex,slot] of (view.ownPublic?.bench??[]).entries()){
    if(!slot||!Array.isArray(slot.energies)||
       slot.publicRestrictions?.cannotAttackNextTurn===true||
       slot.specialConditions?.some(s=>
         s===catalog.specialConditions?.ASLEEP||
         s===catalog.specialConditions?.PARALYZED))continue;
    for(const move of slot.attacks??[]){
      if(move.gxAttack===true||
         !Number.isSafeInteger(move.damage)||move.damage<=0||
         move.damageCalculation!==undefined&&
           move.damageCalculation!==null||
         slot.publicRestrictions?.blockedAttackNameNextTurn===move.name||
         slot.publicRestrictions?.blockedAttackNameUntilLeavesActive===
           move.name||
         slot.publicRestrictions?.cannotUseAttacksNextTurn?.includes(
           move.name)||
         slot.publicRestrictions?.onlyAllowedAttackNameNextTurn&&
           slot.publicRestrictions.onlyAllowedAttackNameNextTurn!==
             move.name||
         !paysWithBasics(slot,move,catalog))continue;
      return {benchIndex,pokemonPrinting:slot.printing,
        attackName:move.name,baseDamage:move.damage};
    }
  }
  return null;
}

/**
 * Public printed paid retreat conditions with 2 or 3 Basic attached.
 * Native effective fee is separately checked before a typed RetreatAction.
 */
function paidRetreatPublic(view,catalog,attachedBasics){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic,active=own?.active,r=view.ownTurnResources;
  const printed=active?.printed?.retreatCost;
  if(view.globalTurn<=1||!active||
     !Number.isSafeInteger(r?.retreatedTurn)||
     r.retreatedTurn===view.globalTurn||
     (own.publicTurnRestrictions?.attackLockTurnsRemaining??0)>0||
     active.publicRestrictions?.cannotRetreatNextTurn===true||
     active.publicRestrictions?.cannotRetreatWhileActive===true||
     active.specialConditions?.some(s=>
       s===catalog.specialConditions?.ASLEEP||
       s===catalog.specialConditions?.PARALYZED)||
     !Number.isSafeInteger(catalog.colorlessEnergyType)||
     !Array.isArray(printed)||printed.length!==3||
     !printed.every(e=>e===catalog.colorlessEnergyType)||
     (active.tools?.length??0)>0||
     !Array.isArray(active.energies)||
     active.energies.length!==attachedBasics||
     !active.energies.every(p=>catalog.basicEnergies.has(p))||
     own.bench?.some(slot=>slot?.abilities?.includes('Skyliner'))||
     active.abilities?.includes('Skyliner'))
    return null;
  if((active.attacks??[]).some(move=>
    move.gxAttack!==true&&
    Number.isSafeInteger(move.damage)&&move.damage>0&&
    paysWithBasics(active,move,catalog)))return null;
  const funded=fundedBenchAttack(view,catalog);
  if(!funded)return null;
  return {actorSeat:view.actorSeat,globalTurn:view.globalTurn,
    activePrinting:active.printing,fundedBench:funded};
}

/**
 * Alter only the destination of an already selected held Basic.
 * All other owner decisions, card choices and original recipient geometry
 * are preserved.
 */
function chooseReserveRecipient(view,catalog,original){
  if(original?.slot!=='bench'||
     !Number.isSafeInteger(original.handIndex)||
     !catalog.basicEnergies.has(original.printing)||
     view.ownHand?.[original.handIndex]!==original.printing||
     view.ownTurnResources?.energyPlayLocked===true||
     view.ownTurnResources?.energyPlayedTurn===view.globalTurn||
     !paidRetreatPublic(view,catalog,2))return original;
  return {...original,slot:'active',index:0,
    originalBenchIndex:original.index,
    attackName:null,gapBefore:null,gapAfter:null,
    reserveOpportunity:true};
}

/**
 * Default-off synchronous reversible selection hook. Original card index
 * and Store action type are unchanged. Both seats use identical code.
 * @template T
 * @param {()=>T} execute Original native game.
 */
function withPaidReserveRecipient(execute){
  assert.equal(typeof execute,'function');
  const mod=require('./agent44-actor-energy-recipient.cjs');
  const old=mod.chooseActorEnergyRecipient;
  const audit={version:VERSION,originalCalls:0,
    proposedBySeat:[0,0],proposals:[],
    competitiveGameQualified:false};
  function choose(view,catalog,...args){
    const original=old(view,catalog,...args);
    audit.originalCalls++;
    const pick=chooseReserveRecipient(view,catalog,original);
    if(pick?.reserveOpportunity){
      audit.proposedBySeat[view.actorSeat]++;
      audit.proposals.push({actorSeat:view.actorSeat,
        globalTurn:view.globalTurn,
        heldBasic:pick.printing,handIndex:pick.handIndex,
        originalBenchIndex:pick.originalBenchIndex,
        frontier:paidRetreatPublic(view,catalog,2)});
    }
    return pick;
  }
  mod.chooseActorEnergyRecipient=choose;
  try{
    return {result:execute(),audit};
  }finally{
    assert.strictEqual(mod.chooseActorEnergyRecipient,choose);
    mod.chooseActorEnergyRecipient=old;
  }
}
module.exports={VERSION,fundedBenchAttack,paidRetreatPublic,
  chooseReserveRecipient,withPaidReserveRecipient};
