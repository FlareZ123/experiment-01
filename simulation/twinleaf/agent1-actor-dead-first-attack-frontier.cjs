'use strict';
const assert=require('node:assert/strict');
const {chooseGirafarigAttackWhenDiscardEmpty}=
  require('./agent1-girafarig-dead-attack-frontier.cjs');

const VERSION='agent1-actor-known-dead-leading-attack-v2-trubbish-fullbench';

/**
 * Read-only diagnosis of an authenticated attack's currently false printed
 * target condition. A warning never itself chooses Pass or spends a resource.
 * It remains valid when only one attack is payable, so a setup planner can
 * compare physically available Trainer/Energy/retreat alternatives.
 *
 * This does not prove that any alternative action is paper-legal, and the
 * caller must not interpret a known-dead attack as a forced loss.
 *
 * @param {object} view Detached owner-public observation
 * @param {object[]} payable Printed and cost-payable attacks in their order
 * @returns {{attackName:string,reason:string,payableClaw:boolean}|null}
 */
function diagnoseKnownDeadLeadingAttack(view,payable){
  assert.equal(view.decisionKind,'owner-root');
  assert.ok(Array.isArray(payable));
  const active=view.ownPublic?.active;
  const defender=view.opponentPublic?.active;
  const first=payable[0];
  if(active?.printing!=='Mega Absol ex M1L'||
     first?.name!=='Terminal Period'||first.damage!==0||
     !Number.isSafeInteger(defender?.damage)||
     defender.damage<0||defender.damage===60)return null;
  return {
    attackName:'Terminal Period',
    reason:'Terminal Period requires exactly six public damage counters',
    payableClaw:payable.some(a=>a.name==='Claw of Darkness'&&
      a.damage===200&&(a.damageCalculation===undefined||
        a.damageCalculation===null))
  };
}

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

  const terminalWarning=diagnoseKnownDeadLeadingAttack(view,payable);
  if(terminalWarning?.payableClaw)return {
    attackName:'Claw of Darkness',
    reason:terminalWarning.reason
  };

  // Original Aichi rank-11 Trubbish FST: with every Bench slot occupied,
  // Call for Family cannot put a Basic Pokemon into play. The separately
  // payable Super Poison Breath has printed damage and a Poison effect.
  // This is a public, exact-printing, default-off choice preference; the
  // genuine Store still determines legality and effect settlement.
  const bench=view.ownPublic?.bench;
  if(active.printing==='Trubbish FST'&&
     first.name==='Call for Family'&&
     Array.isArray(bench)&&bench.length>=5&&bench.every(Boolean)){
    const alternative=payable.find(a=>
      a.name==='Super Poison Breath'&&a.damage===20);
    if(alternative)return {
      attackName:alternative.name,
      reason:'Call for Family cannot place a Basic onto a full Bench'
    };
  }

  const girafarig=chooseGirafarigAttackWhenDiscardEmpty(view,payable);
  return girafarig===null?null:{
    attackName:girafarig,
    reason:'Get Lost has zero publicly available discard targets'
  };
}

module.exports={VERSION,chooseKnownDeadLeadingAttack,diagnoseKnownDeadLeadingAttack};
