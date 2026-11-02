'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {numericPermutationValid,withNumericShufflePromptValidation}=
  require('../simulation/twinleaf/agent33-shuffle-prompt-numeric-validation.cjs');

test('numeric length and index permutation exact, rejects duplicate or fractional indices',()=>{
  assert.equal(numericPermutationValid([2,0,1],3),true);
  assert.equal(numericPermutationValid([],0),true);
  assert.equal(numericPermutationValid([1,1,0],3),false);
  assert.equal(numericPermutationValid([0,1,9],3),false);
  assert.equal(numericPermutationValid([0,1,2.1],3),false);
  assert.equal(numericPermutationValid([0,1],3),false);
  assert.equal(numericPermutationValid(null,0),false);
  assert.equal(numericPermutationValid([1,0],2),true);
});

test('unmodified lexicographic sort validator declines every legal >=11 index permutation',()=>{
  const legacy=arr=>{
    const sorted=arr.slice().sort();
    return sorted.every((n,i)=>n===i);
  };
  for(const n of [1,2,9,10]){
    const order=Array.from({length:n},(_,i)=>n-i-1);
    assert.equal(legacy(order),true);
    assert.equal(numericPermutationValid(order,n),true);
  }
  for(const n of [11,20,45,46,53]){
    const order=Array.from({length:n},(_,i)=>n-i-1);
    assert.equal(legacy(order),false);
    assert.equal(numericPermutationValid(order,n),true);
  }
});

test('reversible hook retains original prototype even after a thrown native consumer',()=>{
  class FakeShufflePrompt{
    getPerspectivePlayerId(){return 101;}
    validate(order){
      return order.slice().sort().every((x,i)=>x===i);
    }
  }
  const original=FakeShufflePrompt.prototype.validate;
  const p=new FakeShufflePrompt();
  const state={players:[{id:101,deck:{cards:Array.from({length:47})}}]};
  const result=withNumericShufflePromptValidation(()=>{
    assert.equal(p.validate(Array.from({length:47},(_,i)=>i),state),true);
    return 'accepted';
  },{ShuffleDeckPrompt:FakeShufflePrompt});
  assert.equal(result.result,'accepted');
  assert.equal(result.audit.rawRejectedCorrected,1);
  assert.strictEqual(FakeShufflePrompt.prototype.validate,original);
  assert.throws(()=>withNumericShufflePromptValidation(()=>{
    throw Error('simulated Store abort');
  },{ShuffleDeckPrompt:FakeShufflePrompt}),/simulated Store abort/);
  assert.strictEqual(FakeShufflePrompt.prototype.validate,original);
});
