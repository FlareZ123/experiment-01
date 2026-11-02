'use strict';

const assert=require('node:assert/strict');
const {publicDceCrossFusionReady,mayBlockRetreatWhenGusted}=
  require('./agent41-mew-techno-reset-frontier.cjs');

const VERSION='agent13-owner-public-double-funded-mew-free-retreat-v1';
const MEW='Mew VMAX FST';
const GENESECT='Genesect V FST';

/**
 * Choose a zero-cost ordinary retreat from a cooldown-locked, DCE-funded
 * Active Mew VMAX into a DIFFERENT DCE-funded Benched Mew VMAX. The second
 * Mew can then choose the printed Genesect V donor for Cross Fusion Strike.
 * Unlike a Guzma-then-retreat reset, no Supporter is consumed. The engine
 * still arbitrates any unmodeled card effects and native action acceptance.
 *
 * All observations are actor-owned/public; neither hidden zone is examined.
 * @param {object} view Detached owner-root observation.
 * @param {object} catalog Pinned public type and status catalog.
 * @returns {object|null} Native-neutral free-retreat intent.
 */
function chooseDoubleMewCooldownPivot(view,catalog){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic,active=own?.active;
  const resources=view.ownTurnResources;
  if(!active||view.globalTurn<=1||!Array.isArray(own.bench)||
     !Number.isSafeInteger(resources?.retreatedTurn)||
     resources.retreatedTurn===view.globalTurn||
     own.publicTurnRestrictions?.attackLockTurnsRemaining>0)return null;
  if(active.printing!==MEW||
     active.publicRestrictions?.cannotAttackNextTurn!==true||
     !publicDceCrossFusionReady(active,catalog)||
     !Array.isArray(active.printed?.retreatCost)||
     active.printed.retreatCost.length!==0||
     active.publicRestrictions?.cannotRetreatNextTurn===true||
     active.publicRestrictions?.cannotRetreatWhileActive===true||
     active.publicRestrictions?.cannotRetreat===true||
     active.specialConditions?.some(x=>
       x===catalog.specialConditions?.ASLEEP||
       x===catalog.specialConditions?.PARALYZED))return null;
  if(mayBlockRetreatWhenGusted(view.opponentPublic?.active)||
     [...(own.stadium??[]),...(view.opponentPublic?.stadium??[])]
       .some(s=>s.startsWith('Temple of Sinnoh '))||
     !own.bench.some(p=>p?.printing===GENESECT))return null;
  for(let benchIndex=0;benchIndex<own.bench.length;benchIndex++){
    const p=own.bench[benchIndex];
    if(!publicDceCrossFusionReady(p,catalog)||
       p.publicRestrictions?.cannotAttackNextTurn===true||
       p.publicRestrictions?.blockedAttackNameNextTurn==='Cross Fusion Strike'||
       p.publicRestrictions?.blockedAttackNameUntilLeavesActive==='Cross Fusion Strike'||
       p.publicRestrictions?.cannotUseAttacksNextTurn?.includes('Cross Fusion Strike')||
       (p.publicRestrictions?.onlyAllowedAttackNameNextTurn&&
        p.publicRestrictions.onlyAllowedAttackNameNextTurn!=='Cross Fusion Strike')||
       p.specialConditions?.some(x=>
         x===catalog.specialConditions?.ASLEEP||
         x===catalog.specialConditions?.PARALYZED))continue;
    return {kind:'free-retreat',benchIndex,printing:MEW,
      attackName:'Cross Fusion Strike',policy:VERSION,
      nativePaperEffectVerified:false};
  }
  return null;
}

module.exports={VERSION,chooseDoubleMewCooldownPivot};
