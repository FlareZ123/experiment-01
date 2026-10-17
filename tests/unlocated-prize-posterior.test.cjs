'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const {unlocatedPrizePosterior}=
  require('../simulation/twinleaf/unlocated-prize-posterior.cjs');

const pool=['A','A','B','C','D'];

/** Enumerate physical index subsets independently from polynomial counting. */
function subsets(n,k){
  const all=[];
  function visit(start,chosen){
    if(chosen.length===k){all.push(chosen);return}
    for(let i=start;i<n;i++)visit(i+1,[...chosen,i]);
  }
  visit(0,[]);
  return all;
}

test('unlocated observed A Prize conditions physical assignments exactly',()=>{
  const posterior=unlocatedPrizePosterior({
    unknownPool:pool,unknownPrizeCount:2,targetName:'B',
    observedPrizeBounds:{A:{min:1}},uniformUnknownAllocation:true
  });
  const valid=subsets(pool.length,2).filter(indices=>
    indices.some(i=>pool[i]==='A'));
  const bPrized=valid.filter(indices=>indices.some(i=>pool[i]==='B')).length;
  assert.equal(valid.length,7);
  assert.equal(bPrized,2);
  assert.equal(posterior.conditionedPhysicalAssignments,'7');
  assert.equal(posterior.anyPrizeProbability,bPrized/valid.length);
  assert.equal(posterior.nextUnknownDeckProbability,5/21);
});

test('duplicate A Prized under at-least-one observation has weighted count',()=>{
  const result=unlocatedPrizePosterior({
    unknownPool:pool,unknownPrizeCount:2,targetName:'A',
    observedPrizeBounds:{A:{min:1}},uniformUnknownAllocation:true
  });
  assert.equal(result.anyPrizeProbability,1);
  assert.equal(result.expectedCopiesPrized,8/7);
  assert.equal(result.nextUnknownDeckProbability,2/7);
  assert.deepEqual(result.distribution.map(x=>[x.copies,x.numerator]),
    [[1,'6'],[2,'1']]);
});

test('simultaneous observed identities restrict posterior and impossible states fail',()=>{
  const observation={unknownPool:pool,unknownPrizeCount:2,
    targetName:'C',uniformUnknownAllocation:true};
  const narrowed=unlocatedPrizePosterior({...observation,
    observedPrizeBounds:{A:{min:1},B:{min:1}}});
  assert.equal(narrowed.conditionedPhysicalAssignments,'2');
  assert.equal(narrowed.nextUnknownDeckProbability,1/3);
  assert.throws(()=>unlocatedPrizePosterior({...observation,
    observedPrizeBounds:{A:{min:2},B:{min:1}}}),/exceed Prize slots/);
});

test('exact positional-agnostic count interval differs from lower bound',()=>{
  const result=unlocatedPrizePosterior({
    unknownPool:pool,unknownPrizeCount:2,targetName:'A',
    observedPrizeBounds:{A:{min:1,max:1}},
    uniformUnknownAllocation:true
  });
  assert.equal(result.conditionedPhysicalAssignments,'6');
  assert.equal(result.expectedCopiesPrized,1);
  assert.equal(result.nextUnknownDeckProbability,1/3);
});

test('unqualified hidden allocation and impossible observations are rejected',()=>{
  assert.throws(()=>unlocatedPrizePosterior({
    unknownPool:pool,unknownPrizeCount:2,targetName:'A'
  }),/Uniform conditional hidden allocation/);
  assert.throws(()=>unlocatedPrizePosterior({
    unknownPool:pool,unknownPrizeCount:2,targetName:'A',
    observedPrizeBounds:{E:{min:1}},
    uniformUnknownAllocation:true
  }),/Inconsistent observed Prize bounds/);
  assert.throws(()=>unlocatedPrizePosterior({
    unknownPool:pool,unknownPrizeCount:2,targetName:'A',
    observedPrizeBounds:{A:{min:2,max:2},B:{min:0,max:0},
      C:{min:0,max:0},D:{min:0,max:0}},
    uniformUnknownAllocation:true
  }).nextUnknownDeckProbability,undefined);
});

test('empty Prize zones and no remaining deck are explicit edge cases',()=>{
  const none=unlocatedPrizePosterior({
    unknownPool:['A','B','C'],unknownPrizeCount:0,targetName:'A',
    uniformUnknownAllocation:true});
  assert.equal(none.nextUnknownDeckProbability,1/3);
  const noDeck=unlocatedPrizePosterior({
    unknownPool:['A','B'],unknownPrizeCount:2,targetName:'A',
    uniformUnknownAllocation:true});
  assert.equal(noDeck.nextUnknownDeckProbability,null);
});
