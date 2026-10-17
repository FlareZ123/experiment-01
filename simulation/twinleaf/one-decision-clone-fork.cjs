'use strict';

const {withDecisionScopedDetachedSimulator} =
  require('./decision-scoped-detached-simulator.cjs');

/**
 * Use the source-detached Simulator for exactly one synchronous bot decision
 * selected by global decision ordinal, preserving the original decision
 * implementation and all other decisions on the pinned baseline profile.
 *
 * @param {Function} BotClass Pinned SimpleTacticsAi or test constructor.
 * @param {number} ordinal Positive global decodeNextAction ordinal.
 * @param {()=>()=>void} [install] Optional test seam; default v2 hook.
 * @returns {{report:object,restore:()=>void}}
 */
function installOneDecisionCloneFork(BotClass, ordinal, install) {
  if (!Number.isSafeInteger(ordinal) || ordinal < 1) {
    throw new RangeError('Expected a positive global decision ordinal');
  }
  const proto=BotClass.prototype;
  const originalDescriptor=Object.getOwnPropertyDescriptor(proto,'decodeNextAction');
  const original=proto.decodeNextAction;
  if (typeof original !== 'function') {
    throw new TypeError('Expected a synchronous bot decision');
  }
  const report={requestedOrdinal:ordinal,calls:0,used:0,atTurn:null,actorSeat:null};
  function patched(state) {
    const index=++report.calls;
    if (index!==ordinal) return original.call(this,state);
    report.used++;
    report.atTurn=state.turn;
    report.actorSeat=state.activePlayer;
    const work=()=>original.call(this,state);
    return install===undefined ?
      withDecisionScopedDetachedSimulator(work) :
      withDecisionScopedDetachedSimulator(work,install);
  }
  Object.defineProperty(proto,'decodeNextAction',{
    value:patched,writable:true,configurable:true
  });
  return {
    report,
    restore() {
      if (proto.decodeNextAction !== patched) {
        throw new Error('One-decision clone fork lost bot method ownership');
      }
      if(originalDescriptor) {
        Object.defineProperty(proto,'decodeNextAction',originalDescriptor);
      } else {
        delete proto.decodeNextAction;
      }
    }
  };
}

/** @param {number} ordinal */
function installPinnedOneDecisionCloneFork(ordinal) {
  const path=require('node:path');
  const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const {SimpleTacticsAi}=require(path.join(root,'simple-bot/simple-tactics-ai'));
  return installOneDecisionCloneFork(SimpleTacticsAi,ordinal);
}

module.exports={installOneDecisionCloneFork,installPinnedOneDecisionCloneFork};
