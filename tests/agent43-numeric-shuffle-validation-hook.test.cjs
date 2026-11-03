'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withNumericShuffleIndexValidation}=
  require('../simulation/twinleaf/agent43-numeric-shuffle-validation-hook.cjs');

class PinnedShuffleReplica {
  getPerspectivePlayerId(){return 101;}
  validate(indices,state){
    const player=state.players.find(x=>x.id===this.getPerspectivePlayerId());
    if(!indices||indices.length!==player.deck.cards.length)return false;
    const sorted=indices.slice().sort();
    return sorted.every((x,i)=>x===i);
  }
}
/** @param {number} n */
function state(n) {
  return {players:[{id:101,deck:{cards:Array.from({length:n},(_,i)=>i)}}]};
}
const indices=n=>Array.from({length:n},(_,i)=>i);

test('pinned default lexicographic index validator falsely rejects length eleven',()=>{
  const prompt=new PinnedShuffleReplica();
  assert.equal(prompt.validate(indices(10),state(10)),true);
  assert.equal(prompt.validate(indices(11),state(11)),false);
  assert.equal(prompt.validate(indices(12),state(12)),false);
});
test('reversible correction accepts full numeric permutations and rejects malformed ones',()=>{
  const original=PinnedShuffleReplica.prototype.validate;
  const result=withNumericShuffleIndexValidation(()=>{
    const p=new PinnedShuffleReplica(),s=state(12);
    assert.equal(p.validate(indices(12),s),true);
    assert.equal(p.validate(indices(12).reverse(),s),true);
    assert.equal(p.validate([0,1,2,3,4,5,6,7,8,9,10,10],s),false);
    assert.equal(p.validate(indices(10),s),false);
    assert.equal(p.validate(null,s),false);
    return 'corrected';
  },{ShuffleDeckPrompt:PinnedShuffleReplica});
  assert.equal(result.result,'corrected');
  assert.equal(result.audit.correctedValidations,2);
  assert.equal(result.audit.rejectedValidations,3);
  assert.equal(result.audit.restored,true);
  assert.strictEqual(PinnedShuffleReplica.prototype.validate,original);
});
test('original compiled validator is restored on caller exception',()=>{
  const original=PinnedShuffleReplica.prototype.validate;
  assert.throws(()=>withNumericShuffleIndexValidation(()=>{
    throw new Error('sentinel');
  },{ShuffleDeckPrompt:PinnedShuffleReplica}),/sentinel/);
  assert.strictEqual(PinnedShuffleReplica.prototype.validate,original);
});
console.log('AGENT43_NUMERIC_SHUFFLE_HOOK_PURE_DONE');
