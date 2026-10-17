'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {runGhSearchPair}=require('../simulation/twinleaf/expanded-gh-search-pair.cjs');
test('pair both seats with equal printed sources and start order',()=>{
 const res=runGhSearchPair({maxActions:6});
 assert.equal(res.samples.length,2);
 for(const s of res.samples){
  assert.equal(s.equalSourceHashes,true);
  assert.equal(s.equalFirstTurn,true);
  assert.equal(s.arms.length,2);
  for(const a of s.arms){
   assert.equal(a.strictPromptValidation,'predispatch-prompt-validate');
   assert.ok(a.actions<=6);
  }
 }
});
