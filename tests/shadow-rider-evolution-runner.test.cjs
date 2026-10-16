'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withShadowRiderEvolutionCounterfactual}=
  require('../simulation/twinleaf/shadow-rider-evolution-runner.cjs');

class EvolveTactic {}
class PlayBasicTactic {}
class PriorityTactic {}

test('wrapper temporarily interposes before evolution and restores the exact list',()=>{
  const definitions={allSimpleTactics:[EvolveTactic,PlayBasicTactic]};
  const before=definitions.allSimpleTactics;
  const result=withShadowRiderEvolutionCounterfactual(()=>{
    assert.equal(definitions.allSimpleTactics,before);
    assert.deepEqual(before,[PriorityTactic,EvolveTactic,PlayBasicTactic]);
    return {observed:true};
  },{definitions,tactic:PriorityTactic});
  assert.deepEqual(result,{observed:true});
  assert.equal(definitions.allSimpleTactics,before);
  assert.deepEqual(before,[EvolveTactic,PlayBasicTactic]);
});

test('wrapper restores pinned tactic array when a bounded match raises an error',()=>{
  const definitions={allSimpleTactics:[EvolveTactic,PlayBasicTactic]};
  assert.throws(()=>withShadowRiderEvolutionCounterfactual(()=>{
    throw new Error('expected failure');
  },{definitions,tactic:PriorityTactic}),/expected failure/);
  assert.deepEqual(definitions.allSimpleTactics,[EvolveTactic,PlayBasicTactic]);
});

test('wrapper refuses an engine without the expected EvolveTactic',()=>{
  const definitions={allSimpleTactics:[PlayBasicTactic]};
  assert.throws(()=>withShadowRiderEvolutionCounterfactual(
    ()=>undefined,{definitions,tactic:PriorityTactic}),/EvolveTactic/);
  assert.deepEqual(definitions.allSimpleTactics,[PlayBasicTactic]);
});
