'use strict';

const assert = require('node:assert/strict');
const {snapshotOwnedGraph, compareOwnedGraphSnapshot} =
  require('./owned-source-graph-mutation.cjs');

/**
 * Guard the original Store State across each complete synchronous bot policy
 * decision. A bot is allowed to return its selected action, while live-State
 * mutations belong to the subsequent real Store dispatch.
 *
 * This checks only own-data descriptors reachable from the State at entry.
 * It cannot detect writes restored before return, native Map/Set internals,
 * module globals, or state changes outside this decision boundary.
 *
 * @param {Function} SimpleTacticsAi Pinned engine bot constructor.
 * @param {{failOnMutation?:boolean,maxExamples?:number}} [options]
 * @returns {{report:object,restore:()=>void}}
 */
function installOriginalStateNoninterferenceGate(
  SimpleTacticsAi, {failOnMutation=true,maxExamples=12}={}
) {
  assert.equal(typeof SimpleTacticsAi, 'function');
  assert.ok(Number.isSafeInteger(maxExamples) && maxExamples>=0);
  const prototype=SimpleTacticsAi.prototype;
  const original=prototype.decodeNextAction;
  assert.equal(typeof original, 'function');

  const violations=[];
  let calls=0;
  function guardedDecision(state) {
    const ordinal=++calls;
    const entry=snapshotOwnedGraph(state);
    let result, failure, threw=false;
    try {
      result=original.apply(this,arguments);
    } catch(error) {
      failure=error;
      threw=true;
    }
    const changedGraph=compareOwnedGraphSnapshot(entry,{maxExamples});
    if(changedGraph.changedFields>0) {
      const witness={
        ordinal,turn:state.turn,playerId:this.client?.id ?? null,
        changedGraph
      };
      violations.push(witness);
      if(failOnMutation && !threw) {
        throw new Error('Original Store State changed during bot decision: '+
          JSON.stringify(witness));
      }
    }
    if(threw)throw failure;
    return result;
  }
  prototype.decodeNextAction=guardedDecision;
  return {
    get report() {
      return {calls,violations:violations.slice()};
    },
    restore() {
      assert.strictEqual(prototype.decodeNextAction,guardedDecision,
        'Original State noninterference guard lost hook ownership');
      prototype.decodeNextAction=original;
    }
  };
}

module.exports={installOriginalStateNoninterferenceGate};
