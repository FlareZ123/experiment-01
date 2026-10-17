'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {probePair}=require('../simulation/twinleaf/bunnelby-gh-discard-policy-probe.cjs');
test('K0-paired Guzma mode-one bot discard/search',()=>{
  const pair=probePair();
  console.log('GH_SOURCE_CHOICES='+JSON.stringify(pair));
  assert.equal(pair.unprized.mode,1);
  assert.equal(pair.prized.mode,1);
  assert.equal(pair.k0DiscardSelectionIdentical,true);
  for(const arm of [pair.unprized,pair.prized]){
    assert.equal(arm.stage,'search-selected');
    assert.equal(arm.discardedNames.length,2);
    assert.ok(arm.searchedNames.length<=3);
  }
});
