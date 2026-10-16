'use strict';
const assert = require('node:assert/strict');

/**
 * Require a source-identical prefix for a genuine source-dealt policy fork.
 * Inspect the next opposing actions without making a policy-strength claim.
 * @param {object[]} control Live-only Store.dispatch events for original run.
 * @param {object[]} alternate Live-only Store.dispatch events for changed policy.
 * @param {{forkTurn:number,opponentSlot:number}} options Physical-game scope.
 * @returns {object} Falsifiable causal-boundary diagnostic.
 */
function auditAuthenticFork(control, alternate, {forkTurn, opponentSlot}) {
  assert.ok(Number.isInteger(forkTurn) && forkTurn > 0);
  assert.ok(opponentSlot === 0 || opponentSlot === 1);
  const preFork = trace => trace.filter(event =>
    Number.isInteger(event.before?.turn) && event.before.turn < forkTurn);
  const originalPrefix = preFork(control);
  assert.ok(originalPrefix.length > 2, 'No observed live game before fork');
  assert.deepEqual(preFork(alternate), originalPrefix,
    'Policy change altered the genuine pre-fork live dispatch history');

  const upto = Math.max(control.length, alternate.length);
  let index = 0;
  while (index < upto &&
      JSON.stringify(control[index]) === JSON.stringify(alternate[index])) {
    index += 1;
  }
  assert.ok(index < upto, 'Policy change made no live dispatch difference');
  const original = control[index];
  const changed = alternate[index];
  assert.ok(original && changed, 'One game ended before the first divergent action');
  assert.ok(original.before?.turn >= forkTurn && changed.before?.turn >= forkTurn,
    'First divergent action preceded declared fork turn');
  const opponentActions = alternate.slice(index + 1).filter(event =>
    event.before?.activePlayer === opponentSlot &&
    event.before.turn > changed.before.turn);
  const material = opponentActions.filter(event =>
    !['ResolvePromptAction','PassTurnAction','EndTurnAction']
      .includes(event.action));
  return {
    preForkLiveDispatches:originalPrefix.length,
    preForkLiveTraceIdentical:true,
    firstDifferenceIndex:index,
    firstDifferenceTurn:changed.before.turn,
    originalAction:original.action,
    alternativeAction:changed.action,
    opponentPostForkDispatches:opponentActions.length,
    opponentMaterialActions:material.map(event => ({
      step:event.step,turn:event.before.turn,action:event.action
    })),
    opponentMaterialResponseObserved:material.length > 0,
    policyAndPaperRulesQualified:false
  };
}
module.exports={auditAuthenticFork};
