'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {runRank2ComponentDifferential}=
  require('../simulation/twinleaf/rank2-gh-score-components.cjs');

test('genuine source rank2 GH component score delta is passive',()=>{
  const r=runRank2ComponentDifferential();
  assert.equal(r.arms.length,2);
  assert.equal(r.arms[0].baselineRoot,'Guzma & Hala');
  assert.equal(r.arms[1].baselineRoot,'Bellelba & Brycen-Man');
  assert.equal(r.arms[0].observerParity,true);
  assert.equal(r.arms[1].observerParity,true);
  for(const arm of r.arms){
    assert.equal(arm.observedRoot,arm.baselineRoot);
    assert.equal(arm.scores.length,2);
    for(const score of arm.scores){
      assert.equal(Object.keys(score.values).length,9);
      const subtotal=Object.values(score.values).reduce((a,b)=>a+b,0);
      assert.equal(subtotal,score.total);
    }
  }
  const gh=r.deltas['Guzma & Hala CEC'];
  const other=r.deltas['Bellelba & Brycen-Man CEC'];
  assert.equal(gh.total,-4);
  assert.equal(other.total,0);
  assert.equal(Object.values(gh.components).reduce((a,b)=>a+b,0),-4);
});
