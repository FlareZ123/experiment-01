'use strict';

const assert=require('node:assert/strict');
const {observedOpponentActiveForbidsRetreat}=
  require('./agent35-opponent-active-retreat-lock.cjs');
const {publicSpecialAttackPayable}=
  require('./agent17-public-context-special-energy.cjs');
const {projectedFundedAttackDamage}=
  require('./agent14-generic-funded-floatstone-frontier.cjs');

const VERSION='agent35-printed-block-switch-funded-ko-v1';
const ITEM='Switch SVI';

/**
 * A real Item alternative to a trapped zero-Energy Active under the opponent's
 * face-up, Active-dependent no-retreat Ability. This consumes the held Item
 * and is independent of the ordinary RetreatAction prohibition.
 *
 * Requires a funded Benched attacker whose independently projected printed
 * attack nominally KOs the opponent's Active. Numeric projections are
 * deliberately incomplete; Store determines actual attack and Prize outcome.
 *
 * @param {object} view Detached actor-only owner-root board/hand.
 * @param {object} catalog Public printing-specific Energy metadata.
 * @returns {object|null} Native-neutral owner-root Item intent.
 */
function chooseBlockSwitchFundedKo(view,catalog){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic,op=view.opponentPublic;
  const active=own?.active,enemy=op?.active;
  const resources=view.ownTurnResources;
  if(view.globalTurn<=1||!active||!enemy||
      !observedOpponentActiveForbidsRetreat(view)||
      !resources||!Array.isArray(own.bench)||
      !Array.isArray(view.ownHand)||
      !Array.isArray(active.energies)||active.energies.length!==0||
      resources.itemPlayLocked===true||
      own.publicTurnRestrictions?.itemPlayLocked===true||
      own.publicTurnRestrictions?.attackLockTurnsRemaining>0||
      !Number.isSafeInteger(enemy.hp)||
      !Number.isSafeInteger(enemy.damage)||
      enemy.hp<=enemy.damage||
      (enemy.printed?.resistance??[]).length>0||
      (enemy.tools??[]).length>0)
    return null;
  const handIndex=view.ownHand.indexOf(ITEM);
  if(handIndex<0)return null;
  const options=[];
  for(const [benchIndex,pokemon] of own.bench.entries()){
    if(!pokemon||pokemon.publicRestrictions?.cannotAttackNextTurn===true||
       require('./agent47-active-position-retreat-veto.cjs')
         .wouldLoseActivePositionAbility(view,benchIndex))continue;
    const restrictions=pokemon.publicRestrictions??{};
    for(const attack of pokemon.attacks??[]){
      if(attack.gxAttack===true||
          restrictions.blockedAttackNameNextTurn===attack.name||
          restrictions.blockedAttackNameUntilLeavesActive===attack.name||
          restrictions.cannotUseAttacksNextTurn?.includes(attack.name)||
          (restrictions.onlyAllowedAttackNameNextTurn&&
           restrictions.onlyAllowedAttackNameNextTurn!==attack.name)||
          !publicSpecialAttackPayable(view,catalog,pokemon,attack))continue;
      const projected=projectedFundedAttackDamage(view,pokemon,attack,catalog);
      if(!Number.isSafeInteger(projected)||
         projected<enemy.hp-enemy.damage)continue;
      options.push({benchIndex,printing:pokemon.printing,
        targetAttackName:attack.name,projectedPrintedDamage:projected});
    }
  }
  options.sort((a,b)=>b.projectedPrintedDamage-a.projectedPrintedDamage||
    a.benchIndex-b.benchIndex||
    a.targetAttackName.localeCompare(b.targetAttackName));
  const chosen=options[0];
  if(!chosen)return null;
  return {...chosen,handIndex,kind:'play-opponent-block-switch',
    source:VERSION,paperQualified:false};
}
module.exports={VERSION,ITEM,chooseBlockSwitchFundedKo};
