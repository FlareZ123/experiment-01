'use strict';

const assert=require('node:assert/strict');
const {paysWithBasics}=
  require('./agent7-actor-free-retreat-frontier.cjs');

const VERSION='agent2-owner-multi-basic-retreat-pass-cascade-v1';
const STEPS=Object.freeze([
  'owner-window',
  'printed-multi-colorless-retreat',
  'exact-attached-basic-payment',
  'owner-behind-public-deck-race',
  'known-opponent-active-remaining-hp',
  'active-lacks-payable-positive-printed-attack',
  'funded-benched-positive-printed-attack',
  'funded-benched-nominal-ko-before-own-deckout'
]);

/**
 * Non-interventional approximate eligibility classification.
 * All stage booleans are independently evaluated on the same owner-visible
 * state. Cumulative stages mimic the proposal gate and cannot assert
 * the native Store's actual fee, retaliation, damage prevention or KO.
 *
 * @param {object} view Deeply frozen detached actor observation.
 * @param {object} catalog Public printed card catalog.
 * @returns {{version:string,actorSeat:0|1,globalTurn:number,
 *   stages:object,cumulative:object,firstFailure:string|null,
 *   wouldNominallyOffer:boolean,knownFundedBenchCount:number}} Receipt.
 */
function classifyOwnerMultiBasicRetreatPass(view,catalog){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic,foe=view.opponentPublic;
  const active=own?.active,enemy=foe?.active;
  const r=view.ownTurnResources;
  const asleep=catalog.specialConditions?.ASLEEP;
  const paralyzed=catalog.specialConditions?.PARALYZED;
  const restricted=slot=>
    slot?.specialConditions?.some(s=>s===asleep||s===paralyzed)===true;
  const steps={};
  steps[STEPS[0]]=Boolean(active&&enemy&&view.globalTurn>1&&r&&
    Number.isSafeInteger(r.retreatedTurn)&&
    r.retreatedTurn!==view.globalTurn&&
    (own.publicTurnRestrictions?.attackLockTurnsRemaining??0)<=0&&
    active.publicRestrictions?.cannotRetreatNextTurn!==true&&
    active.publicRestrictions?.cannotRetreatWhileActive!==true&&
    !restricted(active));

  const printed=active?.printed?.retreatCost;
  steps[STEPS[1]]=Boolean(Array.isArray(printed)&&
    printed.length>=2&&printed.length<=4&&
    printed.every(s=>s===catalog.colorlessEnergyType));

  const energy=active?.energies;
  steps[STEPS[2]]=Boolean(Array.isArray(printed)&&
    Array.isArray(energy)&&energy.length===printed.length&&
    energy.every(e=>catalog.basicEnergies.has(e))&&
    (active?.tools?.length??0)===0);

  steps[STEPS[3]]=Boolean(Number.isSafeInteger(own?.deckCount)&&
    Number.isSafeInteger(foe?.deckCount)&&own.deckCount>=1&&
    own.deckCount<foe.deckCount);

  steps[STEPS[4]]=Boolean(Number.isSafeInteger(enemy?.hp)&&
    Number.isSafeInteger(enemy?.damage)&&
    enemy.hp>enemy.damage);

  const liveDamagingActive=(active?.attacks??[]).some(a=>
    a.gxAttack!==true&&Number.isSafeInteger(a.damage)&&a.damage>0&&
    Array.isArray(active?.energies)&&paysWithBasics(active,a,catalog));
  steps[STEPS[5]]=!liveDamagingActive;

  const funded=[];
  for(const [index,slot] of (own?.bench??[]).entries()){
    if(!slot||!Array.isArray(slot.energies)||
       slot.publicRestrictions?.cannotAttackNextTurn===true||
       restricted(slot))continue;
    for(const attack of slot.attacks??[]){
      if(attack.gxAttack===true||
         !Number.isSafeInteger(attack.damage)||attack.damage<=0||
         attack.damageCalculation!==null&&
           attack.damageCalculation!==undefined||
         !paysWithBasics(slot,attack,catalog)||
         slot.publicRestrictions?.blockedAttackNameNextTurn===attack.name||
         slot.publicRestrictions?.blockedAttackNameUntilLeavesActive===
           attack.name||
         slot.publicRestrictions?.cannotUseAttacksNextTurn?.includes(
           attack.name))continue;
      funded.push({index,name:attack.name,damage:attack.damage});
    }
  }
  steps[STEPS[6]]=funded.length>0;
  steps[STEPS[7]]=Number.isSafeInteger(own?.deckCount)&&
    own.deckCount>=1&&steps[STEPS[4]]&&funded.some(x=>
    Math.ceil((enemy.hp-enemy.damage)/x.damage)<=own.deckCount);
  const cumulative={};
  let all=true,firstFailure=null;
  for(const step of STEPS){
    const value=steps[step]===true;
    if(!value&&firstFailure===null)firstFailure=step;
    all=all&&value;
    cumulative[step]=all;
  }
  return {
    version:VERSION,actorSeat:view.actorSeat,globalTurn:view.globalTurn,
    stages:steps,cumulative,firstFailure,wouldNominallyOffer:all,
    knownFundedBenchCount:funded.length
  };
}

module.exports={VERSION,STEPS,classifyOwnerMultiBasicRetreatPass};
