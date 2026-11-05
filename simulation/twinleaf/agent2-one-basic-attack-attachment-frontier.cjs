'use strict';

const assert=require('node:assert/strict');
const {paysWithBasics}=require('./agent7-actor-free-retreat-frontier.cjs');

const VERSION='agent2-owner-pass-one-basic-attack-attachment-frontier-v1';

/**
 * Detached source-owner Pass diagnosis. It merely inserts one known, held
 * Basic Energy into a virtual attack-cost check; no Store state is mutated.
 *
 * @param {object} view Frozen owner-root observation
 * @param {object} catalog Public printing and game-enum catalog
 * @returns {object} Reproducible nominal attack-cost/opportunity receipt
 */
function classifyOneBasicAttachmentAtPass(view,catalog){
  assert.equal(view?.decisionKind,'owner-root');
  assert.ok(catalog?.basicEnergies instanceof Set);
  const owner=view.ownPublic,resources=view.ownTurnResources;
  const handBasics=[...new Set((view.ownHand??[]).filter(printing=>
    catalog.basicEnergies.has(printing)))];
  const openEnergyQuota=Number.isSafeInteger(resources?.energyPlayedTurn)&&
    resources.energyPlayedTurn!==view.globalTurn;
  const energyPlayLocked=resources?.energyPlayLocked===true||
    owner?.publicTurnRestrictions?.energyPlayLocked===true;
  const attackLocked=owner?.publicTurnRestrictions?.attackLockTurnsRemaining>0;
  const publicGxUsed=owner?.publicTurnRestrictions?.gxUsed===true;
  const eligibleTurn=view.globalTurn>1;
  const asleep=catalog.specialConditions?.ASLEEP;
  const paralyzed=catalog.specialConditions?.PARALYZED;
  const entries=[];
  for(const [kind,slots] of [
    ['active',[owner?.active??null]],
    ['bench',owner?.bench??[]]]){
    for(const [index,slot] of slots.entries()){
      if(!slot||!Array.isArray(slot.energies)||
         !slot.energies.every(card=>catalog.basicEnergies.has(card)))
        continue;
      const restricted=(slot.specialConditions??[]).some(x=>
        x===asleep||x===paralyzed)||
        slot.publicRestrictions?.cannotAttackNextTurn===true;
      for(const attack of slot.attacks??[]){
        if(!Array.isArray(attack.cost)||
           paysWithBasics(slot,attack,catalog))
          continue;
        const attackRestricted=restricted||
          slot.publicRestrictions?.blockedAttackNameNextTurn===attack.name||
          slot.publicRestrictions?.blockedAttackNameUntilLeavesActive===
            attack.name||
          slot.publicRestrictions?.cannotUseAttacksNextTurn?.includes(
            attack.name)===true||
          slot.publicRestrictions?.onlyAllowedAttackNameNextTurn!==null&&
          slot.publicRestrictions?.onlyAllowedAttackNameNextTurn!==undefined&&
          slot.publicRestrictions.onlyAllowedAttackNameNextTurn!==attack.name||
          attack.gxAttack===true&&publicGxUsed;
        for(const basic of handBasics){
          const simulated={...slot,energies:[...slot.energies,basic]};
          if(!paysWithBasics(simulated,attack,catalog))continue;
          const quotaAllowed=eligibleTurn&&openEnergyQuota&&
            !energyPlayLocked;
          const nominalAttackAvailable=quotaAllowed&&
            !attackRestricted&&!attackLocked&&
            (kind==='bench'||Boolean(view.opponentPublic?.active));
          entries.push({
            kind,slotIndex:index,pokemon:slot.printing??null,
            attackName:attack.name,heldBasicPrinting:basic,
            gxAttack:attack.gxAttack===true,
            damage:attack.damage??null,
            quotaAllowed,nominalAttackAvailable,
            possibleNowOnlyIfActive:kind==='active',
            requiresFutureSwitch:kind==='bench',
            caveat:'No Store acceptance, special-energy, damage or target validation'
          });
        }
      }
    }
  }
  return {
    schema:VERSION,actorSeat:view.actorSeat,globalTurn:view.globalTurn,
    handBasicDistinctPrintings:handBasics.length,
    openEnergyQuota,energyPlayLocked,attackLocked,eligibleTurn,
    anyOneBasicShortfall:entries.length>0,
    anyQuotaAllowedActive:entries.some(x=>x.kind==='active'&&
      x.nominalAttackAvailable),
    anyQuotaAllowedBench:entries.some(x=>x.kind==='bench'&&
      x.nominalAttackAvailable),
    activeShortfallCount:entries.filter(x=>x.kind==='active').length,
    benchShortfallCount:entries.filter(x=>x.kind==='bench').length,
    offeredBasicCount:entries.length,
    examples:entries.slice(0,5)
  };
}
module.exports={VERSION,classifyOneBasicAttachmentAtPass};
