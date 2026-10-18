'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {runGhHypotheticalComparison}=
  require('../simulation/twinleaf/rank2-gh-hypothetical-prompts.cjs');

test('rank2 GH hypothetical prompt audit is passive and source locked',()=>{
  const r=runGhHypotheticalComparison();
  assert.equal(r.sameSourceHashes,true);
  assert.equal(r.sameFirstTurn,true);
  assert.equal(r.arms.length,2);
  assert.equal(r.arms[0].selectedBaseline,'Guzma & Hala');
  assert.equal(r.arms[1].selectedBaseline,'Bellelba & Brycen-Man');
  for(const arm of r.arms){
    assert.equal(arm.passiveTraceParity,true);
    assert.equal(arm.selectedObserved,arm.selectedBaseline);
    const gh=arm.hypotheticalSupporters.find(e=>
      e.candidate==='Guzma & Hala CEC');
    assert.equal(gh?.score,arm.mode1?-189:-185);
    assert.ok(arm.hypotheticalGhPrompts.length>0);
  }
});
