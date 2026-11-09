'use strict';

const assert=require('node:assert/strict');
const {publicSpecialAttackPayable}=
  require('../agent17-public-context-special-energy.cjs');
const {projectedFundedAttackDamage}=
  require('../agent14-generic-funded-floatstone-frontier.cjs');
const {wouldLoseActivePositionAbility}=
  require('../agent47-active-position-retreat-veto.cjs');

const VERSION='agent35-owner-held-switch-funded-ko-v1';
const ITEM='Switch SVI';

function eligibleAttack(view,catalog,pokemon,attack){
  const restrictions=pokemon.publicRestrictions??{};
  return attack.gxAttack!==true&&
    attack.name?.endsWith('-GX')!==true&&
    restrictions.cannotAttackNextTurn!==true&&
    restrictions.blockedAttackNameNextTurn!==attack.name&&
    restrictions.blockedAttackNameUntilLeavesActive!==attack.name&&
    !restrictions.cannotUseAttacksNextTurn?.includes(attack.name)&&
    (!restrictions.onlyAllowedAttackNameNextTurn||
      restrictions.onlyAllowedAttackNameNextTurn===attack.name)&&
    publicSpecialAttackPayable(view,catalog,pokemon,attack);
}

/**
 * Source-independent, default-off owner-visible opportunity to use a genuinely
 * held Switch Item when a charged Benched Pokemon has a nominal immediate KO
 * that the present Active cannot match. Keeps the opponent's current Active
 * independent of any historical Block/Snorlax prerequisite.
 *
 * Damage is only a recognized printed nominal projection. Native Store and
 * independent paper review decide actual legality, payment, and KO. A payable
 * Active attack with unrecognized damage prevents this speculative swap.
 *
 * @param {object} view Detached actor-only owner-root observation
 * @param {object} catalog Public printed card and Energy metadata
 * @returns {object|null} Intent for an existing native PlayCardAction
 */
function chooseTacticalSwitchFundedKo(view,catalog){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic,op=view.opponentPublic;
  const active=own?.active,enemy=op?.active;
  const r=view.ownTurnResources;
  if(view.globalTurn<=1||!active||!enemy||!r||
      !Array.isArray(view.ownHand)||!Array.isArray(own.bench)||
      r.itemPlayLocked===true||
      own.publicTurnRestrictions?.itemPlayLocked===true||
      own.publicTurnRestrictions?.attackLockTurnsRemaining>0||
      !Number.isSafeInteger(enemy.hp)||!Number.isSafeInteger(enemy.damage)||
      enemy.damage<0||enemy.hp<=enemy.damage||
      !Array.isArray(enemy.printed?.resistance)||
      enemy.printed.resistance.length>0||
      !Array.isArray(enemy.tools)||enemy.tools.length>0)
    return null;
  const handIndex=view.ownHand.indexOf(ITEM);
  if(handIndex<0)return null;

  const remaining=enemy.hp-enemy.damage;
  // Avoid consuming an Item when the current Active can already achieve the
  // same KO, or when its funded attack has an unrecognized damage formula.
  for(const attack of active.attacks??[]){
    if(!eligibleAttack(view,catalog,active,attack))continue;
    const projected=projectedFundedAttackDamage(view,active,attack,catalog);
    if(projected===null||projected>=remaining)return null;
  }

  const targets=[];
  for(const [benchIndex,pokemon] of own.bench.entries()){
    if(!pokemon||wouldLoseActivePositionAbility(view,benchIndex))continue;
    for(const attack of pokemon.attacks??[]){
      if(!eligibleAttack(view,catalog,pokemon,attack))continue;
      const projected=projectedFundedAttackDamage(view,pokemon,attack,catalog);
      if(!Number.isSafeInteger(projected)||projected<remaining)continue;
      targets.push({benchIndex,printing:pokemon.printing,
        targetAttackName:attack.name,projectedPrintedDamage:projected});
    }
  }
  targets.sort((a,b)=>a.projectedPrintedDamage-b.projectedPrintedDamage||
    a.benchIndex-b.benchIndex||
    a.targetAttackName.localeCompare(b.targetAttackName));
  const target=targets[0];
  if(!target)return null;
  return {...target,handIndex,kind:'play-tactical-switch',
    source:VERSION,paperQualified:false};
}
module.exports={VERSION,ITEM,chooseTacticalSwitchFundedKo};
