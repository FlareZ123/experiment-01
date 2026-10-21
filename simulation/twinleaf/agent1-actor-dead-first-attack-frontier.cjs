'use strict';
const assert=require('node:assert/strict');
const {chooseGirafarigAttackWhenDiscardEmpty}=
  require('./agent1-girafarig-dead-attack-frontier.cjs');

const VERSION='agent1-actor-known-dead-leading-attack-v1';

/**
 * When the opponent's *public* state proves that the first printed payable
 * attack cannot perform its declared objective, prefer a later payable
 * deterministic damage attack. The caller must supply a list already checked
 * for numeric printed Energy cost, all active restrictions and current native
 * modifiers it understands. Native Store must still verify and settle it.
 *
 * This decision is intentionally specific to authenticated printings, never
 * extrapolated to another printing just because the attack names match.
 *
 * @param {object} view Detached actor observation
 * @param {object[]} payable Ordered, cost-payable printed attacks
 * @returns {{attackName:string,reason:string}|null}
 */
function chooseKnownDeadLeadingAttack(view,payable){
  assert.equal(view.decisionKind,'owner-root');
  assert.ok(Array.isArray(payable));
  const active=view.ownPublic?.active;
  const defender=view.opponentPublic?.active;
  if(!active||!defender||payable.length<2)return null;
  const first=payable[0];

  if(active.printing==='Mega Absol ex M1L'&&
     first.name==='Terminal Period'&&first.damage===0&&
     Number.isSafeInteger(defender.damage)&&
     defender.damage>=0&&defender.damage!==60){
    const alternative=payable.find(a=>a.name==='Claw of Darkness'&&
      a.damage===200&&(a.damageCalculation===undefined||
        a.damageCalculation===null));
    if(alternative)return {
      attackName:alternative.name,
      reason:'Terminal Period requires exactly six public damage counters'
    };
  }

  const girafarig=chooseGirafarigAttackWhenDiscardEmpty(view,payable);
  return girafarig===null?null:{
    attackName:girafarig,
    reason:'Get Lost has zero publicly available discard targets'
  };
}

module.exports={VERSION,chooseKnownDeadLeadingAttack};
