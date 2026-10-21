'use strict';
const assert=require('node:assert/strict');

const VERSION='agent1-owner-visible-girafarig-empty-discard-attack-v1';

/**
 * A deliberately narrow actor-observation-only override for a dead Get Lost.
 * Pinned Girafarig LOT 94 requires cards in the opponent's discard pile, so
 * at zero visible targets it cannot move any cards to the Lost Zone.
 * This selector does not estimate matchup strength, damage modifiers, or
 * full game policy competence. A native Store must still settle the attack.
 *
 * @param {object} view Detached owner-visible root observation
 * @param {object[]} payable Printed attacks already verified as cost-payable
 * @returns {string|null} Attack name, or null to preserve original order
 */
function chooseGirafarigAttackWhenDiscardEmpty(view,payable){
  assert.equal(view.decisionKind,'owner-root');
  assert.ok(Array.isArray(payable));
  if(view.ownPublic?.active?.printing!=='Girafarig LOT')return null;
  if(!Array.isArray(view.opponentPublic?.discard)||
     view.opponentPublic.discard.length!==0 ||
     view.opponentPublic.active===null)return null;
  const original=payable[0];
  if(original?.name!=='Get Lost'||original.damage!==0)return null;
  // Mind Shock's printed 70 is a concrete nonzero alternative. Preserve the
  // default selection when that printed attack is not currently payable.
  const alternative=payable.find(attack=>
    attack.name==='Mind Shock'&&attack.damage===70&&
    (attack.damageCalculation===undefined||
     attack.damageCalculation===null));
  return alternative?.name??null;
}

module.exports={VERSION,chooseGirafarigAttackWhenDiscardEmpty};
