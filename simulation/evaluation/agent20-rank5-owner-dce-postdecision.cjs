'use strict';
const assert=require('node:assert/strict');
const VERSION='agent20-owner-dce-postdecision-v1';

/** @param {unknown} printing @returns {boolean} */
const isDce=printing=>typeof printing==='string'&&
  (printing==='Double Colorless Energy'||
   printing.startsWith('Double Colorless Energy '));

/**
 * Count authentic actor-owned hand DCE only after the policy selected
 * a root action. The Store decisionTrace is research-only evidence.
 * @param {object[]} decisions Native Store trace.
 * @param {object[]} roots Native accepted root ledger.
 * @param {0|1} seat Original source's physical seat.
 */
function auditOwnerDce(decisions,roots,seat){
  assert.ok(seat===0||seat===1);
  const events=[];
  for(const d of decisions){
    if(d.playerSlot!==seat)continue;
    assert.equal(d.decisionHandBefore?.perspectiveSeat,seat);
    const hand=d.decisionHandBefore.ownHandPrintings;
    assert.ok(Array.isArray(hand));
    const root=roots[d.actionOrdinal];
    assert.equal(root?.playerSlot,seat);
    assert.equal(root.action,d.action);
    events.push({ordinal:d.actionOrdinal,turn:d.turnBefore,
      action:d.action,card:d.card??null,
      handSize:hand.length,dceHeld:hand.filter(isDce).length});
  }
  return {version:VERSION,seat,
    observedOwnerActions:events.length,
    passes:events.filter(x=>x.action==='PassTurnAction').length,
    passesWithDce:events.filter(x=>
      x.action==='PassTurnAction'&&x.dceHeld>0).length,
    acceptedDcePlays:events.filter(x=>
      x.action==='PlayCardAction'&&isDce(x.card)).length,
    heldEvents:events.filter(x=>x.dceHeld>0),
    competitiveQualifiedGames:0,
    limitation:'Held printing alone does not certify a legal missed attachment.'};
}
module.exports={VERSION,isDce,auditOwnerDce};
