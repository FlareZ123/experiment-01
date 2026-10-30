'use strict';
const assert=require('node:assert/strict');

const VERSION='agent22-actor-marginal-printing-value-v1';

/**
 * Conditional printed-resource scoring for authenticated own-search prompts.
 * Input is only the detached owner observation and exact offered printings.
 * The function assumes additive per-printing utility with diminishing returns
 * for copies currently held, plus a fixed cost for every chosen card.
 * These are heuristic modeling assumptions, not game-rule conclusions.
 *
 * @param {readonly string[]} printings Exact printing names chosen in a bundle.
 * @param {object} actor Deeply frozen owner prompt observation.
 * @param {{weights:Record<string,number>,perCardCost:number}} model
 * @returns {number} Finite conditional utility, with zero for empty selection.
 */
function marginalOwnerSearchValue(printings,actor,model){
  assert.ok(Array.isArray(printings));
  assert.equal(actor?.decisionKind,'owner-prompt');
  assert.ok(Array.isArray(actor.ownHand));
  assert.ok(model&&model.weights&&
    typeof model.weights==='object'&&!Array.isArray(model.weights));
  assert.ok(Number.isFinite(model.perCardCost)&&model.perCardCost>=0);
  assert.ok(Object.values(model.weights).every(value=>
    Number.isFinite(value)&&value>=0));
  const held=new Map();
  for(const name of actor.ownHand){
    assert.equal(typeof name,'string');
    held.set(name,(held.get(name)??0)+1);
  }
  let value=0;
  for(const name of printings){
    assert.equal(typeof name,'string');
    const weight=Object.hasOwn(model.weights,name)?
      model.weights[name]:0;
    value+=weight/(1+(held.get(name)??0))-model.perCardCost;
    held.set(name,(held.get(name)??0)+1);
  }
  assert.ok(Number.isFinite(value));
  return value;
}

module.exports={VERSION,marginalOwnerSearchValue};
