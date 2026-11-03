'use strict';

const assert = require('node:assert/strict');
const {
  COST_BY_PRINT, ownerTrainerDiscardContention
} = require('./agent27-owner-trainer-discard-contention.cjs');

const VERSION = 'agent49-generic-trainer-necessary-hand-payment-v1';

/**
 * Determine whether every exact-print known owner-hand payment mode fails
 * before allowing an unresolved native Trainer proposal. This is a necessary
 * mechanical *negative* certificate only. A positive result cannot establish
 * targets, printed timing, prompt success, strategic discard desirability,
 * legal play or competitive performance.
 *
 * @param {object} view Detached true owner-root observation.
 * @param {{handIndex:number,printing:string,type:string,publicBlocker:string|null}} trainer
 * @param {Set<number>} [protectedIndices] Explicit owner strategic resource hold.
 * @returns {{version:string,printing:string,handIndex:number,
 *   knownPrintedCost:boolean,blocked:boolean,reason:string,
 *   modeReceipts:Array<object>,paperPlayable:boolean|null}}
 */
function necessaryTrainerHandPaymentGate(view,trainer,
  protectedIndices=new Set()) {
  assert.equal(view?.decisionKind,'owner-root');
  assert.ok(Array.isArray(view.ownHand));
  assert.ok(Number.isSafeInteger(trainer?.handIndex)&&
    trainer.handIndex>=0&&trainer.handIndex<view.ownHand.length);
  assert.equal(view.ownHand[trainer.handIndex],trainer.printing);
  assert.ok(protectedIndices instanceof Set);
  const definition=COST_BY_PRINT.get(trainer.printing);
  if(!definition) {
    return {
      version:VERSION,printing:trainer.printing,
      handIndex:trainer.handIndex,knownPrintedCost:false,
      blocked:false,reason:'no-verified-fixed-cardinality-print-cost',
      modeReceipts:[],paperPlayable:null
    };
  }
  // A mismatch signals a broken exact-print Trainer catalog. Never silently
  // adapt a Supporter cost to a Tool or Item action.
  assert.equal(trainer.type,definition.type,
    'Public Trainer class differs from exact registered print cost');
  const full=ownerTrainerDiscardContention(view,[trainer],protectedIndices);
  const modes=full.rows[0].variants;
  assert.equal(modes.length,definition.options.length);
  const modeReceipts=modes.map(mode=>({
    mode:mode.mode,requiredDiscards:mode.discards,
    physicalOtherCards:mode.allAvailableCopies,
    otherCardsPreservingProtection:mode.unprotectedAvailableCopies,
    physicallyAffordable:mode.physicallyAffordable,
    affordablePreservingProtected:mode.affordablePreservingProtected,
    forcedProtectedSacrifices:mode.forcedProtectedSacrifices
  }));
  const possible=modeReceipts.some(mode=>mode.physicallyAffordable);
  return {
    version:VERSION,printing:trainer.printing,handIndex:trainer.handIndex,
    knownPrintedCost:true,blocked:!possible,
    reason:possible?'at-least-one-physical-payment-mode':
      'all-known-mandatory-hand-cost-modes-impossible',
    modeReceipts,paperPlayable:null
  };
}

module.exports={VERSION,necessaryTrainerHandPaymentGate};
